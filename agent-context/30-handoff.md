# Final handoff

The handoff is the plugin's core output contract. It must be structured, verifiable, and actionable.

## Schema

```json
{
  "sessionId": "ses_2026_06_28_001",
  "projectId": "doughboy-vinyl-technologies",
  "objectiveId": "obj_checkout_004",
  "status": "completed",
  "summary": "Implemented the responsive checkout layout and form structure.",
  "changedFiles": [
    "src/checkout/CheckoutPage.tsx",
    "src/checkout/checkout.css"
  ],
  "validation": [
    {
      "command": "npm run lint",
      "status": "passed"
    },
    {
      "command": "npm test",
      "status": "passed"
    }
  ],
  "decisions": [
    {
      "decision": "Retained the existing checkout state manager.",
      "reason": "Replacing it was outside the active slice."
    }
  ],
  "blockers": [],
  "nextRecommendedAction": "Connect the layout to the payment provider test environment."
}
```

## Field requirements

| Field                   | Required | Notes                                        |
|-------------------------|----------|----------------------------------------------|
| sessionId               | yes      | Must match active session                    |
| projectId               | yes      | Must match resolved project                  |
| objectiveId             | yes      | Must match active objective                  |
| status                  | yes      | One of: completed, blocked, paused, failed   |
| summary                 | yes      | 1-3 sentences                                |
| changedFiles            | yes      | At least one entry if status=completed       |
| validation              | no       | Required if project requires validation      |
| decisions               | no       | Record scope-affecting choices               |
| blockers                | yes      | Empty array if none                          |
| nextRecommendedAction   | no       | Useful for multi-session work                |

## Status values

| Status      | Meaning                                         |
|-------------|-------------------------------------------------|
| completed   | Objective achieved, all validation passed       |
| blocked     | Cannot proceed; blocker must be resolved first  |
| paused      | Partial progress; will resume later             |
| failed      | Work attempted but could not be completed       |

## Evidence cross-checking

The plugin must verify handoff claims against recorded events:

| Handoff claim         | Required evidence                               |
|-----------------------|-------------------------------------------------|
| `validation.passed`   | A `validation.completed` event with exitCode 0 |
| `changedFiles`        | `file.changed` events for each file             |
| `blockers`            | `blocker.encountered` events or explicit report |
| `status: completed`   | All required validation passed                  |

If evidence contradicts the handoff, the plugin should warn or block submission.
