import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
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

const BLOCK_STORAGE_API = "block/v1alpha1";

function getBlockStorageUrl(zone: string, path: string): string {
	return `/${BLOCK_STORAGE_API}/zones/${zone}/${path}`;
}

function resolveZone(zone?: string): string {
	const config = loadAuthConfig();
	return zone ?? config.defaultZone;
}

function toUrlParams(params: Record<string, unknown>): URLSearchParams {
	const urlParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			urlParams.set(key, String(value));
		}
	}
	return urlParams;
}

// --- Volume Handlers ---

export async function listVolumes(params: ListVolumesParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const queryObj: Record<string, unknown> = {
			...paginationToQuery(params.page, params.pageSize),
		};
		if (params.projectId) queryObj.project_id = params.projectId;
		if (params.name) queryObj.name = params.name;
		if (params.status) queryObj.status = params.status;

		const response = (await client.fetch(
			{
				method: "GET",
				path: getBlockStorageUrl(zone, "volumes"),
				urlParams: toUrlParams(queryObj),
			},
			/* unmarshal */ undefined,
		)) as { volumes: unknown[]; total_count: number };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(
						buildPaginatedResponse(
							response.volumes,
							response.total_count,
							params.page,
							params.pageSize,
						),
						null,
						2,
					),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function getVolume(params: GetVolumeParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const response = (await client.fetch(
			{
				method: "GET",
				path: getBlockStorageUrl(zone, `volumes/${params.volumeId}`),
			},
			undefined,
		)) as { volume: unknown };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response.volume, null, 2),
				},
			],
		};
	} catch (error: unknown) {
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
		if (params.fromEmpty) {
			body.from_empty = { size: params.fromEmpty.size };
		}
		if (params.fromSnapshot) {
			body.from_snapshot = {
				snapshot_id: params.fromSnapshot.snapshotId,
				...(params.fromSnapshot.size !== undefined ? { size: params.fromSnapshot.size } : {}),
			};
		}
		if (params.perfIops !== undefined) body.perf_iops = params.perfIops;
		if (params.tags) body.tags = params.tags;

		const response = (await client.fetch(
			{
				method: "POST",
				path: getBlockStorageUrl(zone, "volumes"),
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			},
			undefined,
		)) as { volume: unknown };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response.volume, null, 2),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function updateVolume(params: UpdateVolumeParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		if (params.size !== undefined) body.size = params.size;
		if (params.perfIops !== undefined) body.perf_iops = params.perfIops;
		if (params.tags !== undefined) body.tags = params.tags;

		const response = (await client.fetch(
			{
				method: "PATCH",
				path: getBlockStorageUrl(zone, `volumes/${params.volumeId}`),
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			},
			undefined,
		)) as { volume: unknown };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response.volume, null, 2),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function deleteVolume(params: DeleteVolumeParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		await client.fetch(
			{
				method: "DELETE",
				path: getBlockStorageUrl(zone, `volumes/${params.volumeId}`),
			},
			undefined,
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify({ success: true, volumeId: params.volumeId }, null, 2),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Snapshot Handlers ---

export async function listSnapshots(params: ListSnapshotsParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const queryObj: Record<string, unknown> = {
			...paginationToQuery(params.page, params.pageSize),
		};
		if (params.projectId) queryObj.project_id = params.projectId;
		if (params.name) queryObj.name = params.name;
		if (params.volumeId) queryObj.volume_id = params.volumeId;
		if (params.status) queryObj.status = params.status;

		const response = (await client.fetch(
			{
				method: "GET",
				path: getBlockStorageUrl(zone, "snapshots"),
				urlParams: toUrlParams(queryObj),
			},
			undefined,
		)) as { snapshots: unknown[]; total_count: number };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(
						buildPaginatedResponse(
							response.snapshots,
							response.total_count,
							params.page,
							params.pageSize,
						),
						null,
						2,
					),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function getSnapshot(params: GetSnapshotParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const response = (await client.fetch(
			{
				method: "GET",
				path: getBlockStorageUrl(zone, `snapshots/${params.snapshotId}`),
			},
			undefined,
		)) as { snapshot: unknown };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response.snapshot, null, 2),
				},
			],
		};
	} catch (error: unknown) {
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

		const response = (await client.fetch(
			{
				method: "POST",
				path: getBlockStorageUrl(zone, "snapshots"),
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			},
			undefined,
		)) as { snapshot: unknown };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response.snapshot, null, 2),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function updateSnapshot(params: UpdateSnapshotParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		if (params.tags !== undefined) body.tags = params.tags;

		const response = (await client.fetch(
			{
				method: "PATCH",
				path: getBlockStorageUrl(zone, `snapshots/${params.snapshotId}`),
				body: JSON.stringify(body),
				headers: { "Content-Type": "application/json" },
			},
			undefined,
		)) as { snapshot: unknown };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(response.snapshot, null, 2),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function deleteSnapshot(params: DeleteSnapshotParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		await client.fetch(
			{
				method: "DELETE",
				path: getBlockStorageUrl(zone, `snapshots/${params.snapshotId}`),
			},
			undefined,
		);

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify({ success: true, snapshotId: params.snapshotId }, null, 2),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Volume Type Handlers ---

export async function listVolumeTypes(params: ListVolumeTypesParams) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const zone = resolveZone(params.zone);

		const queryObj: Record<string, unknown> = {
			...paginationToQuery(params.page, params.pageSize),
		};

		const response = (await client.fetch(
			{
				method: "GET",
				path: getBlockStorageUrl(zone, "volume-types"),
				urlParams: toUrlParams(queryObj),
			},
			undefined,
		)) as { volume_types: unknown[]; total_count: number };

		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(
						buildPaginatedResponse(
							response.volume_types,
							response.total_count,
							params.page,
							params.pageSize,
						),
						null,
						2,
					),
				},
			],
		};
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
