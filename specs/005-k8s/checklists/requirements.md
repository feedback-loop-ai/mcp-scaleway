# Requirements Checklist: Scaleway Kubernetes (Kapsule & Kosmos) MCP Tools

**Purpose**: Track implementation of all functional requirements from spec.md
**Created**: 2026-03-11
**Feature**: specs/005-k8s/spec.md

## Cluster Management (P1)

- [x] CHK001 US-K8S-01: List clusters with pagination and filtering
- [x] CHK002 US-K8S-02: Get cluster by ID and region
- [x] CHK003 US-K8S-03: Create cluster with name, version, CNI, description
- [x] CHK004 US-K8S-04: Delete cluster by ID with optional resource cleanup

## Node Pool Management (P1)

- [x] CHK005 US-K8S-05: List node pools for a cluster with pagination
- [x] CHK006 US-K8S-06: Get node pool by ID and region
- [x] CHK007 US-K8S-07: Create node pool with node type, size, autoscaling config
- [x] CHK008 US-K8S-08: Update node pool (size, autoscaling, tags)
- [x] CHK009 US-K8S-09: Delete node pool by ID
- [x] CHK010 US-K8S-10: Upgrade node pool to a new Kubernetes version

## Cluster Operations (P2)

- [x] CHK011 US-K8S-11: Retrieve kubeconfig for a cluster
- [x] CHK012 US-K8S-12: List available Kubernetes versions for a cluster

## Cluster Upgrades (P3)

- [x] CHK013 US-K8S-13: Upgrade cluster to a newer Kubernetes version

## Cross-Cutting

- [x] CHK014 All tools validate inputs with Zod schemas
- [x] CHK015 All errors mapped to structured MCP error responses
- [x] CHK016 All list operations support pagination
- [x] CHK017 All tools accept region parameter
- [x] CHK018 100% line and branch code coverage
- [x] CHK019 All operations in parity-matrix.json
- [x] CHK020 Contract tests for all tools

## Notes

- All items checked: implementation is complete per spec.md checklist
- All items trace to user stories in spec.md
