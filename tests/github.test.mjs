import test from 'node:test';
import assert from 'node:assert/strict';
import { collectProfile, unwrapResponse } from '../scripts/github.mjs';

const repository = (name, bytes, extra = {}) => ({
  name, isFork: false, isPrivate: false,
  languages: { edges: [{ size: bytes, node: { name: 'TypeScript' } }], pageInfo: { hasNextPage: false } },
  ...extra,
});

function fixtureQuery({ missingDay = false, fail = false } = {}) {
  return async (document, variables) => {
    if (fail) throw new Error('Service unavailable');
    if (document.includes('query Profile')) return { user: { login: 'dattk2002', createdAt: '2025-12-31T01:00:00Z' } };
    if (document.includes('query Repositories')) return { user: { repositories: {
      totalCount: 2,
      nodes: [repository(variables.cursor ? 'second' : 'first', variables.cursor ? 300 : 100)],
      pageInfo: { hasNextPage: !variables.cursor, endCursor: 'page-two' },
    } } };
    if (document.includes('query Calendar')) {
      const days = variables.from.startsWith('2025')
        ? [{ date: '2025-12-31', contributionCount: 2 }]
        : [{ date: '2026-01-01', contributionCount: 3 }, ...(missingDay ? [] : [{ date: '2026-01-02', contributionCount: 0 }])];
      return { user: { contributionsCollection: { contributionCalendar: { weeks: [{ contributionDays: days }] } } } };
    }
    if (document.includes('query Activity')) return { user: { contributionsCollection: {
      restrictedContributionsCount: 4,
    } } };
    throw new Error('Unexpected query');
  };
}

test('collection follows pagination and publishes only aggregate repository statistics', async () => {
  const result = await collectProfile({ now: new Date('2026-01-02T10:00:00Z'), query: fixtureQuery() });
  assert.equal(result.languages.totalBytes, 400);
  assert.equal(result.languages.repositoryCount, 2);
  assert.equal(result.totalContributions, 5);
  assert.equal(result.period.total, 5);
  assert.equal(result.streaks.current, 2);
  assert.equal(result.overview, undefined);
  assert.equal(result.restrictedContributions, 4);
  assert.equal(JSON.stringify(result).includes('second'), false);
  assert.equal(JSON.stringify(result).includes('page-two'), false);
});

test('missing upstream days and API failures reject the whole snapshot', async () => {
  await assert.rejects(collectProfile({ now: new Date('2026-01-02T10:00:00Z'), query: fixtureQuery({ missingDay: true }) }), /missing/i);
  await assert.rejects(collectProfile({ now: new Date('2026-01-02T10:00:00Z'), query: fixtureQuery({ fail: true }) }), /unavailable/i);
});

test('partial GraphQL data, errors and absent users cannot masquerade as success', () => {
  assert.throws(() => unwrapResponse({ data: { user: {} }, errors: [{ message: 'sensitive upstream detail' }] }), /GitHub returned incomplete data/);
  assert.throws(() => unwrapResponse({ data: { user: null } }), /GitHub returned incomplete data/);
  assert.deepEqual(unwrapResponse({ data: { user: { login: 'dattk2002' } } }), { user: { login: 'dattk2002' } });
});
