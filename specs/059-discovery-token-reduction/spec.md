# Feature Specification: Compact Operation Discovery

**Feature Branch**: `059-discovery-token-reduction`
**Created**: 2026-09-05 (retrofitted to full specification form 2026-09-06)
**Status**: Shipped in 0.4.0; specification retrofitted
**Input**: User description: "Optimize our token usage - we consume close to 200k tokens for discovery, I need that optimized. Investigate up-to-date Scaleway code, infrastructure and architecture."

## Clarifications

### Session 2026-09-06

- Q: What does read-only mode exclude beyond upstream read methods? → A: Read-only means "cannot change cloud state". Only reads with upstream side effects are denied; sensitivity of returned data is handled by operator exclusions and upstream access control, not by the mode.
- Q: What is the `core` preset for? → A: A curated getting-started set covering the most common provisioning workflows, deliberately smaller than the union of family presets. Membership is fixed per release and documented; changes are release-noted.
- Q: How long is flat compatibility mode supported? → A: For the whole 0.x series. Removal, if ever, requires a major version and at least one prior minor release carrying a deprecation notice.
- Q: Is there a latency expectation for discovery calls? → A: Search and describe are served from memory and must complete without any upstream request; no network latency is added to discovery.
- Q: Can the same operation appear twice in one search page or be double-counted in totals? → A: No. Each operation has one identifier and appears at most once per result set; totals count distinct operations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cheap discovery of a large operation catalog (Priority: P1)

An AI assistant connects to the Scaleway server and needs to work with cloud resources. Before this feature, every connection loaded the full catalog of several hundred operations with complete input contracts into the assistant's working context, consuming roughly a fifth of a large context window before any work began. The assistant should instead see a small, fixed set of discovery and execution tools, and find the specific operations it needs on demand.

**Why this priority**: This is the entire reason the feature exists. Without it the server is too expensive to keep connected in a normal working session.

**Independent Test**: Connect any MCP client with default settings and list tools. Delivers value if the listing is small and constant regardless of catalog size, and every underlying operation can still be found and executed.

**Acceptance Scenarios**:

1. **Given** a server started with default settings, **When** a client lists available tools, **Then** exactly four tools are returned (search, describe, read, call) and the listing payload is a small fixed size independent of how many operations exist.
2. **Given** the default server, **When** the assistant searches with keywords such as "list kubernetes clusters", **Then** the matching operation appears on the first page of results with its identifier, a one-line description, whether it is read-only, and its required and optional parameter names.
3. **Given** a search result identifier, **When** the assistant asks to describe it, **Then** it receives the complete input contract for that operation, including required fields, allowed values, defaults and nested structures, faithful to what the operation actually validates.
4. **Given** a described operation and valid parameters, **When** the assistant executes it, **Then** the result is identical in content to what the equivalent pre-existing per-operation tool would have returned.
5. **Given** a search with no keywords and no area, **When** the assistant calls search, **Then** it receives the list of enabled product areas with per-area operation counts and the total operation count, so it can orient itself before searching.
6. **Given** a search whose matches exceed the page size, **When** the assistant follows the returned continuation offset, **Then** every match is reachable across pages and no operation is silently dropped.

---

### User Story 2 - Operators bound what an assistant may touch (Priority: P2)

An operator deploying the server for a team or an automation wants to limit which product areas and which kinds of operations an assistant can reach, for example "only databases and networking, and nothing that mutates". These limits must hold no matter how the assistant phrases a request, including through the generic execution tools.

**Why this priority**: The generic call tool can reach every operation. Without enforceable server-side bounds, compact discovery would widen the blast radius rather than narrow it.

**Independent Test**: Start the server with an area restriction and read-only mode, then attempt a mutation both by its legacy name and through the generic call tool. Delivers value if both are refused before any network request.

**Acceptance Scenarios**:

1. **Given** a server configured for a specific set of product areas, **When** the assistant searches or lists tools, **Then** only operations in those areas are visible, and areas outside the set are reported as unavailable rather than silently empty.
2. **Given** a server in read-only mode, **When** the assistant attempts any operation classified as mutating through search, describe, read or call, **Then** the operation is not discoverable and execution is refused with an explanatory error, with no request sent upstream.
3. **Given** an operator excludes specific operations by name or pattern, **When** the assistant attempts them by any route, **Then** they are refused and never executed.
4. **Given** an operator supplies an invalid area name, an unknown exclusion pattern that matches nothing, or a combination that leaves no operations enabled, **When** the server starts, **Then** startup fails with a clear message instead of silently exposing everything or nothing.
5. **Given** an allowed read operation, **When** the assistant supplies an identifier crafted to redirect the request toward a different, excluded or mutating endpoint, **Then** the request is refused before any network activity and the error does not echo the injected value.

---

### User Story 3 - Existing integrations keep working during migration (Priority: P3)

A user who built prompts, permission rules or automations against the previous per-operation tool names upgrades the server. They need a way to keep the old surface while they migrate, and a clear statement of what changed.

**Why this priority**: The default surface change is breaking for a published package with external users. A compatibility path turns a forced rewrite into a scheduled one.

**Independent Test**: Start the server in compatibility mode and confirm the legacy tool names, inputs and outputs are unchanged.

**Acceptance Scenarios**:

1. **Given** a server started in flat compatibility mode, **When** a client lists tools, **Then** every supported legacy operation appears under its original name with its original input contract.
2. **Given** a server started in combined mode, **When** a client lists tools, **Then** both the four discovery tools and the selected legacy tools are present, and area or read-only filters apply to both surfaces identically.
3. **Given** the upgrade notes, **When** a user reads them, **Then** they can map any legacy tool name to its new operation identifier without consulting source code.

---

### User Story 4 - Assistants recover from mistakes without help (Priority: P4)

When an assistant calls an operation with wrong or missing parameters, or refers to an operation that does not exist, it should get enough structured feedback to correct itself in one retry, without leaking any sensitive values it may have submitted.

**Why this priority**: Compact discovery trades an upfront catalog for round trips. If errors are opaque, the round-trip cost multiplies and erodes the token saving.

**Independent Test**: Call an operation with a missing required field and with a non-existent identifier. Delivers value if the responses name the offending fields and suggest valid identifiers.

**Acceptance Scenarios**:

1. **Given** a call with invalid parameters, **When** validation fails, **Then** the response lists the failing top-level field names and stable error codes, includes the operation's input contract when it fits a bounded size, and never includes the values the assistant submitted.
2. **Given** a call naming an unknown or disabled operation, **When** it is attempted, **Then** the response says the operation is unknown or disabled and suggests up to five similar enabled identifiers.
3. **Given** an operation whose upstream call fails, **When** the failure is reported, **Then** the message is actionable and does not expose credentials, raw request bodies or internal stack traces.

---

### Edge Cases

- A search identifier supplied with the legacy prefix still resolves to the same operation as the bare identifier.
- A search query that matches nothing returns an empty page with a zero total, not an error.
- A page offset beyond the last result returns an empty page rather than failing.
- Describe is limited to ten identifiers per call; larger batches are rejected with a validation error.
- Filters are fixed for the lifetime of a server process; changing them requires a restart, and a running client keeps its already-loaded catalog until it reconnects.
- Read-only is defined strictly as "cannot change cloud state". Reads that return sensitive material (console credentials, cluster access files, zone exports, invoices, certificates) remain available in read-only mode; operators who need to withhold them use explicit exclusions. The single exception is accessing a secret's version payload, which is treated as mutating because access can consume, disable or delete an ephemeral secret.
- Operations that perform more than one upstream request, such as a rule update that reads then writes, are classified by their most permissive leg and confined to exactly the declared set of endpoints.
- Object storage keys may legitimately contain path separators and must remain addressable while still rejecting traversal segments.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The default server surface MUST consist of exactly four tools: search, describe, read and call.
- **FR-002**: Every supported underlying operation MUST be reachable through search, and every enabled operation MUST be executable through call; read-only operations MUST additionally be executable through read.
- **FR-003**: Operation identifiers MUST be stable, MUST map one-to-one to the legacy tool names by removing a fixed prefix, and MUST be accepted with or without that prefix.
- **FR-004**: Search MUST accept optional keywords, an optional area, a page size between 1 and 50 (default 10) and a continuation offset, and MUST report the total match count and a continuation offset whenever more results exist.
- **FR-005**: Search with neither keywords nor area MUST return the enabled areas with per-area and total operation counts, paginated by the same rules.
- **FR-006**: Search ranking MUST be deterministic: an exact identifier match ranks first, then results requiring every keyword to match, weighted toward identifier and area matches over description matches, with ties broken alphabetically.
- **FR-007**: Describe MUST accept between 1 and 10 identifiers and return, for each, the identifier, legacy name, area, upstream endpoint, read-only classification, description and full input contract.
- **FR-008**: The input contract returned by describe MUST preserve every validation-relevant element of the original: required fields, enumerations, defaults, numeric and length bounds, patterns, formats, nested and union structures, and map value types. Only the schema dialect marker and a fixed set of redundant boilerplate descriptions for pagination, region and zone fields MAY be omitted.
- **FR-009**: Read and call MUST validate parameters against the original operation contract, applying its defaults and refinements, before invoking the original operation logic, and MUST return that logic's result unchanged.
- **FR-010**: Read MUST refuse any operation not classified read-only before validation or execution.
- **FR-011**: Read-only classification MUST derive solely from whether an operation can change cloud state: every leg of a multi-request operation must be an upstream read, and an explicit deny list covers reads with upstream side effects. Sensitivity of returned data MUST NOT affect classification.
- **FR-012**: Operators MUST be able to restrict the enabled operations by product area, by named preset, by explicit additional operation, by exclusion pattern and by a read-only switch, using environment configuration read only at startup.
- **FR-013**: Every restriction MUST apply identically to listing, search, describe, read, call and the legacy flat surface.
- **FR-014**: Invalid configuration (unknown area, unknown preset, unknown explicit operation, exclusion pattern matching nothing, invalid mode value, or a selection enabling zero operations) MUST fail startup with a message naming the problem.
- **FR-015**: Named presets MUST have fixed membership that is documented and changes only with a release note. Family presets partition the catalog by domain: compute, storage, networking, security, serverless, data, AI, messaging, observability and business. The `core` preset is a curated getting-started selection for common provisioning workflows, not a superset of families; it covers instances, elastic metal, Apple silicon, Kubernetes, registry, functions, containers, jobs, block storage, object storage, VPC, DNS, IAM and marketplace.
- **FR-016**: Every request dispatched on behalf of an operation MUST be confined to that operation's declared upstream endpoint(s), checked on the raw request path before any normalization, so that identifier values cannot redirect a request to a different endpoint.
- **FR-017**: Validation errors MUST report stable error codes and top-level field names only, MUST include the operation's contract when it is within a bounded size, and MUST NOT echo submitted values.
- **FR-018**: Unknown or disabled operation identifiers MUST produce an error with up to five suggested enabled identifiers.
- **FR-019**: Unhandled execution failures MUST be reported with an actionable, non-sensitive message.
- **FR-020**: The server MUST offer three surface modes: compact discovery (default), flat compatibility exposing legacy tool names, and combined.
- **FR-021**: In flat and combined modes, legacy tools MUST carry hints indicating whether they are read-only, and mutating operations MUST be hinted as potentially destructive and non-idempotent.
- **FR-022**: The server MUST publish connection-time instructions stating the enabled operation and area counts, the active mode, the discovery workflow, that filters apply to execution, that read results may be sensitive and that upstream access control always applies.
- **FR-023**: Runtime operation metadata (legacy name, area, endpoint, read-only flag) MUST be generated from the project's operation parity record and MUST be verified equal to a fresh derivation in continuous integration, so the two cannot drift.
- **FR-024**: Each of the four discovery tools MUST be recorded in the parity record with its own contract test, and continuous integration MUST verify the registered default surface equals that record exactly.
- **FR-025**: The upgrade MUST be released as a breaking version with notes mapping legacy names to identifiers and describing the compatibility mode.
- **FR-026**: Flat compatibility mode MUST remain supported for the entire 0.x release series. Its removal requires a major version bump preceded by at least one minor release whose notes announce the deprecation.
- **FR-027**: Search and describe MUST be answered entirely from the server's in-memory registry and MUST NOT issue any upstream request.
- **FR-028**: An operation MUST appear at most once in any search result set, and reported totals MUST count distinct operations.

### Key Entities

- **Operation**: A single Scaleway capability. Attributes: stable identifier, legacy tool name, product area, declared upstream endpoint(s), read-only classification, human description, input contract, original execution logic.
- **Operation Registry**: The immutable, filtered set of operations enabled for one server process. Built once at startup; the single source of truth for listing, discovery and execution.
- **Filter Configuration**: The operator's selection of areas, presets, explicit operations, exclusions and read-only switch. Validated at startup; fails closed.
- **Surface Mode**: Which tool surface a client sees: compact discovery, flat compatibility or both.
- **Discovery Page**: One bounded page of search results or area summaries with a total and an optional continuation offset.
- **Endpoint Declaration**: The upstream method and path template(s) an operation is permitted to call; the boundary enforced on every dispatched request.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The default tool listing is at least 99% smaller than the previous full catalog listing, measured as the size of the tool definitions a client receives on connection.
- **SC-002**: The default tool listing size does not change when operations are added to or removed from the catalog.
- **SC-003**: 100% of supported operations are reachable through paginated search, verified automatically on every change.
- **SC-004**: For a representative set of at least 20 natural keyword queries drawn from real catalog areas, the intended operation appears on the first page of results in 100% of cases.
- **SC-005**: A typical two-operation task (search, describe, execute) costs the assistant on the order of a few thousand tokens of round trips, at least two orders of magnitude less than the catalog it replaces.
- **SC-006**: Every attempt to reach a filtered, excluded or endpoint-redirected operation, by any route and in every surface mode, is refused with zero upstream requests, verified automatically.
- **SC-007**: In flat compatibility mode, every supported legacy tool is present with an unchanged name and input contract, so existing integrations require no change to keep working.
- **SC-008**: The complete automated suite, including protocol-level tests for all four tools and all three modes, passes with full line and branch coverage.
- **SC-009**: Discovery calls (search and describe) complete with zero upstream requests, verified automatically by failing any test in which a discovery call touches the network.

## Assumptions

- The assistant consuming this server can perform multi-step tool use and follow a continuation offset; the design intentionally trades a large upfront catalog for a small number of round trips.
- Upstream Scaleway access control remains the authority on what a credential may do; server-side filters narrow exposure but do not replace it, and read-only mode is not a confidentiality guarantee.
- Token cost is proportional to listing size for a given model; the byte reduction is the measured guarantee, and model-specific token counts are reported separately when they can be obtained.
- Operators configure the server through environment variables of the launched process, as the package has always been configured.
- The parity record maintained for contract testing is accurate enough to serve as the source of endpoint declarations and read-only classification.

## Out of Scope

- Reducing the size of individual operation results.
- Client-side deferred tool loading or tool search features of any particular assistant; this feature works without them.
- Changing the credentials model or adding per-operation authorization beyond upstream access control.
- Dynamic reconfiguration of filters while a server process is running.
