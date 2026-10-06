import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { assertBranch, assertCommit } from '../lib/git-conventions.mjs';
import { activateRole, readSession, resetRole, startSession } from '../lib/role-session.mjs';

test('Git conventions accept scoped changes and reject ambiguous or malformed names', () => {
  assertBranch('codex/feat/task-001-demo-screen');
  assertBranch('codex/chore/repo-foundation');
  for (const branch of ['feature/demo', 'codex/feat/TASK-001', 'codex/fix/task_001', 'main'])
    assert.throws(() => assertBranch(branch));
  assertCommit('feat(frontend): add demo screen\n\nRefs: TASK-001');
  assertCommit('fix(api)!: remove obsolete payload\n\nBREAKING CHANGE: callers must use v2');
  for (const message of [
    'update files',
    'fix: repair crash.',
    `feat: ${'x'.repeat(73)}`,
    'fix: repair crash\nMissing separator',
    'feat!: change contract',
  ])
    assert.throws(() => assertCommit(message));
});

test('role survives compaction/resume but clear, new chats, and forks start inactive', (context) => {
  const base = mkdtempSync(join(tmpdir(), 'hackathon-role-'));
  context.after(() => {
    assert.ok(
      resolve(base).startsWith(
        `${resolve(tmpdir())}/hackathon-role-`.replaceAll(
          '/',
          process.platform === 'win32' ? '\\' : '/',
        ),
      ),
    );
    rmSync(base, { recursive: true });
  });
  const state = startSession(base, 'chat-1', 'startup');
  activateRole(base, 'chat-1', state.epoch, 'frontend');
  assert.equal(startSession(base, 'chat-1', 'compact').role, 'frontend');
  assert.equal(startSession(base, 'chat-1', 'resume').role, 'frontend');
  assert.equal(startSession(base, 'chat-2', 'startup').role, null);
  assert.equal(startSession(base, 'chat-fork', 'fork').role, null);
  const cleared = startSession(base, 'chat-1', 'clear');
  assert.equal(cleared.role, null);
  assert.notEqual(cleared.epoch, state.epoch);
  assert.throws(() => activateRole(base, 'chat-1', state.epoch, 'frontend'), /Stale/);
  activateRole(base, 'chat-1', cleared.epoch, 'backend');
  assert.equal(resetRole(base, 'chat-1', cleared.epoch).role, null);
  assert.throws(() => readSession(base, '../escape'));
  assert.throws(() => startSession(base, 'chat-1', 'unknown'));
  const different = join(base, 'other-checkout');
  mkdirSync(join(different, '.local', 'agent-sessions'), { recursive: true });
  assert.equal(startSession(different, 'chat-1', 'compact').role, null);
  const copied = join(different, '.local', 'agent-sessions', 'chat-1.json');
  writeFileSync(copied, readFileSync(join(base, '.local', 'agent-sessions', 'chat-1.json')));
  assert.throws(() => readSession(different, 'chat-1'), /checkout/);
});
