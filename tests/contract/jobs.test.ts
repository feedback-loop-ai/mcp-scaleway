/**
 * Contract tests for Scaleway Serverless Jobs API
 *
 * Validates request shapes, response shapes, pagination, auth, and error codes
 * against the Scaleway Jobs API v1alpha2.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/serverless-jobs/
 * Spec entry: specs/scaleway-api/ (jobs section)
 * Parity matrix: tests/parity-matrix.json (jobs)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetClient } from "../../src/shared/client.js";
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
} from "../../src/tools/jobs/handlers.js";

// ── Mock setup ─────────────────────────────────────────────────────────────────

const mockFetch = vi.fn();

vi.mock("../../src/shared/client.js", async () => {
	const actual = await vi.importActual<typeof import("../../src/shared/client.js")>(
		"../../src/shared/client.js",
	);
	return {
		...actual,
		createScalewayClient: vi.fn(() => ({ fetch: mockFetch })),
	};
});

vi.mock("../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
		defaultProjectId: "00000000-0000-0000-0000-000000000000",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

const TEST_UUID = "11111111-1111-1111-1111-111111111111";

beforeEach(() => {
	mockFetch.mockReset();
});

afterEach(() => {
	resetClient();
});

// ── Contract: Request shape ────────────────────────────────────────────────────

describe("jobs contract: request shapes", () => {
	it("ListJobDefinitions sends GET to /jobs/v1alpha2/regions/{region}/job-definitions", async () => {
		mockFetch.mockResolvedValueOnce({ job_definitions: [], total_count: 0 });
		await handleListJobDefinitions({ page: 1, pageSize: 50 });
		expect(mockFetch.mock.calls[0][0].method).toBe("GET");
		expect(mockFetch.mock.calls[0][0].path).toMatch(
			/\/jobs\/v1alpha2\/regions\/fr-par\/job-definitions\?/,
		);
	});

	it("GetJobDefinition sends GET to /jobs/v1alpha2/regions/{region}/job-definitions/{id}", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID });
		await handleGetJobDefinition({ job_definition_id: TEST_UUID });
		expect(mockFetch.mock.calls[0][0].method).toBe("GET");
		expect(mockFetch.mock.calls[0][0].path).toBe(
			`/jobs/v1alpha2/regions/fr-par/job-definitions/${TEST_UUID}`,
		);
	});

	it("CreateJobDefinition sends POST with required body fields", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID });
		await handleCreateJobDefinition({
			name: "test",
			cpu_limit: 1000,
			memory_limit: 256,
			image_uri: "image:v1",
		});
		const call = mockFetch.mock.calls[0][0];
		expect(call.method).toBe("POST");
		expect(call.path).toBe("/jobs/v1alpha2/regions/fr-par/job-definitions");
		const body = JSON.parse(call.body);
		expect(body).toEqual(
			expect.objectContaining({
				name: "test",
				cpu_limit: 1000,
				memory_limit: 256,
				image_uri: "image:v1",
			}),
		);
	});

	it("UpdateJobDefinition sends PATCH with partial body", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID });
		await handleUpdateJobDefinition({ job_definition_id: TEST_UUID, name: "renamed" });
		const call = mockFetch.mock.calls[0][0];
		expect(call.method).toBe("PATCH");
		expect(call.path).toBe(`/jobs/v1alpha2/regions/fr-par/job-definitions/${TEST_UUID}`);
		const body = JSON.parse(call.body);
		expect(body).toEqual({ name: "renamed" });
	});

	it("DeleteJobDefinition sends DELETE to correct path", async () => {
		mockFetch.mockResolvedValueOnce(undefined);
		await handleDeleteJobDefinition({ job_definition_id: TEST_UUID });
		const call = mockFetch.mock.calls[0][0];
		expect(call.method).toBe("DELETE");
		expect(call.path).toBe(`/jobs/v1alpha2/regions/fr-par/job-definitions/${TEST_UUID}`);
	});

	it("StartJob sends POST to /job-runs with job_definition_id", async () => {
		mockFetch.mockResolvedValueOnce({ id: "run-id" });
		await handleStartJob({ job_definition_id: TEST_UUID });
		const call = mockFetch.mock.calls[0][0];
		expect(call.method).toBe("POST");
		expect(call.path).toBe("/jobs/v1alpha2/regions/fr-par/job-runs");
		const body = JSON.parse(call.body);
		expect(body.job_definition_id).toBe(TEST_UUID);
	});

	it("ListJobRuns sends GET to /job-runs with pagination", async () => {
		mockFetch.mockResolvedValueOnce({ job_runs: [], total_count: 0 });
		await handleListJobRuns({ page: 2, pageSize: 25 });
		const call = mockFetch.mock.calls[0][0];
		expect(call.method).toBe("GET");
		expect(call.path).toContain("/jobs/v1alpha2/regions/fr-par/job-runs?");
		expect(call.path).toContain("page=2");
		expect(call.path).toContain("page_size=25");
	});

	it("GetJobRun sends GET to /job-runs/{id}", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID });
		await handleGetJobRun({ job_run_id: TEST_UUID });
		expect(mockFetch.mock.calls[0][0].method).toBe("GET");
		expect(mockFetch.mock.calls[0][0].path).toBe(
			`/jobs/v1alpha2/regions/fr-par/job-runs/${TEST_UUID}`,
		);
	});

	it("StopJobRun sends POST to /job-runs/{id}/stop", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID, state: "canceled" });
		await handleStopJobRun({ job_run_id: TEST_UUID });
		const call = mockFetch.mock.calls[0][0];
		expect(call.method).toBe("POST");
		expect(call.path).toBe(`/jobs/v1alpha2/regions/fr-par/job-runs/${TEST_UUID}/stop`);
	});
});

// ── Contract: Response shapes ──────────────────────────────────────────────────

describe("jobs contract: response shapes", () => {
	it("ListJobDefinitions returns paginated response with items array", async () => {
		mockFetch.mockResolvedValueOnce({
			job_definitions: [{ id: TEST_UUID, name: "job1", cpu_limit: 1000, memory_limit: 256 }],
			total_count: 1,
		});
		const result = await handleListJobDefinitions({ page: 1, pageSize: 50 });
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed).toHaveProperty("items");
		expect(parsed).toHaveProperty("totalCount");
		expect(parsed).toHaveProperty("page");
		expect(parsed).toHaveProperty("pageSize");
		expect(Array.isArray(parsed.items)).toBe(true);
	});

	it("GetJobDefinition returns single object with id", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID, name: "job1" });
		const result = await handleGetJobDefinition({ job_definition_id: TEST_UUID });
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed).toHaveProperty("id");
	});

	it("CreateJobDefinition returns created object", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID, name: "new-job" });
		const result = await handleCreateJobDefinition({
			name: "new-job",
			cpu_limit: 1000,
			memory_limit: 256,
			image_uri: "img",
		});
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed).toHaveProperty("id");
	});

	it("DeleteJobDefinition returns confirmation with deleted flag", async () => {
		mockFetch.mockResolvedValueOnce(undefined);
		const result = await handleDeleteJobDefinition({ job_definition_id: TEST_UUID });
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.deleted).toBe(true);
		expect(parsed.job_definition_id).toBe(TEST_UUID);
	});

	it("ListJobRuns returns paginated response", async () => {
		mockFetch.mockResolvedValueOnce({
			job_runs: [{ id: TEST_UUID, state: "running" }],
			total_count: 1,
		});
		const result = await handleListJobRuns({ page: 1, pageSize: 50 });
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed).toHaveProperty("items");
		expect(parsed).toHaveProperty("totalCount");
		expect(Array.isArray(parsed.items)).toBe(true);
	});

	it("StartJob returns job run object", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID, state: "queued" });
		const result = await handleStartJob({ job_definition_id: TEST_UUID });
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed).toHaveProperty("id");
		expect(parsed).toHaveProperty("state");
	});
});

// ── Contract: Pagination ───────────────────────────────────────────────────────

describe("jobs contract: pagination", () => {
	it("ListJobDefinitions sends page and page_size query params", async () => {
		mockFetch.mockResolvedValueOnce({ job_definitions: [], total_count: 0 });
		await handleListJobDefinitions({ page: 3, pageSize: 20 });
		const path = mockFetch.mock.calls[0][0].path;
		expect(path).toContain("page=3");
		expect(path).toContain("page_size=20");
	});

	it("ListJobRuns sends page and page_size query params", async () => {
		mockFetch.mockResolvedValueOnce({ job_runs: [], total_count: 0 });
		await handleListJobRuns({ page: 5, pageSize: 10 });
		const path = mockFetch.mock.calls[0][0].path;
		expect(path).toContain("page=5");
		expect(path).toContain("page_size=10");
	});
});

// ── Contract: Auth (error mapping) ─────────────────────────────────────────────

describe("jobs contract: auth and error codes", () => {
	it("maps 401 to permission_denied", async () => {
		const err = Object.assign(new Error("unauthorized"), { statusCode: 401 });
		mockFetch.mockRejectedValueOnce(err);
		const result = await handleGetJobDefinition({ job_definition_id: TEST_UUID });
		expect("isError" in result && result.isError).toBe(true);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.error.type).toBe("permission_denied");
		expect(parsed.error.statusCode).toBe(401);
	});

	it("maps 403 to permission_denied", async () => {
		const err = Object.assign(new Error("forbidden"), { statusCode: 403 });
		mockFetch.mockRejectedValueOnce(err);
		const result = await handleCreateJobDefinition({
			name: "t",
			cpu_limit: 1000,
			memory_limit: 256,
			image_uri: "i",
		});
		expect("isError" in result && result.isError).toBe(true);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.error.type).toBe("permission_denied");
	});

	it("maps 404 to not_found", async () => {
		const err = Object.assign(new Error("not found"), { statusCode: 404 });
		mockFetch.mockRejectedValueOnce(err);
		const result = await handleGetJobRun({ job_run_id: TEST_UUID });
		expect("isError" in result && result.isError).toBe(true);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.error.type).toBe("not_found");
	});

	it("maps 429 to rate_limited", async () => {
		const err = Object.assign(new Error("too many requests"), { statusCode: 429 });
		mockFetch.mockRejectedValueOnce(err);
		const result = await handleListJobRuns({ page: 1, pageSize: 50 });
		expect("isError" in result && result.isError).toBe(true);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.error.type).toBe("rate_limited");
	});

	it("maps unknown errors to server_error", async () => {
		mockFetch.mockRejectedValueOnce("string error");
		const result = await handleStopJobRun({ job_run_id: TEST_UUID });
		expect("isError" in result && result.isError).toBe(true);
		const parsed = JSON.parse(result.content[0].text);
		expect(parsed.error.type).toBe("server_error");
	});
});

// ── Contract: Regional routing ─────────────────────────────────────────────────

describe("jobs contract: regional routing", () => {
	it("defaults to fr-par when no region specified", async () => {
		mockFetch.mockResolvedValueOnce({ job_definitions: [], total_count: 0 });
		await handleListJobDefinitions({ page: 1, pageSize: 50 });
		expect(mockFetch.mock.calls[0][0].path).toContain("/regions/fr-par/");
	});

	it("uses nl-ams when specified", async () => {
		mockFetch.mockResolvedValueOnce({ id: TEST_UUID });
		await handleGetJobDefinition({ job_definition_id: TEST_UUID, region: "nl-ams" });
		expect(mockFetch.mock.calls[0][0].path).toContain("/regions/nl-ams/");
	});

	it("uses pl-waw when specified", async () => {
		mockFetch.mockResolvedValueOnce({ job_runs: [], total_count: 0 });
		await handleListJobRuns({ page: 1, pageSize: 50, region: "pl-waw" });
		expect(mockFetch.mock.calls[0][0].path).toContain("/regions/pl-waw/");
	});
});
