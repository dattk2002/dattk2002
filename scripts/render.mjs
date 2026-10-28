import { readFileSync } from 'node:fs';
import { technology, technologyNotes } from './profile.config.mjs';
import { shiftDay, summarizeActivity } from './stats.mjs';

const iconCatalog = JSON.parse(readFileSync(new URL('../assets/how-i-ship-icons.json', import.meta.url), 'utf8'));
const c = { bg: '#090B0C', surface: '#101416', text: '#F1EFE7', muted: '#A7ADB0', lime: '#C7F36B', steel: '#7EA2B8', border: '#2A3135' };
const languageColors = [c.lime, c.steel, '#E0D9B9', '#9FD5BD', '#B4ACD3', '#D0AC8D', '#899399'];
const heatColors = ['#182023', '#334A2C', '#5A7C3C', '#8EB750', c.lime];
const number = value => new Intl.NumberFormat('en-US').format(value);
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
const shortDate = date => date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)) : 'No active streak';
const range = (start, end) => start && end ? `${shortDate(start)}${start.slice(0, 4) !== end.slice(0, 4) ? `, ${start.slice(0, 4)}` : ''} – ${shortDate(end)}, ${end.slice(0, 4)}` : 'No active streak';
const text = (x, y, value, size = 16, fill = c.text, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${escape(value)}</text>`;
const label = (x, y, value, fill = c.muted) => text(x, y, value, 13, fill, 'class="mono" letter-spacing="1.5"');
const line = (x1, y1, x2, y2) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${c.border}"/>`;

function root(width, height, title, description, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title" aria-describedby="desc">
<title id="title">${escape(title)}</title><desc id="desc">${escape(description)}</desc>
<defs>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="${c.border}" stroke-opacity="0.18"/></pattern>
  <linearGradient id="ambient" x2="1" y2="1"><stop stop-color="${c.steel}" stop-opacity="0.045"/><stop offset="1" stop-color="${c.lime}" stop-opacity="0.025"/></linearGradient>
</defs>
<style>text{font-family:Arial,Helvetica,sans-serif}.mono{font-family:Consolas,'Liberation Mono',monospace}text{font-variant-numeric:tabular-nums}</style>
${body}
</svg>\n`;
}

function panel(x, y, width, height) {
  return `<rect x="${x + 1}" y="${y + 1}" width="${width - 2}" height="${height - 2}" rx="16" fill="${c.bg}" stroke="${c.border}"/>
<rect x="${x + 1}" y="${y + 1}" width="${width - 2}" height="${height - 2}" rx="16" fill="url(#grid)"/>
<rect x="${x + 1}" y="${y + 1}" width="${width - 2}" height="${height - 2}" rx="16" fill="url(#ambient)"/>`;
}

function githubStats(snapshot, size) {
  const wide = size === 'wide';
  const mobile = size === 'mobile' || wide;
  const compact = size !== 'desktop';
  const width = mobile ? (wide ? 480 : 320) : compact ? 736 : 960;
  const cardWidth = mobile ? width : compact ? 360 : 472;
  const height = mobile ? 880 : 432;
  const pad = wide ? 28 : mobile ? 20 : compact ? 24 : 32;
  const summary = summarizeActivity(snapshot.days, snapshot.period);
  let body = panel(0, 0, cardWidth, 432);
  body += label(pad, 36, 'GITHUB / STATS', c.lime);
  body += text(pad, 80, 'GitHub stats', 34, c.text, 'font-weight="700" letter-spacing="-1"');
  body += text(pad, 110, 'Public & shared private activity', 16, c.muted);
  const contributionSize = Math.min(76, (cardWidth - pad * 2) / (number(snapshot.period.total).length * 0.6));
  body += text(pad, 190, number(snapshot.period.total), contributionSize, c.text, 'font-weight="700" letter-spacing="-3"');
  body += text(pad, 232, 'contributions · past 12 months', 16, c.muted);
  body += line(pad, 254, cardWidth - pad, 254);
  const columnWidth = (cardWidth - pad * 2) / 3;
  [[summary.activeDays, 'Active days'], [summary.last30Days, 'Last 30 days'], [summary.bestDayCount, 'Best day']].forEach(([value, name], i) => {
    const x = pad + i * columnWidth;
    const valueSize = Math.min(34, (columnWidth - 12) / (number(value).length * 0.6));
    body += text(x, 310, number(value), valueSize, i === 0 ? c.lime : c.text, 'font-weight="600" letter-spacing="-1"');
    body += text(x, 336, name, mobile ? 14 : 15, c.muted);
  });
  body += text(pad, 382, 'Includes shared private contributions.', mobile ? 14 : 15, c.muted);
  body += text(pad, 405, 'Past 12 months unless noted.', 14, c.muted);
  const lx = mobile ? 0 : compact ? 376 : 488;
  const ly = mobile ? 448 : 0;
  body += panel(lx, ly, cardWidth, 432);
  body += label(lx + pad, ly + 36, 'LANGUAGES / CODE VOLUME', c.lime);
  body += text(lx + pad, ly + 80, 'Most used languages', compact ? 26 : 30, c.text, 'font-weight="700" letter-spacing="-0.8"');
  body += text(lx + pad, ly + 110, `${snapshot.languages.repositoryCount} public repositories · by bytes`, 15, c.muted);
  const barWidth = cardWidth - pad * 2;
  snapshot.languages.items.forEach((item, i) => {
    const y = ly + 151 + i * 34;
    const color = languageColors[i];
    body += `<circle cx="${lx + pad + 4}" cy="${y - 5}" r="4" fill="${color}"/>`;
    body += text(lx + pad + 18, y, item.name, 16);
    const bx = lx + pad;
    body += `<rect x="${bx}" y="${y + 9}" width="${barWidth}" height="4" rx="2" fill="${c.border}"/>`;
    body += `<rect x="${bx}" y="${y + 9}" width="${(barWidth * item.percentage / 100).toFixed(2)}" height="4" rx="2" fill="${color}"/>`;
    body += text(lx + cardWidth - pad, y, `${item.percentage.toFixed(1)}%`, 16, c.text, 'text-anchor="end" class="mono"');
  });
  if (!snapshot.languages.items.length) body += text(lx + pad, ly + 190, 'No public language data', 18, c.muted);
  body += text(lx + pad, ly + 402, 'Public code only · private repos excluded', 14, c.muted);
  return root(width, height, 'GitHub stats and most used languages', `${number(snapshot.period.total)} contributions in the past twelve months, including shared private counts. ${summary.activeDays} active days; ${number(summary.last30Days)} contributions in the last thirty days; ${summary.bestDayCount} contributions on the most active day. Language shares measure public repository code bytes, not proficiency.`, body);
}

function heatmap(days, start, end, x, y, cell, columns) {
  const counts = new Map(days.map(day => [day.date, day.count]));
  const startWeekday = new Date(`${start}T00:00:00Z`).getUTCDay();
  let date = shiftDay(start, -startWeekday);
  let body = '';
  const step = cell + 3;
  let lastMonth = '';
  const monthLabels = [];
  for (let col = 0; col < columns && date <= end; col++) {
    const monthDay = new Date(`${date}T00:00:00Z`);
    const month = monthDay.toISOString().slice(0, 7);
    if (month !== lastMonth && col < columns - 2) {
      // A split may start just before a new month. Drop a cramped leading label.
      if (monthLabels.length && (col - monthLabels.at(-1).col) * step < 30) monthLabels.pop();
      monthLabels.push({ col, name: monthDay.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) });
      lastMonth = month;
    }
    for (let row = 0; row < 7; row++) {
      if (date >= start && date <= end) {
        const count = counts.get(date) ?? 0;
        const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 9 ? 2 : count <= 19 ? 3 : 4;
        body += `<rect x="${x + col * step}" y="${y + row * step}" width="${cell}" height="${cell}" rx="2" fill="${heatColors[level]}"><title>${date}: ${count} contributions</title></rect>`;
      }
      date = shiftDay(date, 1);
    }
  }
  body += monthLabels.map(month => text(x + month.col * step, y - 12, month.name, 12, c.muted)).join('');
  return body;
}

function activity(snapshot, size) {
  const wide = size === 'wide';
  const mobile = size === 'mobile' || wide;
  const tablet = size === 'tablet';
  const w = mobile ? (wide ? 480 : 320) : tablet ? 736 : 960;
  const h = mobile ? (wide ? 816 : 744) : 450;
  const pad = wide ? 28 : mobile ? 20 : 32;
  const s = snapshot.streaks;
  let body = panel(0, 0, w, h);
  body += label(pad, 36, 'CONTRIBUTION ACTIVITY', c.lime);
  body += text(pad, 80, 'Showing up. Shipping.', mobile ? 26 : 34, c.text, 'font-weight="700" letter-spacing="-1"');
  if (!mobile) body += text(w - pad, 35, `UPDATED ${snapshot.asOf}`, 13, c.muted, 'class="mono" text-anchor="end"');
  body += text(pad, 153, number(snapshot.totalContributions), mobile ? 64 : 68, c.text, 'font-weight="700" letter-spacing="-3"');
  body += text(pad, 193, 'Total contributions', 16, c.muted);
  body += text(pad, 218, `Since ${snapshot.since.slice(0, 4)}`, 14, c.muted);
  [[s.current, 'Current streak', s.currentStart, s.currentEnd], [s.longest, 'Longest streak', s.longestStart, s.longestEnd]].forEach(([value, name, start, end], i) => {
    const x = mobile ? pad + i * (w - 2 * pad) / 2 : w * (i === 0 ? 0.4146 : 0.7063);
    const y = mobile ? 290 : 159;
    const valueSize = Math.min(mobile || tablet ? 54 : 62, 96 / (number(value).length * 0.56));
    body += text(x, y, number(value), valueSize, i === 0 ? c.lime : c.text, 'font-weight="700" letter-spacing="-2"');
    body += text(x + Math.ceil(number(value).length * valueSize * 0.56) + 6, y, 'days', 16, c.muted);
    body += text(x, y + 28, name, 16, c.muted);
    if (mobile && start && end) {
      body += text(x, y + 52, `${shortDate(start)} – ${shortDate(end)}`, 14, c.muted);
      body += text(x, y + 70, start.slice(0, 4) === end.slice(0, 4) ? end.slice(0, 4) : `${start.slice(0, 4)} – ${end.slice(0, 4)}`, 13, c.muted);
    } else body += text(x, y + 52, range(start, end), tablet ? 12 : 14, c.muted);
  });
  const dividerY = mobile ? 370 : 239;
  body += line(pad, dividerY, w - pad, dividerY);
  body += text(pad, dividerY + 31, `${number(snapshot.period.total)} contributions in the past 12 months`, mobile ? 14 : 16, c.text);
  if (mobile) {
    // Use two complete week-aligned strips, keeping every day exactly once.
    const sunday = shiftDay(snapshot.period.start, -new Date(`${snapshot.period.start}T00:00:00Z`).getUTCDay());
    const middle = shiftDay(sunday, 27 * 7);
    const cell = Math.floor((w - pad * 2) / 27) - 3;
    body += heatmap(snapshot.days, snapshot.period.start, shiftDay(middle, -1), pad, 444, cell, 27);
    body += heatmap(snapshot.days, middle, snapshot.period.end, pad, wide ? 588 : 561, cell, 27);
    body += text(pad, wide ? 753 : 677, 'GitHub day buckets · today at UTC+7', 14, c.muted);
    body += text(pad, wide ? 780 : 704, `Updated ${snapshot.asOf}`, 14, c.muted);
  } else {
    body += heatmap(snapshot.days, snapshot.period.start, snapshot.period.end, pad, 310, tablet ? 9 : 13, 54);
    body += text(pad, 434, 'GitHub day buckets · today at UTC+7 · private counts included when shared', 14, c.muted);
  }
  const legendX = mobile ? w - 148 : w - 182;
  const legendY = mobile ? (wide ? 716 : 641) : 262;
  body += text(legendX - 34, legendY + 2, 'Less', 12, c.muted);
  heatColors.forEach((color, i) => { body += `<rect x="${legendX + i * 15}" y="${legendY - 8}" width="11" height="11" rx="2" fill="${color}"/>`; });
  body += text(legendX + 79, legendY + 2, 'More', 12, c.muted);
  return root(w, h, 'GitHub contributions and streaks', `${number(snapshot.totalContributions)} contributions since ${snapshot.since}. Current streak: ${s.current} days. Longest streak: ${s.longest} days. ${number(snapshot.period.total)} contributions in the past twelve months. Today uses UTC+7; daily buckets are supplied by GitHub.`, body);
}

function icon(name, x, y) {
  const artwork = iconCatalog.icons[name];
  if (!artwork) throw new Error(`Missing verified icon for ${name}`);
  const svg = artwork.svg.replace('<svg ', `<svg x="4" y="4" width="20" height="20" preserveAspectRatio="xMidYMid meet" `);
  return `<g transform="translate(${x} ${y - 4})" aria-hidden="true">${svg}</g>`;
}

function stack(size) {
  const wide = size === 'wide';
  const mobile = size === 'mobile';
  const tablet = size === 'tablet';
  const compact = mobile || wide;
  const w = mobile ? 320 : wide ? 480 : tablet ? 736 : 960;
  const pad = wide ? 28 : mobile ? 20 : 32;
  const columns = mobile ? 2 : wide ? 3 : tablet ? 4 : 6;
  const columnWidth = (w - pad * 2) / columns;
  const rowHeight = compact ? 42 : 48;
  const rows = Math.ceil(technology.length / columns);
  const h = 158 + rows * rowHeight + 38;
  let body = panel(0, 0, w, h);
  body += label(pad, 36, 'THE TOOLS BEHIND THE WORK', c.lime);
  body += text(pad, 80, 'One connected stack.', compact ? 26 : 36, c.text, 'font-weight="700" letter-spacing="-0.9"');
  body += text(pad, 108, `${technology.length} technologies I build with.`, compact ? 15 : 17, c.muted);
  body += line(pad, 132, w - pad, 132);
  technology.forEach(([name], i) => {
    const x = pad + (i % columns) * columnWidth;
    const y = 158 + Math.floor(i / columns) * rowHeight;
    body += icon(name, x, y);
    const note = technologyNotes[name];
    if (note) {
      const displayName = name === 'Gemini Grounded Search' ? 'Gemini ' : name;
      const accessibleLabel = name === 'Gemini Grounded Search' ? name : `${name}: ${note}`;
      body += `<text x="${x + 36}" y="${y + 8}" font-size="${compact ? 14 : tablet ? 16 : 15}" fill="${c.text}" aria-label="${escape(accessibleLabel)}"><tspan>${escape(displayName)}</tspan><tspan x="${x + 36}" dy="17" font-size="${compact ? 12 : 13}" fill="${c.muted}">${escape(note)}</tspan></text>`;
    } else body += text(x + 36, y + 16, name, compact ? 14 : tablet ? 16 : 15);
  });
  body += text(pad, h - 27, 'Used across shipped projects.', compact ? 14 : 15, c.muted);
  const attribution = { sources: Object.fromEntries(technology.map(([name]) => [name, iconCatalog.icons[name].source])), notes: iconCatalog.notes, presentation: iconCatalog.presentation, notices: iconCatalog.notices };
  const description = technology.map(([name]) => technologyNotes[name] && name !== 'Gemini Grounded Search' ? `${name}: ${technologyNotes[name]}` : name).join('; ') + '.';
  return root(w, h, 'Tran Kim Dat’s technology stack', description, `<metadata>${escape(JSON.stringify(attribution))}</metadata>${body}`);
}

export function renderCards(snapshot) {
  return {
    'github-stats.svg': githubStats(snapshot, 'desktop'),
    'github-stats-tablet.svg': githubStats(snapshot, 'tablet'),
    'github-stats-mobile.svg': githubStats(snapshot, 'mobile'),
    'github-stats-wide.svg': githubStats(snapshot, 'wide'),
    'github-activity.svg': activity(snapshot, 'desktop'),
    'github-activity-tablet.svg': activity(snapshot, 'tablet'),
    'github-activity-mobile.svg': activity(snapshot, 'mobile'),
    'github-activity-wide.svg': activity(snapshot, 'wide'),
    'tech-stack.svg': stack('desktop'),
    'tech-stack-tablet.svg': stack('tablet'),
    'tech-stack-mobile.svg': stack('mobile'),
    'tech-stack-wide.svg': stack('wide'),
  };
}

export function updateReadme(readme, snapshot) {
  const start = '<!-- PROFILE-STATS:START -->';
  const end = '<!-- PROFILE-STATS:END -->';
  if (readme.split(start).length !== 2 || readme.split(end).length !== 2 || readme.indexOf(start) > readme.indexOf(end)) throw new Error('README needs exactly one ordered statistics marker pair');
  const { streaks: s } = snapshot;
  const summary = summarizeActivity(snapshot.days, snapshot.period);
  const markdownSafe = value => escape(value).replaceAll('|', '&#124;');
  const body = `
<details>
<summary>Activity in numbers · updated ${snapshot.asOf}</summary>

| Metric | Value | Scope |
| --- | ---: | --- |
| All-time contributions | ${number(snapshot.totalContributions)} | Since ${snapshot.since} |
| Contributions | ${number(snapshot.period.total)} | ${snapshot.period.start} to ${snapshot.period.end} |
| Current streak | ${s.current} days | ${range(s.currentStart, s.currentEnd)} |
| Longest streak | ${s.longest} days | ${range(s.longestStart, s.longestEnd)} |
| Active days | ${summary.activeDays} | Days with at least one contribution in the past 12 months |
| Contributions in the last 30 days | ${number(summary.last30Days)} | ${shiftDay(snapshot.period.end, -29)} to ${snapshot.period.end} |
| Most contributions in a day | ${summary.bestDayCount} | ${summary.bestDayDate ?? 'No activity in this period'}; past 12 months |

${snapshot.languages.items.length ? `**Languages by public code volume:** ${snapshot.languages.items.map(item => `${markdownSafe(item.name)} ${item.percentage.toFixed(1)}%`).join(' · ')}.` : 'No public language data is available.'}

Language shares measure code bytes across ${snapshot.languages.repositoryCount} original public repositories, including archives. Forks and this generated profile repository are excluded. These are code proportions, not proficiency scores.

These statistics use GitHub's contribution calendar, including private counts when shared. The owner primarily works in private repositories; ${number(snapshot.restrictedContributions)} contributions in this period have restricted details. Private repository names and content remain private.

Streaks use GitHub's daily calendar buckets and UTC+7 to determine today. A day still in progress does not break yesterday's streak. [Data sources and update method](./docs/profile-cards.md).

</details>
`;
  return readme.slice(0, readme.indexOf(start) + start.length) + body + readme.slice(readme.indexOf(end));
}
