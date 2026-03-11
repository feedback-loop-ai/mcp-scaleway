import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as authModule from "../../../src/shared/auth.js";
import * as clientModule from "../../../src/shared/client.js";
import * as handlers from "../../../src/tools/inference/handlers.js";
import { registerInferenceTools } from "../../../src/tools/inference/index.js";

// Mock auth and client
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn().mockReturnValue({
		accessKey: "SCWTEST1234567890123",
		secretKey: "00000000-0000-0000-0000-000000000000",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi
		.fn()
		.mockReturnValue({ fetch: (...args: unknown[]) => mockFetch(...args) }),
}));

describe("inference module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerInferenceTools(server)).not.toThrow();
	});

	it("registers 15 tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		registerInferenceTools(server);
		// Verify no double registration
		expect(() =>
			registerInferenceTools(new McpServer({ name: "test2", version: "0.0.1" })),
		).not.toThrow();
	});
});

describe("inference handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Deployment handlers ---

	describe("handleListDeployments", () => {
		it("returns paginated deployments", async () => {
			const mockDeployment = { id: "00000000-0000-0000-0000-000000000010", name: "test-deploy" };
			mockFetch.mockResolvedValueOnce({ deployments: [mockDeployment], total_count: 1 });

			const result = await handlers.handleListDeployments({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/inference/v1/regions/fr-par/deployments",
				}),
			);
		});

		it("passes filters to query", async () => {
			mockFetch.mockResolvedValueOnce({ deployments: [], total_count: 0 });

			await handlers.handleListDeployments({
				region: "fr-par",
				page: 1,
				pageSize: 10,
				name: "my-deploy",
				project_id: "00000000-0000-0000-0000-000000000001",
				tags: ["gpu"],
				order_by: "created_at_asc",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("name")).toBe("my-deploy");
		});

		it("handles missing deployments array", async () => {
			mockFetch.mockResolvedValueOnce({});

			const result = await handlers.handleListDeployments({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toEqual([]);
			expect(parsed.totalCount).toBe(0);
		});

		it("returns error on failure", async () => {
			const error = new Error("Not found");
			Object.assign(error, { statusCode: 404 });
			mockFetch.mockRejectedValueOnce(error);

			const result = await handlers.handleListDeployments({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleGetDeployment", () => {
		it("returns deployment details", async () => {
			const mockDeploy = { id: "00000000-0000-0000-0000-000000000010", name: "test" };
			mockFetch.mockResolvedValueOnce(mockDeploy);

			const result = await handlers.handleGetDeployment({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("00000000-0000-0000-0000-000000000010");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleGetDeployment({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateDeployment", () => {
		it("creates a deployment", async () => {
			const created = { id: "00000000-0000-0000-0000-000000000010", status: "queued" };
			mockFetch.mockResolvedValueOnce(created);

			const result = await handlers.handleCreateDeployment({
				region: "fr-par",
				name: "my-deploy",
				model_id: "00000000-0000-0000-0000-000000000020",
				node_type: "L4",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("queued");
			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "POST",
					path: "/inference/v1/regions/fr-par/deployments",
				}),
			);
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValueOnce({ id: "00000000-0000-0000-0000-000000000010" });

			await handlers.handleCreateDeployment({
				region: "fr-par",
				name: "deploy",
				model_id: "00000000-0000-0000-0000-000000000020",
				node_type: "L4",
				project_id: "00000000-0000-0000-0000-000000000001",
				tags: ["test"],
				endpoints: [{ is_public: true }],
				min_size: 1,
				max_size: 3,
			});

			const call = mockFetch.mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.tags).toEqual(["test"]);
			expect(body.min_size).toBe(1);
		});

		it("returns error on failure", async () => {
			const error = new Error("Bad request");
			Object.assign(error, { statusCode: 400 });
			mockFetch.mockRejectedValueOnce(error);

			const result = await handlers.handleCreateDeployment({
				region: "fr-par",
				name: "deploy",
				model_id: "00000000-0000-0000-0000-000000000020",
				node_type: "L4",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateDeployment", () => {
		it("updates a deployment", async () => {
			mockFetch.mockResolvedValueOnce({
				id: "00000000-0000-0000-0000-000000000010",
				name: "new-name",
			});

			const result = await handlers.handleUpdateDeployment({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
				name: "new-name",
				tags: ["updated"],
				min_size: 2,
				max_size: 5,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("new-name");
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "PATCH" }));
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleUpdateDeployment({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteDeployment", () => {
		it("deletes a deployment", async () => {
			mockFetch.mockResolvedValueOnce({
				id: "00000000-0000-0000-0000-000000000010",
				status: "deleting",
			});

			const result = await handlers.handleDeleteDeployment({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleDeleteDeployment({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleListDeploymentEvents", () => {
		it("returns paginated events", async () => {
			const event = { id: "00000000-0000-0000-0000-000000000030", type: "created" };
			mockFetch.mockResolvedValueOnce({ events: [event], total_count: 1 });

			const result = await handlers.handleListDeploymentEvents({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("handles missing events array", async () => {
			mockFetch.mockResolvedValueOnce({});

			const result = await handlers.handleListDeploymentEvents({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toEqual([]);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleListDeploymentEvents({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
				page: 1,
				pageSize: 50,
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	// --- Endpoint handlers ---

	describe("handleListEndpoints", () => {
		it("returns paginated endpoints", async () => {
			const ep = { id: "00000000-0000-0000-0000-000000000040", url: "https://example.com" };
			mockFetch.mockResolvedValueOnce({ endpoints: [ep], total_count: 1 });

			const result = await handlers.handleListEndpoints({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes deployment_id filter", async () => {
			mockFetch.mockResolvedValueOnce({ endpoints: [], total_count: 0 });

			await handlers.handleListEndpoints({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
				page: 1,
				pageSize: 50,
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("deployment_id")).toBe("00000000-0000-0000-0000-000000000010");
		});

		it("handles missing endpoints array", async () => {
			mockFetch.mockResolvedValueOnce({});

			const result = await handlers.handleListEndpoints({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toEqual([]);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleListEndpoints({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleCreateEndpoint", () => {
		it("creates an endpoint", async () => {
			mockFetch.mockResolvedValueOnce({
				id: "00000000-0000-0000-0000-000000000040",
				url: "https://ep.scw.cloud",
			});

			const result = await handlers.handleCreateEndpoint({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
				is_public: true,
				disable_auth: false,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.url).toBe("https://ep.scw.cloud");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleCreateEndpoint({
				region: "fr-par",
				deployment_id: "00000000-0000-0000-0000-000000000010",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleUpdateEndpoint", () => {
		it("updates an endpoint", async () => {
			mockFetch.mockResolvedValueOnce({
				id: "00000000-0000-0000-0000-000000000040",
				disable_auth: true,
			});

			const result = await handlers.handleUpdateEndpoint({
				region: "fr-par",
				endpoint_id: "00000000-0000-0000-0000-000000000040",
				disable_auth: true,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.disable_auth).toBe(true);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleUpdateEndpoint({
				region: "fr-par",
				endpoint_id: "00000000-0000-0000-0000-000000000040",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleDeleteEndpoint", () => {
		it("deletes an endpoint when API returns null", async () => {
			mockFetch.mockResolvedValueOnce(null);

			const result = await handlers.handleDeleteEndpoint({
				region: "fr-par",
				endpoint_id: "00000000-0000-0000-0000-000000000040",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
		});

		it("deletes an endpoint", async () => {
			mockFetch.mockResolvedValueOnce({});

			const result = await handlers.handleDeleteEndpoint({
				region: "fr-par",
				endpoint_id: "00000000-0000-0000-0000-000000000040",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleDeleteEndpoint({
				region: "fr-par",
				endpoint_id: "00000000-0000-0000-0000-000000000040",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	// --- Model handlers ---

	describe("handleListModels", () => {
		it("returns paginated models", async () => {
			const model = { id: "00000000-0000-0000-0000-000000000050", name: "llama-3" };
			mockFetch.mockResolvedValueOnce({ models: [model], total_count: 1 });

			const result = await handlers.handleListModels({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes filters", async () => {
			mockFetch.mockResolvedValueOnce({ models: [], total_count: 0 });

			await handlers.handleListModels({
				region: "fr-par",
				page: 1,
				pageSize: 50,
				name: "llama",
				project_id: "00000000-0000-0000-0000-000000000001",
				tags: ["text"],
				order_by: "name_asc",
			});

			const call = mockFetch.mock.calls[0][0];
			expect(call.urlParams.get("name")).toBe("llama");
		});

		it("handles missing models array", async () => {
			mockFetch.mockResolvedValueOnce({});

			const result = await handlers.handleListModels({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toEqual([]);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleListModels({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleGetModel", () => {
		it("returns model details", async () => {
			mockFetch.mockResolvedValueOnce({
				id: "00000000-0000-0000-0000-000000000050",
				name: "llama-3",
			});

			const result = await handlers.handleGetModel({
				region: "fr-par",
				model_id: "00000000-0000-0000-0000-000000000050",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("llama-3");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleGetModel({
				region: "fr-par",
				model_id: "00000000-0000-0000-0000-000000000050",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	// --- Node Type handlers ---

	describe("handleListNodeTypes", () => {
		it("returns paginated node types", async () => {
			const nt = { name: "L4", stock_status: "available" };
			mockFetch.mockResolvedValueOnce({ node_types: [nt], total_count: 1 });

			const result = await handlers.handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("handles missing node_types array", async () => {
			mockFetch.mockResolvedValueOnce({});

			const result = await handlers.handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toEqual([]);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	// --- EULA handlers ---

	describe("handleGetEula", () => {
		it("returns EULA content", async () => {
			mockFetch.mockResolvedValueOnce({ content: "By using this model..." });

			const result = await handlers.handleGetEula({
				region: "fr-par",
				model_id: "00000000-0000-0000-0000-000000000050",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.content).toBe("By using this model...");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleGetEula({
				region: "fr-par",
				model_id: "00000000-0000-0000-0000-000000000050",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});

	describe("handleAcceptEula", () => {
		it("accepts EULA", async () => {
			mockFetch.mockResolvedValueOnce({});

			const result = await handlers.handleAcceptEula({
				region: "fr-par",
				model_id: "00000000-0000-0000-0000-000000000050",
			});

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "POST" }));
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.handleAcceptEula({
				region: "fr-par",
				model_id: "00000000-0000-0000-0000-000000000050",
			});

			expect((result as { isError?: boolean }).isError).toBe(true);
		});
	});
});

describe("inference types", () => {
	it("exports all input schemas", async () => {
		const types = await import("../../../src/tools/inference/types.js");
		expect(types.ListDeploymentsInput).toBeDefined();
		expect(types.GetDeploymentInput).toBeDefined();
		expect(types.CreateDeploymentInput).toBeDefined();
		expect(types.UpdateDeploymentInput).toBeDefined();
		expect(types.DeleteDeploymentInput).toBeDefined();
		expect(types.ListDeploymentEventsInput).toBeDefined();
		expect(types.ListEndpointsInput).toBeDefined();
		expect(types.CreateEndpointInput).toBeDefined();
		expect(types.UpdateEndpointInput).toBeDefined();
		expect(types.DeleteEndpointInput).toBeDefined();
		expect(types.ListModelsInput).toBeDefined();
		expect(types.GetModelInput).toBeDefined();
		expect(types.ListNodeTypesInput).toBeDefined();
		expect(types.GetEulaInput).toBeDefined();
		expect(types.AcceptEulaInput).toBeDefined();
	});

	it("exports entity schemas", async () => {
		const types = await import("../../../src/tools/inference/types.js");
		expect(types.Deployment).toBeDefined();
		expect(types.DeploymentEvent).toBeDefined();
		expect(types.Endpoint).toBeDefined();
		expect(types.EndpointSpec).toBeDefined();
		expect(types.Model).toBeDefined();
		expect(types.NodeType).toBeDefined();
		expect(types.DeploymentStatus).toBeDefined();
		expect(types.NodeTypeStockStatus).toBeDefined();
	});

	it("validates DeploymentStatus enum", async () => {
		const { DeploymentStatus } = await import("../../../src/tools/inference/types.js");
		expect(DeploymentStatus.parse("ready")).toBe("ready");
		expect(() => DeploymentStatus.parse("invalid")).toThrow();
	});

	it("validates NodeTypeStockStatus enum", async () => {
		const { NodeTypeStockStatus } = await import("../../../src/tools/inference/types.js");
		expect(NodeTypeStockStatus.parse("available")).toBe("available");
		expect(() => NodeTypeStockStatus.parse("invalid")).toThrow();
	});

	it("validates Deployment schema", async () => {
		const { Deployment } = await import("../../../src/tools/inference/types.js");
		const valid = {
			id: "00000000-0000-0000-0000-000000000010",
			name: "test",
			status: "ready",
			region: "fr-par",
			project_id: "00000000-0000-0000-0000-000000000001",
			model_id: "00000000-0000-0000-0000-000000000020",
			model_name: "llama-3",
			node_type: "L4",
			tags: ["test"],
			endpoints: [
				{
					id: "00000000-0000-0000-0000-000000000040",
					url: "https://ep.scw.cloud",
					is_public: true,
					private_network_id: null,
					disable_auth: false,
				},
			],
			size: 1,
			min_size: 1,
			max_size: 3,
			created_at: "2025-01-01T00:00:00Z",
			updated_at: "2025-01-01T00:00:00Z",
		};
		expect(() => Deployment.parse(valid)).not.toThrow();
	});

	it("validates Model schema", async () => {
		const { Model } = await import("../../../src/tools/inference/types.js");
		const valid = {
			id: "00000000-0000-0000-0000-000000000050",
			name: "llama-3",
			description: "Large language model",
			provider: "meta",
			tags: ["llm"],
			compatible_node_types: ["L4", "H100"],
			quantization_level: "f16",
			has_eula: true,
			created_at: "2025-01-01T00:00:00Z",
			updated_at: "2025-01-01T00:00:00Z",
		};
		expect(() => Model.parse(valid)).not.toThrow();
	});

	it("validates NodeType schema", async () => {
		const { NodeType } = await import("../../../src/tools/inference/types.js");
		const valid = {
			name: "L4",
			stock_status: "available",
			description: "NVIDIA L4 GPU",
			vcpus: 16,
			memory: 68719476736,
			vram: 25769803776,
			gpus: 1,
		};
		expect(() => NodeType.parse(valid)).not.toThrow();
	});

	it("validates DeploymentEvent schema", async () => {
		const { DeploymentEvent } = await import("../../../src/tools/inference/types.js");
		const valid = {
			id: "00000000-0000-0000-0000-000000000030",
			deployment_id: "00000000-0000-0000-0000-000000000010",
			type: "deployment_created",
			details: "Deployment created",
			created_at: "2025-01-01T00:00:00Z",
		};
		expect(() => DeploymentEvent.parse(valid)).not.toThrow();
	});

	it("validates EndpointSpec schema", async () => {
		const { EndpointSpec } = await import("../../../src/tools/inference/types.js");
		expect(() => EndpointSpec.parse({})).not.toThrow();
		expect(() => EndpointSpec.parse({ is_public: true, disable_auth: false })).not.toThrow();
		expect(() =>
			EndpointSpec.parse({
				private_network_id: "00000000-0000-0000-0000-000000000060",
			}),
		).not.toThrow();
	});

	it("validates CreateDeploymentInput with all fields", async () => {
		const { CreateDeploymentInput } = await import("../../../src/tools/inference/types.js");
		const valid = {
			region: "fr-par",
			name: "test",
			model_id: "00000000-0000-0000-0000-000000000020",
			node_type: "L4",
			project_id: "00000000-0000-0000-0000-000000000001",
			tags: ["gpu"],
			endpoints: [{ is_public: true }],
			min_size: 1,
			max_size: 3,
		};
		expect(() => CreateDeploymentInput.parse(valid)).not.toThrow();
	});

	it("validates ListDeploymentsInput with defaults", async () => {
		const { ListDeploymentsInput } = await import("../../../src/tools/inference/types.js");
		const result = ListDeploymentsInput.parse({ region: "fr-par" });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});
});
