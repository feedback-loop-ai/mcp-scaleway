# Pagination response consumption

Specified before implementation, 2026-09-20.

Public OpenAPI documents often leave list fields optional. The transport validator
retains that source meaning. A handler that constructs this server's normalized
`{ items, totalCount, page, pageSize }` envelope must nevertheless receive an array
and a finite, nonnegative integer count. Missing, null or malformed values cannot
be presented as a successful normalized list.

`buildPaginatedResponse` validates these consumed values with Zod, without changing
the item objects, coercing a string count, or inventing an empty list/zero count.
Invalid consumed data throws the existing sanitized upstream response error with
status 502 and reason `invalid_schema`; handlers return their normal structured
error. Input pagination remains governed by each operation's input schema.

Handwritten list handlers for VPC, SQS credentials, Cockpit and Inference must pass
their actual consumed fields to this boundary. Their prior `?? []` / `?? 0`
fallbacks lack a recorded missing-as-empty wire contract and are removed. Actual
official SDK unmarshallers retain their documented transformations; this change
does not replace or modify those SDK functions. The two unavailable legacy
Inference lists still fail locally before HTTP when dispatched.

The boundary exposed three mismatched consumed wire fields: the documented K8s
`GET /k8s/v1/regions/{region}/clusters/{cluster_id}/pools` response contains `pools`,
and both VPN `/vpn-gateways` and `/customer-gateways` list responses contain
`gateways`. Handlers must normalize these actual source arrays, preserving their
items, rather than read the invented `nodes`, `vpn_gateways` or `customer_gateways`
fields. The committed source documents and real transport tests cover these names.

Tests cover the shared boundary and an actual registered K8s list dispatch through
the real SDK response parser with HTTP replaced. Both omission cases and an empty
but complete response are exercised. No cloud request is needed.

IAM create/update/delete-rule tools replace an entire policy after their list read.
Before any PUT, the consumed response must contain an actual rules array and an
explicit nonnegative integer total_count equal to the array length. Empty rules with
count zero are valid. Missing fields, or a partial first page of a larger policy,
must stop the operation with a sanitized actionable 502; this bounded correction
does not introduce automatic pagination or change the published source schema.

Every existing rule must contain its nonempty ID, explicit permission_set_names
(null or a string array), explicit string condition, and at least one explicit
project_ids/organization_id field. Nullable scopes are retained exactly. A nonnull
account_root_user_id cannot be represented in SetRules and must stop replacement.
Missing permission/condition/scope details cannot be synthesized as null/empty
values. This restriction protects existing access rules from incomplete reads;
mutations require a complete, representable policy. Tests use real dispatch and SDK
parsing with HTTP replaced, and assert that rejected reads never reach PUT.

RDB's `list_endpoints` similarly projects the `endpoints` array out of the documented
GetInstance response. This consumed array must exist and be an array; missing or
null endpoints yield the same safe 502 instead of fabricating an empty list. An
explicit empty array remains a successful response.
