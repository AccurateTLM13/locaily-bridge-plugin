# Operating modes

The plugin supports three operating modes with increasing automation.

## Manual mode (MVP)

The agent must explicitly call the LocAIly tools. No automatic observation.

```
Agent calls:
  locaily_project_context
  locaily_report_progress
  locaily_report_decision
  locaily_report_blocker
  locaily_submit_handoff
```

**Best for:** First implementation. Behavior is visible and easy to debug.

## Assisted mode

The plugin automatically loads context and suggests updates, but the agent confirms them.

```
Plugin detected 4 changed files.
Include them in the handoff?
```

**Best for:** After the core loop is proven reliable. Reduces agent overhead while keeping agent in control.

## Enforced mode

The plugin automatically:

- Creates sessions when OpenCode opens a repository
- Records evidence from commands and file changes
- Requires a valid handoff with evidence before session close
- Blocks submission if guardrails fail

**Best for:** Production use after the workflow is proven reliable. Requires Phase 3+ implementation.

## Mode selection

The mode could be set in `.opencode/locaily.json`:

```json
{
  "schemaVersion": "locaily.project-link.v1",
  "projectId": "doughboy-vinyl-technologies",
  "localBrain": "D:/LocAIly/local-brain",
  "repository": "C:/Projects/doughboy-vinyl",
  "mode": "manual"
}
```
