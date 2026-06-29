# Agent work directive

## Objective

Finish the LocAIly OpenCode Bridge Plugin by correcting its OpenCode integration, proving the core lifecycle, adding tests, and then restoring advanced phases only after the foundation passes.

## Required reading

Read in this order:

1. `100-current-state-audit.md`
2. `110-opencode-integration-contract.md`
3. `120-completion-plan.md`
4. `130-test-strategy.md`
5. `140-acceptance-criteria.md`
6. `150-release-gate.md`

Use earlier architecture files as design context, not as evidence that implementation is complete.

## Rules

1. Verify the official OpenCode API used by the installed dependency.
2. Do not invent plugin hooks or tool contracts.
3. Preserve sound internal logic where possible.
4. Replace invalid external integration code.
5. Do not add new features.
6. Disable Phase 6 tools until the core lifecycle passes.
7. Add tests alongside each correction.
8. Run validation after every completed stage.
9. Record failures honestly.
10. Do not call the project complete based only on compilation.

## Immediate work order

### Task 1

Correct `src/index.ts` and register only `locaily_project_context`.

### Task 2

Prove that the plugin loads inside a real OpenCode session.

### Task 3

Add the runtime session store keyed by OpenCode session ID.

### Task 4

Make session creation, event recording, and close-out fully asynchronous.

### Task 5

Enable the six core tools and prove one file-mode lifecycle.

### Task 6

Add unit, contract, integration, and smoke tests.

### Task 7

Connect verified OpenCode lifecycle hooks.

### Task 8

Activate guardrails.

### Task 9

Verify HTTP mode.

### Task 10

Restore and test multi-agent features.

## Required final report

Return:

### Status

One of:

- Prototype
- Alpha
- Beta
- Release candidate
- Blocked

### OpenCode compatibility

- OpenCode version
- Plugin package version
- Node version
- Operating system

### Files changed

List all changed files.

### Integration proof

State exactly how OpenCode loading was verified.

### Validation

For every command:

- Command
- Result
- Exit code

### Tests

- Unit test count
- Integration test count
- Contract test count
- Smoke-test result

### Remaining limitations

List unresolved limitations explicitly.

### Phase status

For each phase, use:

- Not started
- Partial
- Implemented but unverified
- Verified

Do not report a phase as verified without corresponding acceptance evidence.
