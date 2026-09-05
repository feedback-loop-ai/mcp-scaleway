import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import * as handlersModule from "../../../src/tools/iam/handlers.js";
import { getClient, registerIamTools } from "../../../src/tools/iam/index.js";
import * as typesModule from "../../../src/tools/iam/types.js";

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW_TEST_KEY",
		secretKey: "secret-test",
		defaultProjectId: "proj-123",
		defaultOrganizationId: "org-123",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

describe("iam module", () => {
	let server: McpServer;

	beforeEach(() => {
		server = new McpServer({ name: "test", version: "0.0.1" });
		mockFetch.mockReset();
	});

	it("registers without error", () => {
		expect(() => registerIamTools(server)).not.toThrow();
	});

	it("getClient returns a client with fetch", () => {
		const client = getClient();
		expect(client).toBeDefined();
		expect(client.fetch).toBeDefined();
	});
});

describe("iam handlers", () => {
	let mockClient: { fetch: Mock };

	beforeEach(() => {
		mockClient = { fetch: vi.fn() };
	});

	// ── Users ─────────────────────────────────────────────────────────

	describe("handleListUsers", () => {
		it("returns user list on success", async () => {
			const response = { users: [{ id: "usr-1", email: "a@b.com" }], total_count: 1 };
			mockClient.fetch.mockResolvedValue(response);
			const result = await handlersModule.handleListUsers(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect(result.content[0].text).toContain("usr-1");
			expect(mockClient.fetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: "/iam/v1alpha1/users" }),
			);
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleListUsers(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect("isError" in result && result.isError).toBe(true);
		});

		it("passes optional parameters", async () => {
			mockClient.fetch.mockResolvedValue({ users: [], total_count: 0 });
			await handlersModule.handleListUsers(mockClient as never, {
				organization_id: "org-1",
				page: 2,
				page_size: 10,
				order_by: "created_at_asc",
			});
			const call = mockClient.fetch.mock.calls[0][0];
			expect(call.urlParams.get("organization_id")).toBe("org-1");
			expect(call.urlParams.get("page")).toBe("2");
			expect(call.urlParams.get("order_by")).toBe("created_at_asc");
		});
	});

	describe("handleGetUser", () => {
		it("returns user on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "usr-1", email: "a@b.com" });
			const result = await handlersModule.handleGetUser(mockClient as never, {
				user_id: "usr-1",
			});
			expect(result.content[0].text).toContain("usr-1");
			expect(mockClient.fetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "GET", path: "/iam/v1alpha1/users/usr-1" }),
			);
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("not found"));
			const result = await handlersModule.handleGetUser(mockClient as never, {
				user_id: "bad",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreateUser", () => {
		it("creates user on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "usr-new", email: "new@test.com" });
			const result = await handlersModule.handleCreateUser(mockClient as never, {
				organization_id: "org-1",
				email: "new@test.com",
			});
			expect(result.content[0].text).toContain("usr-new");
			expect(mockClient.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/iam/v1alpha1/users",
					headers: { "Content-Type": "application/json" },
					body: expect.stringContaining("new@test.com"),
				}),
			);
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleCreateUser(mockClient as never, {
				organization_id: "org-1",
				email: "x@y.com",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdateUser", () => {
		it("updates user on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "usr-1" });
			const result = await handlersModule.handleUpdateUser(mockClient as never, {
				user_id: "usr-1",
			});
			expect(result.content[0].text).toContain("usr-1");
			expect(mockClient.fetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "PATCH", path: "/iam/v1alpha1/users/usr-1" }),
			);
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleUpdateUser(mockClient as never, {
				user_id: "usr-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteUser", () => {
		it("deletes user on success", async () => {
			mockClient.fetch.mockResolvedValue(undefined);
			const result = await handlersModule.handleDeleteUser(mockClient as never, {
				user_id: "usr-1",
			});
			expect(result.content[0].text).toContain("deleted");
			expect(mockClient.fetch).toHaveBeenCalledWith(
				expect.objectContaining({ method: "DELETE", path: "/iam/v1alpha1/users/usr-1" }),
			);
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleDeleteUser(mockClient as never, {
				user_id: "usr-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// ── Applications ──────────────────────────────────────────────────

	describe("handleListApplications", () => {
		it("returns applications on success", async () => {
			mockClient.fetch.mockResolvedValue({ applications: [], total_count: 0 });
			const result = await handlersModule.handleListApplications(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect(result.content[0].text).toContain("applications");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleListApplications(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleGetApplication", () => {
		it("returns application on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "app-1", name: "test" });
			const result = await handlersModule.handleGetApplication(mockClient as never, {
				application_id: "app-1",
			});
			expect(result.content[0].text).toContain("app-1");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleGetApplication(mockClient as never, {
				application_id: "bad",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreateApplication", () => {
		it("creates application on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "app-new", name: "new-app" });
			const result = await handlersModule.handleCreateApplication(mockClient as never, {
				name: "new-app",
				description: "desc",
			});
			expect(result.content[0].text).toContain("app-new");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleCreateApplication(mockClient as never, {
				name: "x",
				description: "",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdateApplication", () => {
		it("updates application on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "app-1", name: "updated" });
			const result = await handlersModule.handleUpdateApplication(mockClient as never, {
				application_id: "app-1",
				name: "updated",
			});
			expect(result.content[0].text).toContain("updated");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleUpdateApplication(mockClient as never, {
				application_id: "app-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteApplication", () => {
		it("deletes application on success", async () => {
			mockClient.fetch.mockResolvedValue(undefined);
			const result = await handlersModule.handleDeleteApplication(mockClient as never, {
				application_id: "app-1",
			});
			expect(result.content[0].text).toContain("deleted");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleDeleteApplication(mockClient as never, {
				application_id: "app-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// ── API Keys ──────────────────────────────────────────────────────

	describe("handleListApiKeys", () => {
		it("returns api keys on success", async () => {
			mockClient.fetch.mockResolvedValue({ api_keys: [], total_count: 0 });
			const result = await handlersModule.handleListApiKeys(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect(result.content[0].text).toContain("api_keys");
		});

		it("passes filter parameters", async () => {
			mockClient.fetch.mockResolvedValue({ api_keys: [], total_count: 0 });
			await handlersModule.handleListApiKeys(mockClient as never, {
				organization_id: "org-1",
				application_id: "app-1",
				user_id: "usr-1",
				page: 1,
				page_size: 50,
				order_by: "created_at_desc",
			});
			const call = mockClient.fetch.mock.calls[0][0];
			expect(call.urlParams.get("application_id")).toBe("app-1");
			expect(call.urlParams.get("user_id")).toBe("usr-1");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleListApiKeys(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleGetApiKey", () => {
		it("returns api key on success", async () => {
			mockClient.fetch.mockResolvedValue({ access_key: "SCWK123" });
			const result = await handlersModule.handleGetApiKey(mockClient as never, {
				access_key: "SCWK123",
			});
			expect(result.content[0].text).toContain("SCWK123");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleGetApiKey(mockClient as never, {
				access_key: "bad",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreateApiKey", () => {
		it("creates api key on success", async () => {
			mockClient.fetch.mockResolvedValue({
				access_key: "SCWK_NEW",
				secret_key: "secret",
			});
			const result = await handlersModule.handleCreateApiKey(mockClient as never, {
				application_id: "app-1",
				description: "test key",
			});
			expect(result.content[0].text).toContain("SCWK_NEW");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleCreateApiKey(mockClient as never, {
				description: "",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdateApiKey", () => {
		it("updates api key on success", async () => {
			mockClient.fetch.mockResolvedValue({ access_key: "SCWK123", description: "updated" });
			const result = await handlersModule.handleUpdateApiKey(mockClient as never, {
				access_key: "SCWK123",
				description: "updated",
			});
			expect(result.content[0].text).toContain("updated");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleUpdateApiKey(mockClient as never, {
				access_key: "SCWK123",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteApiKey", () => {
		it("deletes api key on success", async () => {
			mockClient.fetch.mockResolvedValue(undefined);
			const result = await handlersModule.handleDeleteApiKey(mockClient as never, {
				access_key: "SCWK123",
			});
			expect(result.content[0].text).toContain("deleted");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleDeleteApiKey(mockClient as never, {
				access_key: "SCWK123",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// ── Policies ──────────────────────────────────────────────────────

	describe("handleListPolicies", () => {
		it("returns policies on success", async () => {
			mockClient.fetch.mockResolvedValue({ policies: [], total_count: 0 });
			const result = await handlersModule.handleListPolicies(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect(result.content[0].text).toContain("policies");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleListPolicies(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleGetPolicy", () => {
		it("returns policy on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "pol-1", name: "admin" });
			const result = await handlersModule.handleGetPolicy(mockClient as never, {
				policy_id: "pol-1",
			});
			expect(result.content[0].text).toContain("pol-1");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleGetPolicy(mockClient as never, {
				policy_id: "bad",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreatePolicy", () => {
		it("creates policy on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "pol-new", name: "new-policy" });
			const result = await handlersModule.handleCreatePolicy(mockClient as never, {
				name: "new-policy",
				description: "desc",
				rules: [{ permission_set_names: ["AllProductsRead"], project_ids: ["proj-1"] }],
			});
			expect(result.content[0].text).toContain("pol-new");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleCreatePolicy(mockClient as never, {
				name: "x",
				description: "",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdatePolicy", () => {
		it("updates policy on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "pol-1", name: "updated" });
			const result = await handlersModule.handleUpdatePolicy(mockClient as never, {
				policy_id: "pol-1",
				name: "updated",
			});
			expect(result.content[0].text).toContain("updated");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleUpdatePolicy(mockClient as never, {
				policy_id: "pol-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeletePolicy", () => {
		it("deletes policy on success", async () => {
			mockClient.fetch.mockResolvedValue(undefined);
			const result = await handlersModule.handleDeletePolicy(mockClient as never, {
				policy_id: "pol-1",
			});
			expect(result.content[0].text).toContain("deleted");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleDeletePolicy(mockClient as never, {
				policy_id: "pol-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// ── Rules ─────────────────────────────────────────────────────────

	describe("handleListRules", () => {
		it("returns rules on success", async () => {
			mockClient.fetch.mockResolvedValue({ rules: [], total_count: 0 });
			const result = await handlersModule.handleListRules(mockClient as never, {
				policy_id: "pol-1",
				page: 1,
				page_size: 50,
			});
			expect(result.content[0].text).toContain("rules");
			const call = mockClient.fetch.mock.calls[0][0];
			expect(call.urlParams.get("policy_id")).toBe("pol-1");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleListRules(mockClient as never, {
				policy_id: "pol-1",
				page: 1,
				page_size: 50,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// The Scaleway IAM API has no per-rule endpoints; create/update/delete are
	// implemented as read (GET /rules?policy_id=) + full-set replace (PUT /rules).
	// Existing rules exercise every toRuleSpec branch: project-scoped, org-scoped,
	// unscoped, and a rule with null permission_set_names.
	const existingRules = [
		{ id: "r1", permission_set_names: ["ReadOnly"], project_ids: ["proj-1"] },
		{ id: "r2", permission_set_names: null, condition: "cond", organization_id: "org-1" },
		{ id: "r3", permission_set_names: ["Other"] },
	];

	describe("handleCreateRule", () => {
		it("appends a rule and PUTs the full set", async () => {
			mockClient.fetch.mockResolvedValueOnce({ rules: existingRules });
			mockClient.fetch.mockResolvedValueOnce({ rules: [...existingRules, { id: "rule-new" }] });
			const result = await handlersModule.handleCreateRule(mockClient as never, {
				policy_id: "pol-1",
				permission_set_names: ["InstancesFullAccess"],
				condition: "expr",
				project_ids: ["proj-2"],
				organization_id: "org-2",
			});
			expect(result.content[0].text).toContain("rule-new");
			const listCall = mockClient.fetch.mock.calls[0][0];
			expect(listCall.method).toBe("GET");
			expect(listCall.urlParams.get("policy_id")).toBe("pol-1");
			const putCall = mockClient.fetch.mock.calls[1][0];
			expect(putCall.method).toBe("PUT");
			expect(putCall.path).toBe("/iam/v1alpha1/rules");
			const body = JSON.parse(putCall.body);
			expect(body.policy_id).toBe("pol-1");
			// 3 existing + 1 new
			expect(body.rules).toHaveLength(4);
			expect(body.rules[3]).toMatchObject({
				permission_set_names: ["InstancesFullAccess"],
				condition: "expr",
				project_ids: ["proj-2"],
				organization_id: "org-2",
			});
		});

		it("appends a minimal rule with defaults when no scope/condition given", async () => {
			mockClient.fetch.mockResolvedValueOnce({});
			mockClient.fetch.mockResolvedValueOnce({ rules: [{ id: "rule-min" }] });
			const result = await handlersModule.handleCreateRule(mockClient as never, {
				policy_id: "pol-1",
				permission_set_names: ["x"],
			});
			expect(result.content[0].text).toContain("rule-min");
			const body = JSON.parse(mockClient.fetch.mock.calls[1][0].body);
			expect(body.rules).toHaveLength(1);
			expect(body.rules[0]).toEqual({ permission_set_names: ["x"], condition: "" });
		});

		it("returns error when listing fails", async () => {
			mockClient.fetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlersModule.handleCreateRule(mockClient as never, {
				policy_id: "pol-1",
				permission_set_names: ["x"],
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdateRule", () => {
		it("replaces the matching rule and PUTs the full set", async () => {
			mockClient.fetch.mockResolvedValueOnce({ rules: existingRules });
			mockClient.fetch.mockResolvedValueOnce({ rules: existingRules });
			const result = await handlersModule.handleUpdateRule(mockClient as never, {
				policy_id: "pol-1",
				rule_id: "r1",
				permission_set_names: ["Updated"],
				condition: "newcond",
				organization_id: "org-9",
			});
			expect(result.content[0].text).toContain("rules");
			const body = JSON.parse(mockClient.fetch.mock.calls[1][0].body);
			expect(body.rules[0]).toMatchObject({
				permission_set_names: ["Updated"],
				condition: "newcond",
				organization_id: "org-9",
			});
			// switching to organization scope clears project_ids
			expect(body.rules[0].project_ids).toBeUndefined();
		});

		it("switches a rule to project scope and clears organization_id", async () => {
			mockClient.fetch.mockResolvedValueOnce({ rules: existingRules });
			mockClient.fetch.mockResolvedValueOnce({ rules: existingRules });
			await handlersModule.handleUpdateRule(mockClient as never, {
				policy_id: "pol-1",
				rule_id: "r2",
				project_ids: ["proj-9"],
			});
			const body = JSON.parse(mockClient.fetch.mock.calls[1][0].body);
			expect(body.rules[1].project_ids).toEqual(["proj-9"]);
			expect(body.rules[1].organization_id).toBeUndefined();
		});

		it("returns error when the rule is not found", async () => {
			mockClient.fetch.mockResolvedValueOnce({ rules: existingRules });
			const result = await handlersModule.handleUpdateRule(mockClient as never, {
				policy_id: "pol-1",
				rule_id: "missing",
			});
			expect("isError" in result && result.isError).toBe(true);
			expect(mockClient.fetch).toHaveBeenCalledTimes(1);
		});

		it("returns error when listing fails", async () => {
			mockClient.fetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlersModule.handleUpdateRule(mockClient as never, {
				policy_id: "pol-1",
				rule_id: "r1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteRule", () => {
		it("removes the rule and PUTs the remaining set", async () => {
			mockClient.fetch.mockResolvedValueOnce({ rules: existingRules });
			mockClient.fetch.mockResolvedValueOnce({ rules: [] });
			const result = await handlersModule.handleDeleteRule(mockClient as never, {
				policy_id: "pol-1",
				rule_id: "r1",
			});
			expect(result.content[0].text).toContain("deleted");
			const body = JSON.parse(mockClient.fetch.mock.calls[1][0].body);
			// r1 removed, r2 and r3 remain as RuleSpecs (no id field)
			expect(body.rules).toHaveLength(2);
		});

		it("returns error when the rule is not found", async () => {
			mockClient.fetch.mockResolvedValueOnce({ rules: existingRules });
			const result = await handlersModule.handleDeleteRule(mockClient as never, {
				policy_id: "pol-1",
				rule_id: "missing",
			});
			expect("isError" in result && result.isError).toBe(true);
			expect(mockClient.fetch).toHaveBeenCalledTimes(1);
		});

		it("returns error when listing fails", async () => {
			mockClient.fetch.mockRejectedValueOnce(new Error("fail"));
			const result = await handlersModule.handleDeleteRule(mockClient as never, {
				policy_id: "pol-1",
				rule_id: "r1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// ── Groups ────────────────────────────────────────────────────────

	describe("handleListGroups", () => {
		it("returns groups on success", async () => {
			mockClient.fetch.mockResolvedValue({ groups: [], total_count: 0 });
			const result = await handlersModule.handleListGroups(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect(result.content[0].text).toContain("groups");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleListGroups(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleGetGroup", () => {
		it("returns group on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "grp-1", name: "devs" });
			const result = await handlersModule.handleGetGroup(mockClient as never, {
				group_id: "grp-1",
			});
			expect(result.content[0].text).toContain("grp-1");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleGetGroup(mockClient as never, {
				group_id: "bad",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreateGroup", () => {
		it("creates group on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "grp-new", name: "new-group" });
			const result = await handlersModule.handleCreateGroup(mockClient as never, {
				name: "new-group",
				description: "desc",
			});
			expect(result.content[0].text).toContain("grp-new");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleCreateGroup(mockClient as never, {
				name: "x",
				description: "",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdateGroup", () => {
		it("updates group on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "grp-1", name: "updated" });
			const result = await handlersModule.handleUpdateGroup(mockClient as never, {
				group_id: "grp-1",
				name: "updated",
			});
			expect(result.content[0].text).toContain("updated");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleUpdateGroup(mockClient as never, {
				group_id: "grp-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteGroup", () => {
		it("deletes group on success", async () => {
			mockClient.fetch.mockResolvedValue(undefined);
			const result = await handlersModule.handleDeleteGroup(mockClient as never, {
				group_id: "grp-1",
			});
			expect(result.content[0].text).toContain("deleted");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleDeleteGroup(mockClient as never, {
				group_id: "grp-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleAddGroupMember", () => {
		it("adds member on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "grp-1", user_ids: ["usr-1"] });
			const result = await handlersModule.handleAddGroupMember(mockClient as never, {
				group_id: "grp-1",
				user_id: "usr-1",
			});
			expect(result.content[0].text).toContain("grp-1");
			expect(mockClient.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/iam/v1alpha1/groups/grp-1/add-member",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleAddGroupMember(mockClient as never, {
				group_id: "grp-1",
				application_id: "app-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleRemoveGroupMember", () => {
		it("removes member on success", async () => {
			mockClient.fetch.mockResolvedValue({ id: "grp-1", user_ids: [] });
			const result = await handlersModule.handleRemoveGroupMember(mockClient as never, {
				group_id: "grp-1",
				user_id: "usr-1",
			});
			expect(result.content[0].text).toContain("grp-1");
			expect(mockClient.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/iam/v1alpha1/groups/grp-1/remove-member",
				}),
			);
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleRemoveGroupMember(mockClient as never, {
				group_id: "grp-1",
				user_id: "usr-1",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// ── Permission Sets ───────────────────────────────────────────────

	describe("handleListPermissionSets", () => {
		it("returns permission sets on success", async () => {
			mockClient.fetch.mockResolvedValue({ permission_sets: [], total_count: 0 });
			const result = await handlersModule.handleListPermissionSets(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect(result.content[0].text).toContain("permission_sets");
		});

		it("returns error on failure", async () => {
			mockClient.fetch.mockRejectedValue(new Error("fail"));
			const result = await handlersModule.handleListPermissionSets(mockClient as never, {
				page: 1,
				page_size: 50,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});
});

describe("iam types", () => {
	it("validates IamUser schema", () => {
		const valid = typesModule.IamUser.safeParse({
			id: "usr-1",
			email: "a@b.com",
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
			organization_id: "org-1",
			status: "active",
			type: "guest",
			mfa: false,
			last_login_at: null,
		});
		expect(valid.success).toBe(true);
	});

	it("validates IamApplication schema", () => {
		const valid = typesModule.IamApplication.safeParse({
			id: "app-1",
			name: "test",
			description: "desc",
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
			organization_id: "org-1",
		});
		expect(valid.success).toBe(true);
	});

	it("validates IamApiKey schema", () => {
		const valid = typesModule.IamApiKey.safeParse({
			access_key: "SCWK123",
			description: "test key",
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		});
		expect(valid.success).toBe(true);
	});

	it("validates IamPolicy schema", () => {
		const valid = typesModule.IamPolicy.safeParse({
			id: "pol-1",
			name: "admin",
			description: "desc",
			organization_id: "org-1",
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
		});
		expect(valid.success).toBe(true);
	});

	it("validates IamRule schema", () => {
		const valid = typesModule.IamRule.safeParse({
			id: "rule-1",
			permission_set_names: ["AllProductsRead"],
			project_ids: ["proj-1"],
			organization_id: "org-1",
		});
		expect(valid.success).toBe(true);
	});

	it("validates IamGroup schema", () => {
		const valid = typesModule.IamGroup.safeParse({
			id: "grp-1",
			name: "devs",
			description: "desc",
			organization_id: "org-1",
			created_at: "2024-01-01T00:00:00Z",
			updated_at: "2024-01-01T00:00:00Z",
			user_ids: ["usr-1"],
			application_ids: [],
		});
		expect(valid.success).toBe(true);
	});

	it("validates IamPermissionSet schema", () => {
		const valid = typesModule.IamPermissionSet.safeParse({
			id: "ps-1",
			name: "AllProductsRead",
			description: "Read access",
		});
		expect(valid.success).toBe(true);
	});

	it("validates ListUsersInput with defaults", () => {
		const parsed = typesModule.ListUsersInput.parse({});
		expect(parsed.page).toBe(1);
		expect(parsed.page_size).toBe(50);
	});

	it("validates CreatePolicyInput with rules", () => {
		const parsed = typesModule.CreatePolicyInput.parse({
			name: "test",
			rules: [
				{
					permission_set_names: ["AllProductsRead"],
					project_ids: ["proj-1"],
					organization_id: "org-1",
				},
			],
		});
		expect(parsed.rules).toHaveLength(1);
	});

	it("validates AddGroupMemberInput", () => {
		const parsed = typesModule.AddGroupMemberInput.parse({
			group_id: "grp-1",
			user_id: "usr-1",
		});
		expect(parsed.group_id).toBe("grp-1");
	});

	it("validates RemoveGroupMemberInput", () => {
		const parsed = typesModule.RemoveGroupMemberInput.parse({
			group_id: "grp-1",
			application_id: "app-1",
		});
		expect(parsed.application_id).toBe("app-1");
	});

	it("validates ListRulesInput", () => {
		const parsed = typesModule.ListRulesInput.parse({ policy_id: "pol-1" });
		expect(parsed.policy_id).toBe("pol-1");
		expect(parsed.page).toBe(1);
	});

	it("validates CreateRuleInput", () => {
		const parsed = typesModule.CreateRuleInput.parse({
			policy_id: "pol-1",
			permission_set_names: ["InstancesFullAccess"],
		});
		expect(parsed.permission_set_names).toHaveLength(1);
	});

	it("validates UpdateRuleInput", () => {
		const parsed = typesModule.UpdateRuleInput.parse({
			policy_id: "pol-1",
			rule_id: "rule-1",
			permission_set_names: ["Updated"],
		});
		expect(parsed.rule_id).toBe("rule-1");
		expect(parsed.policy_id).toBe("pol-1");
	});

	it("validates DeleteRuleInput", () => {
		const parsed = typesModule.DeleteRuleInput.parse({ policy_id: "pol-1", rule_id: "rule-1" });
		expect(parsed.rule_id).toBe("rule-1");
		expect(parsed.policy_id).toBe("pol-1");
	});

	it("validates ListApplicationsInput with defaults", () => {
		const parsed = typesModule.ListApplicationsInput.parse({});
		expect(parsed.page).toBe(1);
	});

	it("validates GetApplicationInput", () => {
		const parsed = typesModule.GetApplicationInput.parse({ application_id: "app-1" });
		expect(parsed.application_id).toBe("app-1");
	});

	it("validates CreateApplicationInput with defaults", () => {
		const parsed = typesModule.CreateApplicationInput.parse({ name: "test" });
		expect(parsed.description).toBe("");
	});

	it("validates UpdateApplicationInput", () => {
		const parsed = typesModule.UpdateApplicationInput.parse({
			application_id: "app-1",
			name: "new",
		});
		expect(parsed.name).toBe("new");
	});

	it("validates DeleteApplicationInput", () => {
		const parsed = typesModule.DeleteApplicationInput.parse({ application_id: "app-1" });
		expect(parsed.application_id).toBe("app-1");
	});

	it("validates ListApiKeysInput with defaults", () => {
		const parsed = typesModule.ListApiKeysInput.parse({});
		expect(parsed.page).toBe(1);
	});

	it("validates GetApiKeyInput", () => {
		const parsed = typesModule.GetApiKeyInput.parse({ access_key: "SCWK123" });
		expect(parsed.access_key).toBe("SCWK123");
	});

	it("validates CreateApiKeyInput with defaults", () => {
		const parsed = typesModule.CreateApiKeyInput.parse({});
		expect(parsed.description).toBe("");
	});

	it("validates UpdateApiKeyInput", () => {
		const parsed = typesModule.UpdateApiKeyInput.parse({
			access_key: "SCWK123",
			description: "updated",
		});
		expect(parsed.description).toBe("updated");
	});

	it("validates DeleteApiKeyInput", () => {
		const parsed = typesModule.DeleteApiKeyInput.parse({ access_key: "SCWK123" });
		expect(parsed.access_key).toBe("SCWK123");
	});

	it("validates ListPoliciesInput with defaults", () => {
		const parsed = typesModule.ListPoliciesInput.parse({});
		expect(parsed.page).toBe(1);
	});

	it("validates GetPolicyInput", () => {
		const parsed = typesModule.GetPolicyInput.parse({ policy_id: "pol-1" });
		expect(parsed.policy_id).toBe("pol-1");
	});

	it("validates CreatePolicyInput with defaults", () => {
		const parsed = typesModule.CreatePolicyInput.parse({ name: "test" });
		expect(parsed.description).toBe("");
	});

	it("validates UpdatePolicyInput", () => {
		const parsed = typesModule.UpdatePolicyInput.parse({ policy_id: "pol-1", name: "new" });
		expect(parsed.name).toBe("new");
	});

	it("validates DeletePolicyInput", () => {
		const parsed = typesModule.DeletePolicyInput.parse({ policy_id: "pol-1" });
		expect(parsed.policy_id).toBe("pol-1");
	});

	it("validates ListGroupsInput with defaults", () => {
		const parsed = typesModule.ListGroupsInput.parse({});
		expect(parsed.page).toBe(1);
	});

	it("validates GetGroupInput", () => {
		const parsed = typesModule.GetGroupInput.parse({ group_id: "grp-1" });
		expect(parsed.group_id).toBe("grp-1");
	});

	it("validates CreateGroupInput with defaults", () => {
		const parsed = typesModule.CreateGroupInput.parse({ name: "test" });
		expect(parsed.description).toBe("");
	});

	it("validates UpdateGroupInput", () => {
		const parsed = typesModule.UpdateGroupInput.parse({ group_id: "grp-1", name: "new" });
		expect(parsed.name).toBe("new");
	});

	it("validates DeleteGroupInput", () => {
		const parsed = typesModule.DeleteGroupInput.parse({ group_id: "grp-1" });
		expect(parsed.group_id).toBe("grp-1");
	});

	it("validates ListPermissionSetsInput with defaults", () => {
		const parsed = typesModule.ListPermissionSetsInput.parse({});
		expect(parsed.page).toBe(1);
	});

	it("validates GetUserInput", () => {
		const parsed = typesModule.GetUserInput.parse({ user_id: "usr-1" });
		expect(parsed.user_id).toBe("usr-1");
	});

	it("validates CreateUserInput", () => {
		const parsed = typesModule.CreateUserInput.parse({
			organization_id: "org-1",
			email: "a@b.com",
		});
		expect(parsed.email).toBe("a@b.com");
	});

	it("validates UpdateUserInput", () => {
		const parsed = typesModule.UpdateUserInput.parse({ user_id: "usr-1" });
		expect(parsed.user_id).toBe("usr-1");
	});

	it("validates DeleteUserInput", () => {
		const parsed = typesModule.DeleteUserInput.parse({ user_id: "usr-1" });
		expect(parsed.user_id).toBe("usr-1");
	});
});

// Spec: specs/scaleway-api/iam/api-reference.md#mcp-identifier-confinement
// Every occurrence is checked, including optional body/query identifiers and rule matching.
describe("IAM input identifier confinement", () => {
	const fields = new Set([
		"user_id",
		"application_id",
		"access_key",
		"policy_id",
		"group_id",
		"rule_id",
	]);
	const identifiers = Object.entries(typesModule)
		.filter(([name]) => name.endsWith("Input"))
		.flatMap(([name, schema]) =>
			Object.entries(schema.shape)
				.filter(([field]) => fields.has(field))
				.map(([field, input]) => ({ name, field, input })),
		);
	const forbidden = [
		"",
		".",
		"..",
		"../groups/group-1",
		"../../../secret-manager/v1beta1/regions/fr-par/secrets/secret-1/versions/1/access",
		"/group-1",
		"user/other",
		"user\\other",
		"..\\groups\\group-1",
		"%2e%2e",
		"%2E%2E%2Fgroups%2Fgroup-1",
		"%252e%252e%252fgroups",
		"user%2fother",
		"user%5cother",
		"user?x=1",
		"user#fragment",
		" user",
		"user ",
		"user\n",
		"user\r\n",
		"user\u2028",
		"user\u2029",
		"usér",
		"user／other",
		"user％2fother",
		...Array.from({ length: 33 }, (_, code) => `user${String.fromCharCode(code)}other`),
		...Array.from({ length: 33 }, (_, code) => `user${String.fromCharCode(127 + code)}other`),
	];
	it("covers every named identifier occurrence", () => {
		expect(identifiers).toHaveLength(37);
		expect(new Set(identifiers.map(({ field }) => field))).toEqual(fields);
	});
	it.each(identifiers)("$name.$field rejects URL syntax without normalization", ({ input }) => {
		for (const value of forbidden)
			expect(input.safeParse(value).success, JSON.stringify(value)).toBe(false);
	});
	it.each(identifiers)("$name.$field preserves honest ASCII IDs", ({ input }) => {
		for (const value of [
			"user-1",
			"app-1",
			"SCWTESTONLY",
			"policy_1",
			"rule.1~",
			"11111111-1111-4111-8111-111111111111",
			"...",
			".user",
			"user..",
			"0",
		])
			expect(input.parse(value)).toBe(value);
	});
	it("preserves optional identifiers and nullable policy principals", () => {
		expect(typesModule.CreateApiKeyInput.parse({})).toEqual({ description: "" });
		expect(
			typesModule.UpdatePolicyInput.parse({
				policy_id: "policy-1",
				user_id: null,
				group_id: null,
				application_id: null,
			}),
		).toEqual({ policy_id: "policy-1", user_id: null, group_id: null, application_id: null });
	});
});
