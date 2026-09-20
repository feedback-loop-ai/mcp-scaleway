# Retrospective compliance record

Recorded 2026-09-06 for features 059 and 060 against Constitution 1.2.0.

Remediation status updated 2026-09-20 after merged
[PR #82](https://github.com/feedback-loop-ai/mcp-scaleway/pull/82). The historical
findings retain their chronology. [Feature 063](063-remediation-closeout/validation.md)
records development reload and SDK packaging; [feature 064's closure map](064-remaining-remediation/closure-map.md)
links the twelve newly closed issues to specifications, contracts and validation.

The user authorized autonomous specification retrofitting and recommended choices. They did
not grant waivers of constitutional requirements. Earlier retrofit drafts incorrectly
claimed owner-granted exceptions and unconditional PASS. Those claims are withdrawn.
No inference of approval in previous assistant messages or reviewer reports changes this.
The constitution itself is unchanged by this retrofit.

## Meaning of completion

Specification completeness means the feature boundaries, decisions, contracts, evidence and
remaining work are explicit. It is not proof that every deployed endpoint fully complies.
The final analysis must retain unresolved MUST violations as CRITICAL even when inherited,
historical, documented, or assigned a future task. The release is not retroactively unshipped.
No new release or governance change is authorized by completion of this documentation work.

| ID | Principle | State | Required closure evidence | Responsibility |
| --- | --- | --- | --- | --- |
| [R-I](https://github.com/feedback-loop-ai/mcp-scaleway/issues/59) | I: usage examples | REMEDIATED 2026-09-20 | All 727 advertised IDs have synthetic examples validated against their registered Zod schemas; see feature 064 closure map | Project maintainers |
| R-II | II: specification before implementation | HISTORICAL BREACH | Preserve chronology; enforce the sequence for future work. A later document cannot erase this breach | Project owner controls governance decisions |
| R-III | III: contracts before code | HISTORICAL ORDERING GAP | Preserve dated contract/code evidence and supersession; no unverified pre-code claim | Project owner controls governance decisions |
| [R-IV](https://github.com/feedback-loop-ai/mcp-scaleway/issues/60) | IV: logging and health | REMEDIATED 2026-09-20 | Gateway/flat/routing dispatch emits sanitized traces; local health validates startup without cloud calls; negative tests cover secret exclusion | Project maintainers |
| [R-VI](https://github.com/feedback-loop-ai/mcp-scaleway/issues/61) | VI: hot reload | REMEDIATED 2026-09-19 | `bun run dev` restarts imported source; isolated stdio restart/reinitialization verified. Unit-only suite: 3,368 tests / 97 files / 3.74 s. See feature 063 validation | Project maintainers |
| [R-VII](https://github.com/feedback-loop-ai/mcp-scaleway/issues/62) | VII: response validation | REMEDIATED FOR SUPPORTED OPERATIONS 2026-09-20 | Runtime wire validation covers 721 supported operations/726 HTTP legs; malformed and partial-response tests include consumed lists and IAM replacement reads. Six unverified IDs reject locally before HTTP | Project maintainers |
| [R-VIII](https://github.com/feedback-loop-ai/mcp-scaleway/issues/63) | VIII: full endpoint contract depth | REMEDIATED FOR SUPPORTED OPERATIONS 2026-09-20 | Independent source catalog and 5,235 transport cases cover request/response, pagination, authentication/authorization and errors including 429; all six unavailable IDs have explicit local-rejection evidence | Project maintainers |

R-I #59, R-IV #60, R-VII #62 and R-VIII #63 were closed by PR #82; R-VI #61 was
closed by PR #81. R-II and R-III remain historical breaches, with no retroactive
closure or waiver. Adjacent MCP SDK packaging #64 and structured output #65 are
also complete. The [064 closure map](064-remaining-remediation/closure-map.md)
records their bounded acceptance evidence and the seven resolved route issue groups.

Current provider-verification work remains in
[#66](https://github.com/feedback-loop-ai/mcp-scaleway/issues/66) and
[#67](https://github.com/feedback-loop-ai/mcp-scaleway/issues/67): six unverified
Cockpit/Inference operations remain unavailable. Three unverified legacy filters
are explicitly rejected; this restriction does not claim provider retirement.
The separate feature 059 T055 provider-token measurement remains blocked, and
feature 060 T056's optional live-availability investigation is not completed by
offline contracts or nine successful reads. No production-write proof is claimed.

Tracked in [059 analysis](059-discovery-token-reduction/analysis.md) and [059 tasks](059-discovery-token-reduction/tasks.md), plus [060 analysis](060-api-correctness/analysis.md) and [060 tasks](060-api-correctness/tasks.md).

No deadline, release target, issue URL, or personal assignment is invented here. These local
records are actionable work items, not granted exceptions or claims that tickets were opened.

## Verified remediations

- The executable entry point is covered; its coverage exclusion was removed.
- Migrated tool contracts are present and superseded contracts are identified.
- Gateway-authored errors use a typed shared error object; SDK outer-validation remains distinct.
- IAM rule composite endpoints are declared in the parity matrix rather than hardcoded by label.
- Real SDK HTTP-boundary tests and a minimal-input whole-catalog dispatch smoke are committed.
- Supported-version inventory tests detect source drift, not current service liveness.
- Operation examples changed in this retrofit are checked against real input shapes.

## Historical records and rejected inferences

Initial analyzer findings and subsequent confirmations are retained as historical reports.
A confirmation that accepted the draft's invented waiver is not a valid compliance clearance.
Full tests passing and complete line/branch coverage remain valuable evidence, but do not
substitute for constitutional obligations the tests do not exercise.

## R-I

Remediated in feature 064: every registered operation has a schema-valid synthetic
example, exposed through describe and flat descriptions. The generated catalog and
tests replace the previous changed-description-only coverage.

## R-II

The original chronological spec-first breach is historical, not waived.

## R-III

A committed retrospective contract is not evidence of pre-code contract approval.

## R-IV

Remediated in feature 064: all dispatched gateway, flat and routing callbacks emit
one sanitized JSON trace. `--health` checks local startup and configuration without
requiring provider credentials. SDK validation before callback dispatch retains its
native behavior; no fictitious dispatch log is generated for those rejections.

## R-VI

`bun run dev` uses Bun `--watch`. An isolated imported-source edit restarted the server
in 192 ms; a new MCP initialize/list-tools exchange observed the changed server version.
Runtime state and initialized sessions are not preserved, and clients must reconnect
and refresh cached tools. README documents those limits. Unit-only timing is 3.74 s
for 3,368 tests across 97 files, measured separately from the coverage suite.

## R-VII

Remediated for the supported surface in feature 064: independent JSON schemas and
S3 protocol adapters validate actual HTTP responses before handler/SDK processing.
Consumed-list and IAM-policy checks reject unsafe partial responses. The six
unverified operations cannot reach HTTP. Unknown valid wire fields are retained by
validation; existing SDK unmarshallers still govern their final output projections.

## R-VIII

Remediated for the supported surface in feature 064: source-backed transport tests
exercise every supported operation and composite request leg, 1,599 optional-input
variants, applicable pagination, authorization and 401/403/404/429 handling. Malformed
syntax and wrong-typed bodies are separate cases. The generated evidence inventory
and CI regeneration gate supersede file-existence-only parity. This is documented
contract evidence, not exhaustive input combinations or universal live-write proof.

Full acceptance: 12,441 tests, 100% source coverage, and 4.686-second unit-only wall
time. [PR CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/runs/35501757988)
and [merged-main CI](https://github.com/feedback-loop-ai/mcp-scaleway/actions/runs/35501832089)
passed. See [closeout limits](064-remaining-remediation/closeout.md).
