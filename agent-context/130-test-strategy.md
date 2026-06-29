# Test strategy

## Required test framework

Use a maintained TypeScript-compatible test framework.

Add these scripts:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:integration": "vitest run tests/integration",
    "test:smoke": "node scripts/smoke-test.mjs",
    "lint": "eslint .",
    "validate": "npm run typecheck && npm run lint && npm test && npm run build"
  }
}
```

Equivalent tools may be used when justified, but the same validation coverage is required.

## Unit tests

Cover:

### Configuration

* Valid configuration
* Missing configuration
* Invalid schema version
* Relative paths
* Windows paths
* Repository mismatch
* Unknown mode
* Missing HTTP URL

### Project resolution

* Git repository root
* Nested working directory
* Detached HEAD
* Non-Git directory
* Worktree repository

### Context

* Priority ordering
* Context truncation
* Empty sections
* Required scope and validation sections

### Sessions

* Unique IDs
* Idempotent initialization
* Correct OpenCode-to-LocAIly mapping
* Session isolation
* Async write failure
* Cleanup

### Evidence

* Changed-file deduplication
* Command evidence
* Validation evidence
* Failed validation
* Duplicate events
* Session ownership

### Handoffs

* Valid completed handoff
* Missing evidence
* Contradictory validation
* Blocked handoff
* Paused handoff
* Unreported changed file

### Guardrails

* Warning mode
* Blocking mode
* Allowed file
* Disallowed file
* Allowed command
* Disallowed command
* Missing validation

## Contract tests

Run the same behavior suite against:

* `FileBrainClient`
* `HttpBrainClient`

Both must satisfy `LocalBrainClient`.

## Integration tests

Use temporary directories and fixtures.

Required integration flow:

1. Create repository fixture.
2. Create `.opencode/locaily.json`.
3. Create Local Brain fixture.
4. Resolve project.
5. Load context.
6. Create session.
7. Record file and validation events.
8. Submit handoff.
9. Close session.
10. Assert persisted records.

## OpenCode adapter tests

Mock the verified OpenCode plugin context.

Test:

* Plugin export shape
* Tool registration
* Tool argument parsing
* Session ID propagation
* Directory propagation
* Before/after hook behavior
* Session cleanup

## Real smoke test

A real installed OpenCode instance must:

1. Load the plugin.
2. Display or expose LocAIly tools.
3. Call `locaily_project_context`.
4. Record progress.
5. Record validation.
6. Submit a handoff.
7. Persist all expected records.

Mocks alone do not satisfy the release gate.
