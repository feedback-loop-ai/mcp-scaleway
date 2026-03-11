import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// --- Enums ---

export const DeploymentStatus = z.enum([
	"unknown",
	"queued",
	"allocating",
	"deploying",
	"ready",
	"deleting",
	"error",
	"locked",
]);
export type DeploymentStatus = z.infer<typeof DeploymentStatus>;

export const NodeTypeStockStatus = z.enum(["unknown", "available", "low_stock", "out_of_stock"]);
export type NodeTypeStockStatus = z.infer<typeof NodeTypeStockStatus>;

// --- Endpoint ---

export const EndpointSpec = z.object({
	is_public: z.boolean().optional().describe("Whether the endpoint is publicly accessible"),
	private_network_id: z.string().uuid().optional().describe("Private network ID to attach to"),
	disable_auth: z.boolean().optional().describe("Disable authentication on this endpoint"),
});

export const Endpoint = z.object({
	id: z.string().uuid(),
	url: z.string(),
	is_public: z.boolean(),
	private_network_id: z.string().nullable(),
	disable_auth: z.boolean(),
});
export type Endpoint = z.infer<typeof Endpoint>;

// --- Deployment ---

export const Deployment = z.object({
	id: z.string().uuid(),
	name: z.string(),
	status: DeploymentStatus,
	region: z.string(),
	project_id: z.string().uuid(),
	model_id: z.string().uuid(),
	model_name: z.string(),
	node_type: z.string(),
	tags: z.array(z.string()),
	endpoints: z.array(Endpoint),
	size: z.number().int(),
	min_size: z.number().int(),
	max_size: z.number().int(),
	created_at: z.string(),
	updated_at: z.string(),
});
export type Deployment = z.infer<typeof Deployment>;

// --- DeploymentEvent ---

export const DeploymentEvent = z.object({
	id: z.string().uuid(),
	deployment_id: z.string().uuid(),
	type: z.string(),
	details: z.string(),
	created_at: z.string(),
});
export type DeploymentEvent = z.infer<typeof DeploymentEvent>;

// --- Model ---

export const Model = z.object({
	id: z.string().uuid(),
	name: z.string(),
	description: z.string(),
	provider: z.string(),
	tags: z.array(z.string()),
	compatible_node_types: z.array(z.string()),
	quantization_level: z.string(),
	has_eula: z.boolean(),
	created_at: z.string(),
	updated_at: z.string(),
});
export type Model = z.infer<typeof Model>;

// --- NodeType ---

export const NodeType = z.object({
	name: z.string(),
	stock_status: NodeTypeStockStatus,
	description: z.string(),
	vcpus: z.number().int(),
	memory: z.number().int(),
	vram: z.number().int(),
	gpus: z.number().int(),
});
export type NodeType = z.infer<typeof NodeType>;

// --- Input Schemas ---

export const ListDeploymentsInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	name: z.string().optional().describe("Filter by deployment name"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	order_by: z.string().optional().describe("Order by field (e.g., created_at_asc)"),
	...PaginationParams.shape,
});

export const GetDeploymentInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	deployment_id: z.string().uuid().describe("Deployment ID"),
});

export const CreateDeploymentInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	name: z.string().describe("Deployment name"),
	model_id: z.string().uuid().describe("Model ID to deploy"),
	node_type: z.string().describe("Node type for deployment (e.g., L4)"),
	project_id: z.string().uuid().optional().describe("Project ID (uses default if not set)"),
	tags: z.array(z.string()).optional().describe("Tags for the deployment"),
	endpoints: z.array(EndpointSpec).optional().describe("Endpoint specifications"),
	min_size: z.number().int().min(0).optional().describe("Minimum number of replicas"),
	max_size: z.number().int().min(1).optional().describe("Maximum number of replicas"),
});

export const UpdateDeploymentInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	deployment_id: z.string().uuid().describe("Deployment ID"),
	name: z.string().optional().describe("New deployment name"),
	tags: z.array(z.string()).optional().describe("New tags"),
	min_size: z.number().int().min(0).optional().describe("Minimum number of replicas"),
	max_size: z.number().int().min(1).optional().describe("Maximum number of replicas"),
});

export const DeleteDeploymentInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	deployment_id: z.string().uuid().describe("Deployment ID"),
});

export const ListDeploymentEventsInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	deployment_id: z.string().uuid().describe("Deployment ID"),
	...PaginationParams.shape,
});

export const ListEndpointsInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	deployment_id: z.string().uuid().optional().describe("Filter by deployment ID"),
	...PaginationParams.shape,
});

export const CreateEndpointInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	deployment_id: z.string().uuid().describe("Deployment ID to attach endpoint to"),
	is_public: z.boolean().optional().describe("Whether the endpoint is publicly accessible"),
	private_network_id: z.string().uuid().optional().describe("Private network ID to attach to"),
	disable_auth: z.boolean().optional().describe("Disable authentication on this endpoint"),
});

export const UpdateEndpointInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	endpoint_id: z.string().uuid().describe("Endpoint ID"),
	disable_auth: z.boolean().optional().describe("Disable authentication on this endpoint"),
});

export const DeleteEndpointInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	endpoint_id: z.string().uuid().describe("Endpoint ID"),
});

export const ListModelsInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	name: z.string().optional().describe("Filter by model name"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	tags: z.array(z.string()).optional().describe("Filter by tags"),
	order_by: z.string().optional().describe("Order by field"),
	...PaginationParams.shape,
});

export const GetModelInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	model_id: z.string().uuid().describe("Model ID"),
});

export const ListNodeTypesInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	...PaginationParams.shape,
});

export const GetEulaInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	model_id: z.string().uuid().describe("Model ID"),
});

export const AcceptEulaInput = z.object({
	region: ScalewayRegion.describe("Scaleway region (e.g., fr-par)"),
	model_id: z.string().uuid().describe("Model ID"),
});
