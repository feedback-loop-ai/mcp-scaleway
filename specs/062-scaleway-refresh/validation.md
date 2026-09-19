# Validation record

Verified on 2026-09-19. This record covers the standalone non-Jev change and its
integration with the pending optional routing work.

## Acceptance evidence

| Requirement | Evidence and result |
| --- | --- |
| RDB snapshot correctness | Published create/restore routes and bodies match the current official schema. Real SDK transport tests exercise the production route guard, path parameters and request serialization. |
| Current service options and operations | Containers public endpoint control, Kubernetes public/VPC kubeconfig selection, Key Manager rotations/material deletion and Audit Trail custom-rule evaluation are wired and documented. The focused service review passed 259 tests across seven files, including 24 transport cases. |
| Chat function calling | A two-request function-call conversation, structured output, token-limit precedence, malformed inputs and unchanged response detail fields are covered. Final review fixed assistant text messages with empty `tool_calls`, enforced documented function-name constraints, and accepted nullable function `strict`. The focused area suite passed 88 tests across six files with full area coverage. |
| Dependency and tooling updates | Frozen installs passed. TypeScript is pinned to 5.9.3 and checks scripts, source, tests and the build entrypoint. CI now builds the package and initializes its Node bundle. The declared CI Bun 1.3.6 install/build and minimum Node 20.20.2 bundle smoke passed. |
| Public schema maintenance | All 48 baseline projections match the recorded source digests and accepted raw schemas. The monitor fetched 48 sources: 31 unchanged, 17 reviewed changes, zero failures. All 17 checker tests passed. Weekly/manual workflow YAML parses and has read-only repository permissions. |
| Catalog and compatibility | Four default gateway tools and 727 underlying operations across 50 areas. Full-suite parity and README parity checks passed. The generated operation metadata includes the corrected routes and three added operations. |
| Independent delivery | An isolated Git-index snapshot omitted optional routing source, configuration, tests and documentation. Its complete validation results are below. The original working tree retains that pending work. |

The current service schemas were independently re-fetched during final review;
all five updated service records match their accepted SHA-256 digests. Generative
API documentation now states that upstream ignores function `strict` and
`parallel_tool_calls: false`; forwarding these fields does not enforce them.

## Standalone validation

The isolated checkout used its own frozen dependency installation and did not
load the original working tree's uncommitted source.

| Check | Result |
| --- | --- |
| `bun install --frozen-lockfile` | Passed |
| `bun run lint` | Passed, 414 files |
| `bun run typecheck` | Passed |
| `bun run test -- --coverage.enabled --coverage.reporter=text --coverage.reporter=json-summary` | 6,169 tests in 151 files passed |
| Configured coverage | 100% lines, branches, statements and functions |
| `bun run build` | Passed; executable and library bundles emitted |
| Bundled server initialization | Passed on Node 22.23.2 and minimum supported Node 20.20.2 |
| `npm pack --dry-run --json` | Six expected files; no credentials, source tree or private artifacts included |

The six package entries are `CHANGELOG.md`, `LICENSE`, `README.md`, `dist/index.js`,
`dist/server.js` and `package.json`. The package dry run does not publish anything.

After integration, the original working tree also passed lint, strict type checking
and **6,217 tests across 155 files**, with 100% configured coverage in every metric.
The difference in test counts comes from the pending optional routing work.

## Authenticated live reads

At **2026-09-19T07:39:41.388Z**, the isolated built Node server was exercised through
an in-memory MCP client and `scaleway_read`. Six authenticated GET requests were
allowed, restricted to their exact paths on `https://api.scaleway.com`. The gateway
also advertised the expected four default tools.

| Operation | HTTP status | Returned / total | Duration |
| --- | --- | --- | --- |
| `instances_list_servers` | 200 | 0 / 0 | 372 ms |
| `rdb_list_instances` | 200 | 0 / 0 | 385 ms |
| `rdb_list_snapshots` | 200 | 0 / 0 | 399 ms |
| `k8s_list_clusters` | 200 | 0 / 0 | 345 ms |
| `containers_list_namespaces` | 200 | 0 / 0 | 460 ms |
| `key_manager_list_keys` | 200 | 0 / 0 | 344 ms |

These queries used `fr-par` / `fr-par-1`, project scoping and one-item first pages.
All lists were empty. Authentication and list dispatch are verified; this cannot
establish behavior on existing resources or mutation endpoints. No provisioning,
mutation or paid inference was performed. The local sanitized report is
`.forge/non-jev-delivery/live-read-report.json`; test and packaging logs are in the
same ignored directory. Credentials and resource identifiers are absent from them.

## Upstream disposition and remaining scope

The final public check at **2026-09-19T07:34:47.924Z** reported the same 17 reviewed
areas: three documentation changes, twelve additive response changes and two
changes to capabilities not currently exposed. No further compatibility fix was
identified. See [upstream-review.md](upstream-review.md) for per-area evidence.
Accepted provenance for those areas remains unchanged, so freshness alarms remain
visible rather than silently accepting new baselines.

Jev live testing and configuration are outside this delivery. The broader legacy
compliance issues listed in [retrofit-compliance.md](../retrofit-compliance.md)
remain open; this record establishes the tested refresh, not full certification
of all service endpoints or closure of repository-wide governance requirements.
