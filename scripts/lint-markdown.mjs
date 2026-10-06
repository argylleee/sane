import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { lint } from 'markdownlint/promise';
import { root, repoFiles } from './lib/runtime.mjs';
import { vendorNames } from './lib/repo-policy.mjs';

const files = repoFiles()
  .filter(
    (file) =>
      file.endsWith('.md') &&
      !vendorNames.some((name) => file.startsWith(`.agents/skills/${name}/`)),
  )
  .map((file) => join(root, file));
const config = JSON.parse(readFileSync(join(root, '.markdownlint.json'), 'utf8'));
const results = await lint({ files, config });
const issues = Object.entries(results).flatMap(([file, errors]) =>
  errors.map(
    (error) =>
      `${file}:${error.lineNumber} ${error.ruleNames[0]} ${error.ruleDescription}${error.errorDetail ? ` (${error.errorDetail})` : ''}`,
  ),
);
if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else
  console.log(`Markdown lint passed (${files.length} repository files; vendor bundles excluded).`);
