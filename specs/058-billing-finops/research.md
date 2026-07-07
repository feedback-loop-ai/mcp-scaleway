# Research: Billing - FinOps

## API discovery

| Question | Finding | Source |
|----------|---------|--------|
| Is "Billing - FinOps" a distinct API? | Yes — catalogue slug `billing_finops`, separate from `billing`. Beta. | https://www.scaleway.com/en/developers/api/ ; https://www.scaleway.com/en/developers/api/billing_finops/ |
| Version / scope | `v2beta1`, **global** (not region/zone scoped). Base `https://api.scaleway.com`. | billing_finops reference |
| Auth | `X-Auth-Token` secret key; IAM `BillingReadOnly` / `BillingManager`. | billing / billing_finops reference |
| Endpoints exposed | Exactly one: `GET /billing/v2beta1/charges` (sidebar: Charges → List charges). | billing_finops reference |
| Pagination | Cursor-based: `page_size` + `page_token`, response returns `next_page_token`. Differs from offset pagination used by the other billing endpoints. | billing_finops reference |
| Request filters | `organization_id` (required), `order_by` (`start_date_asc`/`start_date_desc`), `start_date_after`, `end_date_before`, `clamp_to_time_range`, and plural array filters `invoice_ids`, `project_ids`, `resource_ids`, `resource_names`, `skus`. | `scw billing charge list` (auto-generated CLI) — https://cli.scaleway.com/billing/ |
| Charge fields | `category_name`, `resource_name`, `resource_id`, `project_id`, `value` (Money), `discount_value` (Money), `begin_date`, `end_date`, `unit`, `billed_quantity`. | billing_finops reference (rendered schema) |

## Decisions & rationale

- **Decision**: Add a single tool `scaleway_billing_list_charges` to the existing
  `billing` area rather than a new area.
  **Rationale**: FinOps shares the billing namespace, auth and IAM; the brief
  scopes this as an extension of the existing billing area.

- **Decision**: Do NOT expose Budgets / Budget alerts.
  **Rationale**: They appear in the CLI/console but have no published HTTP API
  reference (paths/schemas). Constitution requires contract-first, no invented
  endpoints. Documenting inferred budget fields would violate that.

- **Decision**: Reuse the existing `Money` zod schema and the billing area's
  `(client, params)` handler style and `buildUrlParams` helper (extended to append
  array-valued query params), instead of the audit-trail `getClient()` style.
  **Rationale**: Consistency within the billing area; the array extension is
  backward-compatible (only triggered by the new tool).

- **Decision**: Type `billed_quantity` as a number and proxy the raw response.
  **Rationale**: The FinOps rendered schema shows a numeric quantity; handlers do
  not validate responses at runtime, so the zod `Charge` schema serves only the
  contract test. Ambiguity flagged in `specs/scaleway-api/billing/api-reference.md`.

## Ambiguities / risks

- The public HTML reference does not exhaustively enumerate every `Charge` field
  type; request filters were cross-checked against the auto-generated CLI, which is
  the most authoritative machine-readable surface available.
- FinOps is Beta; field set may evolve. The proxy-through design tolerates
  additive changes.
