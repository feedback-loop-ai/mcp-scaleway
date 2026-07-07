# Feature Specification: Data Lab for Apache Spark

**Feature Branch**: `049-data-lab-spark`
**Created**: 2026-07-07
**Status**: Implemented
**Input**: Expose Scaleway's Data Lab for Apache Spark™ product as MCP tools.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Spark clusters (Priority: P1)

A data engineer using an MCP client wants to provision, inspect, scale, and tear
down managed Apache Spark clusters (Data Labs) on Scaleway without leaving their
assistant.

**Why this priority**: The cluster lifecycle is the core of the product; without
it the vertical delivers no value.

**Independent Test**: Create a cluster with a worker pool, list clusters, get its
details, scale it via update, then delete it — all through MCP tools against a
region.

**Acceptance Scenarios**:

1. **Given** valid credentials and a region, **When** the user lists clusters, **Then** a paginated list of Data Labs with status is returned.
2. **Given** a Spark version and a worker node configuration, **When** the user creates a cluster, **Then** a Data Lab is created and returned with status `creating`.
3. **Given** an existing cluster, **When** the user updates the worker node count, **Then** the cluster is scaled and returned.
4. **Given** an existing cluster, **When** the user deletes it, **Then** the cluster transitions to status `deleting`.

---

### User Story 2 - Discover capacity and versions (Priority: P2)

Before creating a cluster the user needs to know which node types, Spark
versions, and notebook versions are available in a region.

**Why this priority**: Required to make an informed create request, but read-only
and not on the critical write path.

**Independent Test**: List node types, list cluster versions, and list notebook
versions for a region and confirm each returns catalog data.

**Acceptance Scenarios**:

1. **Given** a region, **When** the user lists node types, **Then** node types with stock status, vCPUs, memory, GPUs, and targets are returned.
2. **Given** a region, **When** the user lists cluster versions, **Then** available Spark versions are returned.
3. **Given** a region, **When** the user lists notebook versions, **Then** available notebook software versions are returned.

---

### Edge Cases

- Listing in a region with no clusters returns an empty list with `total_count: 0`.
- Creating a cluster with `node_count` of 0 is rejected by input validation.
- Updating a cluster with no fields sends an empty patch body (no-op) rather than failing.
- Invalid region format (not `xx-xxx`) is rejected before any API call.
- 404 for an unknown cluster ID maps to a `not_found` error; 403 to `permission_denied`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST list Data Lab clusters in a region with pagination and optional filters (project_id, name, tags, order_by).
- **FR-002**: System MUST retrieve a single cluster by ID.
- **FR-003**: System MUST create a cluster with a name, Spark version, and worker configuration; optionally a main node, description, tags, notebook flag, total storage, private network, and project.
- **FR-004**: System MUST update a cluster's name, description, tags, and worker node count.
- **FR-005**: System MUST delete a cluster by ID.
- **FR-006**: System MUST list available node types in a region with pagination and order_by.
- **FR-007**: System MUST list available cluster (Spark) versions in a region.
- **FR-008**: System MUST list available notebook versions in a region.
- **FR-009**: All tools MUST authenticate with `X-Auth-Token` and target a region.
- **FR-010**: All errors MUST be mapped to the shared error envelope (not_found, permission_denied, invalid_input, rate_limited, server_error).

### Key Entities

- **Datalab (Cluster)**: A managed Apache Spark cluster — main node + worker pool, optional notebook, storage, status.
- **NodeType**: A worker/notebook hardware profile (vCPUs, memory, VRAM, GPUs, stock status, targets).
- **Cluster (version offering)**: A named Spark software family with its available versions.
- **NotebookVersion**: An available notebook software version.
- **Volume**: Storage attached to a node or cluster (`type`, `size` in bytes).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 8 tools are registered and callable via the MCP server.
- **SC-002**: 100% line and branch coverage of `src/tools/data-lab/`.
- **SC-003**: Every tool has a contract test referencing the API reference and parity matrix.
- **SC-004**: A user can complete the full cluster lifecycle (create → list → get → update → delete) using only these tools.

## Out of Scope

- **Run / session / job submission management**: The public `datalab` v1beta1 API is cluster-centric and exposes no run-, session-, or Spark-job-submission endpoints. Job submission happens inside the cluster (Spark UI / notebook), not via this API, so no such tools are provided. If Scaleway adds these endpoints they can be a follow-up vertical.
- **Node-type / version GET-by-id**: The API only exposes list endpoints for node types and versions; there are no single-item GET endpoints.
- **Notebook credential retrieval**: `notebook_url` is returned on the cluster object; there is no separate credentials endpoint.
