import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve, relative } from 'node:path';
import { parse } from 'yaml';
import { root, repoFiles, git } from './lib/runtime.mjs';
import { assertBranch } from './lib/git-conventions.mjs';
import { assertCoordination } from './lib/coordination-policy.mjs';
import {
  applicationScripts,
  isPrivateFile,
  isStructuredFile,
  treeDigest,
  vendorNames,
} from './lib/repo-policy.mjs';

const errors = [];
const files = repoFiles();
const read = (path) => readFileSync(join(root, path), 'utf8');
const required = [
  'README.md',
  'AGENTS.md',
  '.env.example',
  'package-lock.json',
  'validation.config.json',
  '.github/workflows/ci.yml',
  '.github/pull_request_template.md',
  'docs/planning/guidelines.md',
  'docs/planning/scope.md',
  'docs/planning/architecture.md',
  'docs/planning/tasks.md',
  'docs/planning/decisions.md',
  'docs/planning/demo.md',
  'docs/planning/context.md',
  'PRODUCT.md',
  'DESIGN.md',
  '.agents/vendor.json',
  'coordination.json',
];
for (const file of required) if (!existsSync(join(root, file))) errors.push(`Missing ${file}`);

for (const file of files) {
  if (isPrivateFile(file)) errors.push(`Private file is visible to Git: ${file}`);
  if (!existsSync(join(root, file))) continue; // deletion may be pending; required paths checked above
  if (isStructuredFile(file)) {
    try {
      if (extname(file) === '.json') JSON.parse(read(file));
      else parse(read(file), { uniqueKeys: true });
    } catch (error) {
      errors.push(`Invalid structured file ${file}: ${error.message}`);
    }
  }
  if (
    !file.endsWith('.md') ||
    vendorNames.some((name) => file.startsWith(`.agents/skills/${name}/`))
  )
    continue;
  for (const match of read(file).matchAll(/!?\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    const path = resolve(root, dirname(file), decodeURIComponent(target));
    const rel = relative(root, path);
    if (rel.startsWith('..') || !existsSync(path))
      errors.push(`Broken or external local link in ${file}: ${target}`);
  }
}

try {
  const branch = git('branch', '--show-current');
  if (branch && branch !== 'main') assertBranch(branch); // detached CI checkouts have no local branch
  assertCoordination(JSON.parse(read('coordination.json')));
  applicationScripts(
    JSON.parse(read('validation.config.json')),
    JSON.parse(read('package.json')),
    files,
  );
  const env = read('.env.example');
  for (const line of env.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    if (!/^[A-Z][A-Z0-9_]*=\s*$/.test(line))
      errors.push('.env.example must contain only comments and empty KEY= entries.');
  }
  const names = new Set();
  for (const entry of readdirSync(join(root, '.agents/skills'), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = `.agents/skills/${entry.name}/SKILL.md`;
    const text = read(file);
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw new Error(`Missing skill frontmatter: ${file}`);
    const meta = parse(match[1]);
    if (
      meta.name !== entry.name ||
      !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(meta.name) ||
      meta.name.length > 64 ||
      typeof meta.description !== 'string' ||
      !meta.description.trim() ||
      meta.description.length > 1024 ||
      names.has(meta.name)
    )
      throw new Error(`Invalid skill metadata: ${file}`);
    names.add(meta.name);
  }
  const vendor = JSON.parse(read('.agents/vendor.json'));
  for (const name of vendorNames) {
    const expected = vendor.skills[name]?.sha256;
    if (!expected || treeDigest(join(root, '.agents/skills', name)) !== expected) {
      errors.push(`Vendored ${name} changed. Review the update, then npm run vendor:record.`);
    }
  }
  if (!read('.agents/skills/grill-me/SKILL.md').includes('grilling'))
    errors.push('Review grill-me dependency wiring.');
} catch (error) {
  errors.push(error.message);
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exitCode = 1;
} else
  console.log(
    'Repository structure, local links, skill metadata, vendor integrity, and env hygiene passed.',
  );
