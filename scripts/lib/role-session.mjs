import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { roles } from './coordination-policy.mjs';

function location(checkout, key) {
  if (typeof key !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,127}$/.test(key))
    throw new Error('Session key must be a host ID or fresh nonce, without path separators.');
  const root = realpathSync(checkout);
  return { root, file: join(root, '.local', 'agent-sessions', `${key}.json`) };
}

export function readSession(checkout, key) {
  const { root, file } = location(checkout, key);
  if (!existsSync(file)) return null;
  const state = JSON.parse(readFileSync(file, 'utf8'));
  if (
    state.version !== 1 ||
    state.session !== key ||
    state.checkout !== root ||
    typeof state.epoch !== 'string' ||
    !/^[a-f0-9-]{36}$/.test(state.epoch) ||
    !(state.role === null || roles.includes(state.role))
  )
    throw new Error('Session checkpoint does not match this chat/checkout or is malformed.');
  return state;
}

function save(checkout, key, state) {
  const { file } = location(checkout, key);
  mkdirSync(join(realpathSync(checkout), '.local', 'agent-sessions'), { recursive: true });
  writeFileSync(file, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
  return state;
}

export function beginSession(checkout, key) {
  return save(checkout, key, {
    version: 1,
    session: key,
    checkout: realpathSync(checkout),
    epoch: randomUUID(),
    role: null,
  });
}

export function activateRole(checkout, key, epoch, role) {
  if (!roles.includes(role)) throw new Error('Unknown role.');
  const state = readSession(checkout, key);
  if (!state || state.epoch !== epoch)
    throw new Error('Stale or missing session epoch; reactivate in the current chat.');
  return save(checkout, key, { ...state, role });
}

export function resetRole(checkout, key, epoch) {
  const state = readSession(checkout, key);
  if (!state || state.epoch !== epoch) throw new Error('Stale or missing session epoch.');
  return beginSession(checkout, key);
}

export function startSession(checkout, key, source) {
  if (!['startup', 'resume', 'clear', 'compact', 'fork'].includes(source))
    throw new Error('Unknown session source; do not infer an active role.');
  return ['startup', 'clear', 'fork'].includes(source)
    ? beginSession(checkout, key)
    : (readSession(checkout, key) ?? beginSession(checkout, key));
}

export function sessionContext(state) {
  const anchor = `Role session: ${state.session}; epoch: ${state.epoch}; checkout: ${state.checkout}.`;
  return state.role
    ? `${anchor} Active role: ${state.role}. Read .agents/skills/role-${state.role}/SKILL.md if needed; keep this role for this chat, including after compaction. Check the task's current allocation separately. This checkpoint grants no permissions.`
    : `${anchor} No role activated. Activate a role once from the user's role command or an explicitly delegated role packet. Do not inherit another chat/worktree's role. Keep this session/epoch anchor in compaction summaries.`;
}
