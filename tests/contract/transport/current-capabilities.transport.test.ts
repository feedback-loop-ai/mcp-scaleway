/**
 * Current Scaleway requests through the real SDK and injected HTTP (no live mutations).
 * References: specs/scaleway-api/{rdb,containers,k8s,key-manager,audit-trail}/api-reference.md
 */
import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAdvancedClient, withHTTPClient, withProfile } from "@scaleway/sdk-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import operations from "../../../src/gateway/operations.json";
import { assertScwPathAllowed, withRouteContext } from "../../../src/shared/route-guard.js";
import { registerAuditTrailTools } from "../../../src/tools/audit-trail/index.js";
import { registerContainersTools } from "../../../src/tools/containers/index.js";
import { registerK8sTools } from "../../../src/tools/k8s/index.js";
import { registerKeyManagerTools } from "../../../src/tools/key-manager/index.js";
import { registerRdbTools } from "../../../src/tools/rdb/index.js";

const ID = "11111111-1111-4111-8111-111111111111";
const { http, getClient } = vi.hoisted(() => ({ http: vi.fn(), getClient: vi.fn() }));
vi.mock("../../../src/shared/client.js", () => ({ createScalewayClient: getClient }));
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "00000000-0000-4000-8000-000000000000",
		defaultProjectId: "11111111-1111-4111-8111-111111111111",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

type Record = { shape: z.ZodRawShape; callback: ToolCallback<z.ZodRawShape> };
const records = new Map<string, Record>();
const server = {
	tool(
		name: string,
		_description: string,
		shape: z.ZodRawShape,
		callback: ToolCallback<z.ZodRawShape>,
	) {
		records.set(name, { shape, callback });
	},
} as unknown as McpServer;
for (const register of [
	registerRdbTools,
	registerContainersTools,
	registerK8sTools,
	registerKeyManagerTools,
	registerAuditTrailTools,
])
	register(server);

async function call(name: string, args: { [key: string]: unknown }) {
	const tool = `scaleway_${name}`;
	const record = records.get(tool);
	const operation = operations.find((item) => item.tool === tool);
	if (!record || !operation) throw new Error(`Missing registration or metadata: ${tool}`);
	return withRouteContext(tool, operation.api, () =>
		record.callback(
			z.object(record.shape).parse(args),
			{} as Parameters<typeof record.callback>[1],
		),
	);
}
function request(): Request {
	return http.mock.lastCall?.[0] as Request;
}
const json = (body: unknown) =>
	new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });

beforeEach(() => {
	http.mockReset();
	http.mockImplementation(async () => json({ id: ID, firing: false }));
	const client = createAdvancedClient(
		withProfile({
			accessKey: "SCWXXXXXXXXXXXXXXXXX",
			secretKey: "00000000-0000-4000-8000-000000000000",
			defaultRegion: "fr-par",
			defaultProjectId: ID,
		}),
		withHTTPClient(http as unknown as typeof fetch),
	);
	const innerFetch = client.fetch;
	client.fetch = <T>(...args: Parameters<typeof innerFetch<T>>) => {
		assertScwPathAllowed(args[0].path, args[0].method);
		return innerFetch<T>(...args);
	};
	getClient.mockReturnValue(client);
});

describe("RDB snapshot API routes", () => {
	it("places instance_id in the path and only snapshot fields in the body", async () => {
		const result = await call("rdb_create_snapshot", {
			instance_id: ID,
			name: "before-upgrade",
			expires_at: "2026-12-31T00:00:00Z",
		});
		expect(result.isError).not.toBe(true);
		expect(new URL(request().url).pathname).toBe(
			`/rdb/v1/regions/fr-par/instances/${ID}/snapshots`,
		);
		expect(request().method).toBe("POST");
		expect(await request().json()).toEqual({
			name: "before-upgrade",
			expires_at: "2026-12-31T00:00:00Z",
		});
	});
	it("restores through create-instance with the current high availability mode", async () => {
		const result = await call("rdb_restore_snapshot", {
			snapshot_id: ID,
			instance_name: "restored",
			node_type: "db-gp-xs",
			high_availability_mode: "multiple_zone",
		});
		expect(result.isError).not.toBe(true);
		expect(new URL(request().url).pathname).toBe(
			`/rdb/v1/regions/fr-par/snapshots/${ID}/create-instance`,
		);
		expect(await request().json()).toEqual({
			instance_name: "restored",
			node_type: "db-gp-xs",
			high_availability_mode: "multiple_zone",
		});
	});
});

describe("Serverless Containers public endpoint control", () => {
	it.each([false, true])(
		"preserves enableDefaultPublicEndpoint=%s on create and update",
		async (enabled) => {
			for (const [action, args] of [
				["create", { namespaceId: ID, name: "endpoint-test", registryImage: "nginx:latest" }],
				["update", { containerId: ID }],
			] as const) {
				const result = await call(`containers_${action}_container`, {
					...args,
					enableDefaultPublicEndpoint: enabled,
				});
				expect(result.isError).not.toBe(true);
				expect((await request().json()).enable_default_public_endpoint).toBe(enabled);
			}
		},
	);
});

describe("Kubernetes kubeconfig endpoint selection", () => {
	it.each([undefined, "public", "vpc"])(
		"serializes endpoint %s without changing the default",
		async (endpoint) => {
			await call("k8s_get_cluster_kubeconfig", { region: "fr-par", cluster_id: ID, endpoint });
			expect(new URL(request().url).searchParams.get("endpoint")).toBe(endpoint ?? null);
		},
	);
	it("rejects unknown endpoints before transport", async () => {
		await expect(
			call("k8s_get_cluster_kubeconfig", {
				region: "fr-par",
				cluster_id: ID,
				endpoint: "internal",
			}),
		).rejects.toThrow();
		expect(http).not.toHaveBeenCalled();
	});
});

describe("Key Manager rotation operations", () => {
	it("lists rotations with repeated status filters, order and pagination", async () => {
		http.mockResolvedValueOnce(
			json({
				rotations: [{ key_id: ID, index: 2, status: "enabled", manually_rotated: true }],
				total_count: 1,
			}),
		);
		const result = await call("key_manager_list_key_rotations", {
			keyId: ID,
			region: "fr-par",
			page: 2,
			pageSize: 7,
			orderBy: "created_at_desc",
			status: ["enabled", "deleted"],
		});
		expect(result.isError).not.toBe(true);
		const url = new URL(request().url);
		expect(url.pathname).toBe(`/key-manager/v1alpha1/regions/fr-par/keys/${ID}/rotations`);
		expect(url.searchParams.get("page_size")).toBe("7");
		expect(url.searchParams.get("page")).toBe("2");
		expect(url.searchParams.get("order_by")).toBe("created_at_desc");
		expect(url.searchParams.getAll("status")).toEqual(["enabled", "deleted"]);
		expect(JSON.parse((result.content[0] as { text: string }).text)).toMatchObject({
			totalCount: 1,
			page: 2,
			pageSize: 7,
			items: [{ keyId: ID, index: 2 }],
		});
	});
	it.each([undefined, 0, 4_294_967_295])(
		"deletes imported key material at rotation %s and normalizes 204",
		async (keyRotationIndex) => {
			http.mockResolvedValueOnce(new Response(null, { status: 204 }));
			const result = await call("key_manager_delete_key_material", { keyId: ID, keyRotationIndex });
			expect(result.isError).not.toBe(true);
			expect(new URL(request().url).pathname).toBe(
				`/key-manager/v1alpha1/regions/fr-par/keys/${ID}/delete-key-material`,
			);
			expect(request().method).toBe("POST");
			expect(request().headers.get("content-type")).toContain("application/json");
			expect(await request().json()).toEqual(
				keyRotationIndex === undefined ? {} : { key_rotation_index: keyRotationIndex },
			);
			expect(JSON.parse((result.content[0] as { text: string }).text)).toMatchObject({ keyId: ID });
		},
	);
	it.each([-1, 1.5, 4_294_967_296])(
		"rejects invalid rotation %s before transport",
		async (keyRotationIndex) => {
			await expect(
				call("key_manager_delete_key_material", { keyId: ID, keyRotationIndex }),
			).rejects.toThrow();
			expect(http).not.toHaveBeenCalled();
		},
	);
	it.each(["list_key_rotations", "delete_key_material"])(
		"preserves a failed %s request",
		async (operation) => {
			http.mockResolvedValueOnce(
				new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 }),
			);
			const result = await call(`key_manager_${operation}`, { keyId: ID });
			expect(result.isError).toBe(true);
			expect(JSON.parse((result.content[0] as { text: string }).text).error.statusCode).toBe(403);
		},
	);
});

describe("Audit Trail custom alert evaluation", () => {
	it.each([undefined, "300s"])(
		"evaluates a rule with window %s without creating it",
		async (evaluationWindow) => {
			const result = await call("audit_trail_test_custom_alert_rule", {
				region: "fr-par",
				organizationId: ID,
				query: "true",
				occurrences: 1,
				evaluationWindow,
			});
			expect(result.isError).not.toBe(true);
			expect(new URL(request().url).pathname).toBe(
				"/audit-trail/v1alpha1/regions/fr-par/test-custom-alert-rule",
			);
			expect(request().method).toBe("POST");
			expect(await request().json()).toEqual({
				organization_id: ID,
				query: "true",
				occurrences: 1,
				...(evaluationWindow === undefined ? {} : { evaluation_window: evaluationWindow }),
			});
			expect(JSON.parse((result.content[0] as { text: string }).text)).toMatchObject({
				firing: false,
			});
		},
	);
	it("reports server errors without treating a failed evaluation as false", async () => {
		http.mockResolvedValueOnce(
			new Response(JSON.stringify({ message: "Invalid query" }), { status: 400 }),
		);
		const result = await call("audit_trail_test_custom_alert_rule", {
			region: "fr-par",
			organizationId: ID,
			query: "bad",
			occurrences: 1,
		});
		expect(result.isError).toBe(true);
		expect(JSON.parse((result.content[0] as { text: string }).text).error.statusCode).toBe(400);
	});
	it.each([{ evaluationWindow: "5m" }, { occurrences: -1 }, { occurrences: 1.5 }, { query: "" }])(
		"rejects invalid rule input %j",
		async (invalid) => {
			await expect(
				call("audit_trail_test_custom_alert_rule", {
					region: "fr-par",
					organizationId: ID,
					query: "true",
					occurrences: 1,
					...invalid,
				}),
			).rejects.toThrow();
			expect(http).not.toHaveBeenCalled();
		},
	);
});
