# Feature Specification: Native SMS and Chat Capture Feasibility

**Feature Branch**: `codex/feat/task-101-native-capture`
**Created**: 2026-10-09
**Status**: Draft
**Input**: User description: "Prove reproducible APK/toolchain and real automatic SMS plus selected-chat notification capture on the chosen Android target before any UI or model work begins (TASK-101, G1 kill gate)."

## User Scenarios & Testing

### User Story 1 - Automatic SMS capture (Priority: P1)

A scam SMS arrives on the real test phone while the Sane app is backgrounded. The native SMS
receiver captures the message text without the user opening the app.

**Why this priority**: BS-02 is non-optional (scope.md forbids silently cutting it) and is the
G1 kill gate, the single highest-risk integration in the project.

**Independent Test**: With the APK installed on the real test phone and backgrounded, send a test
SMS to that phone's number from a second phone or teammate's number, and confirm the receiver
logs the captured text to Logcat (via `adb logcat`) with correct sender, body, and timestamp.

**Acceptance Scenarios**:

1. **Given** the app is installed with SMS permission granted and backgrounded, **When** an SMS
   arrives, **Then** the native receiver logs the full message text and timestamp within the
   receiver's execution window.
2. **Given** SMS permission has not been granted, **When** an SMS arrives, **Then** no capture
   occurs and the capability snapshot reports `smsPermission: not_requested` or `denied`, not a
   silent false negative.
3. **Given** a multipart SMS arrives, **When** the receiver processes it, **Then** the assembled
   text preserves part order and is treated as one message.

---

### User Story 2 - Automatic chat-notification capture (Priority: P1)

A scam message arrives as a WhatsApp notification on the same real test phone while the app is
backgrounded. The notification listener captures the message text.

**Why this priority**: BS-03, equally core per scope.md; also gated by G1.

**Independent Test**: With WhatsApp installed and logged in on the real test phone, grant
notification access, background the app, send a test WhatsApp message from a second number, and
confirm the listener logs the captured text.

**Acceptance Scenarios**:

1. **Given** notification access is granted and WhatsApp is the selected source, **When** a new
   WhatsApp message notification posts, **Then** the listener extracts `EXTRA_MESSAGES`/
   `EXTRA_TEXT` and logs it, distinguishing it from group-summary notifications.
2. **Given** WhatsApp message-preview privacy is disabled inside WhatsApp's own settings,
   **When** a message arrives, **Then** the listener correctly reports `coverage: unavailable`
   rather than fabricating content.
3. **Given** the notification listener has disconnected, **When** the app is reopened, **Then**
   `getCapabilities` reports `listenerState: disconnected`, not a stale connected value.

---

### Edge Cases

- Both direct SMS and the SMS app's own notification enabled simultaneously: must not double-alert.
- Device reboot or force-stop between capture events: process death may interrupt in-memory work;
  report the gap rather than silently dropping it.
- The test phone is shared across both capture paths: SMS and WhatsApp tests must not collide on
  the same device session; run them as separate, clearly logged passes.

## Requirements

### Functional Requirements

- **FR-001**: The native layer MUST register a manifest-declared `BroadcastReceiver` for the
  protected SMS-received broadcast and verify the broadcast action before processing.
- **FR-002**: The native layer MUST implement a `NotificationListenerService` that captures
  WhatsApp (`com.whatsapp`) notification text via `MessagingStyle` extras, ignoring group-summary
  and self notifications.
- **FR-003**: Both capture paths MUST run off the main thread and MUST NOT block the UI thread.
- **FR-004**: SMS capture MUST use `goAsync()` with `finish()` called on every completion and
  error path, within a deadline inside Android's receiver execution window.
- **FR-005**: The system MUST expose real, queryable capability state rather than assuming
  readiness from a one-time grant.
- **FR-006**: Capture code in this task logs to Logcat only; no model inference, no UI, no
  warning notification. Those are TASK-104/105 scope.

### Key Entities

- **MessageEnvelope**: `id`, `source` (`sms` | `chat_notification`), `text`, `receivedAt`,
  `sourcePackage`, `coverage`, fixed in `docs/sane/contracts.md`; this task populates it rather
  than redefining it.

## Success Criteria

### Measurable Outcomes

- **SC-001 (G1)**: A real SMS, sent from a second phone, is captured and logged within the
  receiver's execution window, with the app backgrounded, on the real test phone.
- **SC-002 (G1)**: A real WhatsApp message notification is captured and logged, with the app
  backgrounded, on the same real test phone.
- **SC-003**: The reproducible build and install path (exact Gradle/AGP/JDK/compile-SDK versions
  and the test phone's exact OS/manufacturer build) is recorded in the task handoff in enough
  detail for a teammate to reproduce it.
- **SC-004**: Every blocker encountered, permission denial, listener disconnect, version mismatch,
  is recorded as evidence rather than silently worked around.

## Assumptions

- One real Android phone is used for all capture testing: SMS and WhatsApp both, on the same
  device. No emulator and no Android Studio IDE in this task; the SDK's command-line build tools
  (`sdkmanager`, `platform-tools`, `adb`) build and deploy the APK directly to that phone.
- The phone's exact Android/OS build is recorded once selected. If there is a choice of phone,
  prefer Android 13 or 14 over 15, given the unverified Android-15 notification-redaction risk
  flagged during secondary-chat-app research. If only an Android 15 phone is available, that
  redaction behavior must be tested explicitly in the first hour, not assumed either way.
- WhatsApp (`com.whatsapp`) is the one tested secondary chat app per scope.md; Messenger remains
  optional stretch scope only if time allows after G1 passes.
- SMS tests require a second phone or a teammate's number to send from; this is logistics to
  confirm before the first-hour test window starts, not during it.
- No model, UI, or warning-delivery work happens in this task; strictly capture feasibility.
