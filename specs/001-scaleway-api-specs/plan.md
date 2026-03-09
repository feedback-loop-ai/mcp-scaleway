# Implementation Plan: Scaleway API Group Specs & Modular Architecture

**Branch**: `001-scaleway-api-specs` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-scaleway-api-specs/spec.md`

## Summary

Deliver the foundational architecture for the MCP Scaleway server: a master index mapping 36 Scaleway API products to numbered spec directories (002-037), an SDD template for authoring product specs, and a project skeleton with per-product module directories, shared infrastructure (client, auth, pagination), and test scaffolding. This feature does NOT implement any tools — it establishes the structure for all subsequent product features.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Bun 1.x runtime
**Primary Dependencies**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` + per-product `@scaleway/sdk-{product}` packages, `zod` ^3.25.x
**Storage**: N/A (stateless proxy to Scaleway APIs)
**Testing**: Vitest with `@vitest/coverage-v8` (100% line + branch coverage enforced)
**Target Platform**: Node.js/Bun runtime, stdio transport for MCP
**Project Type**: MCP server (CLI service)
**Performance Goals**: Millisecond startup (Bun native), <5s unit test suite
**Constraints**: Stateless proxy — no local state, no database, no caching
**Scale/Scope**: 36 API products, ~200-300 MCP tools when fully implemented, 10 logical API groups

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | MCP server with schema-validated tools, structured errors |
| II. Spec-Driven Development | PASS | This feature IS the spec/plan phase for architecture |
| III. Contract-First API Design | PASS | SDD template enforces contract-first; `specs/scaleway-api/` reference spec required |
| IV. Operational Excellence | PASS | Deferred to implementation features; skeleton includes shared error handling structure |
| V. Simplicity & YAGNI | PASS | Flat product directories, minimal stubs (index.ts + types.ts only), no speculative logic |
| VI. Fast Feedback Loops | PASS | Bun runtime, Vitest, Biome — all configured in this feature |
| VII. Type Safety & Validation | PASS | TypeScript strict mode, Zod schemas for all tool inputs |
| VIII. 100% Test Coverage & API Parity | PASS | Test scaffolding + parity matrix skeleton established; enforcement deferred to tool features |

**Post-Phase 1 Re-check**: All gates still PASS. No violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/001-scaleway-api-specs/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── tool-contract.md # MCP tool contract format specification
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── server.ts                    # MCP server entry point — creates server, imports tool registrations
├── shared/
│   ├── client.ts                # Scaleway SDK client factory (createClient wrapper)
│   ├── auth.ts                  # Auth config loading (env vars + optional CLI config)
│   ├── pagination.ts            # Shared pagination helpers for Scaleway APIs
│   ├── errors.ts                # Scaleway → MCP error mapping
│   └── types.ts                 # Shared types (Locality, PaginationParams, etc.)
├── tools/
│   ├── index.ts                 # Barrel: imports all product modules, exports registerAllTools()
│   ├── instances/
│   │   ├── index.ts             # registerInstancesTools(server) — tool definitions
│   │   └── types.ts             # Instance-specific Zod schemas and types
│   ├── elastic-metal/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── apple-silicon/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── k8s/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── registry/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── functions/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── containers/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── jobs/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── serverless-sqldb/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── block-storage/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── object-storage/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── rdb/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── redis/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── mongodb/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── vpc/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── lb/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── public-gateway/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── dns/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── domain-registrar/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── ipam/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── edge-services/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── iam/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── secret-manager/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── key-manager/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── nats/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── sqs/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── sns/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── inference/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── generative-apis/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── cockpit/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── tem/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── iot/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── webhosting/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── account/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── billing/
│   │   ├── index.ts
│   │   └── types.ts
│   └── marketplace/
│       ├── index.ts
│       └── types.ts

tests/
├── unit/                        # Unit tests (CI-safe)
├── contract/                    # API contract tests (CI-safe)
├── api/                         # Integration tests (requires Scaleway credentials)
├── parity-matrix.json           # Machine-readable API operation → test mapping
└── vitest.config.ts             # Test configuration
```

**Structure Decision**: Flat product-level directories under `src/tools/` — each product gets its own directory with `index.ts` (tool registration) and `types.ts` (Zod schemas). No intermediate group directories (per Principle V: YAGNI). Shared infrastructure lives in `src/shared/`. This maps 1:1 to Scaleway SDK package names and enables independent development per product.

## Master Index: Spec Numbers → API Products

| Spec # | Directory Name | API Product | Locality | SDK Package | Group |
|--------|---------------|-------------|----------|-------------|-------|
| 002 | instances | Instances | zoned | @scaleway/sdk-instance | Compute |
| 003 | elastic-metal | Elastic Metal | zoned | @scaleway/sdk-baremetal | Compute |
| 004 | apple-silicon | Apple Silicon | zoned | @scaleway/sdk-applesilicon | Compute |
| 005 | k8s | Kubernetes | regional | @scaleway/sdk-k8s | Containers |
| 006 | registry | Container Registry | regional | @scaleway/sdk-registry | Containers |
| 007 | functions | Serverless Functions | regional | @scaleway/sdk-function | Serverless |
| 008 | containers | Serverless Containers | regional | @scaleway/sdk-container | Serverless |
| 009 | jobs | Serverless Jobs | regional | @scaleway/sdk-jobs | Serverless |
| 010 | serverless-sqldb | Serverless SQL DB | regional | @scaleway/sdk-serverlesssqldb | Serverless |
| 011 | block-storage | Block Storage (SBS) | zoned | @scaleway/sdk-block | Storage |
| 012 | object-storage | Object Storage | regional | S3-compatible client | Storage |
| 013 | rdb | PostgreSQL & MySQL | regional | @scaleway/sdk-rdb | Databases |
| 014 | redis | Redis | regional | @scaleway/sdk-redis | Databases |
| 015 | mongodb | MongoDB | regional | @scaleway/sdk-mongodb | Databases |
| 016 | vpc | VPC & Private Networks | regional | @scaleway/sdk-vpc | Networking |
| 017 | lb | Load Balancer | zoned | @scaleway/sdk-lb | Networking |
| 018 | public-gateway | Public Gateway | zoned | @scaleway/sdk-vpcgw | Networking |
| 019 | dns | Domains and DNS | global | @scaleway/sdk-domain | Networking |
| 020 | domain-registrar | Domain Registrar | global | @scaleway/sdk-domain | Networking |
| 021 | ipam | IPAM | regional | @scaleway/sdk-ipam | Networking |
| 022 | edge-services | Edge Services | global | @scaleway/sdk-edgeservices | Networking |
| 023 | iam | IAM | global | @scaleway/sdk-iam | Security |
| 024 | secret-manager | Secret Manager | regional | @scaleway/sdk-secret | Security |
| 025 | key-manager | Key Manager | regional | @scaleway/sdk-keymanager | Security |
| 026 | nats | NATS | regional | @scaleway/sdk-mnq | Messaging |
| 027 | sqs | Queues / SQS | regional | @scaleway/sdk-mnq | Messaging |
| 028 | sns | Topics & Events / SNS | regional | @scaleway/sdk-mnq | Messaging |
| 029 | inference | Managed Inference | regional | @scaleway/sdk-inference | AI |
| 030 | generative-apis | Generative APIs | regional | @scaleway/sdk-generativeapis | AI |
| 031 | cockpit | Cockpit | global+regional | @scaleway/sdk-cockpit | Observability |
| 032 | tem | Transactional Email | regional | @scaleway/sdk-tem | Managed Services |
| 033 | iot | IoT Hub | regional | @scaleway/sdk-iot | Managed Services |
| 034 | webhosting | Web Hosting | regional | @scaleway/sdk-webhosting | Managed Services |
| 035 | account | Account / Projects | global | @scaleway/sdk-account | Account |
| 036 | billing | Billing | global | @scaleway/sdk-billing | Account |
| 037 | marketplace | Marketplace | global | @scaleway/sdk-marketplace | Account |

## Complexity Tracking

No constitution violations to justify. The design is intentionally minimal:
- Flat directory structure (no nesting beyond `src/tools/{product}/`)
- Minimal stubs (index.ts + types.ts per product, no business logic)
- Single MCP server process
- Direct SDK usage (no abstraction layers)
