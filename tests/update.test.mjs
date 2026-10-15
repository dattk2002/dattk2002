import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { updateProfile } from '../scripts/update-profile.mjs';

test('upstream failure leaves the last good cards and README untouched', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'profile-cards-test-'));
  try {
    await mkdir(join(directory, 'assets'));
    await writeFile(join(directory, 'assets/github-stats.svg'), '<svg>previous</svg>');
    await writeFile(join(directory, 'README.md'), 'Original README');
    await assert.rejects(updateProfile({ directory, collect: async () => { throw new Error('Upstream failure'); } }), /Upstream failure/);
    assert.equal(await readFile(join(directory, 'assets/github-stats.svg'), 'utf8'), '<svg>previous</svg>');
    assert.equal(await readFile(join(directory, 'README.md'), 'utf8'), 'Original README');
  } finally {
    await rm(directory, { recursive: true });
  }
});
