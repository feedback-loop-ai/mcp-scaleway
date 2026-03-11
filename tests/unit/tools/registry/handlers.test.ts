import type { Client } from "@scaleway/sdk-client";
import { describe, expect, it, vi } from "vitest";

interface ErrorResult {
	content: { type: string; text: string }[];
	isError: boolean;
}
import {
	handleCreateNamespace,
	handleDeleteImage,
	handleDeleteNamespace,
	handleDeleteTag,
	handleGetImage,
	handleGetNamespace,
	handleGetTag,
	handleListImages,
	handleListNamespaces,
	handleListTags,
	handleUpdateImage,
	handleUpdateNamespace,
} from "../../../../src/tools/registry/handlers.js";

function createMockClient(response: unknown): Client {
	return {
		fetch: vi.fn().mockResolvedValue(response),
		settings: {},
	} as unknown as Client;
}

function createErrorClient(error: Error): Client {
	return {
		fetch: vi.fn().mockRejectedValue(error),
		settings: {},
	} as unknown as Client;
}

function parseContent(result: { content: { text: string }[] }) {
	return JSON.parse(result.content[0].text);
}

const REGION = "fr-par";
const UUID = "11111111-1111-1111-1111-111111111111";

describe("registry handlers", () => {
	// --- Namespace Handlers ---

	describe("handleListNamespaces", () => {
		it("returns namespaces on success", async () => {
			const mockResponse = { namespaces: [{ id: UUID, name: "test-ns" }], total_count: 1 };
			const client = createMockClient(mockResponse);
			const result = await handleListNamespaces(client, { region: REGION });
			expect(parseContent(result)).toEqual(mockResponse);
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/registry/v1/regions/fr-par/namespaces",
				}),
			);
		});

		it("passes pagination and filter params", async () => {
			const client = createMockClient({ namespaces: [], total_count: 0 });
			await handleListNamespaces(client, {
				region: REGION,
				page: 2,
				page_size: 10,
				project_id: UUID,
				name: "filter",
				order_by: "created_at_asc",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.urlParams.get("page")).toBe("2");
			expect(call.urlParams.get("page_size")).toBe("10");
			expect(call.urlParams.get("project_id")).toBe(UUID);
			expect(call.urlParams.get("name")).toBe("filter");
			expect(call.urlParams.get("order_by")).toBe("created_at_asc");
		});

		it("returns error response on failure", async () => {
			const error = Object.assign(new Error("Not found"), { statusCode: 404 });
			const client = createErrorClient(error);
			const result = await handleListNamespaces(client, { region: REGION });
			expect((result as ErrorResult).isError).toBe(true);
			const parsed = parseContent(result as { content: { text: string }[] });
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleGetNamespace", () => {
		it("returns namespace on success", async () => {
			const mockResponse = { id: UUID, name: "test-ns" };
			const client = createMockClient(mockResponse);
			const result = await handleGetNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			expect(parseContent(result)).toEqual(mockResponse);
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `/registry/v1/regions/fr-par/namespaces/${UUID}`,
				}),
			);
		});

		it("returns error on failure", async () => {
			const error = Object.assign(new Error("Forbidden"), { statusCode: 403 });
			const client = createErrorClient(error);
			const result = await handleGetNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleCreateNamespace", () => {
		it("creates namespace with required fields", async () => {
			const mockResponse = { id: UUID, name: "new-ns" };
			const client = createMockClient(mockResponse);
			const result = await handleCreateNamespace(client, {
				region: REGION,
				name: "new-ns",
			});
			expect(parseContent(result)).toEqual(mockResponse);
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("POST");
			expect(call.path).toBe("/registry/v1/regions/fr-par/namespaces");
			expect(JSON.parse(call.body)).toEqual({ name: "new-ns" });
		});

		it("creates namespace with optional fields", async () => {
			const client = createMockClient({ id: UUID });
			await handleCreateNamespace(client, {
				region: REGION,
				name: "new-ns",
				project_id: UUID,
				description: "desc",
				is_public: true,
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			const body = JSON.parse(call.body);
			expect(body.project_id).toBe(UUID);
			expect(body.description).toBe("desc");
			expect(body.is_public).toBe(true);
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("Server error"));
			const result = await handleCreateNamespace(client, {
				region: REGION,
				name: "new-ns",
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleUpdateNamespace", () => {
		it("updates namespace description", async () => {
			const mockResponse = { id: UUID, description: "updated" };
			const client = createMockClient(mockResponse);
			const result = await handleUpdateNamespace(client, {
				region: REGION,
				namespace_id: UUID,
				description: "updated",
			});
			expect(parseContent(result)).toEqual(mockResponse);
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("PATCH");
			expect(JSON.parse(call.body)).toEqual({ description: "updated" });
		});

		it("updates namespace is_public", async () => {
			const client = createMockClient({ id: UUID });
			await handleUpdateNamespace(client, {
				region: REGION,
				namespace_id: UUID,
				is_public: false,
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(JSON.parse(call.body)).toEqual({ is_public: false });
		});

		it("sends empty body when no optional fields", async () => {
			const client = createMockClient({ id: UUID });
			await handleUpdateNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(JSON.parse(call.body)).toEqual({});
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("fail"));
			const result = await handleUpdateNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleDeleteNamespace", () => {
		it("deletes namespace on success", async () => {
			const mockResponse = { id: UUID };
			const client = createMockClient(mockResponse);
			const result = await handleDeleteNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			expect(parseContent(result)).toEqual(mockResponse);
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: `/registry/v1/regions/fr-par/namespaces/${UUID}`,
				}),
			);
		});

		it("returns error on failure", async () => {
			const error = Object.assign(new Error("Not found"), { statusCode: 404 });
			const client = createErrorClient(error);
			const result = await handleDeleteNamespace(client, {
				region: REGION,
				namespace_id: UUID,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	// --- Image Handlers ---

	describe("handleListImages", () => {
		it("returns images on success", async () => {
			const mockResponse = { images: [{ id: UUID }], total_count: 1 };
			const client = createMockClient(mockResponse);
			const result = await handleListImages(client, { region: REGION });
			expect(parseContent(result)).toEqual(mockResponse);
		});

		it("passes filters", async () => {
			const client = createMockClient({ images: [], total_count: 0 });
			await handleListImages(client, {
				region: REGION,
				namespace_id: UUID,
				name: "myimg",
				page: 1,
				page_size: 20,
				order_by: "name_asc",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.urlParams.get("namespace_id")).toBe(UUID);
			expect(call.urlParams.get("name")).toBe("myimg");
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("fail"));
			const result = await handleListImages(client, { region: REGION });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleGetImage", () => {
		it("returns image on success", async () => {
			const mockResponse = { id: UUID, name: "myimage" };
			const client = createMockClient(mockResponse);
			const result = await handleGetImage(client, { region: REGION, image_id: UUID });
			expect(parseContent(result)).toEqual(mockResponse);
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `/registry/v1/regions/fr-par/images/${UUID}`,
				}),
			);
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("fail"));
			const result = await handleGetImage(client, { region: REGION, image_id: UUID });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleUpdateImage", () => {
		it("updates image visibility", async () => {
			const client = createMockClient({ id: UUID, visibility: "public" });
			const result = await handleUpdateImage(client, {
				region: REGION,
				image_id: UUID,
				visibility: "public",
			});
			expect(parseContent(result).visibility).toBe("public");
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.method).toBe("PATCH");
			expect(JSON.parse(call.body)).toEqual({ visibility: "public" });
		});

		it("sends empty body when no visibility", async () => {
			const client = createMockClient({ id: UUID });
			await handleUpdateImage(client, { region: REGION, image_id: UUID });
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(JSON.parse(call.body)).toEqual({});
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("fail"));
			const result = await handleUpdateImage(client, {
				region: REGION,
				image_id: UUID,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleDeleteImage", () => {
		it("deletes image on success", async () => {
			const client = createMockClient({ id: UUID });
			const result = await handleDeleteImage(client, {
				region: REGION,
				image_id: UUID,
			});
			expect(parseContent(result)).toEqual({ id: UUID });
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: `/registry/v1/regions/fr-par/images/${UUID}`,
				}),
			);
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("fail"));
			const result = await handleDeleteImage(client, {
				region: REGION,
				image_id: UUID,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	// --- Tag Handlers ---

	describe("handleListTags", () => {
		it("returns tags on success", async () => {
			const mockResponse = { tags: [{ id: UUID, name: "latest" }], total_count: 1 };
			const client = createMockClient(mockResponse);
			const result = await handleListTags(client, {
				region: REGION,
				image_id: UUID,
			});
			expect(parseContent(result)).toEqual(mockResponse);
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `/registry/v1/regions/fr-par/images/${UUID}/tags`,
				}),
			);
		});

		it("passes filters", async () => {
			const client = createMockClient({ tags: [], total_count: 0 });
			await handleListTags(client, {
				region: REGION,
				image_id: UUID,
				page: 3,
				page_size: 25,
				name: "v1",
				order_by: "name_asc",
			});
			const call = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(call.urlParams.get("page")).toBe("3");
			expect(call.urlParams.get("name")).toBe("v1");
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("fail"));
			const result = await handleListTags(client, {
				region: REGION,
				image_id: UUID,
			});
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleGetTag", () => {
		it("returns tag on success", async () => {
			const mockResponse = { id: UUID, name: "latest" };
			const client = createMockClient(mockResponse);
			const result = await handleGetTag(client, { region: REGION, tag_id: UUID });
			expect(parseContent(result)).toEqual(mockResponse);
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: `/registry/v1/regions/fr-par/tags/${UUID}`,
				}),
			);
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("fail"));
			const result = await handleGetTag(client, { region: REGION, tag_id: UUID });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});

	describe("handleDeleteTag", () => {
		it("deletes tag on success", async () => {
			const client = createMockClient({ id: UUID });
			const result = await handleDeleteTag(client, { region: REGION, tag_id: UUID });
			expect(parseContent(result)).toEqual({ id: UUID });
			expect(client.fetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "DELETE",
					path: `/registry/v1/regions/fr-par/tags/${UUID}`,
				}),
			);
		});

		it("returns error on failure", async () => {
			const client = createErrorClient(new Error("fail"));
			const result = await handleDeleteTag(client, { region: REGION, tag_id: UUID });
			expect((result as ErrorResult).isError).toBe(true);
		});
	});
});
