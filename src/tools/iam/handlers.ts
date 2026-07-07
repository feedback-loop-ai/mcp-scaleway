import type { Client } from "@scaleway/sdk-client";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import type {
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

const IAM_API = "/iam/v1alpha1";

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function buildParams(params: Record<string, unknown>): URLSearchParams {
	const search = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			search.set(key, String(value));
		}
	}
	return search;
}

// ── Users ───────────────────────────────────────────────────────────────

export async function handleListUsers(client: Client, input: ListUsersInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/users`,
			urlParams: buildParams({
				organization_id: input.organization_id,
				page: input.page,
				page_size: input.page_size,
				order_by: input.order_by,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetUser(client: Client, input: GetUserInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/users/${input.user_id}`,
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateUser(client: Client, input: CreateUserInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${IAM_API}/users`,
			body: JSON.stringify({
				organization_id: input.organization_id,
				email: input.email,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateUser(client: Client, input: UpdateUserInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `${IAM_API}/users/${input.user_id}`,
			body: JSON.stringify({}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteUser(client: Client, input: DeleteUserInput) {
	try {
		await client.fetch<unknown>({
			method: "DELETE",
			path: `${IAM_API}/users/${input.user_id}`,
		});
		return jsonResponse({ message: "User deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Applications ────────────────────────────────────────────────────────

export async function handleListApplications(client: Client, input: ListApplicationsInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/applications`,
			urlParams: buildParams({
				organization_id: input.organization_id,
				page: input.page,
				page_size: input.page_size,
				order_by: input.order_by,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetApplication(client: Client, input: GetApplicationInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/applications/${input.application_id}`,
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateApplication(client: Client, input: CreateApplicationInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${IAM_API}/applications`,
			body: JSON.stringify({
				name: input.name,
				organization_id: input.organization_id,
				description: input.description,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateApplication(client: Client, input: UpdateApplicationInput) {
	try {
		const { application_id, ...body } = input;
		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `${IAM_API}/applications/${application_id}`,
			body: JSON.stringify(body),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteApplication(client: Client, input: DeleteApplicationInput) {
	try {
		await client.fetch<unknown>({
			method: "DELETE",
			path: `${IAM_API}/applications/${input.application_id}`,
		});
		return jsonResponse({ message: "Application deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── API Keys ────────────────────────────────────────────────────────────

export async function handleListApiKeys(client: Client, input: ListApiKeysInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/api-keys`,
			urlParams: buildParams({
				organization_id: input.organization_id,
				application_id: input.application_id,
				user_id: input.user_id,
				page: input.page,
				page_size: input.page_size,
				order_by: input.order_by,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetApiKey(client: Client, input: GetApiKeyInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/api-keys/${input.access_key}`,
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateApiKey(client: Client, input: CreateApiKeyInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${IAM_API}/api-keys`,
			body: JSON.stringify({
				application_id: input.application_id,
				user_id: input.user_id,
				description: input.description,
				expires_at: input.expires_at,
				default_project_id: input.default_project_id,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateApiKey(client: Client, input: UpdateApiKeyInput) {
	try {
		const { access_key, ...body } = input;
		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `${IAM_API}/api-keys/${access_key}`,
			body: JSON.stringify(body),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteApiKey(client: Client, input: DeleteApiKeyInput) {
	try {
		await client.fetch<unknown>({
			method: "DELETE",
			path: `${IAM_API}/api-keys/${input.access_key}`,
		});
		return jsonResponse({ message: "API key deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Policies ────────────────────────────────────────────────────────────

export async function handleListPolicies(client: Client, input: ListPoliciesInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/policies`,
			urlParams: buildParams({
				organization_id: input.organization_id,
				page: input.page,
				page_size: input.page_size,
				order_by: input.order_by,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPolicy(client: Client, input: GetPolicyInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/policies/${input.policy_id}`,
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreatePolicy(client: Client, input: CreatePolicyInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${IAM_API}/policies`,
			body: JSON.stringify({
				name: input.name,
				organization_id: input.organization_id,
				description: input.description,
				user_id: input.user_id,
				group_id: input.group_id,
				application_id: input.application_id,
				rules: input.rules,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdatePolicy(client: Client, input: UpdatePolicyInput) {
	try {
		const { policy_id, ...body } = input;
		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `${IAM_API}/policies/${policy_id}`,
			body: JSON.stringify(body),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeletePolicy(client: Client, input: DeletePolicyInput) {
	try {
		await client.fetch<unknown>({
			method: "DELETE",
			path: `${IAM_API}/policies/${input.policy_id}`,
		});
		return jsonResponse({ message: "Policy deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Rules ───────────────────────────────────────────────────────────────

export async function handleListRules(client: Client, input: ListRulesInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/rules`,
			urlParams: buildParams({
				policy_id: input.policy_id,
				page: input.page,
				page_size: input.page_size,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// The Scaleway IAM API exposes only two rule endpoints: `GET /rules?policy_id=`
// (list) and `PUT /rules` (full-set replace via SetRules). There are no per-rule
// create/update/delete endpoints. The tools below therefore implement those
// operations on top of the documented read+set pattern: fetch the policy's
// current rules, apply the requested change to the list, then PUT the whole list
// back. Note: rules scoped to an account root user (account_root_user_id) cannot
// be expressed as RuleSpecs and are preserved only by their project/organization
// scope. A policy is assumed to have at most 100 rules (a single list page).

interface IamRuleObject {
	id?: string;
	permission_set_names?: string[] | null;
	condition?: string;
	project_ids?: string[] | null;
	organization_id?: string | null;
}

interface ListRulesData {
	rules?: IamRuleObject[];
}

interface RuleSpec {
	permission_set_names: string[] | null;
	condition: string;
	project_ids?: string[];
	organization_id?: string;
}

function toRuleSpec(rule: IamRuleObject): RuleSpec {
	const spec: RuleSpec = {
		permission_set_names: rule.permission_set_names ?? null,
		condition: rule.condition ?? "",
	};
	if (rule.project_ids != null) {
		spec.project_ids = rule.project_ids;
	} else if (rule.organization_id != null) {
		spec.organization_id = rule.organization_id;
	}
	return spec;
}

async function fetchPolicyRules(client: Client, policyId: string): Promise<IamRuleObject[]> {
	const data = await client.fetch<ListRulesData>({
		method: "GET",
		path: `${IAM_API}/rules`,
		urlParams: buildParams({ policy_id: policyId, page: 1, page_size: 100 }),
	});
	return data.rules ?? [];
}

function setPolicyRules(client: Client, policyId: string, rules: RuleSpec[]) {
	return client.fetch<unknown>({
		method: "PUT",
		path: `${IAM_API}/rules`,
		body: JSON.stringify({ policy_id: policyId, rules }),
	});
}

export async function handleCreateRule(client: Client, input: CreateRuleInput) {
	try {
		const existing = await fetchPolicyRules(client, input.policy_id);
		const rules = existing.map(toRuleSpec);
		const newRule: RuleSpec = {
			permission_set_names: input.permission_set_names,
			condition: "",
		};
		if (input.condition !== undefined) newRule.condition = input.condition;
		if (input.project_ids !== undefined) newRule.project_ids = input.project_ids;
		if (input.organization_id !== undefined) newRule.organization_id = input.organization_id;
		rules.push(newRule);
		const data = await setPolicyRules(client, input.policy_id, rules);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateRule(client: Client, input: UpdateRuleInput) {
	try {
		const existing = await fetchPolicyRules(client, input.policy_id);
		let found = false;
		const rules = existing.map((rule) => {
			const spec = toRuleSpec(rule);
			if (rule.id === input.rule_id) {
				found = true;
				if (input.permission_set_names !== undefined)
					spec.permission_set_names = input.permission_set_names;
				if (input.condition !== undefined) spec.condition = input.condition;
				if (input.project_ids !== undefined) {
					spec.project_ids = input.project_ids;
					spec.organization_id = undefined;
				}
				if (input.organization_id !== undefined) {
					spec.organization_id = input.organization_id;
					spec.project_ids = undefined;
				}
			}
			return spec;
		});
		if (!found) {
			throw new Error(`Rule ${input.rule_id} not found in policy ${input.policy_id}`);
		}
		const data = await setPolicyRules(client, input.policy_id, rules);
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteRule(client: Client, input: DeleteRuleInput) {
	try {
		const existing = await fetchPolicyRules(client, input.policy_id);
		const remaining = existing.filter((rule) => rule.id !== input.rule_id);
		if (remaining.length === existing.length) {
			throw new Error(`Rule ${input.rule_id} not found in policy ${input.policy_id}`);
		}
		await setPolicyRules(client, input.policy_id, remaining.map(toRuleSpec));
		return jsonResponse({ message: "Rule deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Groups ──────────────────────────────────────────────────────────────

export async function handleListGroups(client: Client, input: ListGroupsInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/groups`,
			urlParams: buildParams({
				organization_id: input.organization_id,
				page: input.page,
				page_size: input.page_size,
				order_by: input.order_by,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetGroup(client: Client, input: GetGroupInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/groups/${input.group_id}`,
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateGroup(client: Client, input: CreateGroupInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${IAM_API}/groups`,
			body: JSON.stringify({
				name: input.name,
				organization_id: input.organization_id,
				description: input.description,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateGroup(client: Client, input: UpdateGroupInput) {
	try {
		const { group_id, ...body } = input;
		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `${IAM_API}/groups/${group_id}`,
			body: JSON.stringify(body),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteGroup(client: Client, input: DeleteGroupInput) {
	try {
		await client.fetch<unknown>({
			method: "DELETE",
			path: `${IAM_API}/groups/${input.group_id}`,
		});
		return jsonResponse({ message: "Group deleted successfully" });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleAddGroupMember(client: Client, input: AddGroupMemberInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${IAM_API}/groups/${input.group_id}/add-member`,
			body: JSON.stringify({
				user_id: input.user_id,
				application_id: input.application_id,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRemoveGroupMember(client: Client, input: RemoveGroupMemberInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${IAM_API}/groups/${input.group_id}/remove-member`,
			body: JSON.stringify({
				user_id: input.user_id,
				application_id: input.application_id,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Permission Sets ─────────────────────────────────────────────────────

export async function handleListPermissionSets(client: Client, input: ListPermissionSetsInput) {
	try {
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${IAM_API}/permission-sets`,
			urlParams: buildParams({
				organization_id: input.organization_id,
				page: input.page,
				page_size: input.page_size,
				order_by: input.order_by,
			}),
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
