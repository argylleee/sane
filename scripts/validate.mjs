import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root, repoFiles, runScript } from './lib/runtime.mjs';
import { applicationScripts } from './lib/repo-policy.mjs';

try {
  const args = process.argv.slice(2);
  if (args.length) runScript('check:task', args);
  const config = JSON.parse(readFileSync(join(root, 'validation.config.json'), 'utf8'));
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const app = applicationScripts(config, pkg, repoFiles());
  for (const name of ['check:repo', 'format:check', 'lint', 'test:tooling', ...app])
    runScript(name);
  if (!app.length)
    console.log(
      '\nFoundation passed. Application lint/typecheck/tests/build are NOT configured; no stack selected.',
    );
  else console.log('\nFoundation and configured application checks passed.');
} catch (error) {
  console.error(`\nValidation stopped: ${error.message}`);
  process.exitCode = 1;
}
