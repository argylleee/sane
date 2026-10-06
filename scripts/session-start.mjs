import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { root } from './lib/runtime.mjs';
import { startSession, sessionContext } from './lib/role-session.mjs';

try {
  const input = readFileSync(0, 'utf8');
  if (input.length > 64 * 1024) throw new Error('Session event exceeds the bounded input size.');
  const event = JSON.parse(input);
  if (event.hook_event_name !== 'SessionStart' || typeof event.cwd !== 'string')
    throw new Error('Expected a SessionStart event with a checkout.');
  const checkout = execFileSync('git', ['rev-parse', '--show-toplevel'], {
    cwd: event.cwd,
    encoding: 'utf8',
  }).trim();
  if (realpathSync(checkout) !== realpathSync(root))
    throw new Error('Hook and chat refer to different checkouts.');
  const state = startSession(root, event.session_id, event.source);
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: sessionContext(state),
      },
    }),
  );
} catch (error) {
  // A missing/invalid checkpoint must not silently select another session's role.
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `Role restoration unavailable: ${error.message} Activate a role in this chat before role-scoped work.`,
      },
    }),
  );
  process.exitCode = 1;
}
