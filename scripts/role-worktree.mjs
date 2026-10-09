import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { git, root } from './lib/runtime.mjs';

const ROLES = ['frontend', 'backend', 'model', 'integration'];

function branchExists(name) {
  try {
    git('rev-parse', '--verify', '--quiet', `refs/heads/${name}`);
    return true;
  } catch {
    return false;
  }
}

try {
  const args = process.argv.slice(2);
  let base = 'main';
  const requested = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--base' && args[i + 1]) base = args[++i];
    else if (ROLES.includes(args[i])) requested.push(args[i]);
    else throw new Error(`Use role:worktree -- [--base REF] [${ROLES.join('|')}]...`);
  }
  git('rev-parse', '--verify', `${base}^{commit}`);
  const roles = requested.length ? [...new Set(requested)] : ROLES;
  for (const role of roles) {
    const branch = `codex/chore/role-${role}`;
    const path = join(root, '.worktrees', `role-${role}`);
    if (existsSync(path)) {
      console.log(`${role}: worktree exists at ${path}; left untouched.`);
      continue;
    }
    if (branchExists(branch)) git('worktree', 'add', path, branch);
    else git('worktree', 'add', path, '-b', branch, base);
    console.log(`${role}: ${branch} -> ${path} (base ${base})`);
  }
  console.log(
    'Next in each worktree: npm ci --ignore-scripts; npm run setup; then activate the role per docs/role-sessions.md.',
  );
} catch (error) {
  console.error(`Role worktree rejected: ${error.message}`);
  process.exitCode = 1;
}
