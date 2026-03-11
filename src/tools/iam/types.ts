import { z } from "zod";

// ── Entity Schemas ──────────────────────────────────────────────────────

export const IamUser = z.object({
	id: z.string(),
	email: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	organization_id: z.string(),
	status: z.string(),
	type: z.string(),
	mfa: z.boolean(),
	last_login_at: z.string().nullable().optional(),
});
export type IamUser = z.infer<typeof IamUser>;

export const IamApplication = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	organization_id: z.string(),
});
export type IamApplication = z.infer<typeof IamApplication>;

export const IamApiKey = z.object({
	access_key: z.string(),
	secret_key: z.string().optional(),
	application_id: z.string().nullable().optional(),
	user_id: z.string().nullable().optional(),
	description: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	expires_at: z.string().nullable().optional(),
	default_project_id: z.string().nullable().optional(),
});
export type IamApiKey = z.infer<typeof IamApiKey>;

export const IamRule = z.object({
	id: z.string(),
	permission_set_names: z.array(z.string()),
	project_ids: z.array(z.string()),
	organization_id: z.string(),
});
export type IamRule = z.infer<typeof IamRule>;

export const IamPolicy = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	organization_id: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	user_id: z.string().nullable().optional(),
	group_id: z.string().nullable().optional(),
	application_id: z.string().nullable().optional(),
	nb_rules: z.number().optional(),
	nb_scopes: z.number().optional(),
	nb_permission_sets: z.number().optional(),
});
export type IamPolicy = z.infer<typeof IamPolicy>;

export const IamGroup = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	organization_id: z.string(),
	created_at: z.string(),
	updated_at: z.string(),
	user_ids: z.array(z.string()),
	application_ids: z.array(z.string()),
});
export type IamGroup = z.infer<typeof IamGroup>;

export const IamPermissionSet = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	categories: z.array(z.string()).optional(),
});
export type IamPermissionSet = z.infer<typeof IamPermissionSet>;

// ── Input Schemas ───────────────────────────────────────────────────────

// Users
export const ListUsersInput = z.object({
	organization_id: z.string().optional().describe("Filter by organization ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: z.string().optional().describe("Order by field (e.g., created_at_asc)"),
});
export type ListUsersInput = z.infer<typeof ListUsersInput>;

export const GetUserInput = z.object({
	user_id: z.string().describe("User ID"),
});
export type GetUserInput = z.infer<typeof GetUserInput>;

export const CreateUserInput = z.object({
	organization_id: z.string().describe("Organization ID"),
	email: z.string().describe("User email address"),
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const UpdateUserInput = z.object({
	user_id: z.string().describe("User ID"),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInput>;

export const DeleteUserInput = z.object({
	user_id: z.string().describe("User ID"),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInput>;

// Applications
export const ListApplicationsInput = z.object({
	organization_id: z.string().optional().describe("Filter by organization ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: z.string().optional().describe("Order by field"),
});
export type ListApplicationsInput = z.infer<typeof ListApplicationsInput>;

export const GetApplicationInput = z.object({
	application_id: z.string().describe("Application ID"),
});
export type GetApplicationInput = z.infer<typeof GetApplicationInput>;

export const CreateApplicationInput = z.object({
	name: z.string().describe("Application name"),
	organization_id: z.string().optional().describe("Organization ID"),
	description: z.string().optional().default("").describe("Application description"),
});
export type CreateApplicationInput = z.infer<typeof CreateApplicationInput>;

export const UpdateApplicationInput = z.object({
	application_id: z.string().describe("Application ID"),
	name: z.string().optional().describe("New name"),
	description: z.string().optional().describe("New description"),
});
export type UpdateApplicationInput = z.infer<typeof UpdateApplicationInput>;

export const DeleteApplicationInput = z.object({
	application_id: z.string().describe("Application ID"),
});
export type DeleteApplicationInput = z.infer<typeof DeleteApplicationInput>;

// API Keys
export const ListApiKeysInput = z.object({
	organization_id: z.string().optional().describe("Filter by organization ID"),
	application_id: z.string().optional().describe("Filter by application ID"),
	user_id: z.string().optional().describe("Filter by user ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: z.string().optional().describe("Order by field"),
});
export type ListApiKeysInput = z.infer<typeof ListApiKeysInput>;

export const GetApiKeyInput = z.object({
	access_key: z.string().describe("API key access key"),
});
export type GetApiKeyInput = z.infer<typeof GetApiKeyInput>;

export const CreateApiKeyInput = z.object({
	application_id: z
		.string()
		.optional()
		.describe("Application ID (mutually exclusive with user_id)"),
	user_id: z.string().optional().describe("User ID (mutually exclusive with application_id)"),
	description: z.string().optional().default("").describe("API key description"),
	expires_at: z.string().optional().describe("Expiration date (ISO 8601)"),
	default_project_id: z.string().optional().describe("Default project ID"),
});
export type CreateApiKeyInput = z.infer<typeof CreateApiKeyInput>;

export const UpdateApiKeyInput = z.object({
	access_key: z.string().describe("API key access key"),
	description: z.string().optional().describe("New description"),
	default_project_id: z.string().optional().describe("New default project ID"),
});
export type UpdateApiKeyInput = z.infer<typeof UpdateApiKeyInput>;

export const DeleteApiKeyInput = z.object({
	access_key: z.string().describe("API key access key"),
});
export type DeleteApiKeyInput = z.infer<typeof DeleteApiKeyInput>;

// Policies
export const ListPoliciesInput = z.object({
	organization_id: z.string().optional().describe("Filter by organization ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: z.string().optional().describe("Order by field"),
});
export type ListPoliciesInput = z.infer<typeof ListPoliciesInput>;

export const GetPolicyInput = z.object({
	policy_id: z.string().describe("Policy ID"),
});
export type GetPolicyInput = z.infer<typeof GetPolicyInput>;

export const CreatePolicyInput = z.object({
	name: z.string().describe("Policy name"),
	organization_id: z.string().optional().describe("Organization ID"),
	description: z.string().optional().default("").describe("Policy description"),
	user_id: z.string().optional().describe("User ID to attach the policy to"),
	group_id: z.string().optional().describe("Group ID to attach the policy to"),
	application_id: z.string().optional().describe("Application ID to attach the policy to"),
	rules: z
		.array(
			z.object({
				permission_set_names: z.array(z.string()).describe("Permission set names"),
				project_ids: z.array(z.string()).optional().describe("Project IDs"),
				organization_id: z.string().optional().describe("Organization ID for this rule"),
			}),
		)
		.optional()
		.describe("Policy rules"),
});
export type CreatePolicyInput = z.infer<typeof CreatePolicyInput>;

export const UpdatePolicyInput = z.object({
	policy_id: z.string().describe("Policy ID"),
	name: z.string().optional().describe("New name"),
	description: z.string().optional().describe("New description"),
	user_id: z.string().nullable().optional().describe("User ID"),
	group_id: z.string().nullable().optional().describe("Group ID"),
	application_id: z.string().nullable().optional().describe("Application ID"),
});
export type UpdatePolicyInput = z.infer<typeof UpdatePolicyInput>;

export const DeletePolicyInput = z.object({
	policy_id: z.string().describe("Policy ID"),
});
export type DeletePolicyInput = z.infer<typeof DeletePolicyInput>;

// Rules
export const ListRulesInput = z.object({
	policy_id: z.string().describe("Policy ID to list rules for"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
});
export type ListRulesInput = z.infer<typeof ListRulesInput>;

export const CreateRuleInput = z.object({
	policy_id: z.string().describe("Policy ID"),
	permission_set_names: z.array(z.string()).describe("Permission set names"),
	project_ids: z.array(z.string()).optional().describe("Project IDs"),
	organization_id: z.string().optional().describe("Organization ID for this rule"),
});
export type CreateRuleInput = z.infer<typeof CreateRuleInput>;

export const UpdateRuleInput = z.object({
	rule_id: z.string().describe("Rule ID"),
	permission_set_names: z.array(z.string()).optional().describe("Permission set names"),
	project_ids: z.array(z.string()).optional().describe("Project IDs"),
	organization_id: z.string().optional().describe("Organization ID"),
});
export type UpdateRuleInput = z.infer<typeof UpdateRuleInput>;

export const DeleteRuleInput = z.object({
	rule_id: z.string().describe("Rule ID"),
});
export type DeleteRuleInput = z.infer<typeof DeleteRuleInput>;

// Groups
export const ListGroupsInput = z.object({
	organization_id: z.string().optional().describe("Filter by organization ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: z.string().optional().describe("Order by field"),
});
export type ListGroupsInput = z.infer<typeof ListGroupsInput>;

export const GetGroupInput = z.object({
	group_id: z.string().describe("Group ID"),
});
export type GetGroupInput = z.infer<typeof GetGroupInput>;

export const CreateGroupInput = z.object({
	name: z.string().describe("Group name"),
	organization_id: z.string().optional().describe("Organization ID"),
	description: z.string().optional().default("").describe("Group description"),
});
export type CreateGroupInput = z.infer<typeof CreateGroupInput>;

export const UpdateGroupInput = z.object({
	group_id: z.string().describe("Group ID"),
	name: z.string().optional().describe("New name"),
	description: z.string().optional().describe("New description"),
});
export type UpdateGroupInput = z.infer<typeof UpdateGroupInput>;

export const DeleteGroupInput = z.object({
	group_id: z.string().describe("Group ID"),
});
export type DeleteGroupInput = z.infer<typeof DeleteGroupInput>;

export const AddGroupMemberInput = z.object({
	group_id: z.string().describe("Group ID"),
	user_id: z.string().optional().describe("User ID to add"),
	application_id: z.string().optional().describe("Application ID to add"),
});
export type AddGroupMemberInput = z.infer<typeof AddGroupMemberInput>;

export const RemoveGroupMemberInput = z.object({
	group_id: z.string().describe("Group ID"),
	user_id: z.string().optional().describe("User ID to remove"),
	application_id: z.string().optional().describe("Application ID to remove"),
});
export type RemoveGroupMemberInput = z.infer<typeof RemoveGroupMemberInput>;

// Permission Sets
export const ListPermissionSetsInput = z.object({
	organization_id: z.string().optional().describe("Filter by organization ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: z.string().optional().describe("Order by field"),
});
export type ListPermissionSetsInput = z.infer<typeof ListPermissionSetsInput>;
