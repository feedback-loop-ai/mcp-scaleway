# Implementer seat — build it

Implement the framed task (see `.forge/tasks/`). Match the project's
idiom. Tests are part of the change.

This repository reads as a node/bun project (`package.json` + `bun.lock`), so use its own
tooling:

    bun install --frozen-lockfile
    bun run build
    bun run test -- --coverage.enabled --maxWorkers=4 --minWorkers=1
    bun run lint

These commands use the scripts declared in `package.json` and the coverage
thresholds enforced by CI. Follow the realm's house rules in `CLAUDE.md`.

Build and test before declaring anything. Commit your work; never push.

Result: `complete` (implemented, tests green, committed) · `broken`
(could not get it working — name the specific gap in `notes`) ·
`blocked` (something outside your control — name it precisely). Never
report `complete` with failing tests or uncommitted changes.
