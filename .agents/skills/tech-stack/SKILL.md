---
name: tech-stack
description: The single reference for every technology, library and model used in Sane, with candidate model options, rough sizes, device tiers for phones and laptops, and what to verify. Use whenever the user asks which tech, framework, library, model, OCR, embedding, LLM, hosting, version, size, or "what do we use for X", when choosing or swapping a model, when a phone struggles with performance, or when filling the disclosure table.
---

# Tech stack

Everything runs in the browser. Names, ids, sizes and browser support below are from memory and change often, so every row marked **verify** must be checked against the live model card, package page or docs before you commit to it.

## Core stack

| Layer      | Choice                                            | Why                                       | Alternatives                                                                 |
| ---------- | ------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| Build      | Vite                                              | Fast setup, static output                 | Plain HTML + ES modules (less setup, fewer features)                         |
| UI         | Plain TS, or React if the team is faster with it  | Small bundle matters on phones            | Preact, Svelte                                                               |
| Styling    | Hand-written CSS with variables, mobile-first     | No build dependency, tiny                 | Tailwind (fast, adds config)                                                 |
| OCR        | Tesseract.js, languages eng + fil                 | WASM, runs without WebGPU                 | Florence-2 OCR via Transformers.js (heavier, fancier)                        |
| Embeddings | Transformers.js + multilingual-e5-small           | Multilingual, handles English and Tagalog | A different small multilingual sentence model if sizes or quality disappoint |
| LLM        | WebLLM (WebGPU) with a small instruct model       | Optional explanation layer                | Transformers.js text generation on WASM (slower, no WebGPU needed)           |
| Storage    | IndexedDB + Cache Storage                         | Vectors, settings, model files            | None needed                                                                  |
| Offline    | Service worker (hand-written or Workbox)          | App shell and model caching               | Vite PWA plugin (verify)                                                     |
| Hosting    | GitHub Pages, Netlify, Vercel or Cloudflare Pages | Static, free tiers                        | Localhost for the live demo backup                                           |

## Model candidates

| Role       | Candidate                                                                                                         | Approx. size                                                | License note                                       | Notes                                 |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------- | ------------------------------------- |
| Embeddings | multilingual-e5-small (ONNX/quantized build for Transformers.js, often under the Xenova namespace, **verify id**) | roughly 100 to 500 MB depending on quantization, **verify** | MIT (verify)                                       | Needs `query:` / `passage:` prefixes  |
| OCR data   | Tesseract `eng` + `fil` traineddata                                                                               | a few MB each, **verify**                                   | Apache 2.0 (verify)                                | Cached after first load               |
| LLM small  | Qwen2.5 0.5B Instruct, q4 build in WebLLM's list (**verify id**)                                                  | a few hundred MB                                            | Apache 2.0 (verify)                                | Fastest, weakest Tagalog              |
| LLM medium | Llama 3.2 1B Instruct or Qwen2.5 1.5B Instruct, q4                                                                | several hundred MB to about 1 GB                            | Llama community license needs attribution (verify) | Better English, still limited Tagalog |
| LLM larger | Gemma-family 2B class or Llama 3.2 3B, q4, if on WebLLM's list                                                    | 1 to 2 GB or more                                           | check each card                                    | Laptop only, heavier download         |

Pick by testing 5 Taglish prompts on your actual demo device, not by reputation. Smaller is usually the safer demo.

## Device tiers (decide at runtime)

| Tier | Detected as                                                                  | Runs                                                  | Defaults                                               |
| ---- | ---------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| A    | WebGPU adapter available, plenty of memory (laptop or recent high-end phone) | Rules, OCR, embeddings, LLM 1B class                  | LLM toggle available, off until user opts in on mobile |
| B    | WebGPU available, limited memory                                             | Rules, OCR, embeddings, LLM 0.5B class                | LLM toggle with a warning about download size          |
| C    | No WebGPU (older phones, some iOS versions)                                  | Rules, OCR, embeddings on WASM, template explanations | LLM hidden                                             |

Detect with `navigator.gpu` and `navigator.deviceMemory` where available (it is not available everywhere, so treat missing as unknown and choose the smaller option). On phones, the verdict must never depend on the LLM.

## Browser support to check before the demo (verify all)

- WebGPU on your demo phone's browser and version
- Service worker and Cache Storage persistence in installed-PWA mode
- Web Share Target: Android Chrome only
- Clipboard read behavior (needs a user tap)
- IndexedDB and Cache quota on the demo device

## How the pieces stack (pipeline order)

Input -> OCR (screenshots only) -> rules engine -> embeddings and archetype match -> scoring -> LLM explanation (optional) -> UI. Rules, matching and scoring do most of the deciding. The LLM is the heaviest piece and sits last, so if it is slow or fails, a verdict still shows. Details in `skills/architecture`.

## Cost

Money cost is zero: Vite, React, Tesseract.js, Transformers.js, WebLLM, the models above, and free tiers of static hosts. Licenses differ in the fine print (for example Apache 2.0 and MIT are simplest, Llama needs attribution, some larger Qwen sizes use a more restrictive license), so read each model card and list it in the disclosure table. The real costs are on the device: download size, RAM and GPU, and first-load time. Pre-load demo devices and show a progress bar.

## Disclosure

Copy every row you actually ship into the table in `skills/demo-submission`. If you swap a model, update that table the same hour.

## Decision options when something is too heavy

1. Use a smaller LLM. Quick, small quality drop.
2. Make the LLM laptop-only and use templates on phones. Safest for mobile, less "AI-heavy" on the phone view.
3. Drop the LLM and lean on embeddings, rules and templates. Most reliable, lowest Local AI showpiece value.
   Pick based on what your demo device can run smoothly, and note the choice in the PLAN.md decisions log.
