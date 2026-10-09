# Sane demo and submission plan

Status: script/acceptance plan only. Actual pitch duration and submission artifact format are unknown.
Use synthetic messages, independently held-out wording, and the real tested phone/app versions.

## Demonstration sequence

1. Explain the user problem and why private on-device analysis benefits this product.
2. Analyze unseen manual English and Filipino messages; include a legitimate financial counterpart.
3. Background the app and receive a real SMS; show the native warning and evidence detail.
4. Receive a real message notification from a tested selected chat app; show local warning and
   explicitly explain notification-preview limits. Do not substitute a Figma animation as evidence.
5. Disable Wi-Fi/mobile data while retaining cellular service; reopen the APK and analyze new text.
   If feasible, receive SMS in that state. Chat delivery itself generally needs connectivity.
6. Show actual per-source permission/model readiness and a partial/unavailable example.
7. State measured language results, false alerts/misses, device limitations, and actual tool disclosures.

Keep a synthetic backup recording if live delivery fails, labeled as a recording from its build/device.
Do not show real contacts, credentials, OTPs, or private conversations. Model failure shows an error.
Do not hardcode the desired result or tune on a judge-provided message while presenting it as unseen.

## Local benefit answer

Private messages are classified on the receiving Android device. Analysis avoids a cloud inference
round trip and remains available without internet after installation. Automatic scanning reuses the
same local model as manual analysis. Connectivity for receiving a chat message is distinct from
connectivity for analyzing it. Detection and coverage are bounded and do not verify sender identity.

## Deadline and evidence

The slide states October 10, 10:00 AM, no extensions. Planning assumes 2026/Asia-Manila;
confirm timezone, portal, artifact requirements, and pitch duration. Set a real freeze and submission
buffer before that deadline; a 15-hour estimate cannot extend it. No scheduled automation is created.

Build provenance separates pre-event tooling/planning from implementation during the event.
Disclose the actual classifier/model revision, datasets/licenses, libraries, APIs (including none
for inference if true), Android tooling, and AI-assisted development tools used. Runtime evidence
is tracked through [verification](../sane/verification.md); none is established by this plan.
