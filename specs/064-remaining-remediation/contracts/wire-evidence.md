# Executable wire evidence

`tests/contract/transport/catalog-evidence.contract.test.ts` dispatches the actual
registered operation through the real SDK client or guarded raw transport. Its
hoisted fetch replacement captures all HTTP requests before the SDK imports;
unconfigured requests fail locally. Environment values and all request/response
fixtures are synthetic. The suite performs no cloud requests or model generation.

The independent input to the suite is the recorded public-contract catalog, including
explicitly identified SDK projections and compatibility overlays. Success bodies are
constructed from that catalog, not from local handler response schemas. The fixture
generator checks its own generated value against the recorded contract before use.

Offline regeneration seeds only the recorded official OpenAPI snapshots. Reviewed
supplemental documents come exclusively from `scripts/contract-overrides`, so removing
an override also removes it from the next catalog. Schema augmentations and
compatibility overlays must pin a matching base-source SHA-256; absent or changed
receipts fail regeneration before any output file is written.

For each supported operation, the suite checks:

- Every declared HTTP leg executes with the documented method, path, path/header/query
  values and request body. Composite IAM rule operations receive a populated source
  fixture so that their subsequent replacement request is actually exercised.
- A valid source response reaches the handler through the real transport parser.
  Invalid JSON and valid JSON containing a wrong-typed documented property fail
  safely. Empty-body and S3 XML/header contracts have protocol-specific fixtures.
- Page, page-size and cursor inputs reach documented queries and any normalized page
  metadata agrees. Operations without pagination inputs have no applicable pagination
  mutation; they still have request/response evidence.
- Authentication is present and uses the relevant SDK, bearer or S3 signature scheme.
  HTTP 401, 403, 404 and 429 retain their safe error categories without returning a
  provider-body canary to the caller.
- Invalid public inputs are rejected before HTTP. Every optional input also receives
  a source-valid nondefault example, or a negative case for a documented compatibility
  restriction. Stable names, alternate scope UUIDs and nonempty values make comparison
  with the omitted-field request detect dropped inputs, including HTTP headers.

The sole supported PDF/BIND format values and the existing default-public endpoint
selectors intentionally produce the same request as omission. Those cases still
validate the explicit request against the independent source. Containers legacy HTTP
options and trigger retargeting retain their documented local rejection behavior.

The six temporarily unavailable operation IDs are tested separately for local 501
and zero HTTP requests. They have no claimed verified wire contract. An empty model
catalog yields the documented client-side lookup miss for get-model; it does not
justify weakening the response envelope contract.

This suite establishes reproducible contract conformance and failure handling. It
does not prove production write behavior, account permissions or current reachability.
Those claims require separately recorded live evidence. Diagnostic output is opt-in
via `EVIDENCE_DIAGNOSTICS` and contains only the suite's synthetic data.
