# OpenCode integration contract

## Purpose

This document defines the boundary between OpenCode and LocAIly Bridge internals.

The agent must verify the current official OpenCode plugin API before implementation. Do not rely on remembered or inferred API shapes.

## Required architecture

```text
OpenCode runtime
      ↓
OpenCode adapter
      ↓
LocAIly application services
      ↓
Local Brain client
```

OpenCode-specific types and hooks must remain in the adapter layer.

Core LocAIly logic should remain testable without starting OpenCode.

## Plugin entry point

`src/index.ts` must export a valid OpenCode plugin implementation.

It must:

1. Receive the OpenCode-provided plugin context.
2. Capture the OpenCode client, working directory, worktree, and session information made available by the API.
3. Register LocAIly tools using the supported OpenCode tool mechanism.
4. Register supported lifecycle hooks needed for evidence collection and cleanup.
5. Return only fields supported by the current OpenCode plugin API.

Do not preserve the custom `PluginManifest` as the external plugin API.

It may remain as an internal metadata type only if genuinely useful.

## Tool adapter

Each agent tool must expose the argument and execution contract expected by OpenCode.

Required tools:

* `locaily_project_context`
* `locaily_report_progress`
* `locaily_report_decision`
* `locaily_report_blocker`
* `locaily_record_validation`
* `locaily_submit_handoff`

Phase 6 tools must remain disabled until the single-session lifecycle passes all release gates:

* `locaily_delegate_task`
* `locaily_consolidate_handoffs`
* `locaily_check_conflicts`

## Context source

Prefer OpenCode-provided directory and worktree information.

Do not use `process.cwd()` as the authoritative repository identity when OpenCode provides an explicit directory.

## Session identity

OpenCode session identity and LocAIly session identity are separate values.

Store both:

```ts
interface RuntimeSession {
  openCodeSessionId: string;
  locailySessionId: string;
}
```

All runtime state must be keyed by `openCodeSessionId`.

## Event mapping

Map only verified OpenCode events.

Expected conceptual mappings:

| OpenCode activity            | LocAIly event          |
| ---------------------------- | ---------------------- |
| Context tool loads project   | `context.loaded`       |
| File modification completes  | `file.changed`         |
| Shell/tool command completes | `command.executed`     |
| Validation command completes | `validation.completed` |
| Agent reports decision       | `decision.made`        |
| Agent reports blocker        | `blocker.encountered`  |
| Session closes               | `session.completed`    |

Do not invent hook names. Confirm each hook against the installed OpenCode version.

## Error behavior

Plugin errors must be actionable and must not silently corrupt session state.

At minimum, handle:

* Missing `.opencode/locaily.json`
* Invalid configuration
* Repository mismatch
* Local Brain unavailable
* HTTP timeout
* Invalid response schema
* Missing active session
* Duplicate session initialization
* Failed event persistence
* Failed handoff submission
* Unsupported OpenCode API version

## Compatibility record

Record the tested OpenCode and plugin package versions in:

```text
docs/COMPATIBILITY.md
```

The plugin is not complete until those versions have been tested together.
