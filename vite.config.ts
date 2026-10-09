import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Serve and bundle the onnxruntime-web WASM files ourselves so no check or model load fetches a
// public CDN (zero-network and offline requirement). The embedding code loads them from ort/.
const ORT_FILES = [
  'ort-wasm-simd-threaded.asyncify.mjs',
  'ort-wasm-simd-threaded.asyncify.wasm',
  'ort-wasm-simd-threaded.mjs',
  'ort-wasm-simd-threaded.wasm',
];

function onnxRuntimeAssets(): Plugin {
  const dist = dirname(createRequire(import.meta.url).resolve('onnxruntime-web'));
  const types: Record<string, string> = { '.wasm': 'application/wasm', '.mjs': 'text/javascript' };
  return {
    name: 'sane-onnx-runtime-assets',
    configureServer(server) {
      server.middlewares.use('/ort/', (req, res, next) => {
        const name = (req.url ?? '').split('?')[0].replace(/^\//, '');
        if (!ORT_FILES.includes(name)) return next();
        res.setHeader('Content-Type', types[name.slice(name.lastIndexOf('.'))]);
        res.end(readFileSync(join(dist, name)));
      });
    },
    generateBundle() {
      for (const name of ORT_FILES) {
        this.emitFile({
          type: 'asset',
          fileName: `ort/${name}`,
          source: readFileSync(join(dist, name)),
        });
      }
    },
  };
}

// base './' keeps the build portable across GitHub Pages, Netlify, and Cloudflare Pages.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), onnxRuntimeAssets()],
  test: { environment: 'node', include: ['src/**/*.test.ts', 'eval/**/*.test.ts'] },
});
