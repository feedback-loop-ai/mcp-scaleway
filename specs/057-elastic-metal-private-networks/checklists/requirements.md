# Requirements Checklist: Elastic Metal Private Networks

- [X] CHK-001 List tool exposes zone + all documented filters (server_id, private_network_id,
      organization_id, project_id, order_by) and pagination — FR-001
- [X] CHK-002 List uses the zone-level `/server-private-networks` collection path — research.md
- [X] CHK-003 Add tool sends `{ private_network_id }` to the nested server path — FR-002
- [X] CHK-004 Set tool sends `{ private_network_ids }` and supports empty (detach all) — FR-003
- [X] CHK-005 Set tool rejects > 8 Private Networks client-side — FR-006
- [X] CHK-006 Delete tool targets `/servers/{server_id}/private-networks/{private_network_id}` — FR-004
- [X] CHK-007 All ids validated as UUID; zone validated by ScalewayZone — FR-005
- [X] CHK-008 Errors mapped via shared error mapper — FR-007
- [X] CHK-009 New tools registered by `registerElasticMetalTools`; area now exposes 18 tools — FR-008, SC-001
- [X] CHK-010 100% line + branch coverage of elastic-metal src files — SC-002
- [X] CHK-011 Every new tool has a contract test referencing the API reference — SC-003
- [X] CHK-012 API reference updated with Private Networks section — Constitution (contract-first)
