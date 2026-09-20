# Implementation plan

Parallel work streams:

- Reconcile disputed endpoints and their official source records, then repair area
  handlers, input schemas, metadata and transport contracts where justified.
- Build response validation from independently recorded wire contracts and integrate
  it at transport boundaries before SDK transformations. Apply explicit adapters for
  documented SDK/local output envelopes and S3 XML. Preserve additional valid fields.
- Add examples, structured output, dispatch traces and health at the existing MCP
  registration/dispatch boundary, keeping the four default gateway tools.
- Build a complete operation evidence inventory and contract harness across request,
  response, pagination, authorization and error/rate-limit dimensions. Missing evidence
  must fail the relevant gate rather than disappear from counts.

The streams use separate modules and coordinate shared registry/transport interfaces.
The final validator mechanism and any unavailable-source exceptions must be documented
before integrating them. Existing unmerged worktrees are reference material only;
their changes require review against current main before adoption.

Validation combines focused negative/positive tests, whole-catalog checks and explicit
read-only live probes where useful. Unit timing is measured separately from coverage.
No benchmark or simulated transport is reported as production liveness proof.
