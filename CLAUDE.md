# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) server for Scaleway - a European cloud provider offering compute, storage, networking, AI, and managed services.

## Build & Development Commands

```bash
# Start MCP server
bun run start

# Lint (Biome)
bun run lint
bun run lint:fix  # Auto-fix issues

# Type check
bun x tsc --noEmit

# Run integration tests (requires Scaleway - see .env.test.local.example)
bun run test
bun run test:watch

# Run unit tests only (CI-safe, no external dependencies)
bun x vitest run --config tests/vitest.config.ts --dir tests/unit

# Run contract tests (API shape validation)
bun x vitest run --config tests/vitest.config.ts --dir tests/contract

# Run tests with coverage (must be 100% - CI enforced)
bun run test -- --coverage.enabled

# Validate API parity matrix
bun run test:parity  # checks tests/parity-matrix.json completeness
```

## CI/CD

GitHub Actions CI runs on every push and PR:
- **Lint**: `bun run lint` (Biome)
- **Type Check**: `bun x tsc --noEmit`
- **Test**: Unit + contract tests (100% line and branch coverage enforced)
- **API Parity**: All Scaleway API operations in parity-matrix.json MUST have contract tests

Test organization:
- `tests/unit/` - Unit tests (run in CI)
- `tests/contract/` - API contract tests validating Scaleway API shapes (run in CI)
- `tests/api/` - Integration tests (require Scaleway, run locally only)
- `tests/parity-matrix.json` - Machine-readable map of Scaleway API operations to contract tests

## Testing Requirements (Constitution v1.1.0)

- **100% code coverage**: Line and branch. No exceptions, no exclusions
- **Full API contract parity**: Every Scaleway API endpoint exposed by this server MUST have a contract test validating request shape, response shape, pagination, auth, and error codes
- **Contract traceability**: Every contract test MUST reference its Scaleway API endpoint and the corresponding entry in `specs/scaleway-api/`
- **No tool without tests**: MCP tools cannot merge without 100% contract test coverage

## Architecture

*To be updated once the codebase is developed.*

Key directories:
- `specs/scaleway-api/` - Full Scaleway API Reference Spec (request/response shapes, error codes, pagination patterns per product area)

## Active Technologies
- TypeScript 5.x (strict mode) with Bun 1.x + @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk, zod ^3.25.x
- Vitest for testing (@vitest/coverage-v8 for 100% coverage enforcement), Biome for linting/formatting
- N/A (stateless proxy to Scaleway APIs)
- TypeScript 5.x (strict mode) with Bun 1.x runtime + `@modelcontextprotocol/sdk` ^1.25.x, `@scaleway/sdk-client` + per-product `@scaleway/sdk-{product}` packages, `zod` ^3.25.x (001-scaleway-api-specs)
- GitHub-flavored Markdown (documentation feature, no runtime code) + N/A (documentation only) (038-comprehensive-readme)
- TypeScript 5.x (strict mode) with Bun 1.x runtime + GitHub Actions (`oven-sh/setup-bun@v2`, `actions/checkout@v4`, `actions/upload-artifact@v4`), Biome (lint), Vitest + @vitest/coverage-v8 (test/coverage) (039-ci-build-pipeline)
- N/A (CI configuration only — YAML files + minor script changes) (039-ci-build-pipeline)
- TypeScript 5.x (strict mode) with Bun 1.x runtime + @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client + per-product packages, zod ^3.25.x (040-release-pipeline)
- N/A (stateless proxy — no state involved in release pipeline) (040-release-pipeline)

## Recent Changes
- Constitution v1.1.0: Added Principle VIII (100% Test Coverage & API Parity), expanded Contract-First API Design with Scaleway API Reference Spec requirement
