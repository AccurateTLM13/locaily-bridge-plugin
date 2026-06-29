# Release gate

The plugin is ready for an initial release only when every required gate is supported by reproducible evidence.

## Required commands

```bash
npm ci
npm run validate
npm run test:integration
npm run test:smoke
```

Record:

* Command
* Exit code
* Date
* Tested Node version
* Tested OpenCode version
* Tested operating system
* Relevant output summary

## Required real-world proof

Provide one sanitized fixture or evidence directory containing:

```text
evidence/release-candidate/
├── environment.json
├── commands.json
├── opencode-load.txt
├── tool-list.txt
├── project-context-output.md
├── session-record.json
├── events.jsonl
├── handoff.json
└── validation-summary.md
```

## Blocking conditions

Do not mark the project complete when any of these remain:

* Plugin cannot be loaded by OpenCode.
* Tools are only tested through direct TypeScript calls.
* Session state is still one global singleton.
* Async persistence calls are unawaited.
* No real smoke test exists.
* No automated tests exist.
* Completed handoffs can be submitted without required evidence.
* File mode and HTTP mode have inconsistent contracts.
* Multi-agent state leaks between workers.

## Release classification

### Prototype

Internal logic exists but OpenCode loading is not proven.

### Alpha

OpenCode loads the plugin and the file-mode single-session lifecycle works.

### Beta

Automated evidence, guardrails, HTTP mode, and concurrent-session isolation work.

### Release candidate

All acceptance criteria and release evidence pass.

The agent must report the honest classification rather than calling every successful build production-ready.
