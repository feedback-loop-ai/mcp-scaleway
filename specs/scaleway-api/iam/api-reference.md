# Scaleway IAM API Reference

Base URL: `https://api.scaleway.com/iam/v1alpha1`

Official docs: https://www.scaleway.com/en/developers/api/iam/

## Authentication
- Header: `X-Auth-Token: <secret_key>`

IAM is a global (non-regional, organization-scoped) product.

## MCP Identifier Confinement

Before invoking an IAM handler, the MCP server validates every input field named
`user_id`, `application_id`, `access_key`, `policy_id`, `group_id`, or `rule_id`
with the same safe-path-segment schema. These identifiers must be nonempty and
contain only ASCII letters, digits, `-`, `_`, `.`, or `~`; the exact values `.`
and `..` are forbidden. UUIDs, API access keys and simple IDs such as `user-1`
remain valid. Optional and nullable fields retain their existing semantics.
This is a local MCP input contract, not a claim that every such ID exists upstream.

Slashes, backslashes, percent escapes (including double-encoded traversal), query
and fragment delimiters, whitespace and control characters are rejected, not
normalized, decoded or silently rewritten. An identifier cannot change the
selected operation's URL path or escape `/iam/v1alpha1`. This applies uniformly
in `gateway`, `flat` and `both` modes, including read-only IAM configurations
with individual operations excluded. Malformed identifiers fail validation
before handler invocation or any HTTP request, so an allowed get-user operation
cannot be used to reach an excluded get-group or a different product endpoint.

The same identifier constraint applies to these named input fields when used in
queries, JSON bodies or rule matching, keeping their contracts consistent.
It does **not** constrain free-form names/descriptions, CEL `condition`
expressions, permission-set names, or other non-identifier input text. Those
fields continue to be transmitted unchanged in their existing query/body slots.
Response schemas are unchanged.

Regression coverage: `tests/unit/tools/iam.test.ts`,
`tests/contract/iam/iam.contract.test.ts` and
`tests/contract/iam-path-confinement.test.ts`. Protocol regressions use the real
`createServer` and an in-memory MCP transport, with fail-closed mocked `fetch`
(no real network or live credentials), and assert zero outbound calls for
rejected identifiers. Positive controls verify honest IDs still address the
original endpoints and body text is not restricted or rewritten.

## Users

### List Users
`GET /users`
- Query: `organization_id?`, `page`, `page_size`, `order_by?`
- Response: `{ users: User[], total_count: number }`
- User: `{ id, email, created_at, updated_at, organization_id, status, type, mfa, last_login_at? }`
- Tool: `scaleway_iam_list_users`

### Get User
`GET /users/{user_id}` -> User object. Tool: `scaleway_iam_get_user`

### Create User
`POST /users`
- Body: `{ organization_id, email }`
- Response: User object
- Tool: `scaleway_iam_create_user`

### Update User
`PATCH /users/{user_id}` (empty body in this implementation) -> User object. Tool: `scaleway_iam_update_user`

### Delete User
`DELETE /users/{user_id}` -> 204. Tool: `scaleway_iam_delete_user`

## Applications

### List Applications
`GET /applications`
- Query: `organization_id?`, `page`, `page_size`, `order_by?`
- Response: `{ applications: Application[], total_count: number }`
- Application: `{ id, name, description, created_at, updated_at, organization_id }`
- Tool: `scaleway_iam_list_applications`

### Get Application
`GET /applications/{application_id}`. Tool: `scaleway_iam_get_application`

### Create Application
`POST /applications`
- Body: `{ name, organization_id?, description }`
- Tool: `scaleway_iam_create_application`

### Update Application
`PATCH /applications/{application_id}`
- Body: `{ name?, description? }`
- Tool: `scaleway_iam_update_application`

### Delete Application
`DELETE /applications/{application_id}` -> 204. Tool: `scaleway_iam_delete_application`

## API Keys

### List API Keys
`GET /api-keys`
- Query: `organization_id?`, `application_id?`, `user_id?`, `page`, `page_size`, `order_by?`
- Response: `{ api_keys: ApiKey[], total_count: number }`
- ApiKey: `{ access_key, secret_key?, application_id?, user_id?, description, created_at, updated_at, expires_at?, default_project_id? }`
  (`secret_key` is only returned on creation)
- Tool: `scaleway_iam_list_api_keys`

### Get API Key
`GET /api-keys/{access_key}` -> ApiKey object. Tool: `scaleway_iam_get_api_key`
- NOTE: the key is addressed by its `access_key` in the path. The official docs render the
  path parameter as `{api_key_id}`, which is the access key value.

### Create API Key
`POST /api-keys`
- Body: `{ application_id?, user_id?, description, expires_at?, default_project_id? }`
  (`application_id` and `user_id` are mutually exclusive)
- Response: ApiKey object (includes `secret_key`)
- Tool: `scaleway_iam_create_api_key`

### Update API Key
`PATCH /api-keys/{access_key}`
- Body: `{ description?, default_project_id? }`
- Tool: `scaleway_iam_update_api_key`

### Delete API Key
`DELETE /api-keys/{access_key}` -> 204. Tool: `scaleway_iam_delete_api_key`

## Policies

### List Policies
`GET /policies`
- Query: `organization_id?`, `page`, `page_size`, `order_by?`
- Response: `{ policies: Policy[], total_count: number }`
- Policy: `{ id, name, description, organization_id, created_at, updated_at, user_id?, group_id?, application_id?, nb_rules?, nb_scopes?, nb_permission_sets? }`
- Tool: `scaleway_iam_list_policies`

### Get Policy
`GET /policies/{policy_id}`. Tool: `scaleway_iam_get_policy`

### Create Policy
`POST /policies`
- Body: `{ name, organization_id?, description, user_id?, group_id?, application_id?, rules? }`
- Rule input: `{ permission_set_names, project_ids?, organization_id? }`
- Tool: `scaleway_iam_create_policy`

### Update Policy
`PATCH /policies/{policy_id}`
- Body: `{ name?, description?, user_id?, group_id?, application_id? }`
- Tool: `scaleway_iam_update_policy`

### Delete Policy
`DELETE /policies/{policy_id}` -> 204. Tool: `scaleway_iam_delete_policy`

## Rules

### List Rules
`GET /rules`
- Query: `policy_id`, `page`, `page_size`
- Response: `{ rules: Rule[], total_count: number }`
- Rule: `{ id, permission_set_names, project_ids, organization_id }`
- Tool: `scaleway_iam_list_rules`

### Set Rules (replace full set)
`PUT /rules`
- Body: `{ policy_id, rules: RuleSpecs[] }`
- RuleSpecs: `{ permission_set_names, condition, project_ids? | organization_id? }`
  (precisely one of `project_ids` / `organization_id` must be set)
- Response: `{ rules: Rule[] }`

> **The Scaleway IAM API has no per-rule create/update/delete endpoints.** Verified
> against [`scaleway-sdk-go` `api/iam/v1alpha1`](https://github.com/scaleway/scaleway-sdk-go/blob/master/api/iam/v1alpha1/iam_sdk.go):
> only `GET /rules` (ListRules) and `PUT /rules` (SetRules — full-set replace) exist.
> The tools below are therefore implemented on top of the read+set pattern: fetch the
> policy's current rules, apply the change to the list, then `PUT` the whole list back.

### Create Rule
- Tool: `scaleway_iam_create_rule`
- Params: `{ policy_id, permission_set_names, condition?, project_ids?, organization_id? }`
- Implementation: `GET /rules?policy_id=` → append the new rule → `PUT /rules`.

### Update Rule
- Tool: `scaleway_iam_update_rule`
- Params: `{ policy_id, rule_id, permission_set_names?, condition?, project_ids?, organization_id? }`
- Implementation: `GET /rules?policy_id=` → replace the matching rule's fields (setting
  `project_ids` clears `organization_id` and vice-versa) → `PUT /rules`. Errors if the
  `rule_id` is not present in the policy.

### Delete Rule
- Tool: `scaleway_iam_delete_rule`
- Params: `{ policy_id, rule_id }`
- Implementation: `GET /rules?policy_id=` → remove the matching rule → `PUT /rules`.
  Errors if the `rule_id` is not present in the policy.

> Limitation: rules scoped to an account root user (`account_root_user_id`) cannot be
> represented as `RuleSpecs` and are preserved only by their project/organization scope.
> A policy is assumed to have at most 100 rules (a single list page).

## Groups

### List Groups
`GET /groups`
- Query: `organization_id?`, `page`, `page_size`, `order_by?`
- Response: `{ groups: Group[], total_count: number }`
- Group: `{ id, name, description, organization_id, created_at, updated_at, user_ids, application_ids }`
- Tool: `scaleway_iam_list_groups`

### Get Group
`GET /groups/{group_id}`. Tool: `scaleway_iam_get_group`

### Create Group
`POST /groups`
- Body: `{ name, organization_id?, description }`
- Tool: `scaleway_iam_create_group`

### Update Group
`PATCH /groups/{group_id}`
- Body: `{ name?, description? }`
- Tool: `scaleway_iam_update_group`

### Delete Group
`DELETE /groups/{group_id}` -> 204. Tool: `scaleway_iam_delete_group`

### Add Group Member
`POST /groups/{group_id}/add-member`
- Body: `{ user_id? | application_id? }` (precisely one)
- Response: Group object
- Tool: `scaleway_iam_add_group_member`

### Remove Group Member
`POST /groups/{group_id}/remove-member`
- Body: `{ user_id? | application_id? }` (precisely one)
- Response: Group object
- Tool: `scaleway_iam_remove_group_member`

> Verified against [`scaleway-sdk-go` `api/iam/v1alpha1`](https://github.com/scaleway/scaleway-sdk-go/blob/master/api/iam/v1alpha1/iam_sdk.go):
> the single-member operations are `POST /add-member` and `POST /remove-member` (there is
> also a bulk `POST /add-members` and a `PUT /members` full-set replace, not exposed here).

## Permission Sets

### List Permission Sets
`GET /permission-sets`
- Query: `organization_id?`, `page`, `page_size`, `order_by?`
- Response: `{ permission_sets: PermissionSet[], total_count: number }`
- PermissionSet: `{ id, name, description, categories? }`
- Tool: `scaleway_iam_list_permission_sets`

## Pagination
- Request: `page` (1-indexed), `page_size` (1-100)
- Response: `total_count` alongside the item array.

## Error Codes
- 400: Invalid input
- 401/403: Permission denied
- 404: Not found
- 409: Conflict (e.g. duplicate name)
- 429: Rate limited
- 500: Server error
