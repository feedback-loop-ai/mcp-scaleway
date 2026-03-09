# Scaleway API Reference Spec

Per Constitution Principle III (Contract-First API Design), this directory contains the Scaleway API Reference Specification — documenting request/response shapes, error codes, and pagination patterns per product area.

## Structure

Each product has a subdirectory matching `src/tools/{product}/`:

```
specs/scaleway-api/
├── instances/        # Instance API reference
├── elastic-metal/    # Elastic Metal API reference
├── k8s/              # Kubernetes API reference
├── ...               # One per product (36 total)
└── README.md         # This file
```

## Purpose

- Source of truth for Scaleway API shapes used by contract tests
- Enables contract test traceability (Constitution VIII)
- Referenced by `tests/parity-matrix.json` entries
