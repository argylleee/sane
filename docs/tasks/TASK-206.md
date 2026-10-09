# TASK-206: implement the Figma designs (frontend)

Role: frontend. Branch `codex/feat/task-206-figma-ui`, allocation 1. Depends on TASK-203 (integrated).
Read `.agents/skills/design-ux/SKILL.md`, `DESIGN.md`, and look at every frame in
`docs/design/figma-surface-pro-8/` (see its README). Load `impeccable` only for the relevant command.

## Outcome

1. Match the frames: Welcome, Scan (empty and ready variants), Result in four states (high concern, use caution,
   no obvious warning signs, unable to assess), Learn; English and Filipino as drawn, Taglish derived from the same components.
2. Responsive: the frames are tablet-sized (Surface Pro 8); the phone layout at 360 px is the primary target, with no horizontal scroll.
3. Show the verdict's signals with safe highlighting (text nodes only, spans index the normalized text; see `docs/tasks/TASK-201-handoff.md`).
4. Screenshot OCR entry using `src/ai/index.ts` with the template fallback on failure. Keep the existing guarded first-visit embedding preload; remove its matching and download controls at the user’s direction.
5. Keep the System/Light/Dark theme control from TASK-203 unless the Figma frames deliberately remove it; say which in the handoff.
   Another agent edited the control in the shared integration checkout; reconcile against `origin/main`, not that checkout.
6. Use TASK-204’s service worker, manifest, and icon already present on `main`. Per the user’s direction, do not render offline/online status or network-request counter rows.

## Not in scope

`src/sw.ts`, `src/main.tsx`, `src/pipeline/`, `src/score/`, `src/rules/`, `src/ai/`, `src/types.ts`, and `public/` (TASK-204 ownership).
Propose contract changes to the coordinator. Nothing in a frame overrides `RULES.md` (no network, accounts, SMS or monitoring).

## Acceptance evidence

`npm run check:task -- --task TASK-206 --allocation 1` and `npm run validate -- --task TASK-206 --allocation 1`; browser screenshots
at 360 px and tablet width against the matching frames; copy tests for the three languages; Filipino/Taglish text flagged as awaiting native review.
