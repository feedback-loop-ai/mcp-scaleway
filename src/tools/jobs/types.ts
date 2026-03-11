import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// ── Enums ──────────────────────────────────────────────────────────────────────

export const JobRunState = z.enum([
	"unknown_state",
	"queued",
	"scheduled",
	"running",
	"succeeded",
	"failed",
	"canceled",
	"internal_error",
]);
export type JobRunState = z.infer<typeof JobRunState>;

// ── Shared fields ──────────────────────────────────────────────────────────────

const EnvironmentVariables = z
	.record(z.string())
	.optional()
	.describe("Environment variables as key-value pairs");

const CronSchedule = z
	.object({
		schedule: z.string().describe("Cron expression (e.g. '0 * * * *')"),
		timezone: z.string().optional().describe("IANA timezone (e.g. 'Europe/Paris')"),
	})
	.optional()
	.describe("Optional cron schedule for recurring execution");

// ── Tool input schemas ─────────────────────────────────────────────────────────

export const ListJobDefinitionsInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	...PaginationParams.shape,
});
export type ListJobDefinitionsInput = z.infer<typeof ListJobDefinitionsInput>;

export const GetJobDefinitionInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	job_definition_id: z.string().uuid().describe("Job definition ID"),
});
export type GetJobDefinitionInput = z.infer<typeof GetJobDefinitionInput>;

export const CreateJobDefinitionInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	name: z.string().min(1).describe("Job definition name"),
	cpu_limit: z.number().int().positive().describe("CPU limit in millicores (e.g. 1000 = 1 vCPU)"),
	memory_limit: z.number().int().positive().describe("Memory limit in MiB (e.g. 256)"),
	image_uri: z.string().min(1).describe("Container image URI"),
	command: z.string().optional().describe("Command to run"),
	description: z.string().optional().describe("Job description"),
	environment_variables: EnvironmentVariables,
	job_timeout: z.string().optional().describe("Timeout duration (e.g. '3600s')"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	cron_schedule: CronSchedule,
});
export type CreateJobDefinitionInput = z.infer<typeof CreateJobDefinitionInput>;

export const UpdateJobDefinitionInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	job_definition_id: z.string().uuid().describe("Job definition ID to update"),
	name: z.string().min(1).optional().describe("New name"),
	cpu_limit: z.number().int().positive().optional().describe("CPU limit in millicores"),
	memory_limit: z.number().int().positive().optional().describe("Memory limit in MiB"),
	image_uri: z.string().min(1).optional().describe("Container image URI"),
	command: z.string().optional().describe("Command to run"),
	description: z.string().optional().describe("Job description"),
	environment_variables: EnvironmentVariables,
	job_timeout: z.string().optional().describe("Timeout duration (e.g. '3600s')"),
	cron_schedule: CronSchedule,
});
export type UpdateJobDefinitionInput = z.infer<typeof UpdateJobDefinitionInput>;

export const DeleteJobDefinitionInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	job_definition_id: z.string().uuid().describe("Job definition ID to delete"),
});
export type DeleteJobDefinitionInput = z.infer<typeof DeleteJobDefinitionInput>;

export const StartJobInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	job_definition_id: z.string().uuid().describe("Job definition ID to start"),
	command: z.string().optional().describe("Override command"),
	environment_variables: EnvironmentVariables,
});
export type StartJobInput = z.infer<typeof StartJobInput>;

export const ListJobRunsInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	job_definition_id: z.string().uuid().optional().describe("Filter by job definition ID"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	...PaginationParams.shape,
});
export type ListJobRunsInput = z.infer<typeof ListJobRunsInput>;

export const GetJobRunInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	job_run_id: z.string().uuid().describe("Job run ID"),
});
export type GetJobRunInput = z.infer<typeof GetJobRunInput>;

export const StopJobRunInput = z.object({
	region: ScalewayRegion.optional().describe("Scaleway region (e.g. fr-par)"),
	job_run_id: z.string().uuid().describe("Job run ID to stop"),
});
export type StopJobRunInput = z.infer<typeof StopJobRunInput>;
