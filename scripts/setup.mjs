import { copyFileSync, existsSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { root, git } from './lib/runtime.mjs';

const args = process.argv.slice(2);
if (args.some((arg) => arg !== '--hooks')) throw new Error('Usage: npm run setup [-- --hooks]');
if (!existsSync(join(root, '.env'))) copyFileSync(join(root, '.env.example'), join(root, '.env'));
if (process.platform !== 'win32') {
  // Windows checkouts cannot preserve executable bits before the scaffold is committed.
  chmodSync(join(root, '.agents/skills/impeccable/scripts/impeccable'), 0o755);
}
const config = join(root, '.gitconfig').replaceAll('\\', '/');
for (const key of ['pull.ff', 'fetch.prune', 'push.default', 'core.autocrlf']) {
  git('config', '--local', key, git('config', '--file', config, '--get', key));
}
if (args.includes('--hooks')) {
  let current = '';
  try {
    current = git('config', '--get', 'core.hooksPath');
  } catch {
    /* unset */
  }
  if (current && current !== '.githooks')
    throw new Error('Existing hooksPath preserved. Reconcile hooks before enabling .githooks.');
  git('config', '--local', 'core.hooksPath', '.githooks');
  if (process.platform !== 'win32') {
    for (const hook of ['pre-push', 'commit-msg']) chmodSync(join(root, '.githooks', hook), 0o755);
  }
}
console.log('Local .env prepared without overwrite; repository Git defaults applied.');
console.log(
  args.includes('--hooks')
    ? 'Optional pre-push validation and commit-message checks enabled.'
    : 'Hooks unchanged. Enable with npm run setup -- --hooks.',
);
