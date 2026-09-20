# Endpoint reconciliation

Evidence fetched **2026-09-19**. This review resolves the original route comparison
findings by consulting the correct service schemas, official SDKs, and bounded
read-only requests. A route absent from one product schema is not thereby absent
from Scaleway. No cloud mutation or model generation was performed.

## Findings and changes

| Issue | Authoritative source and disposition |
| --- | --- |
| #68 Autoscaling, seven template routes | All seven methods and paths are published in [Instance v2alpha1](https://www.scaleway.com/en/developers/api/instance/v2alpha1/schema.yml): GET/POST templates, GET/PATCH/DELETE template, GET/PUT template cloud-init. They belong to the Instance API used by autoscaling; the original single-schema comparison was incomplete. The current list route returned 200. |
| #69 Elastic Metal, four routes | GET/POST flexible IPs and DELETE flexible IP are published in [Elastic Metal Flexible IP](https://www.scaleway.com/en/developers/api/elastic-metal-flexible-ip/v1alpha1/schema.yml). GET server-private-networks is published in [Elastic Metal Private Network](https://www.scaleway.com/en/developers/api/elastic-metal/private-network/v1/schema.yml). Both read routes returned 200. No route substitution with Instance IPs is appropriate. |
| #70 Generative APIs | The [schema](https://www.scaleway.com/en/developers/api/generative-apis/v1/schema.yml) and [project-scoping documentation](https://www.scaleway.com/en/docs/generative-apis/api-cli/using-generative-apis/) prescribe global GET `/v1/models` and project-scoped inference. List/get model now use that catalog; chat/embedding use `/{project_id}/v1/...`. An optional UUID `project_id` input overrides `SCW_DEFAULT_PROJECT_ID`. The old `region` input stays accepted but is explicitly deprecated and ignored. The corrected catalog returned 200 with its expected data array. No claim is made that the former region URLs were ever valid. |
| #71 Webhosting | Offers and controls are published in separate [Offer](https://www.scaleway.com/en/developers/api/webhosting/offer/v1/schema.yml) and [Control Panel](https://www.scaleway.com/en/developers/api/webhosting/control-panel/v1/schema.yml) schemas; both returned 200. [DNS](https://www.scaleway.com/en/developers/api/webhosting/dns/v1/schema.yml) is GET `/domains/{domain}/dns-records`, so the same tool ID now requires `domain` instead of the unrelated `hosting_id`. [Backup](https://www.scaleway.com/en/developers/api/webhosting/backup/v1/schema.yml) restoration is POST `/hostings/{hosting_id}/backups/{backup_id}/restore`, with required explicit `backup_id`, empty JSON body and a `progress_id` response. The prior two routes lacked authoritative evidence. |
| #72 Apple Silicon | GET server-private-networks is published in [Private Network v1alpha1](https://www.scaleway.com/en/developers/api/apple-silicon/private-network/v1alpha1/schema.yml), separate from the main server API. It returned 200 with the expected array. |
| #73 Billing | GET `/billing/v2beta1/charges` is published in [Billing FinOps](https://www.scaleway.com/en/developers/api/billing_finops/v2beta1/schema.yml). The route and organization/time/cursor query parameters remain appropriate; comparing only Billing invoices was incomplete. No organization billing request was necessary for this route finding. |
| #76 Secret Manager | GET tags is generated in the current [official Go SDK](https://github.com/scaleway/scaleway-sdk-go/blob/25895fc5ce562db9b94242f507ffbb553347a73f/api/secret/v1beta1/secret_sdk.go#L1762) and installed `@scaleway/sdk-secret` 2.12.1, although omitted from the public secrets schema. Request queries are project_id, page and page_size. The wire response is tags:string[] and total_count:uint64. The exact read route returned 200 with its expected tags array. Retained. |

## Cockpit (#67)

Four Grafana user routes are published in [Cockpit Global v1](https://www.scaleway.com/en/developers/api/cockpit/global/v1/schema.yml),
whereas the initial comparison used only the Regional schema. They are marked
deprecated, with announced EOL 2026-01-20. GET users still returned HTTP 200 in this
review, so the operations are retained with visible deprecation descriptions;
they are not silently disabled because of a date or schema selection.

The three legacy regional lifecycle paths (`cockpit`, `activate-cockpit`,
`deactivate-cockpit`) are not present in current or initial April 2024 v1 SDK
history. GET with the configured real project returned 404, which is recorded as
inconclusive rather than route-removal proof. Scaleway's maintained
[Terraform resource documentation](https://github.com/scaleway/terraform-provider-scaleway/blob/master/docs/resources/cockpit.md)
explicitly states that `scaleway_cockpit` became unsupported after January 1st,
2025 and directs migration to data sources, alert manager and Grafana IAM.
That resource-level retirement is context, not evidence that these individual
HTTP routes were retired. The 404 alone cannot establish retirement.

The review also found that deleting a contact point must use POST
`/cockpit/v1/regions/{region}/alert-manager/contact-points/delete`, with its
project_id/email body and 204 response. The old DELETE method/path was wrong.
The handler and parity row now use the published
[Regional contract](https://www.scaleway.com/en/developers/api/cockpit/regional/v1/schema.yml).

The former `list_managed_alerts_contact_points` path has no authoritative separate
namespace. That tool is now an explicit compatibility alias for the published
ListContactPoints request, returning the default receiver's contact points used by
managed alerts. It does not claim to filter contacts into an unverified category.
The three lifecycle IDs remain discoverable but are explicitly unavailable: calls
return local `unsupported_operation` (501) before any HTTP request. Terraform
resource retirement alone does not prove these individual HTTP routes' retirement.
The same temporary restriction applies to the three unattested Inference operations
listed in [the support decision](contracts/unverified-operations.md). These six are
blocked capabilities, not validated wire contracts. Re-enabling requires authoritative
contract evidence and transport tests; no environment override bypasses this.


## Read-only observations

The recorded observations contain only labels, HTTP status, expected-array shape
checks and duration. They do not contain credential values, resource identifiers,
response bodies, or provider error text. Nine reads returned 200: model catalog,
Webhosting offers and controls, secret tags, Instance templates, Elastic Metal
flexible IPs, both server-private-network lists, and Grafana users. Legacy Cockpit
GET returned 404 and remains inconclusive in isolation.

These successful reads establish reachability and the inspected response envelope
for the available account. They do not establish behavior of unexecuted writes,
other permissions, populated nested resources, every region, or future service
availability. Backup restore was deliberately not exercised. Required contract
validation and independently recorded request/response tests cover those boundaries
without provisioning resources for a test.

## Reproducibility and input migrations

Raw public secondary schemas are retained in the ignored
`.forge/reports/remaining-remediation/schemas/` directory. `evidence.json` records
each URL, SHA-256 digest and fetch time. Sanitized read-only observations are in
`live-read-only.json`. The shared checked-in contract catalog records provenance
for CI; local ignored artifacts are supplemental evidence, not a CI dependency.

The Webhosting required `domain`/`backup_id` changes intentionally correct invalid
input contracts while preserving operation IDs. Callers must update those inputs
before upgrading to 0.5.0. This remediation merges source changes
and does not itself publish a package release. Generative API `region` remains
accepted for compatibility but provides no serverless regional-routing guarantee.
