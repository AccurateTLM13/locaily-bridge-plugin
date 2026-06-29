# Local Brain records

The Local Brain must store four record types to support the plugin.

## Record types

```
Project
├── Objectives
│    └── Build slices
├── Sessions
│    └── Events
├── Decisions
├── Blockers
└── Handoffs
```

## 1. Project

Top-level project identity and metadata.

```json
{
  "projectId": "doughboy-vinyl-technologies",
  "name": "Doughboy Vinyl Technologies",
  "repository": "C:/Projects/doughboy-vinyl",
  "createdAt": "2026-01-15T10:00:00-05:00",
  "activeObjectiveId": "obj_checkout_004"
}
```

## 2. Objective

A discrete development objective with bounded scope.

```json
{
  "objectiveId": "obj_checkout_004",
  "projectId": "doughboy-vinyl-technologies",
  "title": "Checkout redesign foundation",
  "scope": "Checkout layout and form structure",
  "outOfScope": [
    "Payment processing changes",
    "Production configuration",
    "Unrelated dependencies"
  ],
  "validation": [
    "npm run lint",
    "npm test",
    "responsive layout check"
  ],
  "stopConditions": [
    "Slice is complete and all validation passes",
    "Blocker prevents verified progress"
  ],
  "activeSlice": "checkout-layout-and-form",
  "status": "active",
  "priority": "high"
}
```

## 3. Session

A single agent work session.

```json
{
  "sessionId": "ses_2026_06_28_001",
  "projectId": "doughboy-vinyl-technologies",
  "objectiveId": "obj_checkout_004",
  "repository": "C:/Projects/doughboy-vinyl",
  "branch": "feat/checkout-redesign",
  "startedAt": "2026-06-28T18:42:00-05:00",
  "endedAt": null,
  "status": "active",
  "eventCount": 0
}
```

## 4. Handoff

The structured output produced at session end.

See `30-handoff.md` for the full schema definition.

## File-based storage layout

```
{localBrain}/
├── projects/
│   └── {projectId}/
│       ├── project.json
│       ├── objectives/
│       │   ├── obj_001.json
│       │   └── active.json        # symlink or copy of active objective
│       ├── decisions/
│       │   └── dec_001.json
│       ├── sessions/
│       │   ├── ses_001.json
│       │   └── ses_001/
│       │       └── events.jsonl
│       └── handoffs/
│           └── hof_001.json
```
