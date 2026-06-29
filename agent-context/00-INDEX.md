# LocAIly Bridge Plugin — Agent Context Index

This folder contains the complete specification for building the LocAIly OpenCode Bridge Plugin. Read in numeric order for progressive understanding.

## Reading order

| # | File | What it covers |
|---|------|----------------|
| 00 | `00-INDEX.md` | This file — navigation map |
| 01 | `01-purpose.md` | Why this plugin exists and the core loop |
| 02 | `02-architecture.md` | System diagram, data flow, operating context |
| 10 | `10-core-responsibilities.md` | The 5 things the plugin must do |
| 20 | `20-plugin-lifecycle.md` | Session start, during, and end behavior |
| 30 | `30-handoff.md` | Structured handoff contract and schema |
| 40 | `40-components/` | Six internal plugin components |
| 50 | `50-agent-tools.md` | Tools exposed to the coding agent |
| 60 | `60-repository-structure.md` | Suggested file layout for the plugin |
| 70 | `70-local-brain-records.md` | Record types the Local Brain must store |
| 80 | `80-operating-modes.md` | Manual, assisted, enforced modes |
| 90 | `90-build-phases.md` | Six incremental build phases |
| 99 | `99-mvp.md` | Minimum viable product — what to build first |
| — | `schemas/` | JSON Schema files for data contracts |
| — | `examples/` | Example files for each record type |

## Key data contracts

- `schemas/project-link.schema.json` — `.opencode/locaily.json` format
- `schemas/session.schema.json` — Session record format
- `schemas/event.schema.json` — Event record format  
- `schemas/handoff.schema.json` — Handoff record format

## Completion and verification documents

The original documents describe the intended architecture. The following documents govern completion of the current implementation:

| # | File | Purpose |
|---|---|---|
| 100 | `100-current-state-audit.md` | Verified gaps and defects in the current prototype |
| 110 | `110-opencode-integration-contract.md` | Required boundary with the real OpenCode API |
| 120 | `120-completion-plan.md` | Ordered recovery and completion stages |
| 130 | `130-test-strategy.md` | Required test layers and scenarios |
| 140 | `140-acceptance-criteria.md` | Definition of finished behavior |
| 150 | `150-release-gate.md` | Evidence required before release |
| 160 | `160-agent-work-directive.md` | Immediate development-agent instructions |

For continuation work, read documents 100–160 before modifying code.

## Quick start

For an MVP, read `99-mvp.md` first, then implement in build-phase order within that scope.
