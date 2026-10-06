import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { treeDigest } from './repo-policy.mjs';

export const skillDestinations = {
  claude: '.claude/skills',
  copilot: '.github/skills',
  'legacy-antigravity': '.agent/skills',
};
export const isSkillMirror = (file) =>
  Object.values(skillDestinations).some((path) => file.startsWith(`${path}/`));

function inventory(folder) {
  if (!existsSync(folder)) return [];
  if (lstatSync(folder).isSymbolicLink())
    throw new Error(`Skill mirror directory must not be a symlink: ${folder}.`);
  const entries = readdirSync(folder, { withFileTypes: true });
  if (entries.some((entry) => !entry.isDirectory() || entry.isSymbolicLink()))
    throw new Error(`Only real skill directories belong in ${folder}.`);
  return entries.map((entry) => entry.name).sort();
}

function sourceState(root) {
  const names = inventory(join(root, '.agents/skills'));
  if (!names.length) throw new Error('Canonical skills are missing.');
  const skills = Object.fromEntries(
    names.map((name) => [name, treeDigest(join(root, '.agents/skills', name))]),
  );
  return { version: 1, skills };
}

function localManifest(root) {
  return join(root, '.local/skill-mirrors.json');
}

function readManifest(root) {
  const file = localManifest(root);
  if (!existsSync(file)) return null;
  const state = JSON.parse(readFileSync(file, 'utf8'));
  if (
    state.version !== 1 ||
    !Array.isArray(state.platforms) ||
    !state.platforms.includes('claude') ||
    state.platforms.some((platform) => !Object.hasOwn(skillDestinations, platform))
  )
    throw new Error('Invalid local skill manifest; inspect it before rebuilding generated copies.');
  return state;
}

export function assertSkillMirrors(root) {
  const expected = sourceState(root);
  const recorded = readManifest(root);
  if (!recorded)
    throw new Error('Run npm run setup once to bootstrap native skills for this checkout.');
  if (JSON.stringify(recorded.skills) !== JSON.stringify(expected.skills))
    throw new Error('Generated skills are stale; agent must run npm run skills:sync.');
  for (const [platform, destination] of Object.entries(skillDestinations)) {
    if (!recorded.platforms.includes(platform)) {
      if (existsSync(join(root, destination)))
        throw new Error(`Unregistered copies in ${destination}; run npm run setup.`);
      continue;
    }
    const names = inventory(join(root, destination));
    if (names.join('\0') !== Object.keys(expected.skills).join('\0'))
      throw new Error(`Incomplete or extra skills in ${destination}; run npm run skills:sync.`);
    for (const name of names)
      if (treeDigest(join(root, destination, name)) !== expected.skills[name])
        throw new Error(
          `Skill mirror differs: ${destination}/${name}. Edit canonical skills, then sync.`,
        );
  }
  return expected;
}

function payloadFiles(folder, prefix = '') {
  const files = [];
  for (const entry of readdirSync(join(folder, prefix), { withFileTypes: true })) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (path === 'scripts/bin') continue;
    if (entry.isSymbolicLink()) throw new Error('Skill symlinks are not portable.');
    if (entry.isDirectory()) files.push(...payloadFiles(folder, path));
    else files.push(path);
  }
  return files;
}

export function syncSkillMirrors(root, requested = []) {
  const expected = sourceState(root);
  const previous = readManifest(root);
  if (requested.some((platform) => !Object.hasOwn(skillDestinations, platform)))
    throw new Error('Unknown skill export platform.');
  const platforms = [
    ...new Set([
      'claude',
      ...(previous?.platforms ?? []),
      ...Object.entries(skillDestinations)
        .filter(([, path]) => existsSync(join(root, path)))
        .map(([platform]) => platform),
      ...requested,
    ]),
  ].sort();
  const destinations = platforms.map((platform) => skillDestinations[platform]);
  const pending = [];
  for (const path of ['.local', '.agents', ...destinations]) {
    let cursor = root;
    for (const part of path.split('/')) {
      cursor = join(cursor, part);
      if (existsSync(cursor) && lstatSync(cursor).isSymbolicLink())
        throw new Error(`Skill destination must not follow a symlink: ${cursor}.`);
    }
  }
  // Preflight every destination before any writes. Never replace independent mirror edits.
  for (const destination of destinations) {
    const names = inventory(join(root, destination));
    if (names.some((name) => !(name in expected.skills)))
      throw new Error(`Extra/removed skill in ${destination} preserved; review it before syncing.`);
    for (const [name, digest] of Object.entries(expected.skills)) {
      const target = join(root, destination, name);
      if (existsSync(target)) {
        const actual = treeDigest(target);
        if (actual === digest) continue;
        if (previous?.version !== 1 || actual !== previous.skills?.[name])
          throw new Error(
            `Independent edits preserved in ${destination}/${name}; reconcile with canonical first.`,
          );
      }
      pending.push({ name, target });
    }
  }
  for (const { name, target } of pending) {
    const source = join(root, '.agents/skills', name);
    if (existsSync(target)) {
      const wanted = new Set(payloadFiles(source));
      for (const file of payloadFiles(target)) {
        if (wanted.has(file)) continue;
        const obsolete = resolve(target, file);
        const scope = relative(resolve(root), obsolete);
        if (
          scope.startsWith(`..${sep}`) ||
          scope === '..' ||
          !obsolete.startsWith(`${resolve(target)}${sep}`)
        )
          throw new Error('Generated file cleanup escaped the repository.');
        rmSync(obsolete); // only obsolete files in a verified, unchanged generated bundle
      }
    }
    mkdirSync(target, { recursive: true });
    cpSync(source, target, {
      recursive: true,
      filter: (path) => !path.replaceAll('\\', '/').includes('/scripts/bin'),
    });
  }
  mkdirSync(join(root, '.local'), { recursive: true });
  writeFileSync(localManifest(root), `${JSON.stringify({ ...expected, platforms }, null, 2)}\n`);
  assertSkillMirrors(root);
  return pending.length;
}
