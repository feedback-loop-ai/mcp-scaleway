/**
 * Real-transport proof for areas migrated or repaired in feature 060 that the generic
 * path-auth regression does not cover: autoscaling v1alpha2 (POST body, token pagination),
 * generated-client page_size on the wire (key-manager, secret-manager, edge-services, sns),
 * and the two raw-fetch hosts' authentication (object storage SigV4, generative APIs bearer).
 * Contracts: specs/scaleway-api/{autoscaling,key-manager,secret-manager,edge-services,sns,object-storage,generative-apis}/api-reference.md
 */
import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAdvancedClient, withHTTPClient, withProfile } from "@scaleway/sdk-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { registerAllTools } from "../../../src/tools/index.js";

const ID = "11111111-1111-4111-8111-111111111111";
const SECRET = "00000000-0000-4000-8000-000000000000";
const { http, getClient } = vi.hoisted(() => ({ http: vi.fn(), getClient: vi.fn() }));
vi.mock("../../../src/shared/client.js", () => ({ createScalewayClient: getClient }));
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "00000000-0000-4000-8000-000000000000",
		defaultProjectId: "11111111-1111-4111-8111-111111111111",
		defaultOrganizationId: "11111111-1111-4111-8111-111111111111",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

type Rec = { shape: z.ZodRawShape; callback: ToolCallback<z.ZodRawShape> };
const records = new Map<string, Rec>();
registerAllTools({
	tool(name: string, _d: string, shape: z.ZodRawShape, callback: ToolCallback<z.ZodRawShape>) {
		records.set(name, { shape, callback });
	},
} as unknown as McpServer);

async function call(name: string, args: Record<string, unknown>) {
	const record = records.get(`scaleway_${name}`);
	if (!record) throw new Error(`missing ${name}`);
	return record.callback(
		z.object(record.shape).parse(args),
		{} as Parameters<typeof record.callback>[1],
	);
}
const rawFetch = vi.fn();
const json = (body: unknown) =>
	new Response(JSON.stringify(body), { headers: { "content-type": "application/json" } });
function lastRequest(): Request {
	return http.mock.calls[http.mock.calls.length - 1][0] as Request;
}

beforeEach(() => {
	rawFetch.mockReset();
	rawFetch.mockResolvedValue(json({ data: [] }));
	vi.stubGlobal("fetch", rawFetch);
	http.mockReset();
	http.mockResolvedValue(
		json({
			groups: [],
			keys: [],
			secrets: [],
			pipelines: [],
			sns_credentials: [],
			total_count: 0,
			id: ID,
		}),
	);
	getClient.mockReturnValue(
		createAdvancedClient(
			withProfile({
				accessKey: "SCWXXXXXXXXXXXXXXXXX",
				secretKey: SECRET,
				defaultProjectId: ID,
				defaultOrganizationId: ID,
				defaultRegion: "fr-par",
				defaultZone: "fr-par-1",
			}),
			withHTTPClient(http as unknown as typeof fetch),
		),
	);
});
afterEach(() => vi.unstubAllGlobals());

describe("autoscaling v1alpha2 through the real SDK", () => {
	it("lists groups with token pagination on the current version", async () => {
		await call("autoscaling_list_instance_groups", { zone: "fr-par-1", pageSize: 5 });
		const r = lastRequest();
		const url = new URL(r.url);
		expect(r.method).toBe("GET");
		expect(url.pathname).toBe("/autoscaling/v1alpha2/zones/fr-par-1/groups");
		expect(url.searchParams.get("page_size")).toBe("5");
		expect(r.headers.get("x-auth-token")).toBe(SECRET);
	});
	it("creates a group with a JSON body and embedded policy", async () => {
		http.mockResolvedValue(json({ id: ID }));
		const result = await call("autoscaling_create_instance_group", {
			zone: "fr-par-1",
			name: "web",
			templateId: ID,
			scalingPolicy: { type: "fixed", targetSize: 2 },
		});
		const r = lastRequest();
		expect(result.isError).not.toBe(true);
		expect(r.method).toBe("POST");
		expect(new URL(r.url).pathname).toBe("/autoscaling/v1alpha2/zones/fr-par-1/groups");
		expect(r.headers.get("content-type")).toContain("application/json");
		const body = await r.json();
		expect(body.name).toBe("web");
		expect(body.template_id).toBe(ID);
	});
	it("targets instance v2alpha1 for templates", async () => {
		await call("autoscaling_get_instance_template", { zone: "fr-par-1", instanceTemplateId: ID });
		expect(new URL(lastRequest().url).pathname).toBe(
			`/instance/v2alpha1/zones/fr-par-1/templates/${ID}`,
		);
	});
});

describe("generated-client page size reaches the wire", () => {
	it.each([
		[
			"key_manager_list_keys",
			{ region: "fr-par", pageSize: 7 },
			"/key-manager/v1alpha1/regions/fr-par/keys",
		],
		[
			"secret_manager_list_secrets",
			{ region: "fr-par", pageSize: 7 },
			"/secret-manager/v1beta1/regions/fr-par/secrets",
		],
		["edge_services_list_pipelines", { pageSize: 7 }, "/edge-services/v1beta1/pipelines"],
		[
			"sns_list_credentials",
			{ region: "fr-par", pageSize: 7 },
			"/mnq/v1beta1/regions/fr-par/sns-credentials",
		],
	] as const)("%s sends page_size=7", async (name, args, path) => {
		await call(name, args);
		const url = new URL(lastRequest().url);
		expect(url.pathname).toBe(path);
		expect(url.searchParams.get("page_size")).toBe("7");
		expect(lastRequest().headers.get("x-auth-token")).toBe(SECRET);
	});
});

describe("raw-fetch hosts authenticate correctly", () => {
	it("object storage signs with AWS SigV4", async () => {
		rawFetch.mockResolvedValue(
			new Response("<ListAllMyBucketsResult></ListAllMyBucketsResult>", {
				headers: { "content-type": "application/xml" },
			}),
		);
		await call("object_storage_list_buckets", { region: "fr-par" });
		const [url, init] = rawFetch.mock.calls[0] as [string, RequestInit];
		expect(new URL(url).host).toBe("s3.fr-par.scw.cloud");
		const auth = new Headers(init.headers).get("authorization") ?? "";
		expect(auth).toMatch(/^AWS4-HMAC-SHA256 Credential=SCWXXXXXXXXXXXXXXXXX\//);
		expect(new Headers(init.headers).get("x-amz-date")).toBeTruthy();
	});
	it("generative APIs send a bearer token to api.scaleway.ai", async () => {
		rawFetch.mockResolvedValue(json({ data: [] }));
		await call("generative_apis_list_models", { region: "fr-par" });
		const [url, init] = rawFetch.mock.calls[0] as [string, RequestInit];
		expect(new URL(url).host).toBe("api.scaleway.ai");
		expect(new Headers(init.headers).get("authorization")).toBe(`Bearer ${SECRET}`);
	});
});
