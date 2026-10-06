import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../../', import.meta.url));

export function git(...args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

export function repoFiles() {
  const output = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    {
      cwd: root,
      encoding: 'utf8',
    },
  );
  return [...new Set(output.split('\0').filter(Boolean))];
}

export function runScript(name, args = []) {
  const cli = process.env.npm_execpath;
  if (!cli) throw new Error('Run through npm: npm run validate. npm_execpath is unavailable.');
  console.log(`\n> ${name}`);
  const result = spawnSync(
    process.execPath,
    [cli, 'run', name, ...(args.length ? ['--', ...args] : [])],
    {
      cwd: root,
      stdio: 'inherit',
      timeout: 5 * 60 * 1000,
      env: { ...process.env, npm_config_update_notifier: 'false' },
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${name} failed (exit ${result.status ?? result.signal}).`);
}
