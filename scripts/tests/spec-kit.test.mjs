import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cpSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('Spec Kit helpers resolve isolated feature context and reject missing task evidence', (context) => {
  const root = mkdtempSync(join(tmpdir(), 'hackathon-speckit-'));
  context.after(() => {
    const scope = relative(resolve(tmpdir()), resolve(root));
    assert.ok(
      scope.startsWith('hackathon-speckit-') && !scope.includes('/') && !scope.includes('\\'),
    );
    rmSync(root, { recursive: true });
  });
  const source = fileURLToPath(new URL('../../.specify/', import.meta.url));
  mkdirSync(join(root, '.specify'));
  for (const folder of ['scripts', 'templates', 'presets'])
    cpSync(join(source, folder), join(root, '.specify', folder), { recursive: true });
  const feature = join(root, 'specs/demo');
  mkdirSync(feature, { recursive: true });
  writeFileSync(
    join(root, '.specify/feature.json'),
    JSON.stringify({ feature_directory: 'specs/demo' }),
  );
  for (const name of ['spec', 'plan', 'tasks'])
    writeFileSync(join(feature, `${name}.md`), `# ${name}\n`);
  const windows = process.platform === 'win32';
  const script = windows
    ? '.specify/scripts/powershell/check-prerequisites.ps1'
    : '.specify/scripts/bash/check-prerequisites.sh';
  const command = windows ? 'pwsh' : 'bash';
  const args = windows
    ? ['-NoProfile', '-File', script, '-Json', '-RequireSpec', '-RequireTasks', '-IncludeTasks']
    : [script, '--json', '--require-spec', '--require-tasks', '--include-tasks'];
  const run = () =>
    spawnSync(command, args, {
      cwd: root,
      encoding: 'utf8',
      timeout: 30000,
      env: { ...process.env, SPECIFY_INIT_DIR: root, SPECIFY_FEATURE: '' },
    });
  const result = run();
  assert.equal(result.status, 0, result.error?.message ?? result.stderr);
  const output = JSON.parse(result.stdout);
  assert.equal(resolve(output.FEATURE_DIR), resolve(feature));
  assert.ok(output.AVAILABLE_DOCS.includes('tasks.md'));
  rmSync(join(feature, 'tasks.md'));
  const missing = run();
  assert.notEqual(missing.status, 0);
  assert.match(`${missing.stdout}${missing.stderr}`, /tasks\.md/);
});
