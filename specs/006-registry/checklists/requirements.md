# Requirements Checklist: 006-registry

## Functional Requirements

- [ ] FR-001: Zod schemas for Namespace, Image, Tag entities
- [ ] FR-002: Zod schemas for all tool input parameters
- [ ] FR-003: Tool `scaleway_registry_list_namespaces` with pagination
- [ ] FR-004: Tool `scaleway_registry_get_namespace`
- [ ] FR-005: Tool `scaleway_registry_create_namespace`
- [ ] FR-006: Tool `scaleway_registry_update_namespace`
- [ ] FR-007: Tool `scaleway_registry_delete_namespace`
- [ ] FR-008: Tool `scaleway_registry_list_images` with pagination
- [ ] FR-009: Tool `scaleway_registry_get_image`
- [ ] FR-010: Tool `scaleway_registry_update_image`
- [ ] FR-011: Tool `scaleway_registry_delete_image`
- [ ] FR-012: Tool `scaleway_registry_list_tags` with pagination
- [ ] FR-013: Tool `scaleway_registry_get_tag`
- [ ] FR-014: Tool `scaleway_registry_delete_tag`
- [ ] FR-015: All tools use regional endpoint (fr-par, nl-ams, pl-waw)
- [ ] FR-016: Error mapping via shared `mapScalewayError`
- [ ] FR-017: Consistent tool naming: `scaleway_registry_{action}_{resource}`

## Testing Requirements

- [ ] TR-001: Unit tests for tool registration (12 tools registered)
- [ ] TR-002: Unit tests for all handler functions with mocked SDK
- [ ] TR-003: Contract tests for request/response shape validation
- [ ] TR-004: 100% line and branch coverage
- [ ] TR-005: Parity matrix entries for all 12 tools

## Non-Functional Requirements

- [ ] NR-001: Biome lint passes
- [ ] NR-002: TypeScript strict mode passes
- [ ] NR-003: No cross-module dependencies
