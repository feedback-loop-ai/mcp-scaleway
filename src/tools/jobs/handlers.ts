import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateJobDefinitionInput,
	DeleteJobDefinitionInput,
	GetJobDefinitionInput,
	GetJobRunInput,
	ListJobDefinitionsInput,
	ListJobRunsInput,
	StartJobInput,
	StopJobRunInput,
	UpdateJobDefinitionInput,
} from "./types.js";

const JOBS_API_VERSION = "v1alpha2";

function buildJobsUrl(region: string, path: string): string {
	return `/serverless-jobs/${JOBS_API_VERSION}/regions/${region}/${path}`;
}

function getRegion(inputRegion?: string): string {
	const config = loadAuthConfig();
	return inputRegion ?? config.defaultRegion;
}

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
}

// ── Job Definitions ────────────────────────────────────────────────────────────

export async function handleListJobDefinitions(input: ListJobDefinitionsInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		const pagination = paginationToQuery(input.page, input.pageSize);
		const params: Record<string, string | number> = { ...pagination };
		if (input.project_id) {
			params.project_id = input.project_id;
		}
		const queryString = new URLSearchParams(
			Object.entries(params).map(([k, v]) => [k, String(v)]),
		).toString();
		const response = (await client.fetch({
			method: "GET",
			path: `${buildJobsUrl(region, "job-definitions")}?${queryString}`,
		})) as { job_definitions: unknown[]; total_count: number };
		const result = buildPaginatedResponse(
			response.job_definitions,
			response.total_count,
			input.page,
			input.pageSize,
		);
		return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetJobDefinition(input: GetJobDefinitionInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		const response = await client.fetch({
			method: "GET",
			path: buildJobsUrl(region, `job-definitions/${input.job_definition_id}`),
		});
		return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateJobDefinition(input: CreateJobDefinitionInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		const body: Record<string, unknown> = {
			name: input.name,
			cpu_limit: input.cpu_limit,
			memory_limit: input.memory_limit,
			image_uri: input.image_uri,
		};
		if (input.command !== undefined) body.command = input.command;
		if (input.description !== undefined) body.description = input.description;
		if (input.environment_variables !== undefined)
			body.environment_variables = input.environment_variables;
		if (input.job_timeout !== undefined) body.job_timeout = input.job_timeout;
		if (input.project_id !== undefined) body.project_id = input.project_id;
		if (input.cron_schedule !== undefined) body.cron_schedule = input.cron_schedule;
		const response = await client.fetch({
			method: "POST",
			path: buildJobsUrl(region, "job-definitions"),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateJobDefinition(input: UpdateJobDefinitionInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (input.name !== undefined) body.name = input.name;
		if (input.cpu_limit !== undefined) body.cpu_limit = input.cpu_limit;
		if (input.memory_limit !== undefined) body.memory_limit = input.memory_limit;
		if (input.image_uri !== undefined) body.image_uri = input.image_uri;
		if (input.command !== undefined) body.command = input.command;
		if (input.description !== undefined) body.description = input.description;
		if (input.environment_variables !== undefined)
			body.environment_variables = input.environment_variables;
		if (input.job_timeout !== undefined) body.job_timeout = input.job_timeout;
		if (input.cron_schedule !== undefined) body.cron_schedule = input.cron_schedule;
		const response = await client.fetch({
			method: "PATCH",
			path: buildJobsUrl(region, `job-definitions/${input.job_definition_id}`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteJobDefinition(input: DeleteJobDefinitionInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		await client.fetch({
			method: "DELETE",
			path: buildJobsUrl(region, `job-definitions/${input.job_definition_id}`),
		});
		return {
			content: [
				{
					type: "text" as const,
					text: JSON.stringify(
						{ deleted: true, job_definition_id: input.job_definition_id },
						null,
						2,
					),
				},
			],
		};
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Job Runs ───────────────────────────────────────────────────────────────────

export async function handleStartJob(input: StartJobInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		const body: Record<string, unknown> = {};
		if (input.command !== undefined) body.command = input.command;
		if (input.environment_variables !== undefined)
			body.environment_variables = input.environment_variables;
		const response = await client.fetch({
			method: "POST",
			path: buildJobsUrl(region, `job-definitions/${input.job_definition_id}/start`),
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListJobRuns(input: ListJobRunsInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		const pagination = paginationToQuery(input.page, input.pageSize);
		const params: Record<string, string | number> = { ...pagination };
		if (input.job_definition_id) {
			params.job_definition_id = input.job_definition_id;
		}
		if (input.project_id) {
			params.project_id = input.project_id;
		}
		const queryString = new URLSearchParams(
			Object.entries(params).map(([k, v]) => [k, String(v)]),
		).toString();
		const response = (await client.fetch({
			method: "GET",
			path: `${buildJobsUrl(region, "job-runs")}?${queryString}`,
		})) as { job_runs: unknown[]; total_count: number };
		const result = buildPaginatedResponse(
			response.job_runs,
			response.total_count,
			input.page,
			input.pageSize,
		);
		return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetJobRun(input: GetJobRunInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		const response = await client.fetch({
			method: "GET",
			path: buildJobsUrl(region, `job-runs/${input.job_run_id}`),
		});
		return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleStopJobRun(input: StopJobRunInput) {
	try {
		const region = getRegion(input.region);
		const client = getClient();
		const response = await client.fetch({
			method: "POST",
			path: buildJobsUrl(region, `job-runs/${input.job_run_id}/stop`),
		});
		return { content: [{ type: "text" as const, text: JSON.stringify(response, null, 2) }] };
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
