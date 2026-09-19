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
