# Tool Contracts: Scaleway Elastic Metal MCP Tools

**Branch**: `003-elastic-metal` | **Date**: 2026-03-11

## Common Patterns

All tools follow these conventions:
- **Zone parameter**: Required `zone` string (e.g., "fr-par-1") on every tool
- **Pagination**: `page` (default 1) and `pageSize` (default 50, max 100) on list endpoints
- **Response**: JSON text content with structured data
- **Errors**: Mapped via `formatErrorResponse()` from shared/errors.ts

---

## US1: Server CRUD

### scaleway_elastic_metal_list_servers

**Input Schema**:
```json
{
  "zone": "string (required, e.g., fr-par-1)",
  "page": "number (optional, default 1)",
  "pageSize": "number (optional, default 50, max 100)",
  "project_id": "string (optional)",
  "name": "string (optional, filter by name)",
  "tags": "string[] (optional, filter by tags)",
  "status": "string (optional, filter by status)",
  "order_by": "string (optional, e.g., created_at_asc)"
}
```
**Response**: `{ servers: Server[], totalCount: number, page: number, pageSize: number }`
**API**: `GET /baremetal/v1/zones/{zone}/servers`

### scaleway_elastic_metal_get_server

**Input Schema**:
```json
{
  "zone": "string (required)",
  "server_id": "string (required, UUID)"
}
```
**Response**: `Server` object
**API**: `GET /baremetal/v1/zones/{zone}/servers/{server_id}`

### scaleway_elastic_metal_create_server

**Input Schema**:
```json
{
  "zone": "string (required)",
  "offer_id": "string (required)",
  "name": "string (required)",
  "description": "string (optional, default '')",
  "project_id": "string (optional)",
  "tags": "string[] (optional, default [])"
}
```
**Response**: `Server` object (newly created)
**API**: `POST /baremetal/v1/zones/{zone}/servers`

### scaleway_elastic_metal_delete_server

**Input Schema**:
```json
{
  "zone": "string (required)",
  "server_id": "string (required, UUID)"
}
```
**Response**: `Server` object (with status: deleting)
**API**: `DELETE /baremetal/v1/zones/{zone}/servers/{server_id}`

---

## US2: Server Actions

### scaleway_elastic_metal_install_server

**Input Schema**:
```json
{
  "zone": "string (required)",
  "server_id": "string (required)",
  "os_id": "string (required)",
  "hostname": "string (required)",
  "ssh_key_ids": "string[] (required)",
  "password": "string (optional)",
  "service_user": "string (optional)",
  "service_password": "string (optional)"
}
```
**Response**: `Server` object (with install status)
**API**: `POST /baremetal/v1/zones/{zone}/servers/{server_id}/install`

### scaleway_elastic_metal_reboot_server

**Input Schema**:
```json
{
  "zone": "string (required)",
  "server_id": "string (required)",
  "boot_type": "string (optional, e.g., normal, rescue)"
}
```
**Response**: `Server` object
**API**: `POST /baremetal/v1/zones/{zone}/servers/{server_id}/reboot`

### scaleway_elastic_metal_start_server

**Input Schema**:
```json
{
  "zone": "string (required)",
  "server_id": "string (required)",
  "boot_type": "string (optional)"
}
```
**Response**: `Server` object
**API**: `POST /baremetal/v1/zones/{zone}/servers/{server_id}/start`

### scaleway_elastic_metal_stop_server

**Input Schema**:
```json
{
  "zone": "string (required)",
  "server_id": "string (required)"
}
```
**Response**: `Server` object
**API**: `POST /baremetal/v1/zones/{zone}/servers/{server_id}/stop`

---

## US3: Offers, OS, BMC

### scaleway_elastic_metal_list_offers

**Input Schema**:
```json
{
  "zone": "string (required)",
  "page": "number (optional, default 1)",
  "pageSize": "number (optional, default 50)",
  "subscription_period": "string (optional, e.g., hourly, monthly)"
}
```
**Response**: `{ offers: Offer[], totalCount: number, page: number, pageSize: number }`
**API**: `GET /baremetal/v1/zones/{zone}/offers`

### scaleway_elastic_metal_list_oss

**Input Schema**:
```json
{
  "zone": "string (required)",
  "page": "number (optional, default 1)",
  "pageSize": "number (optional, default 50)",
  "offer_id": "string (optional, filter compatible OSes)"
}
```
**Response**: `{ oss: OS[], totalCount: number, page: number, pageSize: number }`
**API**: `GET /baremetal/v1/zones/{zone}/oss`

### scaleway_elastic_metal_get_bmc_access

**Input Schema**:
```json
{
  "zone": "string (required)",
  "server_id": "string (required)"
}
```
**Response**: `BMCAccess` object (url, login, password, expires_at)
**API**: `GET /baremetal/v1/zones/{zone}/servers/{server_id}/bmc-access`

---

## US4: Flexible IPs

### scaleway_elastic_metal_list_ips

**Input Schema**:
```json
{
  "zone": "string (required)",
  "page": "number (optional, default 1)",
  "pageSize": "number (optional, default 50)",
  "project_id": "string (optional)",
  "server_id": "string (optional)",
  "order_by": "string (optional)"
}
```
**Response**: `{ ips: FlexibleIp[], totalCount: number, page: number, pageSize: number }`
**API**: `GET /baremetal/v1/zones/{zone}/ips`

### scaleway_elastic_metal_create_ip

**Input Schema**:
```json
{
  "zone": "string (required)",
  "project_id": "string (required)",
  "description": "string (optional)",
  "tags": "string[] (optional)",
  "server_id": "string (optional)"
}
```
**Response**: `FlexibleIp` object
**API**: `POST /baremetal/v1/zones/{zone}/ips`

### scaleway_elastic_metal_delete_ip

**Input Schema**:
```json
{
  "zone": "string (required)",
  "ip_id": "string (required)"
}
```
**Response**: Confirmation message
**API**: `DELETE /baremetal/v1/zones/{zone}/ips/{ip_id}`
