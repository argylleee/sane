import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, git } from './lib/runtime.mjs';
import { assertTaskScope } from './lib/coordination-policy.mjs';

try {
  const args = process.argv.slice(2);
  const options = new Map();
  for (let i = 0; i < args.length; i += 2) {
    if (
      !['--task', '--allocation', '--registry'].includes(args[i]) ||
      !args[i + 1] ||
      options.has(args[i])
    )
      throw new Error(
        'Usage: npm run check:task -- --task ID --allocation N [--registry coordinator/path/coordination.json]',
      );
    options.set(args[i], args[i + 1]);
  }
  if (!options.has('--task') || !options.has('--allocation'))
    throw new Error('Task ID and allocation receipt are required.');
  const registry = resolve(root, options.get('--registry') ?? 'coordination.json');
  const config = JSON.parse(readFileSync(registry, 'utf8'));
  const id = options.get('--task');
  const allocation = Number(options.get('--allocation'));
  const task = assertTaskScope(config, id, allocation, []);
  if (git('branch', '--show-current') !== task.branch)
    throw new Error('Worker branch differs from the allocation.');
  // The base must belong to this history; never compare against an unrelated checkout.
  git('merge-base', '--is-ancestor', task.baseRevision, 'HEAD');
  const names = (args) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const changed = [
    ...new Set([
      ...names(['diff', '--name-only', '--no-renames', '-z', task.baseRevision]),
      ...names(['diff', '--cached', '--name-only', '--no-renames', '-z', task.baseRevision]),
      ...names(['ls-files', '--others', '--exclude-standard', '-z']),
    ]),
  ];
  assertTaskScope(config, id, allocation, changed);
  console.log(
    `${id} allocation ${allocation}: ${changed.length} changed files within ownership. Registry: ${registry}`,
  );
  console.log(
    'This checks an allocation snapshot; coordinator freshness and remote-resource enforcement remain required.',
  );
} catch (error) {
  console.error(`Task scope rejected: ${error.message}`);
  process.exitCode = 1;
}
