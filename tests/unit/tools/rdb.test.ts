import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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

function jsonResponse(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		statusText: status === 200 ? "OK" : "Error",
		headers: { "Content-Type": "application/json" },
	});
}

function errorResponse(status: number, message: string) {
	const response = new Response(JSON.stringify({ message }), {
		status,
		statusText: message,
		headers: { "Content-Type": "application/json" },
	});
	return response;
}

describe("rdb module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerRdbTools(server)).not.toThrow();
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

	// --- Instance Handlers ---

	describe("handleListInstances", () => {
		it("lists instances with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({ instances: [{ id: "inst-1", name: "db-1" }], total_count: 1 }),
			);
			const result = await handlers.handleListInstances({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain('"inst-1"');
			expect(result.content[0].text).toContain('"totalCount": 1');
			expect(mockFetch).toHaveBeenCalledTimes(1);
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ instances: [], total_count: 0 }));
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListInstances({} as any);
			expect(result.content[0].text).toContain('"page": 1');
		});

		it("lists instances with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ instances: [], total_count: 0 }));
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
			const callUrl = mockFetch.mock.calls[0][0].url;
			expect(callUrl).toContain("nl-ams");
			expect(callUrl).toContain("page=2");
			expect(callUrl).toContain("page_size=10");
			expect(callUrl).toContain("project_id=proj-1");
			expect(callUrl).toContain("name=test");
			expect(callUrl).toContain("order_by=name_asc");
			expect(callUrl).toContain("tags=env%3Aprod");
			expect(callUrl).toContain("tags=team%3Abackend");
		});

		it("handles API errors", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(403, "Forbidden"));
			const result = await handlers.handleListInstances({ page: 1, pageSize: 50 });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("permission_denied");
		});
	});

	describe("handleGetInstance", () => {
		it("gets instance by ID", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({ id: "inst-1", name: "mydb", status: "ready" }),
			);
			const result = await handlers.handleGetInstance({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain('"inst-1"');
		});

		it("gets instance with explicit region", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-1", name: "mydb" }));
			await handlers.handleGetInstance({
				instance_id: "inst-1",
				region: "nl-ams",
			});
			expect(mockFetch.mock.calls[0][0].url).toContain("nl-ams");
		});

		it("handles not found error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleGetInstance({ instance_id: "missing" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("not_found");
		});
	});

	describe("handleCreateInstance", () => {
		it("creates instance with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({ id: "inst-new", name: "mydb", status: "provisioning" }),
			);
			const result = await handlers.handleCreateInstance({
				name: "mydb",
				engine: "PostgreSQL-15",
				node_type: "db-dev-s",
			});
			expect(result.content[0].text).toContain('"inst-new"');
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.project_id).toBe("project-123");
			expect(body.name).toBe("mydb");
			expect(body.engine).toBe("PostgreSQL-15");
		});

		it("creates instance with all options", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-new", name: "mydb" }));
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
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.project_id).toBe("proj-custom");
			expect(body.is_ha_cluster).toBe(true);
			expect(body.volume_type).toBe("bssd");
			expect(body.user_name).toBe("admin");
			expect(body.tags).toEqual(["env:staging"]);
			expect(body.backup_same_region).toBe(true);
			expect(body.init_endpoints).toHaveLength(1);
		});

		it("handles creation error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(400, "Bad Request"));
			const result = await handlers.handleCreateInstance({
				name: "bad",
				engine: "invalid",
				node_type: "bad",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateInstance", () => {
		it("updates instance name", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-1", name: "new-name" }));
			const result = await handlers.handleUpdateInstance({
				instance_id: "inst-1",
				name: "new-name",
			});
			expect(result.content[0].text).toContain('"new-name"');
		});

		it("updates all fields", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-1" }));
			await handlers.handleUpdateInstance({
				instance_id: "inst-1",
				name: "updated",
				tags: ["new-tag"],
				backup_schedule_frequency: 24,
				backup_schedule_retention: 7,
				is_backup_schedule_disabled: false,
				backup_same_region: true,
			});
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.name).toBe("updated");
			expect(body.tags).toEqual(["new-tag"]);
			expect(body.backup_schedule_frequency).toBe(24);
			expect(body.backup_schedule_retention).toBe(7);
			expect(body.is_backup_schedule_disabled).toBe(false);
			expect(body.backup_same_region).toBe(true);
		});

		it("handles update error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleUpdateInstance({
				instance_id: "missing",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteInstance", () => {
		it("deletes instance", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				new Response(null, { status: 204, statusText: "No Content" }),
			);
			const result = await handlers.handleDeleteInstance({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain("{}");
		});

		it("handles delete error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleDeleteInstance({ instance_id: "missing" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpgradeInstance", () => {
		it("upgrades node type", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-1", node_type: "db-gp-m" }));
			const result = await handlers.handleUpgradeInstance({
				instance_id: "inst-1",
				node_type: "db-gp-m",
			});
			expect(result.content[0].text).toContain('"db-gp-m"');
		});

		it("upgrades with all options", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-1" }));
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
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.node_type).toBe("db-gp-l");
			expect(body.enable_ha).toBe(true);
			expect(body.volume_size).toBe(100000000000);
			expect(body.volume_type).toBe("bssd");
			expect(body.upgradable_version_id).toBe("ver-1");
			expect(body.major_upgrade_workflow.with_endpoints).toBe(true);
		});

		it("handles upgrade error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(400, "Bad Request"));
			const result = await handlers.handleUpgradeInstance({
				instance_id: "inst-1",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Database Handlers ---

	describe("handleListDatabases", () => {
		it("lists databases with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					databases: [{ name: "mydb", owner: "admin", managed: false, size: 1024 }],
					total_count: 1,
				}),
			);
			const result = await handlers.handleListDatabases({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect(result.content[0].text).toContain('"mydb"');
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ databases: [], total_count: 0 }));
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListDatabases({ instance_id: "inst-1" } as any);
			expect(result.content[0].text).toContain('"page": 1');
		});

		it("lists databases with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ databases: [], total_count: 0 }));
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
			const callUrl = mockFetch.mock.calls[0][0].url;
			expect(callUrl).toContain("nl-ams");
			expect(callUrl).toContain("name=test");
			expect(callUrl).toContain("managed=true");
			expect(callUrl).toContain("owner=admin");
			expect(callUrl).toContain("order_by=size_desc");
		});

		it("handles list databases error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(401, "Unauthorized"));
			const result = await handlers.handleListDatabases({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateDatabase", () => {
		it("creates database", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({ name: "newdb", owner: "admin", managed: false, size: 0 }),
			);
			const result = await handlers.handleCreateDatabase({
				instance_id: "inst-1",
				name: "newdb",
			});
			expect(result.content[0].text).toContain('"newdb"');
		});

		it("handles create database error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(400, "Bad Request"));
			const result = await handlers.handleCreateDatabase({
				instance_id: "inst-1",
				name: "bad",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteDatabase", () => {
		it("deletes database", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				new Response(null, { status: 204, statusText: "No Content" }),
			);
			const result = await handlers.handleDeleteDatabase({
				instance_id: "inst-1",
				name: "mydb",
			});
			expect(result.content[0].text).toContain("{}");
		});

		it("handles delete database error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleDeleteDatabase({
				instance_id: "inst-1",
				name: "missing",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- User Handlers ---

	describe("handleListUsers", () => {
		it("lists users with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					users: [{ name: "admin", is_admin: true }],
					total_count: 1,
				}),
			);
			const result = await handlers.handleListUsers({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect(result.content[0].text).toContain('"admin"');
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ users: [], total_count: 0 }));
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListUsers({ instance_id: "inst-1" } as any);
			expect(result.content[0].text).toContain('"page": 1');
		});

		it("lists users with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ users: [], total_count: 0 }));
			await handlers.handleListUsers({
				instance_id: "inst-1",
				region: "nl-ams",
				page: 2,
				pageSize: 5,
				name: "admin",
				order_by: "is_admin_desc",
			});
			const callUrl = mockFetch.mock.calls[0][0].url;
			expect(callUrl).toContain("name=admin");
			expect(callUrl).toContain("order_by=is_admin_desc");
		});

		it("handles list users error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(429, "Rate limited"));
			const result = await handlers.handleListUsers({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("rate_limited");
		});
	});

	describe("handleCreateUser", () => {
		it("creates user with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ name: "newuser", is_admin: false }));
			const result = await handlers.handleCreateUser({
				instance_id: "inst-1",
				name: "newuser",
				password: "secret123",
			});
			expect(result.content[0].text).toContain('"newuser"');
		});

		it("creates admin user", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ name: "admin2", is_admin: true }));
			await handlers.handleCreateUser({
				instance_id: "inst-1",
				name: "admin2",
				password: "secret",
				is_admin: true,
			});
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.is_admin).toBe(true);
		});

		it("handles create user error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(400, "Bad Request"));
			const result = await handlers.handleCreateUser({
				instance_id: "inst-1",
				name: "bad",
				password: "x",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateUser", () => {
		it("updates user password", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ name: "user1", is_admin: false }));
			const result = await handlers.handleUpdateUser({
				instance_id: "inst-1",
				name: "user1",
				password: "newpass",
			});
			expect(result.content[0].text).toContain('"user1"');
		});

		it("updates user admin status", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ name: "user1", is_admin: true }));
			await handlers.handleUpdateUser({
				instance_id: "inst-1",
				name: "user1",
				is_admin: true,
			});
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.is_admin).toBe(true);
		});

		it("handles update user error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleUpdateUser({
				instance_id: "inst-1",
				name: "missing",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteUser", () => {
		it("deletes user", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				new Response(null, { status: 204, statusText: "No Content" }),
			);
			const result = await handlers.handleDeleteUser({
				instance_id: "inst-1",
				name: "user1",
			});
			expect(result.content[0].text).toContain("{}");
		});

		it("handles delete user error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleDeleteUser({
				instance_id: "inst-1",
				name: "missing",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Backup Handlers ---

	describe("handleListBackups", () => {
		it("lists backups with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					database_backups: [{ id: "bak-1", name: "daily-backup" }],
					total_count: 1,
				}),
			);
			const result = await handlers.handleListBackups({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain('"bak-1"');
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ database_backups: [], total_count: 0 }));
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListBackups({} as any);
			expect(result.content[0].text).toContain('"page": 1');
		});

		it("lists backups with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ database_backups: [], total_count: 0 }));
			await handlers.handleListBackups({
				region: "nl-ams",
				instance_id: "inst-1",
				name: "daily",
				order_by: "created_at_desc",
				project_id: "proj-1",
				page: 2,
				pageSize: 10,
			});
			const callUrl = mockFetch.mock.calls[0][0].url;
			expect(callUrl).toContain("instance_id=inst-1");
			expect(callUrl).toContain("name=daily");
			expect(callUrl).toContain("order_by=created_at_desc");
			expect(callUrl).toContain("project_id=proj-1");
		});

		it("handles list backups error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(500, "Internal Error"));
			const result = await handlers.handleListBackups({ page: 1, pageSize: 50 });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateBackup", () => {
		it("creates backup with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({ id: "bak-new", name: "my-backup", status: "creating" }),
			);
			const result = await handlers.handleCreateBackup({
				instance_id: "inst-1",
				name: "my-backup",
			});
			expect(result.content[0].text).toContain('"bak-new"');
		});

		it("creates backup with all options", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "bak-new", name: "full-backup" }));
			await handlers.handleCreateBackup({
				instance_id: "inst-1",
				name: "full-backup",
				database_name: "mydb",
				expires_at: "2026-12-31T23:59:59Z",
			});
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.database_name).toBe("mydb");
			expect(body.expires_at).toBe("2026-12-31T23:59:59Z");
		});

		it("handles create backup error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(400, "Bad Request"));
			const result = await handlers.handleCreateBackup({
				instance_id: "inst-1",
				name: "bad",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleRestoreBackup", () => {
		it("restores backup with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-1", status: "restoring" }));
			const result = await handlers.handleRestoreBackup({
				backup_id: "bak-1",
				instance_id: "inst-1",
			});
			expect(result.content[0].text).toContain('"restoring"');
		});

		it("restores backup with database name", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-1" }));
			await handlers.handleRestoreBackup({
				backup_id: "bak-1",
				instance_id: "inst-1",
				database_name: "target_db",
			});
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.database_name).toBe("target_db");
		});

		it("handles restore backup error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleRestoreBackup({
				backup_id: "missing",
				instance_id: "inst-1",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Endpoint Handlers ---

	describe("handleListEndpoints", () => {
		it("lists endpoints", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					endpoints: [{ id: "ep-1", ip: "1.2.3.4", port: 5432 }],
				}),
			);
			const result = await handlers.handleListEndpoints({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain('"ep-1"');
		});

		it("lists endpoints when field is missing", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({}));
			const result = await handlers.handleListEndpoints({ instance_id: "inst-1" });
			expect(result.content[0].text).toContain('"endpoints": []');
		});

		it("handles list endpoints error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleListEndpoints({ instance_id: "missing" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateEndpoint", () => {
		it("creates endpoint", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "ep-new", ip: "10.0.0.1", port: 5432 }));
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
		});

		it("creates load balancer endpoint", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "ep-lb" }));
			await handlers.handleCreateEndpoint({
				instance_id: "inst-1",
				endpoint_spec: { load_balancer: true },
			});
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.endpoint_spec.load_balancer).toBe(true);
		});

		it("handles create endpoint error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(400, "Bad Request"));
			const result = await handlers.handleCreateEndpoint({
				instance_id: "inst-1",
				endpoint_spec: { load_balancer: true },
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteEndpoint", () => {
		it("deletes endpoint", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				new Response(null, { status: 204, statusText: "No Content" }),
			);
			const result = await handlers.handleDeleteEndpoint({ endpoint_id: "ep-1" });
			expect(result.content[0].text).toContain("{}");
		});

		it("handles delete endpoint error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleDeleteEndpoint({ endpoint_id: "missing" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- ACL Handlers ---

	describe("handleListAclRules", () => {
		it("lists ACL rules", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					rules: [{ ip: "0.0.0.0/0", direction: "inbound", action: "allow" }],
					total_count: 1,
				}),
			);
			const result = await handlers.handleListAclRules({
				instance_id: "inst-1",
				page: 1,
				pageSize: 50,
			});
			expect(result.content[0].text).toContain('"0.0.0.0/0"');
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ rules: [], total_count: 0 }));
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListAclRules({ instance_id: "inst-1" } as any);
			expect(result.content[0].text).toContain('"page": 1');
		});

		it("handles list ACL rules error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleListAclRules({
				instance_id: "missing",
				page: 1,
				pageSize: 50,
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleAddAclRules", () => {
		it("adds ACL rules", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					rules: [{ ip: "10.0.0.0/8", direction: "inbound", action: "allow" }],
				}),
			);
			const result = await handlers.handleAddAclRules({
				instance_id: "inst-1",
				rules: [{ ip: "10.0.0.0/8", description: "Private network" }],
			});
			expect(result.content[0].text).toContain('"10.0.0.0/8"');
		});

		it("handles add ACL rules error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(400, "Bad Request"));
			const result = await handlers.handleAddAclRules({
				instance_id: "inst-1",
				rules: [{ ip: "invalid" }],
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteAclRules", () => {
		it("deletes ACL rules", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ rules: [] }));
			const result = await handlers.handleDeleteAclRules({
				instance_id: "inst-1",
				acl_rule_ips: ["10.0.0.0/8"],
			});
			expect(result.content[0].text).toContain('"rules": []');
		});

		it("handles delete ACL rules error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleDeleteAclRules({
				instance_id: "missing",
				acl_rule_ips: ["10.0.0.0/8"],
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Snapshot Handlers ---

	describe("handleListSnapshots", () => {
		it("lists snapshots with default params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					snapshots: [{ id: "snap-1", name: "my-snapshot" }],
					total_count: 1,
				}),
			);
			const result = await handlers.handleListSnapshots({ page: 1, pageSize: 50 });
			expect(result.content[0].text).toContain('"snap-1"');
		});

		it("uses fallback page/pageSize when undefined", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ snapshots: [], total_count: 0 }));
			// biome-ignore lint: test exercises undefined pagination branch
			const result = await handlers.handleListSnapshots({} as any);
			expect(result.content[0].text).toContain('"page": 1');
		});

		it("lists snapshots with all filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ snapshots: [], total_count: 0 }));
			await handlers.handleListSnapshots({
				region: "nl-ams",
				instance_id: "inst-1",
				name: "snap",
				order_by: "name_asc",
				project_id: "proj-1",
				page: 3,
				pageSize: 20,
			});
			const callUrl = mockFetch.mock.calls[0][0].url;
			expect(callUrl).toContain("instance_id=inst-1");
			expect(callUrl).toContain("name=snap");
			expect(callUrl).toContain("order_by=name_asc");
			expect(callUrl).toContain("project_id=proj-1");
		});

		it("handles list snapshots error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(500, "Internal Error"));
			const result = await handlers.handleListSnapshots({ page: 1, pageSize: 50 });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateSnapshot", () => {
		it("creates snapshot with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({ id: "snap-new", name: "my-snap", status: "creating" }),
			);
			const result = await handlers.handleCreateSnapshot({
				instance_id: "inst-1",
				name: "my-snap",
			});
			expect(result.content[0].text).toContain('"snap-new"');
		});

		it("creates snapshot with expiration", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "snap-new", name: "snap-exp" }));
			await handlers.handleCreateSnapshot({
				instance_id: "inst-1",
				name: "snap-exp",
				expires_at: "2026-12-31T23:59:59Z",
			});
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.expires_at).toBe("2026-12-31T23:59:59Z");
		});

		it("handles create snapshot error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(400, "Bad Request"));
			const result = await handlers.handleCreateSnapshot({
				instance_id: "inst-1",
				name: "bad",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleRestoreSnapshot", () => {
		it("restores snapshot with minimal params", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-new", name: "restored-db" }));
			const result = await handlers.handleRestoreSnapshot({
				snapshot_id: "snap-1",
				instance_name: "restored-db",
			});
			expect(result.content[0].text).toContain('"restored-db"');
		});

		it("restores snapshot with all options", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ id: "inst-new" }));
			await handlers.handleRestoreSnapshot({
				snapshot_id: "snap-1",
				instance_name: "restored-db",
				node_type: "db-gp-m",
				is_ha_cluster: true,
			});
			const body = JSON.parse(await mockFetch.mock.calls[0][0].text());
			expect(body.instance_name).toBe("restored-db");
			expect(body.node_type).toBe("db-gp-m");
			expect(body.is_ha_cluster).toBe(true);
		});

		it("handles restore snapshot error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(404, "Not Found"));
			const result = await handlers.handleRestoreSnapshot({
				snapshot_id: "missing",
				instance_name: "restored",
			});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Reference Handlers ---

	describe("handleListNodeTypes", () => {
		it("lists node types with defaults", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					node_types: [{ name: "db-dev-s", stock_status: "available" }],
					total_count: 1,
				}),
			);
			const result = await handlers.handleListNodeTypes({});
			expect(result.content[0].text).toContain('"db-dev-s"');
		});

		it("lists node types including disabled", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ node_types: [], total_count: 0 }));
			await handlers.handleListNodeTypes({
				region: "nl-ams",
				include_disabled_types: true,
			});
			const callUrl = mockFetch.mock.calls[0][0].url;
			expect(callUrl).toContain("include_disabled_types=true");
		});

		it("handles list node types error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(500, "Internal Error"));
			const result = await handlers.handleListNodeTypes({});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	describe("handleListDatabaseEngines", () => {
		it("lists engines with defaults", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(
				jsonResponse({
					engines: [
						{
							name: "PostgreSQL",
							default_version: "15",
							versions: [{ version: "15", name: "PostgreSQL 15" }],
						},
					],
					total_count: 1,
				}),
			);
			const result = await handlers.handleListDatabaseEngines({});
			expect(result.content[0].text).toContain('"PostgreSQL"');
		});

		it("lists engines with filters", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(jsonResponse({ engines: [], total_count: 0 }));
			await handlers.handleListDatabaseEngines({
				region: "nl-ams",
				name: "MySQL",
				version: "8",
			});
			const callUrl = mockFetch.mock.calls[0][0].url;
			expect(callUrl).toContain("name=MySQL");
			expect(callUrl).toContain("version=8");
		});

		it("handles list engines error", async () => {
			const handlers = await importHandlers();
			mockFetch.mockResolvedValueOnce(errorResponse(500, "Internal Error"));
			const result = await handlers.handleListDatabaseEngines({});
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
		});
	});

	// --- Error edge cases ---

	describe("error handling edge cases", () => {
		it("handles non-Error thrown values", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce("string error");
			const result = await handlers.handleListInstances({ page: 1, pageSize: 50 });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});

		it("handles Error without statusCode", async () => {
			const handlers = await importHandlers();
			mockFetch.mockRejectedValueOnce(new Error("Network failure"));
			const result = await handlers.handleGetInstance({ instance_id: "inst-1" });
			expect((result as unknown as { isError: boolean }).isError).toBe(true);
			expect(result.content[0].text).toContain("server_error");
		});
	});
});
