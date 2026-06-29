# Component: Context Builder

Converts Local Brain records into a compact, agent-readable context package.

## Inputs

- Project map
- Active objective
- Current build slice
- Recent decisions
- Known constraints
- Relevant architecture docs
- Prior task handoff

## Output format

```markdown
# Current Project Context

## Objective
Build the checkout redesign foundation.

## Scope
Checkout layout and form structure.

## Constraints
- Do not change payment processing.
- Do not modify production configuration.
- Do not install unrelated dependencies.

## Architecture
- Checkout uses a Zustand state manager.
- Form validation uses react-hook-form + zod.
- Styling is CSS Modules.

## Recent Decisions
- Retained existing checkout state manager (was outside slice).

## Prior Handoff
Implemented cart summary component. Next: checkout form layout.

## Validation Requirements
- npm run lint
- npm test
- Responsive layout check (manual)

## Stop Conditions
- Slice is complete and all validation passes.
- Blocker prevents verified progress.
```

## Context budget rules

1. Include only the active objective and current slice — not the full project plan
2. Summarize architecture to 5 lines max; link to docs for more
3. Show only the last 5 decisions (trim older ones)
4. Include only the most recent handoff
5. Validation requirements come from the active slice, not the whole project

## Priority order

1. Active objective
2. Current build slice
3. Project rules
4. Recent decisions
5. Relevant architecture
6. Prior task handoff
7. Older historical context (excluded unless explicitly requested)

## Usage

The context builder's output is injected into the agent's system prompt or returned via the `locaily_project_context` tool.
