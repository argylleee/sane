# Implementation Plan: Mobile-first scan experience

**Feature**: `specs/task-203-mobile-ui-pwa`
**Task**: TASK-203, allocation 2
**Base**: `ba0ef625e6845fbdaaf9d10f22f6659cdc9c11d5`

## Technical Context

- **Stack**: Existing React 19, TypeScript, and Vite application. Do not add dependencies.
- **Domain contract**: Use `src/types.ts` and `analyze(input, { lang, useLLM: false })` unchanged.
- **Current state**: `src/ui/App.tsx` is a minimal text-check screen. `analyze` provides safe verdict fallbacks. OCR and archetype matching are currently stubs.
- **Persistent data**: Do not persist the message, file, verdict, clipboard contents, or theme preference. Language and theme selection remain in component state for this session.
- **Visual reference**: User-supplied Sane Figma frames and token inventory, plus the mobile-first constraints in `.agents/skills/design-ux`.
- **Ownership**: Implement only paths in TASK-203 allocation 2. Shared `index.html`, `src/types.ts`, package/config, pipeline, scoring, OCR, and model code remain unchanged.

## Design and Architecture

1. Keep the interaction local to `App` and a small set of UI helpers; add a dedicated localized copy module under `src/ui/` so English, Filipino, and Taglish strings are complete and easy to test.
2. Represent the user journey with explicit screen and operation states: welcome, scan, result, Learn; idle, analyzing, and recoverable error. Keep the message transient in React state.
3. Call the existing analyzer for pasted text and selected image input. Treat its returned `Verdict` as authoritative; show runtime model metadata honestly. The current OCR stub returns a safe `not_sure` result, so a selected image must display the paste-text recovery message rather than an invented extraction.
4. Render untrusted input with React text nodes only. Do not use HTML injection, visit detected URLs, or read clipboard content except from the Paste button handler.
5. Use CSS custom properties for the calm light palette and semantic risk states. Add a first-class dark color-scheme variant and reduced-motion behavior. Use inline SVG geometry for simple status/navigation icons rather than emoji.
6. Use one column on compact screens. At larger widths, preserve the supplied scan/result two-column composition within a centered readable measure. Keep touch targets at least 44 CSS pixels, input type at least 16px, and the primary action reachable on mobile.
7. Provide Scan and Learn navigation, a contextual result back/new-check action, labeled controls, visible focus, and polite live status/result regions.

## File Structure

- `src/ui/App.tsx`: localized welcome, scan, result, Learn states; analysis and input handling.
- `src/ui/copy.ts`: typed English, Filipino, and Taglish interface strings.
- `src/ui/copy.test.ts`: focused completeness and verdict-label checks.
- `src/styles.css`: responsive design tokens, theme, layout, focus, and reduced motion.
- `specs/task-203-mobile-ui-pwa/{spec,plan,tasks}.md`: SDD feature artifacts.
- `docs/tasks/TASK-203.md` and `docs/tasks/TASK-203-handoff.md`: assignment details and execution evidence.

## Implementation Sequence

1. Establish localized copy and typed mappings for verdict levels and screens.
2. Implement welcome and scan states, including controlled text entry, counter, explicit clipboard action, screenshot selection, and analysis loading/error behavior.
3. Implement result and Learn states, preserving uncertainty, model truth, original message text, and safe next actions.
4. Build the responsive visual system from the supplied frames, with mobile-first composition, dark mode, keyboard focus, touch target sizing, and reduced motion.
5. Make the welcome action prominent and add a localized System/Light/Dark theme picker that follows OS changes while System is selected.
6. Add focused copy/verdict UI tests; format owned files and run targeted tests/build.
7. Run the app and inspect at 320, 360, and 1280 CSS-pixel widths; exercise theme changes, welcome, scan, clipboard (where browser permission allows), a real local analysis, result recovery, and Learn.
8. Run the worker's scoped validation against the coordinator registry snapshot and repository `npm run validate`; review the final diff and report screenshot/OCR and real-phone limitations honestly.

## Risks and Boundaries

- OCR is not implemented in this allocation. The upload control must not promise OCR success; show the pipeline's safe fallback and a clear paste recovery.
- The model and pipeline are owned by parallel tasks and may change after this feature's base. Do not assume embeddings or model results; render only returned runtime state.
- Repository `index.html` is coordinator-owned. Its viewport meta tag lacks `viewport-fit=cover`; do not change it in this frontend scope. Request coordinator integration if a safe-area audit demonstrates the need.
- A real phone and Filipino-speaker review are not available in this task environment; browser checks are supplementary and cannot claim those gates.
