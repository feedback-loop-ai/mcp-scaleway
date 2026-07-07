import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateInstanceParams,
	CreateSnapshotParams,
	CreateUserParams,
	DeleteInstanceParams,
	DeleteSnapshotParams,
	DeleteUserParams,
	GetInstanceParams,
	ListInstancesParams,
	ListNodeTypesParams,
	ListSnapshotsParams,
	ListUsersParams,
	ListVersionsParams,
	RestoreSnapshotParams,
	UpdateInstanceParams,
	UpdateUserParams,
} from "./types.js";

const API_BASE = "/mongodb/v1/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function resolveRegion(region?: string): string {
	return region ?? loadAuthConfig().defaultRegion;
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// --- Instance Handlers ---

export async function handleListInstances(params: ListInstancesParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const urlParams = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		urlParams.set("page", String(pagination.page));
		urlParams.set("page_size", String(pagination.page_size));
		if (params.name) urlParams.set("name", params.name);
		if (params.order_by) urlParams.set("order_by", params.order_by);
		if (params.project_id) urlParams.set("project_id", params.project_id);
		if (params.organization_id) urlParams.set("organization_id", params.organization_id);
		if (params.tags) {
			for (const tag of params.tags) {
				urlParams.append("tags", tag);
			}
		}

		const data = await client.fetch<{ instances: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_BASE}/${region}/instances`,
			urlParams,
		});
		return jsonResponse(
			buildPaginatedResponse(
				data.instances,
				data.total_count,
				params.page ?? 1,
				params.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInstance(params: GetInstanceParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const data = await client.fetch<unknown>({
			method: "GET",
			path: `${API_BASE}/${region}/instances/${params.instance_id}`,
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateInstance(params: CreateInstanceParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const body: Record<string, unknown> = {
			project_id: params.project_id ?? loadAuthConfig().defaultProjectId,
			name: params.name,
			version: params.version,
			node_type: params.node_type,
			node_amount: params.node_amount,
			user_name: params.user_name,
			password: params.password,
		};
		if (params.tags) body.tags = params.tags;
		if (params.volume) body.volume = params.volume;
		if (params.endpoints) body.endpoints = params.endpoints;

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${API_BASE}/${region}/instances`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateInstance(params: UpdateInstanceParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const body: Record<string, unknown> = {};
		if (params.name !== undefined) body.name = params.name;
		if (params.tags !== undefined) body.tags = params.tags;
		if (params.snapshot_schedule_frequency_hours !== undefined)
			body.snapshot_schedule_frequency_hours = params.snapshot_schedule_frequency_hours;
		if (params.snapshot_schedule_retention_days !== undefined)
			body.snapshot_schedule_retention_days = params.snapshot_schedule_retention_days;
		if (params.is_snapshot_schedule_enabled !== undefined)
			body.is_snapshot_schedule_enabled = params.is_snapshot_schedule_enabled;

		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_BASE}/${region}/instances/${params.instance_id}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteInstance(params: DeleteInstanceParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const data = await client.fetch<unknown>({
			method: "DELETE",
			path: `${API_BASE}/${region}/instances/${params.instance_id}`,
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- User Handlers ---

export async function handleListUsers(params: ListUsersParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const urlParams = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		urlParams.set("page", String(pagination.page));
		urlParams.set("page_size", String(pagination.page_size));
		if (params.name) urlParams.set("name", params.name);
		if (params.order_by) urlParams.set("order_by", params.order_by);

		const data = await client.fetch<{ users: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_BASE}/${region}/instances/${params.instance_id}/users`,
			urlParams,
		});
		return jsonResponse(
			buildPaginatedResponse(data.users, data.total_count, params.page ?? 1, params.pageSize ?? 50),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateUser(params: CreateUserParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const body = { name: params.name, password: params.password };

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${API_BASE}/${region}/instances/${params.instance_id}/users`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateUser(params: UpdateUserParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const body: Record<string, unknown> = {};
		if (params.password !== undefined) body.password = params.password;

		const data = await client.fetch<unknown>({
			method: "PATCH",
			path: `${API_BASE}/${region}/instances/${params.instance_id}/users/${encodeURIComponent(params.name)}`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteUser(params: DeleteUserParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		await client.fetch<void>({
			method: "DELETE",
			path: `${API_BASE}/${region}/instances/${params.instance_id}/users/${encodeURIComponent(params.name)}`,
		});
		return jsonResponse({ message: `User '${params.name}' deleted successfully` });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Snapshot Handlers ---

export async function handleListSnapshots(params: ListSnapshotsParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const urlParams = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		urlParams.set("page", String(pagination.page));
		urlParams.set("page_size", String(pagination.page_size));
		if (params.instance_id) urlParams.set("instance_id", params.instance_id);
		if (params.name) urlParams.set("name", params.name);
		if (params.order_by) urlParams.set("order_by", params.order_by);
		if (params.project_id) urlParams.set("project_id", params.project_id);
		if (params.organization_id) urlParams.set("organization_id", params.organization_id);

		const data = await client.fetch<{ snapshots: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_BASE}/${region}/snapshots`,
			urlParams,
		});
		return jsonResponse(
			buildPaginatedResponse(
				data.snapshots,
				data.total_count,
				params.page ?? 1,
				params.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSnapshot(params: CreateSnapshotParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const body: Record<string, unknown> = {
			instance_id: params.instance_id,
			name: params.name,
		};
		if (params.expires_at) body.expires_at = params.expires_at;

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${API_BASE}/${region}/snapshots`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRestoreSnapshot(params: RestoreSnapshotParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const body: Record<string, unknown> = {
			instance_name: params.instance_name,
			node_type: params.node_type,
			node_amount: params.node_amount,
		};
		if (params.volume_type) body.volume_type = params.volume_type;

		const data = await client.fetch<unknown>({
			method: "POST",
			path: `${API_BASE}/${region}/snapshots/${params.snapshot_id}/restore`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteSnapshot(params: DeleteSnapshotParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const data = await client.fetch<unknown>({
			method: "DELETE",
			path: `${API_BASE}/${region}/snapshots/${params.snapshot_id}`,
		});
		return jsonResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Node Type & Version Handlers ---

export async function handleListNodeTypes(params: ListNodeTypesParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const urlParams = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		urlParams.set("page", String(pagination.page));
		urlParams.set("page_size", String(pagination.page_size));
		if (params.include_disabled !== undefined)
			urlParams.set("include_disabled", String(params.include_disabled));

		const data = await client.fetch<{ node_types: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_BASE}/${region}/node-types`,
			urlParams,
		});
		return jsonResponse(
			buildPaginatedResponse(
				data.node_types,
				data.total_count,
				params.page ?? 1,
				params.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListVersions(params: ListVersionsParams) {
	try {
		const client = getClient();
		const region = resolveRegion(params.region);
		const urlParams = new URLSearchParams();
		const pagination = paginationToQuery(params.page ?? 1, params.pageSize ?? 50);
		urlParams.set("page", String(pagination.page));
		urlParams.set("page_size", String(pagination.page_size));
		if (params.version) urlParams.set("version", params.version);

		const data = await client.fetch<{ versions: unknown[]; total_count: number }>({
			method: "GET",
			path: `${API_BASE}/${region}/versions`,
			urlParams,
		});
		return jsonResponse(
			buildPaginatedResponse(
				data.versions,
				data.total_count,
				params.page ?? 1,
				params.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
