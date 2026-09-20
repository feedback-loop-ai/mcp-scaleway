# Unverified legacy operations

Decision recorded before implementation, 2026-09-19 UTC.

The three regional Cockpit lifecycle operations and three legacy Inference routes
have no complete authoritative current wire contract after the documented review.
Absence is not proof of retirement. They must not issue a mutation and subsequently
fail because a response contract was unavailable.

Preserve their identifiers for compatibility, label them unavailable in discovery,
and return a local `unsupported_operation` (501) before any HTTP request. Record each
reason and any source-backed alternative in a committed exception manifest. This is
an explicit temporary support restriction, not a claim the provider removed the API.
The catalog/evidence gate must account for these entries as blocked capabilities,
never as validated endpoints. Re-enabling requires an independently sourced wire
contract plus operation-level transport tests. No environment switch bypasses this.

Affected IDs: scaleway_cockpit_get_cockpit, scaleway_cockpit_activate_cockpit,
scaleway_cockpit_deactivate_cockpit, scaleway_inference_accept_eula,
scaleway_inference_list_deployment_events, scaleway_inference_list_endpoints.
