# Scaleway Web Hosting API Reference

Official reference: https://www.scaleway.com/en/developers/api/webhosting/

Base URL: `https://api.scaleway.com/webhosting/v1/regions/{region}`

Tools live in `src/tools/webhosting/`. There is no dedicated `@scaleway/sdk-webhosting`
package; the handlers issue raw `client.fetch` calls against the REST endpoints below.
Verified against the official reference and `src/tools/webhosting/handlers.ts`.

## Authentication
- Header: `X-Auth-Token: <secret_key>`

## Regions
- `fr-par` (primary; only region surfaced in the current API docs).
- `region` is optional on every MCP tool; when omitted the handler falls back to the
  default region from the client config (`resolveRegion`).

## Pagination
- `List Hostings` accepts `page` (int, 1-indexed) and `page_size` (int, max 100).
- List responses return `{ hostings: Hosting[], total_count: number }`.
- The MCP layer normalizes results via `buildPaginatedResponse`.

## Hostings

### List Hostings — `scaleway_webhosting_list_hostings`
`GET /hostings`
- Query: `page`, `page_size`, `order_by` (`created_at_asc` | `created_at_desc`), `project_id`,
  `tags` (string[]), `statuses` (HostingStatus[]), `domain`, `organization_id`,
  `control_panels` (string[]).
- Response: `{ hostings: Hosting[], total_count: number }`

### Get Hosting — `scaleway_webhosting_get_hosting`
`GET /hostings/{hosting_id}`
- Response: Hosting object

### Create Hosting — `scaleway_webhosting_create_hosting`
`POST /hostings`
- Body: `{ offer_id, domain, project_id?, tags?, option_ids?, language?, domain_configuration?, skip_welcome_email? }`
- `domain_configuration`: `{ update_nameservers?, update_web_record?, update_mail_record?, update_all_records? }`
- Response: Hosting object (`status: delivering`)

### Update Hosting — `scaleway_webhosting_update_hosting`
`PATCH /hostings/{hosting_id}`
- Body: `{ email?, tags?, option_ids?, offer_id?, protected? }`
- Response: Hosting object

### Delete Hosting — `scaleway_webhosting_delete_hosting`
`DELETE /hostings/{hosting_id}`
- Response: Hosting object (`status: deleting`)

### Restore Hosting — `scaleway_webhosting_restore_hosting`
`POST /hostings/{hosting_id}/backups/{backup_id}/restore`
- Required inputs: `hosting_id`, `backup_id`; body `{}`.
- Response: `{ progress_id: string }`, identifying the restoration progress.
- Restores the selected backup in full and overwrites current hosting data.
- The former `/hostings/{hosting_id}/restore` route was not source-backed. The
  tool ID is preserved, but selecting `backup_id` is now mandatory. A backup is
  never inferred or selected automatically.
- Source: [Backup API](https://www.scaleway.com/en/developers/api/webhosting/backup/v1/schema.yml).

### Get DNS Records — `scaleway_webhosting_get_dns_records`
`GET /domains/{domain}/dns-records`
- Required input: `domain`, e.g. `example.com`, replacing the former `hosting_id`.
- Response: the upstream `DnsRecords` object (status, records and nameservers).
- DNS belongs to a domain; the hosting's optional legacy domain does not safely
  identify a choice among system and custom domains. Callers select it explicitly.
- Source: [DNS API](https://www.scaleway.com/en/developers/api/webhosting/dns/v1/schema.yml).

## Offers

### List Offers — `scaleway_webhosting_list_offers`
`GET /offers`
- Query: `order_by` (`price_asc`), `hosting_id`, `control_panels` (string[]),
  `without_options` (bool), `only_options` (bool).
- Response: `{ offers: Offer[] }`

## Control Panels

### List Control Panels — `scaleway_webhosting_list_control_panels`
`GET /control-panels`
- Response: `{ control_panels: ControlPanel[], total_count?: number }`

## Entities

### Hosting entity
```
{
  id: string,
  region: string,
  project_id: string,
  status: HostingStatus,              // unknown_status | delivering | ready | deleting |
                                      //   error | locked | migrating
  platform_hostname: string,
  platform_number?: number,
  offer_id: string,
  offer_name: string,
  domain: string,
  tags: string[],
  updated_at?: string,                // RFC3339
  created_at?: string,
  dns_status: HostingDnsStatus,       // unknown_dns_status | valid | invalid | pending
  cpanel_urls?: { dashboard?: string, webmail?: string },
  username: string,
  offer_end_date?: string,
  contact_email: string,
  platform_group: string,
  ipv4?: string,
  ipv6?: string,
  protected?: boolean,
  one_time_password?: string
}
```

### Offer entity
```
{
  id: string,
  billing_operation_path: string,
  product?: { name?: string, option?: boolean },
  price?: { currency_code?: string, units?: number, nanos?: number },
  available: boolean,
  quota_warnings?: OfferQuotaWarning[],  // unknown_quota_warning | email_count_exceeded |
                                         //   database_count_exceeded | disk_usage_exceeded
  end_of_life: boolean,
  control_panel_name: string
}
```

### ControlPanel entity
```
{ name: string, available: boolean, logo_url: string }
```

### DnsRecord entity
```
{ name: string, type: string, ttl: number, value: string, priority?: number, status?: string }
```

## Error codes
Standard Scaleway REST errors, normalized by `mapScalewayError`:
- `400` invalid_arguments — malformed request/validation failure
- `401` / `403` permission_denied — missing/invalid `X-Auth-Token`
- `404` not_found — unknown hosting / offer
- `409` conflict — e.g. deleting a protected hosting
- `429` too_many_requests — rate limited
- `500` internal_server_error

## Reconciliation — 2026-09-19

Offers and control panels are published in separate schemas, so comparing them
only against Hosting API was a false positive:
[Offer API](https://www.scaleway.com/en/developers/api/webhosting/offer/v1/schema.yml),
[Control Panel API](https://www.scaleway.com/en/developers/api/webhosting/control-panel/v1/schema.yml).
Both list routes returned HTTP 200 and their expected arrays during authenticated
read-only verification. Backup restore was not executed; DNS was verified against
its authoritative schema rather than a placeholder-resource 404. The two required
input changes above are intentional next-release migrations; this change does not
publish a package release. See [endpoint evidence](../../064-remaining-remediation/endpoints.md).
