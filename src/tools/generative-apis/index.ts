import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleChatCompletion,
	handleCreateEmbedding,
	handleGetModel,
	handleListModels,
} from "./handlers.js";
import {
	ChatCompletionInputSchema,
	CreateEmbeddingInputSchema,
	GetModelInputSchema,
	ListModelsInputSchema,
} from "./types.js";

export function registerGenerativeApisTools(server: McpServer): void {
	server.tool(
		"scaleway_generative_apis_list_models",
		"List all available generative AI models on Scaleway (OpenAI-compatible endpoint)",
		ListModelsInputSchema.shape,
		async (params) => handleListModels(ListModelsInputSchema.parse(params)),
	);

	server.tool(
		"scaleway_generative_apis_get_model",
		"Get details of a specific generative AI model by ID",
		GetModelInputSchema.shape,
		async (params) => handleGetModel(GetModelInputSchema.parse(params)),
	);

	server.tool(
		"scaleway_generative_apis_chat_completion",
		"Create a chat completion using a Scaleway generative AI model (OpenAI-compatible)",
		ChatCompletionInputSchema.shape,
		async (params) => handleChatCompletion(ChatCompletionInputSchema.parse(params)),
	);

	server.tool(
		"scaleway_generative_apis_create_embedding",
		"Create text embeddings using a Scaleway generative AI model",
		CreateEmbeddingInputSchema.shape,
		async (params) => handleCreateEmbedding(CreateEmbeddingInputSchema.parse(params)),
	);
}
