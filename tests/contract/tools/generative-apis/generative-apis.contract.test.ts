/**
 * Contract tests for Scaleway Generative APIs (OpenAI-compatible)
 *
 * API Endpoints:
 *   - GET  /v1/models              (list models)
 *   - POST /v1/chat/completions    (chat completion)
 *   - POST /v1/embeddings          (create embedding)
 *
 * Base URL: https://api.scaleway.ai/{region}
 * Auth: Bearer token (SCW_SECRET_KEY)
 * Spec: OpenAI-compatible API with Scaleway model IDs
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleChatCompletion,
	handleCreateEmbedding,
	handleGetModel,
	handleListModels,
} from "../../../../src/tools/generative-apis/handlers.js";
import {
	ChatCompletionResponseSchema,
	EmbeddingResponseSchema,
	ListModelsResponseSchema,
	ModelSchema,
} from "../../../../src/tools/generative-apis/types.js";

vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXXXX",
		secretKey: "00000000-0000-0000-0000-000000000000",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn() as unknown as ReturnType<typeof vi.fn> & typeof globalThis.fetch;
globalThis.fetch = mockFetch;

describe("Generative APIs Contract Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// --- GET /v1/models ---
	describe("GET /v1/models - List Models", () => {
		const validModelsResponse = {
			object: "list",
			data: [
				{
					id: "meta/llama-3.1-8b-instruct:fp8",
					object: "model",
					created: 1700000000,
					owned_by: "meta",
				},
				{
					id: "mistral/mistral-7b-instruct-v0.3",
					object: "model",
					created: 1700000001,
					owned_by: "mistral",
				},
			],
		};

		it("should conform to ListModelsResponse shape", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validModelsResponse,
			});

			const result = await handleListModels({ region: "fr-par" });
			const parsed = JSON.parse(result.content[0].text);

			// Validate against schema
			const validated = ListModelsResponseSchema.parse(parsed);
			expect(validated.object).toBe("list");
			expect(validated.data).toHaveLength(2);
			for (const model of validated.data) {
				ModelSchema.parse(model);
			}
		});

		it("should send correct auth header (Bearer token)", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validModelsResponse,
			});

			await handleListModels({ region: "fr-par" });

			const [, options] = mockFetch.mock.calls[0];
			expect(options.headers.Authorization).toBe("Bearer 00000000-0000-0000-0000-000000000000");
		});

		it("should target correct regional endpoint", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validModelsResponse,
			});

			await handleListModels({ region: "nl-ams" });

			const [url] = mockFetch.mock.calls[0];
			expect(url).toBe("https://api.scaleway.ai/nl-ams/v1/models");
		});

		it("should return permission_denied error on 401", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: "Unauthorized",
				text: async () => '{"error": "invalid_api_key"}',
			});

			const result = await handleListModels({ region: "fr-par" });
			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
			expect(parsed.error.statusCode).toBe(401);
		});

		it("should return rate_limited error on 429", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 429,
				statusText: "Too Many Requests",
				text: async () => "Rate limit exceeded",
			});

			const result = await handleListModels({ region: "fr-par" });
			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
			expect(parsed.error.statusCode).toBe(429);
		});
	});

	// --- GET /v1/models (get single model by filtering) ---
	describe("GET /v1/models - Get Model", () => {
		it("should return a single model matching the requested ID", async () => {
			const modelsResponse = {
				object: "list",
				data: [
					{
						id: "meta/llama-3.1-8b-instruct:fp8",
						object: "model",
						created: 1700000000,
						owned_by: "meta",
					},
				],
			};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => modelsResponse,
			});

			const result = await handleGetModel({
				region: "fr-par",
				model_id: "meta/llama-3.1-8b-instruct:fp8",
			});
			const parsed = JSON.parse(result.content[0].text);

			const validated = ModelSchema.parse(parsed);
			expect(validated.id).toBe("meta/llama-3.1-8b-instruct:fp8");
			expect(validated.object).toBe("model");
		});

		it("should return not_found error for unknown model", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ object: "list", data: [] }),
			});

			const result = await handleGetModel({
				region: "fr-par",
				model_id: "nonexistent/model",
			});
			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
			expect(parsed.error.statusCode).toBe(404);
		});
	});

	// --- POST /v1/chat/completions ---
	describe("POST /v1/chat/completions - Chat Completion", () => {
		const validCompletionResponse = {
			id: "chatcmpl-abc123",
			object: "chat.completion",
			created: 1700000000,
			model: "meta/llama-3.1-8b-instruct:fp8",
			choices: [
				{
					index: 0,
					message: {
						role: "assistant",
						content: "I am an AI assistant powered by Scaleway.",
					},
					finish_reason: "stop",
				},
			],
			usage: {
				prompt_tokens: 12,
				completion_tokens: 9,
				total_tokens: 21,
			},
		};

		it("should conform to ChatCompletionResponse shape", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validCompletionResponse,
			});

			const result = await handleChatCompletion({
				region: "fr-par",
				model: "meta/llama-3.1-8b-instruct:fp8",
				messages: [{ role: "user", content: "Who are you?" }],
				temperature: 0.7,
				max_tokens: 512,
				top_p: 1,
			});

			const parsed = JSON.parse(result.content[0].text);
			const validated = ChatCompletionResponseSchema.parse(parsed);
			expect(validated.object).toBe("chat.completion");
			expect(validated.choices).toHaveLength(1);
			expect(validated.choices[0].finish_reason).toBe("stop");
			expect(validated.usage.total_tokens).toBe(21);
		});

		it("should send correct request body shape", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validCompletionResponse,
			});

			await handleChatCompletion({
				region: "fr-par",
				model: "meta/llama-3.1-8b-instruct:fp8",
				messages: [
					{ role: "system", content: "You are helpful." },
					{ role: "user", content: "Hello" },
				],
				temperature: 0.5,
				max_tokens: 256,
				top_p: 0.9,
			});

			const [url, options] = mockFetch.mock.calls[0];
			expect(url).toBe("https://api.scaleway.ai/fr-par/v1/chat/completions");
			expect(options.method).toBe("POST");
			const body = JSON.parse(options.body);
			expect(body.model).toBe("meta/llama-3.1-8b-instruct:fp8");
			expect(body.messages).toHaveLength(2);
			expect(body.temperature).toBe(0.5);
			expect(body.max_tokens).toBe(256);
			expect(body.top_p).toBe(0.9);
			expect(body.stream).toBe(false);
		});

		it("should return invalid_input error on 400", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				statusText: "Bad Request",
				text: async () => '{"error": "invalid model"}',
			});

			const result = await handleChatCompletion({
				region: "fr-par",
				model: "invalid",
				messages: [{ role: "user", content: "Hi" }],
				temperature: 0.7,
				max_tokens: 512,
				top_p: 1,
			});

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
			expect(parsed.error.statusCode).toBe(400);
		});

		it("should send auth header", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validCompletionResponse,
			});

			await handleChatCompletion({
				region: "fr-par",
				model: "test",
				messages: [{ role: "user", content: "Hi" }],
				temperature: 0.7,
				max_tokens: 512,
				top_p: 1,
			});

			const [, options] = mockFetch.mock.calls[0];
			expect(options.headers.Authorization).toMatch(/^Bearer /);
		});
	});

	// --- POST /v1/embeddings ---
	describe("POST /v1/embeddings - Create Embedding", () => {
		const validEmbeddingResponse = {
			object: "list",
			data: [
				{
					object: "embedding",
					embedding: [0.0023, -0.0094, 0.0156, -0.0073, 0.0312],
					index: 0,
				},
			],
			model: "sentence-transformers/all-MiniLM-L6-v2",
			usage: {
				prompt_tokens: 8,
				total_tokens: 8,
			},
		};

		it("should conform to EmbeddingResponse shape", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validEmbeddingResponse,
			});

			const result = await handleCreateEmbedding({
				region: "fr-par",
				model: "sentence-transformers/all-MiniLM-L6-v2",
				input: "Hello world",
			});

			const parsed = JSON.parse(result.content[0].text);
			const validated = EmbeddingResponseSchema.parse(parsed);
			expect(validated.object).toBe("list");
			expect(validated.data[0].object).toBe("embedding");
			expect(validated.data[0].embedding).toHaveLength(5);
			expect(validated.usage.prompt_tokens).toBe(8);
		});

		it("should send correct request body for string input", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validEmbeddingResponse,
			});

			await handleCreateEmbedding({
				region: "fr-par",
				model: "sentence-transformers/all-MiniLM-L6-v2",
				input: "Hello world",
			});

			const [url, options] = mockFetch.mock.calls[0];
			expect(url).toBe("https://api.scaleway.ai/fr-par/v1/embeddings");
			expect(options.method).toBe("POST");
			const body = JSON.parse(options.body);
			expect(body.model).toBe("sentence-transformers/all-MiniLM-L6-v2");
			expect(body.input).toBe("Hello world");
		});

		it("should send correct request body for array input", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					...validEmbeddingResponse,
					data: [
						{ object: "embedding", embedding: [0.1], index: 0 },
						{ object: "embedding", embedding: [0.2], index: 1 },
					],
				}),
			});

			await handleCreateEmbedding({
				region: "fr-par",
				model: "test-model",
				input: ["Hello", "World"],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][1].body);
			expect(body.input).toEqual(["Hello", "World"]);
		});

		it("should return not_found error on 404", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				statusText: "Not Found",
				text: async () => "Model not found",
			});

			const result = await handleCreateEmbedding({
				region: "fr-par",
				model: "nonexistent",
				input: "Hello",
			});

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
			expect(parsed.error.statusCode).toBe(404);
		});

		it("should send auth header", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => validEmbeddingResponse,
			});

			await handleCreateEmbedding({
				region: "fr-par",
				model: "test",
				input: "test",
			});

			const [, options] = mockFetch.mock.calls[0];
			expect(options.headers.Authorization).toMatch(/^Bearer /);
			expect(options.headers["Content-Type"]).toBe("application/json");
		});
	});
});
