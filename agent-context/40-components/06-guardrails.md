# Component: Guardrails

The plugin should warn or stop the agent when certain conditions are not met.

## Warning conditions

- No project registry exists at `.opencode/locaily.json`
- The repository path does not match the registered path
- No active objective is assigned to the project
- The agent attempts work outside the active slice scope
- Required validation has not been run when the session ends
- The handoff lacks evidence to support its claims
- Local Brain path or API is unreachable
- Files have been changed but not listed in the handoff

## Guardrail responses

| Severity | Behavior                                    |
|----------|---------------------------------------------|
| info     | Log a message; continue normally            |
| warn     | Log warning; ask agent to confirm continue  |
| block    | Prevent handoff submission until resolved   |

## Example block

```
Handoff blocked:
`npm test` is required by the active build slice but no successful run was recorded.
```

## Implementation approach

Guardrails are checked at two points:

1. **During session** — scope warnings when agent does something outside the active slice
2. **At session end** — pre-submission validation of the handoff against evidence

For the MVP, implement only session-end guardrails. Add real-time monitoring in Phase 5.

## Guardrail rules table

| Rule                              | Check point      | Severity |
|-----------------------------------|------------------|----------|
| Registry exists                   | Session start    | block    |
| Repository matches                | Session start    | warn     |
| Objective exists                  | Session start    | block    |
| Work within slice scope           | During session   | warn     |
| Validation evidence matches       | Session end      | block    |
| All changed files reported        | Session end      | warn     |
| Local Brain reachable             | Session end      | warn     |
