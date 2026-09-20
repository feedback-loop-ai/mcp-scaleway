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
