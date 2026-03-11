# Clarifications - Apple Silicon (004)

## Resolved Ambiguities

### 1. SDK package strategy
**Question**: Use `@scaleway/sdk-applesilicon` or raw HTTP via `@scaleway/sdk-client`?
**Decision**: Use raw HTTP calls via `@scaleway/sdk-client` (the `Client.fetch()` pattern). The project only depends on `@scaleway/sdk-client`, not per-product SDK packages. This keeps the dependency tree lean and gives full control over request/response shaping.

### 2. Scope of tools - Runner configurations
**Question**: Should we expose runner (CI/CD) management tools?
**Decision**: No. Runners are an advanced/niche feature. Focus on core server lifecycle (P1) and catalog browsing (P2). Runner management can be added in a future iteration.

### 3. Scope of tools - Private Networks
**Question**: Should we expose private network attachment tools?
**Decision**: No. Private network management is exposed via the VPC product area tools. The `enable_vpc` flag on create/update is sufficient for the Apple Silicon tools.

### 4. Scope of tools - Batch create, update, connectivity diagnostics
**Question**: Include batch create, update server, and connectivity diagnostics?
**Decision**: No. Keep the initial tool set focused on the 8 core operations. Update, batch create, and diagnostics can be added later.

### 5. Zone handling
**Question**: How to handle the zone parameter given Apple Silicon is only in `fr-par-3`?
**Decision**: Accept zone as an optional parameter (defaulting to the client's default zone). The API will reject invalid zones. Do not hard-code `fr-par-3` - Scaleway may expand availability.

### 6. Sensitive fields in responses
**Question**: Should `sudo_password` and `vnc_url` be included in server responses?
**Decision**: Yes. The MCP server acts as a transparent proxy. The LLM user has authenticated with their Scaleway credentials and expects full API access. Filtering sensitive fields would break functionality.

### 7. Pagination defaults
**Question**: What page size default for list operations?
**Decision**: Use the shared `PaginationParams` schema (default page=1, pageSize=50, max 100). Consistent with other tools in the codebase.

### 8. Error handling
**Question**: Custom error handling or shared?
**Decision**: Use the shared `mapScalewayError` / `formatErrorResponse` utilities from `src/shared/errors.ts`. No product-specific error mapping needed.
