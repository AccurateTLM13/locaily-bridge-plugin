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
