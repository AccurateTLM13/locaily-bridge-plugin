# Plugin lifecycle

## Session start

After project discovery and context loading, the agent receives a compact project card:

```
PROJECT
Doughboy Vinyl Technologies

OBJECTIVE
Build the checkout redesign foundation.

ACTIVE SLICE
Checkout layout and form structure.

DO NOT
Change payment processing.
Modify production configuration.
Install unrelated dependencies.

VALIDATE
Run lint.
Run unit tests.
Verify responsive layout.

STOP WHEN
The slice is complete or a blocker prevents verified progress.
```

This is the agent's working contract for the session.

## During the session

The plugin records meaningful events. In manual mode (MVP), the agent explicitly reports progress, decisions, and blockers via tools. Later phases add automatic observation.

### Event record format

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

### Event types

| type                    | When                           |
|-------------------------|--------------------------------|
| `context.loaded`        | Project/objective loaded       |
| `file.read`             | Agent read a file              |
| `file.changed`          | Agent modified a file          |
| `command.executed`      | Shell command run              |
| `validation.started`    | Test/lint/build started        |
| `validation.completed`  | Test/lint/build finished       |
| `decision.made`         | Agent made a design decision   |
| `blocker.encountered`   | Something blocked progress     |
| `objective.changed`     | Active objective switched      |
| `session.completed`     | Agent finished work            |

## Session end

The agent completes work and the plugin orchestrates close-out:

1. Gather session evidence
2. Agent produces structured handoff
3. Validate handoff against schema
4. Cross-reference handoff claims with recorded evidence
5. Write handoff to Local Brain
6. Update session status to `completed` or `blocked`
7. Close session record

### Guardrails at session end

- **Handoff blocked** if required validation has no matching evidence
- **Warning** if files were changed but not listed in handoff
- **Warning** if Local Brain cannot be reached
- **Block** if handoff schema validation fails
