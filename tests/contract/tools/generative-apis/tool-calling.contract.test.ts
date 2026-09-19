/**
 * POST /{region}/v1/chat/completions, through the gateway and real route guard.
 * Spec: specs/scaleway-api/generative-apis/api-reference.md
 * Upstream: https://www.scaleway.com/en/docs/generative-apis/api-cli/using-chat-api/
 * All HTTP is intercepted; requesting a function never executes a cloud operation.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { executeOperation } from "../../../../src/gateway/index.js";
import { type OperationExtra, createOperationRegistry } from "../../../../src/gateway/registry.js";
import { ChatCompletionResponseSchema } from "../../../../src/tools/generative-apis/types.js";

vi.mock("../../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({ secretKey: "test-scaleway-key" }),
}));

const registry = createOperationRegistry();
const op = "generative_apis_chat_completion";
const http = vi.fn();
const model = "test-model";
const user = { role: "user", content: "List the servers in Paris" };
const tool = {
	type: "function",
	function: {
		name: "list_servers",
		description: "List servers in a zone",
		parameters: {
			type: "object",
			properties: { zone: { type: "string", enum: ["fr-par-1"], description: "Target zone" } },
			required: ["zone"],
			additionalProperties: false,
		},
		strict: true,
	},
};

function completion(message: object, finish_reason = "stop") {
	return {
		id: "chatcmpl-test",
		object: "chat.completion",
		created: 1,
		model,
		choices: [{ index: 0, message, finish_reason }],
		usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
	};
}

function call(params: Record<string, unknown>) {
	return executeOperation(registry, { op, params }, {} as OperationExtra, false);
}

describe("Generative APIs function calling contract", () => {
	beforeEach(() => {
		http.mockReset();
		vi.stubGlobal("fetch", http);
	});
	afterEach(() => vi.unstubAllGlobals());

	it("preserves function definitions, assistant calls, and tool results across a round trip", async () => {
		const assistant = {
			role: "assistant",
			content: null,
			tool_calls: [
				{
					id: "call_1",
					type: "function",
					function: { name: "list_servers", arguments: '{"zone":"fr-par-1"}' },
				},
			],
		};
		const response = completion(assistant, "tool_calls");
		http.mockResolvedValueOnce(Response.json(response));
		const first = await call({
			model,
			messages: [user],
			tools: [tool],
			tool_choice: "required",
			parallel_tool_calls: false,
		});
		expect(first.isError).toBeUndefined();
		const text = first.content[0];
		if (text.type !== "text") throw new Error("Expected JSON content");
		expect(ChatCompletionResponseSchema.parse(JSON.parse(text.text))).toEqual(response);
		expect(http).toHaveBeenCalledTimes(1);
		const [url, request] = http.mock.calls[0];
		expect(url).toBe("https://api.scaleway.ai/fr-par/v1/chat/completions");
		expect(request.headers.Authorization).toBe("Bearer test-scaleway-key");
		expect(JSON.parse(request.body)).toMatchObject({
			tools: [tool],
			tool_choice: "required",
			parallel_tool_calls: false,
			stream: false,
		});

		const toolResult = { role: "tool", tool_call_id: "call_1", content: '{"servers":[]}' };
		http.mockResolvedValueOnce(
			Response.json(completion({ role: "assistant", content: "No servers found." })),
		);
		const second = await call({
			model,
			messages: [user, assistant, toolResult],
			tools: [tool],
			tool_choice: "auto",
		});
		expect(second.isError).toBeUndefined();
		expect(JSON.parse(http.mock.calls[1][1].body).messages).toEqual([user, assistant, toolResult]);
		expect(http).toHaveBeenCalledTimes(2);
	});

	it("preserves a named tool choice and assistant tool calls without content", async () => {
		http.mockResolvedValueOnce(Response.json(completion({ role: "assistant", content: "Done" })));
		const assistant = {
			role: "assistant",
			tool_calls: [
				{ id: "call_1", type: "function", function: { name: "list_servers", arguments: "{}" } },
			],
		};
		const tool_choice = { type: "function", function: { name: "list_servers" } };
		await call({
			model,
			messages: [user, assistant, { role: "tool", tool_call_id: "call_1", content: "[]" }],
			tools: [tool],
			tool_choice,
		});
		expect(JSON.parse(http.mock.calls[0][1].body)).toMatchObject({
			tool_choice,
			messages: [user, assistant, { role: "tool", tool_call_id: "call_1", content: "[]" }],
		});
	});

	it("accepts assistant text with an empty tool-call list in a continued conversation", async () => {
		const assistant = { role: "assistant", content: "No function needed.", tool_calls: [] };
		http.mockResolvedValueOnce(Response.json(completion(assistant)));
		const result = await call({ model, messages: [user, assistant, user] });
		expect(result.isError).toBeUndefined();
		expect(JSON.parse(http.mock.calls[0][1].body).messages).toEqual([user, assistant, user]);
	});

	it("preserves nullable function strictness and valid names at the length boundary", async () => {
		const name = `A_0-${"a".repeat(60)}`;
		const nullableTool = { type: "function", function: { name, strict: null } };
		const tool_choice = { type: "function", function: { name } };
		http.mockResolvedValueOnce(Response.json(completion({ role: "assistant", content: "Done" })));
		const result = await call({ model, messages: [user], tools: [nullableTool], tool_choice });
		expect(result.isError).toBeUndefined();
		expect(JSON.parse(http.mock.calls[0][1].body)).toMatchObject({
			tools: [nullableTool],
			tool_choice,
		});
	});

	it("returns upstream reasoning and token breakdowns without dropping them", async () => {
		const response = {
			...completion({ role: "assistant", content: "Done", reasoning_content: "Model reasoning" }),
			usage: {
				prompt_tokens: 10,
				completion_tokens: 5,
				total_tokens: 15,
				completion_tokens_details: { reasoning_tokens: 3 },
				prompt_tokens_details: { audio_tokens: 0, cached_tokens: 2 },
			},
		};
		http.mockResolvedValueOnce(Response.json(response));
		const result = await call({ model, messages: [user], reasoning_effort: "high" });
		const text = result.content[0];
		if (text.type !== "text") throw new Error("Expected JSON content");
		expect(JSON.parse(text.text)).toEqual(response);
	});

	it.each([
		{ type: "text" },
		{ type: "json_object" },
		{
			type: "json_schema",
			json_schema: {
				name: "inventory",
				strict: true,
				schema: {
					type: "object",
					properties: { count: { type: "integer" } },
					required: ["count"],
					additionalProperties: false,
				},
			},
		},
	])(
		"passes structured output format $type without altering its JSON Schema",
		async (response_format) => {
			http.mockResolvedValueOnce(
				Response.json(completion({ role: "assistant", content: '{"count":0}' })),
			);
			await call({ model, messages: [user], response_format, reasoning_effort: "low" });
			expect(JSON.parse(http.mock.calls[0][1].body)).toMatchObject({
				response_format,
				reasoning_effort: "low",
			});
		},
	);

	it.each([
		{ messages: [{ role: "tool", content: "[]" }] },
		{ messages: [{ role: "assistant", content: null }] },
		{ messages: [{ role: "assistant", content: null, tool_calls: [] }] },
		{
			messages: [
				{
					role: "assistant",
					tool_calls: [
						{ id: "call_1", type: "function", function: { name: "list_servers", arguments: {} } },
					],
				},
			],
		},
		{ tools: [{ type: "function", function: { parameters: {} } }] },
		{ tool_choice: { type: "function", function: {} } },
		{ response_format: { type: "json_schema", json_schema: { name: "missing_schema" } } },
		{ tools: [{ type: "function", function: { name: "bad.name" } }] },
		{ tools: [{ type: "function", function: { name: "a".repeat(65) } }] },
		{ tool_choice: { type: "function", function: { name: "bad name" } } },
		{ tool_choice: { type: "function", function: { name: "a".repeat(65) } } },
	])("rejects malformed function-call input before HTTP: %j", async (invalid) => {
		const result = await call({ model, messages: [user], ...invalid });
		expect(result.isError).toBe(true);
		expect(http).not.toHaveBeenCalled();
	});
	it.each([undefined, 100])(
		"uses the current completion-token limit without also sending legacy max_tokens=%s",
		async (max_tokens) => {
			http.mockResolvedValueOnce(Response.json(completion({ role: "assistant", content: "Done" })));
			await call({ model, messages: [user], max_completion_tokens: 2048, max_tokens });
			const body = JSON.parse(http.mock.calls[0][1].body);
			expect(body.max_completion_tokens).toBe(2048);
			expect(body).not.toHaveProperty("max_tokens");
		},
	);
	it("rejects more than the upstream limit of 128 function definitions before HTTP", async () => {
		const result = await call({
			model,
			messages: [user],
			tools: Array.from({ length: 129 }, () => tool),
		});
		expect(result.isError).toBe(true);
		expect(http).not.toHaveBeenCalled();
	});
});
