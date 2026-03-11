import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateInstance,
	handleCreateSnapshot,
	handleCreateUser,
	handleDeleteInstance,
	handleDeleteSnapshot,
	handleDeleteUser,
	handleGetInstance,
	handleListInstances,
	handleListNodeTypes,
	handleListSnapshots,
	handleListUsers,
	handleListVersions,
	handleRestoreSnapshot,
	handleUpdateInstance,
	handleUpdateUser,
} from "./handlers.js";
import {
	CreateInstanceParams,
	CreateSnapshotParams,
	CreateUserParams,
	DeleteInstanceParams,
	DeleteSnapshotParams,
	DeleteUserParams,
	GetInstanceParams,
	ListInstancesParams,
	ListNodeTypesParams,
	ListSnapshotsParams,
	ListUsersParams,
	ListVersionsParams,
	RestoreSnapshotParams,
	UpdateInstanceParams,
	UpdateUserParams,
} from "./types.js";

export function registerMongodbTools(server: McpServer): void {
	// --- Instance Tools ---

	server.tool(
		"scaleway_mongodb_list_instances",
		"List MongoDB instances with optional filtering by name, tags, project, and pagination",
		ListInstancesParams.shape,
		async (params) => handleListInstances(params),
	);

	server.tool(
		"scaleway_mongodb_get_instance",
		"Get details of a specific MongoDB instance by ID",
		GetInstanceParams.shape,
		async (params) => handleGetInstance(params),
	);

	server.tool(
		"scaleway_mongodb_create_instance",
		"Create a new MongoDB instance with specified version, node type, and initial admin user",
		CreateInstanceParams.shape,
		async (params) => handleCreateInstance(params),
	);

	server.tool(
		"scaleway_mongodb_update_instance",
		"Update a MongoDB instance name or tags",
		UpdateInstanceParams.shape,
		async (params) => handleUpdateInstance(params),
	);

	server.tool(
		"scaleway_mongodb_delete_instance",
		"Delete a MongoDB instance",
		DeleteInstanceParams.shape,
		async (params) => handleDeleteInstance(params),
	);

	// --- User Tools ---

	server.tool(
		"scaleway_mongodb_list_users",
		"List users of a MongoDB instance with optional filtering and pagination",
		ListUsersParams.shape,
		async (params) => handleListUsers(params),
	);

	server.tool(
		"scaleway_mongodb_create_user",
		"Create a new user on a MongoDB instance",
		CreateUserParams.shape,
		async (params) => handleCreateUser(params),
	);

	server.tool(
		"scaleway_mongodb_update_user",
		"Update a MongoDB instance user password",
		UpdateUserParams.shape,
		async (params) => handleUpdateUser(params),
	);

	server.tool(
		"scaleway_mongodb_delete_user",
		"Delete a user from a MongoDB instance",
		DeleteUserParams.shape,
		async (params) => handleDeleteUser(params),
	);

	// --- Snapshot Tools ---

	server.tool(
		"scaleway_mongodb_list_snapshots",
		"List MongoDB snapshots with optional filtering by instance, name, project, and pagination",
		ListSnapshotsParams.shape,
		async (params) => handleListSnapshots(params),
	);

	server.tool(
		"scaleway_mongodb_create_snapshot",
		"Create a snapshot of a MongoDB instance",
		CreateSnapshotParams.shape,
		async (params) => handleCreateSnapshot(params),
	);

	server.tool(
		"scaleway_mongodb_restore_snapshot",
		"Restore a MongoDB snapshot to a new instance",
		RestoreSnapshotParams.shape,
		async (params) => handleRestoreSnapshot(params),
	);

	server.tool(
		"scaleway_mongodb_delete_snapshot",
		"Delete a MongoDB snapshot",
		DeleteSnapshotParams.shape,
		async (params) => handleDeleteSnapshot(params),
	);

	// --- Node Type & Version Tools ---

	server.tool(
		"scaleway_mongodb_list_node_types",
		"List available MongoDB node types with specs and pricing tiers",
		ListNodeTypesParams.shape,
		async (params) => handleListNodeTypes(params),
	);

	server.tool(
		"scaleway_mongodb_list_versions",
		"List available MongoDB versions",
		ListVersionsParams.shape,
		async (params) => handleListVersions(params),
	);
}
