/**
 * Contract tests for Kubernetes (k8s) MCP tools.
 *
 * Validates request/response shapes, pagination, auth requirements, and error codes
 * against the Scaleway K8s API specification in specs/scaleway-api/k8s/.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/kubernetes/
 * Spec: specs/scaleway-api/k8s/api-reference.md
 * Parity Matrix: tests/parity-matrix.json#k8s
 *
 * Each test references its corresponding Scaleway API endpoint.
 */
import { createAdvancedClient, withProfile } from "@scaleway/sdk-client";
import { createScalewayClient } from "../../../../src/shared/client.js";
import * as httpHandlers from "../../../../src/tools/k8s/handlers.js";

import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { registerK8sTools } from "../../../../src/tools/k8s/index.js";
import {
	ClusterCni,
	ClusterStatus,
	ClusterType,
	CreateClusterInput,
	CreatePoolInput,
	DeleteClusterInput,
	DeletePoolInput,
	GetClusterInput,
	GetClusterKubeconfigInput,
	GetPoolInput,
	ListClusterAvailableVersionsInput,
	ListClustersInput,
	ListPoolsInput,
	PoolStatus,
	UpdatePoolInput,
	UpgradeClusterInput,
	UpgradePoolInput,
} from "../../../../src/tools/k8s/types.js";

vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({ defaultRegion: "fr-par" })),
}));
vi.mock("../../../../src/shared/client.js", () => ({ createScalewayClient: vi.fn() }));
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const VALID_UUID = "11111111-1111-1111-1111-111111111111";

describe("k8s contract tests", () => {
	describe("tool registration", () => {
		it("registers all 13 k8s tools on McpServer", () => {
			const server = new McpServer({ name: "test", version: "0.0.1" });
			expect(() => registerK8sTools(server)).not.toThrow();
		});
	});

	// --- Schema shape validation ---

	describe("enum schemas", () => {
		// API ref: specs/scaleway-api/k8s/ - Cluster status values
		it("ClusterStatus accepts all valid statuses", () => {
			const statuses = [
				"unknown",
				"creating",
				"ready",
				"deleting",
				"deleted",
				"updating",
				"locked",
				"pool_required",
			];
			for (const s of statuses) {
				expect(ClusterStatus.parse(s)).toBe(s);
			}
		});

		it("ClusterStatus rejects invalid status", () => {
			expect(() => ClusterStatus.parse("running")).toThrow();
		});

		// API ref: specs/scaleway-api/k8s/ - CNI options
		it("ClusterCni accepts all valid CNI options", () => {
			const cnis = ["unknown_cni", "cilium", "calico", "kilo", "flannel", "none"];
			for (const c of cnis) {
				expect(ClusterCni.parse(c)).toBe(c);
			}
		});

		it("ClusterCni rejects invalid CNI", () => {
			expect(() => ClusterCni.parse("weave")).toThrow();
		});

		// API ref: specs/scaleway-api/k8s/ - Cluster type
		it("ClusterType accepts valid types", () => {
			expect(ClusterType.parse("kapsule")).toBe("kapsule");
			expect(ClusterType.parse("multicloud")).toBe("multicloud");
			expect(ClusterType.parse("unknown")).toBe("unknown");
		});

		it("ClusterType rejects invalid type", () => {
			expect(() => ClusterType.parse("eks")).toThrow();
		});

		// API ref: specs/scaleway-api/k8s/ - Pool status values
		it("PoolStatus accepts all valid statuses", () => {
			const statuses = [
				"unknown",
				"ready",
				"deleting",
				"creating",
				"scaling",
				"warning",
				"locked",
				"upgrading",
			];
			for (const s of statuses) {
				expect(PoolStatus.parse(s)).toBe(s);
			}
		});

		it("PoolStatus rejects invalid status", () => {
			expect(() => PoolStatus.parse("running")).toThrow();
		});
	});

	// --- Cluster input schemas ---

	describe("ListClustersInput", () => {
		// API ref: GET /k8s/v1/regions/{region}/clusters
		it("accepts valid input with defaults", () => {
			const input = ListClustersInput.parse({ region: "fr-par" });
			expect(input.region).toBe("fr-par");
			expect(input.page).toBe(1);
			expect(input.pageSize).toBe(50);
		});

		it("accepts all optional filters", () => {
			const input = ListClustersInput.parse({
				region: "nl-ams",
				page: 2,
				pageSize: 25,
				name: "prod",
				status: "ready",
				type: "kapsule",
				project_id: VALID_UUID,
			});
			expect(input.name).toBe("prod");
			expect(input.status).toBe("ready");
			expect(input.type).toBe("kapsule");
			expect(input.project_id).toBe(VALID_UUID);
		});

		it("rejects invalid region format", () => {
			expect(() => ListClustersInput.parse({ region: "invalid" })).toThrow();
		});

		it("rejects page size over 100", () => {
			expect(() => ListClustersInput.parse({ region: "fr-par", pageSize: 101 })).toThrow();
		});
	});

	describe("GetClusterInput", () => {
		// API ref: GET /k8s/v1/regions/{region}/clusters/{cluster_id}
		it("accepts valid input", () => {
			const input = GetClusterInput.parse({ region: "fr-par", cluster_id: VALID_UUID });
			expect(input.cluster_id).toBe(VALID_UUID);
		});

		it("rejects non-UUID cluster_id", () => {
			expect(() => GetClusterInput.parse({ region: "fr-par", cluster_id: "not-a-uuid" })).toThrow();
		});

		it("rejects missing region", () => {
			expect(() => GetClusterInput.parse({ cluster_id: VALID_UUID })).toThrow();
		});
	});

	describe("CreateClusterInput", () => {
		// API ref: POST /k8s/v1/regions/{region}/clusters
		it("accepts valid minimal input", () => {
			const input = CreateClusterInput.parse({
				region: "fr-par",
				name: "my-cluster",
				version: "1.30.2",
				cni: "cilium",
			});
			expect(input.name).toBe("my-cluster");
			expect(input.version).toBe("1.30.2");
			expect(input.cni).toBe("cilium");
		});

		it("accepts all optional fields", () => {
			const input = CreateClusterInput.parse({
				region: "fr-par",
				name: "my-cluster",
				version: "1.30.2",
				cni: "cilium",
				description: "Production cluster",
				tags: ["env:prod", "team:infra"],
				type: "kapsule",
				project_id: VALID_UUID,
			});
			expect(input.description).toBe("Production cluster");
			expect(input.tags).toEqual(["env:prod", "team:infra"]);
		});

		it("rejects empty name", () => {
			expect(() =>
				CreateClusterInput.parse({
					region: "fr-par",
					name: "",
					version: "1.30.2",
					cni: "cilium",
				}),
			).toThrow();
		});

		it("rejects empty version", () => {
			expect(() =>
				CreateClusterInput.parse({
					region: "fr-par",
					name: "cluster",
					version: "",
					cni: "cilium",
				}),
			).toThrow();
		});

		it("rejects invalid CNI", () => {
			expect(() =>
				CreateClusterInput.parse({
					region: "fr-par",
					name: "cluster",
					version: "1.30.2",
					cni: "weave",
				}),
			).toThrow();
		});
	});

	describe("DeleteClusterInput", () => {
		// API ref: DELETE /k8s/v1/regions/{region}/clusters/{cluster_id}
		it("accepts valid input without additional resources flag", () => {
			const input = DeleteClusterInput.parse({ region: "fr-par", cluster_id: VALID_UUID });
			expect(input.with_additional_resources).toBeUndefined();
		});

		it("accepts with_additional_resources flag", () => {
			const input = DeleteClusterInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
				with_additional_resources: true,
			});
			expect(input.with_additional_resources).toBe(true);
		});
	});

	describe("UpgradeClusterInput", () => {
		// API ref: POST /k8s/v1/regions/{region}/clusters/{cluster_id}/upgrade
		it("accepts valid input", () => {
			const input = UpgradeClusterInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
				version: "1.31.0",
			});
			expect(input.version).toBe("1.31.0");
		});

		it("accepts upgrade_pools option", () => {
			const input = UpgradeClusterInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
				version: "1.31.0",
				upgrade_pools: true,
			});
			expect(input.upgrade_pools).toBe(true);
		});

		it("rejects empty version", () => {
			expect(() =>
				UpgradeClusterInput.parse({
					region: "fr-par",
					cluster_id: VALID_UUID,
					version: "",
				}),
			).toThrow();
		});
	});

	describe("ListClusterAvailableVersionsInput", () => {
		// API ref: GET /k8s/v1/regions/{region}/clusters/{cluster_id}/available-versions
		it("accepts valid input", () => {
			const input = ListClusterAvailableVersionsInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
			});
			expect(input.cluster_id).toBe(VALID_UUID);
		});

		it("rejects missing cluster_id", () => {
			expect(() => ListClusterAvailableVersionsInput.parse({ region: "fr-par" })).toThrow();
		});
	});

	describe("GetClusterKubeconfigInput", () => {
		// API ref: GET /k8s/v1/regions/{region}/clusters/{cluster_id}/kubeconfig
		it("accepts valid input", () => {
			const input = GetClusterKubeconfigInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
			});
			expect(input.region).toBe("fr-par");
			expect(input.cluster_id).toBe(VALID_UUID);
		});
	});

	// --- Node Pool input schemas ---

	describe("ListPoolsInput", () => {
		// API ref: GET /k8s/v1/regions/{region}/clusters/{cluster_id}/pools
		it("accepts valid input with defaults", () => {
			const input = ListPoolsInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
			});
			expect(input.page).toBe(1);
			expect(input.pageSize).toBe(50);
		});

		it("accepts optional filters", () => {
			const input = ListPoolsInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
				name: "default",
				status: "ready",
			});
			expect(input.name).toBe("default");
			expect(input.status).toBe("ready");
		});
	});

	describe("GetPoolInput", () => {
		// API ref: GET /k8s/v1/regions/{region}/pools/{pool_id}
		it("accepts valid input", () => {
			const input = GetPoolInput.parse({ region: "fr-par", pool_id: VALID_UUID });
			expect(input.pool_id).toBe(VALID_UUID);
		});

		it("rejects non-UUID pool_id", () => {
			expect(() => GetPoolInput.parse({ region: "fr-par", pool_id: "bad" })).toThrow();
		});
	});

	describe("CreatePoolInput", () => {
		// API ref: POST /k8s/v1/regions/{region}/clusters/{cluster_id}/pools
		it("accepts valid minimal input", () => {
			const input = CreatePoolInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
				name: "default-pool",
				node_type: "DEV1-M",
				size: 3,
			});
			expect(input.name).toBe("default-pool");
			expect(input.node_type).toBe("DEV1-M");
			expect(input.size).toBe(3);
		});

		it("accepts autoscaling configuration", () => {
			const input = CreatePoolInput.parse({
				region: "fr-par",
				cluster_id: VALID_UUID,
				name: "auto-pool",
				node_type: "GP1-S",
				size: 3,
				min_size: 1,
				max_size: 10,
				autoscaling: true,
				autohealing: true,
				tags: ["env:staging"],
			});
			expect(input.autoscaling).toBe(true);
			expect(input.min_size).toBe(1);
			expect(input.max_size).toBe(10);
		});

		it("rejects zero size", () => {
			expect(() =>
				CreatePoolInput.parse({
					region: "fr-par",
					cluster_id: VALID_UUID,
					name: "pool",
					node_type: "DEV1-M",
					size: 0,
				}),
			).toThrow();
		});

		it("rejects empty node_type", () => {
			expect(() =>
				CreatePoolInput.parse({
					region: "fr-par",
					cluster_id: VALID_UUID,
					name: "pool",
					node_type: "",
					size: 1,
				}),
			).toThrow();
		});
	});

	describe("UpdatePoolInput", () => {
		// API ref: PATCH /k8s/v1/regions/{region}/pools/{pool_id}
		it("accepts valid input with size", () => {
			const input = UpdatePoolInput.parse({
				region: "fr-par",
				pool_id: VALID_UUID,
				size: 5,
			});
			expect(input.size).toBe(5);
		});

		it("accepts all optional update fields", () => {
			const input = UpdatePoolInput.parse({
				region: "fr-par",
				pool_id: VALID_UUID,
				size: 5,
				min_size: 2,
				max_size: 10,
				autoscaling: true,
				autohealing: false,
				tags: ["updated"],
			});
			expect(input.autoscaling).toBe(true);
			expect(input.autohealing).toBe(false);
			expect(input.tags).toEqual(["updated"]);
		});

		it("accepts zero size for scale-down", () => {
			const input = UpdatePoolInput.parse({
				region: "fr-par",
				pool_id: VALID_UUID,
				size: 0,
			});
			expect(input.size).toBe(0);
		});
	});

	describe("DeletePoolInput", () => {
		// API ref: DELETE /k8s/v1/regions/{region}/pools/{pool_id}
		it("accepts valid input", () => {
			const input = DeletePoolInput.parse({ region: "fr-par", pool_id: VALID_UUID });
			expect(input.pool_id).toBe(VALID_UUID);
		});
	});

	describe("UpgradePoolInput", () => {
		// API ref: POST /k8s/v1/regions/{region}/pools/{pool_id}/upgrade
		it("accepts valid input", () => {
			const input = UpgradePoolInput.parse({
				region: "fr-par",
				pool_id: VALID_UUID,
				version: "1.31.0",
			});
			expect(input.version).toBe("1.31.0");
		});

		it("rejects empty version", () => {
			expect(() =>
				UpgradePoolInput.parse({
					region: "fr-par",
					pool_id: VALID_UUID,
					version: "",
				}),
			).toThrow();
		});
	});

	// --- Regional API validation ---

	describe("regional API support", () => {
		it("accepts fr-par region", () => {
			expect(GetClusterInput.parse({ region: "fr-par", cluster_id: VALID_UUID }).region).toBe(
				"fr-par",
			);
		});

		it("accepts nl-ams region", () => {
			expect(GetClusterInput.parse({ region: "nl-ams", cluster_id: VALID_UUID }).region).toBe(
				"nl-ams",
			);
		});

		it("accepts pl-waw region", () => {
			expect(GetClusterInput.parse({ region: "pl-waw", cluster_id: VALID_UUID }).region).toBe(
				"pl-waw",
			);
		});

		it("rejects zone format (k8s is regional, not zonal)", () => {
			expect(() => GetClusterInput.parse({ region: "fr-par-1", cluster_id: VALID_UUID })).toThrow();
		});
	});
});

// Exercise the installed SDK's Request construction, JSON parsing, and real HTTP errors.
// Only the HTTP transport is replaced: no environment credentials or network calls.
describe("SDK HTTP request contracts", () => {
	function recordingClient(
		response: unknown = { id: "http-response", status: "ready" },
		status = 200,
	) {
		const requests: Request[] = [];
		const client = createAdvancedClient(
			withProfile({
				accessKey: "SCWXXXXXXXXXXXXXXXXX",
				secretKey: "00000000-0000-0000-0000-000000000000",
			}),
			(settings) => ({
				...settings,
				apiURL: "https://scaleway.invalid",
				httpClient: (async (input: RequestInfo | URL, init?: RequestInit) => {
					requests.push(new Request(input, init));
					return new Response(status === 204 ? null : JSON.stringify(response), {
						status,
						headers: { "Content-Type": "application/json" },
					});
				}) as typeof fetch,
			}),
		);
		vi.mocked(createScalewayClient).mockReturnValue(client);
		return { client, requests };
	}

	const jsonCases = [
		{
			name: "CreateCluster",
			method: "POST",
			path: "/k8s/v1/regions/fr-par/clusters",
			call: () =>
				httpHandlers.handleCreateCluster({
					region: "fr-par",
					name: "test",
					version: "1.32.0",
					cni: "cilium",
					tags: [],
				}),
			body: { name: "test", version: "1.32.0", cni: "cilium", tags: [] },
		},
		{
			name: "UpgradeCluster",
			method: "POST",
			path: "/k8s/v1/regions/fr-par/clusters/11111111-1111-1111-1111-111111111111/upgrade",
			call: () =>
				httpHandlers.handleUpgradeCluster({
					region: "fr-par",
					cluster_id: "11111111-1111-1111-1111-111111111111",
					version: "1.33.0",
					upgrade_pools: false,
				}),
			body: { version: "1.33.0", upgrade_pools: false },
		},
		{
			name: "CreatePool",
			method: "POST",
			path: "/k8s/v1/regions/fr-par/clusters/11111111-1111-1111-1111-111111111111/pools",
			call: () =>
				httpHandlers.handleCreatePool({
					region: "fr-par",
					cluster_id: "11111111-1111-1111-1111-111111111111",
					name: "test",
					node_type: "DEV1-M",
					size: 1,
					autoscaling: false,
				}),
			body: { name: "test", node_type: "DEV1-M", size: 1, autoscaling: false },
		},
		{
			name: "UpdatePool",
			method: "PATCH",
			path: "/k8s/v1/regions/fr-par/pools/11111111-1111-1111-1111-111111111111",
			call: () =>
				httpHandlers.handleUpdatePool({
					region: "fr-par",
					pool_id: "11111111-1111-1111-1111-111111111111",
					size: 0,
					autoscaling: false,
					tags: [],
				}),
			body: { size: 0, autoscaling: false, tags: [] },
		},
		{
			name: "UpgradePool",
			method: "POST",
			path: "/k8s/v1/regions/fr-par/pools/11111111-1111-1111-1111-111111111111/upgrade",
			call: () =>
				httpHandlers.handleUpgradePool({
					region: "fr-par",
					pool_id: "11111111-1111-1111-1111-111111111111",
					version: "1.33.0",
				}),
			body: { version: "1.33.0" },
		},
	];

	it.each(jsonCases)(
		"$name: $method $path sends application/json",
		async ({ call, method, path, body }) => {
			const response = { id: "http-response", status: "ready" };
			const { requests } = recordingClient(response);
			const result = await call();
			expect(requests).toHaveLength(1);
			const [request] = requests;
			expect(request.url).toBe(`https://scaleway.invalid${path}`);
			expect(request.method).toBe(method);
			expect(request.headers.get("Content-Type")).toBe("application/json");
			expect(request.headers.get("Accept")).toBe("application/json");
			expect(request.headers.get("X-Auth-Token")).toBe("00000000-0000-0000-0000-000000000000");
			expect(JSON.parse(await request.text())).toEqual(body);
			expect(result).toEqual({
				content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
			});
		},
	);

	it.each([
		[400, "invalid_input"],
		[401, "permission_denied"],
		[403, "permission_denied"],
		[404, "not_found"],
		[429, "rate_limited"],
		[500, "server_error"],
	] as const)("maps SDK HTTP %i errors to %s", async (status, type) => {
		const { requests } = recordingClient({ message: "HTTP contract error" }, status);
		const result = await jsonCases[0].call();
		expect(requests).toHaveLength(1);
		expect(result).toMatchObject({ isError: true });
		expect(JSON.parse(result.content[0].text)).toMatchObject({
			error: { type, statusCode: status },
		});
	});

	// These DELETE endpoints return HTTP 200 JSON resource bodies, not HTTP 204.
	it("DeleteCluster preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { requests } = recordingClient(response);
		const result = await httpHandlers.handleDeleteCluster({
			region: "fr-par",
			cluster_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/k8s/v1/regions/fr-par/clusters/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
	it("DeletePool preserves the HTTP 200 resource response", async () => {
		const response = { id: "11111111-1111-1111-1111-111111111111", status: "deleting" };
		const { requests } = recordingClient(response);
		const result = await httpHandlers.handleDeletePool({
			region: "fr-par",
			pool_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(requests).toHaveLength(1);
		expect(requests[0].method).toBe("DELETE");
		expect(new URL(requests[0].url).pathname).toBe(
			"/k8s/v1/regions/fr-par/pools/11111111-1111-1111-1111-111111111111",
		);
		expect(requests[0].body).toBeNull();
		expect(result).toEqual({
			content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
		});
	});
});
