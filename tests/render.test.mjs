import test from 'node:test';
import assert from 'node:assert/strict';
import { renderCards, updateReadme } from '../scripts/render.mjs';

export const snapshot = {
  username: 'dattk2002', asOf: '2026-10-15', generatedAt: '2026-10-15T16:00:00Z', since: '2016-07-25',
  period: { start: '2025-10-16', end: '2026-10-15', total: 18 },
  totalContributions: 22, restrictedContributions: 13,
  streaks: { current: 2, longest: 3, currentStart: '2026-10-14', currentEnd: '2026-10-15', longestStart: '2026-05-01', longestEnd: '2026-05-03' },
  languages: { totalBytes: 10, repositoryCount: 2, items: [{ name: 'C# & <XML>', bytes: 10, percentage: 100 }] },
  days: [{ date: '2026-10-14', count: 1 }, { date: '2026-10-15', count: 2 }],
};

test('cards escape untrusted labels and remain standalone script-free SVGs', () => {
  const cards = renderCards(snapshot);
  for (const svg of Object.values(cards)) {
    assert.match(svg, /^<svg\s/);
    assert.match(svg, /<title id="title">/);
    assert.match(svg, /<desc id="desc">/);
    assert.doesNotMatch(svg, /<script|<foreignObject|<image|NaN|undefined/);
  }
  assert.match(cards['github-stats.svg'], /C# &amp; &lt;XML&gt;/);
  assert.doesNotMatch(cards['github-stats.svg'], /C# & <XML>/);
});

test('cross-year streaks show both years in the readable table', () => {
  const output = updateReadme('<!-- PROFILE-STATS:START --><!-- PROFILE-STATS:END -->', {
    ...snapshot, streaks: { ...snapshot.streaks, longest: 9, longestStart: '2025-12-28', longestEnd: '2026-01-05' },
  });
  assert.match(output, /Dec 28, 2025 – Jan 5, 2026/);
});

test('zero activity and empty languages show valid empty states', () => {
  const cards = renderCards({ ...snapshot, days: [], languages: { totalBytes: 0, repositoryCount: 0, items: [] }, streaks: { current: 0, longest: 0 }, totalContributions: 0 });
  assert.match(cards['github-stats.svg'], /No public language data/);
  assert.doesNotMatch(Object.values(cards).join(''), /NaN|undefined|Infinity/);
});

test('README update preserves surrounding prose and exposes readable values', () => {
  const readme = 'Before\n<!-- PROFILE-STATS:START -->\nold\n<!-- PROFILE-STATS:END -->\nAfter';
  const output = updateReadme(readme, snapshot);
  assert.ok(output.startsWith('Before\n'));
  assert.ok(output.endsWith('\nAfter'));
  assert.match(output, /All-time contributions \| 22/);
  assert.match(output, /Current streak \| 2 days/);
  assert.match(output, /2026-10-15/);
  assert.equal(updateReadme(output, snapshot), output);
});

test('published stats use shared-calendar activity instead of incomplete repository counters', () => {
  const output = updateReadme('<!-- PROFILE-STATS:START --><!-- PROFILE-STATS:END -->', {
    ...snapshot,
    days: [{ date: '2026-10-14', count: 8 }, { date: '2026-10-15', count: 10 }],
  });
  assert.match(output, /Active days \| 2/);
  assert.match(output, /Contributions in the last 30 days \| 18/);
  assert.match(output, /Most contributions in a day \| 10/);
  assert.doesNotMatch(output, /\| (Commits|Pull requests|Code reviews|Stars received|Public repositories) \|/);
});

test('README without one unambiguous marker pair is rejected', () => {
  assert.throws(() => updateReadme('No markers', snapshot), /marker/i);
  assert.throws(() => updateReadme('<!-- PROFILE-STATS:START --><!-- PROFILE-STATS:START --><!-- PROFILE-STATS:END -->', snapshot), /marker/i);
});
