import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
import { collectProfile } from './github.mjs';
import { renderCards, updateReadme } from './render.mjs';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));

export async function updateProfile({ directory = repoRoot, collect = collectProfile } = {}) {
  // Finish all network requests, validation and rendering before touching last-good files.
  const snapshot = await collect();
  const readme = await readFile(join(directory, 'README.md'), 'utf8');
  const cards = renderCards(snapshot);
  const files = {
    ...Object.fromEntries(Object.entries(cards).map(([name, content]) => [`assets/${name}`, content])),
    'assets/github-data.json': `${JSON.stringify(snapshot, null, 2)}\n`,
    'README.md': updateReadme(readme, snapshot),
  };
  for (const [name, content] of Object.entries(files)) {
    await writeFile(join(directory, `${name}.tmp`), content, 'utf8');
  }
  for (const name of Object.keys(files)) await rename(join(directory, `${name}.tmp`), join(directory, name));
  return snapshot;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const renderOnly = process.argv.includes('--render');
    const snapshot = await updateProfile(renderOnly ? {
      collect: async () => JSON.parse(await readFile(join(repoRoot, 'assets/github-data.json'), 'utf8')),
    } : {});
    console.log(`Updated profile cards for ${snapshot.username} (${snapshot.asOf}): ${snapshot.totalContributions} all-time contributions, ${snapshot.streaks.current}-day current streak.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
