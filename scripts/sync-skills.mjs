import { root } from './lib/runtime.mjs';
import { syncSkillMirrors } from './lib/skill-mirrors.mjs';

try {
  if (process.argv.length > 2) throw new Error('Usage: npm run skills:sync');
  const count = syncSkillMirrors(root);
  console.log(
    `Local native skills synchronized (${count} bundles updated). Commit canonical changes only. No runtime binaries or hooks copied.`,
  );
} catch (error) {
  console.error(`Skill sync stopped: ${error.message}`);
  process.exitCode = 1;
}
