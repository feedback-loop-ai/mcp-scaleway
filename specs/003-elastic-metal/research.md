# Research: Scaleway Elastic Metal MCP Tools

**Branch**: `003-elastic-metal` | **Date**: 2026-03-11

## Scaleway Elastic Metal API

### Overview
Scaleway Elastic Metal provides dedicated bare-metal servers. The API is **zoned** — all endpoints include a zone parameter (e.g., fr-par-1, fr-par-2, nl-ams-1, nl-ams-2, pl-waw-1).

### Base URL Pattern
`https://api.scaleway.com/baremetal/v1/zones/{zone}/`

### SDK Package
`@scaleway/sdk-baremetal` — however, based on project setup using `@scaleway/sdk-client`, we will make direct API calls using the client's `fetch` method or use the SDK's built-in API methods.

### Authentication
Standard Scaleway auth headers:
- `X-Auth-Token: {secret_key}`
- Managed by `@scaleway/sdk-client` createClient()

### Key API Endpoints

#### Servers
- `GET /servers` — List servers (paginated: page, page_size, total_count)
- `GET /servers/{server_id}` — Get server details
- `POST /servers` — Create server (offer_id, name, description, tags, project_id)
- `DELETE /servers/{server_id}` — Delete server

#### Server Actions
- `POST /servers/{server_id}/install` — Install OS (os_id, hostname, ssh_key_ids, password)
- `POST /servers/{server_id}/reboot` — Reboot server
- `POST /servers/{server_id}/start` — Start server
- `POST /servers/{server_id}/stop` — Stop server

#### Offers & OS
- `GET /offers` — List available offers (paginated)
- `GET /oss` — List available OSes (paginated)

#### BMC Access
- `GET /servers/{server_id}/bmc-access` — Get BMC access credentials

#### Flexible IPs
- `GET /ips` — List flexible IPs (paginated)
- `POST /ips` — Create flexible IP (project_id, description, tags, server_id)
- `DELETE /ips/{ip_id}` — Delete flexible IP

### Pagination Pattern
All list endpoints use:
- Request: `page` (1-indexed), `page_size` (default 20, max 100)
- Response: `total_count` field alongside the items array

### Error Codes
Standard Scaleway error format:
- 400: Invalid parameters
- 401: Unauthorized
- 403: Forbidden
- 404: Resource not found
- 409: Conflict (e.g., server busy)
- 429: Rate limited

### Server Statuses
`unknown`, `delivering`, `ready`, `stopping`, `stopped`, `starting`, `error`, `deleting`, `deleted`, `locked`, `out_of_stock`, `ordered`, `resetting`

## Implementation Approach

Since the project uses `@scaleway/sdk-client` for client creation, and individual tool modules make API calls, we will:
1. Use the shared client from `src/shared/client.ts`
2. Make API calls using the Scaleway SDK client's fetch capability
3. Parse responses and map to our Zod-validated types
4. Use shared error mapping from `src/shared/errors.ts`
5. Use shared pagination from `src/shared/pagination.ts`

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| SDK package not installed | Use raw fetch via sdk-client; add package if needed |
| Zone availability varies | Accept zone as required parameter, let API validate |
| BMC access is time-limited | Document expiry in tool description |
