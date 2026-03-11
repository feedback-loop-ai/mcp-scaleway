# Data Model: Scaleway VPC & Private Networks MCP Tools

**Feature**: 016-vpc | **Date**: 2026-03-11

## Entities

### Vpc

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique VPC identifier |
| name | string | yes | VPC name |
| region | string | yes | Region (e.g., fr-par) |
| project | string (UUID) | yes | Project ID |
| tags | string[] | yes | User-defined tags |
| is_default | boolean | yes | Whether this is the default VPC for the project |
| private_network_count | number | yes | Number of private networks attached to this VPC |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### PrivateNetwork

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique private network identifier |
| name | string | yes | Private network name |
| vpc_id | string (UUID) | yes | Parent VPC ID |
| region | string | yes | Region (e.g., fr-par) |
| project_id | string (UUID) | yes | Project ID |
| tags | string[] | yes | User-defined tags |
| subnets | Subnet[] | yes | Array of subnets attached to this network |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

### Subnet

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string (UUID) | yes | Unique subnet identifier |
| subnet | string (CIDR) | yes | CIDR notation (e.g., 192.168.1.0/24) |
| created_at | string (ISO 8601) | yes | Creation timestamp |
| updated_at | string (ISO 8601) | yes | Last update timestamp |

## Relationships

```
Vpc (1) ──── (N) PrivateNetwork (1) ──── (N) Subnet
```

- A VPC contains zero or more Private Networks. The `private_network_count` field on Vpc tracks this.
- A Private Network belongs to exactly one VPC via `vpc_id`.
- A Private Network contains zero or more Subnets, each representing a CIDR block.
- Deleting a VPC requires all Private Networks to be removed first.
- Deleting a Private Network requires all attached resources (instances, etc.) to be detached first.

## Field Naming Notes

- VPCs use `project` for the project ID field (consistent with Scaleway VPC API).
- Private Networks use `project_id` for the project ID field (consistent with Scaleway VPC API).
- This asymmetry is intentional and matches the upstream Scaleway API naming conventions.
