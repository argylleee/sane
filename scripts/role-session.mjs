import { randomUUID } from 'node:crypto';
import { root } from './lib/runtime.mjs';
import {
  activateRole,
  beginSession,
  readSession,
  resetRole,
  sessionContext,
} from './lib/role-session.mjs';

try {
  const [mode, ...args] = process.argv.slice(2);
  const role = mode === 'activate' ? args.shift() : null;
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--session', '--epoch'].includes(args[i]) || !args[i + 1] || options.has(args[i]))
      throw new Error(
        'Use role:session -- <begin|status|reset|activate ROLE> --session KEY [--epoch EPOCH].',
      );
    options.set(args[i], args[i + 1]);
  }
  const key = options.get('--session') ?? (mode === 'begin' ? randomUUID() : null);
  let state;
  if (mode === 'begin') state = beginSession(root, key);
  else if (mode === 'status') state = readSession(root, key);
  else if (mode === 'activate') state = activateRole(root, key, options.get('--epoch'), role);
  else if (mode === 'reset') state = resetRole(root, key, options.get('--epoch'));
  else throw new Error('Unknown role session operation.');
  if (!state) throw new Error('No checkpoint for this chat; activate the role again.');
  console.log(sessionContext(state));
} catch (error) {
  console.error(`Role session rejected: ${error.message}`);
  process.exitCode = 1;
}
