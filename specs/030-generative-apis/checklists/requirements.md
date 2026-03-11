# Requirements Checklist: Scaleway Generative APIs MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/030-generative-apis/spec.md

## Model Discovery (P1)

- [ ] CHK001 FR-001: List available generative AI models
- [ ] CHK002 FR-002: Get specific model by ID (client-side filtering)

## Chat Completion (P1)

- [ ] CHK003 FR-003: Create chat completions with model, messages, and optional parameters

## Text Embeddings (P2)

- [ ] CHK004 FR-004: Create text embeddings with model and input (string or string array)

## Cross-Cutting

- [ ] CHK005 FR-005: All tools validate inputs with Zod schemas
- [ ] CHK006 FR-006: All errors mapped to structured MCP error responses
- [ ] CHK007 FR-007: All tools accept region parameter (default: fr-par)
- [ ] CHK008 FR-008: Authentication uses Bearer token with SCW_SECRET_KEY
- [ ] CHK009 100% line and branch code coverage
- [ ] CHK010 All operations in parity-matrix.json
- [ ] CHK011 Contract tests for all tools

## Notes

- Check items off as completed: `[x]`
- All items trace to functional requirements in spec.md
