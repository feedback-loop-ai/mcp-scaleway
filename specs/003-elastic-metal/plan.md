# Implementation Plan: Scaleway Elastic Metal MCP Tools

**Branch**: `003-elastic-metal` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-elastic-metal/spec.md`

## Summary

Implement 14 MCP tools for Scaleway Elastic Metal (bare-metal servers) covering full server lifecycle (CRUD), server actions (install/reboot/start/stop), offer and OS listing, BMC access, and flexible IP management. All tools are zoned, use Zod validation, and map Scaleway API errors to structured MCP responses.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Bun 1.x runtime
**Primary Dependencies**: `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client`, `zod` ^3.25.x
**Storage**: N/A (stateless proxy to Scaleway APIs)
**Testing**: Vitest with `@vitest/coverage-v8` (100% line + branch coverage enforced)
**Target Platform**: Bun runtime, stdio transport for MCP
**Project Type**: MCP server (CLI service)
**Performance Goals**: Millisecond startup, sub-second tool dispatch
**Constraints**: Stateless proxy, all state lives in Scaleway API
**Scale/Scope**: 14 tools, 1 product module

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | PASS | Schema-validated MCP tools with structured errors |
| II. Spec-Driven Development | PASS | Full SDD pipeline executed |
| III. Contract-First API Design | PASS | Contract tests for all tools reference Scaleway API specs |
| IV. Operational Excellence | PASS | Structured error responses, consistent patterns |
| V. Simplicity & YAGNI | PASS | Direct SDK calls, no abstraction layers |
| VI. Fast Feedback Loops | PASS | Bun + Vitest, mocked SDK for unit/contract tests |
| VII. Type Safety & Validation | PASS | Zod schemas for all inputs, TypeScript strict mode |
| VIII. 100% Test Coverage & API Parity | PASS | 100% coverage enforced, parity matrix updated |

## Project Structure

### Documentation (this feature)

```text
specs/003-elastic-metal/
├── spec.md
├── plan.md              # This file
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── checklists/
│   └── requirements.md
└── contracts/
    └── tool-contract.md
```

### Source Code (repository root)

```text
src/tools/elastic-metal/
├── index.ts             # registerElasticMetalTools() - tool definitions
├── types.ts             # Zod schemas for all tool inputs/outputs
└── handlers.ts          # Handler implementations (SDK calls + error mapping)

tests/
├── unit/tools/elastic-metal/
│   └── handlers.test.ts # Unit tests with mocked SDK
└── contract/tools/elastic-metal/
    └── contract.test.ts # API contract tests
```

**Structure Decision**: Three files in the product module — `types.ts` (Zod schemas), `handlers.ts` (business logic), `index.ts` (MCP registration). This separation enables independent testing of validation (types), logic (handlers), and registration (index).

## Tool Inventory

| Tool Name | HTTP Method | Scaleway Endpoint | US |
|-----------|-------------|-------------------|-----|
| scaleway_elastic_metal_list_servers | GET | /baremetal/v1/zones/{zone}/servers | US1 |
| scaleway_elastic_metal_get_server | GET | /baremetal/v1/zones/{zone}/servers/{server_id} | US1 |
| scaleway_elastic_metal_create_server | POST | /baremetal/v1/zones/{zone}/servers | US1 |
| scaleway_elastic_metal_delete_server | DELETE | /baremetal/v1/zones/{zone}/servers/{server_id} | US1 |
| scaleway_elastic_metal_install_server | POST | /baremetal/v1/zones/{zone}/servers/{server_id}/install | US2 |
| scaleway_elastic_metal_reboot_server | POST | /baremetal/v1/zones/{zone}/servers/{server_id}/reboot | US2 |
| scaleway_elastic_metal_start_server | POST | /baremetal/v1/zones/{zone}/servers/{server_id}/start | US2 |
| scaleway_elastic_metal_stop_server | POST | /baremetal/v1/zones/{zone}/servers/{server_id}/stop | US2 |
| scaleway_elastic_metal_list_offers | GET | /baremetal/v1/zones/{zone}/offers | US3 |
| scaleway_elastic_metal_list_oss | GET | /baremetal/v1/zones/{zone}/oss | US3 |
| scaleway_elastic_metal_get_bmc_access | GET | /baremetal/v1/zones/{zone}/servers/{server_id}/bmc-access | US3 |
| scaleway_elastic_metal_list_ips | GET | /baremetal/v1/zones/{zone}/ips | US4 |
| scaleway_elastic_metal_create_ip | POST | /baremetal/v1/zones/{zone}/ips | US4 |
| scaleway_elastic_metal_delete_ip | DELETE | /baremetal/v1/zones/{zone}/ips/{ip_id} | US4 |

## Complexity Tracking

No constitution violations. Direct SDK usage with Zod validation and structured error mapping.
