import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { assertSkillMirrors, syncSkillMirrors } from '../lib/skill-mirrors.mjs';

test('team mirrors preserve resources, reject drift, sync approved source changes, and exclude binaries', (context) => {
  const root = mkdtempSync(join(tmpdir(), 'hackathon-mirrors-'));
  context.after(() => {
    const scope = relative(resolve(tmpdir()), resolve(root));
    assert.ok(
      scope.startsWith('hackathon-mirrors-') && !scope.includes('/') && !scope.includes('\\'),
    );
    rmSync(root, { recursive: true });
  });
  const source = join(root, '.agents/skills/demo');
  mkdirSync(join(source, 'scripts/bin'), { recursive: true });
  mkdirSync(join(source, 'references'), { recursive: true });
  writeFileSync(join(source, 'SKILL.md'), 'canonical instructions\n');
  writeFileSync(join(source, 'references/detail.md'), 'supporting evidence\n');
  writeFileSync(join(source, 'scripts/bin/engine.exe'), 'machine-specific');
  assert.throws(() => assertSkillMirrors(root), /npm run setup/);
  assert.equal(syncSkillMirrors(root), 1);
  assert.equal(existsSync(join(root, '.github/skills')), false);
  assert.equal(existsSync(join(root, '.agent/skills')), false);
  assert.equal(existsSync(join(root, '.local/skill-mirrors.json')), true);
  assert.equal(existsSync(join(root, '.agents/skill-mirrors.json')), false);
  assertSkillMirrors(root);
  assert.equal(syncSkillMirrors(root, ['copilot', 'legacy-antigravity']), 2);
  assertSkillMirrors(root);
  assert.equal(syncSkillMirrors(root), 0);
  assert.equal(
    readFileSync(join(root, '.claude/skills/demo/references/detail.md'), 'utf8'),
    'supporting evidence\n',
  );
  assert.equal(existsSync(join(root, '.claude/skills/demo/scripts/bin/engine.exe')), false);
  writeFileSync(join(source, 'SKILL.md'), 'updated canonical instructions\n');
  rmSync(join(source, 'references/detail.md'));
  assert.throws(() => assertSkillMirrors(root), /stale/);
  assert.equal(syncSkillMirrors(root), 3);
  assert.equal(existsSync(join(root, '.claude/skills/demo/references/detail.md')), false);
  const mirror = join(root, '.claude/skills/demo/SKILL.md');
  writeFileSync(mirror, 'independent teammate edit\n');
  writeFileSync(join(source, 'SKILL.md'), 'new canonical update\n');
  assert.throws(() => syncSkillMirrors(root), /Independent edits preserved/);
  assert.equal(readFileSync(mirror, 'utf8'), 'independent teammate edit\n');
  assert.equal(
    readFileSync(join(root, '.github/skills/demo/SKILL.md'), 'utf8'),
    'updated canonical instructions\n',
  );
});
