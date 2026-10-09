# Parallel development kickoff

Start: 7:51 PM Oct 9 (T+0). Feature freeze T+11 = 6:51 AM. Submit by T+14 = 9:51 AM. Deadline 10:00 AM.
Base revision for all three streams: `924fe03`. The AI coordinator runs integration (D-11).

## Streams

| Task     | Role     | Branch                                       | Owns                                                                                        |
| -------- | -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| TASK-201 | backend  | `codex/feat/task-201-rules-scoring-pipeline` | `src/pipeline/`, `src/rules/`, `src/score/`, `src/explain/`, `keywords.json`, `brands.json` |
| TASK-202 | model    | `codex/feat/task-202-local-ai-eval`          | `src/ai/`, `src/data/archetypes.json`, `eval/`                                              |
| TASK-203 | frontend | `codex/feat/task-203-mobile-ui-pwa`          | `src/ui/`, `src/main.tsx`, `src/styles.css`, `src/sw.ts`, `public/`                         |

Shared and coordinator-owned (propose changes, do not edit): `src/types.ts`, `package.json`,
lockfile, `tsconfig.json`, `vite.config.ts`, `index.html`, `coordination.json`, `PLAN.md`, `RULES.md`.
Need a new dependency? Ask the coordinator; do not run `npm install` on your branch.

## Start on your own device

```sh
git clone https://github.com/argylleee/sane.git && cd sane
npm run setup && git switch -c <your branch above> 924fe03
```

Then in your chat run once: `/role-backend`, `/role-model`, or `/role-frontend`.
Before editing and before handoff the agent runs `npm run check:task -- --task TASK-20X --allocation 1`.

## Milestones (clock times assume the 7:51 PM start)

| Milestone                           | Target     | Primary owner                                            |
| ----------------------------------- | ---------- | -------------------------------------------------------- |
| M0 setup, public URL, device check  | 8:51 PM    | coordinator + frontend                                   |
| M1 vertical slice, no models        | 11:51 PM   | backend (rules, score, templates), frontend (verdict UI) |
| M2 embeddings and archetypes        | 2:51 AM    | model                                                    |
| M3 offline and PWA                  | 4:21 AM    | frontend, model (model caching)                          |
| M4 OCR and optional LLM             | 6:51 AM    | model                                                    |
| Freeze, eval, rehearsal, submission | 6:51 AM on | everyone; coordinator integrates                         |

## Integration protocol

Commit small, push your own branch often, and report "ready" with the check output. Only the
coordinator merges to `main`, in dependency order, and runs the combined validation and demo path.
The app must always run: keep every stub contract in `src/types.ts` working.
