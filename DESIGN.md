# Sane experience contract

Status: design baseline for the web PWA, updated October 9, 2026. The visual reference is the
"08 / Local foundations: Calm utility, consistent parts" component sheet supplied by the user
(Button, Risk badge, Status row, Input, Bottom navigation, Warning summary). No implemented UI,
rendered audit, or Impeccable sidecar is claimed. The sheet predates decision D-12 (no SMS or
monitoring), so its Monitoring tab and Monitoring toggle are not part of this contract.

## Intent and hierarchy

Calm utility, consistent parts. A mobile-first web utility with careful Filipino, English, and
Taglish copy, restrained green accents, warm neutral surfaces, and honest uncertainty. Avoid a
generic security dashboard, alarm-heavy styling, fake live metrics, decorative shield overload,
and a chatbot-first layout.

Input is always user-initiated: paste, type, screenshot upload, or the Web Share Target (Android
Chrome, installed PWA), which is the closest the web gets to automatic. There is no SMS reading,
inbox access, notification capture, or background monitoring, and none is implied in the UI.

Bottom navigation has two destinations: Scan (Suriin) and Learn (Alamin). Results open in place
under the input. Scanning is the main action; one primary action per task.

## Semantic tokens

Taken from the component sheet. Define them as CSS custom properties; no runtime font CDN.

| Role           | Light     | Dark      | Use                                                          |
| -------------- | --------- | --------- | ------------------------------------------------------------ |
| Background     | `#F6F7F3` | `#101813` | Page canvas                                                  |
| Surface        | `#FFFFFF` | `#1A241E` | Input, card, and result surfaces                             |
| Primary        | `#176347` | `#8CD8AD` | Primary action, brand, selected nav, focus ring              |
| On primary     | `#FFFFFF` | `#102A1D` | Text on primary                                              |
| Primary tonal  | `#DCEBE0` | `#23372B` | Selected nav pill, safe-state badge fill                     |
| Main text      | `#17241C` | `#E9F0E8` | Content                                                      |
| Secondary text | `#4D5D52` | `#BBCABD` | Supporting text, counters, unavailable state                 |
| Outline        | `#6F7F74` | `#829489` | Input and control boundaries                                 |
| High concern   | `#A62828` | `#FFB4AB` | Concern text, icon, error border; fill `#FBE7E5`             |
| Caution        | `#765400` | `#F0CC75` | Caution text and icon; fill `#FFEFC9`                        |
| Unable to rate | `#4D5D52` | `#BBCABD` | Unknown or error; grey, never reassuring green               |
| Disabled       | `#E1E5DF` | `#2A352E` | Disabled button fill, text uses secondary text               |
| Loading        | `#5C8F7B` | `#4F8A6D` | Primary button while analyzing (muted primary, no spin only) |

Values are read from the sheet by eye. Measure actual foreground/background pairs, including
focus, disabled, tonal fills, and both themes, before claiming WCAG contrast. Dark values are
candidates until a dark frame is approved.

Type: bundled Roboto or system sans-serif. Roles: headline 24/32, title 20/28, body 16/24,
label 14/20, supporting 12/16 in CSS px, scaled with rem. Spacing on an 8-unit rhythm, 48 px
minimum touch targets, 8 to 12 px radii on controls, 1 px outlines, one primary action per task.
Layouts are designed at 360 px first and checked at 390 and 412.

## Components and variants

Build these once, reuse everywhere. Props follow the sheet's naming.

| Component      | Props                       | Variants and states                                                                                                                                                          |
| -------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button         | `{variant, state, theme}`   | Primary (filled green), secondary (white, green text, outline), text (borderless), tonal/disabled (grey), danger (filled red), pressed (dark green), light (dark-theme mint) |
| Button loading | `state=loading`             | Label becomes "Analyzing..." (Sinusuri...), muted primary fill, not clickable, announced politely                                                                            |
| Risk badge     | `{severity, language}`      | Icon plus text on a tonal fill. See the label table below                                                                                                                    |
| Status row     | `{state}`                   | Label "Local model", bold state line, one supporting line, optional action button                                                                                            |
| Input          | `{state}`                   | Label "Original message", empty with placeholder, filled, focus (2 px primary border), error (red border plus message). Counter "n / 2,000" below                            |
| Bottom nav     | `{destination, language}`   | Scan, Learn. Selected item has a tonal pill, icon, and bold label; others icon plus label in secondary text                                                                  |
| Result summary | `{severity, source, state}` | Replaces the sheet's "Warning summary". Source and time line, risk badge, coverage line, one-sentence reason, "View details" action                                          |

### Risk badge labels

Severity maps to the verdict levels used by `analyze()`. Wording is the sheet's. Icons: warning
triangle (high), exclamation circle (caution), search-check circle (no obvious signs), question
circle (unable to assess). Color is never the only signal.

| Verdict level   | English                  | Filipino                 | Tone  |
| --------------- | ------------------------ | ------------------------ | ----- |
| `likely_scam`   | High concern             | Malaking pag-aalala      | Red   |
| `suspicious`    | Use caution              | Mag-ingat                | Amber |
| `probably_fine` | No obvious warning signs | Walang malinaw na babala | Green |
| `not_sure`      | Unable to assess         | Hindi masuri             | Grey  |

Low concern means no obvious warning signs, never "safe". Taglish users see the Filipino labels
unless the language setting says English.

### Status row states (Local model)

| State    | Text                                                                                                     | Action                                                 |
| -------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Checking | "Checking / unknown", "Checking what this device can run."                                               | None                                                   |
| Ready    | "Ready", "Accuracy is not validated." (replace with measured numbers once the eval report exists)        | None                                                   |
| Blocked  | "Unavailable", reason such as no WebGPU, low storage, or download failed; rules and templates still work | Retry download, or continue without the optional model |

Rules and templates always produce a verdict, so "Unavailable" describes only the optional LLM or
embeddings, never a dead app.

### Input

Label "Original message". Placeholder "Paste or type the complete message here." Limit 2,000
characters with a live counter. Error text: "Could not analyze this input. Keep the original text
and review it before retrying." The original text always stays editable after an error. A paste
button needs a user gesture; "Check what I copied" is the clipboard baseline for iOS, where Share
Target is unavailable. Screenshot upload sits beside the field, OCR output is shown for editing.

## Screens and required states

| Surface       | Required content and states                                                                                                                                      |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scan          | Status row, Input, Analyze button (idle, loading, disabled when empty), screenshot upload, validation and error states, language toggle                          |
| Result        | Risk badge, highlighted red flags, reasons, top archetype matches, optional LLM explanation (clearly secondary), coverage note, next step, Check another message |
| Shared in     | Opened from Share Target: text already loaded and checked, "Shared from another app" source line; empty share shows "Nothing to check" with the paste box intact |
| Learn         | Offline guidance on credential, link, payment, and verification scams; translated strings                                                                        |
| Offline proof | Small "Offline ready" badge and "network requests during scan: 0" counter, as in `PLAN.md`                                                                       |

Removed: Monitoring screen, chat selection, recent warnings, notification and SMS permission
recovery, and any Android settings return flow.

## Accessibility, localization, and safety

- Meet WCAG 2.2 AA for web controls: text and non-text contrast, keyboard access, visible focus,
  labels, semantic headings, and polite live announcements for status and results.
- Risk uses icon and text as well as color. Support large text, dark theme, 360, 390, and 412 px
  layouts, safe-area insets, and reduced motion. Verify on a real phone; DevTools is supplementary.
- Store English and Filipino UI strings by stable IDs. Have a Filipino speaker review safety
  copy; preserve original pasted text; test expansion; no concatenated translatable sentences.
- User text is rendered as inert text, never HTML. Links are not clickable. Synthetic samples are
  labeled. No analytics, no history of message bodies.
- Motion is subtle 150 to 250 ms state feedback; nothing compulsory or flashing.

## Handoff and evidence

Keep tokens and components in code (CSS variables plus the component set above). Do not add
screens solely to fill a component library. Use synthetic Filipino, English, and Taglish samples,
including ambiguous and legitimate financial messages. Follow the Impeccable workflow for any
actual UI build or audit. Related rules: `.agents/skills/design-ux/SKILL.md` and
`.agents/skills/design-ux/references/share-target.md`.

Source references: [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/).
