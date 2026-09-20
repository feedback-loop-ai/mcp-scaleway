# Scaleway API Reference Spec

Per Constitution Principle III (Contract-First API Design), this directory contains the Scaleway API Reference Specification — documenting request/response shapes, error codes, and pagination patterns per product area.

## Structure

Each product has a subdirectory matching `src/tools/{product}/`:

```
specs/scaleway-api/
├── instances/        # Instance API reference
├── elastic-metal/    # Elastic Metal API reference
├── k8s/              # Kubernetes API reference
├── ...               # One per product (50 total)
└── README.md         # This file
```

## Purpose

- Source of truth for Scaleway API shapes used by contract tests
- Enables contract test traceability (Constitution VIII)
- Cited by the header comments of contract tests under `tests/contract/`; `tests/parity-matrix.json` maps every Scaleway API operation to its MCP tool and contract test

## Current executable contracts

The [runtime wire catalog](../../src/shared/response-contracts.json) supplements these
narrative records with fetched 2026-09-19 OpenAPI contracts, pinned official SDK
projections and identified compatibility/protocol overlays. Every supported operation
maps to independent method/path/request/response evidence and an executable transport
suite through [the contract evidence index](../../tests/contract-evidence.json).
[Boundary methodology](../064-remaining-remediation/contracts/wire-evidence.md) explains
request constraints, pagination, authentication, error handling and limitations.

Historical provenance classifications in individual references remain audit history;
current route findings and explicit verification blockers are reconciled in
[feature 064](../064-remaining-remediation/endpoints.md). In particular, Serverless SQL
has a pinned official Go SDK contract despite lacking a public OpenAPI schema. Six
unverified legacy Cockpit/Inference IDs remain locally unavailable and are never counted
as validated wire endpoints.
