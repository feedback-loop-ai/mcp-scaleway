# Research: Comprehensive README Documentation

**Date**: 2026-03-11 | **Branch**: `038-comprehensive-readme`

## R1: Tool Inventory

**Decision**: The project contains 539 tools across 36 service areas (not 35 as initially estimated).

**Service areas and tool counts**:
- Account (5), Apple Silicon (8), Billing (5), Block Storage (11), Cockpit (22), Containers (20), DNS (18), Domain Registrar (15), Edge Services (28), Elastic Metal (14), Functions (20), Generative APIs (4), IAM (32), Inference (15), Instances (20), IoT (29), IPAM (5), Jobs (9), K8s (13), Key Manager (13), Load Balancer (31), Marketplace (8), MongoDB (15), NATS (9), Object Storage (14), Public Gateway (26), RDB (27), Redis (16), Registry (12), Secret Manager (16), Serverless SQL DB (9), SNS (8), SQS (8), TEM (15), VPC (10), Web Hosting (9)

**Rationale**: Extracted directly from server.tool() calls in source code.
**Alternatives considered**: Manual counting from directory names (less accurate).

## R2: Service Categorization

**Decision**: Organize services into 6 categories matching Scaleway's own product taxonomy:

1. **Compute** (3): Instances, Elastic Metal, Apple Silicon
2. **Storage & Databases** (8): Block Storage, Object Storage, RDB, MongoDB, Redis, Serverless SQL DB, NATS, SQS
3. **Networking** (7): VPC, Load Balancer, Public Gateway, DNS, Domain Registrar, IPAM, Edge Services
4. **Serverless & Containers** (4): Containers, Functions, Jobs, K8s
5. **AI & Machine Learning** (3): Inference, Generative APIs, Cockpit
6. **Security & Identity** (3): IAM, Secret Manager, Key Manager
7. **Managed Services** (5): SNS, TEM, IoT, Registry, Marketplace
8. **Account & Billing** (3): Account, Billing, Web Hosting

**Rationale**: Matches Scaleway's console navigation for familiarity.
**Alternatives considered**: Alphabetical (less discoverable), flat list (too long).

## R3: MCP Client Configuration Patterns

**Decision**: Document configuration for Claude Desktop and Claude Code as primary targets.

- **Claude Desktop**: `claude_desktop_config.json` with `mcpServers` object
- **Claude Code**: `.mcp.json` at project root or `~/.claude/mcp.json` globally

**Rationale**: These are the two most popular MCP clients. Generic MCP client guidance covers others.
**Alternatives considered**: Cursor, Windsurf (less common for MCP).

## R4: Tool Management Approach

**Decision**: Document MCP client-side tool filtering since the server registers all tools unconditionally. Claude Desktop and Claude Code both support `allowedTools` patterns.

**Rationale**: The server has no built-in tool filtering—all 539 tools are always registered. Filtering must happen at the client level.
**Alternatives considered**: Server-side env var filtering (not implemented, would require code changes).

## R5: License

**Decision**: No LICENSE file exists in the repository. The README will omit a license section or note that the project is currently unlicensed.

**Rationale**: Cannot reference a non-existent license file.
**Alternatives considered**: Adding a license (out of scope for this feature).

## R6: Authentication Flow

**Decision**: Document the env var-based authentication as implemented in `src/shared/auth.ts`:
- Required: `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`, `SCW_DEFAULT_PROJECT_ID`
- Optional: `SCW_DEFAULT_ORGANIZATION_ID`, `SCW_DEFAULT_REGION` (default: fr-par), `SCW_DEFAULT_ZONE` (default: fr-par-1)

**Rationale**: Direct extraction from source code.
