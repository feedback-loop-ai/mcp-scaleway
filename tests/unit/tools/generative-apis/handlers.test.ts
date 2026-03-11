import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	handleChatCompletion,
	handleCreateEmbedding,
	handleGetModel,
	handleListModels,
} from "../../../../src/tools/generative-apis/handlers.js";

// Mock loadAuthConfig
vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "project-123",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn() as unknown as ReturnType<typeof vi.fn> & typeof globalThis.fetch;
globalThis.fetch = mockFetch;

describe("generative-apis/handlers", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("handleListModels", () => {
		it("should return models list on success", async () => {
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

			const result = await handleListModels({ region: "fr-par" });

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.object).toBe("list");
			expect(parsed.data).toHaveLength(1);
			expect(parsed.data[0].id).toBe("meta/llama-3.1-8b-instruct:fp8");

			expect(mockFetch).toHaveBeenCalledWith("https://api.scaleway.ai/fr-par/v1/models", {
				method: "GET",
				headers: {
					Authorization: "Bearer SCW-SECRET-KEY",
					"Content-Type": "application/json",
				},
			});
		});

		it("should return error on API failure", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 401,
				statusText: "Unauthorized",
				text: async () => "Unauthorized",
			});

			const result = await handleListModels({ region: "fr-par" });

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});

		it("should use statusText when error body is empty", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				text: async () => "",
			});

			const result = await handleListModels({ region: "fr-par" });

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});

		it("should handle network errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			const result = await handleListModels({ region: "fr-par" });

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});

		it("should handle non-Error throws", async () => {
			mockFetch.mockRejectedValueOnce("string error");

			const result = await handleListModels({ region: "fr-par" });

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
			expect(parsed.error.message).toBe("string error");
		});

		it("should use correct base URL for different regions", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ object: "list", data: [] }),
			});

			await handleListModels({ region: "nl-ams" });

			expect(mockFetch).toHaveBeenCalledWith(
				"https://api.scaleway.ai/nl-ams/v1/models",
				expect.any(Object),
			);
		});
	});

	describe("handleGetModel", () => {
		it("should return a specific model on success", async () => {
			const modelsResponse = {
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
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => modelsResponse,
			});

			const result = await handleGetModel({
				region: "fr-par",
				model_id: "meta/llama-3.1-8b-instruct:fp8",
			});

			expect("isError" in result && result.isError).toBeFalsy();
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("meta/llama-3.1-8b-instruct:fp8");
			expect(parsed.owned_by).toBe("meta");
		});

		it("should return 404 when model not found", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => ({ object: "list", data: [] }),
			});

			const result = await handleGetModel({
				region: "fr-par",
				model_id: "nonexistent-model",
			});

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
			expect(parsed.error.statusCode).toBe(404);
		});

		it("should return error on API failure", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 403,
				statusText: "Forbidden",
				text: async () => "Forbidden",
			});

			const result = await handleGetModel({
				region: "fr-par",
				model_id: "test",
			});

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});

		it("should use statusText when error body is empty", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 429,
				statusText: "Too Many Requests",
				text: async () => "",
			});

			const result = await handleGetModel({
				region: "fr-par",
				model_id: "test",
			});

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});

	describe("handleChatCompletion", () => {
		it("should return chat completion on success", async () => {
			const completionResponse = {
				id: "chatcmpl-123",
				object: "chat.completion",
				created: 1700000000,
				model: "meta/llama-3.1-8b-instruct:fp8",
				choices: [
					{
						index: 0,
						message: { role: "assistant", content: "Hello! How can I help?" },
						finish_reason: "stop",
					},
				],
				usage: { prompt_tokens: 10, completion_tokens: 7, total_tokens: 17 },
			};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => completionResponse,
			});

			const result = await handleChatCompletion({
				region: "fr-par",
				model: "meta/llama-3.1-8b-instruct:fp8",
				messages: [{ role: "user", content: "Hello" }],
				temperature: 0.7,
				max_tokens: 512,
				top_p: 1,
			});

			expect("isError" in result && result.isError).toBeFalsy();
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("chatcmpl-123");
			expect(parsed.choices[0].message.content).toBe("Hello! How can I help?");

			expect(mockFetch).toHaveBeenCalledWith("https://api.scaleway.ai/fr-par/v1/chat/completions", {
				method: "POST",
				headers: {
					Authorization: "Bearer SCW-SECRET-KEY",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "meta/llama-3.1-8b-instruct:fp8",
					messages: [{ role: "user", content: "Hello" }],
					temperature: 0.7,
					max_tokens: 512,
					top_p: 1,
					stream: false,
				}),
			});
		});

		it("should return error on API failure", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				statusText: "Bad Request",
				text: async () => "Invalid model",
			});

			const result = await handleChatCompletion({
				region: "fr-par",
				model: "invalid",
				messages: [{ role: "user", content: "Hello" }],
				temperature: 0.7,
				max_tokens: 512,
				top_p: 1,
			});

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});

		it("should use statusText when error body is empty", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				statusText: "Bad Request",
				text: async () => "",
			});

			const result = await handleChatCompletion({
				region: "fr-par",
				model: "test",
				messages: [{ role: "user", content: "Hi" }],
				temperature: 0.7,
				max_tokens: 512,
				top_p: 1,
			});

			expect("isError" in result && result.isError).toBe(true);
		});

		it("should handle network errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Connection refused"));

			const result = await handleChatCompletion({
				region: "fr-par",
				model: "test",
				messages: [{ role: "user", content: "Hi" }],
				temperature: 0.7,
				max_tokens: 512,
				top_p: 1,
			});

			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleCreateEmbedding", () => {
		it("should return embeddings on success", async () => {
			const embeddingResponse = {
				object: "list",
				data: [{ object: "embedding", embedding: [0.1, 0.2, 0.3], index: 0 }],
				model: "sentence-transformers/all-MiniLM-L6-v2",
				usage: { prompt_tokens: 5, total_tokens: 5 },
			};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => embeddingResponse,
			});

			const result = await handleCreateEmbedding({
				region: "fr-par",
				model: "sentence-transformers/all-MiniLM-L6-v2",
				input: "Hello world",
			});

			expect("isError" in result && result.isError).toBeFalsy();
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.data[0].embedding).toEqual([0.1, 0.2, 0.3]);

			expect(mockFetch).toHaveBeenCalledWith("https://api.scaleway.ai/fr-par/v1/embeddings", {
				method: "POST",
				headers: {
					Authorization: "Bearer SCW-SECRET-KEY",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "sentence-transformers/all-MiniLM-L6-v2",
					input: "Hello world",
				}),
			});
		});

		it("should handle array input", async () => {
			const embeddingResponse = {
				object: "list",
				data: [
					{ object: "embedding", embedding: [0.1], index: 0 },
					{ object: "embedding", embedding: [0.2], index: 1 },
				],
				model: "test-model",
				usage: { prompt_tokens: 10, total_tokens: 10 },
			};
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => embeddingResponse,
			});

			const result = await handleCreateEmbedding({
				region: "fr-par",
				model: "test-model",
				input: ["Hello", "World"],
			});

			expect("isError" in result && result.isError).toBeFalsy();
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.data).toHaveLength(2);
		});

		it("should return error on API failure", async () => {
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
		});

		it("should use statusText when error body is empty", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				text: async () => "",
			});

			const result = await handleCreateEmbedding({
				region: "fr-par",
				model: "test",
				input: "test",
			});

			expect("isError" in result && result.isError).toBe(true);
		});

		it("should handle network errors", async () => {
			mockFetch.mockRejectedValueOnce(new Error("timeout"));

			const result = await handleCreateEmbedding({
				region: "fr-par",
				model: "test",
				input: "test",
			});

			expect("isError" in result && result.isError).toBe(true);
		});

		it("should handle non-Error throws", async () => {
			mockFetch.mockRejectedValueOnce(42);

			const result = await handleCreateEmbedding({
				region: "fr-par",
				model: "test",
				input: "test",
			});

			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.message).toBe("42");
		});
	});
});
