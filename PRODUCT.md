# Sane product brief

<!-- impeccable:product-schema 1 -->

## Platform

web

A responsive, mobile-first website installable as a PWA. Designed at 360 px first. Android Chrome
adds Web Share Target once installed; iOS Safari uses paste. This metadata is a design target,
not a claim of tested support.

## Stack

React, Vite, and TypeScript. In-browser OCR (Tesseract.js), embeddings (Transformers.js), and an
optional small LLM (WebLLM). No training, fine-tuning, or labeling (D-10). See
[architecture](docs/planning/architecture.md) and `RULES.md`.

## Product purpose

Status: confirmed purpose, October 9, 2026 (D-10, D-12). No tested model or validated accuracy is
implied by this file.

Sane helps Filipino users check a suspicious message before acting on it. The user pastes text,
uploads a screenshot, or shares a message to the installed PWA. Analysis runs in the browser, so the
message never leaves the device. The user sees evidence, uncertainty, and a protective next step.

Sane does not read SMS or chat apps, does not monitor incoming messages, and does not run in the
background. Web Share Target is the closest to automatic: the user shares one message at a time.

Primary audience: Filipino users who need understandable guidance around credential requests,
financial threats, delivery scams, rewards requiring fees, and payment impersonation. Older adults
and less technical users need clear words and legible controls.

## Required experience

- Scan: paste, type, upload a screenshot, or share in. Analyze locally, read the result, check another.
- Result: risk badge, observed indicators, matched pattern, coverage limit, protective next step.
- Learn: bundled concise safety guidance. No login, inbox access, cloud chatbot, or message history.

English, Filipino, and Taglish are required for input and copy. Assets are cached for offline use
after first load. The app warns; it never blocks, deletes, or replies to messages.

See [scope](docs/planning/scope.md) (superseded history), [decisions](docs/planning/decisions.md),
and [design](DESIGN.md).
