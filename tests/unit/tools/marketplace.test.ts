import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Client } from "@scaleway/sdk-client";
import { type Mock, describe, expect, it, vi } from "vitest";
import {
	handleGetCategory,
	handleGetImage,
	handleGetLocalImage,
	handleGetVersion,
	handleListCategories,
	handleListImages,
	handleListLocalImages,
	handleListVersions,
} from "../../../src/tools/marketplace/handlers.js";
import { registerMarketplaceTools } from "../../../src/tools/marketplace/index.js";
import {
	GetCategoryInput,
	GetImageInput,
	GetLocalImageInput,
	GetVersionInput,
	ListCategoriesInput,
	ListImagesInput,
	ListLocalImagesInput,
	ListVersionsInput,
} from "../../../src/tools/marketplace/types.js";

// --- Mock client factory ---
function createMockClient(fetchResult: unknown): Client {
	return {
		fetch: vi.fn().mockResolvedValue(fetchResult),
		settings: {} as Client["settings"],
	};
}

function createErrorClient(error: Error): Client {
	return {
		fetch: vi.fn().mockRejectedValue(error),
		settings: {} as Client["settings"],
	};
}

function createErrorWithStatus(message: string, statusCode: number): Error {
	const err = new Error(message);
	(err as Error & { statusCode: number }).statusCode = statusCode;
	return err;
}

// --- Registration ---
describe("marketplace module registration", () => {
	it("registers all 8 marketplace tools without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerMarketplaceTools(server)).not.toThrow();
	});
});

// --- Index callback coverage via mocked server.tool ---
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn(() => ({
		accessKey: "SCWTEST",
		secretKey: "secret",
		defaultProjectId: "proj-id",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	})),
}));

vi.mock("../../../src/shared/client.js", () => {
	const mockFetch = vi.fn().mockResolvedValue({
		images: [],
		local_images: [],
		categories: [],
		versions: [],
		total_count: 0,
	});
	return {
		createScalewayClient: vi.fn(() => ({
			fetch: mockFetch,
			settings: {},
		})),
	};
});

describe("marketplace index tool callbacks", () => {
	it("invokes all 8 tool callbacks through captured handlers", async () => {
		const callbacks: Map<string, (params: Record<string, unknown>) => Promise<unknown>> = new Map();
		const fakeMcpServer = {
			tool: vi.fn(
				(
					name: string,
					_desc: string,
					_schema: unknown,
					cb: (params: Record<string, unknown>) => Promise<unknown>,
				) => {
					callbacks.set(name, cb);
				},
			),
		};

		registerMarketplaceTools(fakeMcpServer as unknown as McpServer);

		expect(callbacks.size).toBe(8);

		// Invoke each callback to cover the index.ts lines
		const toolNames = [
			["scaleway_marketplace_list_images", {}],
			["scaleway_marketplace_get_image", { imageId: "test-id" }],
			["scaleway_marketplace_list_local_images", {}],
			["scaleway_marketplace_get_local_image", { localImageId: "test-id" }],
			["scaleway_marketplace_list_categories", {}],
			["scaleway_marketplace_get_category", { categoryId: "test-id" }],
			["scaleway_marketplace_list_versions", { imageId: "test-id" }],
			["scaleway_marketplace_get_version", { versionId: "test-id" }],
		] as const;
		for (const [name, params] of toolNames) {
			const cb = callbacks.get(name);
			if (!cb) throw new Error(`Missing callback for ${name}`);
			await cb({ ...params });
		}
	});
});

// --- Zod schema validation ---
describe("marketplace types", () => {
	describe("ListImagesInput", () => {
		it("parses with defaults", () => {
			const result = ListImagesInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
			expect(result.includeEol).toBe(false);
		});

		it("parses with all optional fields", () => {
			const result = ListImagesInput.parse({
				page: 2,
				pageSize: 10,
				orderBy: "name_asc",
				arch: "x86_64",
				category: "cat-uuid",
				includeEol: true,
			});
			expect(result.orderBy).toBe("name_asc");
			expect(result.arch).toBe("x86_64");
			expect(result.category).toBe("cat-uuid");
			expect(result.includeEol).toBe(true);
		});

		it("rejects invalid orderBy", () => {
			expect(() => ListImagesInput.parse({ orderBy: "invalid" })).toThrow();
		});

		it("rejects page < 1", () => {
			expect(() => ListImagesInput.parse({ page: 0 })).toThrow();
		});

		it("rejects pageSize > 100", () => {
			expect(() => ListImagesInput.parse({ pageSize: 101 })).toThrow();
		});

		it("rejects pageSize < 1", () => {
			expect(() => ListImagesInput.parse({ pageSize: 0 })).toThrow();
		});
	});

	describe("GetImageInput", () => {
		it("parses valid input", () => {
			const result = GetImageInput.parse({ imageId: "uuid-123" });
			expect(result.imageId).toBe("uuid-123");
		});

		it("rejects missing imageId", () => {
			expect(() => GetImageInput.parse({})).toThrow();
		});
	});

	describe("ListLocalImagesInput", () => {
		it("parses with defaults", () => {
			const result = ListLocalImagesInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("parses with all optional filters", () => {
			const result = ListLocalImagesInput.parse({
				orderBy: "type_asc",
				zone: "fr-par-1",
				arch: "arm64",
				imageId: "img-uuid",
				versionId: "ver-uuid",
				imageLabel: "ubuntu",
				type: "instance_local",
			});
			expect(result.orderBy).toBe("type_asc");
			expect(result.zone).toBe("fr-par-1");
			expect(result.type).toBe("instance_local");
		});

		it("rejects invalid orderBy", () => {
			expect(() => ListLocalImagesInput.parse({ orderBy: "invalid" })).toThrow();
		});

		it("rejects invalid type", () => {
			expect(() => ListLocalImagesInput.parse({ type: "invalid" })).toThrow();
		});
	});

	describe("GetLocalImageInput", () => {
		it("parses valid input", () => {
			const result = GetLocalImageInput.parse({ localImageId: "uuid-456" });
			expect(result.localImageId).toBe("uuid-456");
		});

		it("rejects missing localImageId", () => {
			expect(() => GetLocalImageInput.parse({})).toThrow();
		});
	});

	describe("ListCategoriesInput", () => {
		it("parses with defaults", () => {
			const result = ListCategoriesInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("parses custom page and size", () => {
			const result = ListCategoriesInput.parse({ page: 3, pageSize: 25 });
			expect(result.page).toBe(3);
			expect(result.pageSize).toBe(25);
		});
	});

	describe("GetCategoryInput", () => {
		it("parses valid input", () => {
			const result = GetCategoryInput.parse({ categoryId: "cat-uuid" });
			expect(result.categoryId).toBe("cat-uuid");
		});

		it("rejects missing categoryId", () => {
			expect(() => GetCategoryInput.parse({})).toThrow();
		});
	});

	describe("ListVersionsInput", () => {
		it("parses with required imageId and defaults", () => {
			const result = ListVersionsInput.parse({ imageId: "img-uuid" });
			expect(result.imageId).toBe("img-uuid");
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("parses with all fields", () => {
			const result = ListVersionsInput.parse({
				imageId: "img-uuid",
				page: 2,
				pageSize: 20,
				orderBy: "created_at_desc",
			});
			expect(result.orderBy).toBe("created_at_desc");
		});

		it("rejects missing imageId", () => {
			expect(() => ListVersionsInput.parse({})).toThrow();
		});

		it("rejects invalid orderBy", () => {
			expect(() => ListVersionsInput.parse({ imageId: "x", orderBy: "invalid" })).toThrow();
		});
	});

	describe("GetVersionInput", () => {
		it("parses valid input", () => {
			const result = GetVersionInput.parse({ versionId: "ver-uuid" });
			expect(result.versionId).toBe("ver-uuid");
		});

		it("rejects missing versionId", () => {
			expect(() => GetVersionInput.parse({})).toThrow();
		});
	});
});

// --- Handlers ---
describe("marketplace handlers", () => {
	describe("handleListImages", () => {
		it("returns paginated images on success", async () => {
			const mockImages = [{ id: "img-1", name: "Ubuntu" }];
			const client = createMockClient({ images: mockImages, total_count: 1 });
			const input = ListImagesInput.parse({});
			const result = await handleListImages(client, input);

			expect(result.content).toHaveLength(1);
			const data = JSON.parse(result.content[0].text);
			expect(data.items).toEqual(mockImages);
			expect(data.totalCount).toBe(1);
			expect(data.page).toBe(1);
			expect(data.pageSize).toBe(50);
		});

		it("passes all filters to the API", async () => {
			const client = createMockClient({ images: [], total_count: 0 });
			const input = ListImagesInput.parse({
				page: 2,
				pageSize: 10,
				orderBy: "name_desc",
				arch: "arm64",
				category: "cat-1",
				includeEol: true,
			});
			await handleListImages(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/marketplace/v2/images");
			const params = fetchCall.urlParams as URLSearchParams;
			expect(params.get("page")).toBe("2");
			expect(params.get("page_size")).toBe("10");
			expect(params.get("order_by")).toBe("name_desc");
			expect(params.get("arch")).toBe("arm64");
			expect(params.get("category")).toBe("cat-1");
			expect(params.get("include_eol")).toBe("true");
		});

		it("omits optional filters when not provided", async () => {
			const client = createMockClient({ images: [], total_count: 0 });
			const input = ListImagesInput.parse({});
			await handleListImages(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			const params = fetchCall.urlParams as URLSearchParams;
			expect(params.has("order_by")).toBe(false);
			expect(params.has("arch")).toBe(false);
			expect(params.has("category")).toBe(false);
			expect(params.get("include_eol")).toBe("false");
		});

		it("returns error response on API failure", async () => {
			const client = createErrorClient(createErrorWithStatus("not found", 404));
			const input = ListImagesInput.parse({});
			const result = await handleListImages(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("not_found");
			expect(data.error.statusCode).toBe(404);
		});
	});

	describe("handleGetImage", () => {
		it("returns image on success", async () => {
			const mockImage = { id: "img-1", name: "Ubuntu", label: "ubuntu" };
			const client = createMockClient(mockImage);
			const input = GetImageInput.parse({ imageId: "img-1" });
			const result = await handleGetImage(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toEqual(mockImage);
		});

		it("calls correct API path", async () => {
			const client = createMockClient({});
			const input = GetImageInput.parse({ imageId: "img-1" });
			await handleGetImage(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/marketplace/v2/images/img-1");
		});

		it("returns error response on API failure", async () => {
			const client = createErrorClient(createErrorWithStatus("forbidden", 403));
			const input = GetImageInput.parse({ imageId: "img-1" });
			const result = await handleGetImage(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("handleListLocalImages", () => {
		it("returns paginated local images on success", async () => {
			const mockLocalImages = [{ id: "li-1", arch: "x86_64", zone: "fr-par-1" }];
			const client = createMockClient({ local_images: mockLocalImages, total_count: 1 });
			const input = ListLocalImagesInput.parse({});
			const result = await handleListLocalImages(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data.items).toEqual(mockLocalImages);
			expect(data.totalCount).toBe(1);
		});

		it("passes all filters to the API", async () => {
			const client = createMockClient({ local_images: [], total_count: 0 });
			const input = ListLocalImagesInput.parse({
				page: 3,
				pageSize: 5,
				orderBy: "type_desc",
				zone: "fr-par-1",
				arch: "arm64",
				imageId: "img-1",
				versionId: "ver-1",
				imageLabel: "ubuntu",
				type: "instance_sbs",
			});
			await handleListLocalImages(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			expect(fetchCall.path).toBe("/marketplace/v2/local-images");
			const params = fetchCall.urlParams as URLSearchParams;
			expect(params.get("page")).toBe("3");
			expect(params.get("page_size")).toBe("5");
			expect(params.get("order_by")).toBe("type_desc");
			expect(params.get("zone")).toBe("fr-par-1");
			expect(params.get("arch")).toBe("arm64");
			expect(params.get("image_id")).toBe("img-1");
			expect(params.get("version_id")).toBe("ver-1");
			expect(params.get("image_label")).toBe("ubuntu");
			expect(params.get("type")).toBe("instance_sbs");
		});

		it("omits optional filters when not provided", async () => {
			const client = createMockClient({ local_images: [], total_count: 0 });
			const input = ListLocalImagesInput.parse({});
			await handleListLocalImages(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			const params = fetchCall.urlParams as URLSearchParams;
			expect(params.has("order_by")).toBe(false);
			expect(params.has("zone")).toBe(false);
			expect(params.has("arch")).toBe(false);
			expect(params.has("image_id")).toBe(false);
			expect(params.has("version_id")).toBe(false);
			expect(params.has("image_label")).toBe(false);
			expect(params.has("type")).toBe(false);
		});

		it("returns error response on API failure", async () => {
			const client = createErrorClient(createErrorWithStatus("rate limited", 429));
			const input = ListLocalImagesInput.parse({});
			const result = await handleListLocalImages(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("rate_limited");
		});
	});

	describe("handleGetLocalImage", () => {
		it("returns local image on success", async () => {
			const mockLocal = { id: "li-1", arch: "x86_64", zone: "fr-par-1" };
			const client = createMockClient(mockLocal);
			const input = GetLocalImageInput.parse({ localImageId: "li-1" });
			const result = await handleGetLocalImage(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toEqual(mockLocal);
		});

		it("calls correct API path", async () => {
			const client = createMockClient({});
			const input = GetLocalImageInput.parse({ localImageId: "li-1" });
			await handleGetLocalImage(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/marketplace/v2/local-images/li-1");
		});

		it("returns error response on API failure", async () => {
			const client = createErrorClient(new Error("network error"));
			const input = GetLocalImageInput.parse({ localImageId: "li-1" });
			const result = await handleGetLocalImage(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
		});
	});

	describe("handleListCategories", () => {
		it("returns paginated categories on success", async () => {
			const mockCategories = [{ id: "cat-1", name: "OS", description: "Operating Systems" }];
			const client = createMockClient({ categories: mockCategories, total_count: 1 });
			const input = ListCategoriesInput.parse({});
			const result = await handleListCategories(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data.items).toEqual(mockCategories);
			expect(data.totalCount).toBe(1);
		});

		it("passes pagination params to the API", async () => {
			const client = createMockClient({ categories: [], total_count: 0 });
			const input = ListCategoriesInput.parse({ page: 2, pageSize: 25 });
			await handleListCategories(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			expect(fetchCall.path).toBe("/marketplace/v2/categories");
			const params = fetchCall.urlParams as URLSearchParams;
			expect(params.get("page")).toBe("2");
			expect(params.get("page_size")).toBe("25");
		});

		it("returns error response on API failure", async () => {
			const client = createErrorClient(createErrorWithStatus("internal", 500));
			const input = ListCategoriesInput.parse({});
			const result = await handleListCategories(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("server_error");
		});
	});

	describe("handleGetCategory", () => {
		it("returns category on success", async () => {
			const mockCategory = { id: "cat-1", name: "OS", description: "Operating Systems" };
			const client = createMockClient(mockCategory);
			const input = GetCategoryInput.parse({ categoryId: "cat-1" });
			const result = await handleGetCategory(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toEqual(mockCategory);
		});

		it("calls correct API path", async () => {
			const client = createMockClient({});
			const input = GetCategoryInput.parse({ categoryId: "cat-1" });
			await handleGetCategory(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/marketplace/v2/categories/cat-1");
		});

		it("returns error response on API failure", async () => {
			const client = createErrorClient(createErrorWithStatus("not found", 404));
			const input = GetCategoryInput.parse({ categoryId: "cat-1" });
			const result = await handleGetCategory(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("not_found");
		});
	});

	describe("handleListVersions", () => {
		it("returns paginated versions on success", async () => {
			const mockVersions = [{ id: "ver-1", name: "1.0.0" }];
			const client = createMockClient({ versions: mockVersions, total_count: 1 });
			const input = ListVersionsInput.parse({ imageId: "img-1" });
			const result = await handleListVersions(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data.items).toEqual(mockVersions);
			expect(data.totalCount).toBe(1);
		});

		it("passes imageId and optional orderBy to the API", async () => {
			const client = createMockClient({ versions: [], total_count: 0 });
			const input = ListVersionsInput.parse({
				imageId: "img-1",
				orderBy: "created_at_asc",
				page: 2,
				pageSize: 20,
			});
			await handleListVersions(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			expect(fetchCall.path).toBe("/marketplace/v2/versions");
			const params = fetchCall.urlParams as URLSearchParams;
			expect(params.get("image_id")).toBe("img-1");
			expect(params.get("order_by")).toBe("created_at_asc");
			expect(params.get("page")).toBe("2");
			expect(params.get("page_size")).toBe("20");
		});

		it("omits orderBy when not provided", async () => {
			const client = createMockClient({ versions: [], total_count: 0 });
			const input = ListVersionsInput.parse({ imageId: "img-1" });
			await handleListVersions(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			const params = fetchCall.urlParams as URLSearchParams;
			expect(params.has("order_by")).toBe(false);
			expect(params.get("image_id")).toBe("img-1");
		});

		it("returns error response on API failure", async () => {
			const client = createErrorClient(createErrorWithStatus("unauthorized", 401));
			const input = ListVersionsInput.parse({ imageId: "img-1" });
			const result = await handleListVersions(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetVersion", () => {
		it("returns version on success", async () => {
			const mockVersion = { id: "ver-1", name: "1.0.0" };
			const client = createMockClient(mockVersion);
			const input = GetVersionInput.parse({ versionId: "ver-1" });
			const result = await handleGetVersion(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toEqual(mockVersion);
		});

		it("calls correct API path", async () => {
			const client = createMockClient({});
			const input = GetVersionInput.parse({ versionId: "ver-1" });
			await handleGetVersion(client, input);

			const fetchCall = (client.fetch as Mock).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/marketplace/v2/versions/ver-1");
		});

		it("returns error response on API failure", async () => {
			const client = createErrorClient(createErrorWithStatus("bad request", 400));
			const input = GetVersionInput.parse({ versionId: "ver-1" });
			const result = await handleGetVersion(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe("invalid_input");
		});
	});
});
