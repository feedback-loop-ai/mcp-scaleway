# Research: Scaleway Mailbox MCP Tools

**Feature**: 051-mailbox | **Date**: 2026-07-07 | **Status**: Implemented

## Decision: Product has a public API — implement

**Question**: Does Scaleway Mailbox expose a public API reference, or is it
console-only?

**Finding**: It has a public API reference at
https://www.scaleway.com/en/developers/api/mailbox/ (listed under "Domains & Web
Hosting", tagged Beta). The API is fully auto-generated in the official
`scaleway-sdk-go` at `api/mailbox/v1alpha1/mailbox_sdk.go`, which was used as the
authoritative source for exact paths, query parameters, request bodies, response
shapes, and enum values.

## API characteristics

| Property | Value | Source |
|----------|-------|--------|
| API slug | `mailbox` | developers.scaleway.com/api/ |
| Version | `v1alpha1` | SDK path prefix `/mailbox/v1alpha1` |
| Scope | **Global** (no region/zone) | SDK paths carry no locality segment |
| Auth | `X-Auth-Token: <secret_key>` | shared Scaleway auth |
| Base URL | `https://api.scaleway.com/mailbox/v1alpha1` | SDK |

## Key decisions & rationale

- **Global scope, no `region` parameter.** Unlike most Scaleway products, Mailbox
  paths carry no `regions/{region}` segment, so no tool accepts a region. The
  shared `PaginationParams` (page/pageSize) is reused; there is no `ScalewayRegion`
  on any schema.
- **Authoritative path source = SDK, not the doc-portal nav.** The developer-portal
  navigation implies aliases live under `/mailboxes/{id}/aliases`, but the
  auto-generated SDK exposes aliases as a **top-level** `/aliases` collection with
  `mailbox_id` as a create-body field / list query filter. The SDK is generated
  from the same protobuf the API serves, so the implementation follows the SDK.
- **Mailbox creation is batch-only.** There is no single-mailbox create endpoint;
  `POST /batch-create-mailboxes` accepts an array of `{ local_part, password }`
  plus `domain_id` and `subscription_period`. The tool
  `scaleway_mailbox_create_mailboxes` mirrors this (min 1 mailbox).
- **Validate-records path.** The action endpoint is
  `POST /domains/{id}/validate-records` (not `/records/validate`), verified in the
  SDK. It returns no body, so the tool returns `{ validated: true, domainId }`.
- **No offers endpoint.** "Offers" appears in marketing copy but not in the API.
  Excluded (see spec.md "Out of Scope"). Subscription intent is captured by the
  `subscription_period` field (monthly/yearly) on mailbox create/update.
- **Nullable timestamps.** All timestamps are `*time.Time` in the SDK (pointers),
  so response schemas mark `created_at`/`updated_at` and the scheduling timestamps
  as `.nullable()` to avoid false validation failures.

## Implementation approach

Follows the repo's `nats` handler pattern: `loadAuthConfig()` +
`createScalewayClient()`, `client.fetch<T>({ method, path, urlParams, body })` with
`urlParams` from `@scaleway/sdk-client` (which repeats array query params such as
`statuses`), try/catch → `formatErrorResponse(mapScalewayError(error))`, and list
handlers wrapped with `buildPaginatedResponse`.

## Pagination

`page` (1-indexed) + `page_size` query params; responses carry `total_count`. The
`buildPaginatedResponse` helper standardizes output to
`{ items, totalCount, page, pageSize }`.

## Error handling

All Scaleway errors are mapped via shared `mapScalewayError` (400→invalid_input,
401/403→permission_denied, 404→not_found, 429→rate_limited, else server_error) and
formatted via `formatErrorResponse`.
