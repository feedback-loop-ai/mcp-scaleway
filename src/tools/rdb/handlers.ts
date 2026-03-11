import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	AddAclRulesInput,
	CreateBackupInput,
	CreateDatabaseInput,
	CreateEndpointInput,
	CreateInstanceInput,
	CreateSnapshotInput,
	CreateUserInput,
	DeleteAclRulesInput,
	DeleteDatabaseInput,
	DeleteEndpointInput,
	DeleteInstanceInput,
	DeleteUserInput,
	GetInstanceInput,
	ListAclRulesInput,
	ListBackupsInput,
	ListDatabaseEnginesInput,
	ListDatabasesInput,
	ListEndpointsInput,
	ListInstancesInput,
	ListNodeTypesInput,
	ListSnapshotsInput,
	ListUsersInput,
	RestoreBackupInput,
	RestoreSnapshotInput,
	UpdateInstanceInput,
	UpdateUserInput,
	UpgradeInstanceInput,
} from "./types.js";

function getApiUrl(region: string): string {
	return `https://api.scaleway.com/rdb/v1/regions/${region}`;
}

function getConfig() {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);
	return { config, client };
}

function successResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

async function apiRequest(
	client: ReturnType<typeof createScalewayClient>,
	method: string,
	url: string,
	body?: unknown,
): Promise<unknown> {
	const response = await (client as unknown as { fetch: typeof fetch }).fetch(
		new Request(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: body ? JSON.stringify(body) : undefined,
		}),
	);
	if (!response.ok) {
		const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
		(error as unknown as { statusCode: number }).statusCode = response.status;
		throw error;
	}
	if (response.status === 204) {
		return {};
	}
	return response.json();
}

// --- Instance Handlers ---

export async function handleListInstances(input: ListInstancesInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const url = new URL(`${getApiUrl(region)}/instances`);
		const pagination = paginationToQuery(input.page ?? 1, input.pageSize ?? 50);
		url.searchParams.set("page", String(pagination.page));
		url.searchParams.set("page_size", String(pagination.page_size));
		if (input.project_id) url.searchParams.set("project_id", input.project_id);
		if (input.name) url.searchParams.set("name", input.name);
		if (input.order_by) url.searchParams.set("order_by", input.order_by);
		if (input.tags) {
			for (const tag of input.tags) {
				url.searchParams.append("tags", tag);
			}
		}
		const data = (await apiRequest(client, "GET", url.toString())) as {
			instances: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(
				data.instances,
				data.total_count,
				input.page ?? 1,
				input.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetInstance(input: GetInstanceInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"GET",
			`${getApiUrl(region)}/instances/${input.instance_id}`,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateInstance(input: CreateInstanceInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {
			project_id: input.project_id ?? config.defaultProjectId,
			name: input.name,
			engine: input.engine,
			node_type: input.node_type,
		};
		if (input.is_ha_cluster !== undefined) body.is_ha_cluster = input.is_ha_cluster;
		if (input.disable_backup !== undefined) body.disable_backup = input.disable_backup;
		if (input.volume_type) body.volume_type = input.volume_type;
		if (input.volume_size !== undefined) body.volume_size = input.volume_size;
		if (input.user_name) body.user_name = input.user_name;
		if (input.password) body.password = input.password;
		if (input.tags) body.tags = input.tags;
		if (input.backup_same_region !== undefined) body.backup_same_region = input.backup_same_region;
		if (input.init_endpoints) body.init_endpoints = input.init_endpoints;
		const data = await apiRequest(client, "POST", `${getApiUrl(region)}/instances`, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateInstance(input: UpdateInstanceInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {};
		if (input.name !== undefined) body.name = input.name;
		if (input.tags !== undefined) body.tags = input.tags;
		if (input.backup_schedule_frequency !== undefined)
			body.backup_schedule_frequency = input.backup_schedule_frequency;
		if (input.backup_schedule_retention !== undefined)
			body.backup_schedule_retention = input.backup_schedule_retention;
		if (input.is_backup_schedule_disabled !== undefined)
			body.is_backup_schedule_disabled = input.is_backup_schedule_disabled;
		if (input.backup_same_region !== undefined) body.backup_same_region = input.backup_same_region;
		const data = await apiRequest(
			client,
			"PATCH",
			`${getApiUrl(region)}/instances/${input.instance_id}`,
			body,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteInstance(input: DeleteInstanceInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"DELETE",
			`${getApiUrl(region)}/instances/${input.instance_id}`,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpgradeInstance(input: UpgradeInstanceInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {};
		if (input.node_type) body.node_type = input.node_type;
		if (input.enable_ha !== undefined) body.enable_ha = input.enable_ha;
		if (input.volume_size !== undefined) body.volume_size = input.volume_size;
		if (input.volume_type) body.volume_type = input.volume_type;
		if (input.upgradable_version_id) body.upgradable_version_id = input.upgradable_version_id;
		if (input.major_upgrade_workflow) body.major_upgrade_workflow = input.major_upgrade_workflow;
		const data = await apiRequest(
			client,
			"POST",
			`${getApiUrl(region)}/instances/${input.instance_id}/upgrade`,
			body,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Database Handlers ---

export async function handleListDatabases(input: ListDatabasesInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const url = new URL(`${getApiUrl(region)}/instances/${input.instance_id}/databases`);
		const pagination = paginationToQuery(input.page ?? 1, input.pageSize ?? 50);
		url.searchParams.set("page", String(pagination.page));
		url.searchParams.set("page_size", String(pagination.page_size));
		if (input.name) url.searchParams.set("name", input.name);
		if (input.managed !== undefined) url.searchParams.set("managed", String(input.managed));
		if (input.owner) url.searchParams.set("owner", input.owner);
		if (input.order_by) url.searchParams.set("order_by", input.order_by);
		const data = (await apiRequest(client, "GET", url.toString())) as {
			databases: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(
				data.databases,
				data.total_count,
				input.page ?? 1,
				input.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDatabase(input: CreateDatabaseInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"POST",
			`${getApiUrl(region)}/instances/${input.instance_id}/databases`,
			{ name: input.name },
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDatabase(input: DeleteDatabaseInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"DELETE",
			`${getApiUrl(region)}/instances/${input.instance_id}/databases/${input.name}`,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- User Handlers ---

export async function handleListUsers(input: ListUsersInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const url = new URL(`${getApiUrl(region)}/instances/${input.instance_id}/users`);
		const pagination = paginationToQuery(input.page ?? 1, input.pageSize ?? 50);
		url.searchParams.set("page", String(pagination.page));
		url.searchParams.set("page_size", String(pagination.page_size));
		if (input.name) url.searchParams.set("name", input.name);
		if (input.order_by) url.searchParams.set("order_by", input.order_by);
		const data = (await apiRequest(client, "GET", url.toString())) as {
			users: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(data.users, data.total_count, input.page ?? 1, input.pageSize ?? 50),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateUser(input: CreateUserInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {
			name: input.name,
			password: input.password,
		};
		if (input.is_admin !== undefined) body.is_admin = input.is_admin;
		const data = await apiRequest(
			client,
			"POST",
			`${getApiUrl(region)}/instances/${input.instance_id}/users`,
			body,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateUser(input: UpdateUserInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {};
		if (input.password !== undefined) body.password = input.password;
		if (input.is_admin !== undefined) body.is_admin = input.is_admin;
		const data = await apiRequest(
			client,
			"PATCH",
			`${getApiUrl(region)}/instances/${input.instance_id}/users/${input.name}`,
			body,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteUser(input: DeleteUserInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"DELETE",
			`${getApiUrl(region)}/instances/${input.instance_id}/users/${input.name}`,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Backup Handlers ---

export async function handleListBackups(input: ListBackupsInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const url = new URL(`${getApiUrl(region)}/backups`);
		const pagination = paginationToQuery(input.page ?? 1, input.pageSize ?? 50);
		url.searchParams.set("page", String(pagination.page));
		url.searchParams.set("page_size", String(pagination.page_size));
		if (input.instance_id) url.searchParams.set("instance_id", input.instance_id);
		if (input.name) url.searchParams.set("name", input.name);
		if (input.order_by) url.searchParams.set("order_by", input.order_by);
		if (input.project_id) url.searchParams.set("project_id", input.project_id);
		const data = (await apiRequest(client, "GET", url.toString())) as {
			database_backups: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(
				data.database_backups,
				data.total_count,
				input.page ?? 1,
				input.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateBackup(input: CreateBackupInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {
			instance_id: input.instance_id,
			name: input.name,
		};
		if (input.database_name) body.database_name = input.database_name;
		if (input.expires_at) body.expires_at = input.expires_at;
		const data = await apiRequest(client, "POST", `${getApiUrl(region)}/backups`, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRestoreBackup(input: RestoreBackupInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {
			instance_id: input.instance_id,
		};
		if (input.database_name) body.database_name = input.database_name;
		const data = await apiRequest(
			client,
			"POST",
			`${getApiUrl(region)}/backups/${input.backup_id}/restore`,
			body,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Endpoint Handlers ---

export async function handleListEndpoints(input: ListEndpointsInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = (await apiRequest(
			client,
			"GET",
			`${getApiUrl(region)}/instances/${input.instance_id}`,
		)) as { endpoints?: unknown[] };
		return successResponse({ endpoints: data.endpoints ?? [] });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateEndpoint(input: CreateEndpointInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"POST",
			`${getApiUrl(region)}/instances/${input.instance_id}/endpoints`,
			{ endpoint_spec: input.endpoint_spec },
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteEndpoint(input: DeleteEndpointInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"DELETE",
			`${getApiUrl(region)}/endpoints/${input.endpoint_id}`,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- ACL Handlers ---

export async function handleListAclRules(input: ListAclRulesInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const url = new URL(`${getApiUrl(region)}/instances/${input.instance_id}/acls`);
		const pagination = paginationToQuery(input.page ?? 1, input.pageSize ?? 50);
		url.searchParams.set("page", String(pagination.page));
		url.searchParams.set("page_size", String(pagination.page_size));
		const data = (await apiRequest(client, "GET", url.toString())) as {
			rules: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(data.rules, data.total_count, input.page ?? 1, input.pageSize ?? 50),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleAddAclRules(input: AddAclRulesInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"POST",
			`${getApiUrl(region)}/instances/${input.instance_id}/acls`,
			{ rules: input.rules },
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteAclRules(input: DeleteAclRulesInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const data = await apiRequest(
			client,
			"DELETE",
			`${getApiUrl(region)}/instances/${input.instance_id}/acls`,
			{ acl_rule_ips: input.acl_rule_ips },
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Snapshot Handlers ---

export async function handleListSnapshots(input: ListSnapshotsInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const url = new URL(`${getApiUrl(region)}/snapshots`);
		const pagination = paginationToQuery(input.page ?? 1, input.pageSize ?? 50);
		url.searchParams.set("page", String(pagination.page));
		url.searchParams.set("page_size", String(pagination.page_size));
		if (input.instance_id) url.searchParams.set("instance_id", input.instance_id);
		if (input.name) url.searchParams.set("name", input.name);
		if (input.order_by) url.searchParams.set("order_by", input.order_by);
		if (input.project_id) url.searchParams.set("project_id", input.project_id);
		const data = (await apiRequest(client, "GET", url.toString())) as {
			snapshots: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(
				data.snapshots,
				data.total_count,
				input.page ?? 1,
				input.pageSize ?? 50,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSnapshot(input: CreateSnapshotInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {
			instance_id: input.instance_id,
			name: input.name,
		};
		if (input.expires_at) body.expires_at = input.expires_at;
		const data = await apiRequest(client, "POST", `${getApiUrl(region)}/snapshots`, body);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRestoreSnapshot(input: RestoreSnapshotInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const body: Record<string, unknown> = {
			instance_name: input.instance_name,
		};
		if (input.node_type) body.node_type = input.node_type;
		if (input.is_ha_cluster !== undefined) body.is_ha_cluster = input.is_ha_cluster;
		const data = await apiRequest(
			client,
			"POST",
			`${getApiUrl(region)}/snapshots/${input.snapshot_id}/create-instance-from-snapshot`,
			body,
		);
		return successResponse(data);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Reference Handlers ---

export async function handleListNodeTypes(input: ListNodeTypesInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const url = new URL(`${getApiUrl(region)}/node-types`);
		if (input.include_disabled_types !== undefined)
			url.searchParams.set("include_disabled_types", String(input.include_disabled_types));
		const data = (await apiRequest(client, "GET", url.toString())) as {
			node_types: unknown[];
			total_count: number;
		};
		return successResponse({
			node_types: data.node_types,
			total_count: data.total_count,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListDatabaseEngines(input: ListDatabaseEnginesInput) {
	try {
		const { config, client } = getConfig();
		const region = input.region ?? config.defaultRegion;
		const url = new URL(`${getApiUrl(region)}/database-engines`);
		if (input.name) url.searchParams.set("name", input.name);
		if (input.version) url.searchParams.set("version", input.version);
		const data = (await apiRequest(client, "GET", url.toString())) as {
			engines: unknown[];
			total_count: number;
		};
		return successResponse({
			engines: data.engines,
			total_count: data.total_count,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
