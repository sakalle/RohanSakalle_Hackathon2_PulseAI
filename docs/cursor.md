# Session manual — PulseAI

Read order: `docs/OVERVIEW.md`, `docs/decision.md`, `docs/flow.md`, then the case you were asked for.

`decision.md` wins over the brief and over this file.

The machine already has the four workspace rules (test first, brainstorm before build, systematic debugging, review before done). They are not copied into this repo.

## Loop

1. Name the case id from `flow.md`.
2. Write the assertion.
3. Watch it fail.
4. Smallest change.
5. Say which flow ran and which one you could not run.

One idea that shows up mid-build goes under Later in `ACTION_PLAN.md`. It does not enter the current phase.

## Files a session may touch

Phase 1: `prisma/schema.prisma`, `lib/**`, `app/**`, `tests/**`, `scripts/**`, `components/**`.

Do not edit `research/repos/**`. Do not put secret values in docs or in `NEXT_PUBLIC_` variables.

## Stop and ask

- A feed that previously returned 200 starts failing, and there is no second verified URL.
- A change would mark an alert `sent` without a real channel.
- Deploy host (D8) or a paid key (D9, D10).
