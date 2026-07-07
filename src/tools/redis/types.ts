import { z } from "zod";
import { PaginationParams, ScalewayZone } from "../../shared/types.js";

// === Enums ===

export const RedisClusterStatus = z.enum([
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
]);
export type RedisClusterStatus = z.infer<typeof RedisClusterStatus>;

// === Nested Schemas ===

export const RedisACLRule = z.object({
	id: z.string().describe("ACL rule ID"),
	ip_cidr: z.string().describe("CIDR notation for allowed IP range"),
	description: z.string().describe("Description of the ACL rule"),
});
export type RedisACLRule = z.infer<typeof RedisACLRule>;

export const RedisACLRuleSpec = z.object({
	ip_cidr: z.string().describe("CIDR notation for allowed IP range"),
	description: z.string().describe("Description of the ACL rule"),
});
export type RedisACLRuleSpec = z.infer<typeof RedisACLRuleSpec>;

export const RedisEndpoint = z.object({
	id: z.string().describe("Endpoint ID"),
	ips: z.array(z.string()).describe("List of IPs of the endpoint"),
	port: z.number().describe("TCP port of the endpoint"),
});
export type RedisEndpoint = z.infer<typeof RedisEndpoint>;

export const RedisEndpointSpec = z.object({
	private_network: z
		.object({
			id: z.string().describe("Private network ID"),
			service_ips: z.array(z.string()).describe("List of IPs within the private network"),
		})
		.optional()
		.describe("Private network endpoint specification"),
	public: z
		.object({})
		.optional()
		.describe("Public endpoint specification (empty object to enable)"),
});
export type RedisEndpointSpec = z.infer<typeof RedisEndpointSpec>;

export const RedisClusterSetting = z.object({
	name: z.string().describe("Setting name"),
	value: z.string().describe("Setting value"),
});
export type RedisClusterSetting = z.infer<typeof RedisClusterSetting>;

export const RedisCluster = z.object({
	id: z.string().describe("Cluster ID"),
	name: z.string().describe("Cluster name"),
	version: z.string().describe("Redis version"),
	status: RedisClusterStatus.describe("Current cluster status"),
	zone: z.string().describe("Zone where the cluster is deployed (e.g., fr-par-1)"),
	project_id: z.string().describe("Project ID"),
	node_type: z.string().describe("Node type (e.g., RED1-XS)"),
	cluster_size: z.number().describe("Number of nodes in the cluster"),
	endpoints: z.array(RedisEndpoint).describe("List of cluster endpoints"),
	acl_rules: z.array(RedisACLRule).describe("List of ACL rules"),
	tags: z.array(z.string()).describe("Tags"),
	tls_enabled: z.boolean().describe("Whether TLS is enabled"),
	cluster_settings: z.array(RedisClusterSetting).describe("Cluster settings"),
	created_at: z.string().describe("Creation timestamp"),
	updated_at: z.string().optional().describe("Last update timestamp"),
	user_name: z.string().describe("Default user name"),
});
export type RedisCluster = z.infer<typeof RedisCluster>;

export const RedisNodeType = z.object({
	name: z.string().describe("Node type name (e.g., RED1-XS)"),
	description: z.string().describe("Human-readable description"),
	memory: z.number().describe("Memory in bytes"),
	available_cluster_sizes: z
		.array(z.number())
		.describe("Available cluster sizes for this node type"),
	disabled: z.boolean().describe("Whether this node type is disabled"),
	beta: z.boolean().describe("Whether this node type is in beta"),
});
export type RedisNodeType = z.infer<typeof RedisNodeType>;

export const RedisVersion = z.object({
	version: z.string().describe("Redis version string"),
	available_settings: z
		.array(
			z.object({
				name: z.string().describe("Setting name"),
				default_value: z.string().describe("Default value"),
				type: z.string().describe("Setting type"),
				description: z.string().describe("Setting description"),
			}),
		)
		.describe("Available settings for this version"),
	end_of_life_at: z.string().optional().describe("End of life date"),
	logo_url: z.string().optional().describe("URL to the version logo"),
});
export type RedisVersion = z.infer<typeof RedisVersion>;

export const RedisClusterMetrics = z.object({
	timeseries: z
		.array(
			z.object({
				name: z.string().describe("Metric name"),
				points: z
					.array(
						z.object({
							timestamp: z.string().describe("Point timestamp"),
							value: z.number().describe("Metric value"),
						}),
					)
					.describe("Data points"),
			}),
		)
		.describe("Time series data"),
});
export type RedisClusterMetrics = z.infer<typeof RedisClusterMetrics>;

// === Input Schemas ===

export const ListClustersInput = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list clusters in (e.g., fr-par-1)"),
	project_id: z.string().optional().describe("Filter by project ID"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	name: z.string().optional().describe("Filter by cluster name"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Order results"),
	organization_id: z.string().optional().describe("Filter by organization ID"),
});
export type ListClustersInput = z.infer<typeof ListClustersInput>;

export const GetClusterInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster to retrieve"),
});
export type GetClusterInput = z.infer<typeof GetClusterInput>;

export const CreateClusterInput = z.object({
	zone: ScalewayZone.optional().describe("Zone to create the cluster in (e.g., fr-par-1)"),
	project_id: z.string().describe("Project ID"),
	name: z.string().describe("Cluster name"),
	version: z.string().describe("Redis version"),
	node_type: z.string().describe("Node type (e.g., RED1-XS)"),
	cluster_size: z.number().int().min(1).describe("Number of nodes"),
	user_name: z.string().describe("Default user name"),
	password: z.string().describe("Default user password"),
	tags: z.array(z.string()).optional().describe("Tags"),
	tls_enabled: z.boolean().optional().describe("Enable TLS"),
	cluster_settings: z.array(RedisClusterSetting).optional().describe("Cluster settings"),
	acl_rules: z.array(RedisACLRuleSpec).optional().describe("ACL rules"),
	endpoints: z.array(RedisEndpointSpec).optional().describe("Endpoints"),
});
export type CreateClusterInput = z.infer<typeof CreateClusterInput>;

export const UpdateClusterInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster to update"),
	name: z.string().optional().describe("New cluster name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	user_name: z.string().optional().describe("New user name"),
	password: z.string().optional().describe("New password"),
});
export type UpdateClusterInput = z.infer<typeof UpdateClusterInput>;

export const DeleteClusterInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster to delete"),
});
export type DeleteClusterInput = z.infer<typeof DeleteClusterInput>;

export const GetClusterMetricsInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster"),
	start_at: z.string().optional().describe("Start of the time range (ISO 8601)"),
	end_at: z.string().optional().describe("End of the time range (ISO 8601)"),
	metric_name: z.string().optional().describe("Name of the specific metric to retrieve"),
});
export type GetClusterMetricsInput = z.infer<typeof GetClusterMetricsInput>;

export const GetClusterCertificateInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster"),
});
export type GetClusterCertificateInput = z.infer<typeof GetClusterCertificateInput>;

export const RenewClusterCertificateInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster"),
});
export type RenewClusterCertificateInput = z.infer<typeof RenewClusterCertificateInput>;

export const AddACLRulesInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster"),
	acl_rules: z.array(RedisACLRuleSpec).describe("ACL rules to add"),
});
export type AddACLRulesInput = z.infer<typeof AddACLRulesInput>;

export const DeleteACLRulesInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	acl_id: z.string().describe("ID of the ACL rule to delete"),
});
export type DeleteACLRulesInput = z.infer<typeof DeleteACLRulesInput>;

export const SetACLRulesInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster"),
	acl_rules: z.array(RedisACLRuleSpec).describe("ACL rules to set (replaces all existing)"),
});
export type SetACLRulesInput = z.infer<typeof SetACLRulesInput>;

export const AddEndpointsInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster"),
	endpoints: z.array(RedisEndpointSpec).describe("Endpoints to add"),
});
export type AddEndpointsInput = z.infer<typeof AddEndpointsInput>;

export const DeleteEndpointsInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the endpoint (e.g., fr-par-1)"),
	endpoint_id: z.string().describe("ID of the endpoint to delete"),
});
export type DeleteEndpointsInput = z.infer<typeof DeleteEndpointsInput>;

export const SetEndpointsInput = z.object({
	zone: ScalewayZone.optional().describe("Zone of the cluster (e.g., fr-par-1)"),
	cluster_id: z.string().describe("ID of the cluster"),
	endpoints: z.array(RedisEndpointSpec).describe("Endpoints to set (replaces all existing)"),
});
export type SetEndpointsInput = z.infer<typeof SetEndpointsInput>;

export const ListNodeTypesInput = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list node types in (e.g., fr-par-1)"),
	include_disabled_types: z.boolean().optional().describe("Include disabled node types"),
});
export type ListNodeTypesInput = z.infer<typeof ListNodeTypesInput>;

export const ListClusterVersionsInput = PaginationParams.extend({
	zone: ScalewayZone.optional().describe("Zone to list versions in (e.g., fr-par-1)"),
	include_disabled: z.boolean().optional().describe("Include disabled versions"),
	include_beta: z.boolean().optional().describe("Include beta versions"),
	include_deprecated: z.boolean().optional().describe("Include deprecated versions"),
	version: z.string().optional().describe("Filter by specific version string"),
});
export type ListClusterVersionsInput = z.infer<typeof ListClusterVersionsInput>;
