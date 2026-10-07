import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lib/runtime.mjs';
import { treeDigest, vendorNames } from './lib/repo-policy.mjs';

const path = join(root, '.agents/vendor.json');
const manifest = JSON.parse(readFileSync(path, 'utf8'));
for (const name of vendorNames)
  manifest.skills[name].sha256 = treeDigest(join(root, '.agents/skills', name));
for (const [folder, asset] of Object.entries(manifest.assets ?? {}))
  asset.sha256 = treeDigest(join(root, folder));
writeFileSync(path, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(
  'Recorded vendored payload digests. Review source, license, versions, and diff before accepting updates.',
);
