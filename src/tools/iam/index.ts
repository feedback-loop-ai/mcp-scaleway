import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import {
	handleAddGroupMember,
	handleCreateApiKey,
	handleCreateApplication,
	handleCreateGroup,
	handleCreatePolicy,
	handleCreateRule,
	handleCreateUser,
	handleDeleteApiKey,
	handleDeleteApplication,
	handleDeleteGroup,
	handleDeletePolicy,
	handleDeleteRule,
	handleDeleteUser,
	handleGetApiKey,
	handleGetApplication,
	handleGetGroup,
	handleGetPolicy,
	handleGetUser,
	handleListApiKeys,
	handleListApplications,
	handleListGroups,
	handleListPermissionSets,
	handleListPolicies,
	handleListRules,
	handleListUsers,
	handleRemoveGroupMember,
	handleUpdateApiKey,
	handleUpdateApplication,
	handleUpdateGroup,
	handleUpdatePolicy,
	handleUpdateRule,
	handleUpdateUser,
} from "./handlers.js";
import {
	AddGroupMemberInput,
	CreateApiKeyInput,
	CreateApplicationInput,
	CreateGroupInput,
	CreatePolicyInput,
	CreateRuleInput,
	CreateUserInput,
	DeleteApiKeyInput,
	DeleteApplicationInput,
	DeleteGroupInput,
	DeletePolicyInput,
	DeleteRuleInput,
	DeleteUserInput,
	GetApiKeyInput,
	GetApplicationInput,
	GetGroupInput,
	GetPolicyInput,
	GetUserInput,
	ListApiKeysInput,
	ListApplicationsInput,
	ListGroupsInput,
	ListPermissionSetsInput,
	ListPoliciesInput,
	ListRulesInput,
	ListUsersInput,
	RemoveGroupMemberInput,
	UpdateApiKeyInput,
	UpdateApplicationInput,
	UpdateGroupInput,
	UpdatePolicyInput,
	UpdateRuleInput,
	UpdateUserInput,
} from "./types.js";

export function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

export function registerIamTools(server: McpServer): void {
	// ── Users ─────────────────────────────────────────────────────────
	server.tool(
		"scaleway_iam_list_users",
		"List IAM users in the organization",
		ListUsersInput.shape,
		async (params) => handleListUsers(getClient(), ListUsersInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_get_user",
		"Get details of an IAM user",
		GetUserInput.shape,
		async (params) => handleGetUser(getClient(), GetUserInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_create_user",
		"Invite a new IAM user to the organization",
		CreateUserInput.shape,
		async (params) => handleCreateUser(getClient(), CreateUserInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_update_user",
		"Update an IAM user",
		UpdateUserInput.shape,
		async (params) => handleUpdateUser(getClient(), UpdateUserInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_delete_user",
		"Remove an IAM user from the organization",
		DeleteUserInput.shape,
		async (params) => handleDeleteUser(getClient(), DeleteUserInput.parse(params)),
	);

	// ── Applications ──────────────────────────────────────────────────
	server.tool(
		"scaleway_iam_list_applications",
		"List IAM applications in the organization",
		ListApplicationsInput.shape,
		async (params) => handleListApplications(getClient(), ListApplicationsInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_get_application",
		"Get details of an IAM application",
		GetApplicationInput.shape,
		async (params) => handleGetApplication(getClient(), GetApplicationInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_create_application",
		"Create a new IAM application",
		CreateApplicationInput.shape,
		async (params) => handleCreateApplication(getClient(), CreateApplicationInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_update_application",
		"Update an IAM application",
		UpdateApplicationInput.shape,
		async (params) => handleUpdateApplication(getClient(), UpdateApplicationInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_delete_application",
		"Delete an IAM application",
		DeleteApplicationInput.shape,
		async (params) => handleDeleteApplication(getClient(), DeleteApplicationInput.parse(params)),
	);

	// ── API Keys ──────────────────────────────────────────────────────
	server.tool(
		"scaleway_iam_list_api_keys",
		"List IAM API keys",
		ListApiKeysInput.shape,
		async (params) => handleListApiKeys(getClient(), ListApiKeysInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_get_api_key",
		"Get details of an IAM API key",
		GetApiKeyInput.shape,
		async (params) => handleGetApiKey(getClient(), GetApiKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_create_api_key",
		"Create a new IAM API key",
		CreateApiKeyInput.shape,
		async (params) => handleCreateApiKey(getClient(), CreateApiKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_update_api_key",
		"Update an IAM API key",
		UpdateApiKeyInput.shape,
		async (params) => handleUpdateApiKey(getClient(), UpdateApiKeyInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_delete_api_key",
		"Delete an IAM API key",
		DeleteApiKeyInput.shape,
		async (params) => handleDeleteApiKey(getClient(), DeleteApiKeyInput.parse(params)),
	);

	// ── Policies ──────────────────────────────────────────────────────
	server.tool(
		"scaleway_iam_list_policies",
		"List IAM policies in the organization",
		ListPoliciesInput.shape,
		async (params) => handleListPolicies(getClient(), ListPoliciesInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_get_policy",
		"Get details of an IAM policy",
		GetPolicyInput.shape,
		async (params) => handleGetPolicy(getClient(), GetPolicyInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_create_policy",
		"Create a new IAM policy with optional rules",
		CreatePolicyInput.shape,
		async (params) => handleCreatePolicy(getClient(), CreatePolicyInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_update_policy",
		"Update an IAM policy",
		UpdatePolicyInput.shape,
		async (params) => handleUpdatePolicy(getClient(), UpdatePolicyInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_delete_policy",
		"Delete an IAM policy",
		DeletePolicyInput.shape,
		async (params) => handleDeletePolicy(getClient(), DeletePolicyInput.parse(params)),
	);

	// ── Rules ─────────────────────────────────────────────────────────
	server.tool(
		"scaleway_iam_list_rules",
		"List rules for an IAM policy",
		ListRulesInput.shape,
		async (params) => handleListRules(getClient(), ListRulesInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_create_rule",
		"Create a new rule for an IAM policy",
		CreateRuleInput.shape,
		async (params) => handleCreateRule(getClient(), CreateRuleInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_update_rule",
		"Update an IAM policy rule",
		UpdateRuleInput.shape,
		async (params) => handleUpdateRule(getClient(), UpdateRuleInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_delete_rule",
		"Delete an IAM policy rule",
		DeleteRuleInput.shape,
		async (params) => handleDeleteRule(getClient(), DeleteRuleInput.parse(params)),
	);

	// ── Groups ────────────────────────────────────────────────────────
	server.tool(
		"scaleway_iam_list_groups",
		"List IAM groups in the organization",
		ListGroupsInput.shape,
		async (params) => handleListGroups(getClient(), ListGroupsInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_get_group",
		"Get details of an IAM group",
		GetGroupInput.shape,
		async (params) => handleGetGroup(getClient(), GetGroupInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_create_group",
		"Create a new IAM group",
		CreateGroupInput.shape,
		async (params) => handleCreateGroup(getClient(), CreateGroupInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_update_group",
		"Update an IAM group",
		UpdateGroupInput.shape,
		async (params) => handleUpdateGroup(getClient(), UpdateGroupInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_delete_group",
		"Delete an IAM group",
		DeleteGroupInput.shape,
		async (params) => handleDeleteGroup(getClient(), DeleteGroupInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_add_group_member",
		"Add a user or application to an IAM group",
		AddGroupMemberInput.shape,
		async (params) => handleAddGroupMember(getClient(), AddGroupMemberInput.parse(params)),
	);

	server.tool(
		"scaleway_iam_remove_group_member",
		"Remove a user or application from an IAM group",
		RemoveGroupMemberInput.shape,
		async (params) => handleRemoveGroupMember(getClient(), RemoveGroupMemberInput.parse(params)),
	);

	// ── Permission Sets ───────────────────────────────────────────────
	server.tool(
		"scaleway_iam_list_permission_sets",
		"List available IAM permission sets",
		ListPermissionSetsInput.shape,
		async (params) => handleListPermissionSets(getClient(), ListPermissionSetsInput.parse(params)),
	);
}
