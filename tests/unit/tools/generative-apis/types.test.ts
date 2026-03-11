import { describe, expect, it } from "vitest";
import {
	ChatCompletionInputSchema,
	ChatCompletionResponseSchema,
	ChatMessageRoleSchema,
	ChatMessageSchema,
	CreateEmbeddingInputSchema,
	EmbeddingResponseSchema,
	GENERATIVE_APIS_BASE_URL,
	GetModelInputSchema,
	ListModelsInputSchema,
	ListModelsResponseSchema,
	ModelSchema,
	UsageSchema,
} from "../../../../src/tools/generative-apis/types.js";

describe("generative-apis/types", () => {
	describe("GENERATIVE_APIS_BASE_URL", () => {
		it("should be the Scaleway AI API base URL", () => {
			expect(GENERATIVE_APIS_BASE_URL).toBe("https://api.scaleway.ai");
		});
	});

	describe("ModelSchema", () => {
		it("should validate a valid model", () => {
			const model = {
				id: "meta/llama-3.1-8b-instruct:fp8",
				object: "model" as const,
				created: 1700000000,
				owned_by: "meta",
			};
			expect(ModelSchema.parse(model)).toEqual(model);
		});

		it("should reject model with invalid object", () => {
			expect(() =>
				ModelSchema.parse({
					id: "test",
					object: "invalid",
					created: 1700000000,
					owned_by: "meta",
				}),
			).toThrow();
		});
	});

	describe("ListModelsResponseSchema", () => {
		it("should validate a valid list models response", () => {
			const response = {
				object: "list" as const,
				data: [
					{
						id: "meta/llama-3.1-8b-instruct:fp8",
						object: "model" as const,
						created: 1700000000,
						owned_by: "meta",
					},
				],
			};
			expect(ListModelsResponseSchema.parse(response)).toEqual(response);
		});

		it("should validate empty models list", () => {
			const response = { object: "list" as const, data: [] };
			expect(ListModelsResponseSchema.parse(response)).toEqual(response);
		});
	});

	describe("ChatMessageRoleSchema", () => {
		it("should accept valid roles", () => {
			expect(ChatMessageRoleSchema.parse("system")).toBe("system");
			expect(ChatMessageRoleSchema.parse("user")).toBe("user");
			expect(ChatMessageRoleSchema.parse("assistant")).toBe("assistant");
		});

		it("should reject invalid role", () => {
			expect(() => ChatMessageRoleSchema.parse("admin")).toThrow();
		});
	});

	describe("ChatMessageSchema", () => {
		it("should validate a valid chat message", () => {
			const msg = { role: "user" as const, content: "Hello" };
			expect(ChatMessageSchema.parse(msg)).toEqual(msg);
		});
	});

	describe("UsageSchema", () => {
		it("should validate usage data", () => {
			const usage = { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 };
			expect(UsageSchema.parse(usage)).toEqual(usage);
		});
	});

	describe("ChatCompletionResponseSchema", () => {
		it("should validate a valid chat completion response", () => {
			const response = {
				id: "chatcmpl-123",
				object: "chat.completion" as const,
				created: 1700000000,
				model: "meta/llama-3.1-8b-instruct:fp8",
				choices: [
					{
						index: 0,
						message: { role: "assistant" as const, content: "Hello!" },
						finish_reason: "stop" as const,
					},
				],
				usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
			};
			expect(ChatCompletionResponseSchema.parse(response)).toEqual(response);
		});

		it("should accept null finish_reason", () => {
			const response = {
				id: "chatcmpl-123",
				object: "chat.completion" as const,
				created: 1700000000,
				model: "test-model",
				choices: [
					{
						index: 0,
						message: { role: "assistant" as const, content: "Hello!" },
						finish_reason: null,
					},
				],
				usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
			};
			expect(ChatCompletionResponseSchema.parse(response)).toEqual(response);
		});

		it("should accept length and content_filter finish_reason", () => {
			const base = {
				id: "chatcmpl-123",
				object: "chat.completion" as const,
				created: 1700000000,
				model: "test-model",
				usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
			};
			const withLength = {
				...base,
				choices: [
					{
						index: 0,
						message: { role: "assistant" as const, content: "..." },
						finish_reason: "length" as const,
					},
				],
			};
			const withFilter = {
				...base,
				choices: [
					{
						index: 0,
						message: { role: "assistant" as const, content: "" },
						finish_reason: "content_filter" as const,
					},
				],
			};
			expect(ChatCompletionResponseSchema.parse(withLength).choices[0].finish_reason).toBe(
				"length",
			);
			expect(ChatCompletionResponseSchema.parse(withFilter).choices[0].finish_reason).toBe(
				"content_filter",
			);
		});
	});

	describe("EmbeddingResponseSchema", () => {
		it("should validate a valid embedding response", () => {
			const response = {
				object: "list" as const,
				data: [{ object: "embedding" as const, embedding: [0.1, 0.2, 0.3], index: 0 }],
				model: "sentence-transformers/all-MiniLM-L6-v2",
				usage: { prompt_tokens: 5, total_tokens: 5 },
			};
			expect(EmbeddingResponseSchema.parse(response)).toEqual(response);
		});
	});

	describe("ListModelsInputSchema", () => {
		it("should use default region when not specified", () => {
			const result = ListModelsInputSchema.parse({});
			expect(result.region).toBe("fr-par");
		});

		it("should accept a valid region", () => {
			const result = ListModelsInputSchema.parse({ region: "nl-ams" });
			expect(result.region).toBe("nl-ams");
		});

		it("should reject invalid region format", () => {
			expect(() => ListModelsInputSchema.parse({ region: "invalid" })).toThrow();
		});
	});

	describe("GetModelInputSchema", () => {
		it("should validate with model_id and default region", () => {
			const result = GetModelInputSchema.parse({ model_id: "meta/llama-3.1-8b-instruct:fp8" });
			expect(result.region).toBe("fr-par");
			expect(result.model_id).toBe("meta/llama-3.1-8b-instruct:fp8");
		});

		it("should reject when model_id is missing", () => {
			expect(() => GetModelInputSchema.parse({})).toThrow();
		});
	});

	describe("ChatCompletionInputSchema", () => {
		it("should validate with required fields and defaults", () => {
			const result = ChatCompletionInputSchema.parse({
				model: "meta/llama-3.1-8b-instruct:fp8",
				messages: [{ role: "user", content: "Hello" }],
			});
			expect(result.region).toBe("fr-par");
			expect(result.temperature).toBe(0.7);
			expect(result.max_tokens).toBe(512);
			expect(result.top_p).toBe(1);
		});

		it("should accept custom parameters", () => {
			const result = ChatCompletionInputSchema.parse({
				region: "nl-ams",
				model: "test-model",
				messages: [{ role: "system", content: "Be helpful" }],
				temperature: 0.5,
				max_tokens: 1024,
				top_p: 0.9,
			});
			expect(result.temperature).toBe(0.5);
			expect(result.max_tokens).toBe(1024);
			expect(result.top_p).toBe(0.9);
		});

		it("should reject empty messages array", () => {
			expect(() =>
				ChatCompletionInputSchema.parse({
					model: "test",
					messages: [],
				}),
			).toThrow();
		});

		it("should reject temperature out of range", () => {
			expect(() =>
				ChatCompletionInputSchema.parse({
					model: "test",
					messages: [{ role: "user", content: "Hi" }],
					temperature: 3,
				}),
			).toThrow();
		});

		it("should reject negative max_tokens", () => {
			expect(() =>
				ChatCompletionInputSchema.parse({
					model: "test",
					messages: [{ role: "user", content: "Hi" }],
					max_tokens: -1,
				}),
			).toThrow();
		});

		it("should reject top_p out of range", () => {
			expect(() =>
				ChatCompletionInputSchema.parse({
					model: "test",
					messages: [{ role: "user", content: "Hi" }],
					top_p: 1.5,
				}),
			).toThrow();
		});
	});

	describe("CreateEmbeddingInputSchema", () => {
		it("should validate with string input", () => {
			const result = CreateEmbeddingInputSchema.parse({
				model: "sentence-transformers/all-MiniLM-L6-v2",
				input: "Hello world",
			});
			expect(result.input).toBe("Hello world");
			expect(result.region).toBe("fr-par");
		});

		it("should validate with array input", () => {
			const result = CreateEmbeddingInputSchema.parse({
				model: "sentence-transformers/all-MiniLM-L6-v2",
				input: ["Hello", "World"],
			});
			expect(result.input).toEqual(["Hello", "World"]);
		});

		it("should reject missing model", () => {
			expect(() => CreateEmbeddingInputSchema.parse({ input: "Hello" })).toThrow();
		});

		it("should reject missing input", () => {
			expect(() => CreateEmbeddingInputSchema.parse({ model: "test" })).toThrow();
		});
	});
});
