import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerMongodbTools } from "../../../src/tools/mongodb/index.js";

// Mock the shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXXXX",
		secretKey: "secret-key",
		defaultProjectId: "11111111-1111-1111-1111-111111111111",
		defaultOrganizationId: "org-id",
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

describe("mongodb module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerMongodbTools(server)).not.toThrow();
	});
});

describe("mongodb types", () => {
	it("validates InstanceStatus enum", async () => {
		const { InstanceStatus } = await import("../../../src/tools/mongodb/types.js");
		expect(InstanceStatus.parse("ready")).toBe("ready");
		expect(InstanceStatus.parse("provisioning")).toBe("provisioning");
		expect(() => InstanceStatus.parse("invalid")).toThrow();
	});

	it("validates SnapshotStatus enum", async () => {
		const { SnapshotStatus } = await import("../../../src/tools/mongodb/types.js");
		expect(SnapshotStatus.parse("ready")).toBe("ready");
		expect(SnapshotStatus.parse("creating")).toBe("creating");
		expect(() => SnapshotStatus.parse("invalid")).toThrow();
	});

	it("validates ListInstancesParams with defaults", async () => {
		const { ListInstancesParams } = await import("../../../src/tools/mongodb/types.js");
		const result = ListInstancesParams.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates ListInstancesParams with all fields", async () => {
		const { ListInstancesParams } = await import("../../../src/tools/mongodb/types.js");
		const result = ListInstancesParams.parse({
			region: "fr-par",
			page: 2,
			pageSize: 20,
			name: "my-db",
			tags: ["env:prod"],
			project_id: "11111111-1111-1111-1111-111111111111",
			organization_id: "22222222-2222-2222-2222-222222222222",
			order_by: "name_asc",
		});
		expect(result.name).toBe("my-db");
		expect(result.order_by).toBe("name_asc");
	});

	it("rejects invalid region format", async () => {
		const { GetInstanceParams } = await import("../../../src/tools/mongodb/types.js");
		expect(() =>
			GetInstanceParams.parse({
				region: "invalid",
				instance_id: "11111111-1111-1111-1111-111111111111",
			}),
		).toThrow();
	});

	it("validates CreateInstanceParams", async () => {
		const { CreateInstanceParams } = await import("../../../src/tools/mongodb/types.js");
		const result = CreateInstanceParams.parse({
			name: "test-db",
			version: "7.0.12",
			node_type: "MGDB-PLAY2-NANO",
			node_amount: 1,
			user_name: "admin",
			password: "secret123",
		});
		expect(result.name).toBe("test-db");
		expect(result.node_amount).toBe(1);
	});

	it("validates CreateInstanceParams with volume and endpoints", async () => {
		const { CreateInstanceParams } = await import("../../../src/tools/mongodb/types.js");
		const result = CreateInstanceParams.parse({
			name: "test-db",
			version: "7.0.12",
			node_type: "MGDB-PLAY2-NANO",
			node_amount: 1,
			user_name: "admin",
			password: "secret123",
			volume: { type: "sbs_5k", size_bytes: 10000000000 },
			endpoints: [
				{ private_network: { private_network_id: "44444444-4444-4444-4444-444444444444" } },
				{ public_network: {} },
			],
		});
		expect(result.volume?.type).toBe("sbs_5k");
		expect(result.endpoints).toHaveLength(2);
	});

	it("rejects CreateInstanceParams missing required fields", async () => {
		const { CreateInstanceParams } = await import("../../../src/tools/mongodb/types.js");
		expect(() => CreateInstanceParams.parse({ name: "test" })).toThrow();
	});

	it("validates UpdateInstanceParams", async () => {
		const { UpdateInstanceParams } = await import("../../../src/tools/mongodb/types.js");
		const result = UpdateInstanceParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			name: "new-name",
			tags: ["env:staging"],
			snapshot_schedule_frequency_hours: 24,
			snapshot_schedule_retention_days: 7,
			is_snapshot_schedule_enabled: true,
		});
		expect(result.name).toBe("new-name");
		expect(result.snapshot_schedule_frequency_hours).toBe(24);
		expect(result.is_snapshot_schedule_enabled).toBe(true);
	});

	it("validates DeleteInstanceParams", async () => {
		const { DeleteInstanceParams } = await import("../../../src/tools/mongodb/types.js");
		const result = DeleteInstanceParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.instance_id).toBe("11111111-1111-1111-1111-111111111111");
	});

	it("validates ListUsersParams", async () => {
		const { ListUsersParams } = await import("../../../src/tools/mongodb/types.js");
		const result = ListUsersParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			name: "admin",
			order_by: "name_asc",
		});
		expect(result.instance_id).toBe("11111111-1111-1111-1111-111111111111");
	});

	it("validates CreateUserParams", async () => {
		const { CreateUserParams } = await import("../../../src/tools/mongodb/types.js");
		const result = CreateUserParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			name: "newuser",
			password: "pass123",
		});
		expect(result.name).toBe("newuser");
	});

	it("validates UpdateUserParams", async () => {
		const { UpdateUserParams } = await import("../../../src/tools/mongodb/types.js");
		const result = UpdateUserParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			name: "admin",
			password: "newpass",
		});
		expect(result.password).toBe("newpass");
	});

	it("validates UpdateUserParams without password", async () => {
		const { UpdateUserParams } = await import("../../../src/tools/mongodb/types.js");
		const result = UpdateUserParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			name: "admin",
		});
		expect(result.password).toBeUndefined();
	});

	it("validates DeleteUserParams", async () => {
		const { DeleteUserParams } = await import("../../../src/tools/mongodb/types.js");
		const result = DeleteUserParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			name: "olduser",
		});
		expect(result.name).toBe("olduser");
	});

	it("validates ListSnapshotsParams", async () => {
		const { ListSnapshotsParams } = await import("../../../src/tools/mongodb/types.js");
		const result = ListSnapshotsParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			order_by: "created_at_desc",
		});
		expect(result.order_by).toBe("created_at_desc");
	});

	it("validates CreateSnapshotParams", async () => {
		const { CreateSnapshotParams } = await import("../../../src/tools/mongodb/types.js");
		const result = CreateSnapshotParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			name: "my-snapshot",
			expires_at: "2026-12-31T23:59:59Z",
		});
		expect(result.name).toBe("my-snapshot");
	});

	it("validates CreateSnapshotParams without expires_at", async () => {
		const { CreateSnapshotParams } = await import("../../../src/tools/mongodb/types.js");
		const result = CreateSnapshotParams.parse({
			instance_id: "11111111-1111-1111-1111-111111111111",
			name: "my-snapshot",
		});
		expect(result.expires_at).toBeUndefined();
	});

	it("validates RestoreSnapshotParams", async () => {
		const { RestoreSnapshotParams } = await import("../../../src/tools/mongodb/types.js");
		const result = RestoreSnapshotParams.parse({
			snapshot_id: "11111111-1111-1111-1111-111111111111",
			instance_name: "restored-db",
			node_type: "MGDB-PLAY2-NANO",
			node_amount: 1,
		});
		expect(result.instance_name).toBe("restored-db");
	});

	it("validates RestoreSnapshotParams with volume_type", async () => {
		const { RestoreSnapshotParams } = await import("../../../src/tools/mongodb/types.js");
		const result = RestoreSnapshotParams.parse({
			snapshot_id: "11111111-1111-1111-1111-111111111111",
			instance_name: "restored-db",
			node_type: "MGDB-PLAY2-NANO",
			node_amount: 1,
			volume_type: "sbs_15k",
		});
		expect(result.volume_type).toBe("sbs_15k");
	});

	it("validates DeleteSnapshotParams", async () => {
		const { DeleteSnapshotParams } = await import("../../../src/tools/mongodb/types.js");
		const result = DeleteSnapshotParams.parse({
			snapshot_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.snapshot_id).toBe("11111111-1111-1111-1111-111111111111");
	});

	it("validates ListNodeTypesParams", async () => {
		const { ListNodeTypesParams } = await import("../../../src/tools/mongodb/types.js");
		const result = ListNodeTypesParams.parse({
			include_disabled: true,
		});
		expect(result.include_disabled).toBe(true);
	});

	it("validates ListVersionsParams", async () => {
		const { ListVersionsParams } = await import("../../../src/tools/mongodb/types.js");
		const result = ListVersionsParams.parse({
			version: "7.0",
		});
		expect(result.version).toBe("7.0");
	});
});

describe("mongodb handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// Helper to get the ScwRequest object passed to client.fetch
	function getRequest(callIndex = 0) {
		return mockFetch.mock.calls[callIndex][0] as {
			method: string;
			path: string;
			body?: string;
			headers?: Record<string, string>;
			urlParams?: URLSearchParams;
		};
	}

	function getRequestBody(callIndex = 0): Record<string, unknown> {
		const req = getRequest(callIndex);
		return JSON.parse(req.body ?? "{}") as Record<string, unknown>;
	}

	// --- Instance Handlers ---

	describe("handleListInstances", () => {
		it("returns paginated instances", async () => {
			const { handleListInstances } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({
				instances: [{ id: "inst-1", name: "db1" }],
				total_count: 1,
			});

			const result = await handleListInstances({});
			expect(result.content[0].type).toBe("text");
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
		});

		it("passes filter parameters", async () => {
			const { handleListInstances } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ instances: [], total_count: 0 });

			await handleListInstances({
				region: "nl-ams",
				page: 2,
				pageSize: 10,
				name: "test",
				tags: ["env:prod", "team:backend"],
				project_id: "11111111-1111-1111-1111-111111111111",
				organization_id: "22222222-2222-2222-2222-222222222222",
				order_by: "name_asc",
			});

			const req = getRequest();
			expect(req.path).toContain("/nl-ams/instances");
			expect(req.method).toBe("GET");
			const params = req.urlParams?.toString() ?? "";
			expect(params).toContain("page=2");
			expect(params).toContain("page_size=10");
			expect(params).toContain("name=test");
			expect(params).toContain("order_by=name_asc");
			expect(params).toContain("project_id=11111111-1111-1111-1111-111111111111");
			expect(params).toContain("organization_id=22222222-2222-2222-2222-222222222222");
			expect(params).toContain("tags=env%3Aprod");
			expect(params).toContain("tags=team%3Abackend");
		});

		it("handles errors gracefully", async () => {
			const { handleListInstances } = await import("../../../src/tools/mongodb/handlers.js");
			const err = new Error("unauthorized");
			(err as Error & { statusCode: number }).statusCode = 401;
			mockFetch.mockRejectedValue(err);

			const result = await handleListInstances({});
			expect("isError" in result && result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetInstance", () => {
		it("returns instance details", async () => {
			const { handleGetInstance } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "inst-1", name: "my-db", status: "ready" });

			const result = await handleGetInstance({
				instance_id: "11111111-1111-1111-1111-111111111111",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("my-db");
			expect(data.status).toBe("ready");
		});

		it("uses provided region", async () => {
			const { handleGetInstance } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "inst-1" });

			await handleGetInstance({
				region: "nl-ams",
				instance_id: "11111111-1111-1111-1111-111111111111",
			});

			const req = getRequest();
			expect(req.path).toContain("/nl-ams/instances/");
		});

		it("handles not found error", async () => {
			const { handleGetInstance } = await import("../../../src/tools/mongodb/handlers.js");
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result = await handleGetInstance({
				instance_id: "11111111-1111-1111-1111-111111111111",
			});
			expect("isError" in result && result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("not_found");
		});
	});

	describe("handleCreateInstance", () => {
		it("creates an instance with required fields", async () => {
			const { handleCreateInstance } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "new-inst", name: "test-db", status: "provisioning" });

			const result = await handleCreateInstance({
				name: "test-db",
				version: "7.0.12",
				node_type: "MGDB-PLAY2-NANO",
				node_amount: 1,
				user_name: "admin",
				password: "secret",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("provisioning");

			const req = getRequest();
			const body = getRequestBody();
			expect(body.name).toBe("test-db");
			expect(body.node_amount).toBe(1);
			expect(body.project_id).toBe("11111111-1111-1111-1111-111111111111");
			expect(req.path).toContain("/mongodb/v1/regions/");
			expect(req.method).toBe("POST");
		});

		it("creates an instance with optional fields", async () => {
			const { handleCreateInstance } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "new-inst" });

			await handleCreateInstance({
				name: "test-db",
				version: "7.0.12",
				node_type: "MGDB-PLAY2-NANO",
				node_amount: 3,
				user_name: "admin",
				password: "secret",
				project_id: "22222222-2222-2222-2222-222222222222",
				tags: ["env:prod"],
				volume: { type: "sbs_5k", size_bytes: 10000000000 },
				endpoints: [
					{ private_network: { private_network_id: "44444444-4444-4444-4444-444444444444" } },
				],
			});

			const req = getRequest();
			const body = getRequestBody();
			expect(body.project_id).toBe("22222222-2222-2222-2222-222222222222");
			expect(body.tags).toEqual(["env:prod"]);
			expect((body.volume as Record<string, unknown>).type).toBe("sbs_5k");
			expect((body.volume as Record<string, unknown>).size_bytes).toBe(10000000000);
			expect(body.endpoints).toHaveLength(1);
		});

		it("handles creation error", async () => {
			const { handleCreateInstance } = await import("../../../src/tools/mongodb/handlers.js");
			const err = new Error("bad request");
			(err as Error & { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result = await handleCreateInstance({
				name: "test-db",
				version: "7.0.12",
				node_type: "MGDB-PLAY2-NANO",
				node_amount: 1,
				user_name: "admin",
				password: "secret",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdateInstance", () => {
		it("updates instance name", async () => {
			const { handleUpdateInstance } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "inst-1", name: "new-name" });

			const result = await handleUpdateInstance({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "new-name",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("new-name");

			const req = getRequest();
			expect(req.path).toContain("/instances/11111111-1111-1111-1111-111111111111");
			expect(req.method).toBe("PATCH");
		});

		it("updates instance tags and snapshot schedule", async () => {
			const { handleUpdateInstance } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "inst-1" });

			await handleUpdateInstance({
				instance_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:staging"],
				snapshot_schedule_frequency_hours: 24,
				snapshot_schedule_retention_days: 7,
				is_snapshot_schedule_enabled: true,
			});

			const req = getRequest();
			const body = getRequestBody();
			expect(body.tags).toEqual(["env:staging"]);
			expect(body.name).toBeUndefined();
			expect(body.snapshot_schedule_frequency_hours).toBe(24);
			expect(body.snapshot_schedule_retention_days).toBe(7);
			expect(body.is_snapshot_schedule_enabled).toBe(true);
		});

		it("handles update error", async () => {
			const { handleUpdateInstance } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("network error"));

			const result = await handleUpdateInstance({
				instance_id: "11111111-1111-1111-1111-111111111111",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteInstance", () => {
		it("deletes an instance", async () => {
			const { handleDeleteInstance } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "inst-1", status: "deleting" });

			const result = await handleDeleteInstance({
				instance_id: "11111111-1111-1111-1111-111111111111",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("deleting");

			const req = getRequest();
			expect(req.path).toContain("/instances/11111111-1111-1111-1111-111111111111");
			expect(req.method).toBe("DELETE");
		});

		it("handles delete error", async () => {
			const { handleDeleteInstance } = await import("../../../src/tools/mongodb/handlers.js");
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result = await handleDeleteInstance({
				instance_id: "11111111-1111-1111-1111-111111111111",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// --- User Handlers ---

	describe("handleListUsers", () => {
		it("returns paginated users", async () => {
			const { handleListUsers } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({
				users: [{ name: "admin" }],
				total_count: 1,
			});

			const result = await handleListUsers({
				instance_id: "11111111-1111-1111-1111-111111111111",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.items[0].name).toBe("admin");
		});

		it("passes filter and pagination", async () => {
			const { handleListUsers } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ users: [], total_count: 0 });

			await handleListUsers({
				instance_id: "11111111-1111-1111-1111-111111111111",
				page: 2,
				pageSize: 10,
				name: "admin",
				order_by: "name_desc",
			});

			const req = getRequest();
			expect(req.path).toContain("/users");
			const params = req.urlParams?.toString() ?? "";
			expect(params).toContain("page=2");
			expect(params).toContain("name=admin");
			expect(params).toContain("order_by=name_desc");
		});

		it("handles error", async () => {
			const { handleListUsers } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleListUsers({
				instance_id: "11111111-1111-1111-1111-111111111111",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreateUser", () => {
		it("creates a user", async () => {
			const { handleCreateUser } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ name: "newuser" });

			const result = await handleCreateUser({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "newuser",
				password: "pass123",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("newuser");

			const req = getRequest();
			const body = getRequestBody();
			expect(body.name).toBe("newuser");
			expect(body.password).toBe("pass123");
		});

		it("handles error", async () => {
			const { handleCreateUser } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleCreateUser({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "user",
				password: "pass",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdateUser", () => {
		it("updates user password", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ name: "admin" });

			const result = await handleUpdateUser({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "admin",
				password: "newpass",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("admin");

			const req = getRequest();
			expect(req.path).toContain("/users/admin");
			expect(req.method).toBe("PATCH");
		});

		it("sends empty body when no password provided", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ name: "admin" });

			await handleUpdateUser({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "admin",
			});

			const req = getRequest();
			const body = getRequestBody();
			expect(body).toEqual({});
		});

		it("handles error", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleUpdateUser({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "admin",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteUser", () => {
		it("deletes a user", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteUser({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "olduser",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toContain("olduser");

			const req = getRequest();
			expect(req.path).toContain("/users/olduser");
			expect(req.method).toBe("DELETE");
		});

		it("encodes special characters in username", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			await handleDeleteUser({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "user@domain",
			});

			const req = getRequest();
			expect(req.path).toContain("/users/user%40domain");
		});

		it("handles error", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleDeleteUser({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "user",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// --- Snapshot Handlers ---

	describe("handleListSnapshots", () => {
		it("returns paginated snapshots", async () => {
			const { handleListSnapshots } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({
				snapshots: [{ id: "snap-1", name: "backup" }],
				total_count: 1,
			});

			const result = await handleListSnapshots({});
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
		});

		it("passes all filter parameters", async () => {
			const { handleListSnapshots } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ snapshots: [], total_count: 0 });

			await handleListSnapshots({
				region: "nl-ams",
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "backup",
				project_id: "22222222-2222-2222-2222-222222222222",
				organization_id: "33333333-3333-3333-3333-333333333333",
				order_by: "created_at_desc",
				page: 3,
				pageSize: 5,
			});

			const req = getRequest();
			expect(req.path).toContain("/nl-ams/snapshots");
			const params = req.urlParams?.toString() ?? "";
			expect(params).toContain("instance_id=11111111");
			expect(params).toContain("name=backup");
			expect(params).toContain("project_id=22222222");
			expect(params).toContain("organization_id=33333333");
			expect(params).toContain("order_by=created_at_desc");
		});

		it("handles error", async () => {
			const { handleListSnapshots } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleListSnapshots({});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreateSnapshot", () => {
		it("creates a snapshot", async () => {
			const { handleCreateSnapshot } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "snap-1", name: "backup", status: "creating" });

			const result = await handleCreateSnapshot({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "backup",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("creating");

			const req = getRequest();
			const body = getRequestBody();
			expect(req.path).toContain("/snapshots");
			expect(req.method).toBe("POST");
			expect(body.instance_id).toBe("11111111-1111-1111-1111-111111111111");
			expect(body.name).toBe("backup");
			expect(body.expires_at).toBeUndefined();
		});

		it("creates a snapshot with expiration", async () => {
			const { handleCreateSnapshot } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "snap-1" });

			await handleCreateSnapshot({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "backup",
				expires_at: "2026-12-31T23:59:59Z",
			});

			const req = getRequest();
			const body = getRequestBody();
			expect(body.expires_at).toBe("2026-12-31T23:59:59Z");
		});

		it("handles error", async () => {
			const { handleCreateSnapshot } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleCreateSnapshot({
				instance_id: "11111111-1111-1111-1111-111111111111",
				name: "backup",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleRestoreSnapshot", () => {
		it("restores a snapshot", async () => {
			const { handleRestoreSnapshot } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({
				id: "new-inst",
				name: "restored-db",
				status: "provisioning",
			});

			const result = await handleRestoreSnapshot({
				snapshot_id: "11111111-1111-1111-1111-111111111111",
				instance_name: "restored-db",
				node_type: "MGDB-PLAY2-NANO",
				node_amount: 1,
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("restored-db");

			const req = getRequest();
			const body = getRequestBody();
			expect(req.path).toContain("/snapshots/11111111-1111-1111-1111-111111111111/restore");
			expect(req.method).toBe("POST");
			expect(body.node_amount).toBe(1);
			expect(body.volume_type).toBeUndefined();
		});

		it("restores with volume_type", async () => {
			const { handleRestoreSnapshot } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "new-inst" });

			await handleRestoreSnapshot({
				snapshot_id: "11111111-1111-1111-1111-111111111111",
				instance_name: "restored-db",
				node_type: "MGDB-PLAY2-NANO",
				node_amount: 1,
				volume_type: "sbs_15k",
			});

			const req = getRequest();
			const body = getRequestBody();
			expect(body.volume_type).toBe("sbs_15k");
		});

		it("handles error", async () => {
			const { handleRestoreSnapshot } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleRestoreSnapshot({
				snapshot_id: "11111111-1111-1111-1111-111111111111",
				instance_name: "restored-db",
				node_type: "MGDB-PLAY2-NANO",
				node_amount: 1,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteSnapshot", () => {
		it("deletes a snapshot", async () => {
			const { handleDeleteSnapshot } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ id: "snap-1", status: "deleting" });

			const result = await handleDeleteSnapshot({
				snapshot_id: "11111111-1111-1111-1111-111111111111",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.status).toBe("deleting");

			const req = getRequest();
			expect(req.path).toContain("/snapshots/11111111-1111-1111-1111-111111111111");
			expect(req.method).toBe("DELETE");
		});

		it("handles error", async () => {
			const { handleDeleteSnapshot } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleDeleteSnapshot({
				snapshot_id: "11111111-1111-1111-1111-111111111111",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	// --- Node Type & Version Handlers ---

	describe("handleListNodeTypes", () => {
		it("returns paginated node types", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({
				node_types: [{ name: "MGDB-PLAY2-NANO", memory: 1073741824 }],
				total_count: 1,
			});

			const result = await handleListNodeTypes({});
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.items[0].name).toBe("MGDB-PLAY2-NANO");
		});

		it("passes include_disabled parameter", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ node_types: [], total_count: 0 });

			await handleListNodeTypes({ include_disabled: true });

			const req = getRequest();
			const params = req.urlParams?.toString() ?? "";
			expect(params).toContain("include_disabled=true");
		});

		it("handles error", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleListNodeTypes({});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleListVersions", () => {
		it("returns paginated versions", async () => {
			const { handleListVersions } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({
				versions: [{ version: "7.0.12" }],
				total_count: 1,
			});

			const result = await handleListVersions({});
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toHaveLength(1);
			expect(data.items[0].version).toBe("7.0.12");
		});

		it("passes version filter", async () => {
			const { handleListVersions } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockResolvedValue({ versions: [], total_count: 0 });

			await handleListVersions({ version: "7.0" });

			const req = getRequest();
			const params = req.urlParams?.toString() ?? "";
			expect(params).toContain("version=7.0");
		});

		it("handles error", async () => {
			const { handleListVersions } = await import("../../../src/tools/mongodb/handlers.js");
			mockFetch.mockRejectedValue(new Error("fail"));

			const result = await handleListVersions({});
			expect("isError" in result && result.isError).toBe(true);
		});
	});
});
