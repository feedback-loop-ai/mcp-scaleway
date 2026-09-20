# Upstream response validation

Specified before implementation, 2026-09-19.

Every dispatched upstream HTTP response is checked before SDK unmarshalling or
handler parsing. An AsyncLocalStorage request scope carries the SDK request method,
URL and operation ID into a response interceptor. Direct HTTP requests use the same
validator from the guarded transport. The operation's independently generated
contract selects its recorded method/path/host/query and exact success status.
No operation may silently bypass an absent contract during dispatch.

The generated `src/shared/response-contracts.json` contains source provenance,
recorded OpenAPI documents and operation-to-source route mappings. A Zod refinement
wraps an Ajv compiled response schema, preserving the repository's Zod input/output
boundary while enforcing the source schema's references, nested types, required
fields, unions, enums, formats and constraints. Ajv uses no type coercion, defaults,
property removal or remote references. Optional upstream properties remain optional;
undocumented required fields must not be invented. Unknown fields are retained when
the upstream schema allows them. Standard date/time formats and Scaleway numeric
formats are checked. OpenAPI annotations do not become data requirements.

Successful JSON is parsed from a clone, validated and passed through unchanged.
JSON content-type parameters are accepted and normalized for the SDK's exact MIME
comparison. Empty bodies are accepted only for the recorded no-content response.
Documented raw text/encoded data use their explicit schema adapter. Invalid JSON,
wrong status/media type, missing contracts and schema violations become safe 502
errors containing a stable reason, never payloads, submitted parameters or Ajv's
value-bearing diagnostics. Non-success responses retain their HTTP status with a
safe status message. They cannot be mistaken for successful payloads.

S3 responses use the published S3 protocol. XML syntax and an expected root/shape
are validated with `fast-xml-parser` and Zod. DTD/entity declarations are rejected;
standard escaped character references are decoded. Namespaces and element order
are accepted. Lists retain all entries; malformed entries are rejected, never
silently discarded. Lifecycle/versioning distinguish documented empty configuration
from malformed data. HEAD and successful bodyless mutations validate their empty
body semantics. JSON bucket policy uses its explicit policy-document shape.

Direct unit calls without an operation dispatch scope remain transport test helpers;
the production gateway and flat modes always establish the operation scope. Tests
exercise the real transport/interceptor under dispatch and prove malformed upstream
values cannot reach SDK unmarshalling, pagination defaults or success envelopes.

Implementation references: [Ajv options](https://ajv.js.org/options),
[Ajv data modification](https://ajv.js.org/guide/modifying-data.html), and
[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser).

## Object Storage projections

The bucket HEAD response's HTTP `Date` is not its creation date. A ListObjectsV2
response obtained with `max-keys=0` cannot establish a total object count, and no
request in this operation measures total bucket bytes. `get_bucket_info` therefore
reports `creationDate`, `objectCount` and `size` as `null` (unknown), with verified
name, region and versioning. It retains the existing three request legs for
compatibility but never labels a page count as a bucket total. Any failed secondary
request returns a structured error instead of fabricated Disabled/0 fields.
Optional missing creation dates in bucket listings are omitted.

S3 list projections require `IsTruncated`, and truncated pages require a nonempty
`NextContinuationToken`; the client cannot safely infer end-of-pagination from
missing metadata. Object PUT requires the returned ETag. PUT bucket lifecycle and
versioning succeed with HTTP 200, while PUT policy succeeds with HTTP 204, as
specified in Scaleway's
[bucket operation reference](https://www.scaleway.com/en/docs/object-storage/api-cli/bucket-operations/)
and the corresponding AWS S3 operation pages. Success statuses are selected by the
specific operation rather than assuming all subresource writes share a status.

SDK scope URLs include serialized `urlParams` exactly as the SDK constructs its
Request. Query templates such as `tlds={tld_name}` and
`nats_account_id={id}` match exactly one nonempty actual value; fixed selectors
such as `list-type=2` remain exact. Missing or duplicate selectors fail confinement
before HTTP. Runtime response selection applies the same semantics.

Composite dispatch evidence injects authorization, rate-limit and malformed-response
failures at each later HTTP leg independently. Earlier legs receive source-valid
responses. The operation must return a sanitized error rather than partial success,
and no subsequent leg may execute after the failed boundary. A failure on the first
read of an IAM rule operation must prevent its later policy mutation.
