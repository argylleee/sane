# Sane experience contract

Status: proposed design baseline for Figma and frontend work, October 9, 2026. No approved
visual comp, implemented UI, rendered audit, or Impeccable-generated sidecar is claimed.
The separate Figma agent prompt is supplied in chat, not stored in this document.
An approved visual comp may refine these tokens through integration without altering product truth.

## Intent and hierarchy

Operate mode: calm, credible, quick to understand under uncertainty. A mobile utility with
careful Filipino/English copy, restrained green accents, warm neutral surfaces, and explicit
monitoring status. Avoid a generic security dashboard, alarm-heavy styling, fake live metrics,
decorative shield overload, and a chatbot-first layout.

Compact navigation: Scan, Monitoring, Learn. Results and warning details open contextually;
Android Back returns to the previous context without trapping users. Scanning is the main action;
monitoring is an equally required capability, never hidden in an obscure settings submenu.

## Proposed semantic tokens

| Role           | Light candidate | Dark candidate | Use                                              |
| -------------- | --------------- | -------------- | ------------------------------------------------ |
| Background     | `#F6F7F3`       | `#101813`      | Page canvas                                      |
| Surface        | `#FFFFFF`       | `#1A241E`      | Input and result surfaces                        |
| Primary        | `#176347`       | `#8CD8AD`      | Primary action/brand                             |
| On primary     | `#FFFFFF`       | `#102A1D`      | Action text                                      |
| Main text      | `#17241C`       | `#E9F0E8`      | Content                                          |
| Secondary text | `#4D5D52`       | `#BBCABD`      | Supporting information                           |
| Outline        | `#6F7F74`       | `#829489`      | Meaningful input/control boundaries              |
| High concern   | `#A62828`       | `#FFB4AB`      | Concern text/icon with separate tonal background |
| Caution        | `#765400`       | `#F0CC75`      | Caution text/icon                                |
| Unassessable   | `#4D5D52`       | `#BBCABD`      | Unknown/error; never reassuring green            |

These are candidates: measure actual foreground/background combinations, including focus,
disabled, tonal fills, and all themes. Do not infer accessibility from hex values alone.
Use CSS custom properties; local bundled Roboto/system sans-serif, no runtime font CDN.
Proposed type roles: headline 24/32, title 20/28, body 16/24, label 14/20, supporting 12/16;
values are CSS px baselines scaled with rem/system accessibility, not fixed native sp.
Use an 8-unit spacing rhythm, 48 dp-equivalent minimum targets, restrained 12-16-unit corner radii,
and one primary action per task. Preserve hierarchy at large font scale and narrow widths.

## Screens and required states

| Surface                | Required content and states                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Welcome/setup          | Value, language choice, privacy scope, optional monitoring setup; manual scan usable if access denied                                                     |
| Scan                   | Text field, paste affordance requiring user action, Analyze, input validation, bundled-model readiness, working/error states                              |
| Result                 | High concern / Use caution / No obvious warning signs / Unable to assess; reasons, model evidence, coverage, next step, Check another                     |
| Monitoring             | Desired toggle; SMS reception, chat access/connection, enabled sources, model readiness, warning permission; pending/denied/revoked/partial/paused states |
| Chat selection         | Only tested supported apps; availability/settings prerequisites; unsupported sources disclosed                                                            |
| Recent warnings/detail | Minimal summaries, source/time/risk; no full inbox, sender list, raw-text archive, or unapproved retention                                                |
| Learn                  | Offline credential/link/payment/verification guidance, translated strings                                                                                 |

Use runtime-provided reason/status IDs from [contracts](docs/sane/contracts.md).
Do not calculate operational readiness from the UI toggle. Warn separately when analysis can run
but warning permission, app-level notifications, or the warning channel are blocked. Include
Checking/unknown states and channel-settings recovery. Returning from Settings refreshes capabilities.
Represent Android system dialogs/screens as annotated prototype frames, never custom replacements
for real operating-system permissions. Avoid claiming listener connection proves total coverage.

## Accessibility, localization, and safety

- Meet WCAG 2.2 AA applicable to web-rendered controls: text contrast, non-text contrast,
  keyboard access, visible focus, labels, semantic headings, and live status announcements.
- Risk uses text and icon as well as color. Low concern means no obvious warning signs, not safe.
- Support TalkBack, large text, dark theme, 360/390/412 CSS-pixel layouts, Android system/keyboard
  insets, and reduced motion. Verify the APK on hardware; browser checks are supplementary.
- Store English and Filipino UI strings by stable IDs. Have safety translations reviewed;
  preserve original pasted text. Test expansion; no concatenated translatable sentences.
- Make URLs inert text, synthetic samples labeled, and warning notifications private/redacted.
- Proposed motion is subtle 150-250 ms state feedback; no compulsory animation or repeated alert flashing.

## Figma handoff and evidence

Create reusable tokens, components with variants, light/dark modes, required state frames,
and clickable manual/automatic/setup-recovery flows. Map components to runtime IDs and source coverage.
Use synthetic Filipino/English samples, including ambiguous and legitimate financial messages.
Show automatic alerts as simulated prototype behavior, not proof of background execution.
Do not add screens/features solely to fill a component library. Freeze an approved comp before
implementation; follow existing Impeccable workflow for any actual UI build/audit.

Source references: [WCAG 2.2](https://www.w3.org/WAI/WCAG22/quickref/) and existing
[Android design guidance](.agents/skills/impeccable/reference/android.md).
