# Scaleway Marketplace API Reference

Base URL: `https://api.scaleway.com/marketplace/v2`

- Official docs: https://www.scaleway.com/en/developers/api/marketplace/
- API version: **v2**
- Scope: **global** (non-regional; no zone/region path segment). `local-images` are filtered to a zone via a query param, not a path segment.

## Authentication

- Header: `X-Auth-Token: <secret_key>` (injected by `@scaleway/sdk-client`). The Marketplace catalog is public/read-only; the token is still sent by the shared client.

## Pagination

- Query params: `page` (int, 1-indexed), `page_size` (int, max 100). Tool defaults `page=1`, `page_size=50`.
- List responses include `total_count`; the tool wraps collections with `buildPaginatedResponse()` (returns `{ items, totalCount, page, pageSize }`).

## Images

### List Images
`GET /marketplace/v2/images`
- Tool: `scaleway_marketplace_list_images`
- Query: `order_by` (name/created_at/updated_at asc|desc), `arch` (e.g. `x86_64`, `arm64`), `category` (category id), `include_eol` (bool, default false), `page`, `page_size`
- Response: `{ images: Image[], total_count: number }`
- `Image`: `{ id, name, description, logo, categories: string[], created_at?, updated_at?, valid_until?, label }`

### Get Image
`GET /marketplace/v2/images/{image_id}`
- Tool: `scaleway_marketplace_get_image`
- Response: `Image` object

## Local Images

### List Local Images
`GET /marketplace/v2/local-images`
- Tool: `scaleway_marketplace_list_local_images`
- Query: `order_by` (type/created_at asc|desc), `zone`, `arch`, `image_id`, `version_id`, `image_label`, `type` (`unknown_type` | `instance_local` | `instance_sbs`), `page`, `page_size`
- Response: `{ local_images: LocalImage[], total_count: number }`
- `LocalImage`: `{ id, compatible_commercial_types: string[], arch, zone, label, type }`

### Get Local Image
`GET /marketplace/v2/local-images/{local_image_id}`
- Tool: `scaleway_marketplace_get_local_image`
- Response: `LocalImage` object

## Categories

### List Categories
`GET /marketplace/v2/categories`
- Tool: `scaleway_marketplace_list_categories`
- Query: `page`, `page_size`
- Response: `{ categories: Category[], total_count: number }`
- `Category`: `{ id, name, description }`

### Get Category
`GET /marketplace/v2/categories/{category_id}`
- Tool: `scaleway_marketplace_get_category`
- Response: `Category` object

## Versions

### List Versions
`GET /marketplace/v2/versions`
- Tool: `scaleway_marketplace_list_versions`
- Query: `image_id` (**required**), `order_by` (created_at asc|desc), `page`, `page_size`
- Response: `{ versions: Version[], total_count: number }`
- `Version`: `{ id, name, created_at?, updated_at?, published_at? }`

### Get Version
`GET /marketplace/v2/versions/{version_id}`
- Tool: `scaleway_marketplace_get_version`
- Response: `Version` object

## Error Codes

| HTTP | Mapped type          |
|------|----------------------|
| 400  | `invalid_input`      |
| 401  | `permission_denied`  |
| 403  | `permission_denied`  |
| 404  | `not_found`          |
| 429  | `rate_limited`       |
| 500  | `server_error`       |
| other| `server_error`       |

## Notes / Deviations

- Versions use the **flat** collection form: `GET /marketplace/v2/versions?image_id={id}` (list) and `GET /marketplace/v2/versions/{version_id}` (get), matching the SDK-generated Marketplace v2 client and the implementation. An auto-summary of the public docs suggested nested paths (`/images/{image_id}/versions[/{version_id}]`); that rendering was not confirmed and does not match the SDK — the flat form is authoritative here. **Flagged for manual re-verification if the upstream schema changes.**
- Response field names arrive from the API in `snake_case` (`created_at`, `valid_until`, `compatible_commercial_types`); the internal Zod response schemas in `types.ts` use `camelCase` for documentation/typing purposes and are not used to transform live payloads (handlers return the raw API JSON).
