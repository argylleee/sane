# Sane demo and submission plan

Status: script/acceptance plan only. Actual pitch duration and submission artifact format are unknown.
Use synthetic messages, independently held-out wording, and the real tested phone and browser versions.

## Demonstration sequence

1. Explain the user problem and why private on-device analysis benefits this product.
2. Analyze unseen manual English and Filipino messages; include a legitimate financial counterpart.
3. Share a real message from the phone's messaging app to the installed PWA (Web Share Target) and
   show it arrive already loaded and checked. Say plainly that Sane does not read the inbox.
4. Upload a screenshot of a chat message; show OCR text, then the verdict. Do not substitute a
   Figma animation as evidence.
5. Switch to airplane mode, relaunch from the home-screen icon, and analyze new text. Show the
   "network requests during scan: 0" counter.
6. Show the Local model status row in Ready and Unavailable states; the verdict still works.
7. State measured language results, false alerts/misses, device limitations, and actual tool disclosures.

Keep a synthetic backup recording if live delivery fails, labeled as a recording from its build/device.
Do not show real contacts, credentials, OTPs, or private conversations. Model failure shows an error.
Do not hardcode the desired result or tune on a judge-provided message while presenting it as unseen.

## Local benefit answer

Private messages are checked in the user's own browser. Analysis avoids a cloud inference round trip
and works offline after first load. Shared, pasted, and screenshot input all use the same local
pipeline. Detection is bounded and does not verify sender identity.

## Deadline and evidence

The slide states October 10, 10:00 AM, no extensions. Planning assumes 2026/Asia-Manila;
confirm timezone, portal, artifact requirements, and pitch duration. Set a real freeze and submission
buffer before that deadline; a 15-hour estimate cannot extend it. No scheduled automation is created.

Build provenance separates pre-event tooling/planning from implementation during the event.
Disclose the actual classifier/model revision, datasets/licenses, libraries, APIs (including none
for inference if true), browser runtimes, and AI-assisted development tools used. Runtime evidence
is tracked through [verification](../sane/verification.md); none is established by this plan.
