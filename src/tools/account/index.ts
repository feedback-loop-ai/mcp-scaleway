import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import {
	createProjectApi,
	handleCreateProject,
	handleDeleteProject,
	handleGetProject,
	handleListProjects,
	handleUpdateProject,
} from "./handlers.js";
import {
	CreateProjectParams,
	DeleteProjectParams,
	GetProjectParams,
	ListProjectsParams,
	UpdateProjectParams,
} from "./types.js";

export function registerAccountTools(server: McpServer): void {
	server.tool(
		"scaleway_account_list_projects",
		"List all projects in a Scaleway organization with optional filtering and pagination",
		ListProjectsParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const api = createProjectApi(client);
			return handleListProjects(api, ListProjectsParams.parse(params));
		},
	);

	server.tool(
		"scaleway_account_get_project",
		"Get details of a specific Scaleway project by its ID",
		GetProjectParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const api = createProjectApi(client);
			return handleGetProject(api, GetProjectParams.parse(params));
		},
	);

	server.tool(
		"scaleway_account_create_project",
		"Create a new project in a Scaleway organization",
		CreateProjectParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const api = createProjectApi(client);
			return handleCreateProject(api, CreateProjectParams.parse(params));
		},
	);

	server.tool(
		"scaleway_account_update_project",
		"Update name and/or description of an existing Scaleway project",
		UpdateProjectParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const api = createProjectApi(client);
			return handleUpdateProject(api, UpdateProjectParams.parse(params));
		},
	);

	server.tool(
		"scaleway_account_delete_project",
		"Delete a Scaleway project (project must be empty - no resources)",
		DeleteProjectParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const api = createProjectApi(client);
			return handleDeleteProject(api, DeleteProjectParams.parse(params));
		},
	);
}
