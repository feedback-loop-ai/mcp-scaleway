import type { Client } from "@scaleway/sdk-client";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateDatabaseInput,
	Database,
	DatabaseBackup,
	DeleteDatabaseInput,
	ExportDatabaseBackupInput,
	GetDatabaseBackupInput,
	GetDatabaseInput,
	ListDatabaseBackupsInput,
	ListDatabasesInput,
	RestoreDatabaseInput,
	UpdateDatabaseInput,
} from "./types.js";

const API_PREFIX = "/serverless-sqldb/v1alpha1/regions";

function getClient(): Client {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

function resolveRegion(region?: string): string {
	return region ?? process.env.SCW_DEFAULT_REGION ?? "fr-par";
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// ── Database CRUD ───────────────────────────────────────────────────────────

export async function handleListDatabases(input: ListDatabasesInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const params = new URLSearchParams();
		const pq = paginationToQuery(input.page, input.pageSize);
		params.set("page", String(pq.page));
		params.set("page_size", String(pq.page_size));
		if (input.project_id) params.set("project_id", input.project_id);
		if (input.organization_id) params.set("organization_id", input.organization_id);
		if (input.name) params.set("name", input.name);
		if (input.order_by) params.set("order_by", input.order_by);

		const response = await client.fetch<{
			databases: Database[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/${region}/databases`,
			urlParams: params,
		});

		return jsonResponse(
			buildPaginatedResponse(response.databases, response.total_count, input.page, input.pageSize),
		);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDatabase(input: GetDatabaseInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const response = await client.fetch<Database>({
			method: "GET",
			path: `${API_PREFIX}/${region}/databases/${input.database_id}`,
		});
		return jsonResponse(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDatabase(input: CreateDatabaseInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const body: Record<string, unknown> = {
			name: input.name,
			cpu_min: input.cpu_min,
			cpu_max: input.cpu_max,
		};
		if (input.project_id) body.project_id = input.project_id;
		if (input.from_backup_id) body.from_backup_id = input.from_backup_id;

		const response = await client.fetch<Database>({
			method: "POST",
			path: `${API_PREFIX}/${region}/databases`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDatabase(input: UpdateDatabaseInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const body: Record<string, unknown> = {};
		if (input.cpu_min !== undefined) body.cpu_min = input.cpu_min;
		if (input.cpu_max !== undefined) body.cpu_max = input.cpu_max;

		const response = await client.fetch<Database>({
			method: "PATCH",
			path: `${API_PREFIX}/${region}/databases/${input.database_id}`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		return jsonResponse(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDatabase(input: DeleteDatabaseInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const response = await client.fetch<Database>({
			method: "DELETE",
			path: `${API_PREFIX}/${region}/databases/${input.database_id}`,
		});
		return jsonResponse(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Backup operations ───────────────────────────────────────────────────────

export async function handleListDatabaseBackups(input: ListDatabaseBackupsInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const params = new URLSearchParams();
		const pq = paginationToQuery(input.page, input.pageSize);
		params.set("page", String(pq.page));
		params.set("page_size", String(pq.page_size));
		params.set("database_id", input.database_id);
		if (input.project_id) params.set("project_id", input.project_id);
		if (input.organization_id) params.set("organization_id", input.organization_id);
		if (input.order_by) params.set("order_by", input.order_by);

		const response = await client.fetch<{
			backups: DatabaseBackup[];
			total_count: number;
		}>({
			method: "GET",
			path: `${API_PREFIX}/${region}/backups`,
			urlParams: params,
		});

		return jsonResponse(
			buildPaginatedResponse(response.backups, response.total_count, input.page, input.pageSize),
		);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDatabaseBackup(input: GetDatabaseBackupInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const response = await client.fetch<DatabaseBackup>({
			method: "GET",
			path: `${API_PREFIX}/${region}/backups/${input.backup_id}`,
		});
		return jsonResponse(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleExportDatabaseBackup(input: ExportDatabaseBackupInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const response = await client.fetch<DatabaseBackup>({
			method: "POST",
			path: `${API_PREFIX}/${region}/backups/${input.backup_id}/export`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
		});
		return jsonResponse(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRestoreDatabase(input: RestoreDatabaseInput) {
	try {
		const client = getClient();
		const region = resolveRegion(input.region);
		const response = await client.fetch<Database>({
			method: "POST",
			path: `${API_PREFIX}/${region}/databases/${input.database_id}/restore`,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ backup_id: input.backup_id }),
		});
		return jsonResponse(response);
	} catch (error: unknown) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
