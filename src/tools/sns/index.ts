import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleActivateSns,
	handleCreateSnsCredentials,
	handleDeactivateSns,
	handleDeleteSnsCredentials,
	handleGetSnsCredentials,
	handleGetSnsInfo,
	handleListSnsCredentials,
	handleUpdateSnsCredentials,
} from "./handlers.js";
import {
	ActivateSnsSchema,
	CreateSnsCredentialsSchema,
	DeactivateSnsSchema,
	DeleteSnsCredentialsSchema,
	GetSnsCredentialsSchema,
	GetSnsInfoSchema,
	ListSnsCredentialsSchema,
	UpdateSnsCredentialsSchema,
} from "./types.js";

export function registerSnsTools(server: McpServer): void {
	server.tool(
		"scaleway_sns_activate",
		"Activate Scaleway Topics and Events (SNS) for a project. Must be activated before any usage. Does not trigger billing.",
		ActivateSnsSchema.shape,
		handleActivateSns,
	);

	server.tool(
		"scaleway_sns_deactivate",
		"Deactivate Scaleway Topics and Events (SNS) for a project. All topics and credentials must be deleted first.",
		DeactivateSnsSchema.shape,
		handleDeactivateSns,
	);

	server.tool(
		"scaleway_sns_get_info",
		"Get Topics and Events (SNS) info including activation status and endpoint URL for a project.",
		GetSnsInfoSchema.shape,
		handleGetSnsInfo,
	);

	server.tool(
		"scaleway_sns_list_credentials",
		"List Topics and Events (SNS) credentials in a region. Returns metadata only, not secret keys.",
		ListSnsCredentialsSchema.shape,
		handleListSnsCredentials,
	);

	server.tool(
		"scaleway_sns_get_credentials",
		"Get Topics and Events (SNS) credentials by ID. Returns credentials metadata and permissions.",
		GetSnsCredentialsSchema.shape,
		handleGetSnsCredentials,
	);

	server.tool(
		"scaleway_sns_create_credentials",
		"Create Topics and Events (SNS) credentials with granular permissions (publish, receive, manage).",
		CreateSnsCredentialsSchema.shape,
		handleCreateSnsCredentials,
	);

	server.tool(
		"scaleway_sns_update_credentials",
		"Update Topics and Events (SNS) credentials name or permissions.",
		UpdateSnsCredentialsSchema.shape,
		handleUpdateSnsCredentials,
	);

	server.tool(
		"scaleway_sns_delete_credentials",
		"Delete Topics and Events (SNS) credentials. This is irreversible and active connections will be closed.",
		DeleteSnsCredentialsSchema.shape,
		handleDeleteSnsCredentials,
	);
}
