/**
 * Real SDK / fake HTTP transport contracts for containers v1.
 * Official OpenAPI: https://www.scaleway.com/en/developers/api/serverless-containers/v1/schema.yml
 * Verified with @scaleway/sdk-container@2.13.1 v1 api/types/marshalling.
 * Spec: specs/scaleway-api/containers/api-reference.md
 * Traceability: tests/parity-matrix.json#containers (one case per registered tool).
 */
import { readFileSync } from "node:fs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAdvancedClient, withHTTPClient, withProfile } from "@scaleway/sdk-client";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerContainersTools } from "../../../src/tools/containers/index.js";

const { http, auth } = vi.hoisted(() => {
	// Fail closed even if client construction changes: never permit real network.
	vi.stubGlobal(
		"fetch",
		vi.fn(() => {
			throw new Error("Real network is forbidden in container contracts");
		}),
	);
	return { http: vi.fn(), auth: vi.fn() };
});
vi.mock("../../../src/shared/auth.js", () => ({ loadAuthConfig: auth }));
// Only replace client construction to inject HTTP. client.fetch, Request building,
// auth interceptors, JSON/204 parsing and .status errors are the REAL SDK.
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: (config: Record<string, string>) =>
		createAdvancedClient(
			withProfile(config),
			withHTTPClient(http as unknown as typeof globalThis.fetch),
		),
}));

const ID = "00000000-0000-0000-0000-000000000001";
const PROJECT = "00000000-0000-0000-0000-000000000002";
const SECRET = "00000000-0000-0000-0000-000000000000";
const BASE = "/containers/v1/regions/fr-par";
const namespace = {
	id: ID,
	name: "ns",
	project_id: PROJECT,
	status: "creating",
	secret_environment_variables: {},
	region: "fr-par",
};
const container = {
	id: ID,
	namespace_id: ID,
	name: "app",
	status: "ready",
	image: "example/app:1",
	memory_limit_bytes: 536870912,
	mvcpu_limit: 1000,
	public_endpoint: "https://example.invalid",
	https_connections_only: true,
	secret_environment_variables: {},
	region: "fr-par",
};
const trigger = {
	id: ID,
	container_id: ID,
	name: "cron",
	source_type: "cron",
	status: "ready",
	destination_config: { http_path: "/", http_method: "post" },
	cron_config: {
		schedule: "0 * * * *",
		timezone: "UTC",
		body: "{}",
		headers: { "Content-Type": "application/json" },
	},
};
const domain = { id: ID, container_id: ID, hostname: "example.invalid", status: "creating" };
interface Result {
	content: { type: string; text: string }[];
	isError?: boolean;
}
type Handler = (params: Record<string, unknown>) => Promise<Result>;
const handlers: Record<string, Handler> = {};
registerContainersTools({
	tool: (name: string, _description: string, _schema: unknown, handler: Handler) => {
		handlers[name] = handler;
	},
} as unknown as McpServer);

interface Case {
	op: string;
	method: string;
	path: string;
	input: Record<string, unknown>;
	body?: Record<string, unknown>;
	query?: Record<string, string>;
	response: Record<string, unknown>;
	collection?: string;
}
// Each method + relative path below is the exact official v1 endpoint in the spec.
const cases: Case[] = [
	{
		op: "list_namespaces",
		method: "GET",
		path: "/namespaces",
		input: { page: 2, pageSize: 1, name: "name & +", projectId: PROJECT, organizationId: ID },
		query: {
			page: "2",
			page_size: "1",
			name: "name & +",
			project_id: PROJECT,
			organization_id: ID,
		},
		response: { namespaces: [namespace], total_count: 3 },
		collection: "namespaces",
	},
	{
		op: "get_namespace",
		method: "GET",
		path: `/namespaces/${ID}`,
		input: { namespaceId: ID },
		response: namespace,
	},
	{
		op: "create_namespace",
		method: "POST",
		path: "/namespaces",
		input: {
			name: "ns",
			description: "",
			environmentVariables: { keepCamel: "yes" },
			secretEnvironmentVariables: [{ key: "SECRET_KEY", value: "fake" }],
		},
		body: {
			name: "ns",
			project_id: PROJECT,
			description: "",
			environment_variables: { keepCamel: "yes" },
			secret_environment_variables: { SECRET_KEY: "fake" },
		},
		response: namespace,
	},
	{
		op: "update_namespace",
		method: "PATCH",
		path: `/namespaces/${ID}`,
		input: {
			namespaceId: ID,
			description: "",
			environmentVariables: {},
			secretEnvironmentVariables: [],
		},
		body: { description: "", environment_variables: {}, secret_environment_variables: {} },
		response: namespace,
	},
	{
		op: "delete_namespace",
		method: "DELETE",
		path: `/namespaces/${ID}`,
		input: { namespaceId: ID },
		response: namespace,
	},
	{
		op: "list_containers",
		method: "GET",
		path: "/containers",
		input: { namespaceId: ID, name: "app & tag", page: 2, pageSize: 1 },
		query: { page: "2", page_size: "1", namespace_id: ID, name: "app & tag" },
		response: { containers: [container], total_count: 3 },
		collection: "containers",
	},
	{
		op: "get_container",
		method: "GET",
		path: `/containers/${ID}`,
		input: { containerId: ID },
		response: container,
	},
	{
		op: "create_container",
		method: "POST",
		path: "/containers",
		input: {
			namespaceId: ID,
			name: "app",
			registryImage: "example/app:1",
			port: 8080,
			minScale: 0,
			maxScale: 4,
			memoryLimit: 512,
			cpuLimit: 1000,
			timeout: "2.5s",
			privacy: "private",
			protocol: "h2c",
			httpsConnectionsOnly: true,
			description: "",
			environmentVariables: { keepCamel: "yes" },
			secretEnvironmentVariables: [{ key: "SECRET_KEY", value: "fake" }],
		},
		body: {
			namespace_id: ID,
			name: "app",
			image: "example/app:1",
			port: 8080,
			min_scale: 0,
			max_scale: 4,
			memory_limit_bytes: 536870912,
			mvcpu_limit: 1000,
			timeout: "2.5s",
			privacy: "private",
			protocol: "h2c",
			https_connections_only: true,
			description: "",
			environment_variables: { keepCamel: "yes" },
			secret_environment_variables: { SECRET_KEY: "fake" },
		},
		response: container,
	},
	{
		op: "update_container",
		method: "PATCH",
		path: `/containers/${ID}`,
		input: {
			containerId: ID,
			registryImage: "example/app:2",
			port: 8081,
			minScale: 0,
			maxScale: 2,
			memoryLimit: 256,
			cpuLimit: 500,
			timeout: "30s",
			privacy: "public",
			protocol: "http1",
			httpsConnectionsOnly: false,
			description: "changed",
			environmentVariables: {},
			secretEnvironmentVariables: [],
		},
		body: {
			image: "example/app:2",
			port: 8081,
			min_scale: 0,
			max_scale: 2,
			memory_limit_bytes: 268435456,
			mvcpu_limit: 500,
			timeout: "30s",
			privacy: "public",
			protocol: "http1",
			https_connection_only: false,
			description: "changed",
			environment_variables: {},
			secret_environment_variables: {},
		},
		response: container,
	},
	{
		op: "delete_container",
		method: "DELETE",
		path: `/containers/${ID}`,
		input: { containerId: ID },
		response: container,
	},
	{
		op: "list_crons",
		method: "GET",
		path: "/triggers",
		input: { containerId: ID, page: 2, pageSize: 1 },
		query: { page: "2", page_size: "1", container_id: ID, trigger_type: "cron" },
		response: { triggers: [trigger], total_count: 3 },
		collection: "triggers",
	},
	{
		op: "create_cron",
		method: "POST",
		path: "/triggers",
		input: {
			containerId: ID,
			name: "cron",
			schedule: "0 * * * *",
			timezone: "Europe/Paris",
			args: { nested: { keepCamel: [1, false, null] } },
		},
		body: {
			container_id: ID,
			name: "cron",
			destination_config: { http_path: "/", http_method: "post" },
			cron_config: {
				schedule: "0 * * * *",
				timezone: "Europe/Paris",
				body: '{"nested":{"keepCamel":[1,false,null]}}',
				headers: { "Content-Type": "application/json" },
			},
		},
		response: trigger,
	},
	{
		op: "update_cron",
		method: "PATCH",
		path: `/triggers/${ID}`,
		input: {
			cronId: ID,
			name: "renamed",
			schedule: "5 * * * *",
			timezone: "Europe/Paris",
			args: {},
		},
		body: {
			name: "renamed",
			cron_config: { schedule: "5 * * * *", timezone: "Europe/Paris", body: "{}" },
		},
		response: trigger,
	},
	{
		op: "delete_cron",
		method: "DELETE",
		path: `/triggers/${ID}`,
		input: { cronId: ID },
		response: trigger,
	},
	{
		op: "list_domains",
		method: "GET",
		path: "/domains",
		input: { containerId: ID, page: 2, pageSize: 1 },
		query: { page: "2", page_size: "1", container_id: ID },
		response: { domains: [domain], total_count: 3 },
		collection: "domains",
	},
	{
		op: "create_domain",
		method: "POST",
		path: "/domains",
		input: { containerId: ID, hostname: "example.invalid" },
		body: { container_id: ID, hostname: "example.invalid" },
		response: domain,
	},
	{
		op: "delete_domain",
		method: "DELETE",
		path: `/domains/${ID}`,
		input: { domainId: ID },
		response: domain,
	},
];
function invoke(op: string, input: Record<string, unknown>) {
	return handlers[`scaleway_containers_${op}`](input);
}
function parsed(result: Result) {
	return JSON.parse(result.content[0].text);
}
beforeEach(() => {
	http.mockReset();
	auth.mockReset();
	auth.mockReturnValue({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: SECRET,
		defaultProjectId: PROJECT,
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	});
});
afterEach(() => vi.restoreAllMocks());
afterAll(() => vi.unstubAllGlobals());

describe.each(cases)("containers.$op transport contract", (testCase) => {
	it(`${testCase.method} ${BASE}${testCase.path}: exact authenticated Request and raw v1 response`, async () => {
		http.mockResolvedValueOnce(
			new Response(JSON.stringify(testCase.response), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			}),
		);
		const result = await invoke(testCase.op, testCase.input);
		expect(result.isError).toBeUndefined();
		expect(http).toHaveBeenCalledTimes(1);
		const request = http.mock.calls[0][0] as Request;
		expect(request).toBeInstanceOf(Request);
		const url = new URL(request.url);
		expect(url.origin).toBe("https://api.scaleway.com");
		expect(url.pathname).toBe(BASE + testCase.path);
		expect(Object.fromEntries(url.searchParams)).toEqual(testCase.query ?? {});
		expect(request.method).toBe(testCase.method);
		expect(request.headers.get("X-Auth-Token")).toBe(SECRET);
		if (testCase.body !== undefined) {
			expect(request.headers.get("Content-Type")).toBe("application/json");
			expect(await request.json()).toEqual(testCase.body);
		} else {
			expect(request.body).toBeNull();
			expect(request.headers.get("Content-Type")).toBeNull();
		}
		expect(parsed(result)).toEqual(
			testCase.collection
				? { items: testCase.response[testCase.collection], totalCount: 3, page: 2, pageSize: 1 }
				: testCase.response,
		);
	});
	it.each([
		[400, "invalid_input"],
		[401, "permission_denied"],
		[403, "permission_denied"],
		[404, "not_found"],
		[409, "server_error"],
		[429, "rate_limited"],
		[500, "server_error"],
	])("maps real SDK HTTP %s errors", async (status, type) => {
		http.mockResolvedValueOnce(
			new Response(JSON.stringify({ message: "contract error", type: "test" }), {
				status: Number(status),
				headers: { "Content-Type": "application/json" },
			}),
		);
		const result = await invoke(testCase.op, testCase.input);
		expect(result.isError).toBe(true);
		expect(parsed(result).error).toMatchObject({ type, statusCode: status });
		expect(http).toHaveBeenCalledTimes(1);
	});
	it("stops before HTTP when credentials are missing", async () => {
		auth.mockImplementation(() => {
			throw new Error("SCW_SECRET_KEY environment variable is required");
		});
		expect((await invoke(testCase.op, testCase.input)).isError).toBe(true);
		expect(http).not.toHaveBeenCalled();
	});
	it("handles a transport rejection", async () => {
		http.mockRejectedValueOnce(new Error("connection refused"));
		expect(parsed(await invoke(testCase.op, testCase.input)).error).toMatchObject({
			type: "server_error",
			statusCode: 500,
		});
	});
	const collection = testCase.collection;
	if (!collection) {
		it("normalizes a real empty 204 response", async () => {
			http.mockResolvedValueOnce(new Response(null, { status: 204 }));
			expect(parsed(await invoke(testCase.op, testCase.input))).toEqual({});
		});
	} else {
		it("returns an empty page with default pagination", async () => {
			http.mockResolvedValueOnce(Response.json({ [collection]: [], total_count: 0 }));
			const input = { ...testCase.input, page: undefined, pageSize: undefined };
			expect(parsed(await invoke(testCase.op, input))).toEqual({
				items: [],
				totalCount: 0,
				page: 1,
				pageSize: 50,
			});
		});
	}
});

describe("removed tools at the MCP protocol boundary", () => {
	it("lists only the 17 supported tools and rejects removed names without auth or HTTP", async () => {
		const server = new McpServer({ name: "containers-contract", version: "0.0.1" });
		const client = new Client({ name: "containers-test", version: "0.0.1" });
		const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
		registerContainersTools(server);
		try {
			await server.connect(serverTransport);
			await client.connect(clientTransport);
			const { tools } = await client.listTools();
			const names = tools.map(({ name }) => name);
			expect(names).toHaveLength(17);
			expect(names.sort()).toEqual(cases.map(({ op }) => `scaleway_containers_${op}`).sort());
			for (const op of ["deploy_container", "create_token", "delete_token", "redeploy_container"]) {
				const name = `scaleway_containers_${op}`;
				expect(names).not.toContain(name);
				const result = await client.callTool({
					name,
					arguments: { containerId: ID, tokenId: ID },
				});
				expect(result).toMatchObject({
					isError: true,
					content: [{ type: "text", text: expect.stringContaining(`Tool ${name} not found`) }],
				});
			}
			expect(http).not.toHaveBeenCalled();
			expect(auth).not.toHaveBeenCalled();
		} finally {
			await client.close();
			await server.close();
		}
	});
});

describe("containers v1 matrix endpoint traceability", () => {
	it("maps exactly the 17 supported registered tools to real v1 endpoints and contract cases", () => {
		const matrix = JSON.parse(
			readFileSync(new URL("../../parity-matrix.json", import.meta.url), "utf8"),
		).containers;
		const covered = cases.map(({ op }) => `scaleway_containers_${op}`);
		expect(cases).toHaveLength(17);
		expect(new Set(covered).size).toBe(17);
		expect(covered.sort()).toEqual(Object.keys(handlers).sort());
		expect(Object.keys(matrix).sort()).toEqual(cases.map(({ op }) => op).sort());
		for (const testCase of cases) {
			const path = testCase.path.replace(
				ID,
				testCase.path.startsWith("/namespaces/")
					? "{namespace_id}"
					: testCase.path.startsWith("/containers/")
						? "{container_id}"
						: testCase.path.startsWith("/triggers/")
							? "{trigger_id}"
							: "{domain_id}",
			);
			expect(matrix[testCase.op]).toEqual({
				api: `${testCase.method} /containers/v1/regions/{region}${path}`,
				tool: `scaleway_containers_${testCase.op}`,
				contract_test: "tests/contract/containers/containers.contract.test.ts",
			});
		}
	});
});

describe("optional fields at the real SDK transport boundary", () => {
	it.each([
		{
			op: "create_container",
			input: { namespaceId: ID, name: "app", registryImage: "example/app:1" },
			expected: { namespace_id: ID, name: "app", image: "example/app:1" },
		},
		{ op: "update_container", input: { containerId: ID }, expected: {} },
		{
			op: "create_namespace",
			input: { name: "ns", projectId: ID },
			expected: { name: "ns", project_id: ID },
		},
		{ op: "update_namespace", input: { namespaceId: ID }, expected: {} },
		{ op: "update_cron", input: { cronId: ID, name: "renamed" }, expected: { name: "renamed" } },
		{
			op: "update_cron",
			input: { cronId: ID, args: { nested: { keepCamel: [false, null] } } },
			expected: { cron_config: { body: '{"nested":{"keepCamel":[false,null]}}' } },
		},
	])("$op omits unspecified fields in serialized JSON", async ({ op, input, expected }) => {
		http.mockResolvedValueOnce(Response.json({}));
		expect((await invoke(op, input)).isError).toBeUndefined();
		expect(http).toHaveBeenCalledTimes(1);
		expect(await (http.mock.calls[0][0] as Request).json()).toEqual(expected);
	});
	it("creates a nameless legacy cron as a named v1 trigger with complete UTC JSON POST settings", async () => {
		http.mockResolvedValueOnce(Response.json(trigger));
		expect(
			(await invoke("create_cron", { containerId: ID, schedule: "0 * * * *" })).isError,
		).toBeUndefined();
		expect(http).toHaveBeenCalledTimes(1);
		expect(await (http.mock.calls[0][0] as Request).json()).toEqual({
			container_id: ID,
			name: expect.stringMatching(/^cron-[0-9a-f-]{36}$/),
			destination_config: { http_path: "/", http_method: "post" },
			cron_config: {
				schedule: "0 * * * *",
				timezone: "UTC",
				body: "{}",
				headers: { "Content-Type": "application/json" },
			},
		});
	});
	it.each([
		{
			op: "create_container",
			input: {
				namespaceId: ID,
				name: "app",
				registryImage: "example/app:1",
				httpOption: "redirected",
			},
		},
		{ op: "update_container", input: { containerId: ID, httpOption: "doNotForce" } },
		{
			op: "update_container",
			input: { containerId: ID, httpOption: "enabled", httpsConnectionsOnly: true },
		},
		{ op: "update_cron", input: { cronId: ID, containerId: PROJECT } },
	])(
		"$op rejects incompatible semantics without authenticating or sending HTTP",
		async ({ op, input }) => {
			expect((await invoke(op, input)).isError).toBe(true);
			expect(auth).not.toHaveBeenCalled();
			expect(http).not.toHaveBeenCalled();
		},
	);
});
