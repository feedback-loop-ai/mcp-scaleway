import { describe, expect, it, vi } from "vitest";

type ToolResult = { content: Array<{ type: string; text: string }>; isError?: boolean };
import {
	createProjectApi,
	handleCreateProject,
	handleDeleteProject,
	handleGetProject,
	handleListProjects,
	handleUpdateProject,
} from "../../../src/tools/account/handlers.js";

// Mock the SDK
vi.mock("@scaleway/sdk-account", () => {
	const ProjectAPI = vi.fn();
	return {
		Accountv3: { ProjectAPI },
	};
});

function makeMockApi() {
	return {
		listProjects: vi.fn(),
		getProject: vi.fn(),
		createProject: vi.fn(),
		updateProject: vi.fn(),
		deleteProject: vi.fn(),
	};
}

const sampleProject = {
	id: "11111111-1111-1111-1111-111111111111",
	name: "my-project",
	organizationId: "22222222-2222-2222-2222-222222222222",
	description: "A test project",
	createdAt: new Date("2025-01-01T00:00:00Z"),
	updatedAt: new Date("2025-06-01T00:00:00Z"),
};

const sampleProjectNullDates = {
	id: "33333333-3333-3333-3333-333333333333",
	name: "null-dates-project",
	organizationId: "22222222-2222-2222-2222-222222222222",
	description: "Project with null dates",
	createdAt: undefined,
	updatedAt: undefined,
};

describe("createProjectApi", () => {
	it("creates a ProjectAPI instance from the client", () => {
		const mockClient = {} as never;
		const api = createProjectApi(mockClient);
		expect(api).toBeDefined();
	});
});

describe("handleListProjects", () => {
	it("returns formatted projects with pagination", async () => {
		const api = makeMockApi();
		api.listProjects.mockResolvedValue({
			projects: [sampleProject],
			totalCount: 1,
		});

		const result = await handleListProjects(api as never, {
			page: 1,
			page_size: 50,
			order_by: "created_at_asc",
		});

		expect(result.content[0].type).toBe("text");
		const data = JSON.parse(result.content[0].text);
		expect(data.projects).toHaveLength(1);
		expect(data.projects[0].id).toBe(sampleProject.id);
		expect(data.projects[0].organization_id).toBe(sampleProject.organizationId);
		expect(data.projects[0].created_at).toBe("2025-01-01T00:00:00.000Z");
		expect(data.total_count).toBe(1);
		expect(data.page).toBe(1);
		expect(data.page_size).toBe(50);
	});

	it("passes all filter parameters to the SDK", async () => {
		const api = makeMockApi();
		api.listProjects.mockResolvedValue({ projects: [], totalCount: 0 });

		await handleListProjects(api as never, {
			organization_id: "22222222-2222-2222-2222-222222222222",
			name: "test",
			project_ids: ["11111111-1111-1111-1111-111111111111"],
			order_by: "name_desc",
			page: 2,
			page_size: 10,
		});

		expect(api.listProjects).toHaveBeenCalledWith({
			organizationId: "22222222-2222-2222-2222-222222222222",
			name: "test",
			projectIds: ["11111111-1111-1111-1111-111111111111"],
			orderBy: "name_desc",
			page: 2,
			pageSize: 10,
		});
	});

	it("formats null dates correctly", async () => {
		const api = makeMockApi();
		api.listProjects.mockResolvedValue({
			projects: [sampleProjectNullDates],
			totalCount: 1,
		});

		const result = await handleListProjects(api as never, {
			page: 1,
			page_size: 50,
			order_by: "created_at_asc",
		});

		const data = JSON.parse(result.content[0].text);
		expect(data.projects[0].created_at).toBeNull();
		expect(data.projects[0].updated_at).toBeNull();
	});

	it("returns error response on SDK failure", async () => {
		const api = makeMockApi();
		const error = new Error("API error");
		(error as unknown as Record<string, unknown>).statusCode = 403;
		api.listProjects.mockRejectedValue(error);

		const result = (await handleListProjects(api as never, {
			page: 1,
			page_size: 50,
			order_by: "created_at_asc",
		})) as ToolResult;

		expect(result.isError).toBe(true);
		const data = JSON.parse(result.content[0].text);
		expect(data.error.type).toBe("permission_denied");
	});
});

describe("handleGetProject", () => {
	it("returns formatted project", async () => {
		const api = makeMockApi();
		api.getProject.mockResolvedValue(sampleProject);

		const result = await handleGetProject(api as never, {
			project_id: sampleProject.id,
		});

		const data = JSON.parse(result.content[0].text);
		expect(data.id).toBe(sampleProject.id);
		expect(data.name).toBe(sampleProject.name);
		expect(data.description).toBe(sampleProject.description);
	});

	it("calls SDK with correct project ID", async () => {
		const api = makeMockApi();
		api.getProject.mockResolvedValue(sampleProject);

		await handleGetProject(api as never, {
			project_id: "11111111-1111-1111-1111-111111111111",
		});

		expect(api.getProject).toHaveBeenCalledWith({
			projectId: "11111111-1111-1111-1111-111111111111",
		});
	});

	it("returns error on not found", async () => {
		const api = makeMockApi();
		const error = new Error("not found");
		(error as unknown as Record<string, unknown>).statusCode = 404;
		api.getProject.mockRejectedValue(error);

		const result = (await handleGetProject(api as never, {
			project_id: "00000000-0000-0000-0000-000000000000",
		})) as ToolResult;

		expect(result.isError).toBe(true);
		const data = JSON.parse(result.content[0].text);
		expect(data.error.type).toBe("not_found");
	});
});

describe("handleCreateProject", () => {
	it("returns created project", async () => {
		const api = makeMockApi();
		api.createProject.mockResolvedValue(sampleProject);

		const result = await handleCreateProject(api as never, {
			name: "my-project",
			description: "A test project",
		});

		const data = JSON.parse(result.content[0].text);
		expect(data.id).toBe(sampleProject.id);
		expect(data.name).toBe("my-project");
	});

	it("passes all parameters to SDK", async () => {
		const api = makeMockApi();
		api.createProject.mockResolvedValue(sampleProject);

		await handleCreateProject(api as never, {
			name: "new-proj",
			organization_id: "22222222-2222-2222-2222-222222222222",
			description: "desc",
		});

		expect(api.createProject).toHaveBeenCalledWith({
			name: "new-proj",
			organizationId: "22222222-2222-2222-2222-222222222222",
			description: "desc",
		});
	});

	it("handles creation without optional name", async () => {
		const api = makeMockApi();
		api.createProject.mockResolvedValue(sampleProject);

		await handleCreateProject(api as never, {
			description: "desc",
		});

		expect(api.createProject).toHaveBeenCalledWith({
			name: undefined,
			organizationId: undefined,
			description: "desc",
		});
	});

	it("returns error on invalid input", async () => {
		const api = makeMockApi();
		const error = new Error("bad request");
		(error as unknown as Record<string, unknown>).statusCode = 400;
		api.createProject.mockRejectedValue(error);

		const result = (await handleCreateProject(api as never, {
			description: "",
		})) as ToolResult;

		expect(result.isError).toBe(true);
		const data = JSON.parse(result.content[0].text);
		expect(data.error.type).toBe("invalid_input");
	});
});

describe("handleUpdateProject", () => {
	it("returns updated project", async () => {
		const api = makeMockApi();
		const updated = { ...sampleProject, name: "updated-name" };
		api.updateProject.mockResolvedValue(updated);

		const result = await handleUpdateProject(api as never, {
			project_id: sampleProject.id,
			name: "updated-name",
		});

		const data = JSON.parse(result.content[0].text);
		expect(data.name).toBe("updated-name");
	});

	it("passes all parameters to SDK", async () => {
		const api = makeMockApi();
		api.updateProject.mockResolvedValue(sampleProject);

		await handleUpdateProject(api as never, {
			project_id: "11111111-1111-1111-1111-111111111111",
			name: "new-name",
			description: "new-desc",
		});

		expect(api.updateProject).toHaveBeenCalledWith({
			projectId: "11111111-1111-1111-1111-111111111111",
			name: "new-name",
			description: "new-desc",
		});
	});

	it("returns error on failure", async () => {
		const api = makeMockApi();
		const error = new Error("rate limited");
		(error as unknown as Record<string, unknown>).statusCode = 429;
		api.updateProject.mockRejectedValue(error);

		const result = (await handleUpdateProject(api as never, {
			project_id: sampleProject.id,
			name: "x",
		})) as ToolResult;

		expect(result.isError).toBe(true);
		const data = JSON.parse(result.content[0].text);
		expect(data.error.type).toBe("rate_limited");
	});
});

describe("handleDeleteProject", () => {
	it("returns success message", async () => {
		const api = makeMockApi();
		api.deleteProject.mockResolvedValue(undefined);

		const result = (await handleDeleteProject(api as never, {
			project_id: "11111111-1111-1111-1111-111111111111",
		})) as ToolResult;

		expect(result.isError).toBeUndefined();
		const data = JSON.parse(result.content[0].text);
		expect(data.message).toContain("11111111-1111-1111-1111-111111111111");
		expect(data.message).toContain("deleted successfully");
	});

	it("calls SDK with correct project ID", async () => {
		const api = makeMockApi();
		api.deleteProject.mockResolvedValue(undefined);

		await handleDeleteProject(api as never, {
			project_id: "11111111-1111-1111-1111-111111111111",
		});

		expect(api.deleteProject).toHaveBeenCalledWith({
			projectId: "11111111-1111-1111-1111-111111111111",
		});
	});

	it("returns error when project is not empty", async () => {
		const api = makeMockApi();
		api.deleteProject.mockRejectedValue(new Error("project not empty"));

		const result = (await handleDeleteProject(api as never, {
			project_id: "11111111-1111-1111-1111-111111111111",
		})) as ToolResult;

		expect(result.isError).toBe(true);
		const data = JSON.parse(result.content[0].text);
		expect(data.error.type).toBe("server_error");
	});

	it("returns error for non-Error thrown value", async () => {
		const api = makeMockApi();
		api.deleteProject.mockRejectedValue("string error");

		const result = (await handleDeleteProject(api as never, {
			project_id: "11111111-1111-1111-1111-111111111111",
		})) as ToolResult;

		expect(result.isError).toBe(true);
		const data = JSON.parse(result.content[0].text);
		expect(data.error.type).toBe("server_error");
		expect(data.error.message).toBe("string error");
	});
});
