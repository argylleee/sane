import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib/runtime.mjs';
import { skillDestinations, syncSkillMirrors } from './lib/skill-mirrors.mjs';

const [platform, ...names] = process.argv.slice(2);
if (!Object.hasOwn(skillDestinations, platform))
  throw new Error(
    'Usage: npm run skills:export -- <claude|copilot|legacy-antigravity> [skill names]',
  );
const available = readdirSync(join(root, '.agents/skills'));
for (const name of names) if (!available.includes(name)) throw new Error(`Unknown skill: ${name}`);
const count = syncSkillMirrors(root, [platform]);
console.log(
  `${platform} skills ready (${count} bundles updated). Copies are generated locally; only canonical skills belong in commits.`,
);
