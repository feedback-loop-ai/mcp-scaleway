/**
 * Contract tests for Scaleway RabbitMQ (Cloud Essentials MessageQ) API
 *
 * Validates request/response shapes against
 * specs/scaleway-api/rabbitmq/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 */
import { describe, expect, it } from "vitest";
import {
	CreateDeploymentInput,
	CreateEndpointInput,
	CreateUserInput,
	DeleteDeploymentInput,
	DeleteEndpointInput,
	DeleteUserInput,
	Deployment,
	DeploymentStatus,
	Endpoint,
	GetDeploymentCertificateInput,
	GetDeploymentInput,
	ListDeploymentsInput,
	ListDeploymentsResponse,
	ListNodeTypesInput,
	ListNodeTypesResponse,
	ListUsersInput,
	ListUsersResponse,
	ListVersionsInput,
	ListVersionsResponse,
	NodeType,
	NodeTypeStockStatus,
	UpdateDeploymentInput,
	UpdateUserInput,
	UpgradeDeploymentInput,
	User,
	Version,
	Volume,
	VolumeType,
} from "../../../src/tools/rabbitmq/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

const validVolume = { type: "sbs_5k", size_bytes: 10000000000 };

const validEndpoint = {
	id: VALID_UUID,
	dns_record: null,
	services: [{ name: "amqps", port: 5671, url: "amqps://host:5671" }],
	public: {},
};

const validDeployment = {
	id: VALID_UUID,
	name: "my-rabbit",
	organization_id: VALID_UUID,
	project_id: VALID_UUID,
	status: "ready" as const,
	tags: ["prod"],
	node_count: 3,
	node_type: "rmq-node",
	volume: validVolume,
	endpoints: [validEndpoint],
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	version: "3.13",
	region: VALID_REGION,
};

const validNodeType = {
	stock_status: "available" as const,
	name: "rmq-node",
	description: "RabbitMQ node",
	vcpus: 4,
	memory_bytes: 8589934592,
	disabled: false,
	beta: false,
	instance_range: "PRO2",
	available_volume_types: [
		{
			type: "sbs_5k",
			description: "Block SSD 5k IOPS",
			min_size_bytes: 5000000000,
			max_size_bytes: 1000000000000,
			chunk_size_bytes: 1000000000,
		},
	],
};

const validVersion = {
	version: "3.13",
	end_of_life: "2027-01-01T00:00:00Z",
	disabled: false,
	beta: false,
};

// --- Deployment response shapes ---

/**
 * API: GET /messageq/v1alpha1/regions/{region}/deployments
 * Spec: specs/scaleway-api/rabbitmq/api-reference.md
 * Tool: scaleway_rabbitmq_list_deployments
 */
describe("contract: ListDeployments", () => {
	it("validates a list response", () => {
		expect(() =>
			ListDeploymentsResponse.parse({ deployments: [validDeployment], total_count: 1 }),
		).not.toThrow();
	});

	it("validates empty response", () => {
		expect(() => ListDeploymentsResponse.parse({ deployments: [], total_count: 0 })).not.toThrow();
	});

	it("rejects response missing deployments", () => {
		expect(() => ListDeploymentsResponse.parse({ total_count: 0 })).toThrow();
	});

	it("validates request with all filters", () => {
		expect(() =>
			ListDeploymentsInput.parse({
				region: VALID_REGION,
				organization_id: VALID_UUID,
				project_id: VALID_UUID,
				name: "rab",
				tags: ["prod"],
				order_by: "created_at_desc",
			}),
		).not.toThrow();
	});

	it("rejects invalid order_by", () => {
		expect(() => ListDeploymentsInput.parse({ region: VALID_REGION, order_by: "bogus" })).toThrow();
	});
});

/**
 * API: GET /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}
 * Tool: scaleway_rabbitmq_get_deployment
 */
describe("contract: GetDeployment", () => {
	it("validates a deployment", () => {
		expect(() => Deployment.parse(validDeployment)).not.toThrow();
	});

	it("validates a deployment with null volume", () => {
		expect(() => Deployment.parse({ ...validDeployment, volume: null })).not.toThrow();
	});

	it("validates all deployment statuses", () => {
		for (const status of [
			"unknown_status",
			"ready",
			"creating",
			"initializing",
			"upgrading",
			"deleting",
			"error",
			"locked",
			"locking",
			"unlocking",
		]) {
			expect(() => Deployment.parse({ ...validDeployment, status })).not.toThrow();
			expect(() => DeploymentStatus.parse(status)).not.toThrow();
		}
	});

	it("rejects invalid status", () => {
		expect(() => Deployment.parse({ ...validDeployment, status: "running" })).toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			GetDeploymentInput.parse({ region: VALID_REGION, deployment_id: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /messageq/v1alpha1/regions/{region}/deployments
 * Tool: scaleway_rabbitmq_create_deployment
 */
describe("contract: CreateDeployment", () => {
	it("validates minimal create request", () => {
		expect(() =>
			CreateDeploymentInput.parse({
				region: VALID_REGION,
				name: "rabbit",
				node_type: "rmq-node",
				node_count: 1,
				version: "3.13",
			}),
		).not.toThrow();
	});

	it("validates full create request", () => {
		expect(() =>
			CreateDeploymentInput.parse({
				region: VALID_REGION,
				name: "rabbit",
				node_type: "rmq-node",
				node_count: 3,
				version: "3.13",
				project_id: VALID_UUID,
				tags: ["prod"],
				user_name: "admin",
				password: "secret",
				volume: validVolume,
				endpoints: [{ is_public: true }, { private_network_id: VALID_UUID }],
			}),
		).not.toThrow();
	});

	it("rejects create without required fields", () => {
		expect(() => CreateDeploymentInput.parse({ region: VALID_REGION })).toThrow();
		expect(() => CreateDeploymentInput.parse({ region: VALID_REGION, name: "x" })).toThrow();
	});
});

/**
 * API: PATCH /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}
 * Tool: scaleway_rabbitmq_update_deployment
 */
describe("contract: UpdateDeployment", () => {
	it("validates update with fields", () => {
		expect(() =>
			UpdateDeploymentInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				name: "renamed",
				tags: ["x"],
			}),
		).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateDeploymentInput.parse({ region: VALID_REGION, deployment_id: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/upgrade
 * Tool: scaleway_rabbitmq_upgrade_deployment
 */
describe("contract: UpgradeDeployment", () => {
	it("validates upgrade by node_count", () => {
		expect(() =>
			UpgradeDeploymentInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				node_count: 5,
			}),
		).not.toThrow();
	});

	it("validates upgrade by volume_size_bytes", () => {
		expect(() =>
			UpgradeDeploymentInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				volume_size_bytes: 20000000000,
			}),
		).not.toThrow();
	});

	it("rejects when neither is provided", () => {
		expect(() =>
			UpgradeDeploymentInput.parse({ region: VALID_REGION, deployment_id: VALID_UUID }),
		).toThrow();
	});

	it("rejects when both are provided", () => {
		expect(() =>
			UpgradeDeploymentInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				node_count: 5,
				volume_size_bytes: 20000000000,
			}),
		).toThrow();
	});
});

/**
 * API: DELETE /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}
 * Tool: scaleway_rabbitmq_delete_deployment
 */
describe("contract: DeleteDeployment", () => {
	it("validates delete request", () => {
		expect(() =>
			DeleteDeploymentInput.parse({ region: VALID_REGION, deployment_id: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing deployment_id", () => {
		expect(() => DeleteDeploymentInput.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: GET /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/certificate-authority
 * Tool: scaleway_rabbitmq_get_deployment_certificate
 */
describe("contract: GetDeploymentCertificate", () => {
	it("validates request shape", () => {
		expect(() =>
			GetDeploymentCertificateInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
			}),
		).not.toThrow();
	});
});

// --- User shapes ---

/**
 * API: GET /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/users
 * Tool: scaleway_rabbitmq_list_users
 */
describe("contract: ListUsers", () => {
	it("validates users response", () => {
		expect(() =>
			ListUsersResponse.parse({ users: [{ username: "admin" }], total_count: 1 }),
		).not.toThrow();
	});

	it("validates the User entity", () => {
		expect(() => User.parse({ username: "admin" })).not.toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListUsersInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				name: "adm",
				order_by: "name_desc",
			}),
		).not.toThrow();
	});
});

/**
 * API: POST /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/users
 * Tool: scaleway_rabbitmq_create_user
 */
describe("contract: CreateUser", () => {
	it("validates create request", () => {
		expect(() =>
			CreateUserInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				username: "admin",
				password: "secret",
			}),
		).not.toThrow();
	});

	it("rejects missing password", () => {
		expect(() =>
			CreateUserInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				username: "admin",
			}),
		).toThrow();
	});
});

/**
 * API: PATCH /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/users/{username}
 * Tool: scaleway_rabbitmq_update_user
 */
describe("contract: UpdateUser", () => {
	it("validates update with password", () => {
		expect(() =>
			UpdateUserInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				username: "admin",
				password: "newpass",
			}),
		).not.toThrow();
	});

	it("validates update without password", () => {
		expect(() =>
			UpdateUserInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				username: "admin",
			}),
		).not.toThrow();
	});
});

/**
 * API: DELETE /messageq/v1alpha1/regions/{region}/deployments/{deployment_id}/users/{username}
 * Tool: scaleway_rabbitmq_delete_user
 */
describe("contract: DeleteUser", () => {
	it("validates delete request", () => {
		expect(() =>
			DeleteUserInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				username: "admin",
			}),
		).not.toThrow();
	});
});

// --- Endpoint shapes ---

/**
 * API: POST /messageq/v1alpha1/regions/{region}/endpoints
 * Tool: scaleway_rabbitmq_create_endpoint
 */
describe("contract: CreateEndpoint", () => {
	it("validates public endpoint request", () => {
		expect(() =>
			CreateEndpointInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				is_public: true,
			}),
		).not.toThrow();
	});

	it("validates private network endpoint request", () => {
		expect(() =>
			CreateEndpointInput.parse({
				region: VALID_REGION,
				deployment_id: VALID_UUID,
				private_network_id: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("validates the Endpoint entity (public)", () => {
		expect(() => Endpoint.parse(validEndpoint)).not.toThrow();
	});

	it("validates the Endpoint entity (private network)", () => {
		expect(() =>
			Endpoint.parse({
				id: VALID_UUID,
				services: [{ name: "amqps", port: 5671, url: "amqps://host:5671" }],
				private_network: { private_network_id: VALID_UUID },
			}),
		).not.toThrow();
	});
});

/**
 * API: DELETE /messageq/v1alpha1/regions/{region}/endpoints/{endpoint_id}
 * Tool: scaleway_rabbitmq_delete_endpoint
 */
describe("contract: DeleteEndpoint", () => {
	it("validates delete request", () => {
		expect(() =>
			DeleteEndpointInput.parse({ region: VALID_REGION, endpoint_id: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing endpoint_id", () => {
		expect(() => DeleteEndpointInput.parse({ region: VALID_REGION })).toThrow();
	});
});

// --- Node types & versions ---

/**
 * API: GET /messageq/v1alpha1/regions/{region}/node-types
 * Tool: scaleway_rabbitmq_list_node_types
 */
describe("contract: ListNodeTypes", () => {
	it("validates node types response", () => {
		expect(() =>
			ListNodeTypesResponse.parse({ node_types: [validNodeType], total_count: 1 }),
		).not.toThrow();
	});

	it("validates all stock statuses", () => {
		for (const status of ["unknown_stock", "low_stock", "out_of_stock", "available"]) {
			expect(() => NodeType.parse({ ...validNodeType, stock_status: status })).not.toThrow();
			expect(() => NodeTypeStockStatus.parse(status)).not.toThrow();
		}
	});

	it("rejects invalid stock status", () => {
		expect(() => NodeType.parse({ ...validNodeType, stock_status: "sold_out" })).toThrow();
	});

	it("validates request with order_by", () => {
		expect(() =>
			ListNodeTypesInput.parse({ region: VALID_REGION, order_by: "memory_desc" }),
		).not.toThrow();
	});
});

/**
 * API: GET /messageq/v1alpha1/regions/{region}/versions
 * Tool: scaleway_rabbitmq_list_versions
 */
describe("contract: ListVersions", () => {
	it("validates versions response", () => {
		expect(() =>
			ListVersionsResponse.parse({ versions: [validVersion], total_count: 1 }),
		).not.toThrow();
	});

	it("validates a version with null end_of_life", () => {
		expect(() => Version.parse({ ...validVersion, end_of_life: null })).not.toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListVersionsInput.parse({
				region: VALID_REGION,
				version: "3.13",
				order_by: "version_desc",
			}),
		).not.toThrow();
	});
});

// --- Volume & enum entities ---

describe("contract: Volume entity", () => {
	it("validates a volume", () => {
		expect(() => Volume.parse(validVolume)).not.toThrow();
	});

	it("validates all volume types", () => {
		for (const type of ["unknown_type", "sbs_5k", "sbs_15k"]) {
			expect(() => VolumeType.parse(type)).not.toThrow();
		}
	});

	it("rejects invalid volume type", () => {
		expect(() => Volume.parse({ ...validVolume, type: "ssd" })).toThrow();
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
		expect(() => ListDeploymentsInput.parse({ region: VALID_REGION, pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListDeploymentsInput.parse({ region: VALID_REGION, page: 0 })).toThrow();
	});
});

// --- Auth / region contracts ---

describe("contract: authentication and region", () => {
	it("requires region for all operations", () => {
		expect(() => ListDeploymentsInput.parse({})).toThrow();
		expect(() => GetDeploymentInput.parse({ deployment_id: VALID_UUID })).toThrow();
		expect(() => ListNodeTypesInput.parse({})).toThrow();
		expect(() => ListVersionsInput.parse({})).toThrow();
	});

	it("validates region format (xx-xxx)", () => {
		expect(() => ListDeploymentsInput.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListDeploymentsInput.parse({ region: "invalid-region" })).toThrow();
	});
});
