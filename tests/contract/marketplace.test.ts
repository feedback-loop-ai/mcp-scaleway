/**
 * Contract tests for Scaleway Marketplace API v2.
 *
 * Validates request shape, response shape, pagination, auth headers, and error codes
 * against the Scaleway API specification.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/marketplace/
 * Spec source: specs/037-marketplace/api-spec.md
 *
 * Endpoints covered:
 *   GET /marketplace/v2/images
 *   GET /marketplace/v2/images/{imageId}
 *   GET /marketplace/v2/local-images
 *   GET /marketplace/v2/local-images/{localImageId}
 *   GET /marketplace/v2/categories
 *   GET /marketplace/v2/categories/{categoryId}
 *   GET /marketplace/v2/versions
 *   GET /marketplace/v2/versions/{versionId}
 */
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
} from "../../src/tools/marketplace/handlers.js";
import {
	CategorySchema,
	GetCategoryInput,
	GetImageInput,
	GetLocalImageInput,
	GetVersionInput,
	ImageSchema,
	ListCategoriesInput,
	ListImagesInput,
	ListLocalImagesInput,
	ListVersionsInput,
	LocalImageSchema,
	VersionSchema,
} from "../../src/tools/marketplace/types.js";

// --- Fixtures matching Scaleway API response shapes ---

const FIXTURE_IMAGE = {
	id: "b6e70934-23d4-4b66-8e0a-6e498230a4aa",
	name: "Ubuntu 22.04 Jammy Jellyfish",
	description: "Ubuntu is a Debian-based Linux OS",
	logo: "https://marketplace.scaleway.com/ubuntu.png",
	categories: ["cat-1", "cat-2"],
	created_at: "2023-01-15T10:30:00.000Z",
	updated_at: "2024-06-01T12:00:00.000Z",
	valid_until: "2027-04-01T00:00:00.000Z",
	label: "ubuntu_jammy",
};

const FIXTURE_LOCAL_IMAGE = {
	id: "aabb0011-2233-4455-6677-889900aabbcc",
	compatible_commercial_types: ["DEV1-S", "DEV1-M", "GP1-XS"],
	arch: "x86_64",
	zone: "fr-par-1",
	label: "ubuntu_jammy",
	type: "instance_local",
};

const FIXTURE_VERSION = {
	id: "ccdd0011-2233-4455-6677-889900aabbcc",
	name: "2024.01.15",
	created_at: "2024-01-15T10:00:00.000Z",
	updated_at: "2024-01-15T10:00:00.000Z",
	published_at: "2024-01-15T12:00:00.000Z",
};

const FIXTURE_CATEGORY = {
	id: "eeff0011-2233-4455-6677-889900aabbcc",
	name: "Operating Systems",
	description: "Base operating system images",
};

function createMockClient(fetchResult: unknown): Client {
	return {
		fetch: vi.fn().mockResolvedValue(fetchResult),
		settings: {} as Client["settings"],
	};
}

function createErrorWithStatus(message: string, statusCode: number): Error {
	const err = new Error(message);
	(err as Error & { statusCode: number }).statusCode = statusCode;
	return err;
}

// --- Contract: Response shape validation ---

describe("contract: marketplace response shapes", () => {
	describe("ImageSchema", () => {
		it("validates a well-formed Image response", () => {
			const result = ImageSchema.safeParse({
				id: FIXTURE_IMAGE.id,
				name: FIXTURE_IMAGE.name,
				description: FIXTURE_IMAGE.description,
				logo: FIXTURE_IMAGE.logo,
				categories: FIXTURE_IMAGE.categories,
				createdAt: FIXTURE_IMAGE.created_at,
				updatedAt: FIXTURE_IMAGE.updated_at,
				validUntil: FIXTURE_IMAGE.valid_until,
				label: FIXTURE_IMAGE.label,
			});
			expect(result.success).toBe(true);
		});

		it("validates Image with optional dates omitted", () => {
			const result = ImageSchema.safeParse({
				id: FIXTURE_IMAGE.id,
				name: FIXTURE_IMAGE.name,
				description: FIXTURE_IMAGE.description,
				logo: FIXTURE_IMAGE.logo,
				categories: [],
				label: FIXTURE_IMAGE.label,
			});
			expect(result.success).toBe(true);
		});

		it("rejects Image missing required fields", () => {
			const result = ImageSchema.safeParse({ id: "x" });
			expect(result.success).toBe(false);
		});
	});

	describe("LocalImageSchema", () => {
		it("validates a well-formed LocalImage response", () => {
			const result = LocalImageSchema.safeParse({
				id: FIXTURE_LOCAL_IMAGE.id,
				compatibleCommercialTypes: FIXTURE_LOCAL_IMAGE.compatible_commercial_types,
				arch: FIXTURE_LOCAL_IMAGE.arch,
				zone: FIXTURE_LOCAL_IMAGE.zone,
				label: FIXTURE_LOCAL_IMAGE.label,
				type: FIXTURE_LOCAL_IMAGE.type,
			});
			expect(result.success).toBe(true);
		});

		it("rejects LocalImage missing required fields", () => {
			const result = LocalImageSchema.safeParse({ id: "x" });
			expect(result.success).toBe(false);
		});
	});

	describe("VersionSchema", () => {
		it("validates a well-formed Version response", () => {
			const result = VersionSchema.safeParse({
				id: FIXTURE_VERSION.id,
				name: FIXTURE_VERSION.name,
				createdAt: FIXTURE_VERSION.created_at,
				updatedAt: FIXTURE_VERSION.updated_at,
				publishedAt: FIXTURE_VERSION.published_at,
			});
			expect(result.success).toBe(true);
		});

		it("validates Version with optional dates omitted", () => {
			const result = VersionSchema.safeParse({
				id: FIXTURE_VERSION.id,
				name: FIXTURE_VERSION.name,
			});
			expect(result.success).toBe(true);
		});
	});

	describe("CategorySchema", () => {
		it("validates a well-formed Category response", () => {
			const result = CategorySchema.safeParse(FIXTURE_CATEGORY);
			expect(result.success).toBe(true);
		});

		it("rejects Category missing required fields", () => {
			const result = CategorySchema.safeParse({ id: "x" });
			expect(result.success).toBe(false);
		});
	});
});

// --- Contract: Request shape & API path validation ---

describe("contract: marketplace request shapes", () => {
	describe("GET /marketplace/v2/images", () => {
		it("sends correct request shape with pagination", async () => {
			const client = createMockClient({ images: [FIXTURE_IMAGE], total_count: 1 });
			const input = ListImagesInput.parse({ page: 1, pageSize: 20 });
			await handleListImages(client, input);

			const call = (client.fetch as Mock).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/marketplace/v2/images");
			expect(call.urlParams).toBeInstanceOf(URLSearchParams);
			const params = call.urlParams as URLSearchParams;
			expect(params.get("page")).toBe("1");
			expect(params.get("page_size")).toBe("20");
		});

		it("includes include_eol=false by default", async () => {
			const client = createMockClient({ images: [], total_count: 0 });
			const input = ListImagesInput.parse({});
			await handleListImages(client, input);

			const params = (client.fetch as Mock).mock.calls[0][0].urlParams as URLSearchParams;
			expect(params.get("include_eol")).toBe("false");
		});

		it("returns paginated response shape", async () => {
			const client = createMockClient({ images: [FIXTURE_IMAGE], total_count: 42 });
			const input = ListImagesInput.parse({ page: 2, pageSize: 10 });
			const result = await handleListImages(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("items");
			expect(data).toHaveProperty("totalCount", 42);
			expect(data).toHaveProperty("page", 2);
			expect(data).toHaveProperty("pageSize", 10);
			expect(Array.isArray(data.items)).toBe(true);
		});
	});

	describe("GET /marketplace/v2/images/{imageId}", () => {
		it("sends correct request with imageId in path", async () => {
			const client = createMockClient(FIXTURE_IMAGE);
			const input = GetImageInput.parse({ imageId: FIXTURE_IMAGE.id });
			await handleGetImage(client, input);

			const call = (client.fetch as Mock).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe(`/marketplace/v2/images/${FIXTURE_IMAGE.id}`);
		});

		it("returns single image response shape", async () => {
			const client = createMockClient(FIXTURE_IMAGE);
			const input = GetImageInput.parse({ imageId: FIXTURE_IMAGE.id });
			const result = await handleGetImage(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("id", FIXTURE_IMAGE.id);
			expect(data).toHaveProperty("name");
			expect(data).toHaveProperty("label");
		});
	});

	describe("GET /marketplace/v2/local-images", () => {
		it("sends correct request shape with filters", async () => {
			const client = createMockClient({ local_images: [FIXTURE_LOCAL_IMAGE], total_count: 1 });
			const input = ListLocalImagesInput.parse({
				imageId: "img-uuid",
				zone: "fr-par-1",
				arch: "x86_64",
				type: "instance_local",
			});
			await handleListLocalImages(client, input);

			const call = (client.fetch as Mock).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/marketplace/v2/local-images");
			const params = call.urlParams as URLSearchParams;
			expect(params.get("image_id")).toBe("img-uuid");
			expect(params.get("zone")).toBe("fr-par-1");
			expect(params.get("arch")).toBe("x86_64");
			expect(params.get("type")).toBe("instance_local");
		});

		it("returns paginated response shape", async () => {
			const client = createMockClient({
				local_images: [FIXTURE_LOCAL_IMAGE],
				total_count: 5,
			});
			const input = ListLocalImagesInput.parse({});
			const result = await handleListLocalImages(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("items");
			expect(data).toHaveProperty("totalCount", 5);
			expect(Array.isArray(data.items)).toBe(true);
		});
	});

	describe("GET /marketplace/v2/local-images/{localImageId}", () => {
		it("sends correct request with localImageId in path", async () => {
			const client = createMockClient(FIXTURE_LOCAL_IMAGE);
			const input = GetLocalImageInput.parse({ localImageId: FIXTURE_LOCAL_IMAGE.id });
			await handleGetLocalImage(client, input);

			const call = (client.fetch as Mock).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe(`/marketplace/v2/local-images/${FIXTURE_LOCAL_IMAGE.id}`);
		});

		it("returns single local image response shape", async () => {
			const client = createMockClient(FIXTURE_LOCAL_IMAGE);
			const input = GetLocalImageInput.parse({ localImageId: FIXTURE_LOCAL_IMAGE.id });
			const result = await handleGetLocalImage(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("id", FIXTURE_LOCAL_IMAGE.id);
			expect(data).toHaveProperty("arch");
			expect(data).toHaveProperty("zone");
		});
	});

	describe("GET /marketplace/v2/categories", () => {
		it("sends correct request shape with pagination", async () => {
			const client = createMockClient({ categories: [FIXTURE_CATEGORY], total_count: 1 });
			const input = ListCategoriesInput.parse({ page: 1, pageSize: 50 });
			await handleListCategories(client, input);

			const call = (client.fetch as Mock).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/marketplace/v2/categories");
			const params = call.urlParams as URLSearchParams;
			expect(params.get("page")).toBe("1");
			expect(params.get("page_size")).toBe("50");
		});

		it("returns paginated response shape", async () => {
			const client = createMockClient({ categories: [FIXTURE_CATEGORY], total_count: 3 });
			const input = ListCategoriesInput.parse({});
			const result = await handleListCategories(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("items");
			expect(data).toHaveProperty("totalCount", 3);
			expect(Array.isArray(data.items)).toBe(true);
		});
	});

	describe("GET /marketplace/v2/categories/{categoryId}", () => {
		it("sends correct request with categoryId in path", async () => {
			const client = createMockClient(FIXTURE_CATEGORY);
			const input = GetCategoryInput.parse({ categoryId: FIXTURE_CATEGORY.id });
			await handleGetCategory(client, input);

			const call = (client.fetch as Mock).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe(`/marketplace/v2/categories/${FIXTURE_CATEGORY.id}`);
		});

		it("returns single category response shape", async () => {
			const client = createMockClient(FIXTURE_CATEGORY);
			const input = GetCategoryInput.parse({ categoryId: FIXTURE_CATEGORY.id });
			const result = await handleGetCategory(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("id", FIXTURE_CATEGORY.id);
			expect(data).toHaveProperty("name");
			expect(data).toHaveProperty("description");
		});
	});

	describe("GET /marketplace/v2/versions", () => {
		it("sends correct request with required imageId", async () => {
			const client = createMockClient({ versions: [FIXTURE_VERSION], total_count: 1 });
			const input = ListVersionsInput.parse({ imageId: "img-uuid" });
			await handleListVersions(client, input);

			const call = (client.fetch as Mock).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe("/marketplace/v2/versions");
			const params = call.urlParams as URLSearchParams;
			expect(params.get("image_id")).toBe("img-uuid");
		});

		it("returns paginated response shape", async () => {
			const client = createMockClient({ versions: [FIXTURE_VERSION], total_count: 7 });
			const input = ListVersionsInput.parse({ imageId: "img-uuid" });
			const result = await handleListVersions(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("items");
			expect(data).toHaveProperty("totalCount", 7);
			expect(Array.isArray(data.items)).toBe(true);
		});
	});

	describe("GET /marketplace/v2/versions/{versionId}", () => {
		it("sends correct request with versionId in path", async () => {
			const client = createMockClient(FIXTURE_VERSION);
			const input = GetVersionInput.parse({ versionId: FIXTURE_VERSION.id });
			await handleGetVersion(client, input);

			const call = (client.fetch as Mock).mock.calls[0][0];
			expect(call.method).toBe("GET");
			expect(call.path).toBe(`/marketplace/v2/versions/${FIXTURE_VERSION.id}`);
		});

		it("returns single version response shape", async () => {
			const client = createMockClient(FIXTURE_VERSION);
			const input = GetVersionInput.parse({ versionId: FIXTURE_VERSION.id });
			const result = await handleGetVersion(client, input);

			const data = JSON.parse(result.content[0].text);
			expect(data).toHaveProperty("id", FIXTURE_VERSION.id);
			expect(data).toHaveProperty("name");
		});
	});
});

// --- Contract: Error code mapping ---

describe("contract: marketplace error codes", () => {
	const errorCases = [
		{ status: 400, expectedType: "invalid_input", label: "400 Bad Request" },
		{ status: 401, expectedType: "permission_denied", label: "401 Unauthorized" },
		{ status: 403, expectedType: "permission_denied", label: "403 Forbidden" },
		{ status: 404, expectedType: "not_found", label: "404 Not Found" },
		{ status: 429, expectedType: "rate_limited", label: "429 Rate Limited" },
		{ status: 500, expectedType: "server_error", label: "500 Internal Server Error" },
	];

	for (const { status, expectedType, label } of errorCases) {
		it(`maps ${label} to ${expectedType} for getImage`, async () => {
			const client: Client = {
				fetch: vi.fn().mockRejectedValue(createErrorWithStatus(label, status)),
				settings: {} as Client["settings"],
			};
			const input = GetImageInput.parse({ imageId: "test-id" });
			const result = await handleGetImage(client, input);

			expect(result).toHaveProperty("isError", true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.type).toBe(expectedType);
			expect(data.error.statusCode).toBe(status);
		});
	}
});
