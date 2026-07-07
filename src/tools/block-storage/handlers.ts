import { urlParams } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateSnapshotParams,
	CreateVolumeParams,
	DeleteSnapshotParams,
	DeleteVolumeParams,
	GetSnapshotParams,
	GetVolumeParams,
	ListSnapshotsParams,
	ListVolumeTypesParams,
	ListVolumesParams,
	UpdateSnapshotParams,
	UpdateVolumeParams,
} from "./types.js";

const BLOCK_API = "block/v1";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function resolveZone(zone?: string): string {
	const config = loadAuthConfig();
	return zone ?? config.defaultZone;
}

function blockPath(zone: string, path: string): string {
	return `/${BLOCK_API}/zones/${zone}/${path}`;
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Volume Handlers ---

export async function listVolumes(params: ListVolumesParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		const response = await client.fetch<{
			volumes: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: blockPath(zone, "volumes"),
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["organization_id", params.organizationId],
				["name", params.name],
				["order_by", params.orderBy],
				["tags", params.tags],
				["product_resource_id", params.productResourceId],
				["volume_type", params.volumeType],
				["include_deleted", params.includeDeleted],
			),
		});

		return jsonResponse(
			buildPaginatedResponse(response.volumes, response.total_count, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function getVolume(params: GetVolumeParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		const response = await client.fetch<unknown>({
			method: "GET",
			path: blockPath(zone, `volumes/${params.volumeId}`),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function createVolume(params: CreateVolumeParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const body: Record<string, unknown> = {
			name: params.name,
			project_id: params.projectId ?? config.defaultProjectId,
		};
		if (params.perfIops !== undefined) body.perf_iops = params.perfIops;
		if (params.fromEmpty) {
			body.from_empty = { size: params.fromEmpty.size };
		}
		if (params.fromSnapshot) {
			body.from_snapshot = {
				snapshot_id: params.fromSnapshot.snapshotId,
				...(params.fromSnapshot.size !== undefined ? { size: params.fromSnapshot.size } : {}),
			};
		}
		if (params.tags) body.tags = params.tags;
		if (params.kmsKeyId !== undefined) body.kms_key_id = params.kmsKeyId;

		const response = await client.fetch<unknown>({
			method: "POST",
			path: blockPath(zone, "volumes"),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function updateVolume(params: UpdateVolumeParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		if (params.size !== undefined) body.size = params.size;
		if (params.perfIops !== undefined) body.perf_iops = params.perfIops;
		if (params.tags !== undefined) body.tags = params.tags;

		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: blockPath(zone, `volumes/${params.volumeId}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function deleteVolume(params: DeleteVolumeParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		await client.fetch<void>({
			method: "DELETE",
			path: blockPath(zone, `volumes/${params.volumeId}`),
		});
		return jsonResponse({ success: true, volumeId: params.volumeId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Snapshot Handlers ---

export async function listSnapshots(params: ListSnapshotsParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		const response = await client.fetch<{
			snapshots: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: blockPath(zone, "snapshots"),
			urlParams: urlParams(
				["page", params.page],
				["page_size", params.pageSize],
				["project_id", params.projectId],
				["organization_id", params.organizationId],
				["name", params.name],
				["order_by", params.orderBy],
				["volume_id", params.volumeId],
				["tags", params.tags],
				["include_deleted", params.includeDeleted],
			),
		});

		return jsonResponse(
			buildPaginatedResponse(
				response.snapshots,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function getSnapshot(params: GetSnapshotParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		const response = await client.fetch<unknown>({
			method: "GET",
			path: blockPath(zone, `snapshots/${params.snapshotId}`),
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function createSnapshot(params: CreateSnapshotParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const body: Record<string, unknown> = {
			name: params.name,
			project_id: params.projectId ?? config.defaultProjectId,
			volume_id: params.volumeId,
		};
		if (params.tags) body.tags = params.tags;
		if (params.public !== undefined) body.public = params.public;

		const response = await client.fetch<unknown>({
			method: "POST",
			path: blockPath(zone, "snapshots"),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function updateSnapshot(params: UpdateSnapshotParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		if (params.tags !== undefined) body.tags = params.tags;
		if (params.public !== undefined) body.public = params.public;

		const response = await client.fetch<unknown>({
			method: "PATCH",
			path: blockPath(zone, `snapshots/${params.snapshotId}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function deleteSnapshot(params: DeleteSnapshotParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		await client.fetch<void>({
			method: "DELETE",
			path: blockPath(zone, `snapshots/${params.snapshotId}`),
		});
		return jsonResponse({ success: true, snapshotId: params.snapshotId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Volume Type Handlers ---

export async function listVolumeTypes(params: ListVolumeTypesParams) {
	try {
		const client = getClient();
		const zone = resolveZone(params.zone);

		const response = await client.fetch<{
			volume_types: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: blockPath(zone, "volume-types"),
			urlParams: urlParams(["page", params.page], ["page_size", params.pageSize]),
		});

		return jsonResponse(
			buildPaginatedResponse(
				response.volume_types,
				response.total_count,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
