# Feature Specification: Mobile-first scan experience

**Feature Branch**: `codex/feat/task-203-mobile-ui-pwa`
**Created**: 2026-10-09
**Status**: Implemented
**Task**: TASK-203, allocation 2
**Input**: Implement the supplied Sane welcome, scan, result, and Learn designs in the existing React/Vite PWA.

## Overview

Build the user-facing manual message-check journey around the existing `analyze` interface. Preserve the supplied calm green and warm-neutral visual direction while adapting its desktop frames to a mobile-first responsive web layout. English, Filipino, and Taglish are selectable. User messages remain in component memory only and render as text.

This feature does not claim validated accuracy, complete offline behavior, or working OCR. Screenshot selection must report the current OCR limitation honestly; it must not display a successful extraction or verdict for text the app could not read.

## User Scenarios & Testing

### User Story 1 - Start and choose a language (Priority: P1)

A first-time user sees what Sane does, chooses English, Filipino, or Taglish, and opens the manual scan screen.

**Independent Test**: Load the app, choose each language, start a check, and verify the visible navigation, labels, and instructions use that language.

**Acceptance Scenarios**:

1. **Given** a fresh app session, **When** the welcome screen loads, **Then** it explains manual checking and on-device processing without claiming validated accuracy.
2. **Given** the welcome screen, **When** the user selects a language, **Then** the selected option is announced and visibly distinct.
3. **Given** a selected language, **When** the user starts a check, **Then** the scan screen opens with the same language selected.
4. **Given** the welcome screen, **When** the user looks for the primary action, **Then** Start manual check is prominent, full width, and at least 60 CSS pixels tall.

### User Story 2 - Check a pasted message (Priority: P1)

A user pastes or types a suspicious message and requests an assessment.

**Independent Test**: Enter representative suspicious, ambiguous, and ordinary text; run the existing `analyze` function and inspect the result state.

**Acceptance Scenarios**:

1. **Given** an empty input, **When** the scan screen is ready, **Then** Analyze is disabled and the character count is zero.
2. **Given** text within the 2,000-character limit, **When** the user activates Paste, **Then** clipboard access occurs only after that user action and permission/read errors have a recoverable message.
3. **Given** non-empty text, **When** the user analyzes it, **Then** the UI shows a loading state, calls `analyze({ text }, { lang, useLLM: false })`, and presents the returned verdict.
4. **Given** an input over the limit, **When** the user edits it, **Then** the app prevents analysis and exposes the limit without silently truncating the message.
5. **Given** any user message, **When** it appears in the scan or result screen, **Then** it is rendered as inert text and its links are not followed.

### User Story 3 - Understand the result (Priority: P1)

A user sees the assessment, observed evidence, safe next step, original text, and uncertainty without confusing an ordinary message for a guarantee of safety.

**Independent Test**: Exercise all four `Verdict.level` values and verify each has a distinct text label, accessible status announcement, safe copy, and a route back to another check.

**Acceptance Scenarios**:

1. **Given** any verdict level, **When** the result is displayed, **Then** its label is conveyed by text and a meaningful icon/state marker, not color alone.
2. **Given** `probably_fine`, **When** the result is displayed, **Then** the text says that no obvious warning signs do not prove the message or sender is legitimate.
3. **Given** `not_sure`, **When** the result is displayed, **Then** it states that the content could not be assessed or the outcome is uncertain and gives a safe recovery step.
4. **Given** model metadata in `usedModels`, **When** the result is displayed, **Then** the app reports only what actually ran and does not claim model use or accuracy that was not verified.

### User Story 4 - Select a screenshot and recover honestly (Priority: P2)

A user can reach screenshot input from Scan and is told to paste text when OCR cannot extract it.

**Independent Test**: Select a synthetic image and verify that the app never fabricates extracted text or a successful assessment when the existing OCR service is unavailable.

**Acceptance Scenarios**:

1. **Given** a supported image file, **When** the user selects it, **Then** the selected file is identified and the app offers a clear next action.
2. **Given** OCR failure or unavailable OCR, **When** the user requests analysis, **Then** the UI reports that the screenshot could not be read and asks the user to paste the message.
3. **Given** an unsupported file, **When** the user selects it, **Then** a clear error appears and the text-entry path remains usable.

### User Story 5 - Read offline safety guidance (Priority: P2)

A user opens Learn and reads short, actionable advice on verification codes, links, payment requests, and independent contact.

**Independent Test**: Open Learn in each language and verify all four topics and a return-to-scan action.

**Acceptance Scenarios**:

1. **Given** any supported language, **When** Learn opens, **Then** all four topics display localized guidance.
2. **Given** Learn, **When** the user activates the check-message action, **Then** the scan screen opens without losing the language selection.

### User Story 6 - Choose a display theme (Priority: P2)

A user can change the app between light and dark appearance from a clearly labeled control, or follow the device setting.

**Independent Test**: Choose System, Light, and Dark from the theme control and verify the selected appearance and readable controls.

**Acceptance Scenarios**:

1. **Given** any screen, **When** the user changes Theme, **Then** the selected light or dark appearance is applied immediately.
2. **Given** System is selected, **When** the device color-scheme preference changes, **Then** the app follows that preference.
3. **Given** any supported language, **When** the theme control is read, **Then** its label and options are localized.

## Functional Requirements

- **FR-001**: The app MUST provide welcome, scan, result, and Learn states within the existing React client.
- **FR-002**: The app MUST provide English, Filipino, and Taglish UI copy for every string introduced by this feature.
- **FR-003**: The app MUST call the existing `analyze` function for entered text and MUST represent its loading, result, and recoverable error states.
- **FR-004**: Clipboard reading MUST occur only in response to the user's explicit Paste action; the app MUST NOT inspect the clipboard on load or focus.
- **FR-005**: The app MUST limit input to 2,000 characters, preserve original text for display, and render it without HTML interpretation.
- **FR-006**: The app MUST explain each verdict with text and a non-color cue and MUST avoid safety guarantees.
- **FR-007**: Model and OCR status displayed by the UI MUST reflect runtime metadata and verified availability. The app MUST NOT imply an unimplemented OCR or embeddings model succeeded.
- **FR-008**: The app MUST provide screenshot selection with an honest unavailable/failure state when OCR cannot extract text; it MUST NOT change model-owned OCR implementation.
- **FR-009**: The app MUST include four localized offline safety topics and a way back to Scan.
- **FR-010**: The app MUST meet keyboard-operable controls, visible focus, accessible labels, polite live result/status announcements, and minimum 44 CSS-pixel touch targets.
- **FR-011**: At 320, 360, and 1280 CSS-pixel viewport widths, the app MUST have no horizontal page overflow; large layouts MUST retain a readable centered measure.
- **FR-012**: The app MUST respect reduced-motion and system color-scheme preferences without making risk meaning depend on theme or color; users MUST be able to choose System, Light, or Dark.
- **FR-013**: Raw messages MUST remain transient component state and MUST NOT be persisted by this feature.
- **FR-014**: The welcome screen's primary action MUST be full width and at least 60 CSS pixels tall.

## Success Criteria

- **SC-001**: A user can complete welcome -> enter text -> analyze -> read result -> start another check without a blank or stuck screen.
- **SC-002**: All verdict levels can be understood using visible text and accessible status semantics.
- **SC-003**: English, Filipino, and Taglish are selectable and the primary journey remains usable in each.
- **SC-004**: Clipboard content is read only after an explicit user action; no input message is written to persistent storage.
- **SC-005**: Screenshot/OCR limitations are stated honestly and never produce a fabricated successful result.
- **SC-006**: Build/typecheck and focused application checks pass; browser inspection confirms the journey at 320, 360, and 1280 CSS-pixel widths.
- **SC-007**: Theme can be changed to Light or Dark on every screen, System follows the device preference, and all theme labels are localized.
- **SC-008**: Start manual check is visually prominent, full width, and at least 60 CSS pixels tall.

## Assumptions and Exclusions

- The existing `src/types.ts` and `analyze(input, opts)` function remain the UI contract; changes to shared types or domain logic are out of scope.
- The existing OCR implementation currently reports unavailable. This frontend task exposes that state only; OCR implementation belongs to its owner.
- Automatic SMS/chat monitoring, server APIs, accounts, network telemetry, model downloads, and accuracy claims are excluded.
- The supplied designs are visual references; desktop frames are adapted to the project’s mobile-first PWA constraints.
