import { readFileSync } from 'node:fs';
import { git } from './lib/runtime.mjs';
import { assertBranch, assertCommit } from './lib/git-conventions.mjs';

try {
  const [mode, value, ...extra] = process.argv.slice(2);
  if (extra.length) throw new Error('Too many arguments.');
  if (mode === 'commit-file' && value) assertCommit(readFileSync(value, 'utf8'));
  else if (mode === 'branch' && value) assertBranch(value);
  else if (mode === 'range' && value) {
    for (const revision of git('rev-list', '--no-merges', `${value}..HEAD`)
      .split('\n')
      .filter(Boolean))
      assertCommit(git('show', '-s', '--format=%B', revision));
  } else if (mode === 'ci' && !value) {
    if (process.env.PR_BRANCH) assertBranch(process.env.PR_BRANCH);
    const base = process.env.BASE_REVISION;
    if (base && !/^0+$/.test(base)) {
      if (!/^[a-f0-9]{40}(?:[a-f0-9]{24})?$/.test(base))
        throw new Error('Invalid CI base revision.');
      for (const revision of git('rev-list', '--no-merges', `${base}..HEAD`)
        .split('\n')
        .filter(Boolean))
        assertCommit(git('show', '-s', '--format=%B', revision));
    } else assertCommit(git('show', '-s', '--format=%B', 'HEAD'));
  } else throw new Error('Usage: check:git -- <branch NAME|commit-file PATH|range BASE|ci>');
  console.log('Git convention check passed.');
} catch (error) {
  console.error(`Git convention rejected: ${error.message}`);
  process.exitCode = 1;
}
