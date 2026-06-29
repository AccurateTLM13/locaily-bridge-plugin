# Minimum Viable Product

Do **not** begin with automatic monitoring of every OpenCode event.

## MVP scope

Build exactly five pieces:

```
1. .opencode/locaily.json          — registry file
2. Project resolver                 — resolve-project.ts
3. Context loader                   — build-context.ts
4. Manual progress/blocker tools    — report-progress, report-blocker, report-decision
5. Structured final handoff         — build-handoff, verify-handoff, submit-handoff
```

## What the MVP proves

```
Identify project
      ↓
Load correct context
      ↓
Perform scoped work
      ↓
Report verified outcome
      ↓
Update Local Brain
```

## Success criterion

> An OpenCode agent can enter any registered repository, load the correct active objective, complete one bounded task, and write a structured handoff back to the Local Brain without the user manually copying context between systems.

## What the MVP does NOT include

- Automatic file watching
- Command interception
- Automatic evidence collection
- HTTP API client
- Guardrails beyond handoff schema validation
- Multi-agent support

## Build order within MVP

1. Create the `locaily.json` schema and TypeScript types
2. Implement `resolve-project.ts` — read locaily.json, resolve paths
3. Implement `build-context.ts` — read Local Brain files, produce markdown
4. Implement `locaily_project_context` tool
5. Implement session creation and `record-event.ts`
6. Implement `locaily_report_progress`, `locaily_report_decision`, `locaily_report_blocker` tools
7. Implement `build-handoff.ts`, `verify-handoff.ts` (schema validation only), `submit-handoff.ts`
8. Implement `locaily_submit_handoff` tool
9. Wire everything together in `index.ts`
10. Test end-to-end with a real repository

## File-based Local Brain structure for MVP

Minimal file structure required on the Local Brain:

```
{localBrain}/
└── projects/
    └── {projectId}/
        ├── project.json
        ├── objectives/
        │   └── active.json
        └── sessions/
```

The MVP reads `project.json` and `objectives/active.json` to build context, and writes session + handoff JSON files.
