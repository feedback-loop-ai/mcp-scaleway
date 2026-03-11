import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const RdbInstanceStatus = z.enum([
	"unknown",
	"ready",
	"provisioning",
	"configuring",
	"deleting",
	"error",
	"autohealing",
	"locked",
	"initializing",
	"disk_full",
	"backuping",
	"snapshotting",
]);
export type RdbInstanceStatus = z.infer<typeof RdbInstanceStatus>;

export const RdbBackupStatus = z.enum([
	"unknown",
	"creating",
	"ready",
	"restoring",
	"deleting",
	"error",
	"exporting",
	"locked",
]);
export type RdbBackupStatus = z.infer<typeof RdbBackupStatus>;

export const RdbSnapshotStatus = z.enum([
	"unknown",
	"creating",
	"ready",
	"restoring",
	"deleting",
	"error",
	"locked",
]);
export type RdbSnapshotStatus = z.infer<typeof RdbSnapshotStatus>;

export const RdbAclRuleDirection = z.enum(["inbound", "outbound"]);
export type RdbAclRuleDirection = z.infer<typeof RdbAclRuleDirection>;

export const RdbAclRuleAction = z.enum(["allow", "deny"]);
export type RdbAclRuleAction = z.infer<typeof RdbAclRuleAction>;

export const RdbAclRuleProtocol = z.enum(["tcp", "udp", "icmp"]);
export type RdbAclRuleProtocol = z.infer<typeof RdbAclRuleProtocol>;

// --- Entities ---

export const RdbEndpoint = z.object({
	id: z.string().describe("Endpoint UUID"),
	ip: z.string().optional().describe("IPv4 address"),
	port: z.number().int().describe("TCP port"),
	name: z.string().optional().describe("Endpoint name"),
});
export type RdbEndpoint = z.infer<typeof RdbEndpoint>;

export const RdbVolume = z.object({
	type: z.string().describe("Volume type (lssd, bssd)"),
	size: z.number().int().describe("Volume size in bytes"),
});
export type RdbVolume = z.infer<typeof RdbVolume>;

export const RdbBackupSchedule = z.object({
	frequency: z.number().int().describe("Backup frequency in hours"),
	retention: z.number().int().describe("Backup retention in days"),
	disabled: z.boolean().describe("Whether automatic backups are disabled"),
});
export type RdbBackupSchedule = z.infer<typeof RdbBackupSchedule>;

export const RdbInstance = z.object({
	id: z.string().describe("Instance UUID"),
	name: z.string().describe("Instance name"),
	engine: z.string().describe("Database engine (e.g. PostgreSQL-15, MySQL-8)"),
	node_type: z.string().describe("Commercial node type (e.g. db-dev-s)"),
	status: RdbInstanceStatus.describe("Instance status"),
	region: z.string().describe("Region (e.g. fr-par)"),
	project_id: z.string().describe("Project ID"),
	is_ha_cluster: z.boolean().describe("Whether high availability is enabled"),
	volume: RdbVolume.optional().describe("Volume configuration"),
	endpoints: z.array(RdbEndpoint).optional().describe("Instance endpoints"),
	backup_schedule: RdbBackupSchedule.optional().describe("Backup schedule configuration"),
	tags: z.array(z.string()).optional().describe("Instance tags"),
	created_at: z.string().optional().describe("Creation timestamp"),
});
export type RdbInstance = z.infer<typeof RdbInstance>;

export const RdbDatabase = z.object({
	name: z.string().describe("Database name"),
	owner: z.string().describe("Database owner username"),
	managed: z.boolean().describe("Whether database is managed by Scaleway"),
	size: z.number().int().describe("Database size in bytes"),
});
export type RdbDatabase = z.infer<typeof RdbDatabase>;

export const RdbUser = z.object({
	name: z.string().describe("Username"),
	is_admin: z.boolean().describe("Whether user has admin privileges"),
});
export type RdbUser = z.infer<typeof RdbUser>;

export const RdbBackup = z.object({
	id: z.string().describe("Backup UUID"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Backup name"),
	status: RdbBackupStatus.describe("Backup status"),
	size: z.number().int().optional().describe("Backup size in bytes"),
	created_at: z.string().optional().describe("Creation timestamp"),
	expires_at: z.string().optional().describe("Expiration timestamp"),
	database_name: z.string().optional().describe("Database name"),
	instance_name: z.string().optional().describe("Instance name"),
	region: z.string().optional().describe("Region"),
});
export type RdbBackup = z.infer<typeof RdbBackup>;

export const RdbAclRule = z.object({
	ip: z.string().describe("IP range in CIDR notation"),
	port: z.number().int().optional().describe("Port number"),
	protocol: RdbAclRuleProtocol.optional().describe("Protocol"),
	direction: RdbAclRuleDirection.describe("Direction"),
	action: RdbAclRuleAction.describe("Action"),
	description: z.string().optional().describe("Rule description"),
});
export type RdbAclRule = z.infer<typeof RdbAclRule>;

export const RdbSnapshot = z.object({
	id: z.string().describe("Snapshot UUID"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Snapshot name"),
	status: RdbSnapshotStatus.describe("Snapshot status"),
	size: z.number().int().optional().describe("Snapshot size in bytes"),
	created_at: z.string().optional().describe("Creation timestamp"),
	instance_name: z.string().optional().describe("Instance name"),
	node_type: z.string().optional().describe("Node type"),
	region: z.string().optional().describe("Region"),
	expires_at: z.string().optional().describe("Expiration timestamp"),
});
export type RdbSnapshot = z.infer<typeof RdbSnapshot>;

export const RdbNodeType = z.object({
	name: z.string().describe("Node type name"),
	stock_status: z.string().describe("Stock status"),
	description: z.string().optional().describe("Node type description"),
	vcpus: z.number().int().optional().describe("Number of vCPUs"),
	memory: z.number().int().optional().describe("Memory in bytes"),
	disabled: z.boolean().optional().describe("Whether node type is disabled"),
	region: z.string().optional().describe("Region"),
});
export type RdbNodeType = z.infer<typeof RdbNodeType>;

export const RdbDatabaseEngine = z.object({
	name: z.string().describe("Engine name"),
	default_version: z.string().describe("Default version"),
	versions: z
		.array(
			z.object({
				version: z.string().describe("Engine version string"),
				name: z.string().describe("Version display name"),
				end_of_life: z.string().optional().describe("End of life date"),
				available_settings: z
					.array(
						z.object({
							name: z.string(),
							default_value: z.string().optional(),
							type: z.string().optional(),
						}),
					)
					.optional()
					.describe("Available settings"),
			}),
		)
		.describe("Available versions"),
});
export type RdbDatabaseEngine = z.infer<typeof RdbDatabaseEngine>;

// --- Input schemas ---

// Instance tools
export const ListInstancesInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region to list instances in"),
	project_id: z.string().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by instance name"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Order results by"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
});
export type ListInstancesInput = z.infer<typeof ListInstancesInput>;

export const GetInstanceInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
});
export type GetInstanceInput = z.infer<typeof GetInstanceInput>;

export const CreateInstanceInput = z.object({
	region: ScalewayRegion.optional().describe("Region for the instance"),
	project_id: z.string().optional().describe("Project ID"),
	name: z.string().describe("Instance name"),
	engine: z.string().describe("Database engine (e.g. PostgreSQL-15, MySQL-8)"),
	node_type: z.string().describe("Node type (e.g. db-dev-s, db-play2-pico)"),
	is_ha_cluster: z.boolean().optional().describe("Enable high availability"),
	disable_backup: z.boolean().optional().describe("Disable automatic backups"),
	volume_type: z.enum(["lssd", "bssd"]).optional().describe("Volume type"),
	volume_size: z.number().int().optional().describe("Volume size in bytes"),
	user_name: z.string().optional().describe("Initial admin username"),
	password: z.string().optional().describe("Initial admin password"),
	tags: z.array(z.string()).optional().describe("Tags"),
	backup_same_region: z.boolean().optional().describe("Store backups in the same region"),
	init_endpoints: z
		.array(
			z.object({
				private_network: z
					.object({
						private_network_id: z.string(),
						service_ip: z.string().optional(),
					})
					.optional(),
			}),
		)
		.optional()
		.describe("Initial endpoints configuration"),
});
export type CreateInstanceInput = z.infer<typeof CreateInstanceInput>;

export const UpdateInstanceInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().optional().describe("New name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	backup_schedule_frequency: z.number().int().optional().describe("Backup frequency in hours"),
	backup_schedule_retention: z.number().int().optional().describe("Backup retention in days"),
	is_backup_schedule_disabled: z.boolean().optional().describe("Disable automatic backups"),
	backup_same_region: z.boolean().optional().describe("Store backups in same region"),
});
export type UpdateInstanceInput = z.infer<typeof UpdateInstanceInput>;

export const DeleteInstanceInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
});
export type DeleteInstanceInput = z.infer<typeof DeleteInstanceInput>;

export const UpgradeInstanceInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	node_type: z.string().optional().describe("New node type to upgrade to"),
	enable_ha: z.boolean().optional().describe("Enable high availability"),
	volume_size: z.number().int().optional().describe("New volume size in bytes"),
	volume_type: z.enum(["lssd", "bssd"]).optional().describe("New volume type"),
	upgradable_version_id: z.string().optional().describe("Target engine version UUID"),
	major_upgrade_workflow: z
		.object({
			upgradable_version_id: z.string(),
			with_endpoints: z.boolean().optional(),
		})
		.optional()
		.describe("Major upgrade workflow config"),
});
export type UpgradeInstanceInput = z.infer<typeof UpgradeInstanceInput>;

// Database tools
export const ListDatabasesInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().optional().describe("Filter by database name"),
	managed: z.boolean().optional().describe("Filter by managed status"),
	owner: z.string().optional().describe("Filter by owner"),
	order_by: z
		.enum(["name_asc", "name_desc", "size_asc", "size_desc"])
		.optional()
		.describe("Order by"),
});
export type ListDatabasesInput = z.infer<typeof ListDatabasesInput>;

export const CreateDatabaseInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Database name"),
});
export type CreateDatabaseInput = z.infer<typeof CreateDatabaseInput>;

export const DeleteDatabaseInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Database name"),
});
export type DeleteDatabaseInput = z.infer<typeof DeleteDatabaseInput>;

// User tools
export const ListUsersInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().optional().describe("Filter by username"),
	order_by: z
		.enum(["name_asc", "name_desc", "is_admin_asc", "is_admin_desc"])
		.optional()
		.describe("Order by"),
});
export type ListUsersInput = z.infer<typeof ListUsersInput>;

export const CreateUserInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Username"),
	password: z.string().describe("User password"),
	is_admin: z.boolean().optional().describe("Grant admin privileges"),
});
export type CreateUserInput = z.infer<typeof CreateUserInput>;

export const UpdateUserInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Username"),
	password: z.string().optional().describe("New password"),
	is_admin: z.boolean().optional().describe("Update admin status"),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInput>;

export const DeleteUserInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Username to delete"),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInput>;

// Backup tools
export const ListBackupsInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region to list backups in"),
	instance_id: z.string().optional().describe("Filter by instance UUID"),
	name: z.string().optional().describe("Filter by backup name"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Order by"),
	project_id: z.string().optional().describe("Filter by project ID"),
});
export type ListBackupsInput = z.infer<typeof ListBackupsInput>;

export const CreateBackupInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Backup name"),
	database_name: z.string().optional().describe("Database name to backup"),
	expires_at: z.string().optional().describe("Expiration date (RFC 3339)"),
});
export type CreateBackupInput = z.infer<typeof CreateBackupInput>;

export const RestoreBackupInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the backup"),
	backup_id: z.string().describe("Backup UUID"),
	instance_id: z.string().describe("Target instance UUID to restore to"),
	database_name: z.string().optional().describe("Target database name"),
});
export type RestoreBackupInput = z.infer<typeof RestoreBackupInput>;

// Endpoint tools
export const ListEndpointsInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
});
export type ListEndpointsInput = z.infer<typeof ListEndpointsInput>;

export const CreateEndpointInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	endpoint_spec: z
		.object({
			private_network: z
				.object({
					private_network_id: z.string().describe("Private network UUID"),
					service_ip: z.string().optional().describe("Service IP in CIDR notation"),
				})
				.optional()
				.describe("Private network endpoint spec"),
			load_balancer: z.boolean().optional().describe("Load balancer endpoint"),
		})
		.describe("Endpoint specification"),
});
export type CreateEndpointInput = z.infer<typeof CreateEndpointInput>;

export const DeleteEndpointInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the endpoint"),
	endpoint_id: z.string().describe("Endpoint UUID"),
});
export type DeleteEndpointInput = z.infer<typeof DeleteEndpointInput>;

// ACL tools
export const ListAclRulesInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
});
export type ListAclRulesInput = z.infer<typeof ListAclRulesInput>;

export const AddAclRulesInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	rules: z
		.array(
			z.object({
				ip: z.string().describe("IP range in CIDR notation"),
				description: z.string().optional().describe("Rule description"),
			}),
		)
		.describe("ACL rules to add"),
});
export type AddAclRulesInput = z.infer<typeof AddAclRulesInput>;

export const DeleteAclRulesInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	acl_rule_ips: z.array(z.string()).describe("IP ranges to remove from ACL"),
});
export type DeleteAclRulesInput = z.infer<typeof DeleteAclRulesInput>;

// Snapshot tools
export const ListSnapshotsInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region to list snapshots in"),
	instance_id: z.string().optional().describe("Filter by instance UUID"),
	name: z.string().optional().describe("Filter by snapshot name"),
	order_by: z
		.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
		.optional()
		.describe("Order by"),
	project_id: z.string().optional().describe("Filter by project ID"),
});
export type ListSnapshotsInput = z.infer<typeof ListSnapshotsInput>;

export const CreateSnapshotInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the instance"),
	instance_id: z.string().describe("Instance UUID"),
	name: z.string().describe("Snapshot name"),
	expires_at: z.string().optional().describe("Expiration date (RFC 3339)"),
});
export type CreateSnapshotInput = z.infer<typeof CreateSnapshotInput>;

export const RestoreSnapshotInput = z.object({
	region: ScalewayRegion.optional().describe("Region of the snapshot"),
	snapshot_id: z.string().describe("Snapshot UUID"),
	instance_name: z.string().describe("Name for the new restored instance"),
	node_type: z.string().optional().describe("Node type for restored instance"),
	is_ha_cluster: z.boolean().optional().describe("Enable HA on restored instance"),
});
export type RestoreSnapshotInput = z.infer<typeof RestoreSnapshotInput>;

// Reference tools
export const ListNodeTypesInput = z.object({
	region: ScalewayRegion.optional().describe("Region to list node types for"),
	include_disabled_types: z.boolean().optional().describe("Include disabled node types"),
});
export type ListNodeTypesInput = z.infer<typeof ListNodeTypesInput>;

export const ListDatabaseEnginesInput = z.object({
	region: ScalewayRegion.optional().describe("Region to list engines for"),
	name: z.string().optional().describe("Filter by engine name"),
	version: z.string().optional().describe("Filter by version"),
});
export type ListDatabaseEnginesInput = z.infer<typeof ListDatabaseEnginesInput>;
