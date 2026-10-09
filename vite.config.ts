import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' keeps the build portable across GitHub Pages, Netlify, and Cloudflare Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'eval/**/*.test.ts'] },
});
