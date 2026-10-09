// Verifies public/models against its manifest. Usage: node scripts/verify-model.mjs
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(fileURLToPath(new URL('../', import.meta.url)), 'public/models');
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');

try {
  const manifest = JSON.parse(readFileSync(join(outDir, 'manifest.json'), 'utf8'));
  const dir = join(outDir, manifest.model);
  let checked = 0;
  for (const [name, file] of Object.entries(manifest.files)) {
    for (const item of file.parts ?? [{ name, sha256: file.sha256 }]) {
      const path = join(dir, item.name);
      if (!existsSync(path)) throw new Error(`Missing ${item.name}`);
      if (sha256(path) !== item.sha256)
        throw new Error(`${item.name} does not match the manifest (corrupt copy).`);
      checked += 1;
    }
  }
  console.log(`Hosted model OK: ${checked} files match the manifest.`);
} catch (error) {
  console.error(`Hosted model check failed: ${error.message}`);
  process.exitCode = 1;
}
