# Feature Specification: Clusters for Apache Kafka® MCP Tools

**Feature Branch**: `047-kafka`
**Created**: 2026-07-07
**Status**: Implemented
**Input**: Build the Scaleway Clusters for Apache Kafka® vertical (Public Beta).

## Overview

MCP tools for the Scaleway Clusters for Apache Kafka® API (`kafka/v1alpha1`, Public Beta). This is a
regional API (currently `fr-par`) providing fully-managed Apache Kafka clusters. Tools cover cluster
lifecycle, TLS certificate authority management, endpoint management (private/public network), cluster
users, and read-only discovery of node types and Kafka versions.

## User Scenarios & Testing

### User Story 1 - Cluster lifecycle (Priority: P1)

As a user, I can list, get, create, update, and delete Clusters for Apache Kafka in a region.

**Why this priority**: The cluster is the core resource; without it there is no product surface.

**Independent Test**: Create a cluster with a version, node type, node amount, and volume; list it;
fetch it by ID; rename it; delete it.

**Acceptance Scenarios**:

1. **Given** a valid region, version, node type and volume spec, **When** I create a cluster, **Then** a
   cluster with status `creating` is returned.
2. **Given** an existing cluster, **When** I list clusters filtered by name, **Then** the cluster appears
   in a paginated response.
3. **Given** an existing cluster, **When** I delete it, **Then** the cluster is returned with status
   `deleting`.

### User Story 2 - Connectivity: certificate authority and endpoints (Priority: P1)

As a user, I can fetch and renew the cluster's TLS certificate authority, and create/delete cluster
endpoints attached to a Private Network (or public network).

**Why this priority**: During Public Beta access is via private endpoints only; clients need the CA and a
Private Network endpoint to connect.

**Independent Test**: Fetch the CA for a cluster; create a private-network endpoint; delete it.

**Acceptance Scenarios**:

1. **Given** an existing cluster, **When** I request its certificate authority, **Then** a PEM payload is
   returned.
2. **Given** an existing cluster and a Private Network ID, **When** I create an endpoint, **Then** an
   endpoint referencing that Private Network is returned.

### User Story 3 - Users (Priority: P2)

As a user, I can list the cluster's users and update a user (e.g. rotate its password).

**Acceptance Scenarios**:

1. **Given** an existing cluster, **When** I list users, **Then** a paginated list of usernames is returned.
2. **Given** an existing user, **When** I update its password, **Then** the user is returned.

### User Story 4 - Catalog discovery (Priority: P3)

As a user, I can list available node types and Kafka versions in a region to inform cluster creation.

**Acceptance Scenarios**:

1. **Given** a region, **When** I list node types, **Then** a paginated list of node types is returned.
2. **Given** a region, **When** I list versions, **Then** a paginated list of Kafka versions is returned.

## Requirements

- **FR-001**: The system MUST list clusters in a region with pagination and optional filters
  (`project_id`, `organization_id`, `name`, `tags`, `order_by`).
- **FR-002**: The system MUST get a single cluster by ID.
- **FR-003**: The system MUST create a cluster with name, version, node type, node amount, and volume
  (size + type), and optional project, tags, initial user credentials, and endpoints.
- **FR-004**: The system MUST update a cluster's name and/or tags.
- **FR-005**: The system MUST delete a cluster by ID.
- **FR-006**: The system MUST get and renew the cluster's TLS certificate authority.
- **FR-007**: The system MUST create an endpoint (private or public network) and delete an endpoint by ID.
- **FR-008**: The system MUST list cluster users (paginated) and update a user's password.
- **FR-009**: The system MUST list available node types (with optional inclusion of disabled types).
- **FR-010**: The system MUST list available Kafka versions (with optional version filter).
- **FR-011**: All operations MUST require a region and authenticate via `X-Auth-Token`.
- **FR-012**: Errors MUST map to structured error responses (not_found, permission_denied, invalid_input,
  rate_limited, server_error).

## Out of Scope

- **ACLs / topic-level authorization**: The v1alpha1 Beta API exposes users (SASL principals) via
  `ListUsers` / `UpdateUser` only; there is no public ACL CRUD endpoint. Excluded because it does not exist
  in the reference.
- **Create/Delete user**: The Beta API only exposes `ListUsers` and `UpdateUser`; user creation happens via
  the initial `user_name`/`password` at cluster creation. No standalone create/delete user endpoint exists.
- **List/Get endpoints**: The API has no standalone list/get endpoint operation; endpoints are returned
  inline on the `Cluster` object. Only create/delete are exposed.
- **Cluster settings / config updates**: `UpdateCluster` accepts only `name` and `tags` in the reference;
  settings are read-only on the cluster object.
- **WaitForCluster**: An SDK client-side polling helper, not a REST endpoint.
