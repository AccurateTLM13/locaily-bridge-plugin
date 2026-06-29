# Repository structure

```
locaily-opencode-plugin/
├── package.json
├── README.md
├── src/
│   ├── index.ts                    # Plugin entry point
│   ├── config/
│   │   ├── load-config.ts          # Read .opencode/locaily.json
│   │   └── schema.ts               # TypeScript types for config
│   ├── project/
│   │   ├── resolve-project.ts      # Project resolution logic
│   │   └── repository-info.ts      # Git info extraction
│   ├── brain/
│   │   ├── client.ts               # LocalBrainClient interface
│   │   ├── file-client.ts          # File-system implementation
│   │   └── http-client.ts          # HTTP API implementation
│   ├── context/
│   │   ├── build-context.ts        # Context package builder
│   │   └── context-budget.ts       # Context size enforcement
│   ├── sessions/
│   │   ├── create-session.ts       # Session creation
│   │   ├── record-event.ts         # Event recording
│   │   └── close-session.ts        # Session close-out
│   ├── handoff/
│   │   ├── build-handoff.ts        # Handoff construction
│   │   ├── verify-handoff.ts       # Evidence cross-check
│   │   └── submit-handoff.ts       # Write to Local Brain
│   ├── tools/
│   │   ├── project-context.ts      # locaily_project_context
│   │   ├── report-progress.ts      # locaily_report_progress
│   │   ├── report-decision.ts      # locaily_report_decision
│   │   ├── report-blocker.ts       # locaily_report_blocker
│   │   └── submit-handoff.ts       # locaily_submit_handoff
│   └── schemas/
│       ├── project-link.schema.json
│       ├── session.schema.json
│       ├── event.schema.json
│       └── handoff.schema.json
└── tests/
```

## Key files

| File                          | Responsibility                                |
|-------------------------------|----------------------------------------------|
| `src/index.ts`                | Plugin registration and initialization        |
| `src/config/load-config.ts`   | Read `.opencode/locaily.json`                 |
| `src/project/resolve-project.ts` | Map repo to Local Brain project           |
| `src/brain/client.ts`         | `LocalBrainClient` interface                  |
| `src/brain/file-client.ts`    | File-based Local Brain communication          |
| `src/context/build-context.ts` | Build compact context for the agent           |
| `src/sessions/create-session.ts` | Start a new session record                 |
| `src/tools/*.ts`              | One file per agent tool                       |
| `src/handoff/verify-handoff.ts` | Cross-check handoff against evidence        |
