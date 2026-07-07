import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetClient } from "../../../src/shared/client.js";
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
} from "../../../src/tools/jobs/handlers.js";
import { registerJobsTools } from "../../../src/tools/jobs/index.js";
import {
	CreateJobDefinitionInput,
	DeleteJobDefinitionInput,
	GetJobDefinitionInput,
	GetJobRunInput,
	JobRunState,
	ListJobDefinitionsInput,
	ListJobRunsInput,
	StartJobInput,
	StopJobRunInput,
	UpdateJobDefinitionInput,
} from "../../../src/tools/jobs/types.js";

// ── Mock setup ─────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();

vi.mock("../../../src/shared/client.js", async () => {
	const actual = await vi.importActual<typeof import("../../../src/shared/client.js")>(
		"../../../src/shared/client.js",
	);
	return {
		...actual,
		createScalewayClient: vi.fn(() => ({ fetch: mockFetch })),
	};
});

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
		defaultProjectId: "00000000-0000-0000-0000-000000000000",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

const TEST_UUID = "11111111-1111-1111-1111-111111111111";
const TEST_UUID_2 = "22222222-2222-2222-2222-222222222222";

beforeEach(() => {
	mockFetch.mockReset();
});

afterEach(() => {
	resetClient();
});

// ── Registration ───────────────────────────────────────────────────────────────

describe("jobs module registration", () => {
	it("registers all 9 tools without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerJobsTools(server)).not.toThrow();
	});
});

// ── Types / Zod schemas ────────────────────────────────────────────────────────

describe("jobs types", () => {
	describe("JobRunState", () => {
		it("accepts all valid states", () => {
			for (const state of [
				"unknown_state",
				"queued",
				"scheduled",
				"running",
				"succeeded",
				"failed",
				"canceled",
				"internal_error",
			]) {
				expect(JobRunState.parse(state)).toBe(state);
			}
		});
		it("rejects invalid state", () => {
			expect(() => JobRunState.parse("bogus")).toThrow();
		});
	});

	describe("ListJobDefinitionsInput", () => {
		it("parses with defaults", () => {
			const result = ListJobDefinitionsInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
		it("accepts region and project_id", () => {
			const result = ListJobDefinitionsInput.parse({
				region: "nl-ams",
				project_id: TEST_UUID,
				page: 2,
				pageSize: 10,
			});
			expect(result.region).toBe("nl-ams");
			expect(result.project_id).toBe(TEST_UUID);
		});
		it("rejects invalid region format", () => {
			expect(() => ListJobDefinitionsInput.parse({ region: "invalid" })).toThrow();
		});
	});

	describe("GetJobDefinitionInput", () => {
		it("parses valid input", () => {
			const result = GetJobDefinitionInput.parse({ job_definition_id: TEST_UUID });
			expect(result.job_definition_id).toBe(TEST_UUID);
		});
		it("rejects missing id", () => {
			expect(() => GetJobDefinitionInput.parse({})).toThrow();
		});
		it("rejects non-uuid id", () => {
			expect(() => GetJobDefinitionInput.parse({ job_definition_id: "not-a-uuid" })).toThrow();
		});
	});

	describe("CreateJobDefinitionInput", () => {
		const validInput = {
			name: "my-job",
			cpu_limit: 1000,
			memory_limit: 256,
			image_uri: "rg.fr-par.scw.cloud/namespace/image:latest",
		};
		it("parses required fields", () => {
			const result = CreateJobDefinitionInput.parse(validInput);
			expect(result.name).toBe("my-job");
		});
		it("parses all optional fields", () => {
			const result = CreateJobDefinitionInput.parse({
				...validInput,
				command: "python main.py",
				description: "test job",
				environment_variables: { FOO: "bar" },
				job_timeout: "3600s",
				project_id: TEST_UUID,
				cron_schedule: { schedule: "0 * * * *", timezone: "Europe/Paris" },
			});
			expect(result.cron_schedule?.schedule).toBe("0 * * * *");
		});
		it("rejects empty name", () => {
			expect(() => CreateJobDefinitionInput.parse({ ...validInput, name: "" })).toThrow();
		});
		it("rejects zero cpu_limit", () => {
			expect(() => CreateJobDefinitionInput.parse({ ...validInput, cpu_limit: 0 })).toThrow();
		});
		it("rejects zero memory_limit", () => {
			expect(() => CreateJobDefinitionInput.parse({ ...validInput, memory_limit: 0 })).toThrow();
		});
	});

	describe("UpdateJobDefinitionInput", () => {
		it("parses with only required id", () => {
			const result = UpdateJobDefinitionInput.parse({ job_definition_id: TEST_UUID });
			expect(result.job_definition_id).toBe(TEST_UUID);
		});
		it("parses all optional fields", () => {
			const result = UpdateJobDefinitionInput.parse({
				job_definition_id: TEST_UUID,
				name: "updated",
				cpu_limit: 2000,
				memory_limit: 512,
				image_uri: "new-image:v2",
				command: "node index.js",
				description: "updated desc",
				environment_variables: { KEY: "value" },
				job_timeout: "7200s",
				cron_schedule: { schedule: "*/5 * * * *" },
			});
			expect(result.name).toBe("updated");
		});
	});

	describe("DeleteJobDefinitionInput", () => {
		it("parses valid input", () => {
			const result = DeleteJobDefinitionInput.parse({ job_definition_id: TEST_UUID });
			expect(result.job_definition_id).toBe(TEST_UUID);
		});
	});

	describe("StartJobInput", () => {
		it("parses with required fields", () => {
			const result = StartJobInput.parse({ job_definition_id: TEST_UUID });
			expect(result.job_definition_id).toBe(TEST_UUID);
		});
		it("parses with optional overrides", () => {
			const result = StartJobInput.parse({
				job_definition_id: TEST_UUID,
				command: "python run.py",
				environment_variables: { MODE: "test" },
			});
			expect(result.command).toBe("python run.py");
		});
	});

	describe("ListJobRunsInput", () => {
		it("parses with defaults", () => {
			const result = ListJobRunsInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
		it("accepts all filters", () => {
			const result = ListJobRunsInput.parse({
				job_definition_id: TEST_UUID,
				project_id: TEST_UUID_2,
			});
			expect(result.job_definition_id).toBe(TEST_UUID);
			expect(result.project_id).toBe(TEST_UUID_2);
		});
	});

	describe("GetJobRunInput", () => {
		it("parses valid input", () => {
			const result = GetJobRunInput.parse({ job_run_id: TEST_UUID });
			expect(result.job_run_id).toBe(TEST_UUID);
		});
	});

	describe("StopJobRunInput", () => {
		it("parses valid input", () => {
			const result = StopJobRunInput.parse({ job_run_id: TEST_UUID });
			expect(result.job_run_id).toBe(TEST_UUID);
		});
	});
});

// ── Handlers ───────────────────────────────────────────────────────────────────

describe("jobs handlers", () => {
	describe("handleListJobDefinitions", () => {
		it("returns paginated list", async () => {
			mockFetch.mockResolvedValueOnce({
				job_definitions: [{ id: TEST_UUID, name: "job-1" }],
				total_count: 1,
			});
			const result = await handleListJobDefinitions({ page: 1, pageSize: 50 });
			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }));
		});

		it("passes project_id filter", async () => {
			mockFetch.mockResolvedValueOnce({ job_definitions: [], total_count: 0 });
			await handleListJobDefinitions({ page: 1, pageSize: 10, project_id: TEST_UUID });
			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("project_id=");
		});

		it("uses custom region", async () => {
			mockFetch.mockResolvedValueOnce({ job_definitions: [], total_count: 0 });
			await handleListJobDefinitions({ page: 1, pageSize: 50, region: "nl-ams" });
			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("/regions/nl-ams/");
		});

		it("returns error on failure", async () => {
			const err = new Error("connection refused");
			mockFetch.mockRejectedValueOnce(err);
			const result = await handleListJobDefinitions({ page: 1, pageSize: 50 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleGetJobDefinition", () => {
		it("returns job definition", async () => {
			const defn = { id: TEST_UUID, name: "my-job", cpu_limit: 1000 };
			mockFetch.mockResolvedValueOnce(defn);
			const result = await handleGetJobDefinition({ job_definition_id: TEST_UUID });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe(TEST_UUID);
		});

		it("returns error on 404", async () => {
			const err = Object.assign(new Error("not found"), { statusCode: 404 });
			mockFetch.mockRejectedValueOnce(err);
			const result = await handleGetJobDefinition({ job_definition_id: TEST_UUID });
			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleCreateJobDefinition", () => {
		it("creates and returns job definition", async () => {
			const created = { id: TEST_UUID, name: "new-job" };
			mockFetch.mockResolvedValueOnce(created);
			const result = await handleCreateJobDefinition({
				name: "new-job",
				cpu_limit: 1000,
				memory_limit: 256,
				image_uri: "image:latest",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("new-job");
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "POST" }));
		});

		it("sends all optional fields in body", async () => {
			mockFetch.mockResolvedValueOnce({ id: TEST_UUID });
			await handleCreateJobDefinition({
				name: "full-job",
				cpu_limit: 2000,
				memory_limit: 512,
				image_uri: "img:v1",
				command: "run.sh",
				description: "desc",
				environment_variables: { A: "1" },
				job_timeout: "60s",
				project_id: TEST_UUID,
				cron_schedule: { schedule: "0 0 * * *" },
			});
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.command).toBe("run.sh");
			expect(body.description).toBe("desc");
			expect(body.environment_variables).toEqual({ A: "1" });
			expect(body.job_timeout).toBe("60s");
			expect(body.project_id).toBe(TEST_UUID);
			expect(body.cron_schedule.schedule).toBe("0 0 * * *");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("bad request"));
			const result = await handleCreateJobDefinition({
				name: "fail",
				cpu_limit: 1000,
				memory_limit: 256,
				image_uri: "img",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleUpdateJobDefinition", () => {
		it("updates and returns job definition", async () => {
			mockFetch.mockResolvedValueOnce({ id: TEST_UUID, name: "updated" });
			const result = await handleUpdateJobDefinition({
				job_definition_id: TEST_UUID,
				name: "updated",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("updated");
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "PATCH" }));
		});

		it("sends all optional fields", async () => {
			mockFetch.mockResolvedValueOnce({ id: TEST_UUID });
			await handleUpdateJobDefinition({
				job_definition_id: TEST_UUID,
				name: "u",
				cpu_limit: 500,
				memory_limit: 128,
				image_uri: "i:v2",
				command: "cmd",
				description: "d",
				environment_variables: { X: "Y" },
				job_timeout: "120s",
				cron_schedule: { schedule: "*/10 * * * *" },
			});
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("u");
			expect(body.cpu_limit).toBe(500);
			expect(body.memory_limit).toBe(128);
			expect(body.image_uri).toBe("i:v2");
			expect(body.command).toBe("cmd");
			expect(body.description).toBe("d");
			expect(body.environment_variables).toEqual({ X: "Y" });
			expect(body.job_timeout).toBe("120s");
			expect(body.cron_schedule.schedule).toBe("*/10 * * * *");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("forbidden"));
			const result = await handleUpdateJobDefinition({ job_definition_id: TEST_UUID });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleDeleteJobDefinition", () => {
		it("deletes and confirms", async () => {
			mockFetch.mockResolvedValueOnce(undefined);
			const result = await handleDeleteJobDefinition({ job_definition_id: TEST_UUID });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.job_definition_id).toBe(TEST_UUID);
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "DELETE" }));
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("conflict"));
			const result = await handleDeleteJobDefinition({ job_definition_id: TEST_UUID });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleStartJob", () => {
		it("starts a job run", async () => {
			const run = { id: TEST_UUID_2, state: "queued" };
			mockFetch.mockResolvedValueOnce(run);
			const result = await handleStartJob({ job_definition_id: TEST_UUID });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.state).toBe("queued");
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "POST" }));
			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("/serverless-jobs/v1alpha2/");
			expect(callPath).toContain(`/job-definitions/${TEST_UUID}/start`);
			// job_definition_id travels in the path, not the body
			const startBody = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(startBody.job_definition_id).toBeUndefined();
		});

		it("sends optional overrides", async () => {
			mockFetch.mockResolvedValueOnce({ id: TEST_UUID_2 });
			await handleStartJob({
				job_definition_id: TEST_UUID,
				command: "override.sh",
				environment_variables: { RUN: "1" },
			});
			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.command).toBe("override.sh");
			expect(body.environment_variables).toEqual({ RUN: "1" });
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("quota exceeded"));
			const result = await handleStartJob({ job_definition_id: TEST_UUID });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleListJobRuns", () => {
		it("returns paginated runs", async () => {
			mockFetch.mockResolvedValueOnce({
				job_runs: [{ id: TEST_UUID_2, state: "running" }],
				total_count: 1,
			});
			const result = await handleListJobRuns({ page: 1, pageSize: 50 });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
		});

		it("passes job_definition_id filter", async () => {
			mockFetch.mockResolvedValueOnce({ job_runs: [], total_count: 0 });
			await handleListJobRuns({ page: 1, pageSize: 50, job_definition_id: TEST_UUID });
			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("job_definition_id=");
		});

		it("passes project_id filter", async () => {
			mockFetch.mockResolvedValueOnce({ job_runs: [], total_count: 0 });
			await handleListJobRuns({ page: 1, pageSize: 50, project_id: TEST_UUID });
			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("project_id=");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("timeout"));
			const result = await handleListJobRuns({ page: 1, pageSize: 50 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleGetJobRun", () => {
		it("returns job run details", async () => {
			const run = { id: TEST_UUID_2, state: "succeeded", exit_code: 0 };
			mockFetch.mockResolvedValueOnce(run);
			const result = await handleGetJobRun({ job_run_id: TEST_UUID_2 });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.exit_code).toBe(0);
		});

		it("returns error on 404", async () => {
			const err = Object.assign(new Error("not found"), { statusCode: 404 });
			mockFetch.mockRejectedValueOnce(err);
			const result = await handleGetJobRun({ job_run_id: TEST_UUID_2 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("handleStopJobRun", () => {
		it("stops a running job", async () => {
			const run = { id: TEST_UUID_2, state: "canceled" };
			mockFetch.mockResolvedValueOnce(run);
			const result = await handleStopJobRun({ job_run_id: TEST_UUID_2 });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.state).toBe("canceled");
			expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ method: "POST" }));
			const callPath = mockFetch.mock.calls[0][0].path;
			expect(callPath).toContain("/stop");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("already stopped"));
			const result = await handleStopJobRun({ job_run_id: TEST_UUID_2 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});
});
