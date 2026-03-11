# Data Model - Apple Silicon (004)

## Zod Schemas

### Input Schemas

```typescript
// Shared zone parameter
zone: ScalewayZone.optional()

// ListServers
{ zone?, project_id?, organization_id?, order_by?, page?, page_size? }

// GetServer
{ zone?, server_id: string (UUID) }

// CreateServer
{ zone?, name?, project_id?, type: string, os_id?, enable_vpc: boolean, commitment_type?, public_bandwidth_bps?: number, enable_kext?: boolean }

// DeleteServer
{ zone?, server_id: string (UUID) }

// RebootServer
{ zone?, server_id: string (UUID) }

// ReinstallServer
{ zone?, server_id: string (UUID), os_id?, enable_kext?: boolean }

// ListServerTypes
{ zone? }

// ListOS
{ zone?, page?, page_size?, server_type?, name? }
```

### Response Shapes (from Scaleway API)

#### Server
All fields as documented in spec.md entities section. Returned as JSON.

#### ServerType
Nested objects for cpu, disk, memory, gpu, npu, network. Stock enum.

#### OS
Flat object with id, name, label, family, version, xcode_version, tags, supported_server_types.

### API Request/Response Mapping

| Tool | Request Body/Params | Response |
|------|-------------------|----------|
| list_servers | query: order_by, project_id, organization_id, page, page_size | { servers: Server[], total_count: number } |
| get_server | path: server_id | Server |
| create_server | body: name, project_id, type, os_id, enable_vpc, commitment_type, public_bandwidth_bps, enable_kext | Server |
| delete_server | path: server_id | void (204) |
| reboot_server | path: server_id, body: {} | Server |
| reinstall_server | path: server_id, body: os_id, enable_kext | Server |
| list_server_types | (none) | { server_types: ServerType[] } |
| list_os | query: page, page_size, server_type, name | { os: OS[], total_count: number } |
