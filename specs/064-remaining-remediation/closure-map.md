# Issue closure and acceptance evidence

Retrospective closeout map, 2026-09-20. This index links the completed delivery to
its existing specifications, implementation and tests. It does not backdate SDD
approval, prove spec-before-code ordering, or waive the historical R-II/R-III
findings. It implements the [documentation correction](spec.md#sdd-closeout-correction--2026-09-20).
R1–R7 refer to the original numbered requirements in [spec.md](spec.md).

## Delivery receipt

**D82** applies to every closed issue in the table below:

- [PR #82](https://github.com/feedback-loop-ai/mcp-scaleway/pull/82) delivered the
  implementation; its [signed source commit c24a652](https://github.com/feedback-loop-ai/mcp-scaleway/commit/c24a65279fca87fdbafee2ad126449257ba75547)
  was squash-merged as [7b1fad2](https://github.com/feedback-loop-ai/mcp-scaleway/commit/7b1fad2).
- [PR CI run 35501757988](https://github.com/feedback-loop-ai/mcp-scaleway/actions/runs/35501757988)
  and [main CI run 35501832089](https://github.com/feedback-loop-ai/mcp-scaleway/actions/runs/35501832089)
  completed successfully. They are execution receipts, not claims of live write behavior.
- [Closeout measurements](closeout.md#delivery-checks) record 12,441 passing tests,
  100% source coverage, unit timing, discovery byte count and package smoke checks.
  [Tasks](tasks.md) associate the completed work with concrete files and checks.

## Twelve resolved issues

| Issue and requirement | Accepted behavior and source/contract | Implementation and executable evidence | Delivery |
| --- | --- | --- | --- |
| [#59: usage examples](https://github.com/feedback-loop-ai/mcp-scaleway/issues/59), R4 | Every operation has a schema-valid synthetic example in discovery and flat descriptions; [example contract](mcp-contracts.md#examples). | [Generator](../../scripts/gen-examples.ts), [example projection](../../src/shared/examples.ts), [example unit tests](../../tests/unit/shared/examples.test.ts), [description tests](../../tests/unit/tools/description-examples.test.ts). T064-11. | D82 |
| [#60: logging and health](https://github.com/feedback-loop-ai/mcp-scaleway/issues/60), R5 | Registry-owned operation/outcome/duration traces exclude payloads and secrets; local health validates startup without a cloud-connectivity claim; [contract](mcp-contracts.md). | [Dispatch](../../src/shared/observability.ts), [server health](../../src/server.ts), [trace tests](../../tests/unit/shared/observability.test.ts), [CLI tests](../../tests/unit/main.test.ts), [MCP dispatch tests](../../tests/contract/mcp-output.test.ts). T064-12. | D82 |
| [#62: upstream validation](https://github.com/feedback-loop-ai/mcp-scaleway/issues/62), R2 | Every supported operation validates source-backed responses before SDK/handler processing; bad data fails safely and missing consumed fields are not fabricated; [transport](contracts/response-validation.md) and [consumption](contracts/pagination-consumption.md) contracts. | [Validator](../../src/shared/response-validation.ts), [S3 adapter](../../src/shared/s3-response.ts), [response-boundary tests](../../tests/contract/response-boundary.contract.test.ts), [pagination tests](../../tests/contract/pagination-boundary.contract.test.ts), [IAM consumption tests](../../tests/contract/iam-policy-consumption.contract.test.ts). T064-07–09. | D82 |
| [#63: per-operation contract depth](https://github.com/feedback-loop-ai/mcp-scaleway/issues/63), R3 | Independent request/response, applicable pagination, authentication/authorization and error evidence covers each supported operation, optional inputs and composite legs; [methodology](contracts/wire-evidence.md). | [Source catalog](../../src/shared/response-contracts.json), [evidence index](../../tests/contract-evidence.json), [real transport suite](../../tests/contract/transport/catalog-evidence.contract.test.ts), [parity gate](../../tests/unit/parity.test.ts). Six unavailable IDs remain explicitly outside supported contracts. T064-10/14. | D82 |
| [#65: MCP structured output](https://github.com/feedback-loop-ai/mcp-scaleway/issues/65), R6 | Gateway, flat and optional routing callbacks publish a matching output schema and `{format,data}` structured content while retaining text, metadata and error flags; [contract](mcp-contracts.md#structured-output). | [Output schema/projection](../../src/shared/output.ts), [output unit tests](../../tests/unit/shared/output.test.ts), [MCP surface tests](../../tests/contract/mcp-output.test.ts). T064-13. | D82 |
| [#68: Autoscaling templates](https://github.com/feedback-loop-ai/mcp-scaleway/issues/68), R1 | All seven template methods/paths belong to Instance v2alpha1; [source disposition](endpoints.md), [API reference](../scaleway-api/autoscaling/api-reference.md). | [Source-to-operation catalog](../../src/shared/response-contracts.json), [area contracts](../../tests/contract/autoscaling/autoscaling.contract.test.ts), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts), [read receipt](live-dispatch.json). T064-01. | D82 |
| [#69: Elastic Metal](https://github.com/feedback-loop-ai/mcp-scaleway/issues/69), R1 | Flexible IP and Private Network secondary schemas attest the four flagged routes; [source disposition](endpoints.md), [API reference](../scaleway-api/elastic-metal/api-reference.md). | [Source catalog](../../src/shared/response-contracts.json), [Flexible IP transport tests](../../tests/contract/tools/elastic-metal/flexible-ip.transport.test.ts), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts), [read receipt](live-dispatch.json). T064-01. | D82 |
| [#70: Generative APIs](https://github.com/feedback-loop-ai/mcp-scaleway/issues/70), R1 | Model discovery uses `/v1/models`; chat/embedding use explicit/default project scope. The old region input is deprecated; [API reference](../scaleway-api/generative-apis/api-reference.md) and [bounded nullable-content compatibility decision](contracts/generative-chat-compatibility.md). | [Handlers](../../src/tools/generative-apis/handlers.ts), [route contracts](../../tests/contract/tools/generative-apis/generative-apis.contract.test.ts), [tool-call contracts](../../tests/contract/tools/generative-apis/tool-calling.contract.test.ts), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts). T064-03. | D82 |
| [#71: Webhosting](https://github.com/feedback-loop-ai/mcp-scaleway/issues/71), R1 | Offer/control-panel secondary schemas attest their routes; DNS requires `domain`, restore requires `backup_id` and the documented backup path; [source disposition](endpoints.md) and [versioned reference](../scaleway-api/webhosting/api-reference.md). | [Handlers](../../src/tools/webhosting/handlers.ts), [area contracts](../../tests/contract/webhosting/webhosting.contract.test.ts), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts). No live restore was performed. T064-04. | D82 |
| [#72: Apple Silicon](https://github.com/feedback-loop-ai/mcp-scaleway/issues/72), R1 | The Private Network v1alpha1 schema attests server-private-networks; [source disposition](endpoints.md), [API reference](../scaleway-api/apple-silicon/api-reference.md). | [Source catalog](../../src/shared/response-contracts.json), [area contracts](../../tests/contract/tools/apple-silicon/contract.test.ts), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts), [read receipt](live-dispatch.json). T064-01. | D82 |
| [#73: Billing](https://github.com/feedback-loop-ai/mcp-scaleway/issues/73), R1 | Billing FinOps v2beta1 attests charges and its organization/time/cursor contract; [source disposition](endpoints.md), [API reference](../scaleway-api/billing/api-reference.md). | [Source catalog](../../src/shared/response-contracts.json), [area contracts](../../tests/contract/billing/billing.contract.test.ts), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts). No account billing read is claimed. T064-01. | D82 |
| [#76: Secret Manager tags](https://github.com/feedback-loop-ai/mcp-scaleway/issues/76), R1 | Current official SDKs attest the tags query and response contract omitted from public OpenAPI; [source disposition](endpoints.md), [API reference](../scaleway-api/secret-manager/api-reference.md). | [Pinned SDK projection](../../scripts/contract-overrides/secret-tags.json), [area contracts](../../tests/contract/secret-manager/secret-manager.contract.test.ts), [wire suite](../../tests/contract/transport/catalog-evidence.contract.test.ts), [read receipt](live-dispatch.json). T064-01. | D82 |

## Earlier delivery records

The preceding deliveries retain their own records: the optional Jev implementation
in [feature 061](../061-intent-routing/spec.md), PR #80's
[refresh data model](../062-scaleway-refresh/data-model.md) and
[refresh contract](../062-scaleway-refresh/contracts/refresh.md), and PR #81's
[maintenance data model](../063-remediation-closeout/data-model.md) and
[maintenance contract](../063-remediation-closeout/contracts/maintenance.md).
Their original measurements and validation receipts remain historical; current
feature 064 evidence supplements them without attributing PR #82's checks to an
earlier delivery. The newly consolidated records are explicitly retrospective.

## Acceptance boundaries that remain open

[#66](https://github.com/feedback-loop-ai/mcp-scaleway/issues/66) and
[#67](https://github.com/feedback-loop-ai/mcp-scaleway/issues/67) remain open.
The three Cockpit lifecycle and three Inference IDs in the
[availability manifest](../../src/shared/unavailable-operations.json) return local
501 before HTTP. The [support contract](contracts/unverified-operations.md) and
[endpoint decisions](endpoints.md#cockpit-67) retain the source gaps explicitly.
Re-enabling requires complete independent contracts and operation transport tests;
an exact provider retirement/replacement statement could instead justify a documented
migration disposition. Schema absence, resource-level Terraform retirement and an
ambiguous 404 cannot establish these operations' retirement.

[#74 and #75 were resolved by PR #81](https://github.com/feedback-loop-ai/mcp-scaleway/pull/81),
not by D82. Their old path/query comparison errors are separate from the later
documented NATS name-filter restriction. Serverless SQL and Object Storage are
supported through an [official Go SDK projection](../../scripts/contract-overrides/serverless-sqldb.json)
and [S3 protocol contract](../../scripts/contract-overrides/s3.json), respectively.

Historical R-II/R-III sequencing findings remain in [the compliance ledger](../retrofit-compliance.md).
The live provider-token comparison remains blocked at T055 in
[feature 059](../059-discovery-token-reduction/tasks.md); byte measurements are not
reported as token measurements. No cloud write, paid model generation or all-region
compatibility claim follows from these issue closures. The bounded Generative
compatibility overlay remains a documented inference, not a live observation.

## Contract-test reference index

The shared [transport suite](../../tests/contract/transport/catalog-evidence.contract.test.ts)
gets exact methods/paths and documents from [the evidence index](../../tests/contract-evidence.json).
Product narratives remain in [the Scaleway API Reference](../scaleway-api/README.md),
with the route-finding entries linked individually above. The following additional
test-to-reference links cover the consumed-response and MCP changes:

| Test | Specific reference |
| --- | --- |
| [Response boundary](../../tests/contract/response-boundary.contract.test.ts) | [Instance reference](../scaleway-api/instances/api-reference.md), `/instance/v1/zones/{zone}/servers`; [validation contract](contracts/response-validation.md). |
| [IAM policy consumption](../../tests/contract/iam-policy-consumption.contract.test.ts) | [IAM reference](../scaleway-api/iam/api-reference.md), GET/PUT `/iam/v1alpha1/rules`; [complete-policy preconditions](contracts/pagination-consumption.md). |
| [Pagination consumption](../../tests/contract/pagination-boundary.contract.test.ts) | [K8s](../scaleway-api/k8s/api-reference.md), [VPN](../scaleway-api/vpn/api-reference.md), [RDB](../scaleway-api/rdb/api-reference.md), [VPC](../scaleway-api/vpc/api-reference.md), [SQS](../scaleway-api/sqs/api-reference.md), [Cockpit](../scaleway-api/cockpit/api-reference.md) and [Inference](../scaleway-api/inference/api-reference.md) list/get projections; [consumption contract](contracts/pagination-consumption.md). |
| [MCP output](../../tests/contract/mcp-output.test.ts) | [Gateway meta-tool contract](../059-discovery-token-reduction/contracts/gateway-tools.md), [structured-result/trace contract](mcp-contracts.md); these have no fabricated cloud endpoint. |

The citations added during this documentation correction make the reference path
explicit; they do not change assertions, runtime behavior or the historical timing
of the tests.
