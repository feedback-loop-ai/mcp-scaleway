# Feature Specification: Scaleway API Correctness Repairs

**Feature Branch**: `060-api-correctness`
**Created**: 2026-09-05 (retrofitted to full specification form 2026-09-06)
**Status**: Shipped in 0.4.0; specification retrofitted
**Input**: User description: "Investigate up-to-date Scaleway code, infrastructure, architecture of the solution." Owner decision 2026-09-05: fix live-API correctness before token optimization.

## Clarifications

### Session 2026-09-06

- Q: When an upstream endpoint has been retired with no faithful replacement, should the tool stay registered with an "unsupported" result or be removed? → A: Removed, with a migration note. Registered tools must map to real endpoints; honest stubs still mislead discovery and break the parity invariant.
- Q: When a migration changes upstream field units (e.g. memory MiB to bytes), should tool inputs keep the old unit or adopt the new one? → A: Keep the documented input unit and convert, so existing callers are not silently reinterpreted; document the conversion.
- Q: What counts as proof that a repaired operation "works"? → A: A test that drives the real SDK transport with injected HTTP and asserts URL, method, auth header, body/query and response parsing. Mocking the SDK's request function does not count, because that is exactly the layer that was wrong.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Operations reach the right endpoint with the right credentials (Priority: P1)

An assistant calls a Scaleway operation through the server. Before this feature, roughly 290 operations across 18 product areas could not succeed against the live service: request paths were concatenated onto the wrong host, some handlers passed browser-style requests into a client expecting a different shape, one area sent requests with no authentication, and error statuses were lost. The assistant should be able to trust that a call is delivered as documented.

**Why this priority**: A cloud proxy whose requests do not arrive is not a product. This blocked every other improvement, including the discovery work that depends on the same handlers.

**Independent Test**: Drive any repaired operation through the real client transport with a recording HTTP layer and dummy credentials. Delivers value if the recorded request has the documented host, path, method, authentication header, body and query.

**Acceptance Scenarios**:

1. **Given** any operation in a previously affected area, **When** it is invoked with valid inputs, **Then** the outgoing request targets the documented host and path with exactly one leading path separator and the documented method.
2. **Given** an operation that sends a JSON body, **When** it is invoked, **Then** the request carries the JSON content type and the authentication header supplied by the shared transport.
3. **Given** an upstream response with an error status, **When** the operation reports failure, **Then** the reported status matches upstream (for example, 404 stays 404 rather than becoming 500).
4. **Given** an upstream success with no body, **When** the operation completes, **Then** the client receives a protocol-valid result rather than an empty or undefined payload.
5. **Given** a list operation on a generated-client area, **When** a page size is requested, **Then** that page size reaches the wire under the upstream parameter name.

---

### User Story 2 - Retired and dead upstream versions are replaced or removed (Priority: P2)

An assistant tries to use autoscaling, containers or public-gateway DHCP. Before this feature, autoscaling targeted an API version that upstream had removed (every call returned not-found), containers targeted a deprecated version with renamed fields, and DHCP targeted an API removed months earlier. The assistant should only see operations that correspond to endpoints that exist.

**Why this priority**: Registered operations that cannot succeed waste every token spent discovering and calling them, and they erode trust in the rest of the catalog.

**Independent Test**: Enumerate registered operations against the current upstream API references. Delivers value if none targets a retired version and each removed operation has a migration note.

**Acceptance Scenarios**:

1. **Given** the autoscaling area, **When** operations are listed, **Then** they target the current groups/templates surface, and the standalone policy operations that no longer exist upstream are absent with a documented replacement (embedded group policy).
2. **Given** the containers area, **When** an assistant creates or updates a container, **Then** inputs keep their documented units and are converted to the current upstream fields, cron operations map to the current trigger surface, and combinations with no faithful upstream equivalent return an explicit error rather than silently changing meaning.
3. **Given** the public-gateway area, **When** operations are listed, **Then** the retired DHCP operations are absent and the upgrade notes point to the supported replacement.
4. **Given** the containers area, **When** an assistant looks for the legacy staged-deploy and token operations, **Then** they are absent, and the notes explain that configuration applies on create/update and that the token endpoints no longer exist upstream.
5. **Given** the cockpit area, **When** deprecated operations are described, **Then** their descriptions state the deprecation.

---

### User Story 3 - Flexible IP operations use their actual API (Priority: P3)

An assistant lists, creates or deletes flexible IPs for bare-metal servers. Before this feature these operations targeted a path that does not exist in the bare-metal API; the operations live in a separate flexible-IP API.

**Why this priority**: Three operations, clearly wrong, easily fixed without renaming the tools.

**Independent Test**: Invoke each of the three operations through the real transport; delivers value if requests target the flexible-IP API with the documented query and response field names while tool names and inputs are unchanged.

**Acceptance Scenarios**:

1. **Given** a list request filtered by server, **When** it is sent, **Then** the filter is expressed as the upstream array parameter and the response is read from the upstream collection field.
2. **Given** a delete request, **When** upstream returns no content, **Then** the client receives a valid acknowledgement.

---

### User Story 4 - Discovery does not require cloud credentials (Priority: P4)

An operator or test harness starts the server without credentials to inspect the catalog. Before this feature one area read credentials at registration time and aborted startup.

**Why this priority**: Small change, but it unblocks credential-free tooling, CI parity checks and the discovery feature's registry build.

**Independent Test**: Start the server with no credentials in the environment and list operations. Delivers value if registration succeeds and the server reports the published package version.

**Acceptance Scenarios**:

1. **Given** no credentials in the environment, **When** the server registers its operations, **Then** registration completes and credentials are only read when an operation executes.
2. **Given** a connected client, **When** it reads server information, **Then** the reported version equals the published package version.

---

### Edge Cases

- Object storage and generative-API operations use their own hosts and authentication schemes; they are exempt from the shared-transport rules but must still send correct authentication.
- Some DELETE operations legitimately return a resource body; only endpoints documented as no-content are normalised to an acknowledgement.
- A migration that changes response field names is reported in the notes; consumers reading old field names must update.
- Regression tests never contact the live service; a passing suite proves request construction and parsing, not live provisioning.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every operation using the shared transport MUST issue requests whose path begins with exactly one separator and resolves to the documented host.
- **FR-002**: Every operation using the shared transport MUST express requests in the transport's own request shape and consume its already-parsed responses, not browser-style request or response objects.
- **FR-003**: Requests carrying a JSON body MUST declare the JSON content type; authentication MUST come from the shared transport, never from an unauthenticated fallback.
- **FR-004**: Upstream error statuses MUST be preserved in the reported error, whether the transport exposes them as a status or as a status code.
- **FR-005**: Operations whose upstream returns no content MUST return a protocol-valid acknowledgement.
- **FR-006**: Generated-client list operations MUST pass the requested page size in the client's expected parameter so it reaches the wire.
- **FR-007**: No registered operation MAY target an upstream API version that upstream has removed or that returns not-found.
- **FR-008**: Operations with no faithful upstream equivalent MUST be removed rather than registered as unsupported stubs, with a migration note naming the replacement or explaining the absence.
- **FR-009**: Migrations MUST retain documented input units and identifiers where a faithful conversion exists, converting to upstream fields internally and documenting the conversion.
- **FR-010**: Migrations MUST NOT silently substitute an upstream action with different semantics (for example a force-redeploy for a staged deploy); such cases return an explicit error or are removed.
- **FR-011**: Deprecated-but-live upstream operations MUST state the deprecation in their description.
- **FR-012**: Operation registration MUST NOT require credentials; credentials are read at execution time.
- **FR-013**: The server MUST report the published package version to connected clients.
- **FR-014**: Each repaired or migrated area MUST have a test that drives the real client transport with injected HTTP and dummy credentials, asserting host, path, method, authentication, body or query, and response handling, including error statuses.
- **FR-015**: Each removed or migrated operation MUST be reflected consistently in the operation parity record, the per-area API reference, the operation reference in user documentation and the release notes.
- **FR-016**: The change MUST ship as a breaking release with notes enumerating removed operations, migrated versions, unit conversions and renamed response fields.

### Key Entities

- **Operation**: A Scaleway capability exposed by the server; attributes: name, product area, declared upstream endpoint and version, input contract, handler.
- **Shared Transport**: The single authenticated client through which most operations send requests; owns host resolution, authentication and response parsing.
- **Upstream API Version**: The versioned surface an operation targets; may be current, deprecated (live with notice) or removed (not-found).
- **Parity Record**: The machine-readable map from every operation to its endpoint and contract test; the consistency anchor for removals and migrations.
- **Migration Note**: Release documentation mapping a removed or changed operation to its replacement or explaining its absence.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of registered operations construct a well-formed, authenticated request to an allowed host when exercised against an injected HTTP layer, verified automatically across the whole catalog.
- **SC-002**: 0 registered operations target an upstream version that upstream reports as not-found.
- **SC-003**: For every repaired area, at least one automated test exercises the real transport end to end (request construction through response parsing and error mapping) rather than a mocked request function.
- **SC-004**: Upstream 4xx statuses are reported with their original status in 100% of tested cases.
- **SC-005**: The server starts and lists its catalog with zero credentials configured.
- **SC-006**: The operation parity record, per-area API references, user documentation and release notes agree on the set of supported operations (724 after this change), verified by automated parity checks and a documentation cross-check.
- **SC-007**: The full automated suite passes with 100% line and branch coverage.

## Assumptions

- Upstream API references and official client packages are the source of truth for current endpoints, field names and units.
- Injected-HTTP testing is sufficient evidence for request correctness; live provisioning is out of scope for automated tests.
- Consumers of removed operations accept a breaking release with migration notes rather than indefinite stubs.

## Out of Scope

- Adopting official per-product client packages for the 45 areas that hand-roll requests (tracked as a future improvement).
- Runtime validation of upstream response shapes beyond what handlers already do.
- Changes to the discovery surface (separate feature 059).
