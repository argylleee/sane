# Sane development guide

> **Superseded (D-10, October 9, 2026):** the Android-native, Filipino+English, trained-classifier approach below was replaced by the web-only kit in `RULES.md` and `PLAN.md`. Kept for history; do not build from it.

Status: system contracts and agent instructions, October 9, 2026. No app or model is implemented
or validated by this bundle. The user requested these files and a push to main; that authority
is specific to this documentation task and does not authorize future app deployment.

## Authority and composition

System/host restrictions and current user instructions take precedence. Apply root AGENTS.md,
then the relevant project contracts/rules; existing roles govern assignment, not product facts.
User-confirmed scope in [scope](../planning/scope.md) supersedes the attached master proposal's
deferred monitoring and English-only model assumptions. Supplied organizer facts live only in
[guidelines](../planning/guidelines.md). Architecture choices are recorded decisions, not organizer rules.

The six `sane-*` skills add domain procedures. They do not replace `role-dispatch`,
`role-*`, `parallel-work`, `resolve-conflict`, `impeccable`, `self-validate`, Spec Kit, or
`context-handoff`. No role activation, worker allocation, MCP connection, or app implementation
is implied by loading a specialist skill. Load one role and only the relevant specialists.

## Source of truth

| Subject                                   | Authoritative file                                                   |
| ----------------------------------------- | -------------------------------------------------------------------- |
| Organizer evidence and unknowns           | [Guidelines](../planning/guidelines.md)                              |
| Confirmed product requirements            | [Scope](../planning/scope.md), [Product](../../PRODUCT.md)           |
| Architecture and proposed stack           | [Architecture](../planning/architecture.md)                          |
| Native/UI interface and state machine     | [Contracts](contracts.md)                                            |
| Classifier, data, evaluation              | [Model](model.md)                                                    |
| Permissions, privacy, threat boundaries   | [Security](security.md)                                              |
| UX constraints and proposed visual tokens | [Design](../../DESIGN.md)                                            |
| App acceptance and release evidence       | [Verification](verification.md), [Demo](../planning/demo.md)         |
| Work sequence and decisions               | [Tasks](../planning/tasks.md), [Decisions](../planning/decisions.md) |
| Agent bundle review scenarios             | [Skill evaluations](skill-evaluations.md)                            |

Specialist skills link these facts rather than duplicating them. Generic validation remains
foundation-only until real application checks are configured. Documentation validation cannot
prove Android reception, local inference, privacy, or classifier accuracy.

## Entry points

- Architecture/interface task: `sane-architecture` + existing integration workflow.
- Native capture/background task: `sane-android` + assigned backend role.
- Training/export task: `sane-model` + assigned backend role.
- UI/Figma handoff task: `sane-experience` + assigned frontend role + Impeccable.
- Boundary/privacy task: `sane-security` + the already assigned role.
- Device/demo task: `sane-release` + `self-validate`.

Before parallel implementation, integration allocates real task receipts and distinct worktrees
under [coordination](../coordination.md). Proposed task IDs below are not ownership receipts.
