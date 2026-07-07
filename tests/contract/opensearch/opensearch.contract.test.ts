/**
 * Contract tests for Scaleway Cloud Essentials for OpenSearch API (searchdb v1alpha1)
 *
 * Validates request/response shapes against specs/scaleway-api/opensearch/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 */
import { describe, expect, it } from "vitest";
import {
	CreateDeploymentParams,
	CreateEndpointParams,
	CreateUserParams,
	DeleteDeploymentParams,
	DeleteEndpointParams,
	DeleteUserParams,
	Deployment,
	Endpoint,
	GetCertificateAuthorityParams,
	GetDeploymentParams,
	ListDeploymentsParams,
	ListDeploymentsResponse,
	ListNodeTypesParams,
	ListNodeTypesResponse,
	ListUsersParams,
	ListUsersResponse,
	ListVersionsParams,
	ListVersionsResponse,
	NodeType,
	UpdateDeploymentParams,
	UpdateUserParams,
	UpgradeDeploymentParams,
	User,
	Version,
} from "../../../src/tools/opensearch/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

const validDeployment = {
	id: VALID_UUID,
	name: "my-opensearch",
	organization_id: VALID_UUID,
	project_id: VALID_UUID,
	status: "ready" as const,
	tags: ["production"],
	node_count: 1,
	node_type: "SEARCHDB-SHARED-2C-8G",
	volume: { type: "sbs_5k" as const, size_bytes: 5000000000 },
	endpoints: [
		{
			id: VALID_UUID,
			services: [{ name: "opensearch", port: 9200, url: "https://os.example.com:9200" }],
			public: {},
		},
	],
	created_at: "2025-06-01T12:00:00+00:00",
	updated_at: "2025-06-01T12:30:00+00:00",
	version: "2.0",
	region: VALID_REGION,
};

const validNodeType = {
	stock_status: "available" as const,
	name: "SEARCHDB-DEDICATED-2C-8G",
	description: "Dedicated 2 vCPU / 8 GB node",
	vcpus: 2,
	memory_bytes: 8589934592,
	disabled: false,
	beta: false,
	instance_range: "PRO2",
	available_volume_types: [
		{
			type: "sbs_5k" as const,
			description: "Block storage 5k IOPS",
			min_size_bytes: 5000000000,
			max_size_bytes: 10000000000000,
			chunk_size_bytes: 1000000000,
		},
	],
};

/**
 * API: GET /searchdb/v1alpha1/regions/{region}/deployments
 * Spec: specs/scaleway-api/opensearch/api-reference.md#list-deployments
 */
describe("contract: ListDeployments", () => {
	it("validates response shape", () => {
		expect(() =>
			ListDeploymentsResponse.parse({ deployments: [validDeployment], total_count: 1 }),
		).not.toThrow();
	});

	it("validates empty response", () => {
		expect(() => ListDeploymentsResponse.parse({ deployments: [], total_count: 0 })).not.toThrow();
	});

	it("rejects response missing deployments array", () => {
		expect(() => ListDeploymentsResponse.parse({ total_count: 0 })).toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListDeploymentsParams.parse({
				region: VALID_REGION,
				organizationId: VALID_UUID,
				projectId: VALID_UUID,
				name: "os",
				tags: ["prod"],
				orderBy: "created_at_desc",
			}),
		).not.toThrow();
	});
});

/**
 * API: GET /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}
 * Spec: specs/scaleway-api/opensearch/api-reference.md#get-deployment
 */
describe("contract: GetDeployment / Deployment entity", () => {
	it("validates deployment response", () => {
		expect(() => Deployment.parse(validDeployment)).not.toThrow();
	});

	it("validates a deployment with a null volume and deprecated node_amount", () => {
		expect(() =>
			Deployment.parse({ ...validDeployment, volume: null, node_amount: 1 }),
		).not.toThrow();
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
		}
	});

	it("rejects invalid deployment status", () => {
		expect(() => Deployment.parse({ ...validDeployment, status: "running" })).toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			GetDeploymentParams.parse({ region: VALID_REGION, deploymentId: VALID_UUID }),
		).not.toThrow();
		expect(() => GetDeploymentParams.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: POST /searchdb/v1alpha1/regions/{region}/deployments
 * Spec: specs/scaleway-api/opensearch/api-reference.md#create-deployment
 */
describe("contract: CreateDeployment request shape", () => {
	it("validates minimal create request", () => {
		expect(() =>
			CreateDeploymentParams.parse({
				region: VALID_REGION,
				name: "os",
				nodeType: "SEARCHDB-SHARED-2C-8G",
				version: "2.0",
			}),
		).not.toThrow();
	});

	it("validates full create request", () => {
		expect(() =>
			CreateDeploymentParams.parse({
				region: VALID_REGION,
				name: "os",
				nodeType: "SEARCHDB-SHARED-2C-8G",
				version: "2.0",
				projectId: VALID_UUID,
				tags: ["t"],
				nodeCount: 3,
				userName: "admin",
				password: "secret",
				volume: { type: "sbs_15k", sizeBytes: 5000000000 },
				endpoints: [{ public: true }, { privateNetworkId: VALID_UUID }],
			}),
		).not.toThrow();
	});

	it("rejects create without required fields", () => {
		expect(() => CreateDeploymentParams.parse({ region: VALID_REGION })).toThrow();
		expect(() =>
			CreateDeploymentParams.parse({ region: VALID_REGION, name: "os", nodeType: "x" }),
		).toThrow();
	});

	it("rejects invalid volume type", () => {
		expect(() =>
			CreateDeploymentParams.parse({
				region: VALID_REGION,
				name: "os",
				nodeType: "x",
				version: "2.0",
				volume: { type: "ssd", sizeBytes: 1 },
			}),
		).toThrow();
	});
});

/**
 * API: PATCH /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}
 * Spec: specs/scaleway-api/opensearch/api-reference.md#update-deployment
 */
describe("contract: UpdateDeployment request shape", () => {
	it("validates update with all optional fields", () => {
		expect(() =>
			UpdateDeploymentParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				name: "n",
				tags: ["a"],
			}),
		).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateDeploymentParams.parse({ region: VALID_REGION, deploymentId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: POST /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/upgrade
 * Spec: specs/scaleway-api/opensearch/api-reference.md#upgrade-deployment
 */
describe("contract: UpgradeDeployment request shape", () => {
	it("validates upgrade by node count", () => {
		expect(() =>
			UpgradeDeploymentParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				nodeCount: 3,
			}),
		).not.toThrow();
	});

	it("validates upgrade by volume size", () => {
		expect(() =>
			UpgradeDeploymentParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				volumeSizeBytes: 10000000000,
			}),
		).not.toThrow();
	});
});

/**
 * API: DELETE /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}
 * Spec: specs/scaleway-api/opensearch/api-reference.md#delete-deployment
 */
describe("contract: DeleteDeployment request shape", () => {
	it("validates delete request", () => {
		expect(() =>
			DeleteDeploymentParams.parse({ region: VALID_REGION, deploymentId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing deployment id", () => {
		expect(() => DeleteDeploymentParams.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: GET /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/certificate-authority
 * Spec: specs/scaleway-api/opensearch/api-reference.md#get-certificate-authority
 */
describe("contract: GetCertificateAuthority request shape", () => {
	it("validates request", () => {
		expect(() =>
			GetCertificateAuthorityParams.parse({ region: VALID_REGION, deploymentId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: GET /searchdb/v1alpha1/regions/{region}/node-types
 * Spec: specs/scaleway-api/opensearch/api-reference.md#list-node-types
 */
describe("contract: ListNodeTypes", () => {
	it("validates response shape", () => {
		expect(() =>
			ListNodeTypesResponse.parse({ node_types: [validNodeType], total_count: 1 }),
		).not.toThrow();
	});

	it("validates all stock statuses", () => {
		for (const status of ["unknown_stock", "low_stock", "out_of_stock", "available"]) {
			expect(() => NodeType.parse({ ...validNodeType, stock_status: status })).not.toThrow();
		}
	});

	it("rejects invalid stock status", () => {
		expect(() => NodeType.parse({ ...validNodeType, stock_status: "sold_out" })).toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			ListNodeTypesParams.parse({ region: VALID_REGION, orderBy: "memory_asc" }),
		).not.toThrow();
	});
});

/**
 * API: GET /searchdb/v1alpha1/regions/{region}/versions
 * Spec: specs/scaleway-api/opensearch/api-reference.md#list-versions
 */
describe("contract: ListVersions", () => {
	it("validates response shape", () => {
		const version = { version: "2.0", end_of_life: null, disabled: false, beta: false };
		expect(() => ListVersionsResponse.parse({ versions: [version], total_count: 1 })).not.toThrow();
	});

	it("validates version with end_of_life date", () => {
		expect(() =>
			Version.parse({
				version: "1.3",
				end_of_life: "2026-01-01T00:00:00+00:00",
				disabled: true,
				beta: false,
			}),
		).not.toThrow();
	});

	it("validates request with filter", () => {
		expect(() =>
			ListVersionsParams.parse({ region: VALID_REGION, version: "2.0", orderBy: "version_desc" }),
		).not.toThrow();
	});
});

/**
 * API: GET/POST /searchdb/v1alpha1/regions/{region}/deployments/{deployment_id}/users ...
 * Spec: specs/scaleway-api/opensearch/api-reference.md#list-users
 */
describe("contract: Users", () => {
	it("validates users response shape", () => {
		expect(() =>
			ListUsersResponse.parse({ users: [{ username: "admin" }], total_count: 1 }),
		).not.toThrow();
	});

	it("validates User entity", () => {
		expect(() => User.parse({ username: "admin" })).not.toThrow();
		expect(() => User.parse({})).toThrow();
	});

	it("validates list users request", () => {
		expect(() =>
			ListUsersParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				name: "adm",
				orderBy: "name_asc",
			}),
		).not.toThrow();
	});

	it("validates create user request", () => {
		expect(() =>
			CreateUserParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				username: "admin",
				password: "secret",
			}),
		).not.toThrow();
		expect(() =>
			CreateUserParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				username: "admin",
			}),
		).toThrow();
	});

	it("validates update user request with and without password", () => {
		expect(() =>
			UpdateUserParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				username: "admin",
				password: "np",
			}),
		).not.toThrow();
		expect(() =>
			UpdateUserParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				username: "admin",
			}),
		).not.toThrow();
	});

	it("validates delete user request", () => {
		expect(() =>
			DeleteUserParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				username: "admin",
			}),
		).not.toThrow();
	});
});

/**
 * API: POST/DELETE /searchdb/v1alpha1/regions/{region}/endpoints ...
 * Spec: specs/scaleway-api/opensearch/api-reference.md#create-endpoint
 */
describe("contract: Endpoints", () => {
	it("validates Endpoint entity (public)", () => {
		expect(() =>
			Endpoint.parse({
				id: VALID_UUID,
				services: [{ name: "opensearch", port: 9200, url: "https://os:9200" }],
				public: {},
			}),
		).not.toThrow();
	});

	it("validates Endpoint entity (private network) with deprecated dns_record", () => {
		expect(() =>
			Endpoint.parse({
				id: VALID_UUID,
				dns_record: "os.example.com",
				services: [],
				private_network: { private_network_id: VALID_UUID },
			}),
		).not.toThrow();
	});

	it("validates create endpoint request (public)", () => {
		expect(() =>
			CreateEndpointParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				public: true,
			}),
		).not.toThrow();
	});

	it("validates create endpoint request (private network)", () => {
		expect(() =>
			CreateEndpointParams.parse({
				region: VALID_REGION,
				deploymentId: VALID_UUID,
				privateNetworkId: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("validates delete endpoint request", () => {
		expect(() =>
			DeleteEndpointParams.parse({ region: VALID_REGION, endpointId: VALID_UUID }),
		).not.toThrow();
	});
});

// --- Pagination & auth contracts ---

describe("contract: pagination & region", () => {
	it("applies default pagination values", () => {
		const result = ListDeploymentsParams.parse({ region: VALID_REGION });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("rejects page size over 100", () => {
		expect(() => ListDeploymentsParams.parse({ region: VALID_REGION, pageSize: 101 })).toThrow();
	});

	it("requires region on all list operations", () => {
		expect(() => ListDeploymentsParams.parse({})).toThrow();
		expect(() => ListNodeTypesParams.parse({})).toThrow();
		expect(() => ListVersionsParams.parse({})).toThrow();
	});

	it("validates region format (xx-xxx)", () => {
		expect(() => ListDeploymentsParams.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListDeploymentsParams.parse({ region: "invalid-region" })).toThrow();
	});
});
