# Requirements Checklist: Apple silicon Private Networks

**Purpose**: Track implementation of all functional requirements from spec.md
**Feature**: specs/056-apple-silicon-private-networks/spec.md

## Private Network attachments

- [X] CHK001 FR-001: List attachments with pagination + filters (order_by, server_id, private_network_id, organization_id, project_id, ipam_ip_ids)
- [X] CHK002 FR-002: Get single attachment by server_id + private_network_id
- [X] CHK003 FR-003: Add server to Private Network with optional ipam_ip_ids
- [X] CHK004 FR-004: Set full set of Private Networks via per_private_network_ipam_ip_ids
- [X] CHK005 FR-005: Delete (detach) server from Private Network

## Cross-cutting

- [X] CHK006 FR-006: Optional zone with default-zone fallback, validated by ScalewayZone
- [X] CHK007 FR-007: Scaleway errors mapped to shared taxonomy; structured error responses
- [X] CHK008 Existing 8 Apple silicon tools unchanged and passing
- [X] CHK009 100% line + branch coverage of src/tools/apple-silicon/**
- [X] CHK010 Contract test per tool referencing specs/scaleway-api/apple-silicon/api-reference.md
- [X] CHK011 Parity fragment authored (apple-silicon-pn.json)
