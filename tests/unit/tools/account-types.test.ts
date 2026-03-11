import { describe, expect, it } from "vitest";
import {
	CreateProjectParams,
	DeleteProjectParams,
	GetProjectParams,
	ListProjectsOrderBy,
	ListProjectsParams,
	UpdateProjectParams,
} from "../../../src/tools/account/types.js";

describe("ListProjectsOrderBy", () => {
	it("accepts valid order values", () => {
		expect(ListProjectsOrderBy.parse("created_at_asc")).toBe("created_at_asc");
		expect(ListProjectsOrderBy.parse("created_at_desc")).toBe("created_at_desc");
		expect(ListProjectsOrderBy.parse("name_asc")).toBe("name_asc");
		expect(ListProjectsOrderBy.parse("name_desc")).toBe("name_desc");
	});

	it("defaults to created_at_asc when undefined", () => {
		expect(ListProjectsOrderBy.parse(undefined)).toBe("created_at_asc");
	});

	it("rejects invalid values", () => {
		expect(() => ListProjectsOrderBy.parse("invalid")).toThrow();
	});
});

describe("ListProjectsParams", () => {
	it("parses minimal params with defaults", () => {
		const result = ListProjectsParams.parse({});
		expect(result.page).toBe(1);
		expect(result.page_size).toBe(50);
		expect(result.order_by).toBe("created_at_asc");
	});

	it("parses full params", () => {
		const input = {
			organization_id: "11111111-1111-1111-1111-111111111111",
			name: "test",
			project_ids: ["22222222-2222-2222-2222-222222222222"],
			order_by: "name_desc",
			page: 3,
			page_size: 25,
		};
		const result = ListProjectsParams.parse(input);
		expect(result.organization_id).toBe(input.organization_id);
		expect(result.name).toBe("test");
		expect(result.project_ids).toEqual(input.project_ids);
		expect(result.order_by).toBe("name_desc");
		expect(result.page).toBe(3);
		expect(result.page_size).toBe(25);
	});

	it("rejects invalid organization_id format", () => {
		expect(() => ListProjectsParams.parse({ organization_id: "not-a-uuid" })).toThrow();
	});

	it("rejects page_size > 100", () => {
		expect(() => ListProjectsParams.parse({ page_size: 101 })).toThrow();
	});

	it("rejects page_size < 1", () => {
		expect(() => ListProjectsParams.parse({ page_size: 0 })).toThrow();
	});

	it("rejects non-positive page", () => {
		expect(() => ListProjectsParams.parse({ page: 0 })).toThrow();
	});

	it("rejects non-uuid project_ids", () => {
		expect(() => ListProjectsParams.parse({ project_ids: ["bad-id"] })).toThrow();
	});
});

describe("GetProjectParams", () => {
	it("parses valid project_id", () => {
		const result = GetProjectParams.parse({
			project_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.project_id).toBe("11111111-1111-1111-1111-111111111111");
	});

	it("rejects missing project_id", () => {
		expect(() => GetProjectParams.parse({})).toThrow();
	});

	it("rejects non-uuid project_id", () => {
		expect(() => GetProjectParams.parse({ project_id: "bad" })).toThrow();
	});
});

describe("CreateProjectParams", () => {
	it("parses with description only", () => {
		const result = CreateProjectParams.parse({ description: "test" });
		expect(result.description).toBe("test");
		expect(result.name).toBeUndefined();
		expect(result.organization_id).toBeUndefined();
	});

	it("parses full params", () => {
		const result = CreateProjectParams.parse({
			name: "my-project",
			organization_id: "11111111-1111-1111-1111-111111111111",
			description: "a description",
		});
		expect(result.name).toBe("my-project");
		expect(result.organization_id).toBe("11111111-1111-1111-1111-111111111111");
	});

	it("rejects missing description", () => {
		expect(() => CreateProjectParams.parse({})).toThrow();
	});

	it("rejects name longer than 64 chars", () => {
		expect(() =>
			CreateProjectParams.parse({
				name: "a".repeat(65),
				description: "test",
			}),
		).toThrow();
	});

	it("rejects empty name", () => {
		expect(() => CreateProjectParams.parse({ name: "", description: "test" })).toThrow();
	});

	it("rejects description longer than 200 chars", () => {
		expect(() => CreateProjectParams.parse({ description: "a".repeat(201) })).toThrow();
	});

	it("rejects non-uuid organization_id", () => {
		expect(() =>
			CreateProjectParams.parse({
				organization_id: "bad",
				description: "test",
			}),
		).toThrow();
	});
});

describe("UpdateProjectParams", () => {
	it("parses with project_id only (no changes)", () => {
		const result = UpdateProjectParams.parse({
			project_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.project_id).toBe("11111111-1111-1111-1111-111111111111");
		expect(result.name).toBeUndefined();
		expect(result.description).toBeUndefined();
	});

	it("parses full update", () => {
		const result = UpdateProjectParams.parse({
			project_id: "11111111-1111-1111-1111-111111111111",
			name: "new-name",
			description: "new-desc",
		});
		expect(result.name).toBe("new-name");
		expect(result.description).toBe("new-desc");
	});

	it("rejects missing project_id", () => {
		expect(() => UpdateProjectParams.parse({ name: "x" })).toThrow();
	});

	it("rejects name longer than 64 chars", () => {
		expect(() =>
			UpdateProjectParams.parse({
				project_id: "11111111-1111-1111-1111-111111111111",
				name: "a".repeat(65),
			}),
		).toThrow();
	});

	it("rejects empty name", () => {
		expect(() =>
			UpdateProjectParams.parse({
				project_id: "11111111-1111-1111-1111-111111111111",
				name: "",
			}),
		).toThrow();
	});

	it("rejects description longer than 200 chars", () => {
		expect(() =>
			UpdateProjectParams.parse({
				project_id: "11111111-1111-1111-1111-111111111111",
				description: "a".repeat(201),
			}),
		).toThrow();
	});
});

describe("DeleteProjectParams", () => {
	it("parses valid project_id", () => {
		const result = DeleteProjectParams.parse({
			project_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(result.project_id).toBe("11111111-1111-1111-1111-111111111111");
	});

	it("rejects missing project_id", () => {
		expect(() => DeleteProjectParams.parse({})).toThrow();
	});

	it("rejects non-uuid project_id", () => {
		expect(() => DeleteProjectParams.parse({ project_id: "bad" })).toThrow();
	});
});
