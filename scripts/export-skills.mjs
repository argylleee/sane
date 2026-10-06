import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib/runtime.mjs';
import { treeDigest } from './lib/repo-policy.mjs';

const destinations = {
  claude: '.claude/skills',
  copilot: '.github/skills',
  'legacy-antigravity': '.agent/skills',
};
const [platform, ...requested] = process.argv.slice(2);
if (!destinations[platform])
  throw new Error(
    'Usage: npm run skills:export -- <claude|copilot|legacy-antigravity> [skill names]',
  );
const canonical = join(root, '.agents/skills');
const available = readdirSync(canonical, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);
const names = new Set(requested.length ? requested : available);
if (names.has('grill-me')) names.add('grilling');
for (const name of names) if (!available.includes(name)) throw new Error(`Unknown skill: ${name}`);
const destination = join(root, destinations[platform]);
// Preflight all targets before writes; reuse matching copies without replacing custom/stale work.
const pending = [];
for (const name of names) {
  const target = join(destination, name);
  if (existsSync(target)) {
    if (treeDigest(target) === treeDigest(join(canonical, name))) continue;
    throw new Error(
      `Changed or outdated ${platform}/${name} preserved. Review/remove your generated copy before exporting again.`,
    );
  }
  pending.push(name);
}
mkdirSync(destination, { recursive: true });
for (const name of pending) {
  cpSync(join(canonical, name), join(destination, name), {
    recursive: true,
    errorOnExist: true,
    force: false,
    filter: (path) => !path.replaceAll('\\', '/').includes('/scripts/bin'),
  });
}
console.log(
  `Ready: ${[...names].join(', ')} in ${destinations[platform]} (${pending.length} copied; matching existing copies skipped). Reload the tool and verify discovery. No hooks installed.`,
);
