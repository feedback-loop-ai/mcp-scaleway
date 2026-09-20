# Remaining implementation remediation

Date: 2026-09-19. User request: complete the remaining implementation-versus-reality
remediation after PRs #80 and #81. This specification precedes the implementation.

## Requirements

1. Resolve the eight remaining route findings in epic #66 using current authoritative
   method/path, parameter and response evidence. Correct genuine mismatches; retain
   uncertainty where a source or runtime observation cannot establish a contract.
2. Validate upstream responses at runtime for every supported endpoint, including
   missing/wrongly typed fields, nested resources, non-JSON responses and empty bodies.
   Preserve valid unmodeled fields; return sanitized structured failures for invalid
   responses instead of leaking payloads or continuing with fabricated values.
3. Enforce operation-level contract evidence for input constraints, request serialization,
   response handling, pagination, authentication/authorization and rate limits. Derive
   expected contracts from independently recorded schemas/protocol references; an
   implementation agreeing with its own metadata is insufficient closure evidence.
4. Provide schema-valid examples for every advertised operation and verify them against
   the actual Zod input schema. Synthetic identifiers must be clearly examples.
5. Log operation ID, outcome and duration as structured JSON on stderr for gateway and
   flat dispatch. Never log parameters, resource payloads, credentials or exception text.
   Expose a credential-independent stdio-appropriate startup health self-check that
   fails on invalid configuration; it does not assert cloud availability.
6. Publish MCP output schemas and structured content with compatible text content.
   Discovery exposes each operation's output contract. Existing filtering, routing,
   input validation, operation identifiers and authorization boundaries remain enforced.
7. Complete local and CI checks, preserve 100% source coverage, create signed commits,
   push and merge reviewed PRs, and close only issues whose acceptance evidence is met.

## Evidence and compatibility

Authoritative evidence may be public OpenAPI, documented secondary APIs, generated
official SDK contracts or the S3 protocol. Its origin and date must be recorded. A
missing schema, HTTP 401/403/404, or passing mocks cannot establish live compatibility.
No operation is silently removed merely because a schema omits it. No cloud resources
are provisioned or mutated solely to satisfy a test. Read-only verification may use the
already configured credentials without exposing them.

Implementation follows Constitution I, III, IV, VII and VIII. Historical sequencing
findings are preserved; no governance waiver or package release is inferred.

## Endpoint compatibility decisions

Generative API catalog requests use the global catalog, and inference uses an
explicit/default project ID; the old region input is accepted but deprecated.
Webhosting DNS requires the actual domain, and full restore requires an explicitly
selected backup_id. These are documented input migrations with unchanged tool IDs.
Cockpit contact-point deletion uses its published POST /contact-points/delete route.
The old managed-alert-contact-points name is a compatibility alias for the published
ListContactPoints operation: it returns default-receiver contact points, with no
claim of a separate managed-alert namespace. The three unattested lifecycle routes
remain explicitly legacy/unverified; Terraform resource retirement alone does not
establish these individual HTTP paths' retirement.

The supported Inference deployment creation input gains optional `accept_eula`,
forwarded unchanged to the published CreateDeployment request. It has no true
default: license acceptance remains explicit. This provides the source-backed
alternative to the unverified standalone accept-EULA operation.

## Versioned compatibility changes

The corrected signatures and explicit support restrictions are staged as package
version 0.5.0 (unreleased). Existing IDs remain; describe provides updated required
inputs. This source delivery does not tag or publish an npm release.

## SDD closeout correction — 2026-09-20

**Priority recorded at closeout:** requirements 1–7 form one P1 remediation scope;
none is an optional substitute for another. This priority statement is a later
documentation clarification, not a claim of separately recorded pre-code approval.

The user requested verification that issue closure includes proper SDD artifacts.
PR #82 has merged, but the older compliance ledger and task records still show
remediated findings as open. Before editing those records, this documentation-only
follow-up requires:

1. Link each of the twelve closed issues to its specification/contract, implementation
   evidence and validation, including the merged PR and successful CI runs.
2. Reconcile current compliance states and original task checkboxes with that evidence.
   Preserve historical R-II/R-III breaches, the blocked provider-token measurement,
   and the six unverified contracts in #66/#67; none becomes a verified capability.
3. Consolidate the data model and task-level traceability of feature 064. Label these
   additions as post-implementation documentation, without backdating approval or
   claiming that a shared commit proves spec-before-code ordering.
4. Verify document links and recorded issue/CI states, then deliver the correction
   through a signed commit, reviewed PR and merge. Runtime behavior is unchanged.

The user's subsequent instruction to cover all fixes includes feature 061 (Jev),
062 (Scaleway refresh) and 063 (earlier remediation). Audit their essential SDD
artifacts and add missing maintenance data models/contracts with explicit reuse
links. Retain their existing retrospective authorship and original validation dates.
