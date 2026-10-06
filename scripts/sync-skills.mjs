import { root } from './lib/runtime.mjs';
import { syncSkillMirrors } from './lib/skill-mirrors.mjs';

try {
  if (process.argv.length > 2) throw new Error('Usage: npm run skills:sync');
  const count = syncSkillMirrors(root);
  console.log(
    `Team skill mirrors synchronized (${count} bundles updated). Commit them with the canonical changes. No runtime binaries or hooks copied.`,
  );
} catch (error) {
  console.error(`Skill sync stopped: ${error.message}`);
  process.exitCode = 1;
}
