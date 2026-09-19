# Remediation closure evidence

Recorded 2026-09-19. This evidence addresses four bounded issues and repairs the
Webhosting diagnostic; it does not establish full live API correctness.

## Registrar #74 and NATS #75

Both current official schemas returned HTTP 200 at 20:24:27 UTC:

| Area | Published method/path | Query parameter | SHA-256 |
| --- | --- | --- | --- |
| [Registrar](https://www.scaleway.com/en/developers/api/domains-and-dns/registrar/v2beta1/schema.yml) | `GET /domain/v2beta1/tlds` | `tlds`, array of strings | `3820750c969194e983d6e97e38f9a0dd03b5032f7570acc8f2dd244388abdbd0` |
| [NATS](https://www.scaleway.com/en/developers/api/messaging-and-queuing/nats/v1beta1/schema.yml) | `GET /mnq/v1beta1/regions/{region}/nats-credentials` | `nats_account_id`, string | `0256529ebdd0685b3ab1286f34ecaff0f494e056b1ddcb505b63fdf86f646e60` |

The old alarms compared the query-qualified strings to OpenAPI path keys. Seven
regressions prove the correction without accepting wrong methods, paths, versions,
namespaces, hosts, case or template names. The reporter retains the original query
metadata. It does not generally validate query parameter names, types or values;
the two parameters above were separately checked against the official schemas.

## Development reload #61

`bun run dev` uses `bun --watch run src/main.ts`. With Bun 1.3.14, editing imported
`src/server.ts` in an isolated copy triggered a restart in 191.97 ms. Fresh MCP
initialization and listing observed the changed server version and four tools.
Stdout contained only JSON-RPC; no cloud/model credentials or calls were involved.
The watcher retained its process ID while clearing runtime state. Clients must
initialize again and refresh cached tools; existing sessions are not preserved.

Unit-only command: `bun x vitest run --config tests/vitest.config.ts tests/unit`.
Result: **3,368 tests / 97 files / 3.74 seconds**. The old `--dir tests/unit` README
command selected no tests with this configuration and has been corrected.

## MCP SDK upgrade #64

The dependency upgrade landed in PR #80. The remaining check now builds with
**Bun 1.3.6**, packs the six intended package files, installs the real tarball into
an isolated consumer and imports its public library. The installed package used
SDK **1.30.0** and ran through Node **22.23.2** locally:

| Mode | Tools returned | Listing bytes |
| --- | ---: | ---: |
| gateway | 4 | 2,162 |
| flat | 727 | 564,661 |
| both | 731 | 566,822 |

All three stdio handshakes and complete listings passed, with no protocol errors
or server stderr. The isolated child receives no cloud/model credentials. CI runs
the same installed-package check under Bun 1.3.6 and minimum Node 20.20.2.
Reproduce after `bun run build` with `bun run scripts/smoke-packed.ts`.

## Webhosting #71 remains open

Thirty-three offline diagnostic tests cover status interpretation, independent
control/candidate failures, missing configuration, deadlines, redirects and error
sanitization. The CLI sends four GET requests; restore POST is explicitly skipped.
A 404/410 may concern a resource or access restriction, and other HTTP errors also
remain inconclusive. Successful HTTP responses do not validate contract contents.
No live Webhosting probe was run for this closeout.

## Combined checks

Lint and strict TypeScript checking passed. The complete offline suite passed
**6,283 tests across 158 files**, with **100% lines, branches, statements and
functions** covered. The coverage run took 6.38 seconds; that is separate from
the 3.74-second unit-only measurement. Build and installed-package checks passed
under Bun 1.3.6. These checks exercise diagnostics and package behavior without
authenticating to cloud services or invoking a model.

## Evidence and remaining work

Local artifacts are under `.forge/reports/remediation-closeout/`: `packed-smoke.json`,
`watch-smoke.json`, `unit-only.log`, `full-tests.log`, and `query-drift/evidence.json` with raw public
schemas. No credentials or resource data are included in the tracked evidence.

Epic #66 still needs disposition of its other eight route findings. Generative API
URL compatibility, Webhosting contracts and authoritative Serverless SQL evidence
remain unresolved; Object Storage requires S3 conformance evidence. Runtime response
validation (#62), full endpoint contract depth (#63), examples (#59), logging/health
(#60), and structured tool output (#65) are not closed by these changes. The seventeen
schema deltas reviewed in feature 062 are a separate inventory.
