# Completion plan

## Objective

Convert the current broad prototype into a valid, tested, installable OpenCode plugin.

## Development order

The work must proceed vertically. Do not continue to a later stage until the current stage passes its gate.

---

## Stage 1 — Correct the OpenCode boundary

### Work

- Add the official OpenCode plugin dependency.
- Replace the custom plugin entry point.
- Implement the official plugin function.
- Convert or adapt one tool only:
  - `locaily_project_context`
- Use the OpenCode-provided directory or worktree.
- Return the resolved project context.

### Gate

A real OpenCode session loads the plugin and can call `locaily_project_context`.

Stop and fix the integration if this does not work.

---

## Stage 2 — Prove file-mode lifecycle

### Work

Implement and test this exact path:

```text
OpenCode starts
→ project config resolves
→ Local Brain context loads
→ session record is created
→ progress event is written
→ validation evidence is written
→ handoff is submitted
→ session closes
```

Enable only:

* project context
* progress
* decision
* blocker
* validation
* handoff

### Gate

A temporary Local Brain fixture contains valid session, event, and handoff records after one real OpenCode task.

---

## Stage 3 — Correct session architecture

### Work

* Replace module-level `current`.
* Introduce `RuntimeSessionStore`.
* Key sessions by OpenCode session ID.
* Make initialization and closing asynchronous.
* Await all Local Brain writes.
* Make duplicate initialization idempotent.
* Add cleanup on session close.

### Gate

Two independent session instances can run without sharing evidence, context, or identifiers.

---

## Stage 4 — Connect evidence hooks

### Work

* Subscribe to verified OpenCode hooks.
* Record actual file modifications.
* Record actual command/tool execution.
* Derive validation evidence from configured validation commands.
* Prevent duplicate evidence when manual and automatic reporting overlap.

### Gate

The handoff reflects real actions without requiring the agent to manually report every changed file and command.

---

## Stage 5 — Activate guardrails

### Work

* Inspect tool actions before execution where supported.
* Compare file and command actions against active scope.
* Add clear warn/block behavior by operating mode.
* Ensure manual mode never unexpectedly blocks development.
* Require evidence for completed handoffs.

### Gate

Tests prove:

* Manual mode records warnings.
* Assisted mode surfaces warnings.
* Enforced mode blocks configured violations.
* Required validation cannot be falsely claimed.

---

## Stage 6 — Verify HTTP mode

### Work

* Define the Local Brain HTTP contract.
* Add timeout and authentication handling.
* Validate response payloads.
* Test file and HTTP clients against the same contract suite.
* Document retry behavior.

### Gate

The same lifecycle integration suite passes in file and HTTP modes.

---

## Stage 7 — Restore Phase 6 features

Only begin after Stages 1–6 pass.

### Work

* Re-enable delegation tools.
* Give every parent and worker an isolated runtime session.
* Test hierarchy persistence.
* Test conflicting-file detection.
* Test child handoff consolidation.
* Test worker failure and partial completion.

### Gate

Two concurrent worker fixtures remain isolated and produce one valid consolidated handoff.

---

## Stage 8 — Packaging and release

### Work

* Add a root README.
* Add installation instructions.
* Add a sample configuration.
* Add compatibility documentation.
* Add CI.
* Build from a clean checkout.
* Install the built package into OpenCode.
* Run the smoke test.

### Gate

A new user can install and run the plugin using only repository documentation.
