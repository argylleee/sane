# Activate a role once per chat

Activate `model`, `frontend`, or `backend` once. `integration` is run automatically by the AI
coordinator and is rarely activated by hand. It remains the selected role for later
messages and compaction in that same chat and checkout. Other task/validation skills can load
as needed without changing the role. A role selection does not grant tools, file ownership,
or permission to publish; task allocations remain independently checked.

| Host        | Activate in chat                                  | Reset boundary                                |
| ----------- | ------------------------------------------------- | --------------------------------------------- |
| Codex       | `$role-model`, `$role-frontend`, `$role-backend`  | New/forked chat, different worktree, `/clear` |
| Claude Code | `/role-model`, `/role-frontend`, `/role-backend`  | New/forked chat, different worktree, `/clear` |
| OpenCode    | Same `/role-*` commands from `.opencode/commands` | New/cleared chat or different worktree        |
| Other hosts | Ask to activate the named canonical role skill    | Fresh/cleared chat or different worktree      |

Use the host's actual reset command. `/clean` is not a portable command we can assume exists.
Clearing only the terminal display is not a conversation reset. To switch roles deliberately,
invoke the new role once and reconcile conflicting task ownership before edits.

## Agent activation and restoration

The agent keeps only a session key, epoch, checkout identity, and role in an ignored file under
`.local/agent-sessions/`. No transcripts, task payloads, credentials, or role names in global config.

1. Use the current host-provided session key/epoch from the SessionStart hook. If unavailable,
   run `npm run role:session -- begin` once; it returns a fresh nonce and epoch. Carry that exact
   anchor in this chat's working state and compaction summary. Never select a file by recency,
   directory scanning, another chat's handoff, inherited fork history, or the branch name.
2. After explicit activation, the agent runs the command below with the current anchor and role.
   Explicit delegation packets may activate a child's assigned role once in its own chat/checkout;
   they do not inherit the parent's session key. A skill loaded for one task is not automatically
   a persistent role. If execution is unavailable, maintain the anchor in chat and report that
   disk-backed restoration is unavailable rather than pretending it was saved.
3. On same-chat compaction/resume, read that checkpoint, load only its role skill if needed, and
   verify task allocation, branch/base, dirty work, and evidence freshness. Do not demand another ping.
4. On a fresh/cleared/forked chat or changed checkout, discard inherited anchors and activate again.
   Reset changes the epoch; attempts to reuse the old epoch are rejected. User instructions still
   take precedence, and an explicit role switch does not reassign contested files automatically.

```sh
npm run role:session -- activate frontend --session CURRENT_KEY --epoch CURRENT_EPOCH
npm run role:session -- status --session CURRENT_KEY
npm run role:session -- reset --session CURRENT_KEY --epoch CURRENT_EPOCH
```

These are agent commands; the user selects the role in chat. Keep the compact anchor in the
summary, not the role's entire instructions or a copy of every skill. Store task progress in
its existing handoff. A checkpoint is navigation state, not current authorization or an allocation lock.

## Native lifecycle hooks

Codex `.codex/hooks.json` and Claude `.claude/settings.json` call the same small Node helper on
SessionStart. `compact` and `resume` restore only the matching checkpoint. `startup`, `clear`,
and Claude's `fork` start inactive with a fresh epoch. New session IDs also isolate forked chats.
The helper resolves the current Git root, verifies checkout identity, returns bounded context,
and writes only ignored session metadata. It never formats, validates, stages, commits, or deploys.

Codex requires the project layer and exact hook definition to be trusted; review it through
`/hooks` once when starting a new session. Claude may require project trust and a hook reload.
No trust bypass or global setting is installed. Hooks added during an existing chat may not load
until restart/reload. If hooks are disabled, unsupported, or rejected, use the portable anchor flow.

OpenCode has project role slash commands here, but no lifecycle plugin is installed. Its agent
keeps the nonce anchor in the compaction summary and treats a fresh chat as unactivated. Hosts
that clear context without exposing a reset event or a new session identity cannot provide a
deterministic automatic reset through these Markdown instructions alone. In that case, ask the
agent to reset its role before clearing, or activate the role explicitly in the cleaned chat.
Do not restore a role solely because an old checkpoint still exists.

The helper behavior is covered by isolated tests; actual platform hook delivery/trust must be
confirmed in the installed host. See [Codex hooks](https://learn.chatgpt.com/docs/hooks),
[Claude hooks](https://code.claude.com/docs/en/hooks#sessionstart), and
[OpenCode commands](https://opencode.ai/docs/commands/).

## Task worktrees after activation

Activation does not create a checkout. After it, the role skill runs `npm run task:start -- --role <role>` so each
allocated task gets its own `.worktrees/<slot>` on the allocated branch, with a registry snapshot for `check:task`.
The role stays attached to the session that activated it; a worktree the skill creates for an allocated task is
part of that session. Opening a chat directly inside a different worktree still needs a fresh activation.
