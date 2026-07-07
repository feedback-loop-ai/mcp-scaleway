# Data Model: 048-data-warehouse

## Enums
- **DeploymentStatus**: unknown_status, ready, creating, configuring, deleting, error, locked, locking, unlocking, deploying, stopping, starting, stopped
- **EndpointProtocol**: unknown_protocol, tcp, https, mysql
- **DeploymentOrderBy**: created_at_desc, created_at_asc, name_asc, name_desc
- **DatabaseOrderBy**: name_asc, name_desc, size_asc, size_desc
- **UserOrderBy**: name_asc, name_desc

## Entities

### Deployment
`id` (UUID), `name`, `organization_id` (UUID), `project_id` (UUID), `status`
(DeploymentStatus), `tags` (string[]), `created_at?`/`updated_at?` (RFC3339,
nullable), `version?`, `replica_count?`, `shard_count?`, `cpu_min?`, `cpu_max?`,
`endpoints?` (Endpoint[]), `ram_per_cpu?` (GB), `move_factor?` (double 0–1),
`region`.

### Endpoint
`id` (UUID), `dns_record?`, `services?` (EndpointService[]),
`private_network?` `{ private_network_id }` | null, `public?` `{}` | null.

### EndpointService
`protocol` (EndpointProtocol), `port` (uint32).

### EndpointSpec (request one-of)
`{ public: {} }` OR `{ private_network: { private_network_id } }`.

### Database
`name`, `size` (bytes, uint64).

### User
`name`, `is_admin` (bool).

### Preset
`name`, `category`, `cpu_min`, `cpu_max`, `ram_per_cpu`, `replica_count`, `shard_count`.

### Version
`version`, `end_of_life_at?` (RFC3339, nullable).

### CertificateFile (scaleway.std.File)
`name`, `content_type`, `content`.

## List responses
`{ deployments|databases|users|presets|versions: T[], total_count: number }`
→ normalized to `{ items, totalCount, page, pageSize }` via `buildPaginatedResponse`.
