import assert from 'node:assert/strict';
import { test } from 'node:test';
import { assertCoordination, assertTaskScope, validScope } from '../lib/coordination-policy.mjs';

const task = (id, paths, extra = {}) => ({
  id,
  allocation: 1,
  role: 'frontend',
  owner: id,
  mode: 'write',
  status: 'active',
  allowedPaths: paths,
  writeResources: [],
  dependsOn: [],
  branch: `codex/feat/${id.toLowerCase()}`,
  worktree: id.toLowerCase(),
  baseRevision: 'a'.repeat(40),
  ...extra,
});
const registry = (...tasks) => ({ version: 1, sharedPaths: ['package.json', '.agents/'], tasks });

test('independent role allocations pass; parent/child and case-only file collisions fail', () => {
  assertCoordination(
    registry(task('TASK-001', ['src/ui/']), task('TASK-002', ['src/api/'], { role: 'backend' })),
  );
  for (const path of ['src/ui/page.tsx', 'SRC/UI/page.tsx']) {
    assert.throws(
      () => assertCoordination(registry(task('TASK-001', ['src/ui/']), task('TASK-002', [path]))),
      /overlapping file/,
    );
  }
  assertCoordination(
    registry(task('TASK-001', ['src/ui/page.tsx']), task('TASK-002', ['src/ui/pages.tsx'])),
  );
  assert.throws(
    () =>
      assertCoordination(
        registry(task('TASK-001', ['src/ui']), task('TASK-002', ['src/ui/page.tsx'])),
      ),
    /overlapping file/,
  );
});

test('shared configuration and broad refactors require integration ownership', () => {
  assert.throws(
    () => assertCoordination(registry(task('TASK-001', ['package.json']))),
    /integration ownership/,
  );
  assert.throws(
    () => assertCoordination(registry(task('TASK-001', ['PACKAGE.json']))),
    /integration ownership/,
  );
  assert.throws(
    () => assertCoordination(registry(task('TASK-001', ['.agents/skills/']))),
    /integration ownership/,
  );
  assertCoordination(registry(task('TASK-001', ['package.json'], { role: 'integration' })));
  for (const path of ['../src/', '/src/', 'C:/src/', 'src\\ui/', 'src/*', '.git/'])
    assert.equal(validScope(path), false);
});

test('distinct files cannot hide shared MCP or interface mutation collisions', () => {
  const resource = 'external:tracker:project:task-9';
  assert.throws(
    () =>
      assertCoordination(
        registry(
          task('TASK-001', ['src/ui/'], { writeResources: [resource] }),
          task('TASK-002', ['src/api/'], { role: 'backend', writeResources: [resource] }),
        ),
      ),
    /overlapping external/,
  );
});

test('blocked and ready writers retain claims; integrated writers release them', () => {
  for (const status of ['blocked', 'ready'])
    assert.throws(
      () =>
        assertCoordination(
          registry(task('TASK-001', ['src/ui/'], { status }), task('TASK-002', ['src/ui/'])),
        ),
      /overlapping file/,
    );
  assertCoordination(
    registry(
      task('TASK-001', ['src/ui/'], { status: 'integrated' }),
      task('TASK-002', ['src/ui/']),
    ),
  );
});

test('missing dependencies, cycles, and starting before integration are rejected', () => {
  assert.throws(
    () => assertCoordination(registry(task('TASK-001', ['src/ui/'], { dependsOn: ['TASK-404'] }))),
    /unknown/,
  );
  assert.throws(
    () =>
      assertCoordination(
        registry(
          task('TASK-001', ['src/ui/'], { status: 'planned', dependsOn: ['TASK-002'] }),
          task('TASK-002', ['src/api/'], { status: 'planned', dependsOn: ['TASK-001'] }),
        ),
      ),
    /cycle/,
  );
  assert.throws(
    () =>
      assertCoordination(
        registry(
          task('TASK-001', ['src/api/'], { role: 'backend', status: 'ready' }),
          task('TASK-002', ['src/ui/'], { dependsOn: ['TASK-001'] }),
        ),
      ),
    /prerequisites/,
  );
});

test('read tasks do not reserve writes; writers need distinct worktree slots', () => {
  assertCoordination(registry(task('TASK-001', [], { mode: 'read' })));
  assert.throws(
    () => assertCoordination(registry(task('TASK-001', ['src/ui/'], { mode: 'read' }))),
    /read-only/,
  );
  assert.throws(
    () =>
      assertCoordination(
        registry(
          task('TASK-001', ['src/ui/']),
          task('TASK-002', ['src/api/'], { worktree: 'task-001' }),
        ),
      ),
    /share branch\/worktree/,
  );
});

test('worker checks reject stale receipts and additions/deletions outside ownership', () => {
  const config = registry(task('TASK-001', ['src/ui/']));
  assertTaskScope(config, 'TASK-001', 1, ['src/ui/page.tsx']);
  assert.throws(() => assertTaskScope(config, 'TASK-001', 2, []), /Stale/);
  assert.throws(() => assertTaskScope(config, 'TASK-001', 1, ['src/api/old.ts']), /Outside/);
  assert.throws(() => assertTaskScope(config, 'TASK-404', 1, []), /not an active/);
});
