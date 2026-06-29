# Component: Handoff Builder

Produces a consistent, structured post-task update.

## Required fields

- Status (completed, blocked, paused, failed)
- Summary of work completed
- List of files changed
- Validation results
- Decisions made
- Blockers encountered
- Remaining work / next recommended action

## Construction flow

```
Agent signals completion
        ↓
Handoff builder collects:
  1. Agent-reported conclusions (via tool call)
  2. Observer evidence (actual events recorded)
        ↓
Merge two sources:
  - Use agent's summary, decisions, and blockers
  - Use observer's file changes and validation results
  - Cross-reference: warn if agent claims test passed but no evidence
        ↓
Build handoff object
        ↓
Validate against handoff.schema.json
        ↓
Return validated handoff (or errors)
```

## Conflict resolution

If agent-reported data conflicts with observed evidence:

| Conflict                          | Resolution                                   |
|-----------------------------------|----------------------------------------------|
| Agent claims test passed, no run  | Warn; block handoff if validation required   |
| Agent lists 2 files, 5 changed    | Include all changed files; flag discrepancy  |
| Agent says no blockers, errors exist | Include errors as blockers; warn agent     |

## Output

The handoff builder returns a validated `HandoffRecord` ready for submission to the Local Brain.

```typescript
interface HandoffBuilderResult {
  handoff: HandoffRecord;
  warnings: string[];
  valid: boolean;
}
```
