import type { Client } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import type {
	AttachIpInput,
	CreateIpInput,
	CreateSecurityGroupInput,
	CreateServerInput,
	CreateSnapshotInput,
	CreateVolumeInput,
	DeleteIpInput,
	DeleteSecurityGroupInput,
	DeleteServerInput,
	DeleteSnapshotInput,
	DeleteVolumeInput,
	GetSecurityGroupInput,
	GetServerInput,
	GetVolumeInput,
	ListIpsInput,
	ListSecurityGroupsInput,
	ListServersInput,
	ListSnapshotsInput,
	ListVolumesInput,
	ServerActionInput,
} from "./types.js";

function getClient(): Client {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function basePath(zone: string): string {
	return `/instance/v1/zones/${zone}`;
}

function successResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function buildParams(
	params: Record<string, string | number | boolean | string[] | undefined>,
): URLSearchParams {
	const urlParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined) continue;
		if (Array.isArray(value)) {
			for (const v of value) {
				urlParams.append(key, v);
			}
		} else {
			urlParams.set(key, String(value));
		}
	}
	return urlParams;
}

// ── Server Handlers ──

export async function handleListServers(input: ListServersInput) {
	try {
		const client = getClient();
		const params = buildParams({
			page: input.page,
			page_size: input.page_size,
			project: input.project,
			name: input.name,
			tags: input.tags,
			state: input.state,
		});
		const response = await client.fetch<{ servers: unknown[]; total_count: number }>({
			method: "GET",
			path: `${basePath(input.zone)}/servers`,
			urlParams: params,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetServer(input: GetServerInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{ server: unknown }>({
			method: "GET",
			path: `${basePath(input.zone)}/servers/${input.server_id}`,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateServer(input: CreateServerInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: input.name,
			commercial_type: input.commercial_type,
			image: input.image,
		};
		if (input.project !== undefined) body.project = input.project;
		if (input.tags !== undefined) body.tags = input.tags;
		if (input.dynamic_ip_required !== undefined)
			body.dynamic_ip_required = input.dynamic_ip_required;

		const response = await client.fetch<{ server: unknown }>({
			method: "POST",
			path: `${basePath(input.zone)}/servers`,
			body: JSON.stringify(body),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteServer(input: DeleteServerInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${basePath(input.zone)}/servers/${input.server_id}`,
		});
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleServerAction(input: ServerActionInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{ task: unknown }>({
			method: "POST",
			path: `${basePath(input.zone)}/servers/${input.server_id}/action`,
			body: JSON.stringify({ action: input.action }),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Volume Handlers ──

export async function handleListVolumes(input: ListVolumesInput) {
	try {
		const client = getClient();
		const params = buildParams({
			page: input.page,
			page_size: input.page_size,
			name: input.name,
			volume_type: input.volume_type,
			project: input.project,
		});
		const response = await client.fetch<{ volumes: unknown[]; total_count: number }>({
			method: "GET",
			path: `${basePath(input.zone)}/volumes`,
			urlParams: params,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetVolume(input: GetVolumeInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{ volume: unknown }>({
			method: "GET",
			path: `${basePath(input.zone)}/volumes/${input.volume_id}`,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateVolume(input: CreateVolumeInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: input.name,
			size: input.size,
			volume_type: input.volume_type,
		};
		if (input.project !== undefined) body.project = input.project;
		if (input.tags !== undefined) body.tags = input.tags;

		const response = await client.fetch<{ volume: unknown }>({
			method: "POST",
			path: `${basePath(input.zone)}/volumes`,
			body: JSON.stringify(body),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteVolume(input: DeleteVolumeInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${basePath(input.zone)}/volumes/${input.volume_id}`,
		});
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Security Group Handlers ──

export async function handleListSecurityGroups(input: ListSecurityGroupsInput) {
	try {
		const client = getClient();
		const params = buildParams({
			page: input.page,
			page_size: input.page_size,
			name: input.name,
			project: input.project,
		});
		const response = await client.fetch<{
			security_groups: unknown[];
			total_count: number;
		}>({
			method: "GET",
			path: `${basePath(input.zone)}/security_groups`,
			urlParams: params,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetSecurityGroup(input: GetSecurityGroupInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{ security_group: unknown }>({
			method: "GET",
			path: `${basePath(input.zone)}/security_groups/${input.security_group_id}`,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSecurityGroup(input: CreateSecurityGroupInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: input.name,
			inbound_default_policy: input.inbound_default_policy,
			outbound_default_policy: input.outbound_default_policy,
			stateful: input.stateful,
		};
		if (input.description !== undefined) body.description = input.description;
		if (input.project !== undefined) body.project = input.project;

		const response = await client.fetch<{ security_group: unknown }>({
			method: "POST",
			path: `${basePath(input.zone)}/security_groups`,
			body: JSON.stringify(body),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteSecurityGroup(input: DeleteSecurityGroupInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${basePath(input.zone)}/security_groups/${input.security_group_id}`,
		});
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── IP Handlers ──

export async function handleListIps(input: ListIpsInput) {
	try {
		const client = getClient();
		const params = buildParams({
			page: input.page,
			page_size: input.page_size,
			name: input.name,
			project: input.project,
			type: input.type,
		});
		const response = await client.fetch<{ ips: unknown[]; total_count: number }>({
			method: "GET",
			path: `${basePath(input.zone)}/ips`,
			urlParams: params,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateIp(input: CreateIpInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			type: input.type,
		};
		if (input.project !== undefined) body.project = input.project;
		if (input.server !== undefined) body.server = input.server;
		if (input.tags !== undefined) body.tags = input.tags;

		const response = await client.fetch<{ ip: unknown }>({
			method: "POST",
			path: `${basePath(input.zone)}/ips`,
			body: JSON.stringify(body),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteIp(input: DeleteIpInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${basePath(input.zone)}/ips/${input.ip_id}`,
		});
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleAttachIp(input: AttachIpInput) {
	try {
		const client = getClient();
		const response = await client.fetch<{ ip: unknown }>({
			method: "PATCH",
			path: `${basePath(input.zone)}/ips/${input.ip_id}`,
			body: JSON.stringify({ server: input.server_id }),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Snapshot Handlers ──

export async function handleListSnapshots(input: ListSnapshotsInput) {
	try {
		const client = getClient();
		const params = buildParams({
			page: input.page,
			page_size: input.page_size,
			name: input.name,
			project: input.project,
		});
		const response = await client.fetch<{ snapshots: unknown[]; total_count: number }>({
			method: "GET",
			path: `${basePath(input.zone)}/snapshots`,
			urlParams: params,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSnapshot(input: CreateSnapshotInput) {
	try {
		const client = getClient();
		const body: Record<string, unknown> = {
			name: input.name,
			volume_id: input.volume_id,
		};
		if (input.project !== undefined) body.project = input.project;
		if (input.tags !== undefined) body.tags = input.tags;

		const response = await client.fetch<{ snapshot: unknown }>({
			method: "POST",
			path: `${basePath(input.zone)}/snapshots`,
			body: JSON.stringify(body),
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteSnapshot(input: DeleteSnapshotInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${basePath(input.zone)}/snapshots/${input.snapshot_id}`,
		});
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
