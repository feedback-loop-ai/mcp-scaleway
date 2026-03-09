# Research: Scaleway API Group Specs & Modular Architecture

**Feature**: 001-scaleway-api-specs | **Date**: 2026-03-06

## Research Questions & Findings

### RQ-1: How does the Scaleway JS SDK organize API products?

**Decision**: Use per-product SDK packages (`@scaleway/sdk-{product}`) with a shared client (`@scaleway/sdk-client`).

**Rationale**: The Scaleway JS SDK is structured as a monorepo with auto-generated per-product packages:
- `@scaleway/sdk-client` — core HTTP client, authentication, retry, interceptors
- `@scaleway/sdk-{product}` — one package per API product (e.g., `@scaleway/sdk-instance`, `@scaleway/sdk-k8s`, `@scaleway/sdk-lb`, `@scaleway/sdk-iam`, `@scaleway/sdk-domain`, `@scaleway/sdk-flexibleip`)
- `@scaleway/sdk` — meta-package aggregating all product packages

Each product package exports a versioned API class (e.g., `Instance.v1.API`, `Domain.v1.API`) instantiated with a shared client. The client handles authentication (accessKey, secretKey), default project/region/zone, pagination helpers, and exponential backoff retry.

**Alternatives considered**:
- Raw HTTP calls to `api.scaleway.com` — rejected because the SDK provides typed clients, pagination helpers, and error handling out of the box.
- Monolithic `@scaleway/sdk` import — acceptable as a convenience, but per-product packages enable tree-shaking and explicit dependency tracking.

### RQ-2: How should MCP tools be registered modularly?

**Decision**: Use `server.registerTool()` with Zod schemas, one registration function per product module.

**Rationale**: The MCP TypeScript SDK v2 uses `server.registerTool(name, { title, description, inputSchema, outputSchema }, handler)` where schemas are Zod objects. Each product module exports a `registerTools(server)` function that registers all tools for that product. The main server entry point imports and calls each registration function.

**Key patterns**:
- `inputSchema: z.object({...})` — full Zod schemas required (v2 migration)
- `outputSchema` — optional but recommended for structured output
- Handler receives validated params + context (`ctx.mcpReq.log()` for logging)
- Tool naming: `scaleway_{product}_{action}_{resource}` per FR-007

**Alternatives considered**:
- Multiple MCP servers (AWS pattern) — rejected because the spec requires a single MCP server with grouped tools, and Scaleway's API surface is smaller than AWS.
- Dynamic/lazy registration — rejected for simplicity; all tools register at startup since there's no performance concern with 200-300 tools.

### RQ-3: What are Scaleway's API URL and locality patterns?

**Decision**: Three locality types with distinct base URL patterns, all handled by the SDK.

**Rationale**:
- **Zoned APIs**: `https://api.scaleway.com/{product}/v1/zones/{zone}/...` (e.g., Instances, Block Storage, Elastic Metal)
- **Regional APIs**: `https://api.scaleway.com/{product}/v1/regions/{region}/...` (e.g., Kubernetes, VPC, Databases)
- **Global APIs**: `https://api.scaleway.com/{product}/v1/...` (e.g., IAM, DNS, Billing)

The SDK handles URL construction internally — callers pass `zone` or `region` as method parameters. The server needs to validate locality params match the product's locality type.

**Alternatives considered**: None — this is Scaleway's fixed API structure.

### RQ-4: What is Scaleway's standard pagination pattern?

**Decision**: Offset-based pagination with `page` + `page_size` parameters.

**Rationale**: Scaleway APIs use consistent pagination:
- Request: `page` (1-indexed), `page_size` (default 100, max varies by API)
- Response: includes `total_count` field for total items
- The SDK provides pagination helpers that abstract iteration

**Alternatives considered**: None — this is Scaleway's standard pattern.

### RQ-5: What is Scaleway's authentication model?

**Decision**: API key pair + project scoping via environment variables.

**Rationale**:
- `SCW_ACCESS_KEY` — API access key (SCWXXXXXXXXXXXXXXXXX format)
- `SCW_SECRET_KEY` — API secret key (UUID format)
- `SCW_DEFAULT_PROJECT_ID` — default project ID (UUID format)
- `SCW_DEFAULT_ORGANIZATION_ID` — optional organization ID
- `SCW_DEFAULT_REGION` — optional default region (e.g., `fr-par`)
- `SCW_DEFAULT_ZONE` — optional default zone (e.g., `fr-par-1`)

The SDK's `createClient()` accepts these directly. The SDK also supports loading from Scaleway CLI config files via `@scaleway/configuration-loader`.

**Alternatives considered**: OAuth/JWT — not applicable; Scaleway uses API keys.

### RQ-6: How should the project skeleton map API groups to directories?

**Decision**: Flat product-level directories under `src/tools/`, no intermediate group directories.

**Rationale**: The spec defines 36 API products in 10 logical groups. Using group-level directories (e.g., `src/tools/compute/instances/`) adds unnecessary nesting. Since each product is independently specifiable and implementable (FR-001), a flat structure (`src/tools/instances/`, `src/tools/k8s/`) is simpler and maps 1:1 to SDK package names.

**Alternatives considered**:
- Group-level nesting (`src/tools/compute/instances/`) — rejected per Principle V (YAGNI); adds navigation depth without functional benefit.
- Single tools directory with product prefixes — rejected; makes it harder to see module boundaries.

### RQ-7: What about Object Storage's S3-compatible API?

**Decision**: Object Storage will use a separate client pattern (S3-compatible) documented in its SDD spec.

**Rationale**: Scaleway Object Storage uses the S3 protocol, not the standard Scaleway REST API. It requires an S3-compatible client (e.g., `@aws-sdk/client-s3` or `@scaleway/sdk` with S3 support). This is a product-specific concern to be addressed in the Object Storage SDD spec (spec 011), not in this architectural feature.

**Alternatives considered**: None — this is deferred to the product spec.
