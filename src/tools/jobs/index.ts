import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreateJobDefinition,
	handleDeleteJobDefinition,
	handleGetJobDefinition,
	handleGetJobRun,
	handleListJobDefinitions,
	handleListJobRuns,
	handleStartJob,
	handleStopJobRun,
	handleUpdateJobDefinition,
} from "./handlers.js";
import {
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

export function registerJobsTools(server: McpServer): void {
	// ── Job Definitions ─────────────────────────────────────────────────────────

	server.tool(
		"scaleway_jobs_list_definitions",
		"List serverless job definitions in a Scaleway region. Supports pagination and optional project filtering.",
		ListJobDefinitionsInput.shape,
		async (input) => handleListJobDefinitions(ListJobDefinitionsInput.parse(input)),
	);

	server.tool(
		"scaleway_jobs_get_definition",
		"Get details of a specific serverless job definition by ID.",
		GetJobDefinitionInput.shape,
		async (input) => handleGetJobDefinition(GetJobDefinitionInput.parse(input)),
	);

	server.tool(
		"scaleway_jobs_create_definition",
		"Create a new serverless job definition with image, CPU/memory limits, and optional cron schedule.",
		CreateJobDefinitionInput.shape,
		async (input) => handleCreateJobDefinition(CreateJobDefinitionInput.parse(input)),
	);

	server.tool(
		"scaleway_jobs_update_definition",
		"Update an existing serverless job definition (name, image, limits, schedule, etc.).",
		UpdateJobDefinitionInput.shape,
		async (input) => handleUpdateJobDefinition(UpdateJobDefinitionInput.parse(input)),
	);

	server.tool(
		"scaleway_jobs_delete_definition",
		"Delete a serverless job definition by ID.",
		DeleteJobDefinitionInput.shape,
		async (input) => handleDeleteJobDefinition(DeleteJobDefinitionInput.parse(input)),
	);

	// ── Job Runs ────────────────────────────────────────────────────────────────

	server.tool(
		"scaleway_jobs_start",
		"Start a new job run from an existing job definition. Optionally override command and environment variables.",
		StartJobInput.shape,
		async (input) => handleStartJob(StartJobInput.parse(input)),
	);

	server.tool(
		"scaleway_jobs_list_runs",
		"List job runs with optional filters by job definition ID or project ID. Supports pagination.",
		ListJobRunsInput.shape,
		async (input) => handleListJobRuns(ListJobRunsInput.parse(input)),
	);

	server.tool(
		"scaleway_jobs_get_run",
		"Get details of a specific job run by ID, including state, timing, and exit code.",
		GetJobRunInput.shape,
		async (input) => handleGetJobRun(GetJobRunInput.parse(input)),
	);

	server.tool(
		"scaleway_jobs_stop_run",
		"Stop a running job run by ID.",
		StopJobRunInput.shape,
		async (input) => handleStopJobRun(StopJobRunInput.parse(input)),
	);
}
