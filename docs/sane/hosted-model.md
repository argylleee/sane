# Hosted embedding model

The embedding model (`Xenova/multilingual-e5-small`, int8 ONNX, MIT upstream) is served from the app's own origin under `public/models/`
instead of from Hugging Face. This is faster, works offline after the first load, removes a third-party request, and keeps working if Hugging Face is slow or blocked.

## Why it is split

Vercel's Hobby plan rejects static files over 100 MB and the ONNX file is 118 MB, so `scripts/split-model.mjs` writes it as twelve 10 MiB parts plus `config.json`,
`tokenizer.json`, `tokenizer_config.json` and a `manifest.json` with a SHA-256 for every part. Total about 135 MB in the repository and the deployment.

## How it loads

`src/ai/hostedModel.ts` plugs into transformers.js as a custom cache. It streams the parts in order (four at a time), checks each part's size and SHA-256, and stores each verified part in the browser's
Cache Storage on its own. An interrupted download resumes with the missing parts, a later load needs no network, and the whole file is never held twice in memory. If the manifest is missing, a part is bad, or anything throws,
the loader deletes its stored copy and falls back to the normal Hugging Face download. The service worker ignores `/models/`.

## Measured (October 10, 2026)

- From this machine: Vercel (Singapore edge) about 5.7 MB/s, jsDelivr about 42 MB/s, Hugging Face about 0.05 MB/s (a 12 MB range request timed out after 3 MB in 60 s).
- Real Chrome, fresh profile, production build with no special settings: "AI check ready." about 5 seconds after the first load from a local server, instant on reload, and instant after going offline and reloading.
- Not measured: a real phone on a real mobile or venue network, Vercel's own delivery of these files, or memory use on a low-end phone.

## Integrity

- The manifest hashes equal Hugging Face's published LFS SHA-256 for the ONNX file and `tokenizer.json` (revision `761b726d`); `src/ai/hostedModel.integrity.test.ts` pins them and checks every file on disk.
- `node scripts/verify-model.mjs` checks `public/models` against the manifest. Run it, or the test suite, after any pull or copy.
- `public/models/** -text` in `.gitattributes` stops Git converting line endings, and the folder is in `.prettierignore`.
- While building this, three single-byte corruptions appeared on the coordinator's machine (a `tokenizer.json` copy and two `node_modules` files). All were caught by hash or by a build error. If a build fails with "stream did not contain valid UTF-8", reinstall that package.

## Regenerating

`node eval/probe.mjs` downloads the model into the local transformers cache (slow on a poor connection; copy the cache folder from a machine that already has it), then `node scripts/split-model.mjs` and `node scripts/verify-model.mjs`.
