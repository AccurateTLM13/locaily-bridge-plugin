# Architecture

## System diagram

```
OpenCode
   │
   ▼
LocAIly Bridge Plugin
   │
   ├── Project discovery
   ├── Context loading
   ├── Session tracking
   ├── Evidence collection
   └── Handoff reporting
   │
   ▼
Local Brain (file or HTTP API)
```

## Data flow

### Session start

```
OpenCode opens repository
        ↓
Plugin finds Git root
        ↓
Plugin locates project registry (.opencode/locaily.json)
        ↓
Plugin resolves Local Brain project
        ↓
Plugin requests context package from Local Brain
        ↓
Plugin injects working context into agent prompt
        ↓
Plugin creates session record
```

### During session

```
Agent performs work
        ↓
Plugin records meaningful events:
  - Files read/changed
  - Commands executed
  - Tests run and results
  - Decisions made
  - Blockers encountered
        ↓
Agent can explicitly report progress via tools
```

### Session end

```
Agent finishes work
        ↓
Plugin gathers session evidence
        ↓
Agent produces structured handoff
        ↓
Plugin validates handoff schema
        ↓
Plugin checks evidence matches handoff claims
        ↓
Plugin sends update to Local Brain
        ↓
Local Brain updates project state
```

## Project identity example

```
Working directory:    C:\Projects\doughboy-vinyl
Resolved project:     doughboy-vinyl-technologies
Local Brain:          D:\LocAIly\local-brain
Active slice:         checkout-redesign
```

## Key design principles

1. **Context budget** — never dump the entire project history into a prompt
2. **Evidence-backed claims** — handoff assertions must be verifiable from recorded events
3. **Progressive automation** — start manual, add assistance, only enforce after proven reliable
4. **Repository-local config** — `.opencode/locaily.json` avoids drive scanning
5. **File-first, API-later** — initial implementation reads/writes local files; HTTP API comes in Phase 4
