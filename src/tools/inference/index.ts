import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleAcceptEula,
	handleCreateDeployment,
	handleCreateEndpoint,
	handleDeleteDeployment,
	handleDeleteEndpoint,
	handleGetDeployment,
	handleGetEula,
	handleGetModel,
	handleListDeploymentEvents,
	handleListDeployments,
	handleListEndpoints,
	handleListModels,
	handleListNodeTypes,
	handleUpdateDeployment,
	handleUpdateEndpoint,
} from "./handlers.js";
import {
	AcceptEulaInput,
	CreateDeploymentInput,
	CreateEndpointInput,
	DeleteDeploymentInput,
	DeleteEndpointInput,
	GetDeploymentInput,
	GetEulaInput,
	GetModelInput,
	ListDeploymentEventsInput,
	ListDeploymentsInput,
	ListEndpointsInput,
	ListModelsInput,
	ListNodeTypesInput,
	UpdateDeploymentInput,
	UpdateEndpointInput,
} from "./types.js";

export function registerInferenceTools(server: McpServer): void {
	// --- Deployments ---
	server.tool(
		"scaleway_inference_list_deployments",
		"List inference deployments in a Scaleway region with optional filters",
		ListDeploymentsInput.shape,
		handleListDeployments,
	);

	server.tool(
		"scaleway_inference_get_deployment",
		"Get details of a specific inference deployment",
		GetDeploymentInput.shape,
		handleGetDeployment,
	);

	server.tool(
		"scaleway_inference_create_deployment",
		"Create a new inference deployment with a model on a specific node type",
		CreateDeploymentInput.shape,
		handleCreateDeployment,
	);

	server.tool(
		"scaleway_inference_update_deployment",
		"Update an inference deployment (name, tags, scaling)",
		UpdateDeploymentInput.shape,
		handleUpdateDeployment,
	);

	server.tool(
		"scaleway_inference_delete_deployment",
		"Delete an inference deployment",
		DeleteDeploymentInput.shape,
		handleDeleteDeployment,
	);

	server.tool(
		"scaleway_inference_list_deployment_events",
		"List events for an inference deployment",
		ListDeploymentEventsInput.shape,
		handleListDeploymentEvents,
	);

	// --- Endpoints ---
	server.tool(
		"scaleway_inference_list_endpoints",
		"List inference endpoints, optionally filtered by deployment",
		ListEndpointsInput.shape,
		handleListEndpoints,
	);

	server.tool(
		"scaleway_inference_create_endpoint",
		"Create a new endpoint on an inference deployment",
		CreateEndpointInput.shape,
		handleCreateEndpoint,
	);

	server.tool(
		"scaleway_inference_update_endpoint",
		"Update an inference endpoint (e.g., toggle auth)",
		UpdateEndpointInput.shape,
		handleUpdateEndpoint,
	);

	server.tool(
		"scaleway_inference_delete_endpoint",
		"Delete an inference endpoint",
		DeleteEndpointInput.shape,
		handleDeleteEndpoint,
	);

	// --- Models ---
	server.tool(
		"scaleway_inference_list_models",
		"List available inference models in a Scaleway region",
		ListModelsInput.shape,
		handleListModels,
	);

	server.tool(
		"scaleway_inference_get_model",
		"Get details of a specific inference model",
		GetModelInput.shape,
		handleGetModel,
	);

	// --- Node Types ---
	server.tool(
		"scaleway_inference_list_node_types",
		"List available node types for inference deployments",
		ListNodeTypesInput.shape,
		handleListNodeTypes,
	);

	// --- EULA ---
	server.tool(
		"scaleway_inference_get_eula",
		"Get the EULA content for an inference model",
		GetEulaInput.shape,
		handleGetEula,
	);

	server.tool(
		"scaleway_inference_accept_eula",
		"Accept the EULA for an inference model",
		AcceptEulaInput.shape,
		handleAcceptEula,
	);
}
