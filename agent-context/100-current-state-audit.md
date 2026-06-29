# Current state audit

## Status

The repository contains substantial internal implementation for Phases 1–6, but it is not yet a verified OpenCode plugin.

Do not treat the existence of files or TypeScript classes as proof that a phase is complete.

## Confirmed strengths

The repository already contains implementations or partial implementations for:

- Project configuration and resolution
- Git repository discovery
- File-based Local Brain client
- HTTP Local Brain client
- Context package construction
- Context budgeting
- Session records
- Evidence records
- Handoff construction
- Handoff verification
- Guardrails
- File observation
- Delegation records
- Session hierarchy
- Conflict detection
- Handoff consolidation
- JSON schemas

Preserve these components where they are sound.

## Critical defects

### 1. Invalid OpenCode plugin boundary

`src/index.ts` returns a custom `PluginManifest`.

The implementation must instead use the actual OpenCode plugin contract and return supported OpenCode hooks and tools.

The current custom fields:

- `name`
- `version`
- `description`
- `tools`
- `parameters`
- `handler`

must not be assumed to be valid OpenCode registration fields.

### 2. Tools are not registered through the OpenCode tool contract

The internal tool implementations currently use a custom `ToolDefinition`.

Add an adapter or migrate each tool to the official OpenCode tool definition.

The internal business logic may remain separate from the OpenCode adapter.

### 3. Runtime state is global

`session-manager.ts` stores one module-level `current` session.

This cannot safely represent multiple OpenCode sessions, repositories, parent sessions, or workers.

Replace global current-session state with a runtime store keyed by OpenCode session ID.

### 4. Async persistence is not consistently awaited

Session creation and event persistence include asynchronous client operations that are called from synchronous functions without awaiting completion.

Make session initialization asynchronous and await persistence operations.

### 5. Objective ID is not connected

The project-context tool currently passes `undefined` regardless of whether an objective exists.

Resolve and store the real objective ID.

### 6. Automatic evidence capture is not connected to OpenCode hooks

The repository contains observers, but the plugin entry point does not subscribe to actual OpenCode lifecycle events.

Connect evidence capture to supported OpenCode hooks.

### 7. Guardrails are mostly post-action checks

Guardrails currently inspect reported information but do not reliably inspect or prevent actual OpenCode tool operations.

Use before/after tool hooks where supported.

### 8. No automated test suite exists

The repository currently has no executable unit, integration, or end-to-end test suite.

### 9. No verified installation path exists

There is no repository evidence showing that OpenCode successfully loads the plugin and exposes its tools.

### 10. Multi-agent behavior is modeled but not proven

Delegation and hierarchy structures exist, but concurrent session isolation has not been demonstrated.

## Required development posture

The next development pass is a recovery and verification pass.

Do not add new features until the official OpenCode adapter, single-session lifecycle, and tests are working end to end.
