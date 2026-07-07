# Tool Contracts: Dedibox

All tools are zone-scoped and authenticate via the shared X-Auth-Token client.
API details: `specs/scaleway-api/dedibox/api-reference.md`.
Contract tests: `tests/contract/dedibox/dedibox.contract.test.ts`.

## Servers

### scaleway_dedibox_list_servers
- API: `GET /dedibox/v1/zones/{zone}/servers`
- Input: `zone`, `page?`, `pageSize?`, `projectId?`, `search?`, `orderBy?`
- Output: `{ items: ServerSummary[], totalCount, page, pageSize }`

### scaleway_dedibox_get_server
- API: `GET /dedibox/v1/zones/{zone}/servers/{serverId}`
- Input: `zone`, `serverId` (number) → Output: `Server`

### scaleway_dedibox_update_server
- API: `PATCH /dedibox/v1/zones/{zone}/servers/{serverId}`
- Input: `zone`, `serverId`, `hostname?`, `enableIpv6?` → Output: `Server`

### scaleway_dedibox_reboot_server / _start_server / _stop_server
- API: `POST /dedibox/v1/zones/{zone}/servers/{serverId}/{reboot|start|stop}`
- Input: `zone`, `serverId`

### scaleway_dedibox_delete_server
- API: `DELETE /dedibox/v1/zones/{zone}/servers/{serverId}`
- Input: `zone`, `serverId` → Output: `{ message }`

## Installation

### scaleway_dedibox_install_server
- API: `POST /dedibox/v1/zones/{zone}/servers/{serverId}/install`
- Input: `zone`, `serverId`, `osId`, `hostname`, `userLogin?`, `userPassword?`,
  `panelPassword?`, `rootPassword?`, `partitions?`, `sshKeyIds?`,
  `licenseOfferId?`, `ipId?` → Output: `ServerInstall`

### scaleway_dedibox_get_server_install
- API: `GET /dedibox/v1/zones/{zone}/servers/{serverId}/install` → `ServerInstall`

### scaleway_dedibox_cancel_server_install
- API: `POST /dedibox/v1/zones/{zone}/servers/{serverId}/cancel-install`

## Offers

### scaleway_dedibox_list_offers
- API: `GET /dedibox/v1/zones/{zone}/offers`
- Input: `zone`, `page?`, `pageSize?`, `orderBy?`, `commercialRange?`,
  `catalog?`, `projectId?`, `availableOnly?` → paginated `Offer[]`

### scaleway_dedibox_get_offer
- API: `GET /dedibox/v1/zones/{zone}/offers/{offerId}`
- Input: `zone`, `offerId`, `projectId?` → `Offer`

## Operating systems

### scaleway_dedibox_list_os
- API: `GET /dedibox/v1/zones/{zone}/os`
- Input: `zone`, `page?`, `pageSize?`, `orderBy?`, `type?`, `serverId?`,
  `projectId?` → paginated `OS[]`

### scaleway_dedibox_get_os
- API: `GET /dedibox/v1/zones/{zone}/os/{osId}`
- Input: `zone`, `osId`, `serverId`, `projectId?` → `OS`

## BMC access

### scaleway_dedibox_get_bmc_access
- API: `GET /dedibox/v1/zones/{zone}/servers/{serverId}/bmc-access` → `BMCAccess`

### scaleway_dedibox_start_bmc_access
- API: `POST /dedibox/v1/zones/{zone}/servers/{serverId}/bmc-access`
- Input: `zone`, `serverId`, `ip`

### scaleway_dedibox_stop_bmc_access
- API: `DELETE /dedibox/v1/zones/{zone}/servers/{serverId}/bmc-access`
- Input: `zone`, `serverId` → `{ message }`
