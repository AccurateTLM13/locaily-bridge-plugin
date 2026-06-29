# Build phases

> **Current implementation note:**
>
> Phases 1–6 have been broadly scaffolded, but they have not all been verified.
> Do not continue implementing this file sequentially as though earlier phases
> are complete. Use `120-completion-plan.md` for the current development order.

## Phase status summary

| Phase   | Current status                                    |
| ------- | ------------------------------------------------- |
| Phase 1 | **Implemented but integration-unverified**        |
| Phase 2 | **Partial**                                       |
| Phase 3 | **Partial; not connected to OpenCode hooks**      |
| Phase 4 | **Implemented structurally; contract-unverified** |
| Phase 5 | **Partial; mostly post-action auditing**          |
| Phase 6 | **Modeled; concurrency-unverified**               |



## Phase 1 — Project link

Build only:
- `.opencode/locaily.json` schema and loading
- Project resolution from registry
- Local Brain path resolution
- Context file loading from Local Brain
- One tool: `locaily_project_context`

```
OpenCode repo → Project registry → Local Brain context
```

**Depends on:** Nothing external beyond filesystem access.

---

## Phase 2 — Manual handoff

Add:
- Session creation and management
- Progress reporting tool
- Blocker reporting tool
- Decision reporting tool
- Structured handoff builder
- File-based Local Brain updates (write session, write handoff)
- Handoff submission tool

**Depends on:** Phase 1.

---

## Phase 3 — Evidence capture

Add:
- Automatic changed-file tracking (filesystem watcher)
- Command execution tracking
- Validation result recording
- Git branch and commit metadata capture
- Evidence-backed handoff cross-checking

**Depends on:** Phase 2.

---

## Phase 4 — Local Brain API

Add HTTP API client to replace direct file access:

```
POST /sessions
POST /sessions/:id/events
GET  /projects/:id/context
POST /projects/:id/handoffs
```

Both `file-client.ts` and `http-client.ts` implement the same `LocalBrainClient` interface.

**Depends on:** Local Brain HTTP API existing.

---

## Phase 5 — Guardrails

Add:
- Scope violation warnings
- Missing-validation warnings at session end
- Unreported-change detection
- Stale-context detection (context hasn't been refreshed)
- Objective conflict detection

**Depends on:** Phase 3 (needs evidence capture).

---

## Phase 6 — Multi-agent support

Add:
- Parent and child session hierarchy
- Worker assignment records
- Delegation tracking
- Shared objective state across sessions
- Conflicting-file detection between concurrent agents
- Consolidated supervisor handoffs

**Depends on:** Phase 5.

## Dependency graph

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 5 ──→ Phase 6
                                      │
                                      └── Phase 4 (optional, parallel)
```
