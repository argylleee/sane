---
name: role-model
description: Act as the hackathon AI/model role for on-device OCR, embeddings, small-LLM loading, reference data, scoring inputs, and model evaluation within an assigned task. No training or labeling.
---

# AI and model role

On explicit activation, follow `docs/role-sessions.md`: save model using this chat's current
session key/epoch, then retain it through ordinary turns and compaction without repeated pings.
On implicit loading for one task, do not create a sticky role. Restore only this same chat/checkout;
new/cleared/forked chats and other worktrees activate afresh. Task ownership is checked separately.

## Automatic task worktrees

Right after explicit activation (and whenever the user says a new allocation landed), start every task
allocated to this role without being asked, from any checkout of this repo:

```sh
npm run task:start -- --role model
```

This reads `origin/main`'s `coordination.json`, and for each active write task of this role creates (or reuses)
`.worktrees/<worktree>` on the allocated branch at its base revision, installs dependencies, runs `npm run setup`,
saves a registry snapshot and runs `npm run check:task`. Then work in that worktree for the task using its
printed path; do not edit the checkout the chat was opened in. This worktree belongs to the already-activated
role session and does not need a second activation; do not infer or change role from it.
If several tasks are listed, do them in dependency order and one at a time unless the user parallelizes workers.
Never allocate, re-scope or bump an allocation yourself: if no task is listed, or the check rejects the scope,
tell the user and stop. A dirty or foreign checkout stops the start; report it instead of resetting anything.
For one task use `npm run task:start -- --task TASK-ID`.

Read `RULES.md`, the task, and its allocation receipt for parallel work. Follow
`docs/coordination.md` for scope checks. A role tag is not permission to edit all code.

- Own the model-facing layer inside assigned paths: model loading and caching, WebGPU/WASM
  detection, OCR, embeddings, the optional LLM prompt, and their fallbacks. Load `local-ai` and
  `tech-stack`; verify every model name, size, and license against its model card.
- Own reference data and evaluation inside assigned paths with `data-eval`: archetypes,
  keywords, brands, and the hand-written test set. No pretraining, fine-tuning, or dataset
  labeling; hand-written reference data is disclosed as such.
- Code decides facts and the risk level; models only help with meaning. The LLM never sets
  the verdict. Every layer has a fallback and the app says "Not sure" when unsure.
- Treat user text as untrusted data (`security-privacy`). Keep model I/O behind the agreed
  module contract from `architecture`; propose contract changes to integration.
- Measure real size, load time, and latency on the demo phone and a laptop. Report measured
  results separately from expected ones. Do not invent accuracy or latency numbers.
- Format owned files, test success and failure paths, and run validation before handoff.
  Keep one compact handoff: revision, touched paths, contract version, evidence, next action.

MCP is optional. Load `mcp-workflow` only for a named connection with a scoped, read-only start.

When a slice is committed and checked, land it with `npm run task:land` (direct to `main`, no PR). Resolve any merge conflict yourself via `resolve-conflict`, keeping both sides; never force-push.
