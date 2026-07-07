import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerFileStorageTools } from "../../../src/tools/file-storage/index.js";

// Mock the shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

interface ErrorResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

const FS_ID = "00000000-0000-0000-0000-000000000010";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";
const ORG_ID = "00000000-0000-0000-0000-000000000002";
const ATTACH_ID = "00000000-0000-0000-0000-000000000020";
const RESOURCE_ID = "00000000-0000-0000-0000-000000000030";

const sampleFileSystem = {
	id: FS_ID,
	name: "my-fs",
	size: 100000000000,
	status: "available",
	project_id: PROJECT_ID,
	organization_id: ORG_ID,
	tags: ["prod"],
	number_of_attachments: 1,
	region: "fr-par",
	created_at: "2025-01-01T00:00:00+00:00",
	updated_at: "2025-01-01T00:00:00+00:00",
};

const sampleAttachment = {
	id: ATTACH_ID,
	filesystem_id: FS_ID,
	resource_id: RESOURCE_ID,
	resource_type: "instance_server",
	zone: "fr-par-1",
};

describe("file-storage module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerFileStorageTools(server)).not.toThrow();
	});

	it("registers all 6 file-storage tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerFileStorageTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(6);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_file_storage_list_filesystems");
		expect(toolNames).toContain("scaleway_file_storage_get_filesystem");
		expect(toolNames).toContain("scaleway_file_storage_create_filesystem");
		expect(toolNames).toContain("scaleway_file_storage_update_filesystem");
		expect(toolNames).toContain("scaleway_file_storage_delete_filesystem");
		expect(toolNames).toContain("scaleway_file_storage_list_attachments");
	});
});

describe("file-storage handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListFileSystems", () => {
		it("returns paginated list of file systems", async () => {
			const { handleListFileSystems } = await import("../../../src/tools/file-storage/handlers.js");
			mockFetch.mockResolvedValue({
				filesystems: [sampleFileSystem],
				total_count: 1,
			});

			const result = await handleListFileSystems({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "file/v1alpha1/regions/fr-par/filesystems",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].name).toBe("my-fs");
		});

		it("passes optional filters", async () => {
			const { handleListFileSystems } = await import("../../../src/tools/file-storage/handlers.js");
			mockFetch.mockResolvedValue({ filesystems: [], total_count: 0 });

			await handleListFileSystems({
				region: "fr-par",
				page: 2,
				pageSize: 10,
				projectId: PROJECT_ID,
				organizationId: ORG_ID,
				name: "test",
				tags: ["a", "b"],
				orderBy: "name_asc",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.method).toBe("GET");
			expect(callArgs.urlParams.get("page")).toBe("2");
			expect(callArgs.urlParams.get("page_size")).toBe("10");
			expect(callArgs.urlParams.get("project_id")).toBe(PROJECT_ID);
			expect(callArgs.urlParams.get("organization_id")).toBe(ORG_ID);
			expect(callArgs.urlParams.get("name")).toBe("test");
			expect(callArgs.urlParams.getAll("tags")).toEqual(["a", "b"]);
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
		});

		it("returns error on failure", async () => {
			const { handleListFileSystems } = await import("../../../src/tools/file-storage/handlers.js");
			const err = new Error("Unauthorized");
			(err as unknown as { statusCode: number }).statusCode = 401;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleListFileSystems({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetFileSystem", () => {
		it("returns file system details", async () => {
			const { handleGetFileSystem } = await import("../../../src/tools/file-storage/handlers.js");
			mockFetch.mockResolvedValue(sampleFileSystem);

			const result = await handleGetFileSystem({
				region: "fr-par",
				filesystemId: FS_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "GET",
				path: `file/v1alpha1/regions/fr-par/filesystems/${FS_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("my-fs");
		});

		it("returns error on 404", async () => {
			const { handleGetFileSystem } = await import("../../../src/tools/file-storage/handlers.js");
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleGetFileSystem({
				region: "fr-par",
				filesystemId: FS_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleCreateFileSystem", () => {
		it("creates file system with all fields", async () => {
			const { handleCreateFileSystem } = await import(
				"../../../src/tools/file-storage/handlers.js"
			);
			mockFetch.mockResolvedValue(sampleFileSystem);

			const result = await handleCreateFileSystem({
				region: "fr-par",
				name: "my-fs",
				size: 100000000000,
				projectId: PROJECT_ID,
				tags: ["prod"],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "file/v1alpha1/regions/fr-par/filesystems",
				body: JSON.stringify({
					name: "my-fs",
					size: 100000000000,
					project_id: PROJECT_ID,
					tags: ["prod"],
				}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("my-fs");
		});

		it("creates file system without optional fields", async () => {
			const { handleCreateFileSystem } = await import(
				"../../../src/tools/file-storage/handlers.js"
			);
			mockFetch.mockResolvedValue(sampleFileSystem);

			await handleCreateFileSystem({
				region: "fr-par",
				name: "my-fs",
				size: 100000000000,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "file/v1alpha1/regions/fr-par/filesystems",
				body: JSON.stringify({ name: "my-fs", size: 100000000000 }),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on invalid input", async () => {
			const { handleCreateFileSystem } = await import(
				"../../../src/tools/file-storage/handlers.js"
			);
			const err = new Error("Bad request");
			(err as unknown as { statusCode: number }).statusCode = 400;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleCreateFileSystem({
				region: "fr-par",
				name: "my-fs",
				size: 1,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("handleUpdateFileSystem", () => {
		it("updates all mutable fields", async () => {
			const { handleUpdateFileSystem } = await import(
				"../../../src/tools/file-storage/handlers.js"
			);
			mockFetch.mockResolvedValue({ ...sampleFileSystem, name: "renamed" });

			const result = await handleUpdateFileSystem({
				region: "fr-par",
				filesystemId: FS_ID,
				name: "renamed",
				size: 200000000000,
				tags: ["new"],
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `file/v1alpha1/regions/fr-par/filesystems/${FS_ID}`,
				body: JSON.stringify({
					name: "renamed",
					size: 200000000000,
					tags: ["new"],
				}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("renamed");
		});

		it("sends empty body when no optional fields provided", async () => {
			const { handleUpdateFileSystem } = await import(
				"../../../src/tools/file-storage/handlers.js"
			);
			mockFetch.mockResolvedValue(sampleFileSystem);

			await handleUpdateFileSystem({
				region: "fr-par",
				filesystemId: FS_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "PATCH",
				path: `file/v1alpha1/regions/fr-par/filesystems/${FS_ID}`,
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on server failure", async () => {
			const { handleUpdateFileSystem } = await import(
				"../../../src/tools/file-storage/handlers.js"
			);
			const err = new Error("Server error");
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleUpdateFileSystem({
				region: "fr-par",
				filesystemId: FS_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});

	describe("handleDeleteFileSystem", () => {
		it("deletes file system and returns confirmation", async () => {
			const { handleDeleteFileSystem } = await import(
				"../../../src/tools/file-storage/handlers.js"
			);
			mockFetch.mockResolvedValue(undefined);

			const result = await handleDeleteFileSystem({
				region: "fr-par",
				filesystemId: FS_ID,
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "DELETE",
				path: `file/v1alpha1/regions/fr-par/filesystems/${FS_ID}`,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.deleted).toBe(true);
			expect(parsed.id).toBe(FS_ID);
		});

		it("returns error on failure", async () => {
			const { handleDeleteFileSystem } = await import(
				"../../../src/tools/file-storage/handlers.js"
			);
			const err = new Error("Forbidden");
			(err as unknown as { statusCode: number }).statusCode = 403;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleDeleteFileSystem({
				region: "fr-par",
				filesystemId: FS_ID,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleListAttachments", () => {
		it("returns paginated attachments list", async () => {
			const { handleListAttachments } = await import("../../../src/tools/file-storage/handlers.js");
			mockFetch.mockResolvedValue({
				attachments: [sampleAttachment],
				total_count: 1,
			});

			const result = await handleListAttachments({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "file/v1alpha1/regions/fr-par/attachments",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].resource_type).toBe("instance_server");
		});

		it("passes optional filters", async () => {
			const { handleListAttachments } = await import("../../../src/tools/file-storage/handlers.js");
			mockFetch.mockResolvedValue({ attachments: [], total_count: 0 });

			await handleListAttachments({
				region: "fr-par",
				page: 1,
				pageSize: 10,
				filesystemId: FS_ID,
				resourceId: RESOURCE_ID,
				resourceType: "instance_server",
				zone: "fr-par-1",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("filesystem_id")).toBe(FS_ID);
			expect(callArgs.urlParams.get("resource_id")).toBe(RESOURCE_ID);
			expect(callArgs.urlParams.get("resource_type")).toBe("instance_server");
			expect(callArgs.urlParams.get("zone")).toBe("fr-par-1");
		});

		it("returns error on rate limit", async () => {
			const { handleListAttachments } = await import("../../../src/tools/file-storage/handlers.js");
			const err = new Error("Rate limited");
			(err as unknown as { statusCode: number }).statusCode = 429;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleListAttachments({
				region: "fr-par",
				page: 1,
				pageSize: 50,
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});
});
