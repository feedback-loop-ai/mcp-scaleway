/**
 * MCP contract: specs/scaleway-api/iam/api-reference.md#mcp-identifier-confinement.
 * API: GET /iam/v1alpha1/{users,applications,api-keys,policies}/{identifier}; GET /rules.
 * Also covers group/member and rule mutations documented in the same reference.
 * Real createServer, registry, schemas, handlers and SDK; only HTTP is replaced.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createServer } from "../../src/server.js";
import { resetClient } from "../../src/shared/client.js";
import type { ServerMode } from "../../src/shared/mode.js";
import type { ToolsetConfig } from "../../src/shared/toolsets.js";
import { getClient } from "../../src/tools/iam/index.js";
import { connect, textJson } from "../unit/gateway/fixtures.js";

const UUID = "11111111-1111-4111-8111-111111111111";
const attacks = [
	`../groups/${UUID}`,
	`../../../secret-manager/v1beta1/regions/fr-par/secrets/${UUID}/versions/1/access`,
	`..\\groups\\${UUID}`,
	`%2e%2e%2fgroups%2f${UUID}`,
	`%2E%2E%2Fgroups%2F${UUID}`,
	`%252e%252e%252fgroups%252f${UUID}`,
	`user-1/../../groups/${UUID}`,
	"user-1%5cother",
	"user-1?x=1",
	"user-1#fragment",
	"",
	".",
	"..",
	"user-1\n",
	"user-1\r\n",
	"user-1\t",
	"user-1\0",
	"user-1\x7f",
];
const reads = [
	{ op: "iam_get_user", field: "user_id", id: "user-1", path: "/users/user-1" },
	{ op: "iam_get_application", field: "application_id", id: "app-1", path: "/applications/app-1" },
	{ op: "iam_get_api_key", field: "access_key", id: "SCWTESTONLY", path: "/api-keys/SCWTESTONLY" },
	{ op: "iam_get_policy", field: "policy_id", id: "policy-1", path: "/policies/policy-1" },
	{ op: "iam_list_rules", field: "policy_id", id: "policy-1", path: "/rules" },
];
const filters: ToolsetConfig = {
	toolsets: ["iam"],
	readOnly: true,
	excludeTools: ["iam_get_group"],
};
// The SDK captures fetch at module evaluation. Explicitly inject the transport
// as well as stubbing globals, so cached SDK modules cannot retain real fetch.
const blockedFetch = vi.hoisted(() => {
	const forbidden = () => {
		throw new Error("Unexpected HTTP request: network is forbidden in IAM confinement tests");
	};
	return Object.assign(
		vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(forbidden),
		{ preconnect: forbidden },
	);
});
vi.mock("@scaleway/sdk-client", async (importOriginal) => {
	const sdk = await importOriginal<typeof import("@scaleway/sdk-client")>();
	return {
		...sdk,
		createClient: (profile: Parameters<typeof sdk.createClient>[0]) =>
			sdk.createAdvancedClient(sdk.withProfile(profile ?? {}), sdk.withHTTPClient(blockedFetch)),
	};
});

function calls(mode: ServerMode, op: string, params: Record<string, unknown>, readOnly = true) {
	const gateway = [
		{ name: "scaleway_call", arguments: { op, params } },
		...(readOnly ? [{ name: "scaleway_read", arguments: { op, params } }] : []),
	];
	const flat = { name: `scaleway_${op}`, arguments: params };
	return mode === "flat" ? [flat] : mode === "gateway" ? gateway : [...gateway, flat];
}

beforeEach(() => {
	resetClient();
	blockedFetch.mockReset();
	vi.stubGlobal("fetch", blockedFetch);
	vi.stubEnv("SCW_ACCESS_KEY", "SCWXXXXXXXXXXXXXXXXX");
	vi.stubEnv("SCW_SECRET_KEY", UUID);
	vi.stubEnv("SCW_DEFAULT_PROJECT_ID", UUID);
	vi.stubEnv("SCW_DEFAULT_ORGANIZATION_ID", UUID);
	vi.stubEnv("SCW_DEFAULT_REGION", "fr-par");
	vi.stubEnv("SCW_DEFAULT_ZONE", "fr-par-1");
});
afterEach(() => {
	resetClient();
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});

it("uses a fail-closed HTTP transport in the actual IAM SDK client", async () => {
	const sdk = getClient();
	expect(sdk.settings.httpClient).toBe(blockedFetch);
	await expect(sdk.fetch({ method: "GET", path: "/iam/v1alpha1/users/user-1" })).rejects.toThrow(
		"network is forbidden",
	);
	expect(blockedFetch).toHaveBeenCalledOnce();
});

function reply(data: unknown) {
	blockedFetch.mockResolvedValueOnce(
		new Response(JSON.stringify(data), {
			headers: { "Content-Type": "application/json" },
		}),
	);
}

function lastRequest() {
	const [input, init] = blockedFetch.mock.calls[blockedFetch.mock.calls.length - 1];
	return new Request(input, init);
}

describe.each(["gateway", "flat", "both"] as const)("IAM confinement over MCP (%s)", (mode) => {
	it("rejects endpoint escapes before HTTP even when a read tool is allowed", async () => {
		const instance = createServer({ mode, filters });
		const client = await connect(instance);
		try {
			const listed = (await client.listTools()).tools.map(({ name }) => name);
			expect(listed).not.toContain("scaleway_iam_get_group");
			expect(listed).not.toContain("scaleway_iam_update_user");
			for (const { op, field } of reads) {
				for (const value of attacks) {
					for (const call of calls(mode, op, { [field]: value })) {
						const result = await client.callTool(call);
						expect(result.isError, `${op}.${field} ${JSON.stringify(value)}`).toBe(true);
						expect(JSON.stringify(result)).toMatch(/invalid/i);
						expect(blockedFetch).not.toHaveBeenCalled();
					}
				}
			}
			// Direct aliases cannot bypass the same exclusion/toolset/read-only filters.
			for (const op of [
				"iam_get_group",
				"iam_update_user",
				"secret_manager_access_secret_version",
			]) {
				for (const call of calls(mode, op, {
					group_id: UUID,
					user_id: UUID,
					secretId: UUID,
					revision: "1",
				}))
					expect((await client.callTool(call)).isError).toBe(true);
			}
			expect(blockedFetch).not.toHaveBeenCalled();
		} finally {
			await client.close();
			await instance.close();
		}
	});

	it("accepts honest IDs and sends only the original IAM GET endpoint", async () => {
		const instance = createServer({ mode, filters });
		const client = await connect(instance);
		try {
			for (const { op, field, id, path } of reads) {
				for (const call of calls(mode, op, { [field]: id })) {
					const response = { id, rules: [], total_count: 0 };
					const before = blockedFetch.mock.calls.length;
					reply(response);
					const result = await client.callTool(call);
					expect(result.isError, JSON.stringify(result)).not.toBe(true);
					expect(textJson(result)).toEqual(response);
					expect(blockedFetch).toHaveBeenCalledTimes(before + 1);
					const request = lastRequest();
					const url = new URL(request.url);
					expect(url.origin + url.pathname).toBe(`https://api.scaleway.com/iam/v1alpha1${path}`);
					expect(url.hash).toBe("");
					expect(Object.fromEntries(url.searchParams)).toEqual(
						op === "iam_list_rules" ? { policy_id: id, page: "1", page_size: "50" } : {},
					);
					expect(request.method).toBe("GET");
					expect(request.headers.get("X-Auth-Token")).toBe(UUID);
					expect(request.body).toBeNull();
				}
			}
		} finally {
			await client.close();
			await instance.close();
		}
	});
});

// Mutations need a separate writable configuration: rejection here must come from
// the identifier schema, not from read-only filtering before parameter validation.
describe.each(["gateway", "flat", "both"] as const)("IAM writable input contract (%s)", (mode) => {
	it("rejects group and rule IDs before any read-modify-write or member request", async () => {
		const instance = createServer({ mode, filters: { toolsets: ["iam"] } });
		const client = await connect(instance);
		try {
			for (const { op, field, params } of [
				{ op: "iam_get_group", field: "group_id", params: {} },
				{ op: "iam_add_group_member", field: "group_id", params: { user_id: "user-1" } },
				{ op: "iam_remove_group_member", field: "group_id", params: { application_id: "app-1" } },
				{ op: "iam_update_rule", field: "rule_id", params: { policy_id: "policy-1" } },
				{ op: "iam_delete_rule", field: "rule_id", params: { policy_id: "policy-1" } },
			]) {
				for (const value of attacks) {
					for (const call of calls(mode, op, { ...params, [field]: value }, false)) {
						const result = await client.callTool(call);
						expect(result.isError).toBe(true);
						expect(JSON.stringify(result)).toMatch(/invalid/i);
						expect(blockedFetch).not.toHaveBeenCalled();
					}
				}
			}
		} finally {
			await client.close();
			await instance.close();
		}
	});

	it("preserves free-form descriptions, CEL and permission names in JSON bodies", async () => {
		const instance = createServer({ mode, filters: { toolsets: ["iam"] } });
		const client = await connect(instance);
		const text = "../groups/other?x=1#fragment %2f \\ description\nsecond line";
		const condition = 'request.path == "/a/b" && request.label != "%2e?x#fragment\\\\"';
		const rule = { permission_set_names: [text], condition, project_ids: [UUID] };
		try {
			for (const call of calls(
				mode,
				"iam_update_application",
				{ application_id: "app-1", name: text, description: text },
				false,
			)) {
				const before = blockedFetch.mock.calls.length;
				reply({ id: "app-1", name: text, description: text });
				const result = await client.callTool(call);
				expect(result.isError, JSON.stringify(result)).not.toBe(true);
				expect(blockedFetch).toHaveBeenCalledTimes(before + 1);
				const request = lastRequest();
				expect(request.url).toBe("https://api.scaleway.com/iam/v1alpha1/applications/app-1");
				expect(request.method).toBe("PATCH");
				expect(request.headers.get("Content-Type")).toBe("application/json");
				expect(await request.json()).toEqual({ name: text, description: text });
			}
			for (const call of calls(
				mode,
				"iam_update_rule",
				{ policy_id: "policy-1", rule_id: "rule-1", ...rule },
				false,
			)) {
				const before = blockedFetch.mock.calls.length;
				reply({
					rules: [{ id: "rule-1", permission_set_names: [], project_ids: [UUID], condition: "" }],
					total_count: 1,
				});
				reply({ rules: [{ id: "rule-1", ...rule }] });
				const result = await client.callTool(call);
				expect(result.isError, JSON.stringify(result)).not.toBe(true);
				expect(blockedFetch).toHaveBeenCalledTimes(before + 2);
				const [input, init] = blockedFetch.mock.calls[before];
				const get = new Request(input, init);
				const url = new URL(get.url);
				expect(url.origin + url.pathname).toBe("https://api.scaleway.com/iam/v1alpha1/rules");
				expect(Object.fromEntries(url.searchParams)).toEqual({
					policy_id: "policy-1",
					page: "1",
					page_size: "100",
				});
				expect(get.method).toBe("GET");
				const put = lastRequest();
				expect(put.url).toBe("https://api.scaleway.com/iam/v1alpha1/rules");
				expect(put.method).toBe("PUT");
				expect(put.headers.get("Content-Type")).toBe("application/json");
				expect(await put.json()).toEqual({ policy_id: "policy-1", rules: [rule] });
			}
		} finally {
			await client.close();
			await instance.close();
		}
	});
});
