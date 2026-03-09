# Feature Specification: Scaleway API Group Specs & Modular Architecture

**Feature Branch**: `001-scaleway-api-specs`
**Created**: 2026-03-06
**Status**: Draft
**Input**: User description: "Create a list of SDD specs in the specs folder that cover all API groups for creating MCP tools. Make sure the architecture / skeleton of the project recognizes the different groups and follows them."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Discover and Manage Compute Resources (Priority: P1)

An AI assistant user asks the MCP server to list, create, start, stop, or delete cloud compute resources (Instances, Elastic Metal servers, Apple Silicon machines). The server routes the request to the appropriate Scaleway compute API group, executes the operation, and returns structured results.

**Why this priority**: Compute is the foundational building block of any cloud platform. Without compute management, no other cloud operations are meaningful.

**Independent Test**: Can be fully tested by invoking any Instance tool (e.g., list instances) and verifying the server correctly calls the Scaleway Instances API and returns structured data.

**Acceptance Scenarios**:

1. **Given** a configured MCP server with valid Scaleway credentials, **When** a user requests to list all instances in a region, **Then** the server returns a structured list of instances with their status, type, and identifiers.
2. **Given** a configured MCP server, **When** a user requests to create an instance with specific parameters, **Then** the server validates the input, calls the Scaleway API, and returns the created instance details.
3. **Given** a configured MCP server, **When** a user requests compute operations for Elastic Metal or Apple Silicon, **Then** the server routes to the correct product-specific API group.

---

### User Story 2 - Manage Storage and Data Services (Priority: P1)

An AI assistant user asks the MCP server to manage storage resources — Block Storage volumes, Object Storage buckets/objects, or managed databases (PostgreSQL, MySQL, Redis, MongoDB). The server routes each request to the correct storage/data API group.

**Why this priority**: Storage and databases are critical infrastructure that nearly every workload depends on alongside compute.

**Independent Test**: Can be fully tested by invoking a Block Storage tool (e.g., list volumes) and verifying correct API routing and response structure.

**Acceptance Scenarios**:

1. **Given** a configured MCP server, **When** a user requests to list Block Storage volumes, **Then** the server calls the Block Storage (SBS) API and returns volume details.
2. **Given** a configured MCP server, **When** a user requests to create a managed database instance, **Then** the server routes to the correct database API (PostgreSQL/MySQL, Redis, or MongoDB) based on the engine specified.
3. **Given** a configured MCP server, **When** a user requests Object Storage operations, **Then** the server handles S3-compatible operations through the appropriate API.

---

### User Story 3 - Manage Networking and Security (Priority: P2)

An AI assistant user asks the MCP server to manage networking resources (VPC, Private Networks, Load Balancers, Public Gateways, DNS, Flexible IPs) or security resources (IAM, Secret Manager, Key Manager). The server routes to the correct networking or security API group.

**Why this priority**: Networking and security connect and protect compute and storage resources. They are essential but secondary to the resources they serve.

**Independent Test**: Can be fully tested by invoking a VPC tool (e.g., list private networks) and verifying correct API routing.

**Acceptance Scenarios**:

1. **Given** a configured MCP server, **When** a user requests to list private networks in a VPC, **Then** the server calls the VPC API and returns network details.
2. **Given** a configured MCP server, **When** a user requests to create a DNS record, **Then** the server routes to the Domains and DNS API.
3. **Given** a configured MCP server, **When** a user requests to manage secrets, **Then** the server routes to the Secret Manager API.

---

### User Story 4 - Deploy Serverless and Container Workloads (Priority: P2)

An AI assistant user asks the MCP server to manage serverless resources (Functions, Containers, Jobs) or container orchestration (Kubernetes Kapsule/Kosmos, Container Registry). The server routes to the appropriate serverless or container API group.

**Why this priority**: Serverless and container services represent modern deployment patterns that many users need, but they build upon compute and networking foundations.

**Independent Test**: Can be fully tested by invoking a Serverless Functions tool (e.g., list functions) and verifying correct API routing.

**Acceptance Scenarios**:

1. **Given** a configured MCP server, **When** a user requests to list Kubernetes clusters, **Then** the server calls the Kubernetes API and returns cluster details.
2. **Given** a configured MCP server, **When** a user requests to deploy a serverless function, **Then** the server routes to the Serverless Functions API.
3. **Given** a configured MCP server, **When** a user requests to manage container images, **Then** the server routes to the Container Registry API.

---

### User Story 5 - Use AI and Managed Services (Priority: P3)

An AI assistant user asks the MCP server to interact with Scaleway's AI services (Managed Inference, Generative APIs) or managed platform services (Transactional Email, Messaging/Queuing, IoT Hub, Web Hosting, Observability/Cockpit, Edge Services). The server routes to the correct API group.

**Why this priority**: These are higher-level managed services that add value on top of core infrastructure. They serve more specialized use cases.

**Independent Test**: Can be fully tested by invoking a Managed Inference tool (e.g., list deployments) and verifying correct API routing.

**Acceptance Scenarios**:

1. **Given** a configured MCP server, **When** a user requests to list inference deployments, **Then** the server calls the Managed Inference API and returns deployment details.
2. **Given** a configured MCP server, **When** a user requests to send a transactional email, **Then** the server routes to the Transactional Email API.
3. **Given** a configured MCP server, **When** a user requests observability data, **Then** the server routes to the Cockpit API.

---

### User Story 6 - Manage Account and Billing (Priority: P3)

An AI assistant user asks the MCP server to view account information, manage projects, check billing consumption, or browse the product catalog. The server routes to the appropriate account/billing API group.

**Why this priority**: Account and billing are supporting capabilities that enable governance but are not core infrastructure operations.

**Independent Test**: Can be fully tested by invoking an Account tool (e.g., list projects) and verifying correct API routing.

**Acceptance Scenarios**:

1. **Given** a configured MCP server, **When** a user requests to list projects, **Then** the server calls the Account API and returns project details.
2. **Given** a configured MCP server, **When** a user requests billing consumption data, **Then** the server routes to the Billing API.

---

### Edge Cases

- What happens when a user requests an operation on an API group that is not yet implemented? The server returns a clear error indicating the API group is not supported and lists available groups.
- What happens when Scaleway credentials are missing or invalid? The server returns an authentication error before attempting any API call.
- What happens when a user specifies an invalid region or zone for a product? The server validates the locality parameter against the API's supported localities (zoned, regional, or global) and returns a descriptive error.
- What happens when a Scaleway API returns a rate limit or quota error? The server surfaces the error with actionable guidance (e.g., retry after delay, request quota increase).
- What happens when a new Scaleway API is released that the server doesn't support yet? The modular architecture allows adding a new API group spec and corresponding tools without modifying existing groups.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST organize MCP tools into distinct API groups that mirror Scaleway's product organization, with each group independently specifiable and implementable.
- **FR-002**: The system MUST provide a separate SDD specification document for each of the following API products, each in its own numbered speckit feature directory (e.g., `specs/002-instances/spec.md`), delivered independently via `/speckit.specify`:

  **Compute**
  1. Instances (zoned) — virtual machines, volumes, IPs, security groups, placement groups
  2. Elastic Metal (zoned) — dedicated bare-metal servers, flexible IPs, private networks
  3. Apple Silicon (zoned) — Mac mini as-a-Service, private networks

  **Containers & Orchestration**
  4. Kubernetes (regional) — Kapsule & Kosmos clusters, node pools, versions
  5. Container Registry (regional) — image repositories, namespaces, tags

  **Serverless**
  6. Serverless Functions (regional) — function deployments, triggers, domains, tokens
  7. Serverless Containers (regional) — container deployments, domains, tokens
  8. Serverless Jobs (regional) — job definitions, runs, schedules
  9. Serverless SQL Databases (regional) — auto-scaling SQL database instances

  **Storage**
  10. Block Storage / SBS (zoned) — volumes, snapshots
  11. Object Storage (regional) — S3-compatible buckets and objects

  **Managed Databases**
  12. Managed Database for PostgreSQL & MySQL (regional) — instances, users, databases, backups, endpoints
  13. Managed Database for Redis (regional) — clusters, nodes, ACLs
  14. Managed Database for MongoDB (regional) — instances, users, snapshots

  **Networking**
  15. VPC & Private Networks (regional) — VPCs, private networks, subnets
  16. Load Balancer (zoned) — load balancers, backends, frontends, routes, certificates
  17. Public Gateway (zoned) — gateways, DHCP, PAT rules
  18. Domains and DNS (global) — zones, records, nameservers
  19. Domain Registrar (global) — domain registration, contacts, transfers
  20. IPAM (regional) — IP address management, reservations
  21. Edge Services (global) — CDN, caching, custom domains, TLS

  **Security & Identity**
  22. IAM (global) — users, applications, API keys, policies, groups
  23. Secret Manager (regional) — secrets, versions, access policies
  24. Key Manager (regional) — cryptographic keys, encryption operations

  **Messaging & Queuing**
  25. NATS (regional) — accounts, credentials, streams
  26. Queues / SQS (regional) — queues, messages
  27. Topics & Events / SNS (regional) — topics, subscriptions

  **AI & Machine Learning**
  28. Managed Inference (regional) — model deployments, endpoints
  29. Generative APIs (regional) — chat, embeddings, vision models

  **Observability**
  30. Cockpit (global + regional) — dashboards, data sources, tokens, alerting

  **Managed Services**
  31. Transactional Email (regional) — domains, email sending, webhooks
  32. IoT Hub (regional) — hubs, devices, routes, networks
  33. Web Hosting (regional) — hosting plans, domains, DNS

  **Account & Billing**
  34. Account / Projects (global) — organizations, projects
  35. Billing (global) — consumption, invoices, discounts
  36. Marketplace (global) — instance images, local images catalog

- **FR-003**: Each API group spec MUST document the complete set of operations (CRUD and custom actions) available for that group's resources, including HTTP method, path, key request parameters, response shape outline, pagination pattern, and error codes.
- **FR-004**: Each API group spec MUST specify whether the API is zoned, regional, or global and list the supported localities.
- **FR-005**: The project's directory structure MUST mirror the API group organization, with each group having its own dedicated module/directory for tools, types, and tests. Each module directory MUST include a minimal `index.ts` barrel export and a shared types file; no speculative business logic stubs.
- **FR-006**: The system MUST support adding new API groups without modifying existing groups (open for extension, closed for modification).
- **FR-007**: Each API group's MCP tools MUST follow consistent naming conventions: `scaleway_{group}_{action}_{resource}` (e.g., `scaleway_instances_list_servers`, `scaleway_dns_create_record`).
- **FR-008**: The system MUST validate that each request is routed to the correct Scaleway API endpoint based on the API group, locality type, and region/zone specified.
- **FR-009**: Each API group MUST handle pagination consistently, supporting Scaleway's standard pagination parameters (page, page_size) and returning total count metadata.
- **FR-010**: The system MUST authenticate all API requests using Scaleway API keys and project IDs, with credentials configured once and shared across all API groups.

### Key Entities

- **API Group**: A logical grouping of related Scaleway product APIs (e.g., "Compute", "Networking"). Contains one or more API products. Maps to a project directory/module.
- **API Product**: A specific Scaleway service API (e.g., "Instances", "Load Balancer"). Belongs to exactly one API group. Has a locality type (zoned, regional, or global). Has its own SDD specification document.
- **MCP Tool**: A single operation exposed by the MCP server (e.g., "list instances", "create DNS record"). Belongs to exactly one API product. Follows consistent naming conventions.
- **Locality**: The scope at which a Scaleway API operates — zoned (specific availability zone like fr-par-1), regional (specific region like fr-par), or global (no region required).
- **SDD Specification**: A design document in the `specs/` directory that fully describes one API product's operations, request/response shapes, and error handling for MCP tool implementation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A master index assigns a unique spec number (002–037) to each of the 36 Scaleway API products, with a defined SDD template ready for each to be specified via `/speckit.specify`.
- **SC-002**: A developer can add a new API group (spec + tools + tests) without modifying any existing API group code or specs, verified by adding a test API group in under 30 minutes.
- **SC-003**: The project directory structure has a 1:1 mapping between API groups and module directories, with no cross-group dependencies between tool modules.
- **SC-004**: Every MCP tool name follows the naming convention `scaleway_{group}_{action}_{resource}`, with 100% consistency across all API groups.
- **SC-005**: 100% of API product specs document the locality type (zoned/regional/global) and supported localities, enabling correct endpoint construction for every API call.
- **SC-006**: A new contributor can identify which module handles a given Scaleway product within 1 minute by following the directory structure.

## Clarifications

### Session 2026-03-06

- Q: How detailed should each SDD spec be? → A: Operation + key shapes — each spec lists operations with HTTP method, path, key request parameters, response shape outline, pagination, and error codes.
- Q: Should the project skeleton include TypeScript module stubs or only directories? → A: Directories + minimal index.ts barrel exports and a shared types file per group.
- Q: Where should the 36 SDD spec files live? → A: Each API product gets its own numbered speckit feature directory (e.g., `specs/002-instances/`, `specs/003-elastic-metal/`), not nested under `specs/scaleway-api/`. Each spec is delivered independently via `/speckit.specify`.
- Q: Should all 36 specs be created in this feature or incrementally? → A: This feature delivers the master index, SDD template, project skeleton, and numbering plan only. Individual API product specs are separate features delivered by P1/P2/P3 priority.

## Assumptions

- Scaleway's API structure as documented at developers.scaleway.com is the authoritative source for API groups, endpoints, and operations.
- The @scaleway/sdk package provides typed clients for most API products, reducing the need for raw HTTP calls.
- Object Storage uses an S3-compatible API which may require a different client pattern than the standard Scaleway API.
- Some APIs listed (e.g., IoT Hub) may be in beta or deprecated — specs will note the API's lifecycle status as documented by Scaleway.
- Each SDD spec will be created as a separate speckit feature (e.g., `specs/002-instances/`) and delivered independently; this spec defines the master index, SDD template, project skeleton, and numbering plan only.
- Authentication follows Scaleway's standard pattern: API key (SCW_ACCESS_KEY + SCW_SECRET_KEY) + project ID (SCW_DEFAULT_PROJECT_ID) + optional organization ID.
