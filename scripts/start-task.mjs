import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { selectTasks } from './lib/task-start.mjs';

const usage = 'Usage: npm run task:start -- --role frontend|backend|model  (or --task TASK-ID)';

function run(cwd, command, args, options = {}) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', shell: false, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${command} ${args.join(' ')} failed: ${(result.stderr || '').trim()}`);
  return (result.stdout || '').trim();
}
const git = (cwd, ...args) => run(cwd, 'git', args);
const npm = (cwd, ...args) =>
  spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }).status === 0;

try {
  const args = process.argv.slice(2);
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    if (!['--task', '--role'].includes(args[i]) || !args[i + 1] || options.has(args[i]))
      throw new Error(usage);
    options.set(args[i], args[i + 1]);
  }
  const here = process.cwd();
  const common = resolve(here, git(here, 'rev-parse', '--git-common-dir'));
  const main = dirname(common); // main checkout; task worktrees live under its .worktrees/

  let registryText;
  const localRegistry = readFileSync(join(main, 'coordination.json'), 'utf8');
  try {
    git(main, 'fetch', 'origin', '--quiet');
    const remoteRegistry = git(main, 'show', 'origin/main:coordination.json');
    if (remoteRegistry !== localRegistry) {
      console.warn(
        'Local coordination.json differs from origin/main; using the local coordinator registry.',
      );
      registryText = localRegistry;
    } else {
      registryText = remoteRegistry;
    }
  } catch {
    console.warn('Could not read origin/main (offline?); using the local coordination.json.');
    registryText = localRegistry;
  }
  const config = JSON.parse(registryText);
  const tasks = selectTasks(config, { id: options.get('--task'), role: options.get('--role') });
  if (tasks.length === 0) {
    console.log(`No active write allocations for ${options.get('--role')}. Nothing to start.`);
  }

  for (const task of tasks) {
    const path = join(main, '.worktrees', task.worktree);
    if (!existsSync(path)) {
      const hasLocal =
        spawnSync('git', ['rev-parse', '--verify', '--quiet', task.branch], {
          cwd: main,
        }).status === 0;
      const hasRemote =
        spawnSync('git', ['rev-parse', '--verify', '--quiet', `origin/${task.branch}`], {
          cwd: main,
        }).status === 0;
      if (hasLocal) git(main, 'worktree', 'add', path, task.branch);
      else if (hasRemote)
        git(main, 'worktree', 'add', path, '-b', task.branch, `origin/${task.branch}`);
      else git(main, 'worktree', 'add', path, '-b', task.branch, task.baseRevision);
      console.log(`${task.id}: created worktree ${path} on ${task.branch}`);
    } else {
      console.log(`${task.id}: reusing worktree ${path}`);
    }
    if (git(path, 'branch', '--show-current') !== task.branch)
      throw new Error(`${path} is not on ${task.branch}; resolve it before starting ${task.id}.`);
    if (!existsSync(join(path, 'node_modules')) && !npm(path, 'ci', '--ignore-scripts'))
      throw new Error(`npm ci failed in ${path}.`);
    if (!npm(path, 'run', 'setup')) throw new Error(`npm run setup failed in ${path}.`);

    // Local, untracked registry snapshot so check:task works even when the base predates the allocation.
    const gitDir = resolve(path, git(path, 'rev-parse', '--git-dir'));
    mkdirSync(gitDir, { recursive: true });
    const snapshot = join(gitDir, 'coordination.snapshot.json');
    writeFileSync(snapshot, registryText);
    const check = `npm run check:task -- --task ${task.id} --allocation ${task.allocation} --registry "${snapshot}"`;
    try {
      execFileSync(
        process.execPath,
        [
          join(path, 'scripts', 'check-task.mjs'),
          '--task',
          task.id,
          '--allocation',
          String(task.allocation),
          '--registry',
          snapshot,
        ],
        { cwd: path, stdio: 'inherit' },
      );
    } catch {
      throw new Error(`Scope check failed for ${task.id}. Re-run: ${check}`);
    }
    console.log(
      `READY ${task.id} allocation ${task.allocation}\n  workspace: ${path}\n  recheck:   ${check}\n`,
    );
  }
} catch (error) {
  console.error(`Task start failed: ${error.message}`);
  process.exitCode = 1;
}
