import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateNatsAccount,
	handleCreateNatsCredentials,
	handleDeleteNatsAccount,
	handleDeleteNatsCredentials,
	handleGetNatsAccount,
	handleGetNatsCredentials,
	handleListNatsAccounts,
	handleListNatsCredentials,
	handleUpdateNatsAccount,
} from "./handlers.js";
import {
	CreateNatsAccountParams,
	CreateNatsCredentialsParams,
	DeleteNatsAccountParams,
	DeleteNatsCredentialsParams,
	GetNatsAccountParams,
	GetNatsCredentialsParams,
	ListNatsAccountsParams,
	ListNatsCredentialsParams,
	UpdateNatsAccountParams,
} from "./types.js";

export function registerNatsTools(server: McpServer): void {
	server.tool(
		"scaleway_nats_list_accounts",
		"List NATS accounts in a Scaleway region with optional filtering by project or name",
		ListNatsAccountsParams.shape,
		async (params) => handleListNatsAccounts(ListNatsAccountsParams.parse(params)),
	);

	server.tool(
		"scaleway_nats_get_account",
		"Get details of a specific NATS account by ID",
		GetNatsAccountParams.shape,
		async (params) => handleGetNatsAccount(GetNatsAccountParams.parse(params)),
	);

	server.tool(
		"scaleway_nats_create_account",
		"Create a new NATS account in a Scaleway region",
		CreateNatsAccountParams.shape,
		async (params) => handleCreateNatsAccount(CreateNatsAccountParams.parse(params)),
	);

	server.tool(
		"scaleway_nats_update_account",
		"Update a NATS account (e.g. rename)",
		UpdateNatsAccountParams.shape,
		async (params) => handleUpdateNatsAccount(UpdateNatsAccountParams.parse(params)),
	);

	server.tool(
		"scaleway_nats_delete_account",
		"Delete a NATS account by ID",
		DeleteNatsAccountParams.shape,
		async (params) => handleDeleteNatsAccount(DeleteNatsAccountParams.parse(params)),
	);

	server.tool(
		"scaleway_nats_list_credentials",
		"List credentials for a NATS account",
		ListNatsCredentialsParams.shape,
		async (params) => handleListNatsCredentials(ListNatsCredentialsParams.parse(params)),
	);

	server.tool(
		"scaleway_nats_get_credentials",
		"Get details of specific NATS credentials by ID",
		GetNatsCredentialsParams.shape,
		async (params) => handleGetNatsCredentials(GetNatsCredentialsParams.parse(params)),
	);

	server.tool(
		"scaleway_nats_create_credentials",
		"Create new credentials for a NATS account",
		CreateNatsCredentialsParams.shape,
		async (params) => handleCreateNatsCredentials(CreateNatsCredentialsParams.parse(params)),
	);

	server.tool(
		"scaleway_nats_delete_credentials",
		"Delete NATS credentials by ID",
		DeleteNatsCredentialsParams.shape,
		async (params) => handleDeleteNatsCredentials(DeleteNatsCredentialsParams.parse(params)),
	);
}
