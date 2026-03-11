# Implementation Plan: Release Pipeline

**Branch**: `040-release-pipeline` | **Date**: 2026-03-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/040-release-pipeline/spec.md`

## Summary

Add an npm release pipeline that enables `npm install -g mcp-scaleway` installation and automated publishing via semantic version tags. Deliverables: a `bun.build.ts` build script, a `release.yml` GitHub Actions workflow, and package.json updates for bin/files/build metadata. Follows the proven pattern from the mcp-ory-kratos reference pipeline.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with Bun 1.x runtime
**Primary Dependencies**: @modelcontextprotocol/sdk ^1.25.x, @scaleway/sdk-client + per-product packages, zod ^3.25.x
**Storage**: N/A (stateless proxy — no state involved in release pipeline)
**Testing**: Vitest with @vitest/coverage-v8 (100% line+branch enforced)
**Target Platform**: npm registry; runtime compatibility: Node.js 18+ and Bun 1.x
**Project Type**: CLI tool (MCP server invoked as `mcp-scaleway` command)
**Performance Goals**: npm publish < 10 minutes from tag push; package install < 2 minutes
**Constraints**: Package size < 5MB; zero manual steps between tag and publication
**Scale/Scope**: Single release workflow file + build script + package.json metadata changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. AI-Native Development | ✅ PASS | No MCP tool changes — release pipeline is infrastructure |
| II. Spec-Driven Development | ✅ PASS | spec.md exists, plan.md being generated now |
| III. Contract-First API Design | ✅ N/A | No new MCP tools or API surfaces |
| IV. Operational Excellence | ✅ PASS | Pipeline includes validation gates, structured error handling |
| V. Simplicity & YAGNI | ✅ PASS | Follows proven reference pattern, minimal additions |
| VI. Fast Feedback Loops | ✅ PASS | Pipeline validates in < 10 min total |
| VII. Type Safety & Validation | ✅ PASS | Build uses TypeScript compilation; no runtime changes |
| VIII. 100% Test Coverage & API Parity | ✅ PASS | Pipeline enforces existing coverage gate before publish; no new source code requiring coverage |

**Gate Result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/040-release-pipeline/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output (workflow contract)
```

### Source Code (repository root)

```text
.github/workflows/
├── ci.yml               # EXISTING — unchanged
└── release.yml          # NEW — release pipeline workflow

bun.build.ts             # NEW — Bun bundler configuration
dist/
└── index.js             # GENERATED — built output (gitignored)

package.json             # MODIFIED — add bin, files, build script, engines
.gitignore               # MODIFIED — add dist/ if not present
```

**Structure Decision**: No new src/ code. This feature adds CI/CD configuration files only (GitHub Actions workflow + build script) and modifies package.json metadata.

## Complexity Tracking

No violations — no additional complexity tracking needed.
