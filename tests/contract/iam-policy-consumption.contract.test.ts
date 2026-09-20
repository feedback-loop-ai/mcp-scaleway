/** A complete policy read is required before SetRules can replace existing access. */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import examplesJson from "../../src/gateway/examples.json";
import { executeOperation } from "../../src/gateway/index.js";
import { type OperationExtra, createOperationRegistry } from "../../src/gateway/registry.js";
import { resetClient } from "../../src/shared/client.js";

const http = vi.hoisted(() =>
	vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>(),
);
vi.mock("@scaleway/sdk-client", async (importOriginal) => {
	const sdk = await importOriginal<typeof import("@scaleway/sdk-client")>();
	return {
		...sdk,
		createClient: (profile: Parameters<typeof sdk.createClient>[0]) =>
			sdk.createAdvancedClient(
				sdk.withProfile(profile ?? {}),
				sdk.withHTTPClient(http as unknown as typeof fetch),
				sdk.withAdditionalInterceptors(profile?.interceptors ?? []),
			),
	};
});

const UUID = "00000000-0000-4000-8000-000000000001";
const CANARY = "private-provider-policy-detail";
const registry = createOperationRegistry();
const examples = examplesJson as Record<string, Record<string, unknown>>;
const extra = { signal: new AbortController().signal, requestId: 1 } as OperationExtra;
const completeRule = {
	id: UUID,
	permission_set_names: ["InstanceReadOnly"],
	condition: "",
	project_ids: [UUID],
	organization_id: null,
	account_root_user_id: null,
};

beforeEach(() => {
	resetClient();
	http.mockReset();
	vi.stubEnv("SCW_ACCESS_KEY", "SCWXXXXXXXXXXXXXXXXX");
	vi.stubEnv("SCW_SECRET_KEY", UUID);
	vi.stubEnv("SCW_DEFAULT_PROJECT_ID", UUID);
	vi.stubEnv("SCW_DEFAULT_ORGANIZATION_ID", UUID);
});
afterEach(() => {
	resetClient();
	vi.unstubAllEnvs();
});

function readReply(payload: unknown) {
	http.mockImplementation(async (input) => {
		const request = input as Request;
		if (request.method === "GET") return Response.json(payload);
		if (request.method === "PUT") return Response.json({ rules: [] });
		throw new Error("Unexpected HTTP method");
	});
}

for (const op of ["iam_create_rule", "iam_update_rule", "iam_delete_rule"] as const) {
	describe(`${op}: consumed policy completeness`, () => {
		for (const [name, payload] of [
			["empty object", {}],
			["missing rules", { total_count: 0 }],
			["missing count", { rules: [] }],
			["partial first page", { rules: [completeRule], total_count: 2 }],
			["negative count", { rules: [], total_count: -1 }],
			["fractional count", { rules: [], total_count: 0.5 }],
			["empty rule", { rules: [{}], total_count: 1 }],
			["missing identifier", { rules: [{ ...completeRule, id: undefined }], total_count: 1 }],
			[
				"missing permissions",
				{ rules: [{ ...completeRule, permission_set_names: undefined }], total_count: 1 },
			],
			["missing condition", { rules: [{ ...completeRule, condition: undefined }], total_count: 1 }],
			[
				"missing scope",
				{
					rules: [{ ...completeRule, project_ids: undefined, organization_id: undefined }],
					total_count: 1,
				},
			],
			[
				"unrepresentable account root",
				{ rules: [{ ...completeRule, account_root_user_id: UUID }], total_count: 1 },
			],
		] as const) {
			it(`rejects ${name} before mutation`, async () => {
				readReply({ ...payload, private_detail: CANARY });
				const result = await executeOperation(
					registry,
					{ op, params: examples[`scaleway_${op}`] },
					extra,
					false,
				);
				expect(result.isError).toBe(true);
				expect(JSON.parse((result.content[0] as { text: string }).text)).toMatchObject({
					error: { type: "server_error", statusCode: 502 },
				});
				expect(JSON.stringify(result)).not.toContain(CANARY);
				expect(http).toHaveBeenCalledOnce();
				expect((http.mock.calls[0][0] as Request).method).toBe("GET");
			});
		}
		it("preserves complete existing permissions, conditions and explicit nullable scopes", async () => {
			const params = examples[`scaleway_${op}`];
			const preserved = {
				...completeRule,
				id: "preserved",
				permission_set_names: null,
				project_ids: null,
				organization_id: UUID,
			};
			const target = { ...completeRule, id: params.rule_id ?? UUID };
			readReply({ rules: [preserved, target], total_count: 2 });
			const result = await executeOperation(registry, { op, params }, extra, false);
			expect(result.isError).not.toBe(true);
			expect(http).toHaveBeenCalledTimes(2);
			const put = http.mock.calls[1][0] as Request;
			expect(put.method).toBe("PUT");
			expect((await put.json()).rules[0]).toEqual({
				permission_set_names: null,
				condition: "",
				project_ids: null,
				organization_id: UUID,
			});
		});
	});
}

it("allows adding the first rule to an explicitly empty policy", async () => {
	readReply({ rules: [], total_count: 0 });
	const result = await executeOperation(
		registry,
		{
			op: "iam_create_rule",
			params: examples.scaleway_iam_create_rule,
		},
		extra,
		false,
	);
	expect(result.isError).not.toBe(true);
	expect(http).toHaveBeenCalledTimes(2);
	expect((await (http.mock.calls[1][0] as Request).json()).rules).toHaveLength(1);
});
