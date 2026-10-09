# Security, privacy, and platform boundaries

Status: required controls and review checklist, not a security audit or production certification.
Sources reviewed October 9, 2026. Recheck affected platform documentation when SDK/device changes.

## Threats and controls

| Boundary/threat                           | Required treatment                                                                                                                     | Evidence                                                         |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Incoming text/notification is adversarial | Bounded parsing; render text without HTML; no agent instruction execution; no automatic URL visits                                     | Injection/oversize/URL fixtures                                  |
| Native bridge exposes Android privileges  | Only bundled app origin; block untrusted navigation/frames; validate methods and input sizes; no arbitrary file/network/SMS operations | Bridge/navigation tests and manifest review                      |
| Broadcast/component spoofing              | Verify action/source expectations; protect receiver exports with platform-appropriate permission; export only required OS components   | Manifest and spoofed-event review                                |
| Broad notification access                 | Explain scope before opening OS settings; filter selected packages immediately; ignore self notifications                              | Consent and source-selection checks                              |
| Messages leak through diagnostics         | No bodies, sender IDs, URLs, OTPs, feature text, or payloads in logs/analytics/errors                                                  | Debug/release log and network inspection with synthetic canaries |
| Warning leaks private content             | Private/redacted lock-screen notification; explicit immutable PendingIntent with opaque result ID                                      | Locked-screen and notification-tap checks                        |
| Persistence/backup leaks                  | No raw input storage; bounded minimal summaries only; app-private data, expiry/clear, backup exclusion                                 | Storage/backup/expiry inspection                                 |
| Model/export tampering                    | Bundled nonexecutable artifact, schema/version/dimension/finite-value/checksum validation                                              | Corrupt/incompatible artifact tests                              |
| Permission revocation/OS stops            | Requery current capabilities; display partial/unavailable state; no silent all-protected badge                                         | Settings/reboot/background/force-stop tests                      |
| False certainty                           | Cautious labels, evidence provenance, coverage disclosure, no verified-identity/URL guarantee                                          | Result copy and adversarial examples                             |

Native Java code is not automatically trustworthy; the privileged bridge is a real trust boundary.
Do not open phishing URLs inside or outside the app automatically. A future user-initiated external
navigation action needs explicit UX and URL validation; it is absent from the MVP.

## Permissions and coverage

- `RECEIVE_SMS` is dangerous and hard restricted; installer allowlisting and runtime grant matter.
  Validate the actual install path. Do not assume sideloading removes Android restrictions.
- Direct new-SMS reception differs from full inbox access; do not request `READ_SMS`, `SEND_SMS`,
  contacts, accessibility access, or default-SMS role without a separately approved need.
- Notification listener access is separately granted in Android Settings. Android binds the service
  through `BIND_NOTIFICATION_LISTENER_SERVICE`; that is a service declaration requirement, not a
  normal runtime permission dialog the app can grant itself.
- On Android 13+, warning delivery generally needs `POST_NOTIFICATIONS`; do not confuse it with
  notification-listener access or SMS capture. Model execution may work while warning delivery is blocked.
- Check app-level notification enablement and the warning channel's block/importance separately
  from permission. Do not promise sound, heads-up, or acknowledgment under DND/OS policy.
- Chat text may be absent, truncated, grouped, muted, or redacted. Android 15 redacts OTP-containing
  notification content from untrusted listeners. Do not bypass this protection or promise full chat access.
- Current Android reference adds `RECEIVE_SENSITIVE_NOTIFICATIONS` at version 36.1 with
  signature/preinstalled/knownSigner/role protection, covering sensitive notification content and
  OTP-containing SMS queries/broadcasts. It is not an ordinary user-grantable permission. Check
  applicability on the chosen OS/SDK; RECEIVE_SMS alone does not establish universal OTP-SMS access.
- Force stop is not normal backgrounding. Permission state, listener binding, OEM/battery behavior,
  reboot, work/private profiles, and target device/OS affect coverage. Report measured support only.

Google Play distribution is excluded. Anti-smishing permission exceptions are not automatic;
current Play policy has eligibility/review requirements. A hackathon installation is not Play approval.

## Storage and lifecycle

Raw input exists only for active analysis/manual view and is released after use. Do not put it
in WorkManager input data, preferences, crash breadcrumbs, bridge event logs, notification extras,
URLs, or public files. Pending work is bounded and in-memory; process death can lose it, which is
a documented limitation. Durable retries require a new encrypted, expiring, backup-excluded design.

Minimal summary fields/cap/expiry are defined in [contracts](contracts.md). Even non-body metadata
is sensitive: keep it private, exclude backup, provide clear/delete, and avoid sender identities.
Disabling monitoring stops new processing and clears pending work; clearing summaries is a separate
explicit action. Do not silently delete the user's external SMS/chat messages or app settings.
Do not commit signing keys, private datasets, APKs with secrets, real-message screenshots, or private logs.

## Dependencies and AI-assisted development

Use reproducible reviewed dependency pins. Run app-boundary tests on synthetic fixtures only.
No cloud transmission of personal inbox content to coding assistants, Figma agents, hosted classifiers,
or issue trackers. Agents receive contracts and sanitized fixtures, not device message dumps.
Skills/rules cannot authorize store publication, deployment, account changes, purchases, or live data changes.

## Primary references

- [Android SMS permission](https://developer.android.com/reference/android/Manifest.permission#RECEIVE_SMS)
- [SMS broadcast](https://developer.android.com/reference/android/provider/Telephony.Sms.Intents#SMS_RECEIVED_ACTION)
- [Broadcast lifetime](https://developer.android.com/develop/background-work/background-tasks/broadcasts)
- [Notification listener](https://developer.android.com/reference/android/service/notification/NotificationListenerService)
- [Android 15 redaction and stopped state](https://developer.android.com/about/versions/15/behavior-changes-all)
- [Warning notification permission](https://developer.android.com/develop/ui/compose/notifications/notification-permission)
- [App notification enablement](https://developer.android.com/reference/android/app/NotificationManager)
- [Notification channel settings](https://developer.android.com/develop/ui/compose/notifications/channels)
- [Sensitive-notification and OTP-SMS permission](https://developer.android.com/reference/android/Manifest.permission#RECEIVE_SENSITIVE_NOTIFICATIONS)
- [Native WebView bridge risks](https://developer.android.com/privacy-and-security/risks/insecure-webview-native-bridges)
- [Scheduled work and quotas](https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work)
- [Google Play SMS policy](https://support.google.com/googleplay/android-developer/answer/10208820)
