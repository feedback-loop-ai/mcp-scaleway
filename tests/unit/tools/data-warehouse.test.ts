import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerDataWarehouseTools } from "../../../src/tools/data-warehouse/index.js";

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

interface ErrorResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

const DEPLOYMENT_ID = "00000000-0000-0000-0000-000000000010";
const PN_ID = "00000000-0000-0000-0000-000000000030";
const ENDPOINT_ID = "00000000-0000-0000-0000-000000000040";

function errorWithStatus(message: string, statusCode?: number): Error {
	const err = new Error(message);
	if (statusCode !== undefined) {
		(err as unknown as { statusCode: number }).statusCode = statusCode;
	}
	return err;
}

describe("data-warehouse module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerDataWarehouseTools(server)).not.toThrow();
	});

	it("registers all 19 tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerDataWarehouseTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(19);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_data_warehouse_list_deployments",
			"scaleway_data_warehouse_get_deployment",
			"scaleway_data_warehouse_create_deployment",
			"scaleway_data_warehouse_update_deployment",
			"scaleway_data_warehouse_delete_deployment",
			"scaleway_data_warehouse_start_deployment",
			"scaleway_data_warehouse_stop_deployment",
			"scaleway_data_warehouse_get_deployment_certificate",
			"scaleway_data_warehouse_list_databases",
			"scaleway_data_warehouse_create_database",
			"scaleway_data_warehouse_delete_database",
			"scaleway_data_warehouse_list_users",
			"scaleway_data_warehouse_create_user",
			"scaleway_data_warehouse_update_user",
			"scaleway_data_warehouse_delete_user",
			"scaleway_data_warehouse_create_endpoint",
			"scaleway_data_warehouse_delete_endpoint",
			"scaleway_data_warehouse_list_presets",
			"scaleway_data_warehouse_list_versions",
		]);
	});
});

describe("data-warehouse handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	// --- Deployments ---

	describe("handleListDeployments", () => {
		it("returns paginated deployments", async () => {
			const { handleListDeployments } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({
				deployments: [{ id: DEPLOYMENT_ID, name: "dw" }],
				total_count: 1,
			});

			const result = await handleListDeployments({ region: "fr-par", page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "datawarehouse/v1beta1/regions/fr-par/deployments",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items[0].name).toBe("dw");
		});

		it("passes all optional filters", async () => {
			const { handleListDeployments } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ deployments: [], total_count: 0 });

			await handleListDeployments({
				region: "fr-par",
				page: 2,
				pageSize: 10,
				projectId: "00000000-0000-0000-0000-000000000001",
				organizationId: "00000000-0000-0000-0000-000000000002",
				name: "prod",
				tags: ["a", "b"],
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("project_id")).toBe("00000000-0000-0000-0000-000000000001");
			expect(callArgs.urlParams.get("organization_id")).toBe(
				"00000000-0000-0000-0000-000000000002",
			);
			expect(callArgs.urlParams.get("name")).toBe("prod");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
			expect(callArgs.urlParams.getAll("tags")).toEqual(["a", "b"]);
		});

		it("returns error on failure", async () => {
			const { handleListDeployments } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Unauthorized", 401));

			const result: ErrorResult = await handleListDeployments({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetDeployment", () => {
		it("returns deployment details", async () => {
			const { handleGetDeployment } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, name: "dw" });

			const result = await handleGetDeployment({ region: "fr-par", deploymentId: DEPLOYMENT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("dw");
		});

		it("returns error on 404", async () => {
			const { handleGetDeployment } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Not found", 404));

			const result: ErrorResult = await handleGetDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleCreateDeployment", () => {
		it("creates with all optional fields", async () => {
			const { handleCreateDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, name: "dw" });

			await handleCreateDeployment({
				region: "fr-par",
				name: "dw",
				projectId: "00000000-0000-0000-0000-000000000001",
				tags: ["prod"],
				version: "24.8",
				replicaCount: 2,
				shardCount: 1,
				password: "s3cret",
				cpuMin: 4,
				cpuMax: 8,
				ramPerCpu: 4,
				moveFactor: 0.2,
				endpoints: [{ privateNetworkId: PN_ID }, {}],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "datawarehouse/v1beta1/regions/fr-par/deployments",
				body: JSON.stringify({
					name: "dw",
					project_id: "00000000-0000-0000-0000-000000000001",
					tags: ["prod"],
					version: "24.8",
					replica_count: 2,
					shard_count: 1,
					password: "s3cret",
					cpu_min: 4,
					cpu_max: 8,
					ram_per_cpu: 4,
					move_factor: 0.2,
					endpoints: [{ private_network: { private_network_id: PN_ID } }, { public: {} }],
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates with only the required name", async () => {
			const { handleCreateDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, name: "dw" });

			await handleCreateDeployment({ region: "fr-par", name: "dw" });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "datawarehouse/v1beta1/regions/fr-par/deployments",
				body: JSON.stringify({ name: "dw" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Bad request", 400));

			const result: ErrorResult = await handleCreateDeployment({ region: "fr-par", name: "dw" });
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateDeployment", () => {
		it("updates with all fields", async () => {
			const { handleUpdateDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID });

			await handleUpdateDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "new",
				tags: ["x"],
				cpuMin: 2,
				cpuMax: 6,
				replicaCount: 3,
				moveFactor: 0.5,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
				body: JSON.stringify({
					name: "new",
					tags: ["x"],
					cpu_min: 2,
					cpu_max: 6,
					replica_count: 3,
					move_factor: 0.5,
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when nothing provided", async () => {
			const { handleUpdateDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID });

			await handleUpdateDeployment({ region: "fr-par", deploymentId: DEPLOYMENT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("boom"));

			const result: ErrorResult = await handleUpdateDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleDeleteDeployment", () => {
		it("deletes and returns the deployment", async () => {
			const { handleDeleteDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, status: "deleting" });

			const result = await handleDeleteDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			const { handleDeleteDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Forbidden", 403));

			const result: ErrorResult = await handleDeleteDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleStartDeployment", () => {
		it("starts a deployment", async () => {
			const { handleStartDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, status: "starting" });

			const result = await handleStartDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/start`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).status).toBe("starting");
		});

		it("returns error on failure", async () => {
			const { handleStartDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("boom"));

			const result: ErrorResult = await handleStartDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleStopDeployment", () => {
		it("stops a deployment", async () => {
			const { handleStopDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, status: "stopping" });

			const result = await handleStopDeployment({ region: "fr-par", deploymentId: DEPLOYMENT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/stop`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).status).toBe("stopping");
		});

		it("returns error on failure", async () => {
			const { handleStopDeployment } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("boom"));

			const result: ErrorResult = await handleStopDeployment({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetDeploymentCertificate", () => {
		it("returns the TLS certificate file", async () => {
			const { handleGetDeploymentCertificate } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({
				name: "cert.pem",
				content_type: "application/x-pem-file",
				content: "base64==",
			});

			const result = await handleGetDeploymentCertificate({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/certificate`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("cert.pem");
		});

		it("returns error on failure", async () => {
			const { handleGetDeploymentCertificate } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Not found", 404));

			const result: ErrorResult = await handleGetDeploymentCertificate({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	// --- Databases ---

	describe("handleListDatabases", () => {
		it("returns paginated databases", async () => {
			const { handleListDatabases } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({
				databases: [{ name: "analytics", size: 1024 }],
				total_count: 1,
			});

			const result = await handleListDatabases({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/databases`,
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].name).toBe("analytics");
		});

		it("passes optional filters", async () => {
			const { handleListDatabases } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({ databases: [], total_count: 0 });

			await handleListDatabases({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				page: 1,
				pageSize: 25,
				name: "an",
				orderBy: "size_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("name")).toBe("an");
			expect(callArgs.urlParams.get("order_by")).toBe("size_desc");
		});

		it("returns error on failure", async () => {
			const { handleListDatabases } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Rate limited", 429));

			const result: ErrorResult = await handleListDatabases({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});

	describe("handleCreateDatabase", () => {
		it("creates a database", async () => {
			const { handleCreateDatabase } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ name: "analytics", size: 0 });

			const result = await handleCreateDatabase({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "analytics",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/databases`,
				body: JSON.stringify({ name: "analytics" }),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).name).toBe("analytics");
		});

		it("returns error on failure", async () => {
			const { handleCreateDatabase } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Bad request", 400));

			const result: ErrorResult = await handleCreateDatabase({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "bad",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteDatabase", () => {
		it("deletes a database and returns confirmation", async () => {
			const { handleDeleteDatabase } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteDatabase({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "analytics",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/databases/analytics`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.name).toBe("analytics");
		});

		it("returns error on failure", async () => {
			const { handleDeleteDatabase } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Forbidden", 403));

			const result: ErrorResult = await handleDeleteDatabase({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "analytics",
			});
			expect(result.isError).toBe(true);
		});
	});

	// --- Users ---

	describe("handleListUsers", () => {
		it("returns paginated users", async () => {
			const { handleListUsers } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({
				users: [{ name: "admin", is_admin: true }],
				total_count: 1,
			});

			const result = await handleListUsers({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users`,
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].name).toBe("admin");
		});

		it("passes optional filters", async () => {
			const { handleListUsers } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({ users: [], total_count: 0 });

			await handleListUsers({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
				name: "adm",
				orderBy: "name_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("name")).toBe("adm");
			expect(callArgs.urlParams.get("order_by")).toBe("name_desc");
		});

		it("returns error on failure", async () => {
			const { handleListUsers } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("boom"));

			const result: ErrorResult = await handleListUsers({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateUser", () => {
		it("creates a user with admin flag", async () => {
			const { handleCreateUser } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({ name: "reader", is_admin: false });

			await handleCreateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "reader",
				password: "p4ss",
				isAdmin: false,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users`,
				body: JSON.stringify({ name: "reader", password: "p4ss", is_admin: false }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates a user without the optional admin flag", async () => {
			const { handleCreateUser } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({ name: "reader", is_admin: false });

			await handleCreateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "reader",
				password: "p4ss",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users`,
				body: JSON.stringify({ name: "reader", password: "p4ss" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateUser } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Bad request", 400));

			const result: ErrorResult = await handleCreateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "reader",
				password: "p4ss",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateUser", () => {
		it("updates a user with all fields", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({ name: "reader", is_admin: true });

			await handleUpdateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "reader",
				password: "newp4ss",
				isAdmin: true,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/reader`,
				body: JSON.stringify({ password: "newp4ss", is_admin: true }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when only identifiers provided", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({ name: "reader", is_admin: false });

			await handleUpdateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "reader",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/reader`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("boom"));

			const result: ErrorResult = await handleUpdateUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "reader",
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteUser", () => {
		it("deletes a user and returns confirmation", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "reader",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `datawarehouse/v1beta1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/reader`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.name).toBe("reader");
		});

		it("returns error on failure", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Forbidden", 403));

			const result: ErrorResult = await handleDeleteUser({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				name: "reader",
			});
			expect(result.isError).toBe(true);
		});
	});

	// --- Endpoints ---

	describe("handleCreateEndpoint", () => {
		it("creates a private network endpoint", async () => {
			const { handleCreateEndpoint } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: ENDPOINT_ID });

			await handleCreateEndpoint({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
				privateNetworkId: PN_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "datawarehouse/v1beta1/regions/fr-par/endpoints",
				body: JSON.stringify({
					deployment_id: DEPLOYMENT_ID,
					endpoint: { private_network: { private_network_id: PN_ID } },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates a public endpoint when no private network provided", async () => {
			const { handleCreateEndpoint } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue({ id: ENDPOINT_ID });

			await handleCreateEndpoint({ region: "fr-par", deploymentId: DEPLOYMENT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "datawarehouse/v1beta1/regions/fr-par/endpoints",
				body: JSON.stringify({
					deployment_id: DEPLOYMENT_ID,
					endpoint: { public: {} },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateEndpoint } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Bad request", 400));

			const result: ErrorResult = await handleCreateEndpoint({
				region: "fr-par",
				deploymentId: DEPLOYMENT_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteEndpoint", () => {
		it("deletes an endpoint and returns confirmation", async () => {
			const { handleDeleteEndpoint } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteEndpoint({ region: "fr-par", endpointId: ENDPOINT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `datawarehouse/v1beta1/regions/fr-par/endpoints/${ENDPOINT_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(ENDPOINT_ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteEndpoint } = await import(
				"../../../src/tools/data-warehouse/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Not found", 404));

			const result: ErrorResult = await handleDeleteEndpoint({
				region: "fr-par",
				endpointId: ENDPOINT_ID,
			});
			expect(result.isError).toBe(true);
		});
	});

	// --- Presets & Versions ---

	describe("handleListPresets", () => {
		it("returns paginated presets", async () => {
			const { handleListPresets } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({
				presets: [{ name: "small", category: "general" }],
				total_count: 1,
			});

			const result = await handleListPresets({ region: "fr-par", page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "datawarehouse/v1beta1/regions/fr-par/presets",
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].name).toBe("small");
		});

		it("returns error on failure", async () => {
			const { handleListPresets } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("boom"));

			const result: ErrorResult = await handleListPresets({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleListVersions", () => {
		it("returns paginated versions", async () => {
			const { handleListVersions } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({
				versions: [{ version: "24.8" }],
				total_count: 1,
			});

			const result = await handleListVersions({ region: "fr-par", page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "datawarehouse/v1beta1/regions/fr-par/versions",
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].version).toBe("24.8");
		});

		it("passes the optional version filter", async () => {
			const { handleListVersions } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockResolvedValue({ versions: [], total_count: 0 });

			await handleListVersions({ region: "fr-par", page: 1, pageSize: 50, version: "24.8" });

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("version")).toBe("24.8");
		});

		it("returns error on failure", async () => {
			const { handleListVersions } = await import("../../../src/tools/data-warehouse/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("boom"));

			const result: ErrorResult = await handleListVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});
			expect(result.isError).toBe(true);
		});
	});
});
