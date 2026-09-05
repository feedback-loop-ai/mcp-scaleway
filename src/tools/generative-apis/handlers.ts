import { loadAuthConfig } from "../../shared/auth.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { guardedFetch } from "../../shared/route-guard.js";
import {
	type ChatCompletionInput,
	type ChatCompletionResponse,
	type CreateEmbeddingInput,
	type EmbeddingResponse,
	GENERATIVE_APIS_BASE_URL,
	type GetModelInput,
	type ListModelsInput,
	type ListModelsResponse,
	type Model,
} from "./types.js";

function buildHeaders(): Record<string, string> {
	const config = loadAuthConfig();
	return {
		Authorization: `Bearer ${config.secretKey}`,
		"Content-Type": "application/json",
	};
}

function buildBaseUrl(region: string): string {
	return `${GENERATIVE_APIS_BASE_URL}/${region}`;
}

export async function handleListModels(input: ListModelsInput) {
	try {
		const baseUrl = buildBaseUrl(input.region);
		const response = await guardedFetch(`${baseUrl}/v1/models`, {
			method: "GET",
			headers: buildHeaders(),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw Object.assign(new Error(errorBody || response.statusText), {
				statusCode: response.status,
			});
		}

		const data = (await response.json()) as ListModelsResponse;
		return {
			content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetModel(input: GetModelInput) {
	try {
		const baseUrl = buildBaseUrl(input.region);
		const response = await guardedFetch(`${baseUrl}/v1/models`, {
			method: "GET",
			headers: buildHeaders(),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw Object.assign(new Error(errorBody || response.statusText), {
				statusCode: response.status,
			});
		}

		const data = (await response.json()) as ListModelsResponse;
		const model = data.data.find((m: Model) => m.id === input.model_id);

		if (!model) {
			throw Object.assign(new Error(`Model '${input.model_id}' not found`), {
				statusCode: 404,
			});
		}

		return {
			content: [{ type: "text" as const, text: JSON.stringify(model, null, 2) }],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleChatCompletion(input: ChatCompletionInput) {
	try {
		const baseUrl = buildBaseUrl(input.region);
		const body = {
			model: input.model,
			messages: input.messages,
			temperature: input.temperature,
			max_tokens: input.max_tokens,
			top_p: input.top_p,
			stream: false,
		};

		const response = await guardedFetch(`${baseUrl}/v1/chat/completions`, {
			method: "POST",
			headers: buildHeaders(),
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw Object.assign(new Error(errorBody || response.statusText), {
				statusCode: response.status,
			});
		}

		const data = (await response.json()) as ChatCompletionResponse;
		return {
			content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateEmbedding(input: CreateEmbeddingInput) {
	try {
		const baseUrl = buildBaseUrl(input.region);
		const body = {
			model: input.model,
			input: input.input,
		};

		const response = await guardedFetch(`${baseUrl}/v1/embeddings`, {
			method: "POST",
			headers: buildHeaders(),
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw Object.assign(new Error(errorBody || response.statusText), {
				statusCode: response.status,
			});
		}

		const data = (await response.json()) as EmbeddingResponse;
		return {
			content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
