import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '.agents/skills/**',
      '.worktrees/**',
      '.local/**',
      '.cache/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '.impeccable/**',
      '.claude/skills/**',
      '.github/skills/**',
      '.agent/skills/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
];
