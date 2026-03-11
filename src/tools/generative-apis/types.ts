import { z } from "zod";
import { ScalewayRegion } from "../../shared/types.js";

// --- Scaleway Generative APIs Base URL ---
export const GENERATIVE_APIS_BASE_URL = "https://api.scaleway.ai";

// --- Models ---
export const ModelSchema = z.object({
	id: z.string().describe("Model identifier (e.g., 'meta/llama-3.1-8b-instruct:fp8')"),
	object: z.literal("model"),
	created: z.number().int().describe("Unix timestamp of model creation"),
	owned_by: z.string().describe("Organization that owns the model"),
});
export type Model = z.infer<typeof ModelSchema>;

export const ListModelsResponseSchema = z.object({
	object: z.literal("list"),
	data: z.array(ModelSchema),
});
export type ListModelsResponse = z.infer<typeof ListModelsResponseSchema>;

// --- Chat Completion ---
export const ChatMessageRoleSchema = z.enum(["system", "user", "assistant"]);
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;

export const ChatMessageSchema = z.object({
	role: ChatMessageRoleSchema.describe("The role of the message author"),
	content: z.string().describe("The content of the message"),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatCompletionChoiceSchema = z.object({
	index: z.number().int(),
	message: ChatMessageSchema,
	finish_reason: z
		.enum(["stop", "length", "content_filter"])
		.nullable()
		.describe("Reason the generation stopped"),
});
export type ChatCompletionChoice = z.infer<typeof ChatCompletionChoiceSchema>;

export const UsageSchema = z.object({
	prompt_tokens: z.number().int().describe("Number of tokens in the prompt"),
	completion_tokens: z.number().int().describe("Number of tokens in the completion"),
	total_tokens: z.number().int().describe("Total number of tokens"),
});
export type Usage = z.infer<typeof UsageSchema>;

export const ChatCompletionResponseSchema = z.object({
	id: z.string().describe("Unique identifier for the completion"),
	object: z.literal("chat.completion"),
	created: z.number().int().describe("Unix timestamp"),
	model: z.string().describe("Model used for the completion"),
	choices: z.array(ChatCompletionChoiceSchema),
	usage: UsageSchema,
});
export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;

// --- Embeddings ---
export const EmbeddingDataSchema = z.object({
	object: z.literal("embedding"),
	embedding: z.array(z.number()).describe("The embedding vector"),
	index: z.number().int(),
});
export type EmbeddingData = z.infer<typeof EmbeddingDataSchema>;

export const EmbeddingResponseSchema = z.object({
	object: z.literal("list"),
	data: z.array(EmbeddingDataSchema),
	model: z.string().describe("Model used for the embedding"),
	usage: z.object({
		prompt_tokens: z.number().int(),
		total_tokens: z.number().int(),
	}),
});
export type EmbeddingResponse = z.infer<typeof EmbeddingResponseSchema>;

// --- Tool Input Schemas ---
export const ListModelsInputSchema = z.object({
	region: ScalewayRegion.optional().default("fr-par").describe("Scaleway region (e.g., fr-par)"),
});
export type ListModelsInput = z.infer<typeof ListModelsInputSchema>;

export const GetModelInputSchema = z.object({
	region: ScalewayRegion.optional().default("fr-par").describe("Scaleway region (e.g., fr-par)"),
	model_id: z.string().describe("Model identifier to retrieve"),
});
export type GetModelInput = z.infer<typeof GetModelInputSchema>;

export const ChatCompletionInputSchema = z.object({
	region: ScalewayRegion.optional().default("fr-par").describe("Scaleway region (e.g., fr-par)"),
	model: z.string().describe("Model ID (e.g., 'meta/llama-3.1-8b-instruct:fp8')"),
	messages: z.array(ChatMessageSchema).min(1).describe("Array of messages in the conversation"),
	temperature: z
		.number()
		.min(0)
		.max(2)
		.optional()
		.default(0.7)
		.describe("Sampling temperature (0-2)"),
	max_tokens: z
		.number()
		.int()
		.positive()
		.optional()
		.default(512)
		.describe("Maximum tokens to generate"),
	top_p: z.number().min(0).max(1).optional().default(1).describe("Nucleus sampling parameter"),
});
export type ChatCompletionInput = z.infer<typeof ChatCompletionInputSchema>;

export const CreateEmbeddingInputSchema = z.object({
	region: ScalewayRegion.optional().default("fr-par").describe("Scaleway region (e.g., fr-par)"),
	model: z.string().describe("Model ID for embeddings"),
	input: z.union([z.string(), z.array(z.string())]).describe("Text or array of texts to embed"),
});
export type CreateEmbeddingInput = z.infer<typeof CreateEmbeddingInputSchema>;
