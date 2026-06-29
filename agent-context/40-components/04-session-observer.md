# Component: Session Observer

Listens for relevant OpenCode activity and records evidence.

## Event classification

| Class      | Examples                                 |
|------------|------------------------------------------|
| Context    | Project loaded, objective loaded         |
| Work       | File modified, command executed          |
| Validation | Test, lint, build                        |
| Decision   | Scope choice, architecture choice        |
| Failure    | Command failure, missing dependency      |
| Handoff    | Completed, blocked, paused               |

## Implementation levels

### MVP (manual)

No automatic observation. The agent explicitly calls tools to report progress, decisions, and blockers. The observer simply records what the agent tells it.

### Phase 3 (evidence capture)

The observer hooks into OpenCode to automatically capture:

- File system changes (via chokidar or similar)
- Command execution (via shell wrapping)
- Git operations (branch changes, commits)
- Exit codes and command output

### Record format

```json
{
  "type": "validation.completed",
  "sessionId": "ses_2026_06_28_001",
  "command": "npm test",
  "result": "passed",
  "exitCode": 0,
  "timestamp": "2026-06-28T19:16:22-05:00"
}
```

## Evidence store

Events are accumulated in memory during a session and flushed to the Local Brain periodically or at session end.

```typescript
interface SessionEventStore {
  events: SessionEvent[];
  add(event: SessionEvent): void;
  getByType(type: string): SessionEvent[];
  getFileChanges(): string[];
  getValidationResults(): ValidationResult[];
  clear(): void;
}
```

## Cross-reference with handoff

Before session close, the observer's evidence store is used to verify handoff claims:

| Handoff claim         | Required evidence                               |
|-----------------------|-------------------------------------------------|
| `validation.passed`   | A `validation.completed` event with exitCode 0 |
| `changedFiles`        | `file.changed` events for each file             |
| `blockers`            | `blocker.encountered` events or explicit report |
| `status: completed`   | All required validation passed                  |
