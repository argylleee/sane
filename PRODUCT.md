# Sane product brief

<!-- impeccable:product-schema 1 -->

## Platform

android

The intended interaction/design platform is Android. Implementation uses a Capacitor APK with
a web-rendered React interface; Android conventions and applicable semantic-web accessibility
both apply. This metadata is a design target, not a claim of native-rendered UI or tested support.

## Stack

Proposed direction: React/Vite/TypeScript UI, Capacitor Android packaging, native Java monitoring
and shared analysis, Python/scikit-learn model development. Exact compatible versions and
phone/OS support are pending first implementation verification.

## Product purpose

Status: confirmed purpose and proposed implementation, October 9, 2026. No working app,
tested model, validated accuracy, or enabled monitoring is implied by this file.

Sane helps Android users detect scam-related Filipino and English messages through
manual paste and automatic SMS/selected-chat monitoring, with inference on the receiving device.
The user sees evidence, uncertainty, and a protective next step before acting on a message.

Primary audience: Filipino Android users who need understandable guidance around credential
requests, financial threats, delivery scams, rewards requiring fees, and payment impersonation.
Older adults and less technical users need clear words, legible controls, and recoverable setup.

Scan a message or understand an automatic warning; monitoring must remain visible and its
readiness truthful. Visual direction and surface mode live in DESIGN.md.

## Required experience

- Scan: paste text, analyze locally, understand the result, check another message.
- Monitoring: consent, separate SMS/chat/alert states, selected supported apps, pause/resume,
  recent minimal warning summaries, and setup recovery after returning from Android Settings.
- Result: concern level, observed indicators, model assessment, coverage limit, protective action.
- Learn: bundled concise safety guidance. No login, full inbox, cloud chatbot, or raw-message history.

Filipino and English are required for detection and UI presentation, with independent evidence.
The desired APK bundles assets for offline relaunch. Automatic chat analysis only sees notification
text Android exposes; no all-app/all-message promise. The app warns rather than blocks or replies.

See [scope](docs/planning/scope.md), [architecture](docs/planning/architecture.md), and
[design](DESIGN.md). The older attached proposal's deferred monitoring is superseded by user scope.
