import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applicationScripts, isPrivateFile, treeDigest } from '../lib/repo-policy.mjs';

test('env examples stay portable; local secrets are rejected in nested projects', () => {
  for (const path of ['.env', 'apps/web/.env.local', 'private.key', 'credentials-prod.json'])
    assert.equal(isPrivateFile(path), true);
  for (const path of ['.env.example', 'apps/web/.env.example', 'README.md'])
    assert.equal(isPrivateFile(path), false);
});

test('adding app code cannot leave foundation-only validation green', () => {
  const config = { application: { status: 'not-selected', scripts: [] } };
  assert.deepEqual(
    applicationScripts(config, {}, [
      '.claude/skills/impeccable/scripts/live-browser.js',
      '.github/skills/impeccable/scripts/live-browser.js',
      '.agent/skills/impeccable/scripts/live-browser.js',
    ]),
    [],
  );
  assert.deepEqual(applicationScripts(config, {}, ['scripts/setup.mjs', 'eslint.config.mjs']), []);
  for (const path of ['src/page.tsx', 'index.html', 'main.py', 'apps/api/main.go']) {
    assert.throws(() => applicationScripts(config, {}, [path]), /Configure application checks/);
  }
});

test('configured checks must exist and cannot recursively invoke validation', () => {
  const config = (scripts) => ({ application: { status: 'configured', scripts } });
  assert.throws(() => applicationScripts(config([]), {}, []), /needs real/);
  assert.throws(
    () => applicationScripts(config(['app:test']), { scripts: {} }, []),
    /Invalid application check/,
  );
  assert.throws(
    () => applicationScripts(config(['validate']), { scripts: { validate: 'node script' } }, []),
    /Invalid application check/,
  );
  assert.deepEqual(
    applicationScripts(config(['app:test']), { scripts: { 'app:test': 'node --test' } }, []),
    ['app:test'],
  );
});

test('vendor digest detects edits while ignoring platform engine binaries', () => {
  const folder = mkdtempSync(join(tmpdir(), 'hackathon-vendor-'));
  try {
    writeFileSync(join(folder, 'SKILL.md'), 'instructions\n');
    const initial = treeDigest(folder);
    writeFileSync(join(folder, 'SKILL.md'), 'instructions\r\n');
    assert.equal(treeDigest(folder), initial); // Git normalizes text across Windows/POSIX.
    mkdirSync(join(folder, 'scripts/bin'), { recursive: true });
    writeFileSync(join(folder, 'scripts/bin/engine'), 'binary');
    // Empty directories do not change the payload digest.
    assert.equal(treeDigest(folder), initial);
    writeFileSync(join(folder, 'SKILL.md'), 'changed instructions\n');
    assert.notEqual(treeDigest(folder), initial);
  } finally {
    rmSync(folder, { recursive: true, force: true });
  }
});
