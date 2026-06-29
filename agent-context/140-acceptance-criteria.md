# Acceptance criteria

## Core plugin

- [ ] OpenCode loads the plugin without startup errors.
- [ ] The plugin uses the official OpenCode plugin contract.
- [ ] OpenCode exposes all enabled LocAIly tools.
- [ ] Tool schemas are accepted by OpenCode.
- [ ] The plugin uses OpenCode-provided repository context.
- [ ] No external runtime behavior depends on the custom `PluginManifest`.

## Project context

- [ ] A valid project resolves from `.opencode/locaily.json`.
- [ ] The repository path is checked.
- [ ] The active objective ID is preserved.
- [ ] Context respects its configured budget.
- [ ] Missing Local Brain context returns an actionable error.

## Sessions

- [ ] Session creation is asynchronous and awaited.
- [ ] Runtime state is keyed by OpenCode session ID.
- [ ] Two sessions do not share context or evidence.
- [ ] Session closing waits for persisted events.
- [ ] Failed persistence is surfaced.

## Evidence

- [ ] Actual file edits produce evidence.
- [ ] Actual command execution produces evidence.
- [ ] Validation evidence includes the command, status, and exit code.
- [ ] Events belong to the correct session.
- [ ] Duplicate events are controlled.

## Handoffs

- [ ] Handoff schemas are validated.
- [ ] Completed status requires configured validation evidence.
- [ ] Changed files are checked against evidence.
- [ ] Failed validation prevents a completed handoff in enforced mode.
- [ ] Successful submission closes the session.
- [ ] Failed submission does not falsely close the session.

## Guardrails

- [ ] Manual, assisted, and enforced modes behave differently as documented.
- [ ] Guardrails inspect real operations where the OpenCode API permits.
- [ ] Scope violations produce actionable messages.
- [ ] Guardrails do not rely exclusively on agent self-reporting.

## Backends

- [ ] File mode passes the lifecycle suite.
- [ ] HTTP mode passes the same lifecycle suite.
- [ ] HTTP timeouts are bounded.
- [ ] Authentication failures are explicit.
- [ ] Invalid HTTP responses are rejected.

## Multi-agent

- [ ] Disabled until the core lifecycle passes.
- [ ] Parent and worker sessions have isolated state.
- [ ] Delegations persist.
- [ ] Conflicts are associated with the correct workers.
- [ ] Consolidation rejects missing worker handoffs.

## Repository quality

- [ ] `npm run validate` passes from a clean checkout.
- [ ] CI runs the same validation command.
- [ ] Root README includes installation and usage.
- [ ] Compatibility versions are documented.
- [ ] No generated build output is committed unless intentionally required.
