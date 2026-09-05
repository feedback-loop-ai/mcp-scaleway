/**
 * Contract tests for Scaleway IAM API
 *
 * Validates request/response shapes against specs/scaleway-api/iam/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API base: https://api.scaleway.com/iam/v1alpha1
 */
import { type Client, createAdvancedClient, withProfile } from "@scaleway/sdk-client";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import * as httpHandlers from "../../../src/tools/iam/handlers.js";
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
	IamApiKey,
	IamApplication,
	IamGroup,
	IamPermissionSet,
	IamPolicy,
	IamRule,
	IamUser,
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
} from "../../../src/tools/iam/types.js";

// --- Shared fixtures ---

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const ACCESS_KEY = "SCWXXXXXXXXXXXXXXXXX";

const validUser = {
	id: VALID_UUID,
	email: "user@example.com",
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	organization_id: VALID_UUID,
	status: "activated",
	type: "member",
	mfa: false,
	last_login_at: null,
};

const validApplication = {
	id: VALID_UUID,
	name: "my-app",
	description: "an application",
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	organization_id: VALID_UUID,
};

const validApiKey = {
	access_key: ACCESS_KEY,
	secret_key: "secret-value",
	application_id: VALID_UUID,
	user_id: null,
	description: "ci key",
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	expires_at: null,
	default_project_id: VALID_UUID,
};

const validPolicy = {
	id: VALID_UUID,
	name: "my-policy",
	description: "a policy",
	organization_id: VALID_UUID,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	user_id: null,
	group_id: null,
	application_id: VALID_UUID,
	nb_rules: 2,
	nb_scopes: 1,
	nb_permission_sets: 3,
};

const validGroup = {
	id: VALID_UUID,
	name: "my-group",
	description: "a group",
	organization_id: VALID_UUID,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	user_ids: [VALID_UUID],
	application_ids: [],
};

const validRule = {
	id: VALID_UUID,
	permission_set_names: ["AllProductsFullAccess"],
	project_ids: [VALID_UUID],
	organization_id: VALID_UUID,
};

const validPermissionSet = {
	id: VALID_UUID,
	name: "AllProductsFullAccess",
	description: "Full access to all products",
	categories: ["compute", "storage"],
};

// --- Entity contracts ---

/**
 * API: GET /iam/v1alpha1/users, /users/{user_id}
 * Spec: specs/scaleway-api/iam/api-reference.md#users
 */
describe("contract: IamUser entity", () => {
	it("validates a user object", () => {
		expect(() => IamUser.parse(validUser)).not.toThrow();
	});

	it("validates a user without last_login_at", () => {
		const { last_login_at, ...rest } = validUser;
		expect(() => IamUser.parse(rest)).not.toThrow();
	});

	it("rejects a user missing email", () => {
		const { email, ...rest } = validUser;
		expect(() => IamUser.parse(rest)).toThrow();
	});

	const ListUsersResponse = z.object({ users: z.array(IamUser), total_count: z.number().int() });

	it("validates list users response", () => {
		expect(() => ListUsersResponse.parse({ users: [validUser], total_count: 1 })).not.toThrow();
	});
});

/**
 * API: GET /iam/v1alpha1/applications
 * Spec: specs/scaleway-api/iam/api-reference.md#applications
 */
describe("contract: IamApplication entity", () => {
	it("validates an application object", () => {
		expect(() => IamApplication.parse(validApplication)).not.toThrow();
	});

	const ListApplicationsResponse = z.object({
		applications: z.array(IamApplication),
		total_count: z.number().int(),
	});

	it("validates list applications response", () => {
		expect(() =>
			ListApplicationsResponse.parse({ applications: [validApplication], total_count: 1 }),
		).not.toThrow();
	});
});

/**
 * API: GET /iam/v1alpha1/api-keys
 * Spec: specs/scaleway-api/iam/api-reference.md#api-keys
 */
describe("contract: IamApiKey entity", () => {
	it("validates an api key object", () => {
		expect(() => IamApiKey.parse(validApiKey)).not.toThrow();
	});

	it("validates an api key without secret_key (list response)", () => {
		const { secret_key, ...rest } = validApiKey;
		expect(() => IamApiKey.parse(rest)).not.toThrow();
	});

	const ListApiKeysResponse = z.object({
		api_keys: z.array(IamApiKey),
		total_count: z.number().int(),
	});

	it("validates list api keys response", () => {
		expect(() =>
			ListApiKeysResponse.parse({ api_keys: [validApiKey], total_count: 1 }),
		).not.toThrow();
	});
});

/**
 * API: GET /iam/v1alpha1/policies
 * Spec: specs/scaleway-api/iam/api-reference.md#policies
 */
describe("contract: IamPolicy entity", () => {
	it("validates a policy object", () => {
		expect(() => IamPolicy.parse(validPolicy)).not.toThrow();
	});

	it("validates a policy without count fields", () => {
		const { nb_rules, nb_scopes, nb_permission_sets, ...rest } = validPolicy;
		expect(() => IamPolicy.parse(rest)).not.toThrow();
	});

	const ListPoliciesResponse = z.object({
		policies: z.array(IamPolicy),
		total_count: z.number().int(),
	});

	it("validates list policies response", () => {
		expect(() =>
			ListPoliciesResponse.parse({ policies: [validPolicy], total_count: 1 }),
		).not.toThrow();
	});
});

/**
 * API: GET /iam/v1alpha1/groups
 * Spec: specs/scaleway-api/iam/api-reference.md#groups
 */
describe("contract: IamGroup entity", () => {
	it("validates a group object", () => {
		expect(() => IamGroup.parse(validGroup)).not.toThrow();
	});

	const ListGroupsResponse = z.object({ groups: z.array(IamGroup), total_count: z.number().int() });

	it("validates list groups response", () => {
		expect(() => ListGroupsResponse.parse({ groups: [validGroup], total_count: 1 })).not.toThrow();
	});
});

/**
 * API: GET /iam/v1alpha1/rules
 * Spec: specs/scaleway-api/iam/api-reference.md#rules
 */
describe("contract: IamRule entity", () => {
	it("validates a rule object", () => {
		expect(() => IamRule.parse(validRule)).not.toThrow();
	});

	const ListRulesResponse = z.object({ rules: z.array(IamRule), total_count: z.number().int() });

	it("validates list rules response", () => {
		expect(() => ListRulesResponse.parse({ rules: [validRule], total_count: 1 })).not.toThrow();
	});
});

/**
 * API: GET /iam/v1alpha1/permission-sets
 * Spec: specs/scaleway-api/iam/api-reference.md#permission-sets
 */
describe("contract: IamPermissionSet entity", () => {
	it("validates a permission set object", () => {
		expect(() => IamPermissionSet.parse(validPermissionSet)).not.toThrow();
	});

	it("validates a permission set without categories", () => {
		const { categories, ...rest } = validPermissionSet;
		expect(() => IamPermissionSet.parse(rest)).not.toThrow();
	});

	const ListPermissionSetsResponse = z.object({
		permission_sets: z.array(IamPermissionSet),
		total_count: z.number().int(),
	});

	it("validates list permission sets response", () => {
		expect(() =>
			ListPermissionSetsResponse.parse({ permission_sets: [validPermissionSet], total_count: 1 }),
		).not.toThrow();
	});
});

// --- Request shape contracts: Users ---

describe("contract: Users request shapes", () => {
	it("validates list with defaults", () => {
		const result = ListUsersInput.parse({});
		expect(result.page).toBe(1);
		expect(result.page_size).toBe(50);
	});

	it("validates list with filters", () => {
		expect(() =>
			ListUsersInput.parse({
				organization_id: VALID_UUID,
				order_by: "created_at_asc",
				page: 2,
				page_size: 10,
			}),
		).not.toThrow();
	});

	it("validates get/update/delete", () => {
		expect(() => GetUserInput.parse({ user_id: VALID_UUID })).not.toThrow();
		expect(() => UpdateUserInput.parse({ user_id: VALID_UUID })).not.toThrow();
		expect(() => DeleteUserInput.parse({ user_id: VALID_UUID })).not.toThrow();
	});

	it("validates create", () => {
		expect(() =>
			CreateUserInput.parse({ organization_id: VALID_UUID, email: "u@example.com" }),
		).not.toThrow();
	});

	it("rejects create without email", () => {
		expect(() => CreateUserInput.parse({ organization_id: VALID_UUID })).toThrow();
	});
});

// --- Request shape contracts: Applications ---

describe("contract: Applications request shapes", () => {
	it("validates list", () => {
		expect(() => ListApplicationsInput.parse({ organization_id: VALID_UUID })).not.toThrow();
	});

	it("validates create with description default", () => {
		const result = CreateApplicationInput.parse({ name: "app" });
		expect(result.description).toBe("");
	});

	it("validates update/get/delete", () => {
		expect(() => GetApplicationInput.parse({ application_id: VALID_UUID })).not.toThrow();
		expect(() =>
			UpdateApplicationInput.parse({ application_id: VALID_UUID, name: "x", description: "y" }),
		).not.toThrow();
		expect(() => DeleteApplicationInput.parse({ application_id: VALID_UUID })).not.toThrow();
	});
});

// --- Request shape contracts: API Keys ---

describe("contract: API Keys request shapes", () => {
	it("validates list with all filters", () => {
		expect(() =>
			ListApiKeysInput.parse({
				organization_id: VALID_UUID,
				application_id: VALID_UUID,
				user_id: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("validates create for application", () => {
		const result = CreateApiKeyInput.parse({ application_id: VALID_UUID });
		expect(result.description).toBe("");
	});

	it("validates create for user with expiry", () => {
		expect(() =>
			CreateApiKeyInput.parse({
				user_id: VALID_UUID,
				expires_at: "2026-01-01T00:00:00Z",
				default_project_id: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("validates get/update/delete by access_key", () => {
		expect(() => GetApiKeyInput.parse({ access_key: ACCESS_KEY })).not.toThrow();
		expect(() =>
			UpdateApiKeyInput.parse({
				access_key: ACCESS_KEY,
				description: "d",
				default_project_id: VALID_UUID,
			}),
		).not.toThrow();
		expect(() => DeleteApiKeyInput.parse({ access_key: ACCESS_KEY })).not.toThrow();
	});
});

// --- Request shape contracts: Policies ---

describe("contract: Policies request shapes", () => {
	it("validates list", () => {
		expect(() => ListPoliciesInput.parse({ organization_id: VALID_UUID })).not.toThrow();
	});

	it("validates create with rules", () => {
		const input = {
			name: "p",
			organization_id: VALID_UUID,
			user_id: VALID_UUID,
			rules: [{ permission_set_names: ["AllProductsFullAccess"], project_ids: [VALID_UUID] }],
		};
		expect(() => CreatePolicyInput.parse(input)).not.toThrow();
	});

	it("validates update with nullable principals", () => {
		expect(() =>
			UpdatePolicyInput.parse({
				policy_id: VALID_UUID,
				user_id: null,
				group_id: null,
				application_id: null,
			}),
		).not.toThrow();
	});

	it("validates get/delete", () => {
		expect(() => GetPolicyInput.parse({ policy_id: VALID_UUID })).not.toThrow();
		expect(() => DeletePolicyInput.parse({ policy_id: VALID_UUID })).not.toThrow();
	});
});

// --- Request shape contracts: Rules ---

describe("contract: Rules request shapes", () => {
	it("validates list rules by policy", () => {
		expect(() => ListRulesInput.parse({ policy_id: VALID_UUID })).not.toThrow();
	});

	it("rejects list rules without policy_id", () => {
		expect(() => ListRulesInput.parse({})).toThrow();
	});

	it("validates create rule", () => {
		expect(() =>
			CreateRuleInput.parse({
				policy_id: VALID_UUID,
				permission_set_names: ["AllProductsFullAccess"],
				project_ids: [VALID_UUID],
			}),
		).not.toThrow();
	});

	it("validates update/delete rule (policy_id required for read+set)", () => {
		expect(() =>
			UpdateRuleInput.parse({
				policy_id: VALID_UUID,
				rule_id: VALID_UUID,
				permission_set_names: ["x"],
			}),
		).not.toThrow();
		expect(() =>
			DeleteRuleInput.parse({ policy_id: VALID_UUID, rule_id: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects update/delete rule without policy_id", () => {
		expect(() => UpdateRuleInput.parse({ rule_id: VALID_UUID })).toThrow();
		expect(() => DeleteRuleInput.parse({ rule_id: VALID_UUID })).toThrow();
	});
});

// --- Request shape contracts: Groups ---

describe("contract: Groups request shapes", () => {
	it("validates list", () => {
		expect(() => ListGroupsInput.parse({ organization_id: VALID_UUID })).not.toThrow();
	});

	it("validates create with description default", () => {
		const result = CreateGroupInput.parse({ name: "g" });
		expect(result.description).toBe("");
	});

	it("validates get/update/delete", () => {
		expect(() => GetGroupInput.parse({ group_id: VALID_UUID })).not.toThrow();
		expect(() => UpdateGroupInput.parse({ group_id: VALID_UUID, name: "x" })).not.toThrow();
		expect(() => DeleteGroupInput.parse({ group_id: VALID_UUID })).not.toThrow();
	});

	it("validates add/remove member (user or application)", () => {
		expect(() =>
			AddGroupMemberInput.parse({ group_id: VALID_UUID, user_id: VALID_UUID }),
		).not.toThrow();
		expect(() =>
			AddGroupMemberInput.parse({ group_id: VALID_UUID, application_id: VALID_UUID }),
		).not.toThrow();
		expect(() =>
			RemoveGroupMemberInput.parse({ group_id: VALID_UUID, user_id: VALID_UUID }),
		).not.toThrow();
	});
});

// --- Request shape contracts: Permission sets ---

describe("contract: Permission sets request shape", () => {
	it("validates list with defaults", () => {
		const result = ListPermissionSetsInput.parse({});
		expect(result.page).toBe(1);
		expect(result.page_size).toBe(50);
	});
});

// --- Pagination contract ---

describe("contract: pagination bounds", () => {
	it("rejects page_size over 100", () => {
		expect(() => ListUsersInput.parse({ page_size: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListUsersInput.parse({ page: 0 })).toThrow();
	});

	it("rejects page_size below 1", () => {
		expect(() => ListGroupsInput.parse({ page_size: 0 })).toThrow();
	});
});

// Exercise the installed SDK's Request construction, JSON parsing, and real HTTP errors.
// Only the HTTP transport is replaced: no environment credentials or network calls.
describe("SDK HTTP request contracts", () => {
	function recordingClient(
		response: unknown = { id: "http-response", status: "ready" },
		status = 200,
	) {
		const requests: Request[] = [];
		const client = createAdvancedClient(
			withProfile({
				accessKey: "SCWXXXXXXXXXXXXXXXXX",
				secretKey: "00000000-0000-0000-0000-000000000000",
			}),
			(settings) => ({
				...settings,
				apiURL: "https://scaleway.invalid",
				httpClient: (async (input: RequestInfo | URL, init?: RequestInit) => {
					requests.push(new Request(input, init));
					return new Response(status === 204 ? null : JSON.stringify(response), {
						status,
						headers: { "Content-Type": "application/json" },
					});
				}) as typeof fetch,
			}),
		);
		return { client, requests };
	}

	const jsonCases = [
		{
			name: "CreateUser",
			method: "POST",
			path: "/iam/v1alpha1/users",
			call: (client: Client) =>
				httpHandlers.handleCreateUser(client, {
					organization_id: "11111111-1111-1111-1111-111111111111",
					email: "user@example.test",
				}),
			body: { organization_id: "11111111-1111-1111-1111-111111111111", email: "user@example.test" },
		},
		{
			name: "UpdateUser",
			method: "PATCH",
			path: "/iam/v1alpha1/users/11111111-1111-1111-1111-111111111111",
			call: (client: Client) =>
				httpHandlers.handleUpdateUser(client, { user_id: "11111111-1111-1111-1111-111111111111" }),
			body: {},
		},
		{
			name: "CreateApplication",
			method: "POST",
			path: "/iam/v1alpha1/applications",
			call: (client: Client) =>
				httpHandlers.handleCreateApplication(client, {
					organization_id: "11111111-1111-1111-1111-111111111111",
					name: "test",
					description: "",
				}),
			body: {
				organization_id: "11111111-1111-1111-1111-111111111111",
				name: "test",
				description: "",
			},
		},
		{
			name: "UpdateApplication",
			method: "PATCH",
			path: "/iam/v1alpha1/applications/11111111-1111-1111-1111-111111111111",
			call: (client: Client) =>
				httpHandlers.handleUpdateApplication(client, {
					application_id: "11111111-1111-1111-1111-111111111111",
					description: "",
				}),
			body: { description: "" },
		},
		{
			name: "CreateApiKey",
			method: "POST",
			path: "/iam/v1alpha1/api-keys",
			call: (client: Client) =>
				httpHandlers.handleCreateApiKey(client, {
					application_id: "11111111-1111-1111-1111-111111111111",
					description: "test",
				}),
			body: { application_id: "11111111-1111-1111-1111-111111111111", description: "test" },
		},
		{
			name: "UpdateApiKey",
			method: "PATCH",
			path: "/iam/v1alpha1/api-keys/SCWTESTONLY",
			call: (client: Client) =>
				httpHandlers.handleUpdateApiKey(client, { access_key: "SCWTESTONLY", description: "" }),
			body: { description: "" },
		},
		{
			name: "CreatePolicy",
			method: "POST",
			path: "/iam/v1alpha1/policies",
			call: (client: Client) =>
				httpHandlers.handleCreatePolicy(client, {
					organization_id: "11111111-1111-1111-1111-111111111111",
					name: "test",
					description: "",
					application_id: "11111111-1111-1111-1111-111111111111",
					rules: [],
				}),
			body: {
				organization_id: "11111111-1111-1111-1111-111111111111",
				name: "test",
				description: "",
				application_id: "11111111-1111-1111-1111-111111111111",
				rules: [],
			},
		},
		{
			name: "UpdatePolicy",
			method: "PATCH",
			path: "/iam/v1alpha1/policies/11111111-1111-1111-1111-111111111111",
			call: (client: Client) =>
				httpHandlers.handleUpdatePolicy(client, {
					policy_id: "11111111-1111-1111-1111-111111111111",
					user_id: null,
					group_id: null,
					application_id: "11111111-1111-1111-1111-111111111111",
				}),
			body: {
				user_id: null,
				group_id: null,
				application_id: "11111111-1111-1111-1111-111111111111",
			},
		},
		{
			name: "CreateGroup",
			method: "POST",
			path: "/iam/v1alpha1/groups",
			call: (client: Client) =>
				httpHandlers.handleCreateGroup(client, {
					organization_id: "11111111-1111-1111-1111-111111111111",
					name: "test",
					description: "",
				}),
			body: {
				organization_id: "11111111-1111-1111-1111-111111111111",
				name: "test",
				description: "",
			},
		},
		{
			name: "UpdateGroup",
			method: "PATCH",
			path: "/iam/v1alpha1/groups/11111111-1111-1111-1111-111111111111",
			call: (client: Client) =>
				httpHandlers.handleUpdateGroup(client, {
					group_id: "11111111-1111-1111-1111-111111111111",
					description: "",
				}),
			body: { description: "" },
		},
		{
			name: "AddGroupMember",
			method: "POST",
			path: "/iam/v1alpha1/groups/11111111-1111-1111-1111-111111111111/add-member",
			call: (client: Client) =>
				httpHandlers.handleAddGroupMember(client, {
					group_id: "11111111-1111-1111-1111-111111111111",
					user_id: "11111111-1111-1111-1111-111111111111",
				}),
			body: { user_id: "11111111-1111-1111-1111-111111111111" },
		},
		{
			name: "RemoveGroupMember",
			method: "POST",
			path: "/iam/v1alpha1/groups/11111111-1111-1111-1111-111111111111/remove-member",
			call: (client: Client) =>
				httpHandlers.handleRemoveGroupMember(client, {
					group_id: "11111111-1111-1111-1111-111111111111",
					application_id: "11111111-1111-1111-1111-111111111111",
				}),
			body: { application_id: "11111111-1111-1111-1111-111111111111" },
		},
	];

	it.each(jsonCases)(
		"$name: $method $path sends application/json",
		async ({ call, method, path, body }) => {
			const response = { id: "http-response", status: "ready" };
			const { client, requests } = recordingClient(response);
			const result = await call(client);
			expect(requests).toHaveLength(1);
			const [request] = requests;
			expect(request.url).toBe(`https://scaleway.invalid${path}`);
			expect(request.method).toBe(method);
			expect(request.headers.get("Content-Type")).toBe("application/json");
			expect(request.headers.get("Accept")).toBe("application/json");
			expect(request.headers.get("X-Auth-Token")).toBe("00000000-0000-0000-0000-000000000000");
			expect(JSON.parse(await request.text())).toEqual(body);
			expect(result).toEqual({
				content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
			});
		},
	);

	it.each([
		[400, "invalid_input"],
		[401, "permission_denied"],
		[403, "permission_denied"],
		[404, "not_found"],
		[429, "rate_limited"],
		[500, "server_error"],
	] as const)("maps SDK HTTP %i errors to %s", async (status, type) => {
		const { client, requests } = recordingClient({ message: "HTTP contract error" }, status);
		const result = await jsonCases[0].call(client);
		expect(requests).toHaveLength(1);
		expect(result).toMatchObject({ isError: true });
		expect(JSON.parse(result.content[0].text)).toMatchObject({
			error: { type, statusCode: status },
		});
	});

	// API: GET /iam/v1alpha1/rules then PUT /iam/v1alpha1/rules (SetRules).
	// The three rule tools share the one JSON writer; preserve the other rule's scope.
	it.each(["create", "update", "delete"] as const)(
		"%s rule sends JSON through the SDK SetRules request",
		async (operation) => {
			const preserved = {
				permission_set_names: ["InstanceReadOnly"],
				project_ids: [VALID_UUID],
				condition: "",
			};
			const target = {
				permission_set_names: ["VPCReadOnly"],
				organization_id: VALID_UUID,
				condition: "",
			};
			const response = {
				rules: [
					{ id: "preserved", ...preserved },
					{ id: "target", ...target },
				],
				total_count: 2,
			};
			const { client, requests } = recordingClient(response);
			const result =
				operation === "create"
					? await httpHandlers.handleCreateRule(client, {
							policy_id: VALID_UUID,
							permission_set_names: ["InstanceFullAccess"],
							project_ids: [],
						})
					: operation === "update"
						? await httpHandlers.handleUpdateRule(client, {
								policy_id: VALID_UUID,
								rule_id: "target",
								permission_set_names: ["InstanceFullAccess"],
								project_ids: [],
							})
						: await httpHandlers.handleDeleteRule(client, {
								policy_id: VALID_UUID,
								rule_id: "target",
							});
			expect(requests).toHaveLength(2);
			const [get, put] = requests;
			expect(get.method).toBe("GET");
			const url = new URL(get.url);
			expect(url.origin + url.pathname).toBe("https://scaleway.invalid/iam/v1alpha1/rules");
			expect(Object.fromEntries(url.searchParams)).toEqual({
				policy_id: VALID_UUID,
				page: "1",
				page_size: "100",
			});
			expect(get.body).toBeNull();
			expect(put.method).toBe("PUT");
			expect(put.url).toBe("https://scaleway.invalid/iam/v1alpha1/rules");
			expect(put.headers.get("Content-Type")).toBe("application/json");
			expect(put.headers.get("Accept")).toBe("application/json");
			expect(put.headers.get("X-Auth-Token")).toBe("00000000-0000-0000-0000-000000000000");
			const changed = {
				permission_set_names: ["InstanceFullAccess"],
				project_ids: [],
				condition: "",
			};
			const rules =
				operation === "create"
					? [preserved, target, changed]
					: operation === "update"
						? [preserved, changed]
						: [preserved];
			expect(JSON.parse(await put.text())).toEqual({ policy_id: VALID_UUID, rules });
			expect(JSON.parse(result.content[0].text)).toEqual(
				operation === "delete" ? { message: "Rule deleted successfully" } : response,
			);
		},
	);
});
