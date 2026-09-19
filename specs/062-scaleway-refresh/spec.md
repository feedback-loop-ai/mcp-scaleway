# Scaleway API and maintenance refresh

Date: 2026-09-19. Scope: the non-Jev work requested in the repository evaluation.
This record separates the completed Scaleway work from optional intent routing
in feature 061. It records existing implementation and final review; it does not
claim that this document preceded implementation.

## Requirements

1. Match the current published RDB snapshot creation and restoration endpoints
   and request bodies while preserving existing tool names.
2. Expose Containers default public endpoint control, Kubernetes kubeconfig
   public/VPC endpoint selection, Key Manager rotation listing and imported
   material deletion, and Audit Trail custom alert rule evaluation.
3. Support Generative APIs function definitions, selection, assistant tool calls,
   tool-result messages, structured output and current completion-token controls.
   Document compatibility fields the upstream service accepts but ignores.
4. Update the MCP and Scaleway SDK dependencies, pin the TypeScript compiler,
   and type-check maintenance scripts with application and test code.
5. Compare all 48 recorded public schema sources against reviewed provenance and
   semantic baselines. Report upstream changes without automatically accepting
   them; fail on unavailable sources or checker failures. Run this monitor weekly.
6. Keep four default MCP gateway tools and a consistent catalog of 727 underlying
   operations across 50 product areas. Update references, generated metadata and
   contract traceability for each changed operation.
7. Validate the standalone change with frozen dependency installation, lint,
   strict type checking, tests, full configured coverage, parity, Node bundle
   smoke tests, public schema checks and bounded authenticated read checks.

## Boundaries

Jev configuration, model evaluation and routing implementation are a separate
change. This refresh does not require a TypeSafe credential. Cloud mutation
contracts are checked with intercepted transport; no paid resources are created
to establish live coverage. Empty authenticated lists cannot prove behavior of
resource-specific operations.

Existing repository-wide compliance gaps remain recorded in
[the retrospective compliance record](../retrofit-compliance.md). Passing the
checks for this change does not close those broader issues or authorize a release.

## Evidence

See [validation.md](validation.md) for current command results and acceptance
evidence, and [upstream-review.md](upstream-review.md) for disposition of the
remaining public schema changes.
