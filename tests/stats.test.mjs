import test from 'node:test';
import assert from 'node:assert/strict';
import { dateKey, rollingStart, calculateStreaks, aggregateLanguages, normalizeCalendar, yearRanges, summarizeActivity } from '../scripts/stats.mjs';

test('activity summary counts shared calendar activity and exactly thirty inclusive days', () => {
  assert.deepEqual(summarizeActivity([
    { date: '2025-10-15', count: 999 },
    { date: '2026-09-15', count: 30 },
    { date: '2026-09-16', count: 10 },
    { date: '2026-10-14', count: 0 },
    { date: '2026-10-15', count: 20 },
    { date: '2026-10-16', count: 999 },
  ], { start: '2025-10-16', end: '2026-10-15' }), {
    activeDays: 3, last30Days: 30, bestDayCount: 30, bestDayDate: '2026-09-15',
  });
});

test('activity summary has meaningful zero values without an invented best date', () => {
  assert.deepEqual(summarizeActivity([{ date: '2026-10-15', count: 0 }], { start: '2025-10-16', end: '2026-10-15' }), {
    activeDays: 0, last30Days: 0, bestDayCount: 0, bestDayDate: null,
  });
});

test('today changes at midnight in Vietnam, not UTC midnight', () => {
  assert.equal(dateKey(new Date('2026-10-15T16:59:59Z')), '2026-10-15');
  assert.equal(dateKey(new Date('2026-10-15T17:00:00Z')), '2026-10-16');
});

test('rolling period covers twelve calendar months, including leap day', () => {
  assert.equal(rollingStart('2026-10-15'), '2025-10-16');
  assert.equal(rollingStart('2024-02-29'), '2023-03-01');
});

test('zero today retains yesterday’s current streak; gaps break longest streak', () => {
  assert.deepEqual(calculateStreaks([
    { date: '2026-10-10', count: 8 },
    { date: '2026-10-12', count: 1 },
    { date: '2026-10-13', count: 2 },
    { date: '2026-10-14', count: 1 },
    { date: '2026-10-15', count: 0 },
    { date: '2026-10-16', count: 20 },
  ], '2026-10-15'), {
    current: 3, currentStart: '2026-10-12', currentEnd: '2026-10-14',
    longest: 3, longestStart: '2026-10-12', longestEnd: '2026-10-14',
  });
});

test('streaks cross calendar years and leap day without resetting', () => {
  assert.equal(calculateStreaks([
    { date: '2025-12-31', count: 1 }, { date: '2026-01-01', count: 1 },
  ], '2026-01-01').current, 2);
  assert.equal(calculateStreaks([
    { date: '2024-02-28', count: 1 }, { date: '2024-02-29', count: 1 },
    { date: '2024-03-01', count: 1 },
  ], '2024-03-01').longest, 3);
});

test('a missed yesterday ends the current streak and zero history is valid', () => {
  assert.equal(calculateStreaks([{ date: '2026-10-13', count: 8 }], '2026-10-15').current, 0);
  assert.deepEqual(calculateStreaks([], '2026-10-15'), {
    current: 0, currentStart: null, currentEnd: null,
    longest: 0, longestStart: null, longestEnd: null,
  });
});

const repo = (name, bytes, extra = {}) => ({
  name, isFork: false, isPrivate: false, isArchived: false,
  languages: { edges: Object.entries(bytes).map(([name, size]) => ({ size, node: { name } })) },
  ...extra,
});

test('language shares use byte weights, exclude forks/private/profile, and retain archives', () => {
  const result = aggregateLanguages([
    repo('app', { TypeScript: 300, Python: 100 }),
    repo('old', { Python: 200 }, { isArchived: true }),
    repo('fork', { Java: 9000 }, { isFork: true }),
    repo('private', { Java: 9000 }, { isPrivate: true }),
    repo('dattk2002', { JavaScript: 9000 }),
  ], { excludeRepositories: ['dattk2002'], limit: 6 });
  assert.equal(result.totalBytes, 600);
  assert.equal(result.repositoryCount, 2);
  assert.deepEqual(result.items.map(({ name, bytes, percentage }) => ({ name, bytes, percentage })), [
    { name: 'Python', bytes: 300, percentage: 50 },
    { name: 'TypeScript', bytes: 300, percentage: 50 },
  ]);
});

test('languages outside the top six remain in the denominator as Other', () => {
  const result = aggregateLanguages([repo('app', { A: 70, B: 60, C: 50, D: 40, E: 30, F: 20, G: 10 })]);
  assert.equal(result.totalBytes, 280);
  assert.equal(result.items.length, 7);
  assert.equal(result.items[0].percentage, 25);
  assert.equal(result.items[6].name, 'Other');
  assert.equal(result.items[6].bytes, 10);
});

test('an empty language collection produces no NaN or artificial percentages', () => {
  assert.deepEqual(aggregateLanguages([repo('empty', {})]), { totalBytes: 0, repositoryCount: 1, items: [] });
});

test('calendar padding is filtered and duplicate identical days are not counted twice', () => {
  const days = normalizeCalendar([
    { date: '2025-12-31', contributionCount: 100 },
    { date: '2026-01-01', contributionCount: 3 },
    { date: '2026-01-01', contributionCount: 3 },
    { date: '2026-01-02', contributionCount: 0 },
  ], '2026-01-01', '2026-01-02');
  assert.deepEqual(days, [{ date: '2026-01-01', count: 3 }, { date: '2026-01-02', count: 0 }]);
});

test('missing, conflicting or malformed calendar data is rejected instead of fabricated', () => {
  assert.throws(() => normalizeCalendar([], '2026-01-01', '2026-01-02'), /missing/i);
  assert.throws(() => normalizeCalendar([
    { date: '2026-01-01', contributionCount: 3 }, { date: '2026-01-01', contributionCount: 4 },
  ], '2026-01-01', '2026-01-01'), /conflict/i);
  assert.throws(() => normalizeCalendar([{ date: '2026-01-01', contributionCount: -1 }], '2026-01-01', '2026-01-01'), /invalid/i);
});

test('year windows cover account creation through today without overlap', () => {
  assert.deepEqual(yearRanges('2024-07-25', '2026-01-02'), [
    { start: '2024-07-25', end: '2024-12-31' },
    { start: '2025-01-01', end: '2025-12-31' },
    { start: '2026-01-01', end: '2026-01-02' },
  ]);
});
