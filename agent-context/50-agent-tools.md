# Agent-facing tools

The plugin exposes a small set of tools for the coding agent to call.

## `locaily_project_context`

Returns the active project context package.

**Parameters:** none

**Returns:** Markdown string with project, objective, active slice, constraints, validation requirements, stop conditions, and prior handoff.

**When to call:** At session start and anytime the agent needs to reorient.

---

## `locaily_report_progress`

Records meaningful progress.

**Parameters:**

```json
{
  "summary": "Completed the checkout form structure.",
  "files": ["src/checkout/CheckoutForm.tsx"]
}
```

**Returns:** confirmation with event ID.

**When to call:** After completing a discrete unit of work (file written, component built, test passing).

---

## `locaily_report_decision`

Records a development decision.

**Parameters:**

```json
{
  "decision": "Use the existing validation library.",
  "reason": "It already supports the required schemas."
}
```

**Returns:** confirmation with event ID.

**When to call:** When making scope-affecting or architectural choices.

---

## `locaily_report_blocker`

Reports a blocker immediately.

**Parameters:**

```json
{
  "blocker": "Payment sandbox credentials are missing.",
  "impact": "Payment submission cannot be validated."
}
```

**Returns:** confirmation with event ID.

**When to call:** When something prevents progress and the agent cannot resolve it.

---

## `locaily_submit_handoff`

Closes the work session and updates the Local Brain.

**Parameters:**

```json
{
  "status": "completed",
  "summary": "Built checkout form layout.",
  "changedFiles": ["src/checkout/CheckoutForm.tsx"],
  "validation": [
    { "command": "npm run lint", "status": "passed" }
  ],
  "decisions": [],
  "blockers": [],
  "nextRecommendedAction": "Connect to payment sandbox."
}
```

**Returns:** handoff ID and any guardrail warnings or blocks.

**When to call:** When the agent has completed (or must stop) the current objective.

---

## Tool summary

| Tool                      | Phase | Purpose                          |
|---------------------------|-------|----------------------------------|
| `locaily_project_context` | 1     | Load context                     |
| `locaily_report_progress` | 2     | Record progress during session   |
| `locaily_report_decision` | 2     | Record design decisions          |
| `locaily_report_blocker`  | 2     | Report blocking issues           |
| `locaily_submit_handoff`  | 2     | End session with structured handoff |
