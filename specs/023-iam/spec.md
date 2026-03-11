# Feature Specification: Scaleway IAM MCP Tools

**Feature Branch**: `023-iam`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway IAM API (Identity and Access Management)

## User Scenarios & Testing

### User Story 1 - User Management (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete IAM users so that I can manage organization membership programmatically.

**Why this priority**: Users are the foundational identity principal. All other IAM resources (policies, groups, API keys) reference users.

**Independent Test**: Can be fully tested by creating a user, listing users, getting a user, updating, and deleting.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_iam_list_users`, **Then** I receive a paginated list of users with total_count
2. **Given** a valid user_id, **When** I call `scaleway_iam_get_user`, **Then** I receive the full user object
3. **Given** valid parameters (organization_id, email), **When** I call `scaleway_iam_create_user`, **Then** a new user invitation is sent and user object returned
4. **Given** a valid user_id, **When** I call `scaleway_iam_update_user`, **Then** the user is updated
5. **Given** a valid user_id, **When** I call `scaleway_iam_delete_user`, **Then** the user is removed from the organization

---

### User Story 2 - Application Management (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete IAM applications so that I can manage service accounts for programmatic access.

**Why this priority**: Applications are the non-human identity principal used by services and automation.

**Independent Test**: Can be tested by creating an application, listing, getting, updating, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_iam_list_applications`, **Then** I receive a paginated list of applications
2. **Given** a valid application_id, **When** I call `scaleway_iam_get_application`, **Then** I receive the full application object
3. **Given** valid parameters (name, organization_id), **When** I call `scaleway_iam_create_application`, **Then** a new application is created
4. **Given** a valid application_id and update fields, **When** I call `scaleway_iam_update_application`, **Then** the application is updated
5. **Given** a valid application_id, **When** I call `scaleway_iam_delete_application`, **Then** the application is deleted

---

### User Story 3 - API Key Management (Priority: P1)

As an AI agent, I need to list, get, create, update, and delete API keys so that I can manage authentication credentials for users and applications.

**Why this priority**: API keys are the credential mechanism that enables programmatic access to all Scaleway services.

**Independent Test**: Can be tested by creating an API key, listing, getting, updating, and deleting it.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_iam_list_api_keys`, **Then** I receive a paginated list of API keys
2. **Given** a valid access_key, **When** I call `scaleway_iam_get_api_key`, **Then** I receive the full API key object
3. **Given** valid parameters (application_id or user_id), **When** I call `scaleway_iam_create_api_key`, **Then** a new API key is created with access_key and secret_key
4. **Given** a valid access_key and update fields, **When** I call `scaleway_iam_update_api_key`, **Then** the API key is updated
5. **Given** a valid access_key, **When** I call `scaleway_iam_delete_api_key`, **Then** the API key is deleted

---

### User Story 4 - Policy & Rule Management (Priority: P2)

As an AI agent, I need to manage IAM policies and their rules so that I can control access permissions for users, applications, and groups.

**Why this priority**: Policies define what actions principals can perform. Rules are the building blocks of policies.

**Independent Test**: Can be tested by creating a policy with rules, listing, getting, updating, and deleting.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_iam_list_policies`, **Then** I receive a paginated list of policies
2. **Given** a valid policy_id, **When** I call `scaleway_iam_get_policy`, **Then** I receive the full policy object
3. **Given** valid parameters (name, organization_id, optional rules), **When** I call `scaleway_iam_create_policy`, **Then** a new policy is created
4. **Given** a valid policy_id and update fields, **When** I call `scaleway_iam_update_policy`, **Then** the policy is updated
5. **Given** a valid policy_id, **When** I call `scaleway_iam_delete_policy`, **Then** the policy is deleted
6. **Given** a valid policy_id, **When** I call `scaleway_iam_list_rules`, **Then** I receive the rules for that policy
7. **Given** valid parameters (policy_id, permission_set_names), **When** I call `scaleway_iam_create_rule`, **Then** a new rule is created
8. **Given** a valid rule_id and update fields, **When** I call `scaleway_iam_update_rule`, **Then** the rule is updated
9. **Given** a valid rule_id, **When** I call `scaleway_iam_delete_rule`, **Then** the rule is deleted

---

### User Story 5 - Group Management (Priority: P2)

As an AI agent, I need to manage IAM groups and their members so that I can organize principals and assign policies to groups of users/applications.

**Why this priority**: Groups simplify policy management by allowing bulk assignment of permissions.

**Independent Test**: Can be tested by creating a group, adding/removing members, listing, updating, and deleting.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_iam_list_groups`, **Then** I receive a paginated list of groups
2. **Given** a valid group_id, **When** I call `scaleway_iam_get_group`, **Then** I receive the full group object with member lists
3. **Given** valid parameters (name, organization_id), **When** I call `scaleway_iam_create_group`, **Then** a new group is created
4. **Given** a valid group_id and update fields, **When** I call `scaleway_iam_update_group`, **Then** the group is updated
5. **Given** a valid group_id, **When** I call `scaleway_iam_delete_group`, **Then** the group is deleted
6. **Given** a valid group_id and user_id or application_id, **When** I call `scaleway_iam_add_group_member`, **Then** the member is added to the group
7. **Given** a valid group_id and user_id or application_id, **When** I call `scaleway_iam_remove_group_member`, **Then** the member is removed from the group

---

### User Story 6 - Permission Set Discovery (Priority: P3)

As an AI agent, I need to list available permission sets so that I can discover what permissions exist when creating policies and rules.

**Why this priority**: Permission sets are read-only reference data used when constructing policies.

**Independent Test**: Can be tested by listing permission sets.

**Acceptance Scenarios**:

1. **Given** valid credentials, **When** I call `scaleway_iam_list_permission_sets`, **Then** I receive a paginated list of available permission sets with names and descriptions

---

### Edge Cases

- Invalid user_id/application_id/policy_id (404) returns a `not_found` error type
- Duplicate user email returns a `conflict` error
- Creating an API key with both user_id and application_id returns `invalid_input` error
- Deleting a user with active API keys returns appropriate error
- Pagination with page > total pages returns empty items array
- Missing required fields (e.g., no email on create user) returns `invalid_input` error
- Organization ID mismatch returns `permission_denied` error

## Requirements

### Functional Requirements

- **FR-001**: System MUST list users with pagination (page, page_size) and optional organization_id filter
- **FR-002**: System MUST get a single user by user_id
- **FR-003**: System MUST create a user by inviting via email and organization_id
- **FR-004**: System MUST update a user by user_id
- **FR-005**: System MUST delete a user by user_id
- **FR-006**: System MUST list, get, create, update, and delete applications
- **FR-007**: System MUST list, get, create, update, and delete API keys
- **FR-008**: System MUST list, get, create, update, and delete policies
- **FR-009**: System MUST list, create, update, and delete policy rules
- **FR-010**: System MUST list, get, create, update, and delete groups
- **FR-011**: System MUST add and remove group members (users or applications)
- **FR-012**: System MUST list available permission sets
- **FR-013**: All tools MUST validate inputs using Zod schemas
- **FR-014**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-015**: All list operations MUST support standard pagination (page, page_size, total_count)

### Key Entities

- **User**: IAM identity with id, email, organization_id, status, type, mfa, created_at, updated_at, last_login_at
- **Application**: Service account with id, name, description, organization_id, created_at, updated_at
- **ApiKey**: Credential with access_key, secret_key, application_id/user_id, description, expires_at, default_project_id, created_at, updated_at
- **Policy**: Access policy with id, name, description, organization_id, user_id/group_id/application_id, nb_rules, nb_scopes, nb_permission_sets, created_at, updated_at
- **Rule**: Policy rule with id, permission_set_names, project_ids, organization_id
- **Group**: Principal group with id, name, description, organization_id, user_ids, application_ids, created_at, updated_at
- **PermissionSet**: Reference data with id, name, description, categories

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 28 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all IAM tool files
- **SC-003**: All tools map to documented Scaleway IAM API endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all IAM API operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Global API (not zoned). No zone parameter needed. Base path: `/iam/v1alpha1`
- **Pagination**: Standard Scaleway page/page_size with total_count in responses
- **Auth**: SCW_ACCESS_KEY + SCW_SECRET_KEY + SCW_DEFAULT_PROJECT_ID (via shared auth module)
- **Tool naming**: `scaleway_iam_{action}_{resource}` pattern (e.g., `scaleway_iam_list_users`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **Client**: Use shared `createScalewayClient` from `src/shared/client.ts` with `loadAuthConfig` from `src/shared/auth.ts`
- **API version**: v1alpha1 (alpha API, subject to change)
- **API key ownership**: An API key must be owned by either a user_id or application_id (mutually exclusive)
- **Policy attachment**: A policy can be attached to one of user_id, group_id, or application_id
- **Group membership**: Groups contain both user_ids and application_ids arrays
