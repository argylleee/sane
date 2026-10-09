---
name: demo-submission
description: Demo script, submission answers, disclosure table, judging-criteria mapping and judge Q&A for the Sane hackathon entry. Use whenever the user mentions demo, presentation, pitch, submission, form, disclosure, "why local", judging criteria, scoring, rehearsal, backup plan, README, or the deadline checklist, and before the final 3 hours of the build.
---

# Demo and submission

Half the score is usefulness and how real the Local AI is, so the demo should make both obvious in the first minute.

## The required answer: "Why does this product benefit from running AI locally?"

Use this version everywhere (form, README, pitch). Edit wording to your voice but keep the points.

> Scam messages contain the exact things scammers want: OTP codes, account numbers, names and links. Pasting them into a cloud chatbot to check them sends that data to someone else. Sane runs OCR, language matching and the explanation model on the user's own device, so the message never leaves it. It also works offline and in weak signal, costs nothing per check so people can check every suspicious text, and answers instantly. A cloud-only version would be slower, would cost money at scale, and would ask users to share the very data they are trying to protect.

Four reasons to keep visible in the UI and demo: **private, offline, free per check, instant.**

## Demo script (about 3 minutes)

1. **Hook (15 s):** "Every Filipino gets texts like this." Show a fake GCash lockout message.
2. **Check it (30 s):** paste, tap Check. Verdict, highlighted phrases, steps, in Taglish.
3. **Prove it is local (45 s):** point to the "Network requests: 0" counter. Switch the phone/laptop to airplane mode.
4. **Offline again (30 s):** check a Filipino message and a screenshot offline. Same quality.
5. **Honesty (20 s):** show a legit bank OTP message returning "No obvious warning signs," and say what the app is weaker at.
6. **Close (20 s):** the four reasons: private, offline, free, instant. Show the test numbers from the eval report.

If something fails live, switch to the recorded backup capture without apology and keep talking.

## Pre-demo checklist

- [ ] Models cached on the demo device. Opened once online, then verified in airplane mode
- [ ] Browser profile is clean and not in private mode (private mode may not keep cache)
- [ ] Battery charged, display sleep off, notifications silenced
- [ ] Example buttons loaded: one scam per language, one legit
- [ ] Backup: screen recording, and a second device with the app cached
- [ ] Localhost build available if venue Wi-Fi or hosting misbehaves
- [ ] Full run rehearsed twice with a timer

## Disclosure table (the rules require this)

| Item                                      | What it is                        | Where it runs         | License / note                                                |
| ----------------------------------------- | --------------------------------- | --------------------- | ------------------------------------------------------------- |
| Tesseract.js (+ eng, fil data)            | OCR                               | Browser (WASM)        | verify license                                                |
| Transformers.js + multilingual-e5-small   | Embeddings                        | Browser (WASM/WebGPU) | verify license                                                |
| WebLLM + chosen small LLM                 | Optional explanation              | Browser (WebGPU)      | verify license and attribution needs                          |
| Vite (+ React if used)                    | Build/UI                          | Build time / browser  | verify license                                                |
| Static host (name it)                     | Serves files only, no AI, no data | Cloud                 | Receives no user messages                                     |
| Hand-written archetypes, keywords, brands | Reference data                    | Shipped with app      | Human authored, AI-assisted drafting, native-speaker reviewed |
| AI-assisted development                   | Claude and similar                | Dev time only         | Allowed by the rules                                          |

Cloud AI APIs used in the core path: **none.** If you add an optional cloud feature, list it here and state that the core works without it.

## Rubric mapping

| Criterion                | Weight | Where to show it                                                                           |
| ------------------------ | ------ | ------------------------------------------------------------------------------------------ |
| Problem and usefulness   | 25%    | Philippine scam texts, daily use, clear target user, test numbers                          |
| Local AI implementation  | 25%    | Three on-device models, zero-network counter, airplane mode, "AI used on this device" line |
| Technical execution      | 20%    | Fallback ladder, rehearsed offline run, honest eval report                                 |
| Innovation               | 15%    | Private scam checking in Taglish that never sends the message anywhere                     |
| Product and demo quality | 15%    | Single clear screen, example buttons, calm demo flow                                       |

## Delivery vs inference (the "isn't a website cloud?" answer in full)

Two different things:

- **Delivery:** getting the app files and model files onto the device. Needs a network once.
- **Inference:** the AI analyzing a message. Happens inside the browser, on the user's device, and sends nothing out.
  Hosting a site is like downloading an app from a store. The rule is that core AI must work without depending entirely on a cloud AI API, and a static host serving files is not an AI API.
  How it works: first visit downloads the app and models, a service worker caches them, and afterwards the installed PWA opens from cache with no network, even in airplane mode. The host has no backend, database or AI, and never receives a message. Prove it with the Network tab showing zero requests during a check.
  **Say to judges:** "The site is just a static file host. After the first load, the models are cached in the browser, and every check runs on the device with zero network requests. Turn on airplane mode and it keeps working."
  **Be upfront:** the first load needs internet and a sizable download (model files can run from tens to a few hundred MB, more if you use a larger LLM). Pre-load the demo devices and show a progress bar so it does not look broken.

### Demo hosting options

1. Hosted URL, cached before the demo: easiest, then switch to airplane mode live.
2. Run from `localhost` on the laptop: no internet needed at all, removes hosting doubt, but judges cannot open it on their own phones.
3. Both: deploy to a static host for the submission link, and use the cached or localhost version live as the backup.

## "Automatic" claims (honest framing)

A web app cannot read the SMS inbox or react the moment a text arrives. Browsers block that on purpose. The nearest options are Web Share Target (share the SMS to the installed PWA, Android Chrome only) and the clipboard button. Say "share or copy a message to check it instantly," not "scans your inbox." The Web OTP API can read only OTP codes tied to a domain, so it does not help here.
**Pitch framing options:** "a scam checker for SMS and chat messages" (users copy or screenshot from their phone and check on a web page, more relatable), or "a web tool for checking suspicious messages" (avoids any confusion about phone development). Both are accurate, so choose by taste.

## Rules check before submitting

- [ ] Substantially built during the hackathon (commit history shows it)
- [ ] Meaningful AI inference runs locally
- [ ] Working product, demonstrated
- [ ] Models, APIs, frameworks and major tools disclosed
- [ ] Core function works without a cloud AI API
- [ ] "Why local" question answered
- [ ] Submitted before 10:00 AM Oct 10 (aim for 9:00 AM)

## Likely judge questions

- **"Isn't hosting a website cloud?"** The host only serves files. No message and no AI call goes to it. After the first load it works offline.
- **"How accurate is it?"** Quote the real eval numbers and the abstain behavior. Say it is strongest on common patterns. Metric definitions and follow-up answers: `.agents/skills/data-eval/references/metrics-and-parameters.md`.
- **"Why not train a classifier?"** Time and labeled data. Retrieval plus code rules is explainable and needs no training. A trained model is a clear next step.
- **"Can it read my SMS automatically?"** No. Browsers cannot read the inbox. It checks what you paste, copy or share, which is also why nothing is collected.
- **"What if the user's phone is weak?"** The rules and embeddings run on WASM. The LLM is optional and falls back to templates.
- **"What if the scam is brand new?"** It returns Not sure instead of guessing, and the rules still catch links and OTP requests.

## Submission copy (short blurb)

"Sane is a private scam checker for Filipinos. Paste, copy or share a suspicious text or screenshot in English, Filipino or Taglish and get a clear verdict and what to do next. OCR, language matching and explanations run on your own device, so your message never leaves it, and it keeps working offline."
