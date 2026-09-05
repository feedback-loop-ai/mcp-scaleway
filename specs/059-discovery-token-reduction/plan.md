# Implementation plan

1. Finish correctness branch, real SDK transport regressions and full tests; open a separate PR.
2. Build schema projection, operation recorder, generated metadata and filters without changing existing area handlers.
3. Register four gateway tools with bounded discovery and original async validation. Integrate gateway/flat/both modes, server instructions and parity meta gate.
4. Add protocol-level contract tests, no-network all-operation reachability, filter-bypass, error/default/record-schema regression and catalog byte-budget tests.
5. Document migration and prerelease staging; verify lint, types, coverage, parity, build, packed install and stdio handshake. Measure actual tool block with count_tokens if the existing route is available. No live cloud modifications.

## Complexity tracking

An operation registry is justified by measured discovery overhead, 219,400 tokens at baseline. The original callbacks remain the execution authority. A public tools/list handler over our own metadata avoids SDK private-field dependency proposed in the initial audit. A four-tool listing removes catalog-size growth while flat mode preserves compatibility.
