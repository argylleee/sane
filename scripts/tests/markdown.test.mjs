import assert from 'node:assert/strict';
import { test } from 'node:test';
import { lint } from 'markdownlint/promise';

test('Markdown lint rejects malformed headings and accepts math with the patched dependency', async () => {
  const result = await lint({
    strings: {
      good: '# Math\n\nInline $x^2$ and a block:\n\n$$\nx^2 + y^2 = 1\n$$\n',
      bad: '#Missing space\n',
    },
  });
  assert.equal(result.good.length, 0);
  assert.ok(result.bad.some((error) => error.ruleNames.includes('MD018')));
});
