import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// ── Database statuses ───────────────────────────────────────────────────────
export const DatabaseStatus = z.enum([
	"unknown_status",
	"error",
	"creating",
	"ready",
	"deleting",
	"restoring",
	"locked",
]);
export type DatabaseStatus = z.infer<typeof DatabaseStatus>;

// ── Database backup statuses ────────────────────────────────────────────────
export const DatabaseBackupStatus = z.enum(["unknown_status", "error", "ready", "locked"]);
export type DatabaseBackupStatus = z.infer<typeof DatabaseBackupStatus>;

// ── Order-by enums ──────────────────────────────────────────────────────────
export const ListDatabasesOrderBy = z
	.enum(["created_at_asc", "created_at_desc", "name_asc", "name_desc"])
	.optional()
	.default("created_at_asc");

export const ListDatabaseBackupsOrderBy = z
	.enum(["created_at_asc", "created_at_desc"])
	.optional()
	.default("created_at_asc");

// ── Database entity ─────────────────────────────────────────────────────────
export const Database = z.object({
	id: z.string().uuid(),
	name: z.string(),
	status: DatabaseStatus,
	endpoint: z.string(),
	organization_id: z.string().uuid(),
	project_id: z.string().uuid(),
	region: z.string(),
	created_at: z.string(),
	cpu_min: z.number().int(),
	cpu_max: z.number().int(),
	cpu_current: z.number().int(),
	started: z.boolean(),
	engine_major_version: z.number().int(),
});
export type Database = z.infer<typeof Database>;

// ── Database backup entity ──────────────────────────────────────────────────
export const DatabaseBackup = z.object({
	id: z.string().uuid(),
	status: DatabaseBackupStatus,
	organization_id: z.string().uuid(),
	project_id: z.string().uuid(),
	database_id: z.string().uuid(),
	created_at: z.string(),
	expires_at: z.string().optional(),
	size: z.number().int().optional(),
	db_size: z.number().int().optional(),
	download_url: z.string().optional(),
	download_url_expires_at: z.string().optional(),
	region: z.string(),
});
export type DatabaseBackup = z.infer<typeof DatabaseBackup>;

// ── Tool input schemas ──────────────────────────────────────────────────────

export const ListDatabasesInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	organization_id: z.string().uuid().optional().describe("Filter by organization ID"),
	name: z.string().optional().describe("Filter by database name"),
	order_by: ListDatabasesOrderBy.describe(
		"Sort order: created_at_asc, created_at_desc, name_asc, name_desc",
	),
});
export type ListDatabasesInput = z.infer<typeof ListDatabasesInput>;

export const GetDatabaseInput = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	database_id: z.string().uuid().describe("Database ID"),
});
export type GetDatabaseInput = z.infer<typeof GetDatabaseInput>;

export const CreateDatabaseInput = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	name: z.string().min(1).describe("Database name"),
	cpu_min: z.number().int().min(0).describe("Minimum vCPU allocation"),
	cpu_max: z.number().int().min(0).describe("Maximum vCPU allocation"),
	from_backup_id: z.string().uuid().optional().describe("Backup ID to restore from on creation"),
});
export type CreateDatabaseInput = z.infer<typeof CreateDatabaseInput>;

export const UpdateDatabaseInput = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	database_id: z.string().uuid().describe("Database ID"),
	cpu_min: z.number().int().min(0).optional().describe("Minimum vCPU allocation"),
	cpu_max: z.number().int().min(0).optional().describe("Maximum vCPU allocation"),
});
export type UpdateDatabaseInput = z.infer<typeof UpdateDatabaseInput>;

export const DeleteDatabaseInput = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	database_id: z.string().uuid().describe("Database ID"),
});
export type DeleteDatabaseInput = z.infer<typeof DeleteDatabaseInput>;

export const ListDatabaseBackupsInput = PaginationParams.extend({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	database_id: z.string().uuid().describe("Database ID to list backups for"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	organization_id: z.string().uuid().optional().describe("Filter by organization ID"),
	order_by: ListDatabaseBackupsOrderBy.describe("Sort order: created_at_asc, created_at_desc"),
});
export type ListDatabaseBackupsInput = z.infer<typeof ListDatabaseBackupsInput>;

export const GetDatabaseBackupInput = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	backup_id: z.string().uuid().describe("Backup ID"),
});
export type GetDatabaseBackupInput = z.infer<typeof GetDatabaseBackupInput>;

export const ExportDatabaseBackupInput = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	backup_id: z.string().uuid().describe("Backup ID to export"),
});
export type ExportDatabaseBackupInput = z.infer<typeof ExportDatabaseBackupInput>;

export const RestoreDatabaseInput = z.object({
	region: ScalewayRegion.optional().describe("Region (e.g., fr-par)"),
	database_id: z.string().uuid().describe("Database ID to restore into"),
	backup_id: z.string().uuid().describe("Backup ID to restore from"),
});
export type RestoreDatabaseInput = z.infer<typeof RestoreDatabaseInput>;
