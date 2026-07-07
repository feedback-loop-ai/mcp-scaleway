# Data Model: 046-opensearch

All shapes verified against the Scaleway Go SDK
(`api/searchdb/v1alpha1/searchdb_sdk.go`). Wire format is snake_case JSON.

## Enums
- **DeploymentStatus**: `unknown_status | ready | creating | initializing | upgrading | deleting | error | locked | locking | unlocking`
- **NodeTypeStockStatus**: `unknown_stock | low_stock | out_of_stock | available`
- **VolumeType**: `unknown_type | sbs_5k | sbs_15k`

## Entities

### Deployment
| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | |
| name | string | |
| organization_id | string (UUID) | |
| project_id | string (UUID) | |
| status | DeploymentStatus | |
| tags | string[] | |
| node_amount | number | deprecated → node_count |
| node_count | number | |
| node_type | string | e.g. SEARCHDB-SHARED-2C-8G |
| volume | Volume \| null | |
| endpoints | Endpoint[] | |
| created_at | ISO datetime \| null | |
| updated_at | ISO datetime \| null | |
| version | string | |
| region | string | |

### Volume
| Field | Type |
|-------|------|
| type | VolumeType |
| size_bytes | number |

### Endpoint
| Field | Type | Notes |
|-------|------|-------|
| id | string (UUID) | |
| dns_record | string \| null | deprecated → services[].url |
| services | EndpointService[] | `{ name, port, url }` |
| public | {} | present for public endpoints |
| private_network | { private_network_id } | present for PN endpoints |

### NodeType
| Field | Type |
|-------|------|
| stock_status | NodeTypeStockStatus |
| name | string |
| description | string |
| vcpus | number |
| memory_bytes | number |
| disabled | boolean |
| beta | boolean |
| instance_range | string |
| available_volume_types | NodeTypeVolumeType[] |

**NodeTypeVolumeType**: `{ type, description, min_size_bytes, max_size_bytes, chunk_size_bytes }`

### User
| Field | Type |
|-------|------|
| username | string |

### Version
| Field | Type |
|-------|------|
| version | string |
| end_of_life | ISO datetime \| null |
| disabled | boolean |
| beta | boolean |

## List responses
- `ListDeploymentsResponse`: `{ deployments: Deployment[], total_count }`
- `ListNodeTypesResponse`: `{ node_types: NodeType[], total_count }`
- `ListUsersResponse`: `{ users: User[], total_count }`
- `ListVersionsResponse`: `{ versions: Version[], total_count }`

All list handlers transform the wire response into the shared
`{ items, totalCount, page, pageSize }` paginated envelope.

## Input → wire mappings
- Create/upgrade deployment: `nodeCount` → `node_count`, `volume.sizeBytes` →
  `volume.size_bytes`, `userName` → `user_name`, `volumeSizeBytes` → `volume_size_bytes`.
- Endpoint spec: `{ public: true }` → `{ public: {} }`;
  `{ privateNetworkId }` → `{ private_network: { private_network_id } }`.
