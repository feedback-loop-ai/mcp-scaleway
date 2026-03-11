import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateDatabase,
	handleDeleteDatabase,
	handleExportDatabaseBackup,
	handleGetDatabase,
	handleGetDatabaseBackup,
	handleListDatabaseBackups,
	handleListDatabases,
	handleRestoreDatabase,
	handleUpdateDatabase,
} from "./handlers.js";
import {
	CreateDatabaseInput,
	DeleteDatabaseInput,
	ExportDatabaseBackupInput,
	GetDatabaseBackupInput,
	GetDatabaseInput,
	ListDatabaseBackupsInput,
	ListDatabasesInput,
	RestoreDatabaseInput,
	UpdateDatabaseInput,
} from "./types.js";

export function registerServerlessSqldbTools(server: McpServer): void {
	server.tool(
		"scaleway_serverless_sqldb_list_databases",
		"List Serverless SQL Databases in a region. Supports filtering by project, name, and pagination.",
		ListDatabasesInput.shape,
		async (params) => handleListDatabases(ListDatabasesInput.parse(params)),
	);

	server.tool(
		"scaleway_serverless_sqldb_get_database",
		"Get details of a specific Serverless SQL Database by ID.",
		GetDatabaseInput.shape,
		async (params) => handleGetDatabase(GetDatabaseInput.parse(params)),
	);

	server.tool(
		"scaleway_serverless_sqldb_create_database",
		"Create a new Serverless SQL Database with auto-scaling CPU limits.",
		CreateDatabaseInput.shape,
		async (params) => handleCreateDatabase(CreateDatabaseInput.parse(params)),
	);

	server.tool(
		"scaleway_serverless_sqldb_update_database",
		"Update CPU scaling limits of a Serverless SQL Database.",
		UpdateDatabaseInput.shape,
		async (params) => handleUpdateDatabase(UpdateDatabaseInput.parse(params)),
	);

	server.tool(
		"scaleway_serverless_sqldb_delete_database",
		"Delete a Serverless SQL Database.",
		DeleteDatabaseInput.shape,
		async (params) => handleDeleteDatabase(DeleteDatabaseInput.parse(params)),
	);

	server.tool(
		"scaleway_serverless_sqldb_list_database_backups",
		"List backups for a Serverless SQL Database. Supports pagination and ordering.",
		ListDatabaseBackupsInput.shape,
		async (params) => handleListDatabaseBackups(ListDatabaseBackupsInput.parse(params)),
	);

	server.tool(
		"scaleway_serverless_sqldb_get_database_backup",
		"Get details of a specific Serverless SQL Database backup.",
		GetDatabaseBackupInput.shape,
		async (params) => handleGetDatabaseBackup(GetDatabaseBackupInput.parse(params)),
	);

	server.tool(
		"scaleway_serverless_sqldb_export_database_backup",
		"Export a Serverless SQL Database backup to get a download URL.",
		ExportDatabaseBackupInput.shape,
		async (params) => handleExportDatabaseBackup(ExportDatabaseBackupInput.parse(params)),
	);

	server.tool(
		"scaleway_serverless_sqldb_restore_database",
		"Restore a Serverless SQL Database from a backup.",
		RestoreDatabaseInput.shape,
		async (params) => handleRestoreDatabase(RestoreDatabaseInput.parse(params)),
	);
}
