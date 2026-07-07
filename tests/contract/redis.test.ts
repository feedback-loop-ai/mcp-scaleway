/**
 * Contract tests for Scaleway Redis API
 * Validates request/response shapes, pagination, auth, and error codes
 *
 * API Reference: Scaleway Redis v1 (zonal)
 * Spec: specs/scaleway-api/ (redis)
 * Parity: tests/parity-matrix.json#redis
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	AddACLRulesInput,
	AddEndpointsInput,
	CreateClusterInput,
	DeleteACLRulesInput,
	DeleteClusterInput,
	DeleteEndpointsInput,
	GetClusterCertificateInput,
	GetClusterInput,
	GetClusterMetricsInput,
	ListClusterVersionsInput,
	ListClustersInput,
	ListNodeTypesInput,
	RedisACLRule,
	RedisACLRuleSpec,
	RedisCluster,
	RedisClusterMetrics,
	RedisClusterSetting,
	RedisClusterStatus,
	RedisEndpoint,
	RedisEndpointSpec,
	RedisNodeType,
	RedisVersion,
	RenewClusterCertificateInput,
	SetACLRulesInput,
	SetEndpointsInput,
	UpdateClusterInput,
} from "../../src/tools/redis/types.js";

describe("Redis contract: entity schemas", () => {
	// Spec: GET /redis/v1/zones/{zone}/clusters/{cluster_id}
	describe("RedisCluster", () => {
		it("validates a complete cluster response", () => {
			const cluster = {
				id: "550e8400-e29b-41d4-a716-446655440000",
				name: "my-redis",
				version: "7.0.12",
				status: "ready",
				zone: "fr-par-1",
				project_id: "550e8400-e29b-41d4-a716-446655440001",
				node_type: "RED1-XS",
				cluster_size: 1,
				endpoints: [{ id: "ep-1", ips: ["10.0.0.1"], port: 6379 }],
				acl_rules: [{ id: "acl-1", ip_cidr: "0.0.0.0/0", description: "Allow all" }],
				tags: ["env:prod"],
				tls_enabled: true,
				cluster_settings: [{ name: "maxmemory-policy", value: "allkeys-lru" }],
				created_at: "2024-01-01T00:00:00.000Z",
				user_name: "admin",
			};

			expect(RedisCluster.parse(cluster)).toEqual(cluster);
		});

		it("accepts optional updated_at", () => {
			const cluster = {
				id: "id",
				name: "name",
				version: "7.0",
				status: "ready",
				zone: "fr-par-1",
				project_id: "proj",
				node_type: "RED1-XS",
				cluster_size: 1,
				endpoints: [],
				acl_rules: [],
				tags: [],
				tls_enabled: false,
				cluster_settings: [],
				created_at: "2024-01-01T00:00:00Z",
				updated_at: "2024-01-02T00:00:00Z",
				user_name: "admin",
			};

			const result = RedisCluster.parse(cluster);
			expect(result.updated_at).toBe("2024-01-02T00:00:00Z");
		});

		it("rejects missing required fields", () => {
			expect(() => RedisCluster.parse({})).toThrow();
			expect(() => RedisCluster.parse({ id: "x" })).toThrow();
		});
	});

	describe("RedisClusterStatus", () => {
		it("accepts all valid statuses", () => {
			const statuses = [
				"unknown",
				"ready",
				"provisioning",
				"configuring",
				"deleting",
				"error",
				"autohealing",
				"locked",
				"suspended",
				"initializing",
			];
			for (const status of statuses) {
				expect(RedisClusterStatus.parse(status)).toBe(status);
			}
		});

		it("rejects invalid status", () => {
			expect(() => RedisClusterStatus.parse("invalid")).toThrow();
		});
	});

	describe("RedisACLRule / RedisACLRuleSpec", () => {
		it("validates ACL rule response shape", () => {
			const rule = { id: "acl-1", ip_cidr: "10.0.0.0/8", description: "internal" };
			expect(RedisACLRule.parse(rule)).toEqual(rule);
		});

		it("validates ACL rule spec (input)", () => {
			const spec = { ip_cidr: "0.0.0.0/0", description: "all" };
			expect(RedisACLRuleSpec.parse(spec)).toEqual(spec);
		});
	});

	describe("RedisEndpoint / RedisEndpointSpec", () => {
		it("validates endpoint response shape", () => {
			const endpoint = { id: "ep-1", ips: ["10.0.0.1", "10.0.0.2"], port: 6379 };
			expect(RedisEndpoint.parse(endpoint)).toEqual(endpoint);
		});

		it("validates public endpoint spec", () => {
			const spec = { public: {} };
			expect(RedisEndpointSpec.parse(spec)).toEqual(spec);
		});

		it("validates private network endpoint spec", () => {
			const spec = {
				private_network: { id: "pn-123", service_ips: ["10.0.0.1"] },
			};
			expect(RedisEndpointSpec.parse(spec)).toEqual(spec);
		});

		it("validates empty endpoint spec", () => {
			expect(RedisEndpointSpec.parse({})).toEqual({});
		});
	});

	describe("RedisClusterSetting", () => {
		it("validates setting shape", () => {
			const setting = { name: "maxmemory-policy", value: "allkeys-lru" };
			expect(RedisClusterSetting.parse(setting)).toEqual(setting);
		});
	});

	describe("RedisNodeType", () => {
		it("validates node type response shape", () => {
			const nodeType = {
				name: "RED1-XS",
				description: "Extra Small Redis Instance",
				memory: 1073741824,
				available_cluster_sizes: [1, 3, 5],
				disabled: false,
				beta: false,
			};
			expect(RedisNodeType.parse(nodeType)).toEqual(nodeType);
		});
	});

	describe("RedisVersion", () => {
		it("validates version response shape", () => {
			const version = {
				version: "7.0.12",
				available_settings: [
					{
						name: "maxmemory-policy",
						default_value: "noeviction",
						type: "string",
						description: "Memory eviction policy",
					},
				],
			};
			expect(RedisVersion.parse(version)).toEqual(version);
		});

		it("accepts optional end_of_life_at and logo_url", () => {
			const version = {
				version: "6.0",
				available_settings: [],
				end_of_life_at: "2025-01-01",
				logo_url: "https://example.com/redis.png",
			};
			const result = RedisVersion.parse(version);
			expect(result.end_of_life_at).toBe("2025-01-01");
			expect(result.logo_url).toBe("https://example.com/redis.png");
		});
	});

	describe("RedisClusterMetrics", () => {
		it("validates metrics response shape", () => {
			const metrics = {
				timeseries: [
					{
						name: "cpu_usage_percent",
						points: [
							{ timestamp: "2024-01-01T00:00:00Z", value: 42.5 },
							{ timestamp: "2024-01-01T00:01:00Z", value: 45.2 },
						],
					},
				],
			};
			expect(RedisClusterMetrics.parse(metrics)).toEqual(metrics);
		});
	});
});

describe("Redis contract: input schemas", () => {
	// Spec: GET /redis/v1/zones/{zone}/clusters
	describe("ListClustersInput", () => {
		it("validates with defaults", () => {
			const result = ListClustersInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates with all parameters", () => {
			const input = {
				page: 2,
				pageSize: 25,
				zone: "fr-par-1",
				project_id: "proj-123",
				tags: ["env:prod"],
				name: "my-redis",
				order_by: "name_asc",
				organization_id: "org-456",
			};
			expect(ListClustersInput.parse(input)).toEqual(input);
		});

		it("validates order_by enum values", () => {
			for (const order of ["created_at_asc", "created_at_desc", "name_asc", "name_desc"]) {
				expect(ListClustersInput.parse({ order_by: order }).order_by).toBe(order);
			}
		});

		it("rejects invalid order_by", () => {
			expect(() => ListClustersInput.parse({ order_by: "invalid" })).toThrow();
		});

		it("rejects invalid zone format", () => {
			expect(() => ListClustersInput.parse({ zone: "invalid" })).toThrow();
		});

		it("rejects page < 1", () => {
			expect(() => ListClustersInput.parse({ page: 0 })).toThrow();
		});

		it("rejects pageSize > 100", () => {
			expect(() => ListClustersInput.parse({ pageSize: 101 })).toThrow();
		});
	});

	// Spec: GET /redis/v1/zones/{zone}/clusters/{cluster_id}
	describe("GetClusterInput", () => {
		it("validates with cluster_id only", () => {
			const result = GetClusterInput.parse({ cluster_id: "id-123" });
			expect(result.cluster_id).toBe("id-123");
			expect(result.zone).toBeUndefined();
		});

		it("validates with zone", () => {
			const result = GetClusterInput.parse({ cluster_id: "id-123", zone: "nl-ams-1" });
			expect(result.zone).toBe("nl-ams-1");
		});

		it("rejects missing cluster_id", () => {
			expect(() => GetClusterInput.parse({})).toThrow();
		});
	});

	// Spec: POST /redis/v1/zones/{zone}/clusters
	describe("CreateClusterInput", () => {
		it("validates minimal create input", () => {
			const input = {
				project_id: "proj-123",
				name: "my-redis",
				version: "7.0",
				node_type: "RED1-XS",
				cluster_size: 1,
				user_name: "admin",
				password: "secret123",
			};
			expect(CreateClusterInput.parse(input)).toEqual(input);
		});

		it("validates with all optional fields", () => {
			const input = {
				zone: "fr-par-1",
				project_id: "proj-123",
				name: "my-redis",
				version: "7.0",
				node_type: "RED1-XS",
				cluster_size: 3,
				user_name: "admin",
				password: "secret123",
				tags: ["env:prod"],
				tls_enabled: true,
				cluster_settings: [{ name: "maxmemory-policy", value: "allkeys-lru" }],
				acl_rules: [{ ip_cidr: "0.0.0.0/0", description: "all" }],
				endpoints: [{ public: {} }],
			};
			expect(CreateClusterInput.parse(input)).toEqual(input);
		});

		it("rejects cluster_size < 1", () => {
			expect(() =>
				CreateClusterInput.parse({
					project_id: "p",
					name: "n",
					version: "7.0",
					node_type: "RED1-XS",
					cluster_size: 0,
					user_name: "admin",
					password: "p",
				}),
			).toThrow();
		});

		it("rejects missing required fields", () => {
			expect(() => CreateClusterInput.parse({})).toThrow();
			expect(() => CreateClusterInput.parse({ project_id: "p" })).toThrow();
		});
	});

	// Spec: PATCH /redis/v1/zones/{zone}/clusters/{cluster_id}
	describe("UpdateClusterInput", () => {
		it("validates with cluster_id only", () => {
			const result = UpdateClusterInput.parse({ cluster_id: "id-123" });
			expect(result.cluster_id).toBe("id-123");
		});

		it("validates with all optional fields", () => {
			const input = {
				cluster_id: "id-123",
				zone: "fr-par-1",
				name: "new-name",
				tags: ["tag1"],
				user_name: "newuser",
				password: "newpass",
			};
			expect(UpdateClusterInput.parse(input)).toEqual(input);
		});

		it("rejects missing cluster_id", () => {
			expect(() => UpdateClusterInput.parse({})).toThrow();
		});
	});

	// Spec: DELETE /redis/v1/zones/{zone}/clusters/{cluster_id}
	describe("DeleteClusterInput", () => {
		it("validates with cluster_id", () => {
			const result = DeleteClusterInput.parse({ cluster_id: "id-123" });
			expect(result.cluster_id).toBe("id-123");
		});

		it("rejects missing cluster_id", () => {
			expect(() => DeleteClusterInput.parse({})).toThrow();
		});
	});

	// Spec: GET /redis/v1/zones/{zone}/clusters/{cluster_id}/metrics
	describe("GetClusterMetricsInput", () => {
		it("validates with cluster_id only", () => {
			const result = GetClusterMetricsInput.parse({ cluster_id: "id-123" });
			expect(result.cluster_id).toBe("id-123");
		});

		it("validates with all optional fields", () => {
			const input = {
				cluster_id: "id-123",
				zone: "fr-par-1",
				start_at: "2024-01-01T00:00:00Z",
				end_at: "2024-01-02T00:00:00Z",
				metric_name: "cpu_usage",
			};
			expect(GetClusterMetricsInput.parse(input)).toEqual(input);
		});
	});

	// Spec: GET /redis/v1/zones/{zone}/clusters/{cluster_id}/certificate
	describe("GetClusterCertificateInput", () => {
		it("validates with cluster_id", () => {
			const result = GetClusterCertificateInput.parse({ cluster_id: "id-123" });
			expect(result.cluster_id).toBe("id-123");
		});
	});

	// Spec: POST /redis/v1/zones/{zone}/clusters/{cluster_id}/renew-certificate
	describe("RenewClusterCertificateInput", () => {
		it("validates with cluster_id", () => {
			const result = RenewClusterCertificateInput.parse({ cluster_id: "id-123" });
			expect(result.cluster_id).toBe("id-123");
		});
	});

	// Spec: POST /redis/v1/zones/{zone}/clusters/{cluster_id}/acls
	describe("AddACLRulesInput", () => {
		it("validates add ACL rules input", () => {
			const input = {
				cluster_id: "id-123",
				acl_rules: [{ ip_cidr: "10.0.0.0/8", description: "internal" }],
			};
			expect(AddACLRulesInput.parse(input)).toEqual(input);
		});

		it("rejects missing acl_rules", () => {
			expect(() => AddACLRulesInput.parse({ cluster_id: "id" })).toThrow();
		});
	});

	// Spec: DELETE /redis/v1/zones/{zone}/acls/{acl_id}
	describe("DeleteACLRulesInput", () => {
		it("validates delete ACL rule input", () => {
			const input = {
				acl_id: "acl-1",
			};
			expect(DeleteACLRulesInput.parse(input)).toEqual(input);
		});

		it("validates with zone", () => {
			const input = { acl_id: "acl-1", zone: "nl-ams-1" };
			expect(DeleteACLRulesInput.parse(input)).toEqual(input);
		});

		it("rejects missing acl_id", () => {
			expect(() => DeleteACLRulesInput.parse({})).toThrow();
		});
	});

	// Spec: PUT /redis/v1/zones/{zone}/clusters/{cluster_id}/acls
	describe("SetACLRulesInput", () => {
		it("validates set ACL rules input", () => {
			const input = {
				cluster_id: "id-123",
				acl_rules: [{ ip_cidr: "0.0.0.0/0", description: "all" }],
			};
			expect(SetACLRulesInput.parse(input)).toEqual(input);
		});
	});

	// Spec: POST /redis/v1/zones/{zone}/clusters/{cluster_id}/endpoints
	describe("AddEndpointsInput", () => {
		it("validates add endpoints input", () => {
			const input = {
				cluster_id: "id-123",
				endpoints: [{ public: {} }],
			};
			expect(AddEndpointsInput.parse(input)).toEqual(input);
		});
	});

	// Spec: DELETE /redis/v1/zones/{zone}/endpoints/{endpoint_id}
	describe("DeleteEndpointsInput", () => {
		it("validates delete endpoint input", () => {
			const input = {
				endpoint_id: "ep-1",
			};
			expect(DeleteEndpointsInput.parse(input)).toEqual(input);
		});

		it("validates with zone", () => {
			const input = { endpoint_id: "ep-1", zone: "nl-ams-1" };
			expect(DeleteEndpointsInput.parse(input)).toEqual(input);
		});

		it("rejects missing endpoint_id", () => {
			expect(() => DeleteEndpointsInput.parse({})).toThrow();
		});
	});

	// Spec: PUT /redis/v1/zones/{zone}/clusters/{cluster_id}/endpoints
	describe("SetEndpointsInput", () => {
		it("validates set endpoints input", () => {
			const input = {
				cluster_id: "id-123",
				endpoints: [{ private_network: { id: "pn-123", service_ips: ["10.0.0.1"] } }],
			};
			expect(SetEndpointsInput.parse(input)).toEqual(input);
		});
	});

	// Spec: GET /redis/v1/zones/{zone}/node-types
	describe("ListNodeTypesInput", () => {
		it("validates with defaults", () => {
			const result = ListNodeTypesInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates with all parameters", () => {
			const input = {
				page: 1,
				pageSize: 25,
				zone: "fr-par-1",
				include_disabled_types: true,
			};
			expect(ListNodeTypesInput.parse(input)).toEqual(input);
		});
	});

	// Spec: GET /redis/v1/zones/{zone}/cluster-versions
	describe("ListClusterVersionsInput", () => {
		it("validates with defaults", () => {
			const result = ListClusterVersionsInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates with all parameters", () => {
			const input = {
				page: 1,
				pageSize: 25,
				zone: "fr-par-1",
				include_disabled: true,
				include_beta: false,
				include_deprecated: false,
				version: "7.0",
			};
			expect(ListClusterVersionsInput.parse(input)).toEqual(input);
		});
	});
});

describe("Redis contract: pagination", () => {
	it("ListClustersInput enforces page >= 1", () => {
		expect(() => ListClustersInput.parse({ page: 0 })).toThrow();
		expect(ListClustersInput.parse({ page: 1 }).page).toBe(1);
	});

	it("ListClustersInput enforces pageSize 1-100", () => {
		expect(() => ListClustersInput.parse({ pageSize: 0 })).toThrow();
		expect(() => ListClustersInput.parse({ pageSize: 101 })).toThrow();
		expect(ListClustersInput.parse({ pageSize: 100 }).pageSize).toBe(100);
	});

	it("ListNodeTypesInput enforces pagination", () => {
		expect(() => ListNodeTypesInput.parse({ page: -1 })).toThrow();
		expect(ListNodeTypesInput.parse({ pageSize: 1 }).pageSize).toBe(1);
	});

	it("ListClusterVersionsInput enforces pagination", () => {
		expect(() => ListClusterVersionsInput.parse({ page: 0 })).toThrow();
	});
});

describe("Redis contract: auth", () => {
	it("zone field validates Scaleway zone format", () => {
		// Valid zones
		expect(GetClusterInput.parse({ cluster_id: "id", zone: "fr-par-1" }).zone).toBe("fr-par-1");
		expect(GetClusterInput.parse({ cluster_id: "id", zone: "nl-ams-1" }).zone).toBe("nl-ams-1");
		expect(GetClusterInput.parse({ cluster_id: "id", zone: "pl-waw-1" }).zone).toBe("pl-waw-1");

		// Invalid zones (region format without a zone number is rejected)
		expect(() => GetClusterInput.parse({ cluster_id: "id", zone: "invalid" })).toThrow();
		expect(() => GetClusterInput.parse({ cluster_id: "id", zone: "fr-par" })).toThrow();
	});
});

describe("Redis contract: error codes", () => {
	it("input validation produces ZodError for invalid inputs", () => {
		// Missing required field
		expect(() => GetClusterInput.parse({})).toThrow(z.ZodError);

		// Wrong type
		expect(() =>
			CreateClusterInput.parse({
				project_id: 123,
				name: "n",
				version: "7.0",
				node_type: "RED1-XS",
				cluster_size: 1,
				user_name: "admin",
				password: "p",
			}),
		).toThrow(z.ZodError);

		// Invalid enum
		expect(() => ListClustersInput.parse({ order_by: "not_valid" })).toThrow(z.ZodError);
	});
});
