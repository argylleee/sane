# Native/UI contracts v1

Status: proposed implementation contract, not executable schema or existing plugin.
Integration owns changes and version increments; workers consume the same version.
Source requirements: [scope](../planning/scope.md). Model policy: [model](model.md).

## Shared analyzer inputs

An internal MessageEnvelope carries `id`, `source` (`manual`, `sms`, `chat_notification`),
`text`, `receivedAt`, optional `sourcePackage`, and `coverage` (`complete`, `partial`,
`unavailable`). `text` is ephemeral untrusted data. Do not treat SMS sender or app notification
title as authenticated identity. React cannot forge an automatic source: the public bridge
accepts manual input only; adapters create internal envelopes.

Proposed bounds: 4,000 Unicode code points per message, native pending work capped at 32 messages,
one analyzer worker, recent summaries capped at 50 entries with a 24-hour expiry. These are
engineering limits, not measured capability. Confirm with latency/memory tests and record changes.
An oversized input is rejected or explicitly marked partial; never silently truncate and return low.
Preserve original message text for the current manual result; normalized copies are internal only.

## Assessment shape

```json
{
  "contractVersion": 1,
  "id": "synthetic-example-id",
  "source": "manual",
  "risk": "unassessable",
  "coverage": "complete",
  "reasonIds": ["model_unavailable"],
  "evidence": [],
  "recommendationIds": ["verify_independently"],
  "model": {
    "executed": false,
    "id": null,
    "revision": null,
    "policyVersion": null
  },
  "processedAt": "2026-10-09T00:00:00Z",
  "timingMs": null
}
```

This is a synthetic error-shape example, not a real prediction or model manifest.
`risk`: `high`, `caution`, `low`, or `unassessable`. English/Filipino display copy is UI-owned;
native returns stable IDs. `evidence` entries include a kind (`rule`, `model`, `coverage`),
an ID, and optional code-point spans for observed text. Raw phrases/spans are ephemeral;
persist only approved IDs. A model contribution is never mislabeled as a directly observed rule.
`executed` is set by actual native inference success, not by UI configuration. No user-facing
fraud percentage is included. Native errors become structured unassessable results, not fake success.

Initial reason vocabulary: `credential_request`, `advance_fee`, `account_threat`, `payment_secrecy`,
`urgency`, `unverified_link`, `model_scam_pattern`, `model_ambiguous`, `partial_content`,
`content_unavailable`, `unsupported_format`, `input_too_long`, `model_unavailable`, `analysis_failed`,
`queue_overloaded`. Define translations and evidence conditions before adding reasons.
`impersonation_claim` may identify wording, never confirmed identity or verified impersonation.
Recommendation IDs: `do_not_share_secrets`, `avoid_unverified_link`, `verify_independently`,
`do_not_pay_prize_fee`, `verify_payment_request`, `review_full_message`.

## Bridge surface

| Method              | Request                                                 | Response/behavior                                                                |
| ------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `analyzeMessage`    | Bounded text and request ID                             | Shared native Assessment; manual source assigned natively                        |
| `getCapabilities`   | None                                                    | Current capability snapshot, rechecked on foreground/settings return             |
| `setMonitoring`     | Desired boolean                                         | Applied desired state plus current capability snapshot; never fabricated success |
| `setChatSources`    | List from supported-package catalog                     | Validated allowlist and capability snapshot                                      |
| `openSetup`         | Enumerated target: SMS, chat access, warning permission | Native OS permission/settings flow; completion requires capability recheck       |
| `getRecentAlerts`   | Bounded limit                                           | Minimal nonexpired summaries; no raw bodies/sender identities                    |
| `clearRecentAlerts` | None                                                    | Local summaries removed; no external deletion                                    |

Native events: `assessmentAvailable`, `capabilitiesChanged`, and `monitoringIssue`.
Listener callbacks are useful when the UI is open; reopening queries native state and summaries,
not missed JavaScript events. Automatic warning construction happens natively without bridge/UI.
No bridge method reads arbitrary files, runs shell commands, opens arbitrary native URLs, or sends SMS.

## Capability state machine

Snapshot fields include `checkedAt`, `desiredMonitoring` (persisted boolean, default false),
`modelState` (`unknown`, `not_ready`, `ready`, `error`), `smsPermission` (`unknown`,
`not_requested`, `granted`, `denied`, `restricted`), `chatAccess` (`unknown`, `not_requested`,
`granted`, `denied`), `listenerState` (`unknown`, `connected`, `disconnected`), `selectedPackages`,
`warningPermission` (`unknown`, `not_requested`, `granted`, `denied`, `not_required`),
`appNotificationState` (`unknown`, `enabled`, `disabled`), `warningChannelState` (`unknown`,
`missing`, `enabled`, `blocked`, `not_required`), `warningChannelImportance` (`unknown`, `none`,
`min`, `low`, `default`, `high`, `not_required`), `warningDeliveryEligibility` (`unknown`,
`eligible`, `blocked`), nullable `lastCaptureAt`, and explicit limitations.

Native checks permission, app-level notification enablement, and actual warning channel settings
together before deriving delivery eligibility. A granted permission alone is insufficient.
On OS versions without channel/runtime-permission support, use `not_required` only for the
inapplicable field and still check app-level enablement. User channel importance affects alert
presentation; DND/OS policy may suppress sound or heads-up even when posting is eligible.
Eligibility is not guaranteed delivery or acknowledgment. Recheck after Settings changes.

`unknown` is an explicit enum value, not null or false. Unknown prerequisites block ready/eligible
claims. Permission revocation maps to `denied` with an optional `revoked` limitation ID when a
previous grant is known; `not_requested` requires evidence that no request occurred.
Listener disconnection is independent of chat access. Last capture time alone never establishes
that the listener is currently connected.

- Desired off: Paused. Disable native processing, clear pending ephemeral work, and cancel
  actionable monitoring warnings; already executing work checks the desired state before publishing.
- Desired on, model unavailable: Analysis unavailable. Permission grants cannot make the model ready.
- SMS eligible but chat inaccessible, or the reverse: Partially enabled with per-source labels.
- Chat access granted but listener disconnected: Reconnecting/unavailable, not active capture.
- Capture eligible, warning permission/app/channel blocked: Analysis may work; warning delivery unavailable.
- Any needed capability unknown: Checking/unavailable for that source; never silently enabled.
- Capture and delivery prerequisites available: Enabled for named sources, with coverage limitations.

The snapshot indicates prerequisites/current observations, not proof that no events were missed.
An observed last-capture time is real metadata, never a decorative live counter.

## Capture and warning policy

Preserve multipart SMS order and define a source-specific event key. Chat adapters inspect supported
message fields, distinguish new entries from notification updates, and ignore summaries/self alerts.
Deduplication keys include event identity plus content revision; identical text from separate arrivals
must remain separate. If both SMS and its app notification are enabled, prevent double alerts through
a documented source preference; default chat allowlist excludes the SMS app when direct SMS is active.

High/caution automatic assessments can warn according to the tuned policy; low does not emit a
reassuring notification. Missing content produces an issue/unassessable state with rate-limited
feedback, not repeated fraud alarms. Avoid alert floods; deduplicate repeated issues separately.
Privacy-safe notification content names the concern/source category, not raw message text or sender.
Notification taps use an opaque result ID; expired/missing results open a clear expired state.

Summaries contain only ID, source/app label, timestamp, risk, coverage, reason/recommendation IDs,
and model/policy revision. App-private storage with expiry, cap, clear action, backup exclusion;
no raw message, sender, URL, OTP, or model-feature strings. Do not promise full message previews
after process death. A durable input queue or broader history requires a new explicit contract.
