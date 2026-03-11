# Research - Apple Silicon (004)

## Scaleway Apple Silicon API

- **Version**: v1alpha1
- **Locality**: Zoned (currently `fr-par-3` only)
- **Base URL**: `https://api.scaleway.com/apple-silicon/v1alpha1/zones/{zone}/`
- **Auth**: Standard Scaleway API key (X-Auth-Token header via sdk-client)

## SDK Reference

Source: `@scaleway/sdk-applesilicon` (packages_generated/applesilicon/src/v1alpha1/)

### Key API Methods (from api.gen.ts)
- `listServerTypes()` - GET /server-types (no pagination)
- `getServerType(serverType)` - GET /server-type/{serverType}
- `createServer(...)` - POST /servers
- `listServers(...)` - GET /servers (paginated, order_by)
- `getServer(serverId)` - GET /servers/{serverId}
- `updateServer(serverId, ...)` - PATCH /servers/{serverId}
- `deleteServer(serverId)` - DELETE /servers/{serverId}
- `rebootServer(serverId)` - POST /servers/{serverId}/reboot
- `reinstallServer(serverId, ...)` - POST /servers/{serverId}/reinstall
- `listOS(...)` - GET /os (paginated, filterable by server_type, name)
- `getOS(osId)` - GET /os/{osId}

### Pagination Pattern
- Uses `page` and `page_size` query parameters
- Response includes `total_count` field
- List endpoints: listServers, listOS (paginated); listServerTypes (NOT paginated)

### Key Enums
- **ServerStatus**: unknown_status, starting, ready, error, rebooting, updating, locking, locked, unlocking, reinstalling, busy
- **ServerTypeStock**: unknown_stock, no_stock, low_stock, high_stock
- **CommitmentType**: duration_24h, renewed_monthly, none
- **ServerPrivateNetworkStatus**: vpc_unknown_status, vpc_enabled, vpc_updating, vpc_disabled
- **ListServersRequestOrderBy**: created_at_asc, created_at_desc

### Error Codes
Standard Scaleway error codes apply:
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 429: Rate limited
- 500: Server error

## Constraints
- 24h minimum lease duration (Apple licensing requirement)
- Only zone fr-par-3 currently available
- Server types have stock levels that may limit provisioning
