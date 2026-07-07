/**
 * Contract tests for Scaleway Account (Project) API v3
 *
 * Validates request/response shapes against
 *   specs/scaleway-api/account/api-reference.md
 *   specs/scaleway-api/account/project-api.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API: https://www.scaleway.com/en/developers/api/account/project-api/
 * Base URL: https://api.scaleway.com/account/v3
 * Auth: X-Auth-Token header
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	CreateProjectParams,
	DeleteProjectParams,
	GetProjectParams,
	ListProjectsParams,
	UpdateProjectParams,
} from "../../../src/tools/account/types.js";

// --- Shared fixtures ---

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const ORG_UUID = "11111111-2222-3333-4444-555555555555";

// Response schemas mirroring src/tools/account/types.ts ProjectResponse /
// ListProjectsApiResponse (declared there as TS interfaces).
const ProjectResponseSchema = z.object({
	id: z.string(),
	name: z.string(),
	organization_id: z.string(),
	description: z.string(),
	created_at: z.string().nullable(),
	updated_at: z.string().nullable(),
});

const ListProjectsResponseSchema = z.object({
	projects: z.array(ProjectResponseSchema),
	total_count: z.number(),
	page: z.number(),
	page_size: z.number(),
});

const validProject = {
	id: VALID_UUID,
	name: "my-project",
	organization_id: ORG_UUID,
	description: "A test project",
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

// --- Response shape contracts ---

/**
 * API: GET /account/v3/projects
 * Spec: specs/scaleway-api/account/api-reference.md#list-projects
 */
describe("contract: ListProjects response shape", () => {
	it("validates a list projects response", () => {
		const response = {
			projects: [validProject],
			total_count: 1,
			page: 1,
			page_size: 50,
		};
		expect(() => ListProjectsResponseSchema.parse(response)).not.toThrow();
	});

	it("validates empty response", () => {
		const response = { projects: [], total_count: 0, page: 1, page_size: 50 };
		expect(() => ListProjectsResponseSchema.parse(response)).not.toThrow();
	});

	it("validates project with null timestamps", () => {
		const response = {
			projects: [{ ...validProject, created_at: null, updated_at: null }],
			total_count: 1,
			page: 1,
			page_size: 50,
		};
		expect(() => ListProjectsResponseSchema.parse(response)).not.toThrow();
	});

	it("rejects response missing projects array", () => {
		expect(() => ListProjectsResponseSchema.parse({ total_count: 0 })).toThrow();
	});
});

/**
 * API: GET /account/v3/projects
 * Spec: specs/scaleway-api/account/api-reference.md#list-projects
 */
describe("contract: ListProjects request shape", () => {
	it("applies default pagination and order_by", () => {
		const result = ListProjectsParams.parse({});
		expect(result.page).toBe(1);
		expect(result.page_size).toBe(50);
		expect(result.order_by).toBe("created_at_asc");
	});

	it("validates full filter request", () => {
		const input = {
			organization_id: ORG_UUID,
			name: "prod",
			project_ids: [VALID_UUID],
			order_by: "name_desc",
			page: 2,
			page_size: 100,
		};
		expect(() => ListProjectsParams.parse(input)).not.toThrow();
	});

	it("validates all order_by values", () => {
		for (const order_by of ["created_at_asc", "created_at_desc", "name_asc", "name_desc"]) {
			expect(() => ListProjectsParams.parse({ order_by })).not.toThrow();
		}
	});

	it("rejects invalid order_by", () => {
		expect(() => ListProjectsParams.parse({ order_by: "size_asc" })).toThrow();
	});

	it("rejects non-uuid organization_id", () => {
		expect(() => ListProjectsParams.parse({ organization_id: "not-a-uuid" })).toThrow();
	});

	it("rejects non-uuid project_ids entries", () => {
		expect(() => ListProjectsParams.parse({ project_ids: ["not-a-uuid"] })).toThrow();
	});

	it("rejects page_size over 100", () => {
		expect(() => ListProjectsParams.parse({ page_size: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListProjectsParams.parse({ page: 0 })).toThrow();
	});
});

/**
 * API: GET /account/v3/projects/{project_id}
 * Spec: specs/scaleway-api/account/api-reference.md#get-project
 */
describe("contract: GetProject", () => {
	it("validates project response", () => {
		expect(() => ProjectResponseSchema.parse(validProject)).not.toThrow();
	});

	it("validates request shape", () => {
		expect(() => GetProjectParams.parse({ project_id: VALID_UUID })).not.toThrow();
	});

	it("rejects missing project_id", () => {
		expect(() => GetProjectParams.parse({})).toThrow();
	});

	it("rejects non-uuid project_id", () => {
		expect(() => GetProjectParams.parse({ project_id: "abc" })).toThrow();
	});
});

/**
 * API: POST /account/v3/projects
 * Spec: specs/scaleway-api/account/api-reference.md#create-project
 */
describe("contract: CreateProject request shape", () => {
	it("validates minimal create (description only)", () => {
		expect(() => CreateProjectParams.parse({ description: "hello" })).not.toThrow();
	});

	it("validates full create request", () => {
		const input = {
			name: "new-project",
			organization_id: ORG_UUID,
			description: "A project",
		};
		expect(() => CreateProjectParams.parse(input)).not.toThrow();
	});

	it("rejects create without description", () => {
		expect(() => CreateProjectParams.parse({ name: "x" })).toThrow();
	});

	it("rejects name over 64 characters", () => {
		expect(() => CreateProjectParams.parse({ name: "a".repeat(65), description: "x" })).toThrow();
	});

	it("rejects description over 200 characters", () => {
		expect(() => CreateProjectParams.parse({ description: "a".repeat(201) })).toThrow();
	});

	it("rejects non-uuid organization_id", () => {
		expect(() => CreateProjectParams.parse({ organization_id: "bad", description: "x" })).toThrow();
	});
});

/**
 * API: PATCH /account/v3/projects/{project_id}
 * Spec: specs/scaleway-api/account/api-reference.md#update-project
 */
describe("contract: UpdateProject request shape", () => {
	it("validates update with all optional fields", () => {
		const input = {
			project_id: VALID_UUID,
			name: "renamed",
			description: "updated description",
		};
		expect(() => UpdateProjectParams.parse(input)).not.toThrow();
	});

	it("validates update with only project_id", () => {
		expect(() => UpdateProjectParams.parse({ project_id: VALID_UUID })).not.toThrow();
	});

	it("rejects update without project_id", () => {
		expect(() => UpdateProjectParams.parse({ name: "x" })).toThrow();
	});

	it("rejects name over 64 characters", () => {
		expect(() =>
			UpdateProjectParams.parse({ project_id: VALID_UUID, name: "a".repeat(65) }),
		).toThrow();
	});
});

/**
 * API: DELETE /account/v3/projects/{project_id}
 * Spec: specs/scaleway-api/account/api-reference.md#delete-project
 */
describe("contract: DeleteProject request shape", () => {
	it("validates delete request", () => {
		expect(() => DeleteProjectParams.parse({ project_id: VALID_UUID })).not.toThrow();
	});

	it("rejects missing project_id", () => {
		expect(() => DeleteProjectParams.parse({})).toThrow();
	});

	it("rejects non-uuid project_id", () => {
		expect(() => DeleteProjectParams.parse({ project_id: "xyz" })).toThrow();
	});
});
