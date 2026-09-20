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
export const ChatMessageRoleSchema = z.enum(["system", "user", "assistant", "tool"]);
export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;

export const FunctionToolCallSchema = z.object({
	id: z.string().min(1),
	type: z.literal("function"),
	function: z.object({ name: z.string().min(1), arguments: z.string() }),
});

export const ChatMessageSchema = z.union([
	z.object({ role: z.enum(["system", "user"]), content: z.string() }),
	z.object({
		role: z.literal("assistant"),
		content: z.string(),
		tool_calls: z.array(FunctionToolCallSchema).optional(),
	}),
	z.object({
		role: z.literal("assistant"),
		content: z.null().optional(),
		tool_calls: z.array(FunctionToolCallSchema).min(1),
	}),
	z.object({
		role: z.literal("tool"),
		content: z.string(),
		tool_call_id: z.string().min(1),
	}),
]);
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

const FunctionNameSchema = z
	.string()
	.min(1)
	.max(64)
	.regex(/^[a-zA-Z0-9_-]+$/)
	.describe("Function name: 1-64 ASCII letters, digits, underscores, or dashes");

export const FunctionToolSchema = z.object({
	type: z.literal("function"),
	function: z.object({
		name: FunctionNameSchema,
		description: z.string().optional(),
		parameters: z.record(z.unknown()).optional().describe("Function input JSON Schema"),
		strict: z
			.boolean()
			.nullable()
			.optional()
			.describe("Forwarded to Scaleway; currently ignored, so validate generated arguments"),
	}),
});

export const ToolChoiceSchema = z.union([
	z.enum(["none", "auto", "required"]),
	z.object({ type: z.literal("function"), function: z.object({ name: FunctionNameSchema }) }),
]);

export const ResponseFormatSchema = z.union([
	z.object({ type: z.literal("text") }),
	z.object({ type: z.literal("json_object") }),
	z.object({
		type: z.literal("json_schema"),
		json_schema: z.object({
			name: z.string().min(1),
			description: z.string().optional(),
			schema: z.record(z.unknown()),
			strict: z.boolean().optional(),
		}),
	}),
]);

export const ChatCompletionChoiceSchema = z.object({
	index: z.number().int(),
	message: ChatMessageSchema,
	finish_reason: z
		.enum(["stop", "length", "content_filter", "tool_calls"])
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
	region: ScalewayRegion.optional()
		.default("fr-par")
		.describe("Deprecated compatibility input; serverless Generative APIs use a global endpoint"),
});
export type ListModelsInput = z.infer<typeof ListModelsInputSchema>;

export const GetModelInputSchema = z.object({
	region: ScalewayRegion.optional()
		.default("fr-par")
		.describe("Deprecated compatibility input; serverless Generative APIs use a global endpoint"),
	model_id: z.string().describe("Model identifier to retrieve"),
});
export type GetModelInput = z.infer<typeof GetModelInputSchema>;

export const ChatCompletionInputSchema = z.object({
	project_id: z
		.string()
		.uuid()
		.optional()
		.describe("Project to bill; defaults to SCW_DEFAULT_PROJECT_ID"),
	region: ScalewayRegion.optional()
		.default("fr-par")
		.describe("Deprecated compatibility input; serverless Generative APIs use a global endpoint"),
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
		.describe("Legacy output-token limit; ignored when max_completion_tokens is supplied"),
	max_completion_tokens: z
		.number()
		.int()
		.positive()
		.optional()
		.describe(
			"Maximum completion tokens, including reasoning tokens; takes precedence over max_tokens",
		),
	top_p: z.number().min(0).max(1).optional().default(1).describe("Nucleus sampling parameter"),
	tools: z
		.array(FunctionToolSchema)
		.max(128)
		.optional()
		.describe("Functions the model may request (maximum 128)"),
	tool_choice: ToolChoiceSchema.optional().describe(
		"Automatic, required, disabled, or named function",
	),
	parallel_tool_calls: z
		.boolean()
		.optional()
		.describe(
			"Forwarded to Scaleway; currently false is ignored, so multiple calls may be returned",
		),
	response_format: ResponseFormatSchema.optional().describe(
		"Text, JSON object, or JSON Schema output",
	),
	reasoning_effort: z
		.enum(["none", "low", "medium", "high"])
		.optional()
		.describe("Reasoning effort, subject to the selected model's capabilities"),
});
export type ChatCompletionInput = z.infer<typeof ChatCompletionInputSchema>;

export const CreateEmbeddingInputSchema = z.object({
	project_id: z
		.string()
		.uuid()
		.optional()
		.describe("Project to bill; defaults to SCW_DEFAULT_PROJECT_ID"),
	region: ScalewayRegion.optional()
		.default("fr-par")
		.describe("Deprecated compatibility input; serverless Generative APIs use a global endpoint"),
	model: z.string().describe("Model ID for embeddings"),
	input: z.union([z.string(), z.array(z.string())]).describe("Text or array of texts to embed"),
});
export type CreateEmbeddingInput = z.infer<typeof CreateEmbeddingInputSchema>;
