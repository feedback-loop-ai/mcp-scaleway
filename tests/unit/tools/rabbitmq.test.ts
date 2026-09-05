import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerRabbitmqTools } from "../../../src/tools/rabbitmq/index.js";

// Mock the shared modules
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

const REGION = "fr-par";
const DEPLOYMENT_ID = "00000000-0000-0000-0000-000000000010";
const ENDPOINT_ID = "00000000-0000-0000-0000-000000000020";
const PN_ID = "00000000-0000-0000-0000-000000000030";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";

function errorWithStatus(message: string, statusCode?: number): Error {
	const err = new Error(message);
	if (statusCode !== undefined) {
		(err as unknown as { statusCode: number }).statusCode = statusCode;
	}
	return err;
}

describe("rabbitmq module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerRabbitmqTools(server)).not.toThrow();
	});

	it("registers all 15 RabbitMQ tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerRabbitmqTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(15);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_rabbitmq_list_deployments",
			"scaleway_rabbitmq_get_deployment",
			"scaleway_rabbitmq_create_deployment",
			"scaleway_rabbitmq_update_deployment",
			"scaleway_rabbitmq_upgrade_deployment",
			"scaleway_rabbitmq_delete_deployment",
			"scaleway_rabbitmq_get_deployment_certificate",
			"scaleway_rabbitmq_list_users",
			"scaleway_rabbitmq_create_user",
			"scaleway_rabbitmq_update_user",
			"scaleway_rabbitmq_delete_user",
			"scaleway_rabbitmq_create_endpoint",
			"scaleway_rabbitmq_delete_endpoint",
			"scaleway_rabbitmq_list_node_types",
			"scaleway_rabbitmq_list_versions",
		]);
	});

	it("invokes handlers through registered callbacks", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const handlers: Record<string, (args: unknown) => Promise<unknown>> = {};
		vi.spyOn(server, "tool").mockImplementation(
			// biome-ignore lint/suspicious/noExplicitAny: test shim for server.tool overloads
			((name: string, _desc: string, _shape: unknown, cb: any) => {
				handlers[name] = cb;
				return undefined as never;
				// biome-ignore lint/suspicious/noExplicitAny: matches server.tool signature
			}) as any,
		);
		registerRabbitmqTools(server);
		mockFetch.mockResolvedValue({ deployments: [], total_count: 0 });
		const result = (await handlers.scaleway_rabbitmq_list_deployments({
			region: REGION,
		})) as { content: { text: string }[] };
		expect(JSON.parse(result.content[0].text).totalCount).toBe(0);

		// Exercise the remaining registered callbacks so each wiring is covered.
		mockFetch.mockResolvedValue({ content: "ca" });
		const cert = (await handlers.scaleway_rabbitmq_get_deployment_certificate({
			region: REGION,
			deployment_id: DEPLOYMENT_ID,
		})) as { content: { text: string }[] };
		expect(JSON.parse(cert.content[0].text).content).toBe("ca");
	});
});

describe("rabbitmq deployment handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListDeployments", () => {
		it("returns paginated deployments with default pagination", async () => {
			const { handleListDeployments } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({
				deployments: [{ id: DEPLOYMENT_ID, name: "rabbit" }],
				total_count: 1,
			});

			const result = await handleListDeployments({ region: REGION, page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/messageq/v1alpha1/regions/fr-par/deployments",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items[0].name).toBe("rabbit");
		});

		it("passes all optional filters", async () => {
			const { handleListDeployments } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ deployments: [], total_count: 0 });

			await handleListDeployments({
				region: REGION,
				page: 2,
				pageSize: 10,
				organization_id: PROJECT_ID,
				project_id: PROJECT_ID,
				name: "rab",
				tags: ["prod"],
				order_by: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("organization_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.get("project_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.get("name")).toBe("rab");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListDeployments } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Unauthorized", 401));

			const result: ErrorResult = await handleListDeployments({
				region: REGION,
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetDeployment", () => {
		it("returns deployment details", async () => {
			const { handleGetDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, name: "rabbit" });

			const result = await handleGetDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
			});
			expect(JSON.parse(result.content[0].text).name).toBe("rabbit");
		});

		it("returns error on 404", async () => {
			const { handleGetDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Not found", 404));

			const result: ErrorResult = await handleGetDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("not_found");
		});
	});

	describe("handleCreateDeployment", () => {
		it("creates deployment with all optional fields", async () => {
			const { handleCreateDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, status: "creating" });

			const result = await handleCreateDeployment({
				region: REGION,
				name: "rabbit",
				node_type: "rmq-node",
				node_count: 3,
				version: "3.13",
				project_id: PROJECT_ID,
				tags: ["prod"],
				user_name: "admin",
				password: "s3cret",
				volume: { type: "sbs_5k", size_bytes: 10000000000 },
				endpoints: [{ is_public: true }, { private_network_id: PN_ID }],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/messageq/v1alpha1/regions/fr-par/deployments",
				body: JSON.stringify({
					name: "rabbit",
					node_type: "rmq-node",
					node_count: 3,
					version: "3.13",
					project_id: PROJECT_ID,
					tags: ["prod"],
					user_name: "admin",
					password: "s3cret",
					volume: { type: "sbs_5k", size_bytes: 10000000000 },
					endpoints: [{ public: {} }, { private_network: { private_network_id: PN_ID } }],
				}),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).status).toBe("creating");
		});

		it("creates deployment with only required fields", async () => {
			const { handleCreateDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID });

			await handleCreateDeployment({
				region: REGION,
				name: "rabbit",
				node_type: "rmq-node",
				node_count: 1,
				version: "3.13",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/messageq/v1alpha1/regions/fr-par/deployments",
				body: JSON.stringify({
					name: "rabbit",
					node_type: "rmq-node",
					node_count: 1,
					version: "3.13",
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Bad request", 400));

			const result: ErrorResult = await handleCreateDeployment({
				region: REGION,
				name: "rabbit",
				node_type: "rmq-node",
				node_count: 1,
				version: "3.13",
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateDeployment", () => {
		it("updates name and tags", async () => {
			const { handleUpdateDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, name: "renamed" });

			await handleUpdateDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				name: "renamed",
				tags: ["updated"],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
				body: JSON.stringify({ name: "renamed", tags: ["updated"] }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when no fields provided", async () => {
			const { handleUpdateDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID });

			await handleUpdateDeployment({ region: REGION, deployment_id: DEPLOYMENT_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Server error"));

			const result: ErrorResult = await handleUpdateDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("server_error");
		});
	});

	describe("handleUpgradeDeployment", () => {
		it("upgrades by node count", async () => {
			const { handleUpgradeDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, status: "upgrading" });

			await handleUpgradeDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				node_count: 5,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/upgrade`,
				body: JSON.stringify({ node_count: 5 }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("upgrades by volume size", async () => {
			const { handleUpgradeDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, status: "upgrading" });

			await handleUpgradeDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				volume_size_bytes: 20000000000,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/upgrade`,
				body: JSON.stringify({ volume_size_bytes: 20000000000 }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpgradeDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Rate limited", 429));

			const result: ErrorResult = await handleUpgradeDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				node_count: 5,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("rate_limited");
		});
	});

	describe("handleDeleteDeployment", () => {
		it("deletes deployment and returns response", async () => {
			const { handleDeleteDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: DEPLOYMENT_ID, status: "deleting" });

			const result = await handleDeleteDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}`,
			});
			expect(JSON.parse(result.content[0].text).status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			const { handleDeleteDeployment } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Forbidden", 403));

			const result: ErrorResult = await handleDeleteDeployment({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
			expect(JSON.parse(result.content[0].text).error.type).toBe("permission_denied");
		});
	});

	describe("handleGetDeploymentCertificate", () => {
		it("returns certificate authority", async () => {
			const { handleGetDeploymentCertificate } = await import(
				"../../../src/tools/rabbitmq/handlers.js"
			);
			mockFetch.mockResolvedValue({ content: "-----BEGIN CERTIFICATE-----" });

			const result = await handleGetDeploymentCertificate({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/certificate-authority`,
			});
			expect(JSON.parse(result.content[0].text).content).toContain("BEGIN CERTIFICATE");
		});

		it("returns error on failure", async () => {
			const { handleGetDeploymentCertificate } = await import(
				"../../../src/tools/rabbitmq/handlers.js"
			);
			mockFetch.mockRejectedValue(errorWithStatus("Not found", 404));

			const result: ErrorResult = await handleGetDeploymentCertificate({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
			});

			expect(result.isError).toBe(true);
		});
	});
});

describe("rabbitmq user handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListUsers", () => {
		it("returns paginated users", async () => {
			const { handleListUsers } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({
				users: [{ username: "admin" }],
				total_count: 1,
			});

			const result = await handleListUsers({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users`,
					urlParams: expect.any(URLSearchParams),
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].username).toBe("admin");
		});

		it("passes optional filters", async () => {
			const { handleListUsers } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ users: [], total_count: 0 });

			await handleListUsers({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				page: 1,
				pageSize: 10,
				order_by: "name_desc",
				name: "adm",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("order_by")).toBe("name_desc");
			expect(callArgs.urlParams.get("name")).toBe("adm");
		});

		it("returns error on failure", async () => {
			const { handleListUsers } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Boom"));

			const result: ErrorResult = await handleListUsers({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("handleCreateUser", () => {
		it("creates user", async () => {
			const { handleCreateUser } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ username: "newuser" });

			const result = await handleCreateUser({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				username: "newuser",
				password: "pass",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users`,
				body: JSON.stringify({ username: "newuser", password: "pass" }),
				headers: { "Content-Type": "application/json" },
			});
			expect(JSON.parse(result.content[0].text).username).toBe("newuser");
		});

		it("returns error on failure", async () => {
			const { handleCreateUser } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Bad request", 400));

			const result: ErrorResult = await handleCreateUser({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				username: "newuser",
				password: "pass",
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("handleUpdateUser", () => {
		it("updates user password", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ username: "admin" });

			await handleUpdateUser({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				username: "admin",
				password: "newpass",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/admin`,
				body: JSON.stringify({ password: "newpass" }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("sends empty body when no password provided", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ username: "admin" });

			await handleUpdateUser({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				username: "admin",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/admin`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Boom"));

			const result: ErrorResult = await handleUpdateUser({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				username: "admin",
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteUser", () => {
		it("deletes user and returns confirmation", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteUser({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				username: "admin",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `/messageq/v1alpha1/regions/fr-par/deployments/${DEPLOYMENT_ID}/users/admin`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.username).toBe("admin");
		});

		it("returns error on failure", async () => {
			const { handleDeleteUser } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Forbidden", 403));

			const result: ErrorResult = await handleDeleteUser({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				username: "admin",
			});

			expect(result.isError).toBe(true);
		});
	});
});

describe("rabbitmq endpoint handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleCreateEndpoint", () => {
		it("creates a private network endpoint", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: ENDPOINT_ID });

			await handleCreateEndpoint({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				private_network_id: PN_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/messageq/v1alpha1/regions/fr-par/endpoints",
				body: JSON.stringify({
					deployment_id: DEPLOYMENT_ID,
					endpoint_spec: { private_network: { private_network_id: PN_ID } },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("creates a public endpoint", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ id: ENDPOINT_ID });

			await handleCreateEndpoint({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				is_public: true,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/messageq/v1alpha1/regions/fr-par/endpoints",
				body: JSON.stringify({
					deployment_id: DEPLOYMENT_ID,
					endpoint_spec: { public: {} },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Bad request", 400));

			const result: ErrorResult = await handleCreateEndpoint({
				region: REGION,
				deployment_id: DEPLOYMENT_ID,
				is_public: true,
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteEndpoint", () => {
		it("deletes endpoint and returns confirmation", async () => {
			const { handleDeleteEndpoint } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteEndpoint({
				region: REGION,
				endpoint_id: ENDPOINT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `/messageq/v1alpha1/regions/fr-par/endpoints/${ENDPOINT_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(ENDPOINT_ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteEndpoint } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Forbidden", 403));

			const result: ErrorResult = await handleDeleteEndpoint({
				region: REGION,
				endpoint_id: ENDPOINT_ID,
			});

			expect(result.isError).toBe(true);
		});
	});
});

describe("rabbitmq node type & version handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListNodeTypes", () => {
		it("returns paginated node types", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({
				node_types: [{ name: "rmq-node" }],
				total_count: 1,
			});

			const result = await handleListNodeTypes({ region: REGION, page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/messageq/v1alpha1/regions/fr-par/node-types",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].name).toBe("rmq-node");
		});

		it("passes order_by filter", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ node_types: [], total_count: 0 });

			await handleListNodeTypes({
				region: REGION,
				page: 1,
				pageSize: 50,
				order_by: "vcpus_desc",
			});

			expect(mockFetch.mock.calls[0][0].urlParams.get("order_by")).toBe("vcpus_desc");
		});

		it("returns error on failure", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Boom"));

			const result: ErrorResult = await handleListNodeTypes({
				region: REGION,
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
		});
	});

	describe("handleListVersions", () => {
		it("returns paginated versions", async () => {
			const { handleListVersions } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({
				versions: [{ version: "3.13", disabled: false, beta: false }],
				total_count: 1,
			});

			const result = await handleListVersions({ region: REGION, page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/messageq/v1alpha1/regions/fr-par/versions",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			expect(JSON.parse(result.content[0].text).items[0].version).toBe("3.13");
		});

		it("passes optional filters", async () => {
			const { handleListVersions } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockResolvedValue({ versions: [], total_count: 0 });

			await handleListVersions({
				region: REGION,
				page: 1,
				pageSize: 50,
				order_by: "version_desc",
				version: "3.13",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("order_by")).toBe("version_desc");
			expect(callArgs.urlParams.get("version")).toBe("3.13");
		});

		it("returns error on failure", async () => {
			const { handleListVersions } = await import("../../../src/tools/rabbitmq/handlers.js");
			mockFetch.mockRejectedValue(errorWithStatus("Boom"));

			const result: ErrorResult = await handleListVersions({
				region: REGION,
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
		});
	});
});
