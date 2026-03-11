/**
 * Contract tests for Scaleway Managed Inference API
 *
 * Validates request/response shapes against specs/scaleway-api/inference/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	AcceptEulaInput,
	CreateDeploymentInput,
	CreateEndpointInput,
	DeleteDeploymentInput,
	DeleteEndpointInput,
	Deployment,
	DeploymentEvent,
	DeploymentStatus,
	Endpoint,
	EndpointSpec,
	GetDeploymentInput,
	GetEulaInput,
	GetModelInput,
	ListDeploymentEventsInput,
	ListDeploymentsInput,
	ListEndpointsInput,
	ListModelsInput,
	ListNodeTypesInput,
	Model,
	NodeType,
	NodeTypeStockStatus,
	UpdateDeploymentInput,
	UpdateEndpointInput,
} from "../../src/tools/inference/types.js";

// --- Shared fixtures ---

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

const validDeployment = {
	id: VALID_UUID,
	name: "my-deployment",
	status: "ready" as const,
	region: VALID_REGION,
	project_id: VALID_UUID,
	model_id: VALID_UUID,
	model_name: "llama-3-8b",
	node_type: "L4",
	tags: ["production"],
	endpoints: [
		{
			id: VALID_UUID,
			url: "https://inference.scw.cloud/v1/abc",
			is_public: true,
			private_network_id: null,
			disable_auth: false,
		},
	],
	size: 1,
	min_size: 1,
	max_size: 3,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

const validModel = {
	id: VALID_UUID,
	name: "llama-3-8b",
	description: "Meta Llama 3 8B Instruct",
	provider: "meta",
	tags: ["llm", "text-generation"],
	compatible_node_types: ["L4", "H100"],
	quantization_level: "f16",
	has_eula: true,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-06-01T00:00:00Z",
};

const validNodeType = {
	name: "L4",
	stock_status: "available" as const,
	description: "NVIDIA L4 Tensor Core GPU",
	vcpus: 16,
	memory: 68719476736,
	vram: 25769803776,
	gpus: 1,
};

const validDeploymentEvent = {
	id: VALID_UUID,
	deployment_id: VALID_UUID,
	type: "deployment_created",
	details: "Deployment was created successfully",
	created_at: "2025-06-01T12:00:00Z",
};

// --- Response shape contracts ---

/**
 * API: GET /inference/v1/regions/{region}/deployments
 * Spec: specs/scaleway-api/inference/api-reference.md#list-deployments
 */
describe("contract: ListDeployments response shape", () => {
	const ListDeploymentsResponse = z.object({
		deployments: z.array(Deployment),
		total_count: z.number().int(),
	});

	it("validates a list deployments response", () => {
		const response = { deployments: [validDeployment], total_count: 1 };
		expect(() => ListDeploymentsResponse.parse(response)).not.toThrow();
	});

	it("validates empty response", () => {
		const response = { deployments: [], total_count: 0 };
		expect(() => ListDeploymentsResponse.parse(response)).not.toThrow();
	});

	it("rejects response missing deployments array", () => {
		expect(() => ListDeploymentsResponse.parse({ total_count: 0 })).toThrow();
	});
});

/**
 * API: GET /inference/v1/regions/{region}/deployments/{deployment_id}
 * Spec: specs/scaleway-api/inference/api-reference.md#get-deployment
 */
describe("contract: GetDeployment response shape", () => {
	it("validates a deployment response", () => {
		expect(() => Deployment.parse(validDeployment)).not.toThrow();
	});

	it("validates all deployment statuses", () => {
		for (const status of [
			"unknown",
			"queued",
			"allocating",
			"deploying",
			"ready",
			"deleting",
			"error",
			"locked",
		]) {
			expect(() => Deployment.parse({ ...validDeployment, status })).not.toThrow();
		}
	});

	it("rejects invalid deployment status", () => {
		expect(() => Deployment.parse({ ...validDeployment, status: "running" })).toThrow();
	});
});

/**
 * API: POST /inference/v1/regions/{region}/deployments
 * Spec: specs/scaleway-api/inference/api-reference.md#create-deployment
 */
describe("contract: CreateDeployment request shape", () => {
	it("validates minimal create request", () => {
		const input = {
			region: VALID_REGION,
			name: "test-deploy",
			model_id: VALID_UUID,
			node_type: "L4",
		};
		expect(() => CreateDeploymentInput.parse(input)).not.toThrow();
	});

	it("validates full create request", () => {
		const input = {
			region: VALID_REGION,
			name: "test-deploy",
			model_id: VALID_UUID,
			node_type: "L4",
			project_id: VALID_UUID,
			tags: ["test"],
			endpoints: [{ is_public: true, disable_auth: false }],
			min_size: 1,
			max_size: 5,
		};
		expect(() => CreateDeploymentInput.parse(input)).not.toThrow();
	});

	it("rejects create without required fields", () => {
		expect(() => CreateDeploymentInput.parse({ region: VALID_REGION })).toThrow();
		expect(() => CreateDeploymentInput.parse({ region: VALID_REGION, name: "x" })).toThrow();
	});

	it("rejects invalid region format", () => {
		expect(() =>
			CreateDeploymentInput.parse({
				region: "invalid",
				name: "x",
				model_id: VALID_UUID,
				node_type: "L4",
			}),
		).toThrow();
	});
});

/**
 * API: PATCH /inference/v1/regions/{region}/deployments/{deployment_id}
 * Spec: specs/scaleway-api/inference/api-reference.md#update-deployment
 */
describe("contract: UpdateDeployment request shape", () => {
	it("validates update with all optional fields", () => {
		const input = {
			region: VALID_REGION,
			deployment_id: VALID_UUID,
			name: "new-name",
			tags: ["updated"],
			min_size: 2,
			max_size: 10,
		};
		expect(() => UpdateDeploymentInput.parse(input)).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		const input = { region: VALID_REGION, deployment_id: VALID_UUID };
		expect(() => UpdateDeploymentInput.parse(input)).not.toThrow();
	});
});

/**
 * API: DELETE /inference/v1/regions/{region}/deployments/{deployment_id}
 * Spec: specs/scaleway-api/inference/api-reference.md#delete-deployment
 */
describe("contract: DeleteDeployment request shape", () => {
	it("validates delete request", () => {
		const input = { region: VALID_REGION, deployment_id: VALID_UUID };
		expect(() => DeleteDeploymentInput.parse(input)).not.toThrow();
	});

	it("rejects missing deployment_id", () => {
		expect(() => DeleteDeploymentInput.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: GET /inference/v1/regions/{region}/deployments/{deployment_id}/events
 * Spec: specs/scaleway-api/inference/api-reference.md#list-deployment-events
 */
describe("contract: ListDeploymentEvents response shape", () => {
	const ListEventsResponse = z.object({
		events: z.array(DeploymentEvent),
		total_count: z.number().int(),
	});

	it("validates events response", () => {
		const response = { events: [validDeploymentEvent], total_count: 1 };
		expect(() => ListEventsResponse.parse(response)).not.toThrow();
	});

	it("validates request shape", () => {
		const input = {
			region: VALID_REGION,
			deployment_id: VALID_UUID,
			page: 1,
			pageSize: 50,
		};
		expect(() => ListDeploymentEventsInput.parse(input)).not.toThrow();
	});
});

/**
 * API: GET /inference/v1/regions/{region}/endpoints
 * Spec: specs/scaleway-api/inference/api-reference.md#list-endpoints
 */
describe("contract: ListEndpoints response shape", () => {
	const ListEndpointsResponse = z.object({
		endpoints: z.array(Endpoint),
		total_count: z.number().int(),
	});

	it("validates endpoints response", () => {
		const response = {
			endpoints: [validDeployment.endpoints[0]],
			total_count: 1,
		};
		expect(() => ListEndpointsResponse.parse(response)).not.toThrow();
	});

	it("validates request with deployment_id filter", () => {
		const input = {
			region: VALID_REGION,
			deployment_id: VALID_UUID,
			page: 1,
			pageSize: 50,
		};
		expect(() => ListEndpointsInput.parse(input)).not.toThrow();
	});
});

/**
 * API: POST /inference/v1/regions/{region}/endpoints
 * Spec: specs/scaleway-api/inference/api-reference.md#create-endpoint
 */
describe("contract: CreateEndpoint request shape", () => {
	it("validates create endpoint with public access", () => {
		const input = {
			region: VALID_REGION,
			deployment_id: VALID_UUID,
			is_public: true,
		};
		expect(() => CreateEndpointInput.parse(input)).not.toThrow();
	});

	it("validates create endpoint with private network", () => {
		const input = {
			region: VALID_REGION,
			deployment_id: VALID_UUID,
			private_network_id: VALID_UUID,
			disable_auth: true,
		};
		expect(() => CreateEndpointInput.parse(input)).not.toThrow();
	});
});

/**
 * API: PATCH /inference/v1/regions/{region}/endpoints/{endpoint_id}
 * Spec: specs/scaleway-api/inference/api-reference.md#update-endpoint
 */
describe("contract: UpdateEndpoint request shape", () => {
	it("validates update endpoint", () => {
		const input = {
			region: VALID_REGION,
			endpoint_id: VALID_UUID,
			disable_auth: true,
		};
		expect(() => UpdateEndpointInput.parse(input)).not.toThrow();
	});
});

/**
 * API: DELETE /inference/v1/regions/{region}/endpoints/{endpoint_id}
 * Spec: specs/scaleway-api/inference/api-reference.md#delete-endpoint
 */
describe("contract: DeleteEndpoint request shape", () => {
	it("validates delete endpoint", () => {
		const input = { region: VALID_REGION, endpoint_id: VALID_UUID };
		expect(() => DeleteEndpointInput.parse(input)).not.toThrow();
	});
});

/**
 * API: GET /inference/v1/regions/{region}/models
 * Spec: specs/scaleway-api/inference/api-reference.md#list-models
 */
describe("contract: ListModels response shape", () => {
	const ListModelsResponse = z.object({
		models: z.array(Model),
		total_count: z.number().int(),
	});

	it("validates models response", () => {
		const response = { models: [validModel], total_count: 1 };
		expect(() => ListModelsResponse.parse(response)).not.toThrow();
	});

	it("validates request with filters", () => {
		const input = {
			region: VALID_REGION,
			name: "llama",
			tags: ["llm"],
			order_by: "name_asc",
		};
		expect(() => ListModelsInput.parse(input)).not.toThrow();
	});
});

/**
 * API: GET /inference/v1/regions/{region}/models/{model_id}
 * Spec: specs/scaleway-api/inference/api-reference.md#get-model
 */
describe("contract: GetModel response shape", () => {
	it("validates model response", () => {
		expect(() => Model.parse(validModel)).not.toThrow();
	});

	it("validates model with EULA", () => {
		expect(() => Model.parse({ ...validModel, has_eula: true })).not.toThrow();
	});

	it("validates request shape", () => {
		const input = { region: VALID_REGION, model_id: VALID_UUID };
		expect(() => GetModelInput.parse(input)).not.toThrow();
	});
});

/**
 * API: GET /inference/v1/regions/{region}/node-types
 * Spec: specs/scaleway-api/inference/api-reference.md#list-node-types
 */
describe("contract: ListNodeTypes response shape", () => {
	const ListNodeTypesResponse = z.object({
		node_types: z.array(NodeType),
		total_count: z.number().int(),
	});

	it("validates node types response", () => {
		const response = { node_types: [validNodeType], total_count: 1 };
		expect(() => ListNodeTypesResponse.parse(response)).not.toThrow();
	});

	it("validates all stock statuses", () => {
		for (const status of ["unknown", "available", "low_stock", "out_of_stock"]) {
			expect(() => NodeType.parse({ ...validNodeType, stock_status: status })).not.toThrow();
		}
	});

	it("rejects invalid stock status", () => {
		expect(() => NodeType.parse({ ...validNodeType, stock_status: "sold_out" })).toThrow();
	});

	it("validates request shape", () => {
		const input = { region: VALID_REGION };
		expect(() => ListNodeTypesInput.parse(input)).not.toThrow();
	});
});

/**
 * API: GET /inference/v1/regions/{region}/models/{model_id}/eula
 * Spec: specs/scaleway-api/inference/api-reference.md#get-eula
 */
describe("contract: GetEula request shape", () => {
	it("validates get EULA request", () => {
		const input = { region: VALID_REGION, model_id: VALID_UUID };
		expect(() => GetEulaInput.parse(input)).not.toThrow();
	});
});

/**
 * API: POST /inference/v1/regions/{region}/models/{model_id}/eula
 * Spec: specs/scaleway-api/inference/api-reference.md#accept-eula
 */
describe("contract: AcceptEula request shape", () => {
	it("validates accept EULA request", () => {
		const input = { region: VALID_REGION, model_id: VALID_UUID };
		expect(() => AcceptEulaInput.parse(input)).not.toThrow();
	});
});

// --- Pagination contracts ---

describe("contract: pagination parameters", () => {
	it("applies default pagination values", () => {
		const result = ListDeploymentsInput.parse({ region: VALID_REGION });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("accepts custom pagination", () => {
		const result = ListDeploymentsInput.parse({
			region: VALID_REGION,
			page: 3,
			pageSize: 25,
		});
		expect(result.page).toBe(3);
		expect(result.pageSize).toBe(25);
	});

	it("rejects page size over 100", () => {
		expect(() =>
			ListDeploymentsInput.parse({
				region: VALID_REGION,
				pageSize: 101,
			}),
		).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListDeploymentsInput.parse({ region: VALID_REGION, page: 0 })).toThrow();
	});
});

// --- Auth contract ---

describe("contract: authentication", () => {
	it("requires region parameter for all operations", () => {
		expect(() => ListDeploymentsInput.parse({})).toThrow();
		expect(() => GetDeploymentInput.parse({ deployment_id: VALID_UUID })).toThrow();
		expect(() => ListModelsInput.parse({})).toThrow();
		expect(() => ListNodeTypesInput.parse({})).toThrow();
	});

	it("validates region format (xx-xxx)", () => {
		expect(() => ListDeploymentsInput.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListDeploymentsInput.parse({ region: "nl-ams" })).not.toThrow();
		expect(() => ListDeploymentsInput.parse({ region: "invalid-region-format" })).toThrow();
	});
});

// --- Endpoint entity contract ---

describe("contract: Endpoint entity shape", () => {
	it("validates public endpoint", () => {
		const endpoint = {
			id: VALID_UUID,
			url: "https://inference.scw.cloud/v1/abc",
			is_public: true,
			private_network_id: null,
			disable_auth: false,
		};
		expect(() => Endpoint.parse(endpoint)).not.toThrow();
	});

	it("validates private endpoint", () => {
		const endpoint = {
			id: VALID_UUID,
			url: "https://inference.scw.cloud/v1/abc",
			is_public: false,
			private_network_id: VALID_UUID,
			disable_auth: true,
		};
		expect(() => Endpoint.parse(endpoint)).not.toThrow();
	});
});

describe("contract: EndpointSpec shape", () => {
	it("validates empty spec (all optional)", () => {
		expect(() => EndpointSpec.parse({})).not.toThrow();
	});

	it("validates spec with all fields", () => {
		const spec = {
			is_public: true,
			private_network_id: VALID_UUID,
			disable_auth: false,
		};
		expect(() => EndpointSpec.parse(spec)).not.toThrow();
	});
});
