import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { profile } from './profile.config.mjs';
import { aggregateLanguages, calculateStreaks, dateKey, normalizeCalendar, rollingStart, yearRanges } from './stats.mjs';

const exec = promisify(execFile);
const languageFields = 'edges { size node { name } } pageInfo { hasNextPage endCursor }';
const profileQuery = 'query Profile($login: String!) { user(login: $login) { login createdAt } }';
const repositoriesQuery = `query Repositories($login: String!, $cursor: String) {
  user(login: $login) { repositories(first: 100, after: $cursor, privacy: PUBLIC, ownerAffiliations: OWNER, orderBy: {field: NAME, direction: ASC}) {
    totalCount pageInfo { hasNextPage endCursor }
    nodes { name isFork isPrivate isArchived languages(first: 100) { ${languageFields} } }
  } }
}`;
const languagesQuery = `query Languages($login: String!, $name: String!, $cursor: String!) {
  repository(owner: $login, name: $name) { languages(first: 100, after: $cursor) { ${languageFields} } }
}`;
const calendarQuery = `query Calendar($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) { contributionsCollection(from: $from, to: $to) {
    contributionCalendar { weeks { contributionDays { date contributionCount } } }
  } }
}`;
const activityQuery = `query Activity($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) { contributionsCollection(from: $from, to: $to) {
    restrictedContributionsCount
  } }
}`;

export function unwrapResponse(response) {
  if (response.errors?.length || !response.data || (!response.data.user && !response.data.repository)) {
    throw new Error('GitHub returned incomplete data');
  }
  return response.data;
}

export async function githubQuery(document, variables) {
  // gh uses GH_TOKEN in Actions and its existing credential store locally. Never read or print a token.
  const args = ['api', 'graphql', '--hostname', 'github.com', '-f', `query=${document}`];
  for (const [name, value] of Object.entries(variables)) {
    if (value !== null && value !== undefined) args.push('-f', `${name}=${value}`);
  }
  let stdout;
  try {
    ({ stdout } = await exec('gh', args, { timeout: 30_000, maxBuffer: 8 * 1024 * 1024, windowsHide: true }));
  } catch {
    // Upstream stderr may contain credential or private-repository context.
    throw new Error('GitHub request failed. Check authentication, permissions, rate limits or network access. Previous cards were retained.');
  }
  return unwrapResponse(JSON.parse(stdout));
}

function integer(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid GitHub counter');
  return value;
}

function nextCursor(pageInfo, seen) {
  if (!pageInfo || typeof pageInfo.hasNextPage !== 'boolean') throw new Error('Missing pagination information');
  if (!pageInfo.hasNextPage) return null;
  if (!pageInfo.endCursor || seen.has(pageInfo.endCursor)) throw new Error('Invalid pagination cursor');
  seen.add(pageInfo.endCursor);
  return pageInfo.endCursor;
}

export async function collectProfile({ now = new Date(), query = githubQuery } = {}) {
  const login = profile.username;
  const today = dateKey(now);
  const start = rollingStart(today);
  const { user } = await query(profileQuery, { login });
  if (user.login !== login || !/^\d{4}-\d{2}-\d{2}T/.test(user.createdAt)) throw new Error('Invalid GitHub profile');
  const since = user.createdAt.slice(0, 10);
  const repositories = [];
  const seen = new Set();
  let cursor = null;
  let repositoryCount;
  do {
    const response = await query(repositoriesQuery, { login, cursor });
    const connection = response.user.repositories;
    repositoryCount = integer(connection.totalCount);
    for (const repository of connection.nodes) {
      if (repository.isPrivate) throw new Error('Private repository returned in a public-only query');
      const languageCursors = new Set();
      let languageCursor = nextCursor(repository.languages.pageInfo, languageCursors);
      while (languageCursor) {
        const more = await query(languagesQuery, { login, name: repository.name, cursor: languageCursor });
        repository.languages.edges.push(...more.repository.languages.edges);
        languageCursor = nextCursor(more.repository.languages.pageInfo, languageCursors);
      }
      repositories.push(repository);
    }
    cursor = nextCursor(connection.pageInfo, seen);
  } while (cursor);
  if (repositories.length !== repositoryCount || new Set(repositories.map(repo => repo.name)).size !== repositoryCount) {
    throw new Error('Repository pagination returned incomplete or duplicate data');
  }

  // Calendar requests run sequentially so a failed year cannot produce a partial snapshot.
  const days = [];
  for (const range of yearRanges(since, today)) {
    const response = await query(calendarQuery, { login, from: `${range.start}T00:00:00Z`, to: `${range.end}T23:59:59Z` });
    const calendar = response.user.contributionsCollection.contributionCalendar;
    days.push(...normalizeCalendar(calendar.weeks.flatMap(week => week.contributionDays), range.start, range.end));
  }
  const response = await query(activityQuery, { login, from: `${start}T00:00:00Z`, to: `${today}T23:59:59Z` });
  const activity = response.user.contributionsCollection;
  const recent = days.filter(day => day.date >= start);
  return {
    version: 2, username: login, generatedAt: now.toISOString(), asOf: today, since,
    period: { start, end: today, total: recent.reduce((sum, day) => sum + day.count, 0) },
    restrictedContributions: integer(activity.restrictedContributionsCount),
    totalContributions: days.reduce((sum, day) => sum + day.count, 0),
    streaks: calculateStreaks(days, today),
    languages: aggregateLanguages(repositories, { excludeRepositories: profile.excludeRepositories, limit: profile.languagesLimit }),
    days: recent,
  };
}
