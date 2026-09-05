import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Errors } from "@scaleway/sdk-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerRdbTools } from "../../../src/tools/rdb/index.js";

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "project-123",
		defaultOrganizationId: "org-123",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn(() => ({
		fetch: mockFetch,
	})),
	resetClient: vi.fn(),
}));

const BASE = "/rdb/v1/regions/fr-par";

/**
 * Error shaped like what `@scaleway/sdk-client` throws on a non-2xx response:
 * an `Error` subclass with a numeric `.status`.
 */
function scwError(status: number, message: string) {
	return new Errors.ScalewayError(status, { message });
}

/** The ScwRequest object the handler passed to `client.fetch`. */
function lastRequest(): {
	method: string;
	path: string;
	headers?: Record<string, string>;
	body?: string;
	urlParams?: URLSearchParams;
} {
	return mockFetch.mock.calls[0][0];
}

function lastBody(): Record<string, unknown> {
	const { body } = lastRequest();
	if (body === undefined) throw new Error("request has no body");
	return JSON.parse(body);
}

function lastQuery(): URLSearchParams {
	const { urlParams } = lastRequest();
	if (!(urlParams instanceof URLSearchParams)) throw new Error("request has no urlParams");
	return urlParams;
}

function expectJsonRequest(method: string, path: string) {
	expect(mockFetch).toHaveBeenCalledTimes(1);
	expect(mockFetch).toHaveBeenCalledWith(
		expect.objectContaining({
			method,
			path,
			headers: { "Content-Type": "application/json" },
		}),
	);
	expect(typeof lastRequest().body).toBe("string");
}

function expectBodylessRequest(method: string, path: string) {
	expect(mockFetch).toHaveBeenCalledTimes(1);
	expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method, path }));
	const request = lastRequest();
	expect(request.body).toBeUndefined();
	expect(request.headers).toBeUndefined();
}

function isError(result: unknown): boolean {
	return (result as { isError?: boolean }).isError === true;
}

describe("rdb module", () => {
	it("registers all 27 tools without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		expect(() => registerRdbTools(server)).not.toThrow();
		expect(toolSpy).toHaveBeenCalledTimes(27);
		vi.restoreAllMocks();
	});
});

describe("rdb handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// We'll import handlers directly for testing
	const importHandlers = async () => {
		const mod = await import("../../../src/tools/rdb/handlers.js");
		return mod;
	};

	// --- Transport ---

	describe("transport", () => {
		it("sends relative paths (never a full URL) so the SDK can prefix its apiURL", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1" });
			await handlers.handleGetInstance({ instance_id: "inst-1" });
			const { path } = lastRequest();
			expect(path.startsWith("/rdb/v1/regions/")).toBe(true);
			expect(path).not.toContain("https://");
			expect(path).not.toContain("undefined");
		});

		it("never passes a Request object to client.fetch", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ instances: [], total_count: 0 });
			await handlers.handleListInstances({ page: 1, pageSize: 50 });
			expect(mockFetch.mock.calls[0][0]).not.toBeInstanceOf(Request);
			expect(mockFetch.mock.calls[0][0]).toEqual({
				method: "GET",
				path: `${BASE}/instances`,
				urlParams: expect.any(URLSearchParams),
			});
		});

		it("does not send urlParams on requests without a query string", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1" });
			await handlers.handleGetInstance({ instance_id: "inst-1" });
			expect(lastRequest().urlParams).toBeUndefined();
		});

		it("returns {} when the SDK resolves undefined (HTTP 204)", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handlers.handleDeleteInstance({ instance_id: "inst-1" });
			expect(isError(result)).toBe(false);
			expect(JSON.parse(result.content[0].text)).toEqual({});
		});

		it("maps ScalewayError.status thrown by the SDK to the error type", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(
				new Errors.ScalewayError(404, { message: "no such instance" }),
			);
			const result = await handlers.handleGetInstance({ instance_id: "missing" });
			expect(isError(result)).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
			expect(parsed.error.statusCode).toBe(404);
			expect(parsed.error.message).toContain("no such instance");
		});

		it("maps ScalewayError subclasses (e.g. ResourceNotFoundError) too", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(
				new Errors.ResourceNotFoundError(
					404,
					{ type: "not_found", resource: "instance", resource_id: "missing" },
					"instance",
					"missing",
				),
			);
			const result = await handlers.handleGetInstance({ instance_id: "missing" });
			expect(isError(result)).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	// --- Instance Handlers ---

	describe("handleListInstances", () => {
		it("lists instances with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				instances: [{ id: "inst-1", name: "db-1" }],
				total_count: 1,
			});
			const result = await handlers.handleListInstances({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain('"inst-1"');
			expect(result.content[0].text).toContain('"totalCount": 1');
			expectBodylessRequest("GET", `${BASE}/instances`);
			expect(lastQuery().toString()).toBe("page=1&page_size=50");
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ instances: [], total_count: 0 });
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListInstances({} as any);
			expect(result.content[0].text).toContain('"page": 1');
			expect(result.content[0].text).toContain('"pageSize": 50');
			expect(lastQuery().get("page")).toBe("1");
			expect(lastQuery().get("page_size")).toBe("50");
		});

		it("lists instances with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ instances: [], total_count: 0 });
			const result = await handlers.handleListInstances({
				region: "nl-ams",
				page: 2,
				pageSize: 10,
				project_id: "proj-1",
				name: "test",
				order_by: "name_asc",
				tags: ["env:prod", "team:backend"],
			});
			expect(result.content[0].text).toContain('"totalCount": 0');
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/instances");
			const query = lastQuery();
			expect(query.get("page")).toBe("2");
			expect(query.get("page_size")).toBe("10");
			expect(query.get("project_id")).toBe("proj-1");
			expect(query.get("name")).toBe("test");
			expect(query.get("order_by")).toBe("name_asc");
			expect(query.getAll("tags")).toEqual(["env:prod", "team:backend"]);
			expect(query.toString()).toBe(
				"page=2&page_size=10&project_id=proj-1&name=test&order_by=name_asc&tags=env%3Aprod&tags=team%3Abackend",
			);
		});

		it("handles API errors", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(403, "Forbidden"));
			const result = await handlers.handleListInstances({ page: 1, pageSize: 50 });
			expect(isError(result)).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("handleGetInstance", () => {
		it("gets instance by ID", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1", name: "mydb", status: "ready" });
			const result = await handlers.handleGetInstance({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain('"inst-1"');
			expectBodylessRequest("GET", `${BASE}/instances/inst-1`);
		});

		it("gets instance with explicit region", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1", name: "mydb" });
			await handlers.handleGetInstance({
				instance_id: "inst-1",
				region: "nl-ams",
			});
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/instances/inst-1");
		});

		it("handles not found error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleGetInstance({ instance_id: "missing" });
			expect(isError(result)).toBe(true);
			expect(result.content[0].text).toContain("not_found");
		});
	});

	describe("handleCreateInstance", () => {
		it("creates instance with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-new", name: "mydb", status: "provisioning" });
			const result = await handlers.handleCreateInstance({
				name: "mydb",
				engine: "PostgreSQL-15",
				node_type: "db-dev-s",
			});
			expect(result.content[0].text).toContain('"inst-new"');
			expectJsonRequest("POST", `${BASE}/instances`);
			expect(lastBody()).toEqual({
				project_id: "project-123",
				name: "mydb",
				engine: "PostgreSQL-15",
				node_type: "db-dev-s",
			});
		});

		it("creates instance with all options", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-new", name: "mydb" });
			await handlers.handleCreateInstance({
				name: "mydb",
				engine: "MySQL-8",
				node_type: "db-play2-pico",
				region: "nl-ams",
				project_id: "proj-custom",
				is_ha_cluster: true,
				disable_backup: false,
				volume_type: "bssd",
				volume_size: 50000000000,
				user_name: "admin",
				password: "secret",
				tags: ["env:staging"],
				backup_same_region: true,
				init_endpoints: [
					{
						private_network: {
							private_network_id: "pn-123",
							service_ip: "10.0.0.1/24",
						},
					},
				],
			});
			expectJsonRequest("POST", "/rdb/v1/regions/nl-ams/instances");
			const body = lastBody();
			expect(body.project_id).toBe("proj-custom");
			expect(body.is_ha_cluster).toBe(true);
			expect(body.disable_backup).toBe(false);
			expect(body.volume_type).toBe("bssd");
			expect(body.volume_size).toBe(50000000000);
			expect(body.user_name).toBe("admin");
			expect(body.password).toBe("secret");
			expect(body.tags).toEqual(["env:staging"]);
			expect(body.backup_same_region).toBe(true);
			expect(body.init_endpoints).toHaveLength(1);
		});

		it("handles creation error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(400, "Bad Request"));
			const result = await handlers.handleCreateInstance({
				name: "bad",
				engine: "invalid",
				node_type: "bad",
			});
			expect(isError(result)).toBe(true);
			expect(result.content[0].text).toContain("invalid_input");
		});
	});

	describe("handleUpdateInstance", () => {
		it("updates instance name", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1", name: "new-name" });
			const result = await handlers.handleUpdateInstance({
				instance_id: "inst-1",
				name: "new-name",
			});
			expect(result.content[0].text).toContain('"new-name"');
			expectJsonRequest("PATCH", `${BASE}/instances/inst-1`);
			expect(lastBody()).toEqual({ name: "new-name" });
		});

		it("updates all fields", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1" });
			await handlers.handleUpdateInstance({
				instance_id: "inst-1",
				name: "updated",
				tags: ["new-tag"],
				backup_schedule_frequency: 24,
				backup_schedule_retention: 7,
				is_backup_schedule_disabled: false,
				backup_same_region: true,
			});
			expect(lastBody()).toEqual({
				name: "updated",
				tags: ["new-tag"],
				backup_schedule_frequency: 24,
				backup_schedule_retention: 7,
				is_backup_schedule_disabled: false,
				backup_same_region: true,
			});
		});

		it("sends an empty JSON object when no fields are given", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1" });
			await handlers.handleUpdateInstance({ instance_id: "inst-1" });
			expectJsonRequest("PATCH", `${BASE}/instances/inst-1`);
			expect(lastRequest().body).toBe("{}");
		});

		it("handles update error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleUpdateInstance({
				instance_id: "missing",
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleDeleteInstance", () => {
		it("deletes instance", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handlers.handleDeleteInstance({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain("{}");
			expectBodylessRequest("DELETE", `${BASE}/instances/inst-1`);
		});

		it("returns the instance object when the API echoes it back", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1", status: "deleting" });
			const result = await handlers.handleDeleteInstance({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain('"deleting"');
		});

		it("handles delete error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleDeleteInstance({ instance_id: "missing" });
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleUpgradeInstance", () => {
		it("upgrades node type", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1", node_type: "db-gp-m" });
			const result = await handlers.handleUpgradeInstance({
				instance_id: "inst-1",
				node_type: "db-gp-m",
			});
			expect(result.content[0].text).toContain('"db-gp-m"');
			expectJsonRequest("POST", `${BASE}/instances/inst-1/upgrade`);
			expect(lastBody()).toEqual({ node_type: "db-gp-m" });
		});

		it("upgrades with all options", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1" });
			await handlers.handleUpgradeInstance({
				instance_id: "inst-1",
				node_type: "db-gp-l",
				enable_ha: true,
				volume_size: 100000000000,
				volume_type: "bssd",
				upgradable_version_id: "ver-1",
				major_upgrade_workflow: {
					upgradable_version_id: "ver-1",
					with_endpoints: true,
				},
			});
			expect(lastBody()).toEqual({
				node_type: "db-gp-l",
				enable_ha: true,
				volume_size: 100000000000,
				volume_type: "bssd",
				upgradable_version_id: "ver-1",
				major_upgrade_workflow: { upgradable_version_id: "ver-1", with_endpoints: true },
			});
		});

		it("handles upgrade error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(400, "Bad Request"));
			const result = await handlers.handleUpgradeInstance({
				instance_id: "inst-1",
			});
			expect(isError(result)).toBe(true);
		});
	});

	// --- Database Handlers ---

	describe("handleListDatabases", () => {
		it("lists databases with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				databases: [{ name: "mydb", owner: "admin", managed: false, size: 1024 }],
				total_count: 1,
			});
			const result = await handlers.handleListDatabases({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect(result.content[0].text).toContain('"mydb"');
			expectBodylessRequest("GET", `${BASE}/instances/inst-1/databases`);
			expect(lastQuery().toString()).toBe("page=1&page_size=50");
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ databases: [], total_count: 0 });
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListDatabases({ instance_id: "inst-1" } as any);
			expect(result.content[0].text).toContain('"page": 1');
			expect(lastQuery().get("page_size")).toBe("50");
		});

		it("lists databases with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ databases: [], total_count: 0 });
			await handlers.handleListDatabases({
				instance_id: "inst-1",
				region: "nl-ams",
				page: 2,
				pageSize: 5,
				name: "test",
				managed: true,
				owner: "admin",
				order_by: "size_desc",
			});
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/instances/inst-1/databases");
			const query = lastQuery();
			expect(query.get("page")).toBe("2");
			expect(query.get("page_size")).toBe("5");
			expect(query.get("name")).toBe("test");
			expect(query.get("managed")).toBe("true");
			expect(query.get("owner")).toBe("admin");
			expect(query.get("order_by")).toBe("size_desc");
		});

		it("serialises managed=false explicitly", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ databases: [], total_count: 0 });
			await handlers.handleListDatabases({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
				managed: false,
			});
			expect(lastQuery().get("managed")).toBe("false");
		});

		it("handles list databases error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(401, "Unauthorized"));
			const result = await handlers.handleListDatabases({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect(isError(result)).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("handleCreateDatabase", () => {
		it("creates database", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ name: "newdb", owner: "admin", managed: false, size: 0 });
			const result = await handlers.handleCreateDatabase({
				instance_id: "inst-1",
				name: "newdb",
			});
			expect(result.content[0].text).toContain('"newdb"');
			expectJsonRequest("POST", `${BASE}/instances/inst-1/databases`);
			expect(lastBody()).toEqual({ name: "newdb" });
		});

		it("handles create database error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(400, "Bad Request"));
			const result = await handlers.handleCreateDatabase({
				instance_id: "inst-1",
				name: "bad",
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleDeleteDatabase", () => {
		it("deletes database", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handlers.handleDeleteDatabase({
				instance_id: "inst-1",
				name: "mydb",
			});
			expect(result.content[0].text).toContain("{}");
			expectBodylessRequest("DELETE", `${BASE}/instances/inst-1/databases/mydb`);
		});

		it("handles delete database error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleDeleteDatabase({
				instance_id: "inst-1",
				name: "missing",
			});
			expect(isError(result)).toBe(true);
		});
	});

	// --- User Handlers ---

	describe("handleListUsers", () => {
		it("lists users with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				users: [{ name: "admin", is_admin: true }],
				total_count: 1,
			});
			const result = await handlers.handleListUsers({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect(result.content[0].text).toContain('"admin"');
			expectBodylessRequest("GET", `${BASE}/instances/inst-1/users`);
			expect(lastQuery().toString()).toBe("page=1&page_size=50");
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ users: [], total_count: 0 });
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListUsers({ instance_id: "inst-1" } as any);
			expect(result.content[0].text).toContain('"page": 1');
			expect(lastQuery().get("page_size")).toBe("50");
		});

		it("lists users with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ users: [], total_count: 0 });
			await handlers.handleListUsers({
				instance_id: "inst-1",
				region: "nl-ams",
				page: 2,
				pageSize: 5,
				name: "admin",
				order_by: "is_admin_desc",
			});
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/instances/inst-1/users");
			const query = lastQuery();
			expect(query.get("page")).toBe("2");
			expect(query.get("page_size")).toBe("5");
			expect(query.get("name")).toBe("admin");
			expect(query.get("order_by")).toBe("is_admin_desc");
		});

		it("handles list users error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(429, "Rate limited"));
			const result = await handlers.handleListUsers({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect(isError(result)).toBe(true);
			expect(result.content[0].text).toContain("rate_limited");
		});
	});

	describe("handleCreateUser", () => {
		it("creates user with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ name: "newuser", is_admin: false });
			const result = await handlers.handleCreateUser({
				instance_id: "inst-1",
				name: "newuser",
				password: "secret123",
			});
			expect(result.content[0].text).toContain('"newuser"');
			expectJsonRequest("POST", `${BASE}/instances/inst-1/users`);
			expect(lastBody()).toEqual({ name: "newuser", password: "secret123" });
		});

		it("creates admin user", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ name: "admin2", is_admin: true });
			await handlers.handleCreateUser({
				instance_id: "inst-1",
				name: "admin2",
				password: "secret",
				is_admin: true,
			});
			expect(lastBody()).toEqual({ name: "admin2", password: "secret", is_admin: true });
		});

		it("handles create user error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(400, "Bad Request"));
			const result = await handlers.handleCreateUser({
				instance_id: "inst-1",
				name: "bad",
				password: "x",
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleUpdateUser", () => {
		it("updates user password", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ name: "user1", is_admin: false });
			const result = await handlers.handleUpdateUser({
				instance_id: "inst-1",
				name: "user1",
				password: "newpass",
			});
			expect(result.content[0].text).toContain('"user1"');
			expectJsonRequest("PATCH", `${BASE}/instances/inst-1/users/user1`);
			expect(lastBody()).toEqual({ password: "newpass" });
		});

		it("updates user admin status", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ name: "user1", is_admin: true });
			await handlers.handleUpdateUser({
				instance_id: "inst-1",
				name: "user1",
				is_admin: true,
			});
			expect(lastBody()).toEqual({ is_admin: true });
		});

		it("handles update user error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleUpdateUser({
				instance_id: "inst-1",
				name: "missing",
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleDeleteUser", () => {
		it("deletes user", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handlers.handleDeleteUser({
				instance_id: "inst-1",
				name: "user1",
			});
			expect(result.content[0].text).toContain("{}");
			expectBodylessRequest("DELETE", `${BASE}/instances/inst-1/users/user1`);
		});

		it("handles delete user error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleDeleteUser({
				instance_id: "inst-1",
				name: "missing",
			});
			expect(isError(result)).toBe(true);
		});
	});

	// --- Backup Handlers ---

	describe("handleListBackups", () => {
		it("lists backups with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				database_backups: [{ id: "bak-1", name: "daily-backup" }],
				total_count: 1,
			});
			const result = await handlers.handleListBackups({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain('"bak-1"');
			expectBodylessRequest("GET", `${BASE}/backups`);
			expect(lastQuery().toString()).toBe("page=1&page_size=50");
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ database_backups: [], total_count: 0 });
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListBackups({} as any);
			expect(result.content[0].text).toContain('"page": 1');
			expect(lastQuery().get("page_size")).toBe("50");
		});

		it("lists backups with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ database_backups: [], total_count: 0 });
			await handlers.handleListBackups({
				region: "nl-ams",
				instance_id: "inst-1",
				name: "daily",
				order_by: "created_at_desc",
				project_id: "proj-1",
				page: 2,
				pageSize: 10,
			});
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/backups");
			const query = lastQuery();
			expect(query.get("page")).toBe("2");
			expect(query.get("page_size")).toBe("10");
			expect(query.get("instance_id")).toBe("inst-1");
			expect(query.get("name")).toBe("daily");
			expect(query.get("order_by")).toBe("created_at_desc");
			expect(query.get("project_id")).toBe("proj-1");
		});

		it("handles list backups error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(500, "Internal Error"));
			const result = await handlers.handleListBackups({ page: 1, pageSize: 50 });
			expect(isError(result)).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});
	});

	describe("handleCreateBackup", () => {
		it("creates backup with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "bak-new", name: "my-backup", status: "creating" });
			const result = await handlers.handleCreateBackup({
				instance_id: "inst-1",
				name: "my-backup",
			});
			expect(result.content[0].text).toContain('"bak-new"');
			expectJsonRequest("POST", `${BASE}/backups`);
			expect(lastBody()).toEqual({ instance_id: "inst-1", name: "my-backup" });
		});

		it("creates backup with all options", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "bak-new", name: "full-backup" });
			await handlers.handleCreateBackup({
				instance_id: "inst-1",
				name: "full-backup",
				database_name: "mydb",
				expires_at: "2026-12-31T23:59:59Z",
			});
			expect(lastBody()).toEqual({
				instance_id: "inst-1",
				name: "full-backup",
				database_name: "mydb",
				expires_at: "2026-12-31T23:59:59Z",
			});
		});

		it("handles create backup error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(400, "Bad Request"));
			const result = await handlers.handleCreateBackup({
				instance_id: "inst-1",
				name: "bad",
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleRestoreBackup", () => {
		it("restores backup with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1", status: "restoring" });
			const result = await handlers.handleRestoreBackup({
				backup_id: "bak-1",
				instance_id: "inst-1",
			});
			expect(result.content[0].text).toContain('"restoring"');
			expectJsonRequest("POST", `${BASE}/backups/bak-1/restore`);
			expect(lastBody()).toEqual({ instance_id: "inst-1" });
		});

		it("restores backup with database name", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-1" });
			await handlers.handleRestoreBackup({
				backup_id: "bak-1",
				instance_id: "inst-1",
				database_name: "target_db",
			});
			expect(lastBody()).toEqual({ instance_id: "inst-1", database_name: "target_db" });
		});

		it("handles restore backup error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleRestoreBackup({
				backup_id: "missing",
				instance_id: "inst-1",
			});
			expect(isError(result)).toBe(true);
		});
	});

	// --- Endpoint Handlers ---

	describe("handleListEndpoints", () => {
		it("lists endpoints from the instance object", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				id: "inst-1",
				endpoints: [{ id: "ep-1", ip: "1.2.3.4", port: 5432 }],
			});
			const result = await handlers.handleListEndpoints({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain('"ep-1"');
			expect(JSON.parse(result.content[0].text)).toEqual({
				endpoints: [{ id: "ep-1", ip: "1.2.3.4", port: 5432 }],
			});
			expectBodylessRequest("GET", `${BASE}/instances/inst-1`);
		});

		it("lists endpoints when field is missing", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({});
			const result = await handlers.handleListEndpoints({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain('"endpoints": []');
		});

		it("handles list endpoints error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleListEndpoints({ instance_id: "missing" });
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleCreateEndpoint", () => {
		it("creates endpoint", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "ep-new", ip: "10.0.0.1", port: 5432 });
			const result = await handlers.handleCreateEndpoint({
				instance_id: "inst-1",
				endpoint_spec: {
					private_network: {
						private_network_id: "pn-123",
						service_ip: "10.0.0.1/24",
					},
				},
			});
			expect(result.content[0].text).toContain('"ep-new"');
			expectJsonRequest("POST", `${BASE}/instances/inst-1/endpoints`);
			expect(lastBody()).toEqual({
				endpoint_spec: {
					private_network: { private_network_id: "pn-123", service_ip: "10.0.0.1/24" },
				},
			});
		});

		it("creates load balancer endpoint", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "ep-lb" });
			await handlers.handleCreateEndpoint({
				instance_id: "inst-1",
				endpoint_spec: { load_balancer: true },
			});
			expect(lastBody()).toEqual({ endpoint_spec: { load_balancer: true } });
		});

		it("handles create endpoint error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(400, "Bad Request"));
			const result = await handlers.handleCreateEndpoint({
				instance_id: "inst-1",
				endpoint_spec: { load_balancer: true },
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleDeleteEndpoint", () => {
		it("deletes endpoint", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handlers.handleDeleteEndpoint({ endpoint_id: "ep-1" });
			expect(result.content[0].text).toContain("{}");
			expectBodylessRequest("DELETE", `${BASE}/endpoints/ep-1`);
		});

		it("deletes endpoint in an explicit region", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(undefined);
			await handlers.handleDeleteEndpoint({ endpoint_id: "ep-1", region: "pl-waw" });
			expectBodylessRequest("DELETE", "/rdb/v1/regions/pl-waw/endpoints/ep-1");
		});

		it("handles delete endpoint error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleDeleteEndpoint({ endpoint_id: "missing" });
			expect(isError(result)).toBe(true);
		});
	});

	// --- ACL Handlers ---

	describe("handleListAclRules", () => {
		it("lists ACL rules", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				rules: [{ ip: "0.0.0.0/0", direction: "inbound", action: "allow" }],
				total_count: 1,
			});
			const result = await handlers.handleListAclRules({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect(result.content[0].text).toContain('"0.0.0.0/0"');
			expectBodylessRequest("GET", `${BASE}/instances/inst-1/acls`);
			expect(lastQuery().toString()).toBe("page=1&page_size=50");
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ rules: [], total_count: 0 });
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListAclRules({ instance_id: "inst-1" } as any);
			expect(result.content[0].text).toContain('"page": 1');
			expect(lastQuery().get("page_size")).toBe("50");
		});

		it("lists ACL rules with explicit pagination and region", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ rules: [], total_count: 0 });
			await handlers.handleListAclRules({
				instance_id: "inst-1",
				region: "nl-ams",
				page: 3,
				pageSize: 25,
			});
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/instances/inst-1/acls");
			expect(lastQuery().toString()).toBe("page=3&page_size=25");
		});

		it("handles list ACL rules error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleListAclRules({
				instance_id: "missing",
				page: 1,
				pageSize: 50,
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleAddAclRules", () => {
		it("adds ACL rules", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				rules: [{ ip: "10.0.0.0/8", direction: "inbound", action: "allow" }],
			});
			const result = await handlers.handleAddAclRules({
				instance_id: "inst-1",
				rules: [{ ip: "10.0.0.0/8", description: "Private network" }],
			});
			expect(result.content[0].text).toContain('"10.0.0.0/8"');
			expectJsonRequest("POST", `${BASE}/instances/inst-1/acls`);
			expect(lastBody()).toEqual({
				rules: [{ ip: "10.0.0.0/8", description: "Private network" }],
			});
		});

		it("handles add ACL rules error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(400, "Bad Request"));
			const result = await handlers.handleAddAclRules({
				instance_id: "inst-1",
				rules: [{ ip: "invalid" }],
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleDeleteAclRules", () => {
		it("deletes ACL rules with a JSON body on DELETE", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ rules: [] });
			const result = await handlers.handleDeleteAclRules({
				instance_id: "inst-1",
				acl_rule_ips: ["10.0.0.0/8"],
			});
			expect(result.content[0].text).toContain('"rules": []');
			expectJsonRequest("DELETE", `${BASE}/instances/inst-1/acls`);
			expect(lastBody()).toEqual({ acl_rule_ips: ["10.0.0.0/8"] });
		});

		it("returns {} when the API answers 204", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handlers.handleDeleteAclRules({
				instance_id: "inst-1",
				acl_rule_ips: ["10.0.0.0/8"],
			});
			expect(JSON.parse(result.content[0].text)).toEqual({});
		});

		it("handles delete ACL rules error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleDeleteAclRules({
				instance_id: "missing",
				acl_rule_ips: ["10.0.0.0/8"],
			});
			expect(isError(result)).toBe(true);
		});
	});

	// --- Snapshot Handlers ---

	describe("handleListSnapshots", () => {
		it("lists snapshots with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				snapshots: [{ id: "snap-1", name: "my-snapshot" }],
				total_count: 1,
			});
			const result = await handlers.handleListSnapshots({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain('"snap-1"');
			expectBodylessRequest("GET", `${BASE}/snapshots`);
			expect(lastQuery().toString()).toBe("page=1&page_size=50");
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ snapshots: [], total_count: 0 });
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListSnapshots({} as any);
			expect(result.content[0].text).toContain('"page": 1');
			expect(lastQuery().get("page_size")).toBe("50");
		});

		it("lists snapshots with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ snapshots: [], total_count: 0 });
			await handlers.handleListSnapshots({
				region: "nl-ams",
				instance_id: "inst-1",
				name: "snap",
				order_by: "name_asc",
				project_id: "proj-1",
				page: 3,
				pageSize: 20,
			});
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/snapshots");
			const query = lastQuery();
			expect(query.get("page")).toBe("3");
			expect(query.get("page_size")).toBe("20");
			expect(query.get("instance_id")).toBe("inst-1");
			expect(query.get("name")).toBe("snap");
			expect(query.get("order_by")).toBe("name_asc");
			expect(query.get("project_id")).toBe("proj-1");
		});

		it("handles list snapshots error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(500, "Internal Error"));
			const result = await handlers.handleListSnapshots({ page: 1, pageSize: 50 });
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleCreateSnapshot", () => {
		it("creates snapshot with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "snap-new", name: "my-snap", status: "creating" });
			const result = await handlers.handleCreateSnapshot({
				instance_id: "inst-1",
				name: "my-snap",
			});
			expect(result.content[0].text).toContain('"snap-new"');
			expectJsonRequest("POST", `${BASE}/snapshots`);
			expect(lastBody()).toEqual({ instance_id: "inst-1", name: "my-snap" });
		});

		it("creates snapshot with expiration", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "snap-new", name: "snap-exp" });
			await handlers.handleCreateSnapshot({
				instance_id: "inst-1",
				name: "snap-exp",
				expires_at: "2026-12-31T23:59:59Z",
			});
			expect(lastBody()).toEqual({
				instance_id: "inst-1",
				name: "snap-exp",
				expires_at: "2026-12-31T23:59:59Z",
			});
		});

		it("handles create snapshot error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(400, "Bad Request"));
			const result = await handlers.handleCreateSnapshot({
				instance_id: "inst-1",
				name: "bad",
			});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleRestoreSnapshot", () => {
		it("restores snapshot with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-new", name: "restored-db" });
			const result = await handlers.handleRestoreSnapshot({
				snapshot_id: "snap-1",
				instance_name: "restored-db",
			});
			expect(result.content[0].text).toContain('"restored-db"');
			expectJsonRequest("POST", `${BASE}/snapshots/snap-1/create-instance-from-snapshot`);
			expect(lastBody()).toEqual({ instance_name: "restored-db" });
		});

		it("restores snapshot with all options", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ id: "inst-new" });
			await handlers.handleRestoreSnapshot({
				snapshot_id: "snap-1",
				instance_name: "restored-db",
				node_type: "db-gp-m",
				is_ha_cluster: true,
			});
			expect(lastBody()).toEqual({
				instance_name: "restored-db",
				node_type: "db-gp-m",
				is_ha_cluster: true,
			});
		});

		it("handles restore snapshot error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(404, "Not Found"));
			const result = await handlers.handleRestoreSnapshot({
				snapshot_id: "missing",
				instance_name: "restored",
			});
			expect(isError(result)).toBe(true);
		});
	});

	// --- Reference Handlers ---

	describe("handleListNodeTypes", () => {
		it("lists node types with defaults", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				node_types: [{ name: "db-dev-s", stock_status: "available" }],
				total_count: 1,
			});
			const result = await handlers.handleListNodeTypes({});
			expect(result.content[0].text).toContain('"db-dev-s"');
			expect(JSON.parse(result.content[0].text)).toEqual({
				node_types: [{ name: "db-dev-s", stock_status: "available" }],
				total_count: 1,
			});
			expectBodylessRequest("GET", `${BASE}/node-types`);
			expect(lastQuery().toString()).toBe("");
		});

		it("lists node types including disabled", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ node_types: [], total_count: 0 });
			await handlers.handleListNodeTypes({
				region: "nl-ams",
				include_disabled_types: true,
			});
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/node-types");
			expect(lastQuery().toString()).toBe("include_disabled_types=true");
		});

		it("handles list node types error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(500, "Internal Error"));
			const result = await handlers.handleListNodeTypes({});
			expect(isError(result)).toBe(true);
		});
	});

	describe("handleListDatabaseEngines", () => {
		it("lists engines with defaults", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({
				engines: [
					{
						name: "PostgreSQL",
						default_version: "15",
						versions: [{ version: "15", name: "PostgreSQL 15" }],
					},
				],
				total_count: 1,
			});
			const result = await handlers.handleListDatabaseEngines({});
			expect(result.content[0].text).toContain('"PostgreSQL"');
			expectBodylessRequest("GET", `${BASE}/database-engines`);
			expect(lastQuery().toString()).toBe("");
		});

		it("lists engines with filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce({ engines: [], total_count: 0 });
			await handlers.handleListDatabaseEngines({
				region: "nl-ams",
				name: "MySQL",
				version: "8",
			});
			expectBodylessRequest("GET", "/rdb/v1/regions/nl-ams/database-engines");
			expect(lastQuery().toString()).toBe("name=MySQL&version=8");
		});

		it("handles list engines error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(scwError(500, "Internal Error"));
			const result = await handlers.handleListDatabaseEngines({});
			expect(isError(result)).toBe(true);
		});
	});

	// --- Error edge cases ---

	describe("error handling edge cases", () => {
		it("handles non-Error thrown values", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce("string error");
			const result = await handlers.handleListInstances({ page: 1, pageSize: 50 });
			expect(isError(result)).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});

		it("handles Error without status", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("Network failure"));
			const result = await handlers.handleGetInstance({ instance_id: "inst-1" });
			expect(isError(result)).toBe(true);
			expect(result.content[0].text).toContain("server_error");
			expect(result.content[0].text).toContain("Network failure");
		});
	});
});
