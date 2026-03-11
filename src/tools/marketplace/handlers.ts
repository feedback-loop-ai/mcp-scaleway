import type { Client } from "@scaleway/sdk-client";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	GetCategoryInput,
	GetImageInput,
	GetLocalImageInput,
	GetVersionInput,
	ListCategoriesInput,
	ListImagesInput,
	ListLocalImagesInput,
	ListVersionsInput,
} from "./types.js";

const BASE_URL = "/marketplace/v2";

function successResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export async function handleListImages(client: Client, input: ListImagesInput) {
	try {
		const params = new URLSearchParams();
		const { page, page_size } = paginationToQuery(input.page, input.pageSize);
		params.set("page", String(page));
		params.set("page_size", String(page_size));
		if (input.orderBy) params.set("order_by", input.orderBy);
		if (input.arch) params.set("arch", input.arch);
		if (input.category) params.set("category", input.category);
		params.set("include_eol", String(input.includeEol));

		const response = (await client.fetch({
			method: "GET",
			path: `${BASE_URL}/images`,
			urlParams: params,
		})) as { images: unknown[]; total_count: number };

		return successResponse(
			buildPaginatedResponse(response.images, response.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetImage(client: Client, input: GetImageInput) {
	try {
		const response = await client.fetch({
			method: "GET",
			path: `${BASE_URL}/images/${input.imageId}`,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListLocalImages(client: Client, input: ListLocalImagesInput) {
	try {
		const params = new URLSearchParams();
		const { page, page_size } = paginationToQuery(input.page, input.pageSize);
		params.set("page", String(page));
		params.set("page_size", String(page_size));
		if (input.orderBy) params.set("order_by", input.orderBy);
		if (input.zone) params.set("zone", input.zone);
		if (input.arch) params.set("arch", input.arch);
		if (input.imageId) params.set("image_id", input.imageId);
		if (input.versionId) params.set("version_id", input.versionId);
		if (input.imageLabel) params.set("image_label", input.imageLabel);
		if (input.type) params.set("type", input.type);

		const response = (await client.fetch({
			method: "GET",
			path: `${BASE_URL}/local-images`,
			urlParams: params,
		})) as { local_images: unknown[]; total_count: number };

		return successResponse(
			buildPaginatedResponse(
				response.local_images,
				response.total_count,
				input.page,
				input.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetLocalImage(client: Client, input: GetLocalImageInput) {
	try {
		const response = await client.fetch({
			method: "GET",
			path: `${BASE_URL}/local-images/${input.localImageId}`,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListCategories(client: Client, input: ListCategoriesInput) {
	try {
		const params = new URLSearchParams();
		const { page, page_size } = paginationToQuery(input.page, input.pageSize);
		params.set("page", String(page));
		params.set("page_size", String(page_size));

		const response = (await client.fetch({
			method: "GET",
			path: `${BASE_URL}/categories`,
			urlParams: params,
		})) as { categories: unknown[]; total_count: number };

		return successResponse(
			buildPaginatedResponse(response.categories, response.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCategory(client: Client, input: GetCategoryInput) {
	try {
		const response = await client.fetch({
			method: "GET",
			path: `${BASE_URL}/categories/${input.categoryId}`,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListVersions(client: Client, input: ListVersionsInput) {
	try {
		const params = new URLSearchParams();
		const { page, page_size } = paginationToQuery(input.page, input.pageSize);
		params.set("page", String(page));
		params.set("page_size", String(page_size));
		params.set("image_id", input.imageId);
		if (input.orderBy) params.set("order_by", input.orderBy);

		const response = (await client.fetch({
			method: "GET",
			path: `${BASE_URL}/versions`,
			urlParams: params,
		})) as { versions: unknown[]; total_count: number };

		return successResponse(
			buildPaginatedResponse(response.versions, response.total_count, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetVersion(client: Client, input: GetVersionInput) {
	try {
		const response = await client.fetch({
			method: "GET",
			path: `${BASE_URL}/versions/${input.versionId}`,
		});
		return successResponse(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
