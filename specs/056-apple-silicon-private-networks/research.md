# Research: Apple silicon Private Networks

## Decision: Source of truth

The authoritative source for the endpoint shapes is the generated Scaleway SDK
`@scaleway/sdk-applesilicon@2.4.1` (`dist/v1alpha1/api.gen.js`, `types.gen.d.ts`,
`marshalling.gen.js`), which is code-generated directly from Scaleway's official API
definition. The SDK contains a dedicated `PrivateNetworkAPI` class with header comment
"Apple silicon - Private Networks API." — matching the docs entry point named in the
assignment.

**Note on docs verification**: The auto-summarized public docs page
(`https://www.scaleway.com/en/developers/api/apple-silicon/`) renders the Private
Networks operations in a separate section that the summarizer did not surface on fetch.
The SDK-generated client is the ground truth and is what the shipped Scaleway MCP server
(`mcp__scaleway__scaleway_apple_silicon_*` — currently exposes only the 8 server tools)
would proxy. No endpoints were invented; every path/param/field below is transcribed
from the SDK source.

## API facts (verified from SDK v2.4.1)

- **API slug / version**: `apple-silicon` / `v1alpha1`
- **Scope**: zonal — `LOCALITY = { zones: ["fr-par-1", "fr-par-3"] }`
- **Auth**: `X-Auth-Token` header, injected by `@scaleway/sdk-client`
- **Pagination**: `page` (1-indexed), `page_size`; list responses carry `total_count`

### Endpoints (from `api.gen.js`)
| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `.../server-private-networks` | query filters + pagination | `ListServerPrivateNetworksResponse` |
| GET | `.../servers/{serverId}/private-networks/{privateNetworkId}` | path only | `ServerPrivateNetwork` |
| POST | `.../servers/{serverId}/private-networks` | `{ private_network_id, ipam_ip_ids? }` | `ServerPrivateNetwork` |
| PUT | `.../servers/{serverId}/private-networks` | `{ per_private_network_ipam_ip_ids }` | `SetServerPrivateNetworksResponse` |
| DELETE | `.../servers/{serverId}/private-networks/{privateNetworkId}` | path only | empty |

### List query params (from `pageOfListServerPrivateNetworks` urlParams)
`ipam_ip_ids` (repeated), `order_by`, `organization_id`, `page`, `page_size`,
`private_network_id`, `project_id`, `server_id`.

`order_by` enum: `created_at_asc | created_at_desc | updated_at_asc | updated_at_desc`.

### Marshalling (from `marshalling.gen.js`)
- Add: `{ ipam_ip_ids, private_network_id }`
- Set: `{ per_private_network_ipam_ip_ids }` (map of PN ID → string[])

## Decision: Follow existing area conventions, not the generic BRIEF pattern

The existing `apple-silicon` vertical uses a `createAppleSiliconHandlers(client, defaultZone)`
factory (not the `handleXxx(params)` + `getClient()` pattern used by newer areas). To keep
the 8 existing tools and their tests intact and to keep the area internally consistent, the
5 new handlers are added to the same factory with the same `buildUrl` / `jsonResponse` /
try-catch-`mapScalewayError` style.

## Decision: Expose 5 tools (include `get`)

The assignment lists list/add/set/delete; the SDK also exposes `getServerPrivateNetwork`.
`get` is included for completeness (read-only, no downside) so operators can inspect a
single attachment's VLAN/IP state.

## Decision: `ipam_ip_ids` list filter handling

`URLSearchParams` cannot represent a repeated key from a plain object, so the list handler
appends each `ipam_ip_ids` value individually (matching the SDK's repeated-param encoding),
guarded by an `if (params.ipam_ip_ids)` branch. Both branches are covered by unit tests.
