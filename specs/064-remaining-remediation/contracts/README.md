# Contract and reference index

Retrospective index, 2026-09-20. This joins existing feature contracts and executable
source schemas for the [SDD closeout correction](../spec.md#sdd-closeout-correction--2026-09-20).
It does not establish when each linked contract was first written or approve code
retroactively. Original chronology statements remain in their individual records.

| Boundary | Contract and validation source |
| --- | --- |
| Common inputs/results/logging/health | [Initial boundary decisions](boundaries.md); detailed [MCP schemas and behavior](../mcp-contracts.md). |
| Gateway and optional routing | Existing [gateway tool schemas](../../059-discovery-token-reduction/contracts/gateway-tools.md); [MCP result/trace/availability additions](../mcp-contracts.md). |
| Upstream JSON, text, empty responses and S3 | [Response-validation contract](response-validation.md), [recorded machine schemas](../../../src/shared/response-contracts.json), [S3 protocol projection](../../../scripts/contract-overrides/s3.json). |
| Pagination and safe IAM replacement | [Consumed-response preconditions](pagination-consumption.md), without broadening upstream required properties. |
| Request corrections | [Bodies and scope](request-reconciliation.md), [queries](query-reconciliation.md), [required empty JSON bodies/statuses](request-empty-body.md). |
| Generative tool calls | [Conditional nullable-content compatibility](generative-chat-compatibility.md), explicitly documented as an inference rather than live proof. |
| Unverified operations | [Local support restriction](unverified-operations.md), [source review](../endpoints.md), [availability manifest](../../../src/shared/unavailable-operations.json). |
| Independent contract evidence | [Wire methodology](wire-evidence.md), [per-operation index](../../../tests/contract-evidence.json), [test-to-reference/issue closure map](../closure-map.md). |

The [Scaleway API Reference](../../scaleway-api/README.md) remains the product-oriented
reference. Its executable supplement records exact source methods, paths and schema
definitions; [the data model](../data-model.md) explains source receipts and the
relationship between operation IDs, HTTP legs and evidence records. The shared
MCP output envelope does not replace those resource contracts.

The original MCP details live at `../mcp-contracts.md`; this index makes that existing
contract discoverable from `contracts/`. The [plan's retrospective constitution review](../plan.md#constitution-review-record)
and [task checkpoints](../tasks.md) distinguish present traceability from historical
spec-before-code compliance.
