import type { Client } from "@scaleway/sdk-client";
import type { z } from "zod";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import type {
	CreateNamespaceInput,
	DeleteImageInput,
	DeleteNamespaceInput,
	DeleteTagInput,
	GetImageInput,
	GetNamespaceInput,
	GetTagInput,
	ListImagesInput,
	ListNamespacesInput,
	ListTagsInput,
	UpdateImageInput,
	UpdateNamespaceInput,
} from "./types.js";

const REGISTRY_API_PREFIX = "registry/v1";

function buildPath(region: string, path: string): string {
	return `/${REGISTRY_API_PREFIX}/regions/${region}${path}`;
}

function successResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function toUrlParams(
	params: Record<string, string | number | boolean | undefined>,
): URLSearchParams {
	const urlParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			urlParams.set(key, String(value));
		}
	}
	return urlParams;
}

// --- Namespace Handlers ---

export async function handleListNamespaces(
	client: Client,
	input: z.infer<typeof ListNamespacesInput>,
) {
	try {
		const response = await client.fetch<{
			namespaces: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: buildPath(input.region, "/namespaces"),
			urlParams: toUrlParams({
				page: input.page,
				page_size: input.page_size,
				project_id: input.project_id,
				name: input.name,
				order_by: input.order_by,
			}),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetNamespace(client: Client, input: z.infer<typeof GetNamespaceInput>) {
	try {
		const response = await client.fetch<unknown>({
			method: "GET",
			path: buildPath(input.region, `/namespaces/${input.namespace_id}`),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateNamespace(
	client: Client,
	input: z.infer<typeof CreateNamespaceInput>,
) {
	try {
		const body: Record<string, unknown> = { name: input.name };
		if (input.project_id !== undefined) body.project_id = input.project_id;
		if (input.description !== undefined) body.description = input.description;
		if (input.is_public !== undefined) body.is_public = input.is_public;
		const response = await client.fetch<unknown>({
			method: "POST",
			path: buildPath(input.region, "/namespaces"),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateNamespace(
	client: Client,
	input: z.infer<typeof UpdateNamespaceInput>,
) {
	try {
		const body: Record<string, unknown> = {};
		if (input.description !== undefined) body.description = input.description;
		if (input.is_public !== undefined) body.is_public = input.is_public;
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: buildPath(input.region, `/namespaces/${input.namespace_id}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteNamespace(
	client: Client,
	input: z.infer<typeof DeleteNamespaceInput>,
) {
	try {
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: buildPath(input.region, `/namespaces/${input.namespace_id}`),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Image Handlers ---

export async function handleListImages(client: Client, input: z.infer<typeof ListImagesInput>) {
	try {
		const response = await client.fetch<{ images: unknown[]; total_count: number }>({
			method: "GET",
			path: buildPath(input.region, "/images"),
			urlParams: toUrlParams({
				page: input.page,
				page_size: input.page_size,
				namespace_id: input.namespace_id,
				name: input.name,
				order_by: input.order_by,
			}),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetImage(client: Client, input: z.infer<typeof GetImageInput>) {
	try {
		const response = await client.fetch<unknown>({
			method: "GET",
			path: buildPath(input.region, `/images/${input.image_id}`),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateImage(client: Client, input: z.infer<typeof UpdateImageInput>) {
	try {
		const body: Record<string, unknown> = {};
		if (input.visibility !== undefined) body.visibility = input.visibility;
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: buildPath(input.region, `/images/${input.image_id}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteImage(client: Client, input: z.infer<typeof DeleteImageInput>) {
	try {
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: buildPath(input.region, `/images/${input.image_id}`),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Tag Handlers ---

export async function handleListTags(client: Client, input: z.infer<typeof ListTagsInput>) {
	try {
		const response = await client.fetch<{ tags: unknown[]; total_count: number }>({
			method: "GET",
			path: buildPath(input.region, `/images/${input.image_id}/tags`),
			urlParams: toUrlParams({
				page: input.page,
				page_size: input.page_size,
				name: input.name,
				order_by: input.order_by,
			}),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetTag(client: Client, input: z.infer<typeof GetTagInput>) {
	try {
		const response = await client.fetch<unknown>({
			method: "GET",
			path: buildPath(input.region, `/tags/${input.tag_id}`),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteTag(client: Client, input: z.infer<typeof DeleteTagInput>) {
	try {
		const response = await client.fetch<unknown>({
			method: "DELETE",
			path: buildPath(input.region, `/tags/${input.tag_id}`),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
