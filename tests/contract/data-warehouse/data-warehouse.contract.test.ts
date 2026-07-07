/**
 * Contract tests for Scaleway Data Warehouse for ClickHouse® API (v1beta1)
 *
 * Validates request/response shapes against
 *   specs/scaleway-api/data-warehouse/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * Source of truth: https://www.scaleway.com/en/developers/api/data-warehouse/v1beta1/schema.yml
 * API is region-scoped (fr-par) and authenticated via the X-Auth-Token header.
 */
import { describe, expect, it } from "vitest";
import {
	CreateDatabaseParams,
	CreateDeploymentParams,
	CreateEndpointParams,
	CreateUserParams,
	Database,
	DatabaseOrderBy,
	DeleteDatabaseParams,
	DeleteDeploymentParams,
	DeleteEndpointParams,
	DeleteUserParams,
	Deployment,
	DeploymentOrderBy,
	DeploymentStatus,
	Endpoint,
	EndpointProtocol,
	GetDeploymentCertificateParams,
	GetDeploymentParams,
	ListDatabasesParams,
	ListDatabasesResponse,
	ListDeploymentsParams,
	ListDeploymentsResponse,
	ListPresetsParams,
	ListPresetsResponse,
	ListUsersParams,
	ListUsersResponse,
	ListVersionsParams,
	ListVersionsResponse,
	Preset,
	StartDeploymentParams,
	StopDeploymentParams,
	UpdateDeploymentParams,
	UpdateUserParams,
	User,
	UserOrderBy,
	Version,
} from "../../../src/tools/data-warehouse/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const REGION = "fr-par";

const validEndpoint = {
	id: VALID_UUID,
	dns_record: "abc.clickhouse.scw.cloud",
	services: [{ protocol: "https", port: 8443 }],
	private_network: null,
	public: {},
};

const validDeployment = {
	id: VALID_UUID,
	name: "analytics",
	organization_id: VALID_UUID,
	project_id: VALID_UUID,
	status: "ready",
	tags: ["prod"],
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	version: "24.8",
	replica_count: 2,
	shard_count: 1,
	cpu_min: 4,
	cpu_max: 8,
	endpoints: [validEndpoint],
	ram_per_cpu: 4,
	move_factor: 0.1,
	region: REGION,
};

// --- Enum contracts ---

describe("contract: enums", () => {
	it("accepts every documented deployment status", () => {
		for (const status of [
			"unknown_status",
			"ready",
			"creating",
			"configuring",
			"deleting",
			"error",
			"locked",
			"locking",
			"unlocking",
			"deploying",
			"stopping",
			"starting",
			"stopped",
		]) {
			expect(() => DeploymentStatus.parse(status)).not.toThrow();
		}
	});

	it("rejects an unknown deployment status", () => {
		expect(() => DeploymentStatus.parse("running")).toThrow();
	});

	it("accepts documented endpoint protocols", () => {
		for (const protocol of ["unknown_protocol", "tcp", "https", "mysql"]) {
			expect(() => EndpointProtocol.parse(protocol)).not.toThrow();
		}
	});

	it("accepts documented order_by values", () => {
		for (const value of ["created_at_desc", "created_at_asc", "name_asc", "name_desc"]) {
			expect(() => DeploymentOrderBy.parse(value)).not.toThrow();
		}
		for (const value of ["name_asc", "name_desc", "size_asc", "size_desc"]) {
			expect(() => DatabaseOrderBy.parse(value)).not.toThrow();
		}
		for (const value of ["name_asc", "name_desc"]) {
			expect(() => UserOrderBy.parse(value)).not.toThrow();
		}
	});
});

// --- Response shape contracts ---

/**
 * API: GET /datawarehouse/v1beta1/regions/{region}/deployments
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#list-deployments
 */
describe("contract: ListDeployments", () => {
	it("validates request params", () => {
		expect(() =>
			ListDeploymentsParams.parse({
				region: REGION,
				page: 1,
				pageSize: 20,
				projectId: VALID_UUID,
				organizationId: VALID_UUID,
				name: "an",
				tags: ["prod"],
				orderBy: "created_at_desc",
			}),
		).not.toThrow();
	});

	it("validates the response shape", () => {
		expect(() =>
			ListDeploymentsResponse.parse({ deployments: [validDeployment], total_count: 1 }),
		).not.toThrow();
		expect(() => ListDeploymentsResponse.parse({ deployments: [], total_count: 0 })).not.toThrow();
	});

	it("rejects a response missing the deployments array", () => {
		expect(() => ListDeploymentsResponse.parse({ total_count: 1 })).toThrow();
	});
});

/**
 * API: GET/PATCH/DELETE /datawarehouse/v1beta1/regions/{region}/deployments/{deployment_id}
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#get-deployment
 */
describe("contract: Deployment object + lifecycle params", () => {
	it("validates a full deployment object", () => {
		expect(() => Deployment.parse(validDeployment)).not.toThrow();
	});

	it("validates a deployment with null timestamps", () => {
		expect(() =>
			Deployment.parse({ ...validDeployment, created_at: null, updated_at: null }),
		).not.toThrow();
	});

	it("rejects a deployment missing its id", () => {
		const { id, ...rest } = validDeployment;
		void id;
		expect(() => Deployment.parse(rest)).toThrow();
	});

	it("validates get/delete/start/stop/certificate params", () => {
		const base = { region: REGION, deploymentId: VALID_UUID };
		expect(() => GetDeploymentParams.parse(base)).not.toThrow();
		expect(() => DeleteDeploymentParams.parse(base)).not.toThrow();
		expect(() => StartDeploymentParams.parse(base)).not.toThrow();
		expect(() => StopDeploymentParams.parse(base)).not.toThrow();
		expect(() => GetDeploymentCertificateParams.parse(base)).not.toThrow();
	});

	it("rejects a non-uuid deployment id", () => {
		expect(() => GetDeploymentParams.parse({ region: REGION, deploymentId: "nope" })).toThrow();
	});
});

/**
 * API: POST /datawarehouse/v1beta1/regions/{region}/deployments
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#create-deployment
 */
describe("contract: CreateDeployment request", () => {
	it("validates a minimal request", () => {
		expect(() => CreateDeploymentParams.parse({ region: REGION, name: "dw" })).not.toThrow();
	});

	it("validates a full request", () => {
		expect(() =>
			CreateDeploymentParams.parse({
				region: REGION,
				name: "dw",
				projectId: VALID_UUID,
				tags: ["prod"],
				version: "24.8",
				replicaCount: 2,
				shardCount: 1,
				password: "s3cret",
				cpuMin: 4,
				cpuMax: 8,
				ramPerCpu: 4,
				moveFactor: 0.2,
				endpoints: [{ privateNetworkId: VALID_UUID }, {}],
			}),
		).not.toThrow();
	});

	it("rejects a move factor outside [0,1]", () => {
		expect(() =>
			CreateDeploymentParams.parse({ region: REGION, name: "dw", moveFactor: 2 }),
		).toThrow();
	});

	it("rejects a request without a name", () => {
		expect(() => CreateDeploymentParams.parse({ region: REGION })).toThrow();
	});
});

/**
 * API: PATCH /datawarehouse/v1beta1/regions/{region}/deployments/{deployment_id}
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#update-deployment
 */
describe("contract: UpdateDeployment request", () => {
	it("validates an update with all editable fields", () => {
		expect(() =>
			UpdateDeploymentParams.parse({
				region: REGION,
				deploymentId: VALID_UUID,
				name: "new",
				tags: ["x"],
				cpuMin: 2,
				cpuMax: 6,
				replicaCount: 3,
				moveFactor: 0.5,
			}),
		).not.toThrow();
	});
});

/**
 * API: databases endpoints
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#databases
 */
describe("contract: Databases", () => {
	it("validates a database object", () => {
		expect(() => Database.parse({ name: "analytics", size: 1024 })).not.toThrow();
	});

	it("validates the list response", () => {
		expect(() =>
			ListDatabasesResponse.parse({ databases: [{ name: "a", size: 0 }], total_count: 1 }),
		).not.toThrow();
	});

	it("validates database request params", () => {
		expect(() =>
			ListDatabasesParams.parse({
				region: REGION,
				deploymentId: VALID_UUID,
				page: 1,
				pageSize: 50,
				name: "a",
				orderBy: "size_desc",
			}),
		).not.toThrow();
		expect(() =>
			CreateDatabaseParams.parse({ region: REGION, deploymentId: VALID_UUID, name: "a" }),
		).not.toThrow();
		expect(() =>
			DeleteDatabaseParams.parse({ region: REGION, deploymentId: VALID_UUID, name: "a" }),
		).not.toThrow();
	});
});

/**
 * API: users endpoints
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#users
 */
describe("contract: Users", () => {
	it("validates a user object", () => {
		expect(() => User.parse({ name: "admin", is_admin: true })).not.toThrow();
	});

	it("validates the list response", () => {
		expect(() =>
			ListUsersResponse.parse({ users: [{ name: "u", is_admin: false }], total_count: 1 }),
		).not.toThrow();
	});

	it("validates user request params", () => {
		expect(() =>
			ListUsersParams.parse({
				region: REGION,
				deploymentId: VALID_UUID,
				page: 1,
				pageSize: 50,
				name: "u",
				orderBy: "name_asc",
			}),
		).not.toThrow();
		expect(() =>
			CreateUserParams.parse({
				region: REGION,
				deploymentId: VALID_UUID,
				name: "u",
				password: "p",
				isAdmin: true,
			}),
		).not.toThrow();
		expect(() =>
			UpdateUserParams.parse({
				region: REGION,
				deploymentId: VALID_UUID,
				name: "u",
				password: "p",
				isAdmin: false,
			}),
		).not.toThrow();
		expect(() =>
			DeleteUserParams.parse({ region: REGION, deploymentId: VALID_UUID, name: "u" }),
		).not.toThrow();
	});

	it("rejects create user without a password", () => {
		expect(() =>
			CreateUserParams.parse({ region: REGION, deploymentId: VALID_UUID, name: "u" }),
		).toThrow();
	});
});

/**
 * API: endpoints endpoints
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#endpoints
 */
describe("contract: Endpoints", () => {
	it("validates an endpoint object (public and private)", () => {
		expect(() => Endpoint.parse(validEndpoint)).not.toThrow();
		expect(() =>
			Endpoint.parse({
				id: VALID_UUID,
				dns_record: "x",
				services: [{ protocol: "tcp", port: 9000 }],
				private_network: { private_network_id: VALID_UUID },
				public: null,
			}),
		).not.toThrow();
	});

	it("validates create/delete endpoint params", () => {
		expect(() =>
			CreateEndpointParams.parse({
				region: REGION,
				deploymentId: VALID_UUID,
				privateNetworkId: VALID_UUID,
			}),
		).not.toThrow();
		expect(() =>
			CreateEndpointParams.parse({ region: REGION, deploymentId: VALID_UUID }),
		).not.toThrow();
		expect(() =>
			DeleteEndpointParams.parse({ region: REGION, endpointId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: GET /datawarehouse/v1beta1/regions/{region}/presets
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#presets
 */
describe("contract: Presets", () => {
	it("validates a preset object and list response", () => {
		const preset = {
			name: "small",
			category: "general",
			cpu_min: 2,
			cpu_max: 4,
			ram_per_cpu: 4,
			replica_count: 1,
			shard_count: 1,
		};
		expect(() => Preset.parse(preset)).not.toThrow();
		expect(() => ListPresetsResponse.parse({ presets: [preset], total_count: 1 })).not.toThrow();
		expect(() => ListPresetsParams.parse({ region: REGION, page: 1, pageSize: 50 })).not.toThrow();
	});
});

/**
 * API: GET /datawarehouse/v1beta1/regions/{region}/versions
 * Spec: specs/scaleway-api/data-warehouse/api-reference.md#versions
 */
describe("contract: Versions", () => {
	it("validates a version object and list response", () => {
		expect(() => Version.parse({ version: "24.8", end_of_life_at: null })).not.toThrow();
		expect(() =>
			ListVersionsResponse.parse({ versions: [{ version: "24.8" }], total_count: 1 }),
		).not.toThrow();
		expect(() =>
			ListVersionsParams.parse({ region: REGION, page: 1, pageSize: 50, version: "24.8" }),
		).not.toThrow();
	});
});
