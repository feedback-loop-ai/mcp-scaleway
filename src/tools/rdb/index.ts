import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleAddAclRules,
	handleCreateBackup,
	handleCreateDatabase,
	handleCreateEndpoint,
	handleCreateInstance,
	handleCreateSnapshot,
	handleCreateUser,
	handleDeleteAclRules,
	handleDeleteDatabase,
	handleDeleteEndpoint,
	handleDeleteInstance,
	handleDeleteUser,
	handleGetInstance,
	handleListAclRules,
	handleListBackups,
	handleListDatabaseEngines,
	handleListDatabases,
	handleListEndpoints,
	handleListInstances,
	handleListNodeTypes,
	handleListSnapshots,
	handleListUsers,
	handleRestoreBackup,
	handleRestoreSnapshot,
	handleUpdateInstance,
	handleUpdateUser,
	handleUpgradeInstance,
} from "./handlers.js";
import {
	AddAclRulesInput,
	CreateBackupInput,
	CreateDatabaseInput,
	CreateEndpointInput,
	CreateInstanceInput,
	CreateSnapshotInput,
	CreateUserInput,
	DeleteAclRulesInput,
	DeleteDatabaseInput,
	DeleteEndpointInput,
	DeleteInstanceInput,
	DeleteUserInput,
	GetInstanceInput,
	ListAclRulesInput,
	ListBackupsInput,
	ListDatabaseEnginesInput,
	ListDatabasesInput,
	ListEndpointsInput,
	ListInstancesInput,
	ListNodeTypesInput,
	ListSnapshotsInput,
	ListUsersInput,
	RestoreBackupInput,
	RestoreSnapshotInput,
	UpdateInstanceInput,
	UpdateUserInput,
	UpgradeInstanceInput,
} from "./types.js";

export function registerRdbTools(server: McpServer): void {
	// P1: Instance CRUD
	server.tool(
		"scaleway_rdb_list_instances",
		"List Managed Database (RDB) instances in a region. Supports pagination, filtering by name/tags/project, and ordering.",
		ListInstancesInput.shape,
		handleListInstances,
	);

	server.tool(
		"scaleway_rdb_get_instance",
		"Get details of a specific Managed Database (RDB) instance by ID, including endpoints, backup schedule, and volume info.",
		GetInstanceInput.shape,
		handleGetInstance,
	);

	server.tool(
		"scaleway_rdb_create_instance",
		"Create a new Managed Database (RDB) instance (PostgreSQL or MySQL). Specify engine, node type, volume, and optional HA configuration.",
		CreateInstanceInput.shape,
		handleCreateInstance,
	);

	server.tool(
		"scaleway_rdb_update_instance",
		"Update a Managed Database (RDB) instance name, tags, or backup schedule settings.",
		UpdateInstanceInput.shape,
		handleUpdateInstance,
	);

	server.tool(
		"scaleway_rdb_delete_instance",
		"Delete a Managed Database (RDB) instance. This permanently removes the instance and all its data.",
		DeleteInstanceInput.shape,
		handleDeleteInstance,
	);

	server.tool(
		"scaleway_rdb_upgrade_instance",
		"Upgrade a Managed Database (RDB) instance node type, volume size, or database engine version.",
		UpgradeInstanceInput.shape,
		handleUpgradeInstance,
	);

	// P1: Database & User management
	server.tool(
		"scaleway_rdb_list_databases",
		"List databases within a Managed Database (RDB) instance. Supports pagination and filtering by name/owner/managed status.",
		ListDatabasesInput.shape,
		handleListDatabases,
	);

	server.tool(
		"scaleway_rdb_create_database",
		"Create a new database within a Managed Database (RDB) instance.",
		CreateDatabaseInput.shape,
		handleCreateDatabase,
	);

	server.tool(
		"scaleway_rdb_delete_database",
		"Delete a database from a Managed Database (RDB) instance.",
		DeleteDatabaseInput.shape,
		handleDeleteDatabase,
	);

	server.tool(
		"scaleway_rdb_list_users",
		"List users of a Managed Database (RDB) instance. Supports pagination and filtering.",
		ListUsersInput.shape,
		handleListUsers,
	);

	server.tool(
		"scaleway_rdb_create_user",
		"Create a new user on a Managed Database (RDB) instance with optional admin privileges.",
		CreateUserInput.shape,
		handleCreateUser,
	);

	server.tool(
		"scaleway_rdb_update_user",
		"Update a user's password or admin status on a Managed Database (RDB) instance.",
		UpdateUserInput.shape,
		handleUpdateUser,
	);

	server.tool(
		"scaleway_rdb_delete_user",
		"Delete a user from a Managed Database (RDB) instance.",
		DeleteUserInput.shape,
		handleDeleteUser,
	);

	// P2: Backup & Restore
	server.tool(
		"scaleway_rdb_list_backups",
		"List database backups for Managed Database (RDB) instances. Supports pagination and filtering.",
		ListBackupsInput.shape,
		handleListBackups,
	);

	server.tool(
		"scaleway_rdb_create_backup",
		"Create a manual backup of a Managed Database (RDB) instance or specific database.",
		CreateBackupInput.shape,
		handleCreateBackup,
	);

	server.tool(
		"scaleway_rdb_restore_backup",
		"Restore a database backup to a Managed Database (RDB) instance.",
		RestoreBackupInput.shape,
		handleRestoreBackup,
	);

	// P2: Endpoints & ACL Rules
	server.tool(
		"scaleway_rdb_list_endpoints",
		"List endpoints of a Managed Database (RDB) instance (public, private network, load balancer).",
		ListEndpointsInput.shape,
		handleListEndpoints,
	);

	server.tool(
		"scaleway_rdb_create_endpoint",
		"Create a new endpoint (private network or load balancer) for a Managed Database (RDB) instance.",
		CreateEndpointInput.shape,
		handleCreateEndpoint,
	);

	server.tool(
		"scaleway_rdb_delete_endpoint",
		"Delete an endpoint from a Managed Database (RDB) instance.",
		DeleteEndpointInput.shape,
		handleDeleteEndpoint,
	);

	server.tool(
		"scaleway_rdb_list_acl_rules",
		"List ACL rules of a Managed Database (RDB) instance. ACL rules control network access.",
		ListAclRulesInput.shape,
		handleListAclRules,
	);

	server.tool(
		"scaleway_rdb_add_acl_rules",
		"Add ACL rules to a Managed Database (RDB) instance to allow network access from specific IPs.",
		AddAclRulesInput.shape,
		handleAddAclRules,
	);

	server.tool(
		"scaleway_rdb_delete_acl_rules",
		"Delete ACL rules from a Managed Database (RDB) instance by IP range.",
		DeleteAclRulesInput.shape,
		handleDeleteAclRules,
	);

	// P3: Snapshots
	server.tool(
		"scaleway_rdb_list_snapshots",
		"List snapshots of Managed Database (RDB) instances. Supports pagination and filtering.",
		ListSnapshotsInput.shape,
		handleListSnapshots,
	);

	server.tool(
		"scaleway_rdb_create_snapshot",
		"Create a snapshot of a Managed Database (RDB) instance for point-in-time recovery.",
		CreateSnapshotInput.shape,
		handleCreateSnapshot,
	);

	server.tool(
		"scaleway_rdb_restore_snapshot",
		"Create a new Managed Database (RDB) instance from a snapshot.",
		RestoreSnapshotInput.shape,
		handleRestoreSnapshot,
	);

	// Reference
	server.tool(
		"scaleway_rdb_list_node_types",
		"List available node types for Managed Database (RDB) instances in a region.",
		ListNodeTypesInput.shape,
		handleListNodeTypes,
	);

	server.tool(
		"scaleway_rdb_list_database_engines",
		"List available database engines (PostgreSQL, MySQL) and their versions for Managed Database (RDB).",
		ListDatabaseEnginesInput.shape,
		handleListDatabaseEngines,
	);
}
