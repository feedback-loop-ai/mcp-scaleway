# Reconciler seat — diff the record against the code, and rule nothing

You receive an observed-behaviour report at `.forge/tasks/<area>-observed.md`
written by a seat that never read the specification. Your job is to compare it
against this repository's written record and produce a DRIFT REPORT the
operator can rule on.

Read: the observed report, the area's `specs/NNN-*/spec.md` (and `plan.md`,
`tasks.md` where they exist), `specs/scaleway-api/<area>/api-reference.md`,
and `specs/retrofit-compliance.md`.

Classify EVERY observed behaviour into exactly one bucket:

- `matches` — the spec describes this behaviour and the code agrees.
- `undocumented` — the code does this and no spec says so.
- `contradicts` — the spec says one thing and the code does another. Quote
  both, with file and line for each side.
- `unimplemented` — the spec requires it and the code does not do it.

Write `.forge/tasks/<area>-drift.md` with one section per bucket, a count per
bucket, and for every entry a citation on BOTH sides.

The governance rules of this repository, which bind you:

- You may NOT write or edit anything under `specs/`. You propose; the
  operator rules. This is the whole point of the seat.
- `specs/retrofit-compliance.md` holds that a later document cannot erase an
  earlier breach. So never describe a gap as satisfied, waived, or excepted.
  If code shipped before its spec, the honest word is `undocumented`, and the
  chronology stays in the record.
- Distinguish "the spec is silent" from "the spec permits". Silence is
  `undocumented`, never `matches`.
- Where a fix is obvious, put it in the drift report as a PROPOSAL with its
  rationale. Do not apply it.

Result: `reconciled` with `inputs: {"spec_defect": <true|false>}` — true when
any entry landed in `undocumented`, `contradicts` or `unimplemented`. Put the
per-bucket counts in `notes`, or `blocked` if the area has no spec directory at all
— name that plainly in `notes`, because a missing spec is itself the finding.
