# Requirements Checklist: 047-kafka

**Feature**: Clusters for Apache Kafka® MCP Tools

## Coverage of API surface

- [X] Cluster list (paginated, filters) — FR-001
- [X] Cluster get — FR-002
- [X] Cluster create (version, node type, node amount, volume, optional creds/endpoints) — FR-003
- [X] Cluster update (name, tags) — FR-004
- [X] Cluster delete — FR-005
- [X] Certificate authority get + renew — FR-006
- [X] Endpoint create (private/public) + delete — FR-007
- [X] User list + update — FR-008
- [X] Node type list (include disabled) — FR-009
- [X] Version list (filter) — FR-010

## Quality gates

- [X] All tools require region and authenticate via X-Auth-Token — FR-011
- [X] Structured error mapping for all handlers — FR-012
- [X] Every endpoint verified against the official reference (no invented endpoints)
- [X] Unit tests cover every handler: success, error, optional-param, and pagination branches
- [X] Contract tests validate request + response shapes for every tool
- [X] 100% line and branch coverage of src/tools/kafka/**
- [X] `bun x biome check` clean; `bun x tsc --noEmit` clean for feature files
- [X] Parity fragment written for all 13 tools
- [X] Out-of-scope operations documented with rationale (ACLs, user create/delete, endpoint list/get, settings)
