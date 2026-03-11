# Tool Contracts - Apple Silicon (004)

## Contract: scaleway_apple_silicon_list_servers

- **API**: GET `/apple-silicon/v1alpha1/zones/{zone}/servers`
- **Spec**: specs/scaleway-api/ (Apple Silicon v1alpha1)
- **Input**: zone?, project_id?, organization_id?, order_by? (created_at_asc|created_at_desc), page?, page_size?
- **Output**: { servers: Server[], total_count: number }
- **Pagination**: page/page_size query params, total_count in response
- **Auth**: X-Auth-Token header (via sdk-client)
- **Errors**: 401 (permission_denied), 403 (permission_denied), 500 (server_error)

## Contract: scaleway_apple_silicon_get_server

- **API**: GET `/apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}`
- **Spec**: specs/scaleway-api/ (Apple Silicon v1alpha1)
- **Input**: zone?, server_id (required, UUID)
- **Output**: Server object
- **Auth**: X-Auth-Token header
- **Errors**: 401, 403, 404 (not_found), 500

## Contract: scaleway_apple_silicon_create_server

- **API**: POST `/apple-silicon/v1alpha1/zones/{zone}/servers`
- **Spec**: specs/scaleway-api/ (Apple Silicon v1alpha1)
- **Input**: zone?, name?, project_id?, type (required), os_id?, enable_vpc (default false), commitment_type?, public_bandwidth_bps?, enable_kext? (default false)
- **Output**: Server object (status: starting)
- **Auth**: X-Auth-Token header
- **Errors**: 400 (invalid_input), 401, 403, 500

## Contract: scaleway_apple_silicon_delete_server

- **API**: DELETE `/apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}`
- **Spec**: specs/scaleway-api/ (Apple Silicon v1alpha1)
- **Input**: zone?, server_id (required, UUID)
- **Output**: void (success message)
- **Auth**: X-Auth-Token header
- **Errors**: 401, 403, 404, 500

## Contract: scaleway_apple_silicon_reboot_server

- **API**: POST `/apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/reboot`
- **Spec**: specs/scaleway-api/ (Apple Silicon v1alpha1)
- **Input**: zone?, server_id (required, UUID)
- **Output**: Server object (status: rebooting)
- **Auth**: X-Auth-Token header
- **Errors**: 401, 403, 404, 500

## Contract: scaleway_apple_silicon_reinstall_server

- **API**: POST `/apple-silicon/v1alpha1/zones/{zone}/servers/{server_id}/reinstall`
- **Spec**: specs/scaleway-api/ (Apple Silicon v1alpha1)
- **Input**: zone?, server_id (required, UUID), os_id?, enable_kext? (default false)
- **Output**: Server object (status: reinstalling)
- **Auth**: X-Auth-Token header
- **Errors**: 400, 401, 403, 404, 500

## Contract: scaleway_apple_silicon_list_server_types

- **API**: GET `/apple-silicon/v1alpha1/zones/{zone}/server-types`
- **Spec**: specs/scaleway-api/ (Apple Silicon v1alpha1)
- **Input**: zone?
- **Output**: { server_types: ServerType[] }
- **Pagination**: None (returns all types)
- **Auth**: X-Auth-Token header
- **Errors**: 401, 403, 500

## Contract: scaleway_apple_silicon_list_os

- **API**: GET `/apple-silicon/v1alpha1/zones/{zone}/os`
- **Spec**: specs/scaleway-api/ (Apple Silicon v1alpha1)
- **Input**: zone?, server_type?, name?, page?, page_size?
- **Output**: { os: OS[], total_count: number }
- **Pagination**: page/page_size query params, total_count in response
- **Auth**: X-Auth-Token header
- **Errors**: 401, 403, 500
