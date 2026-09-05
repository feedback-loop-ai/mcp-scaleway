import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateFileSystemParams,
	DeleteFileSystemParams,
	GetFileSystemParams,
	ListAttachmentsParams,
	ListFileSystemsParams,
	UpdateFileSystemParams,
} from "./types.js";

const FILE_API_PREFIX = "/file/v1alpha1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- FileSystem Handlers ---

export async function handleListFileSystems(params: ListFileSystemsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			filesystems: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${FILE_API_PREFIX}/${params.region}/filesystems`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["organization_id", params.organizationId],
				["name", params.name],
				["tags", params.tags],
				["order_by", params.orderBy],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.filesystems,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetFileSystem(params: GetFileSystemParams) {
	try {
		const client = getClient();
		const response = await client.fetch<unknown>({
			method: "GET",
			path: `${FILE_API_PREFIX}/${params.region}/filesystems/${params.filesystemId}`,
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateFileSystem(params: CreateFileSystemParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: params.name,
			size: params.size,
		};
		if (params.projectId) {
			body.project_id = params.projectId;
		}
		if (params.tags) {
			body.tags = params.tags;
		}
		const response = await client.fetch<unknown>({
			method: "POST",
			path: `${FILE_API_PREFIX}/${params.region}/filesystems`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateFileSystem(params: UpdateFileSystemParams) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (params.name !== undefined) {
			body.name = params.name;
		}
		if (params.size !== undefined) {
			body.size = params.size;
		}
		if (params.tags !== undefined) {
			body.tags = params.tags;
		}
		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: `${FILE_API_PREFIX}/${params.region}/filesystems/${params.filesystemId}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteFileSystem(params: DeleteFileSystemParams) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${FILE_API_PREFIX}/${params.region}/filesystems/${params.filesystemId}`,
		});
		return jsonResponse({ deleted: true, id: params.filesystemId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Attachment Handlers ---

export async function handleListAttachments(params: ListAttachmentsParams) {
	try {
		const client = getClient();
		const response = await client.fetch<{
			attachments: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${FILE_API_PREFIX}/${params.region}/attachments`,
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["filesystem_id", params.filesystemId],
				["resource_id", params.resourceId],
				["resource_type", params.resourceType],
				["zone", params.zone],
			),
		});
		return jsonResponse(
			buildPaginatedResponse(
				response.attachments,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
