# Requirements Checklist: Scaleway InterLink

- [X] CHK-001 API slug, version (`v1beta1`) and region scoping verified against
      official docs + Go SDK (research.md)
- [X] CHK-002 All 23 endpoints documented in
      `specs/scaleway-api/interlink/api-reference.md`
- [X] CHK-003 Link CRUD tools implemented (list, get, create, update, delete)
- [X] CHK-004 Link VPC attach/detach tools implemented
- [X] CHK-005 Link routing-policy attach/detach/set tools implemented
- [X] CHK-006 Link enable/disable route-propagation tools implemented
- [X] CHK-007 Routing policy CRUD tools implemented
- [X] CHK-008 Partner list/get tools implemented
- [X] CHK-009 PoP list/get tools implemented
- [X] CHK-010 Dedicated connection list/get tools implemented
- [X] CHK-011 BGP session data exposed via Get/List Link (no invented endpoint)
- [X] CHK-012 All tools use `scaleway_interlink_` prefix, snake_case names
- [X] CHK-013 `registerInterlinkTools(server)` exported from index.ts
- [X] CHK-014 Unit tests cover every handler: success + error + filter/optional
      branches
- [X] CHK-015 Contract test covers every tool, referencing api-reference.md
- [X] CHK-016 100% line and branch coverage of `src/tools/interlink/`
- [X] CHK-017 `bun x tsc --noEmit` clean for interlink files
- [X] CHK-018 `bun x biome check` clean for interlink files
- [X] CHK-019 Parity fragment written to
      `<scratchpad>/parity-fragments/interlink.json`
- [X] CHK-020 Out-of-scope items (BGP write, dedicated connection CUD) recorded
      with rationale in spec.md
