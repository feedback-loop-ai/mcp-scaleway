import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerKafkaTools } from "../../../src/tools/kafka/index.js";

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

const CLUSTER_ID = "00000000-0000-0000-0000-000000000010";
const PN_ID = "00000000-0000-0000-0000-000000000030";
const ENDPOINT_ID = "00000000-0000-0000-0000-000000000040";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";

describe("kafka module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerKafkaTools(server)).not.toThrow();
	});

	it("registers all 13 Kafka tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerKafkaTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(13);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toEqual([
			"scaleway_kafka_list_clusters",
			"scaleway_kafka_get_cluster",
			"scaleway_kafka_create_cluster",
			"scaleway_kafka_update_cluster",
			"scaleway_kafka_delete_cluster",
			"scaleway_kafka_get_cluster_certificate_authority",
			"scaleway_kafka_renew_cluster_certificate_authority",
			"scaleway_kafka_create_endpoint",
			"scaleway_kafka_delete_endpoint",
			"scaleway_kafka_list_users",
			"scaleway_kafka_update_user",
			"scaleway_kafka_list_node_types",
			"scaleway_kafka_list_versions",
		]);
	});

	it("wires each registered callback to its handler", async () => {
		mockFetch.mockReset();
		mockFetch.mockResolvedValue({
			clusters: [],
			users: [],
			node_types: [],
			versions: [],
			total_count: 0,
			id: CLUSTER_ID,
		});
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerKafkaTools(server);

		const callbacks = new Map<string, (params: unknown) => Promise<unknown>>();
		for (const call of toolSpy.mock.calls) {
			callbacks.set(call[0] as string, call[3] as (params: unknown) => Promise<unknown>);
		}

		const invocations: [string, Record<string, unknown>][] = [
			["scaleway_kafka_list_clusters", { region: "fr-par" }],
			["scaleway_kafka_get_cluster", { region: "fr-par", clusterId: CLUSTER_ID }],
			[
				"scaleway_kafka_create_cluster",
				{
					region: "fr-par",
					name: "new-kafka",
					version: "3.7.0",
					nodeType: "kafka-mnq-beta",
					nodeAmount: 1,
					volumeSizeBytes: 50000000000,
					volumeType: "sbs_5k",
				},
			],
			["scaleway_kafka_update_cluster", { region: "fr-par", clusterId: CLUSTER_ID }],
			["scaleway_kafka_delete_cluster", { region: "fr-par", clusterId: CLUSTER_ID }],
			[
				"scaleway_kafka_get_cluster_certificate_authority",
				{ region: "fr-par", clusterId: CLUSTER_ID },
			],
			[
				"scaleway_kafka_renew_cluster_certificate_authority",
				{ region: "fr-par", clusterId: CLUSTER_ID },
			],
			[
				"scaleway_kafka_create_endpoint",
				{ region: "fr-par", clusterId: CLUSTER_ID, privateNetworkId: PN_ID },
			],
			["scaleway_kafka_delete_endpoint", { region: "fr-par", endpointId: ENDPOINT_ID }],
			["scaleway_kafka_list_users", { region: "fr-par", clusterId: CLUSTER_ID }],
			[
				"scaleway_kafka_update_user",
				{ region: "fr-par", clusterId: CLUSTER_ID, username: "admin" },
			],
			["scaleway_kafka_list_node_types", { region: "fr-par" }],
			["scaleway_kafka_list_versions", { region: "fr-par" }],
		];

		for (const [name, params] of invocations) {
			const callback = callbacks.get(name);
			expect(callback, `callback for ${name} should be registered`).toBeDefined();
			await callback?.(params);
		}

		expect(mockFetch).toHaveBeenCalledTimes(invocations.length);
	});
});

describe("kafka handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListClusters", () => {
		it("returns paginated list of clusters", async () => {
			const { handleListClusters } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({
				clusters: [{ id: CLUSTER_ID, name: "my-kafka" }],
				total_count: 1,
			});

			const result = await handleListClusters({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "kafka/v1alpha1/regions/fr-par/clusters",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].name).toBe("my-kafka");
		});

		it("passes optional filters", async () => {
			const { handleListClusters } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ clusters: [], total_count: 0 });

			await handleListClusters({
				region: "fr-par",
				page: 2,
				pageSize: 10,
				projectId: PROJECT_ID,
				organizationId: PROJECT_ID,
				name: "prod",
				tags: ["a", "b"],
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("project_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.get("organization_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.get("name")).toBe("prod");
			expect(callArgs.urlParams.getAll("tags")).toEqual(["a", "b"]);
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListClusters } = await import("../../../src/tools/kafka/handlers.js");
			const err = new Error("Unauthorized");
			(err as unknown as { statusCode: number }).statusCode = 401;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleListClusters({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetCluster", () => {
		it("returns cluster details", async () => {
			const { handleGetCluster } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ id: CLUSTER_ID, name: "my-kafka" });

			const result = await handleGetCluster({ region: "fr-par", clusterId: CLUSTER_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("my-kafka");
		});

		it("returns error on 404", async () => {
			const { handleGetCluster } = await import("../../../src/tools/kafka/handlers.js");
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleGetCluster({
				region: "fr-par",
				clusterId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleCreateCluster", () => {
		it("creates cluster with all optional fields including private-network endpoint", async () => {
			const { handleCreateCluster } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ id: CLUSTER_ID, name: "new-kafka", status: "creating" });

			const result = await handleCreateCluster({
				region: "fr-par",
				name: "new-kafka",
				version: "3.7.0",
				nodeType: "kafka-mnq-beta",
				nodeAmount: 3,
				volumeSizeBytes: 100000000000,
				volumeType: "sbs_5k",
				projectId: PROJECT_ID,
				tags: ["prod"],
				userName: "admin",
				password: "s3cret",
				endpoints: [{ privateNetworkId: PN_ID }, { publicNetwork: true }],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "kafka/v1alpha1/regions/fr-par/clusters",
				body: JSON.stringify({
					name: "new-kafka",
					version: "3.7.0",
					node_type: "kafka-mnq-beta",
					node_amount: 3,
					volume: { size_bytes: 100000000000, type: "sbs_5k" },
					project_id: PROJECT_ID,
					tags: ["prod"],
					user_name: "admin",
					password: "s3cret",
					endpoints: [{ private_network: { private_network_id: PN_ID } }, { public_network: {} }],
				}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("new-kafka");
		});

		it("creates cluster with only required fields", async () => {
			const { handleCreateCluster } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ id: CLUSTER_ID, name: "minimal" });

			await handleCreateCluster({
				region: "fr-par",
				name: "minimal",
				version: "3.7.0",
				nodeType: "kafka-mnq-beta",
				nodeAmount: 1,
				volumeSizeBytes: 50000000000,
				volumeType: "sbs_15k",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "kafka/v1alpha1/regions/fr-par/clusters",
				body: JSON.stringify({
					name: "minimal",
					version: "3.7.0",
					node_type: "kafka-mnq-beta",
					node_amount: 1,
					volume: { size_bytes: 50000000000, type: "sbs_15k" },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateCluster } = await import("../../../src/tools/kafka/handlers.js");
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleCreateCluster({
				region: "fr-par",
				name: "bad",
				version: "3.7.0",
				nodeType: "kafka-mnq-beta",
				nodeAmount: 1,
				volumeSizeBytes: 50000000000,
				volumeType: "sbs_5k",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateCluster", () => {
		it("updates name and tags", async () => {
			const { handleUpdateCluster } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ id: CLUSTER_ID, name: "renamed" });

			const result = await handleUpdateCluster({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				name: "renamed",
				tags: ["x"],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}`,
				body: JSON.stringify({ name: "renamed", tags: ["x"] }),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("renamed");
		});

		it("sends empty body when no fields provided", async () => {
			const { handleUpdateCluster } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ id: CLUSTER_ID });

			await handleUpdateCluster({ region: "fr-par", clusterId: CLUSTER_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateCluster } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockRejectedValue(new Error("Server error"));

			const result: ErrorResult = await handleUpdateCluster({
				region: "fr-par",
				clusterId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});

	describe("handleDeleteCluster", () => {
		it("deletes cluster and returns the returned resource", async () => {
			const { handleDeleteCluster } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ id: CLUSTER_ID, status: "deleting" });

			const result = await handleDeleteCluster({ region: "fr-par", clusterId: CLUSTER_ID });

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.status).toBe("deleting");
		});

		it("returns error on failure", async () => {
			const { handleDeleteCluster } = await import("../../../src/tools/kafka/handlers.js");
			const err = new Error("Forbidden");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleDeleteCluster({
				region: "fr-par",
				clusterId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetClusterCertificateAuthority", () => {
		it("returns the certificate authority", async () => {
			const { handleGetClusterCertificateAuthority } = await import(
				"../../../src/tools/kafka/handlers.js"
			);
			mockFetch.mockResolvedValue({ content: "-----BEGIN CERTIFICATE-----" });

			const result = await handleGetClusterCertificateAuthority({
				region: "fr-par",
				clusterId: CLUSTER_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}/certificate-authority`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.content).toContain("BEGIN CERTIFICATE");
		});

		it("returns error on failure", async () => {
			const { handleGetClusterCertificateAuthority } = await import(
				"../../../src/tools/kafka/handlers.js"
			);
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleGetClusterCertificateAuthority({
				region: "fr-par",
				clusterId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleRenewClusterCertificateAuthority", () => {
		it("renews the certificate authority", async () => {
			const { handleRenewClusterCertificateAuthority } = await import(
				"../../../src/tools/kafka/handlers.js"
			);
			mockFetch.mockResolvedValue({ content: "-----BEGIN CERTIFICATE-----" });

			const result = await handleRenewClusterCertificateAuthority({
				region: "fr-par",
				clusterId: CLUSTER_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}/renew-certificate-authority`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.content).toContain("BEGIN CERTIFICATE");
		});

		it("returns error on failure", async () => {
			const { handleRenewClusterCertificateAuthority } = await import(
				"../../../src/tools/kafka/handlers.js"
			);
			mockFetch.mockRejectedValue(new Error("boom"));

			const result: ErrorResult = await handleRenewClusterCertificateAuthority({
				region: "fr-par",
				clusterId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});

	describe("handleCreateEndpoint", () => {
		it("creates a private-network endpoint", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ id: ENDPOINT_ID });

			const result = await handleCreateEndpoint({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				privateNetworkId: PN_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "kafka/v1alpha1/regions/fr-par/endpoints",
				body: JSON.stringify({
					cluster_id: CLUSTER_ID,
					endpoint: { private_network: { private_network_id: PN_ID } },
				}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe(ENDPOINT_ID);
		});

		it("creates a public-network endpoint when no private network given", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ id: ENDPOINT_ID });

			await handleCreateEndpoint({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				publicNetwork: true,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "kafka/v1alpha1/regions/fr-par/endpoints",
				body: JSON.stringify({
					cluster_id: CLUSTER_ID,
					endpoint: { public_network: {} },
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleCreateEndpoint } = await import("../../../src/tools/kafka/handlers.js");
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleCreateEndpoint({
				region: "fr-par",
				clusterId: CLUSTER_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("handleDeleteEndpoint", () => {
		it("deletes endpoint and returns confirmation", async () => {
			const { handleDeleteEndpoint } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteEndpoint({
				region: "fr-par",
				endpointId: ENDPOINT_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `kafka/v1alpha1/regions/fr-par/endpoints/${ENDPOINT_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(ENDPOINT_ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteEndpoint } = await import("../../../src/tools/kafka/handlers.js");
			const err = new Error("Forbidden");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleDeleteEndpoint({
				region: "fr-par",
				endpointId: ENDPOINT_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleListUsers", () => {
		it("returns paginated users list", async () => {
			const { handleListUsers } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ users: [{ username: "admin" }], total_count: 1 });

			const result = await handleListUsers({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}/users`,
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items[0].username).toBe("admin");
		});

		it("passes optional filters", async () => {
			const { handleListUsers } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ users: [], total_count: 0 });

			await handleListUsers({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				page: 1,
				pageSize: 25,
				name: "adm",
				orderBy: "name_desc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("page_size")).toBe("25");
			expect(callArgs.urlParams.get("name")).toBe("adm");
			expect(callArgs.urlParams.get("order_by")).toBe("name_desc");
		});

		it("returns error on failure", async () => {
			const { handleListUsers } = await import("../../../src/tools/kafka/handlers.js");
			const err = new Error("Rate limited");
			(err as unknown as { statusCode: number }).statusCode = 429;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleListUsers({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});

	describe("handleUpdateUser", () => {
		it("updates user password", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ username: "admin" });

			const result = await handleUpdateUser({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				username: "admin",
				password: "newpass",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}/users/admin`,
				body: JSON.stringify({ password: "newpass" }),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.username).toBe("admin");
		});

		it("sends empty body when no password provided", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ username: "admin" });

			await handleUpdateUser({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				username: "admin",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `kafka/v1alpha1/regions/fr-par/clusters/${CLUSTER_ID}/users/admin`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleUpdateUser } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockRejectedValue(new Error("boom"));

			const result: ErrorResult = await handleUpdateUser({
				region: "fr-par",
				clusterId: CLUSTER_ID,
				username: "admin",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});

	describe("handleListNodeTypes", () => {
		it("returns paginated node types", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({
				node_types: [{ name: "kafka-mnq-beta" }],
				total_count: 1,
			});

			const result = await handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "kafka/v1alpha1/regions/fr-par/node-types",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items[0].name).toBe("kafka-mnq-beta");
		});

		it("passes include_disabled_types filter", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ node_types: [], total_count: 0 });

			await handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
				includeDisabledTypes: true,
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("include_disabled_types")).toBe("true");
		});

		it("returns error on failure", async () => {
			const { handleListNodeTypes } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockRejectedValue(new Error("boom"));

			const result: ErrorResult = await handleListNodeTypes({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});

	describe("handleListVersions", () => {
		it("returns paginated versions", async () => {
			const { handleListVersions } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({
				versions: [{ version: "3.7.0" }],
				total_count: 1,
			});

			const result = await handleListVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "kafka/v1alpha1/regions/fr-par/versions",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items[0].version).toBe("3.7.0");
		});

		it("passes version filter", async () => {
			const { handleListVersions } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockResolvedValue({ versions: [], total_count: 0 });

			await handleListVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
				version: "3.7.0",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("version")).toBe("3.7.0");
		});

		it("returns error on failure", async () => {
			const { handleListVersions } = await import("../../../src/tools/kafka/handlers.js");
			mockFetch.mockRejectedValue(new Error("boom"));

			const result: ErrorResult = await handleListVersions({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});
});
