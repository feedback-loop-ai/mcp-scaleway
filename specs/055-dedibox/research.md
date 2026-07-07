# Research: Dedibox API

## Question: Is there a Scaleway-hosted Dedibox API usable with X-Auth-Token?

**Yes.** Confirmed authoritative sources:

1. Official API catalog entry: https://www.scaleway.com/en/developers/api/dedibox/
   — Dedibox appears under the **Bare Metal** category, base path `/dedibox/v1`,
   host `api.scaleway.com`, zone-scoped.
2. Official generated SDK:
   `github.com/scaleway/scaleway-sdk-go/api/dedibox/v1/dedibox_sdk.go`
   (package comment: "Package dedibox provides methods and message types of the
   dedibox v1 API"). This was used as the exact source of truth for endpoint
   paths, request/response fields, and enum values.

The SDK issues all requests to paths under `/dedibox/v1/...` using the standard
Scaleway client (same `X-Auth-Token` auth as every other product). This is
distinct from the legacy `api.online.net` Dedibox API (separate token scheme),
which is intentionally NOT used.

## Decisions

| Decision | Rationale |
|----------|-----------|
| Target `dedibox/v1` on `api.scaleway.com` via the shared client | Only API surface the shared client supports; confirmed by docs + SDK. |
| Zone-scoped paths `/dedibox/v1/zones/{zone}/...` | Matches SDK; zones use standard `fr-par-N` format. |
| Numeric resource IDs (`z.number().int().positive()`) for server/offer/OS | SDK models these as `uint64`, not UUIDs. Zone/project IDs stay UUID strings. |
| Offset pagination (`page`/`page_size` + `total_count`) via `buildPaginatedResponse` | Matches every other list tool in this repo and the SDK. |
| Exclude the ordering/creation flow | `CreateServer` returns a billed `Service` order; risky to expose as a plain tool. |
| Exclude RPN / IPv6-block / invoice sub-APIs | Global, billing/network-oriented; out of the server-management scope. |
| Model `Offer`/`OS`/`Server` response schemas with `.passthrough()` | The typed `*_info` offer unions and rich server fields are large; passthrough keeps contract tests meaningful without brittle full modeling. |

## Enum values (verified from SDK constants)

- `ServerStatus`: unknown, delivering, error, installing, locked, ready, rescue, stopped, busy
- `ServerInstallStatus`: unknown, booting, configuring, configuring_bootloader, formatting, installed, installing, partitioning, rebooting, setting_up_raid
- `BMCAccessStatus`: unknown, created, creating, deleting
- `OSType`: unknown_type, custom, desktop, panel, rescue, server, virtu
- `OSArch`: unknown_arch, x86, amd64, arm, arm64
- `OfferCatalog`: all, default, beta, premium, admin, inactive, reseller, volume
- `OfferPaymentFrequency`: monthly, oneshot
- `PartitionFileSystem`: unknown, efi, ext2, ext3, ext4, fat32, ntfs, swap, ufs, xfs
- `RaidArrayRaidLevel`: no_raid, raid0, raid1, raid5, raid6, raid10

## Ambiguities resolved

- **Auth model**: Docs page did not explicitly print the auth header, but the
  generated SDK uses the standard Scaleway client (X-Auth-Token). Resolved in
  favor of unified auth — not the legacy online.net token.
- **`GetOS` server_id**: The SDK marks `server_id` as required on both `GetOS`
  and `ListOS` (compatibility scoping). Modeled `serverId` as required on
  `get_os` and optional on `list_os`.
