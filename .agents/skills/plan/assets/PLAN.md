# PLAN.md: Sane

**Goal:** A web app (installable PWA) that checks a suspicious message (pasted, screenshot, or shared in; no inbox access), in English, Filipino or Taglish, and returns a risk level, highlighted red flags and what to do next. All AI runs in the browser. Works in airplane mode.

**Deadline:** 10:00 AM, Oct 10. No extensions.
**Feature freeze:** T+11 (about 3 hours before deadline). **Submit by:** T+14.
Times below are hours from start (T+0). Adjust if you start later than about 7 PM, and drop a cut-ladder rung for every 2 hours lost.

## Team roles (fill in)

- Builder A (pipeline + UI): ____
- Builder B (data + testing): ____
- Presenter / submission: ____

## Milestones

### M0: Setup (T+0 to T+1)

- [ ] Repo, Vite app, static host connected (GitHub Pages / Netlify / Cloudflare Pages)
- [ ] Folder structure from `skills/architecture`
- [ ] Verify model names on Hugging Face and the WebLLM list. Write chosen models in Decisions log
- [ ] Check demo laptop AND demo phone: browser version, WebGPU (`navigator.gpu`), storage space. Decide device tier (`skills/tech-stack`)
- [ ] Mobile-first base CSS at 360 px, viewport meta, bottom action bar skeleton (`skills/design-ux`)
      **Gate:** Blank app deployed at a public URL and opening correctly on a real phone.

### M1: Vertical slice, no AI models (T+1 to T+4)

- [ ] Paste box -> `analyze(text)` -> verdict card
- [ ] Rules engine: URL extraction, lookalike domains, OTP/PIN requests, urgency, money requests
- [ ] Scoring with 4 labels: Likely scam / Suspicious / Probably fine / Not sure
- [ ] Template explanations in English, Filipino, Taglish
- [ ] Highlight flagged phrases safely (no innerHTML)
      **Gate:** 10 sample messages give sensible verdicts with zero model downloads, on phone and laptop.

### M2: Local embeddings + archetypes (T+4 to T+7)

- [ ] Load multilingual-e5-small via Transformers.js in a Web Worker
- [ ] Embed archetypes once, cache in IndexedDB (`skills/data-eval/assets/archetypes.seed.json`)
- [ ] Cosine similarity -> top 3 archetypes; feed into scoring
- [ ] Model download progress UI
      **Gate:** Taglish paraphrase of a scam matches the right archetype in top 3 for at least 8 of 10 tries.

### M3: Offline + PWA (T+7 to T+8.5)

- [ ] Service worker caches app shell and model files
- [ ] Manifest, icons, installable on Android Chrome; iOS add-to-home-screen hint
- [ ] Download-size prompt before big model downloads on mobile
- [ ] "Offline ready" badge, live "network requests during scan: 0" counter
- [ ] (Cut-ladder item 1) Web Share Target handler per `.agents/skills/design-ux/references/share-target.md`, tested on a real Android phone
      **Gate:** Airplane mode on the phone, cold start from the home-screen icon, run 5 messages. Identical results to online.

### M4: OCR + LLM explanation (T+8.5 to T+11)

- [ ] Tesseract.js (eng + fil) for screenshots, in a worker
- [ ] WebLLM explanation with small model, behind a toggle; template fallback on any failure
- [ ] Prompt-injection guard (`skills/security-privacy`)
      **Gate:** 5 screenshots read correctly (or graceful "paste instead" message). LLM failure still yields a verdict.

### FREEZE at T+11. Only fixes and testing from here

### M5: Evaluation + demo prep (T+11 to T+13)

- [ ] Run 30-message test set (separate from archetypes). Record results with the report template
- [ ] Pick thresholds with the method in `.agents/skills/data-eval/references/metrics-and-parameters.md` before the freeze
- [ ] Fix only bugs and threshold tweaks
- [ ] Rehearse demo twice in airplane mode on the demo device
- [ ] Record a backup screen capture of a full run

### M6: Submission (T+13 to T+14)

- [ ] Disclosure table finalized
- [ ] "Why local" answer pasted
- [ ] Public URL tested from a clean browser profile
- [ ] Submit. Screenshot the confirmation

## Cut ladder (cut from top first)

1. Share Target
2. LLM-written explanation
3. LLM Filipino/Taglish wording
4. Screenshot OCR
5. Embedding similarity
   Never cut: rules engine, verdict UI, offline caching, zero-network proof, disclosure.

## Risks

| Risk                                   | Mitigation                                                       |
| -------------------------------------- | ---------------------------------------------------------------- |
| Phone too weak or no WebGPU            | Tier C: rules, OCR, embeddings, templates; LLM hidden on phones  |
| Mobile data drained by model download  | Size prompt, Wi-Fi advice, no auto LLM download                  |
| WebGPU missing on demo device          | Smaller model or skip LLM; templates still work                  |
| Model download too slow on venue Wi-Fi | Pre-cache on demo device the night before                        |
| OCR misreads screenshot                | Lead the demo with paste, show OCR as bonus                      |
| Small LLM writes awkward Tagalog       | Templates for headline and steps; LLM adds optional context only |
| Overclaiming accuracy                  | Report real test numbers; keep "Not sure" label                  |

## Decisions log

- (date/time) Decision: ____ Reason: ____
