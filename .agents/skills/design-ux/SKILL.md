---
name: design-ux
description: UI, UX, copy and PWA design rules for Sane, a responsive web app for Filipino users checking suspicious messages. Use whenever the user mentions design, UI, layout, screens, components, colors, responsive, mobile view, PWA, manifest, installable, share target, accessibility, loading states, copy, wording, or translations, and whenever you build or edit any visible part of the app.
---

# Design and UX

One responsive website, built **mobile-first** as an installable PWA. No native or mobile-app code is written. Messages arrive on phones, so the phone is the primary device and the laptop view is the same app with more room.

## Principles

- **Answer first.** The verdict is the biggest thing on the screen. Details come after.
- **One action.** A big text box, a "Check" button, and "Check what I copied". Nothing else competes.
- **Honest states.** Show what is loading, what ran (OCR, embeddings, LLM), and when the app is unsure.
- **Plain Filipino users' language.** Short, warm, not scary. No jargon like "phishing vector."

## Mobile-first principles (applies to all design and code)

Why: scam texts arrive on phones, users check them on the same phone, and phones are the weakest hardware. Designing for the phone first keeps the app fast and simple, and the laptop view comes almost for free.

### Layout and CSS

- Write base CSS for a 360 px wide screen. Add `@media (min-width: ...)` rules to enhance for larger screens. Never write desktop styles first and shrink them.
- Include `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Respect notches with `env(safe-area-inset-*)`.
- Single column. Content max width about 640 px centered on large screens.
- Use `dvh` units (with a `vh` fallback) so the layout survives mobile browser bars and the on-screen keyboard.
- Relative units (`rem`, `%`), no fixed pixel widths on containers.

### Touch and thumb reach

- Primary actions (Check, Check what I copied, Upload screenshot) sit in the lower half of the screen, ideally a sticky bottom action bar.
- Tap targets about 44 by 44 px with space between them. Inputs at 16 px font or larger (prevents zoom on iOS).
- No hover-only behavior. No tiny close buttons. Avoid horizontal scrolling and long press tricks.
- Textarea should open the keyboard without covering the Check button. Test with the keyboard open.

### Performance budget on phones

- Show the check screen immediately. Load OCR, embeddings and the LLM lazily, in that priority order (see `local-ai`).
- LLM is off by default on phones and offered as "Smart explanation (larger download)". Rules plus templates give a verdict with no model at all.
- Ask before big downloads on mobile data: "This download is about X MB. Use Wi-Fi if you can." Offer to continue or wait. Never auto-download an LLM on cellular.
- Keep the first-load JS small (code-split workers and model code). Compress images and icons.
- Run heavy work in Web Workers so scrolling and taps stay responsive.
- Show progress, never a frozen screen. Use skeletons or text status.

### Installed PWA behavior

- Prompt install after the first successful check, not on first load. Use `beforeinstallprompt` on Android Chrome. On iOS Safari, show a short "Add to Home Screen" hint, since iOS has no install prompt.
- Cached files and models can be evicted by browsers under storage pressure or inactivity, and non-installed sites are more at risk on some browsers (verify). Call `navigator.storage.persist()` and show a "Models ready" check so users and you know.
- Handle going offline gracefully: show an "Offline ready" badge, not an error.
- Standalone mode has no browser back button, so provide in-app navigation (a clear back or new check button).

### Platform differences to design around

- Android Chrome: install prompt, Web Share Target supported.
- iOS Safari: no Share Target, install is manual, WebGPU support depends on version (verify). The clipboard button and paste box are the reliable path there.
- Always keep paste and "Check what I copied" as the baseline, with Share Target as an enhancement.

### Mobile test checklist (do on a real phone, not only DevTools)

- [ ] 360 px and a small 320 px width, no horizontal scroll
- [ ] Keyboard open: Check button still reachable
- [ ] One-handed thumb reach for primary actions
- [ ] Airplane mode: cold start from the home-screen icon works
- [ ] First load on mobile data shows the download-size prompt
- [ ] Verdict readable in bright light (contrast, not color alone)
- [ ] Slow device: UI stays responsive during model load
- [ ] Rotation and text scaling (system font size increased) do not break layout

## Screens

1. **Check screen:** text area, "Check" button, "Check what I copied", "Upload screenshot", language toggle (English / Filipino / Taglish), "Offline ready" badge.
2. **Loading state (first visit only):** progress per model with a plain sentence: "Downloading the checker once so it works offline."
3. **Result card:** level, one-line headline, highlighted message, red flags list, "What to do" steps, matched pattern name, small "AI used on this device" line.
4. **Proof strip:** "Network requests during this check: 0" and an online/offline indicator. This is the demo's strongest visual.

## Verdict levels

Labels and tokens follow the component sheet recorded in `DESIGN.md` (decision D-12). Filipino labels are in that file.

| Level         | Tone  | Label (EN)               | Notes                                     |
| ------------- | ----- | ------------------------ | ----------------------------------------- |
| likely_scam   | red   | High concern             | Do not click, do not reply                |
| suspicious    | amber | Use caution              | Verify through the official app or number |
| probably_fine | green | No obvious warning signs | Not "safe". Still never share OTP/PIN     |
| not_sure      | grey  | Unable to assess         | Show why, suggest verifying               |

Never rely on color alone. Use an icon and the text label so it works for color-blind users and in sunlight.

## Copy (all three languages)

Every user-facing string lives in one file keyed by id, with `en`, `fil`, `taglish`. Examples:

- headline likely_scam: EN "This looks like a scam." FIL "Mukhang scam ito." Taglish "Mukhang scam 'to. Huwag mag-click."
- tip OTP: EN "Never share your OTP, even with someone who says they're from the bank." FIL "Huwag ibigay ang OTP kahit kanino, kahit sabihing galing sa bangko." Taglish "Huwag i-share ang OTP, kahit sabihin pang galing sa bank."
  Have a Filipino speaker read every string once. Keep sentences under about 15 words.

## Responsive and accessibility

- Follow the mobile-first section above. Readable base size 16 px or more.
- Respect `prefers-color-scheme` and `prefers-reduced-motion`.
- Labels on all inputs, focus rings, `aria-live="polite"` on the result region, contrast that passes AA.
- Test at 320 px, 360 px and 1280 px widths in DevTools, then on a real phone. No horizontal scroll.

## PWA

```json
{
  "name": "Sane",
  "short_name": "Sane",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0f5132",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": { "text": "text", "files": [{ "name": "image", "accept": ["image/*"] }] }
  }
}
```

- Share Target works on Android Chrome only, once installed. It is the first thing on the cut ladder. Handler code, page-side handoff and a test checklist are in `references/share-target.md`.
- Clipboard fallback must always exist (works everywhere, needs a user tap). The Web OTP API only reads OTP codes tied to a domain, so it cannot help with scam detection.
- Be honest in the UI: "Share or copy a message to check it." Never "scans your inbox."

## Visual direction (options)

- **Calm trust:** deep green and off-white, rounded cards, friendly icons. Fits the "safe" feeling.
- **Alert-forward:** stronger red and amber accents, bolder type. More dramatic on stage, can feel alarming for daily use.
  Pick one and use the same tokens everywhere. Define colors, spacing and radii as CSS variables so the look can change in minutes.

## Demo-friendly details

- Pre-filled "Try an example" buttons: one scam in each language and one legit message.
- Big enough type that judges can read the screen from a distance.
- A visible reset button so the demo can be repeated quickly.
