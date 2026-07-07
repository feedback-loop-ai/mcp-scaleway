/**
 * Contract tests for Scaleway Clusters for Apache Kafka API (v1alpha1, Beta)
 *
 * Validates request/response shapes against specs/scaleway-api/kafka/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 */
import { describe, expect, it } from "vitest";
import {
	Cluster,
	ClusterStatus,
	CreateClusterParams,
	CreateEndpointParams,
	DeleteClusterParams,
	DeleteEndpointParams,
	Endpoint,
	EndpointSpec,
	GetClusterCertificateAuthorityParams,
	GetClusterParams,
	ListClustersParams,
	ListClustersResponse,
	ListNodeTypesParams,
	ListNodeTypesResponse,
	ListUsersParams,
	ListUsersResponse,
	ListVersionsParams,
	ListVersionsResponse,
	NodeType,
	NodeTypeStock,
	RenewClusterCertificateAuthorityParams,
	UpdateClusterParams,
	UpdateUserParams,
	User,
	Version,
	Volume,
	VolumeType,
} from "../../../src/tools/kafka/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

const validVolume = { type: "sbs_5k", size_bytes: 100000000000 };

const validEndpoint = {
	id: VALID_UUID,
	dns_records: ["broker-1.mnq.fr-par.scw.cloud"],
	port: 9092,
	private_network: { private_network_id: VALID_UUID },
};

const validCluster = {
	id: VALID_UUID,
	name: "my-kafka",
	project_id: VALID_UUID,
	organization_id: VALID_UUID,
	status: "ready" as const,
	version: "3.7.0",
	tags: ["prod"],
	settings: [{ name: "auto.create.topics.enable", bool_value: true }],
	node_amount: 3,
	node_type: "kafka-mnq-beta",
	volume: validVolume,
	endpoints: [validEndpoint],
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
	region: VALID_REGION,
};

const validNodeType = {
	name: "kafka-mnq-beta",
	stock_status: "available" as const,
	description: "Beta Kafka node",
	vcpus: 4,
	memory_bytes: 8589934592,
	available_volume_types: [
		{
			type: "sbs_5k",
			description: "Block SSD 5k",
			min_size_bytes: 5000000000,
			max_size_bytes: 10000000000000,
			chunk_size_bytes: 1000000000,
		},
	],
	disabled: false,
	beta: true,
	cluster_range: "1-6",
};

const validVersion = {
	version: "3.7.0",
	end_of_life_at: "2026-06-01T00:00:00Z",
	available_settings: [
		{
			name: "auto.create.topics.enable",
			hot_configurable: true,
			description: "Enable auto topic creation",
		},
	],
};

// --- Entity contracts ---

/**
 * API: GET /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}
 * Spec: specs/scaleway-api/kafka/api-reference.md#get-cluster
 */
describe("contract: Cluster entity shape", () => {
	it("validates a full cluster", () => {
		expect(() => Cluster.parse(validCluster)).not.toThrow();
	});

	it("validates all cluster statuses", () => {
		for (const status of ClusterStatus.options) {
			expect(() => Cluster.parse({ ...validCluster, status })).not.toThrow();
		}
	});

	it("rejects an invalid cluster status", () => {
		expect(() => Cluster.parse({ ...validCluster, status: "running" })).toThrow();
	});

	it("validates a minimal cluster without optional fields", () => {
		const minimal = {
			id: VALID_UUID,
			name: "min",
			project_id: VALID_UUID,
			organization_id: VALID_UUID,
			status: "creating",
			version: "3.7.0",
			tags: [],
			node_amount: 1,
			node_type: "kafka-mnq-beta",
			region: VALID_REGION,
		};
		expect(() => Cluster.parse(minimal)).not.toThrow();
	});
});

describe("contract: Volume entity shape", () => {
	it("validates a volume", () => {
		expect(() => Volume.parse(validVolume)).not.toThrow();
	});

	it("validates all volume types", () => {
		for (const type of VolumeType.options) {
			expect(() => Volume.parse({ ...validVolume, type })).not.toThrow();
		}
	});
});

describe("contract: Endpoint entity shape", () => {
	it("validates a private-network endpoint", () => {
		expect(() => Endpoint.parse(validEndpoint)).not.toThrow();
	});

	it("validates a public-network endpoint", () => {
		const publicEndpoint = {
			id: VALID_UUID,
			dns_records: ["kafka.scw.cloud"],
			port: 9092,
			public_network: {},
		};
		expect(() => Endpoint.parse(publicEndpoint)).not.toThrow();
	});
});

describe("contract: User entity shape", () => {
	it("validates a user", () => {
		expect(() => User.parse({ username: "admin" })).not.toThrow();
	});

	it("rejects a user without username", () => {
		expect(() => User.parse({})).toThrow();
	});
});

describe("contract: NodeType entity shape", () => {
	it("validates a node type", () => {
		expect(() => NodeType.parse(validNodeType)).not.toThrow();
	});

	it("validates all stock statuses", () => {
		for (const stock_status of NodeTypeStock.options) {
			expect(() => NodeType.parse({ ...validNodeType, stock_status })).not.toThrow();
		}
	});

	it("rejects an invalid stock status", () => {
		expect(() => NodeType.parse({ ...validNodeType, stock_status: "sold_out" })).toThrow();
	});
});

describe("contract: Version entity shape", () => {
	it("validates a version", () => {
		expect(() => Version.parse(validVersion)).not.toThrow();
	});
});

// --- Request/response contracts ---

/**
 * API: GET /kafka/v1alpha1/regions/{region}/clusters
 * Spec: specs/scaleway-api/kafka/api-reference.md#list-clusters
 */
describe("contract: ListClusters", () => {
	it("validates the response shape", () => {
		expect(() =>
			ListClustersResponse.parse({ clusters: [validCluster], total_count: 1 }),
		).not.toThrow();
	});

	it("validates empty response", () => {
		expect(() => ListClustersResponse.parse({ clusters: [], total_count: 0 })).not.toThrow();
	});

	it("rejects a response missing clusters array", () => {
		expect(() => ListClustersResponse.parse({ total_count: 0 })).toThrow();
	});

	it("validates request with filters", () => {
		expect(() =>
			ListClustersParams.parse({
				region: VALID_REGION,
				projectId: VALID_UUID,
				organizationId: VALID_UUID,
				name: "prod",
				tags: ["a"],
				orderBy: "status_desc",
			}),
		).not.toThrow();
	});

	it("rejects an invalid order_by", () => {
		expect(() => ListClustersParams.parse({ region: VALID_REGION, orderBy: "size_asc" })).toThrow();
	});
});

/**
 * API: GET /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}
 * Spec: specs/scaleway-api/kafka/api-reference.md#get-cluster
 */
describe("contract: GetCluster request shape", () => {
	it("validates the request", () => {
		expect(() =>
			GetClusterParams.parse({ region: VALID_REGION, clusterId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects a missing cluster_id", () => {
		expect(() => GetClusterParams.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: POST /kafka/v1alpha1/regions/{region}/clusters
 * Spec: specs/scaleway-api/kafka/api-reference.md#create-cluster
 */
describe("contract: CreateCluster request shape", () => {
	it("validates a minimal create request", () => {
		expect(() =>
			CreateClusterParams.parse({
				region: VALID_REGION,
				name: "c",
				version: "3.7.0",
				nodeType: "kafka-mnq-beta",
				nodeAmount: 1,
				volumeSizeBytes: 50000000000,
				volumeType: "sbs_5k",
			}),
		).not.toThrow();
	});

	it("validates a full create request", () => {
		expect(() =>
			CreateClusterParams.parse({
				region: VALID_REGION,
				name: "c",
				version: "3.7.0",
				nodeType: "kafka-mnq-beta",
				nodeAmount: 3,
				volumeSizeBytes: 50000000000,
				volumeType: "sbs_15k",
				projectId: VALID_UUID,
				tags: ["prod"],
				userName: "admin",
				password: "secret",
				endpoints: [{ privateNetworkId: VALID_UUID }, { publicNetwork: true }],
			}),
		).not.toThrow();
	});

	it("rejects a create request missing required fields", () => {
		expect(() => CreateClusterParams.parse({ region: VALID_REGION, name: "c" })).toThrow();
	});

	it("rejects an invalid volume type", () => {
		expect(() =>
			CreateClusterParams.parse({
				region: VALID_REGION,
				name: "c",
				version: "3.7.0",
				nodeType: "kafka-mnq-beta",
				nodeAmount: 1,
				volumeSizeBytes: 50000000000,
				volumeType: "sbs_99k",
			}),
		).toThrow();
	});
});

/**
 * API: PATCH /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}
 * Spec: specs/scaleway-api/kafka/api-reference.md#update-cluster
 */
describe("contract: UpdateCluster request shape", () => {
	it("validates update with all optional fields", () => {
		expect(() =>
			UpdateClusterParams.parse({
				region: VALID_REGION,
				clusterId: VALID_UUID,
				name: "new",
				tags: ["x"],
			}),
		).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateClusterParams.parse({ region: VALID_REGION, clusterId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}
 * Spec: specs/scaleway-api/kafka/api-reference.md#delete-cluster
 */
describe("contract: DeleteCluster request shape", () => {
	it("validates the request", () => {
		expect(() =>
			DeleteClusterParams.parse({ region: VALID_REGION, clusterId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: GET /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}/certificate-authority
 *      POST /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}/renew-certificate-authority
 * Spec: specs/scaleway-api/kafka/api-reference.md#certificate-authority
 */
describe("contract: Certificate Authority request shapes", () => {
	it("validates the get request", () => {
		expect(() =>
			GetClusterCertificateAuthorityParams.parse({ region: VALID_REGION, clusterId: VALID_UUID }),
		).not.toThrow();
	});

	it("validates the renew request", () => {
		expect(() =>
			RenewClusterCertificateAuthorityParams.parse({
				region: VALID_REGION,
				clusterId: VALID_UUID,
			}),
		).not.toThrow();
	});
});

/**
 * API: POST /kafka/v1alpha1/regions/{region}/endpoints
 *      DELETE /kafka/v1alpha1/regions/{region}/endpoints/{endpoint_id}
 * Spec: specs/scaleway-api/kafka/api-reference.md#endpoints
 */
describe("contract: Endpoint request shapes", () => {
	it("validates a create endpoint request (private network)", () => {
		expect(() =>
			CreateEndpointParams.parse({
				region: VALID_REGION,
				clusterId: VALID_UUID,
				privateNetworkId: VALID_UUID,
			}),
		).not.toThrow();
	});

	it("validates a create endpoint request (public network)", () => {
		expect(() =>
			CreateEndpointParams.parse({
				region: VALID_REGION,
				clusterId: VALID_UUID,
				publicNetwork: true,
			}),
		).not.toThrow();
	});

	it("validates a delete endpoint request", () => {
		expect(() =>
			DeleteEndpointParams.parse({ region: VALID_REGION, endpointId: VALID_UUID }),
		).not.toThrow();
	});

	it("validates the EndpointSpec helper shape", () => {
		expect(() => EndpointSpec.parse({})).not.toThrow();
		expect(() => EndpointSpec.parse({ privateNetworkId: VALID_UUID })).not.toThrow();
		expect(() => EndpointSpec.parse({ publicNetwork: true })).not.toThrow();
	});
});

/**
 * API: GET /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}/users
 *      PATCH /kafka/v1alpha1/regions/{region}/clusters/{cluster_id}/users/{username}
 * Spec: specs/scaleway-api/kafka/api-reference.md#users
 */
describe("contract: Users request/response shapes", () => {
	it("validates the list users response", () => {
		expect(() =>
			ListUsersResponse.parse({ users: [{ username: "admin" }], total_count: 1 }),
		).not.toThrow();
	});

	it("validates a list users request with filters", () => {
		expect(() =>
			ListUsersParams.parse({
				region: VALID_REGION,
				clusterId: VALID_UUID,
				name: "adm",
				orderBy: "name_asc",
			}),
		).not.toThrow();
	});

	it("validates an update user request", () => {
		expect(() =>
			UpdateUserParams.parse({
				region: VALID_REGION,
				clusterId: VALID_UUID,
				username: "admin",
				password: "secret",
			}),
		).not.toThrow();
	});

	it("rejects an update user request missing username", () => {
		expect(() => UpdateUserParams.parse({ region: VALID_REGION, clusterId: VALID_UUID })).toThrow();
	});
});

/**
 * API: GET /kafka/v1alpha1/regions/{region}/node-types
 * Spec: specs/scaleway-api/kafka/api-reference.md#list-node-types
 */
describe("contract: ListNodeTypes", () => {
	it("validates the response shape", () => {
		expect(() =>
			ListNodeTypesResponse.parse({ node_types: [validNodeType], total_count: 1 }),
		).not.toThrow();
	});

	it("validates request with includeDisabledTypes", () => {
		expect(() =>
			ListNodeTypesParams.parse({ region: VALID_REGION, includeDisabledTypes: true }),
		).not.toThrow();
	});
});

/**
 * API: GET /kafka/v1alpha1/regions/{region}/versions
 * Spec: specs/scaleway-api/kafka/api-reference.md#list-versions
 */
describe("contract: ListVersions", () => {
	it("validates the response shape", () => {
		expect(() =>
			ListVersionsResponse.parse({ versions: [validVersion], total_count: 1 }),
		).not.toThrow();
	});

	it("validates request with version filter", () => {
		expect(() =>
			ListVersionsParams.parse({ region: VALID_REGION, version: "3.7.0" }),
		).not.toThrow();
	});
});

// --- Pagination & auth contracts ---

describe("contract: pagination parameters", () => {
	it("applies default pagination values", () => {
		const result = ListClustersParams.parse({ region: VALID_REGION });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("rejects page size over 100", () => {
		expect(() => ListClustersParams.parse({ region: VALID_REGION, pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListClustersParams.parse({ region: VALID_REGION, page: 0 })).toThrow();
	});
});

describe("contract: authentication and region", () => {
	it("requires a region parameter", () => {
		expect(() => ListClustersParams.parse({})).toThrow();
		expect(() => ListNodeTypesParams.parse({})).toThrow();
		expect(() => ListVersionsParams.parse({})).toThrow();
	});

	it("validates region format (xx-xxx)", () => {
		expect(() => ListClustersParams.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListClustersParams.parse({ region: "invalid-region" })).toThrow();
	});
});
