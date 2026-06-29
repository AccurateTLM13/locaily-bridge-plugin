# Purpose

The LocAIly Bridge Plugin connects an OpenCode development session to the **LocAIly Local Brain**.

## What it guarantees

Every coding agent that uses the plugin will:

1. **Know which project** it is working in
2. **Load the correct project context** — not the entire project history
3. **Understand the current objective and boundaries** — what to do and what not to do
4. **Report meaningful progress** — structured, verifiable, not just chat logs
5. **Write verified results** back to the Local Brain for continuity

## The core loop

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

That is the plugin's real product. Everything after that is automation.
