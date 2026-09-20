# Remediation closeout

Date: 2026-09-19. User direction: finish the remediation items supported by concrete
evidence. This record documents a bounded follow-up to the merged Scaleway refresh;
it does not claim the document preceded these maintenance edits.

## Requirements

1. Compare exact OpenAPI methods and paths without treating query strings as path
   keys. Preserve query metadata and verify the Registrar/NATS parameters separately.
2. Make the Webhosting diagnostic report observations without inferring route absence
   from a missing resource or route existence from an arbitrary HTTP error.
3. Provide and document a source restart workflow, including stdio session limits.
4. Complete the SDK upgrade's actual tarball-install check in all three server modes
   under CI's pinned Bun, and keep that check in CI.
5. Reconcile issue status only where closure evidence exists. Preserve unresolved
   endpoint, response-validation and contract-depth work.

## Boundaries

No operation is removed because a schema omits it. No cloud mutations or paid model
calls establish this closeout. It does not resolve every issue in epic #66, certify
all 727 operations, waive historical governance findings or publish a package release.

The regression and evidence requirements follow Constitution VIII; development
restart addresses the open Principle VI implementation requirement.

## SDD closeout clarification — 2026-09-20

Requirements 1–5 are required acceptance scope with equal priority within this
maintenance delivery. This dated clarification does not establish earlier product
approval or reverse the recorded retrospective authorship.

Delivered in [PR #81](https://github.com/feedback-loop-ai/mcp-scaleway/pull/81)
(`4f4027c`). The [plan](plan.md), [data model](data-model.md),
[maintenance contracts](contracts/maintenance.md), [checkpoints](tasks.md) and
[validation](validation.md) separate design from recorded evidence. The model and
contract documents were consolidated retrospectively on 2026-09-20. Historical
open findings are subsequently dispositioned in
[feature 064's closure map](../064-remaining-remediation/closure-map.md); this
feature's original test counts and limits remain unchanged.
