# Core responsibilities

The plugin has five responsibilities. Each must be implemented in some form before the plugin is useful.

## A. Discover the project

When OpenCode starts inside a repository, the plugin identifies:

- Repository path
- Git repository root
- Current branch
- Project ID
- Local Brain location
- Active build slice
- Relevant project context files

The agent should not waste time searching the entire computer. Discovery is driven by `.opencode/locaily.json`.

## B. Load only the needed context

The plugin retrieves a compact context package from the Local Brain:

- Project identity
- Current objective
- Active build slice
- Known constraints
- Recent decisions
- Current blockers
- Relevant architecture
- Validation requirements
- Stopping conditions

### Context priority order

1. Active objective
2. Current build slice
3. Project rules
4. Recent decisions
5. Relevant architecture
6. Prior task handoff
7. Older historical context

Never dump the entire project history into the prompt. Enforce a context budget.

## C. Create a session record

Every OpenCode work session gets a traceable session record:

```json
{
  "sessionId": "ses_2026_06_28_001",
  "projectId": "doughboy-vinyl-technologies",
  "repository": "C:/Projects/doughboy-vinyl",
  "branch": "feat/checkout-redesign",
  "objectiveId": "obj_checkout_004",
  "startedAt": "2026-06-28T18:42:00-05:00",
  "status": "active"
}
```

This becomes the thread connecting:
- The original objective
- The agent session
- Code changes
- Commands executed
- Validation evidence
- Final handoff

## D. Collect evidence

Record meaningful events, not every keystroke:

- Files read
- Files changed
- Commands executed
- Tests run and results
- Build results
- Git branch changes
- Errors encountered
- Decisions made
- Blockers discovered
- Objective changes
- Agent completion

Event classes:

| Class      | Examples                                 |
|------------|------------------------------------------|
| Context    | Project loaded, objective loaded         |
| Work       | File modified, command executed          |
| Validation | Test, lint, build                        |
| Decision   | Scope choice, architecture choice        |
| Failure    | Command failure, missing dependency      |
| Handoff    | Completed, blocked, paused               |

## E. Produce a structured handoff

Before the agent leaves, the plugin requires a structured result:

- Status
- Work completed
- Files changed
- Validation performed
- Decisions made
- Blockers
- Remaining work
- Recommended next action

The handoff must be generated from both agent-reported conclusions AND plugin-observed evidence. This prevents the agent from claiming a test passed when no test command was recorded.
