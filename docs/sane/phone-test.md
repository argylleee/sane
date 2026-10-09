# Phone test checklist

Coordinator-owned. Record each result as pass, fail or not tested, with the device and browser. Never paste real private messages;
use the fixture messages from `eval/` or invented ones.

## What the tester needs to provide

1. Phone model, OS version, browser and version (Chrome on Android is the target).
2. `chrome://gpu` or `navigator.gpu` result (WebGPU yes/no), and free storage.
3. How the phone reaches the app. Service worker, install, share target and WebGPU need a secure origin, so a plain `http://<laptop-ip>` address will not work.
   Options: (a) USB: Chrome DevTools remote debugging with port forwarding makes `localhost:4173` secure on the phone, nothing is published;
   (b) a public HTTPS static host (GitHub Pages, Netlify or Cloudflare Pages) which publishes the build and needs the team's approval.
4. Build under test: `npm run build` then `npm run preview`, with the commit hash written down.

## Checks

| #   | Check                                                                             | Result |
| --- | --------------------------------------------------------------------------------- | ------ |
| 1   | App loads at 360 px width, welcome to scan to result, no horizontal scroll        |        |
| 2   | Paste a scam message: result level, signals highlighted, steps in the language    |        |
| 3   | Switch English, Filipino, Taglish                                                 |        |
| 4   | Model download prompt shows size; download completes on Wi-Fi; progress works     |        |
| 5   | After download: airplane mode, close and relaunch, scan again                     |        |
| 6   | "Offline ready" badge and "network requests: 0" counter during a scan             |        |
| 7   | Screenshot input: OCR reads English and Filipino text; failure shows paste tip    |        |
| 8   | Install to home screen; launch from the icon                                      |        |
| 9   | Share a text from another app into Sane (share target)                            |        |
| 10  | Legitimate OTP notice is not flagged; a safety warning is not flagged             |        |
| 11  | Time to first result with the model cold and warm                                 |        |
| 12  | Optional LLM toggle (after TASK-209 to 211 land): hidden or working, never blocks |        |

Report failures with the step, device, browser version and any console error; do not guess a cause.
