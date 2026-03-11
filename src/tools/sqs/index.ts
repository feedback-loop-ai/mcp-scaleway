import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleActivateSqs,
	handleCreateSqsCredentials,
	handleDeactivateSqs,
	handleDeleteSqsCredentials,
	handleGetSqsCredentials,
	handleGetSqsInfo,
	handleListSqsCredentials,
	handleUpdateSqsCredentials,
} from "./handlers.js";
import {
	ActivateSqsInput,
	CreateSqsCredentialsInput,
	DeactivateSqsInput,
	DeleteSqsCredentialsInput,
	GetSqsCredentialsInput,
	GetSqsInfoInput,
	ListSqsCredentialsInput,
	UpdateSqsCredentialsInput,
} from "./types.js";

export function registerSqsTools(server: McpServer): void {
	server.tool(
		"scaleway_sqs_activate",
		"Activate SQS (Queues) service for a project in a region",
		ActivateSqsInput.shape,
		async (params) => handleActivateSqs(params),
	);

	server.tool(
		"scaleway_sqs_deactivate",
		"Deactivate SQS (Queues) service for a project in a region",
		DeactivateSqsInput.shape,
		async (params) => handleDeactivateSqs(params),
	);

	server.tool(
		"scaleway_sqs_get_info",
		"Get SQS service info including status and endpoint URL",
		GetSqsInfoInput.shape,
		async (params) => handleGetSqsInfo(params),
	);

	server.tool(
		"scaleway_sqs_create_credentials",
		"Create new SQS credentials for accessing the SQS-compatible endpoint",
		CreateSqsCredentialsInput.shape,
		async (params) => handleCreateSqsCredentials(params),
	);

	server.tool(
		"scaleway_sqs_delete_credentials",
		"Delete SQS credentials by ID",
		DeleteSqsCredentialsInput.shape,
		async (params) => handleDeleteSqsCredentials(params),
	);

	server.tool(
		"scaleway_sqs_get_credentials",
		"Get SQS credentials details by ID",
		GetSqsCredentialsInput.shape,
		async (params) => handleGetSqsCredentials(params),
	);

	server.tool(
		"scaleway_sqs_list_credentials",
		"List all SQS credentials for a project in a region",
		ListSqsCredentialsInput.shape,
		async (params) => handleListSqsCredentials(params),
	);

	server.tool(
		"scaleway_sqs_update_credentials",
		"Update SQS credentials name or permissions",
		UpdateSqsCredentialsInput.shape,
		async (params) => handleUpdateSqsCredentials(params),
	);
}
