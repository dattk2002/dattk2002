export const TIME_ZONE = 'Asia/Ho_Chi_Minh';

export function summarizeActivity(days, period) {
  const recentStart = shiftDay(period.end, -29);
  const result = { activeDays: 0, last30Days: 0, bestDayCount: 0, bestDayDate: null };
  for (const day of days) {
    if (day.date < period.start || day.date > period.end) continue;
    if (day.count > 0) result.activeDays++;
    if (day.date >= recentStart) result.last30Days += day.count;
    if (day.count > result.bestDayCount || (day.count > 0 && day.count === result.bestDayCount && day.date < result.bestDayDate)) {
      result.bestDayCount = day.count;
      result.bestDayDate = day.date;
    }
  }
  return result;
}

export function dateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

export function shiftDay(day, amount) {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function rollingStart(today) {
  const [year, month, day] = today.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year - 1, month, 0)).getUTCDate();
  return shiftDay(new Date(Date.UTC(year - 1, month - 1, Math.min(day, lastDay))).toISOString().slice(0, 10), 1);
}

export function calculateStreaks(days, today) {
  const counts = new Map(days.filter(day => day.date <= today).map(day => [day.date, day.count]));
  const result = { current: 0, currentStart: null, currentEnd: null, longest: 0, longestStart: null, longestEnd: null };
  let cursor = counts.get(today) > 0 ? today : shiftDay(today, -1);
  while (counts.get(cursor) > 0) {
    result.currentEnd ??= cursor;
    result.currentStart = cursor;
    result.current++;
    cursor = shiftDay(cursor, -1);
  }
  let running = 0;
  let start = null;
  let previous = null;
  for (const [date, count] of [...counts].sort(([a], [b]) => a.localeCompare(b))) {
    if (count <= 0 || (previous && date !== shiftDay(previous, 1))) running = 0;
    if (count > 0) {
      if (running === 0) start = date;
      running++;
      if (running > result.longest) {
        result.longest = running;
        result.longestStart = start;
        result.longestEnd = date;
      }
    }
    previous = date;
  }
  return result;
}

export function aggregateLanguages(repositories, { excludeRepositories = [], limit = 6 } = {}) {
  const included = repositories.filter(repo => !repo.isFork && !repo.isPrivate && !excludeRepositories.includes(repo.name));
  const bytesByName = new Map();
  for (const repo of included) {
    for (const { size, node } of repo.languages.edges) {
      if (!Number.isSafeInteger(size) || size < 0 || typeof node?.name !== 'string') throw new Error('Invalid language data');
      if (size > 0) bytesByName.set(node.name, (bytesByName.get(node.name) ?? 0) + size);
    }
  }
  const ranked = [...bytesByName].map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => b.bytes - a.bytes || a.name.localeCompare(b.name));
  const totalBytes = ranked.reduce((sum, item) => sum + item.bytes, 0);
  const top = ranked.slice(0, limit);
  const otherBytes = ranked.slice(limit).reduce((sum, item) => sum + item.bytes, 0);
  if (otherBytes) top.push({ name: 'Other', bytes: otherBytes });
  return {
    totalBytes, repositoryCount: included.length,
    items: top.map(item => ({ ...item, percentage: item.bytes / totalBytes * 100 })),
  };
}

export function normalizeCalendar(days, start, end) {
  const counts = new Map();
  for (const { date, contributionCount } of days) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isSafeInteger(contributionCount) || contributionCount < 0) {
      throw new Error('Invalid calendar data');
    }
    if (date < start || date > end) continue;
    if (counts.has(date) && counts.get(date) !== contributionCount) throw new Error(`Conflicting calendar date: ${date}`);
    counts.set(date, contributionCount);
  }
  const result = [];
  for (let date = start; date <= end; date = shiftDay(date, 1)) {
    if (!counts.has(date)) throw new Error(`Missing calendar date: ${date}`);
    result.push({ date, count: counts.get(date) });
  }
  return result;
}

export function yearRanges(created, today) {
  const ranges = [];
  for (let year = Number(created.slice(0, 4)); year <= Number(today.slice(0, 4)); year++) {
    ranges.push({ start: year === Number(created.slice(0, 4)) ? created : `${year}-01-01`, end: `${year}-12-31` < today ? `${year}-12-31` : today });
  }
  return ranges;
}
