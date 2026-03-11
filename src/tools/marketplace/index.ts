import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import {
	handleGetCategory,
	handleGetImage,
	handleGetLocalImage,
	handleGetVersion,
	handleListCategories,
	handleListImages,
	handleListLocalImages,
	handleListVersions,
} from "./handlers.js";
import {
	GetCategoryInput,
	GetImageInput,
	GetLocalImageInput,
	GetVersionInput,
	ListCategoriesInput,
	ListImagesInput,
	ListLocalImagesInput,
	ListVersionsInput,
} from "./types.js";

export function registerMarketplaceTools(server: McpServer): void {
	server.tool(
		"scaleway_marketplace_list_images",
		"List marketplace images from the Scaleway catalog with optional filtering by architecture, category, and end-of-life status",
		ListImagesInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = ListImagesInput.parse(params);
			return handleListImages(client, input);
		},
	);

	server.tool(
		"scaleway_marketplace_get_image",
		"Get detailed information about a specific marketplace image by its UUID",
		GetImageInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = GetImageInput.parse(params);
			return handleGetImage(client, input);
		},
	);

	server.tool(
		"scaleway_marketplace_list_local_images",
		"List local images available in specific availability zones, filterable by architecture, image, version, or label",
		ListLocalImagesInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = ListLocalImagesInput.parse(params);
			return handleListLocalImages(client, input);
		},
	);

	server.tool(
		"scaleway_marketplace_get_local_image",
		"Get detailed information about a specific local image including compatible commercial types and zone",
		GetLocalImageInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = GetLocalImageInput.parse(params);
			return handleGetLocalImage(client, input);
		},
	);

	server.tool(
		"scaleway_marketplace_list_categories",
		"List all available marketplace categories",
		ListCategoriesInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = ListCategoriesInput.parse(params);
			return handleListCategories(client, input);
		},
	);

	server.tool(
		"scaleway_marketplace_get_category",
		"Get detailed information about a specific marketplace category by its UUID",
		GetCategoryInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = GetCategoryInput.parse(params);
			return handleGetCategory(client, input);
		},
	);

	server.tool(
		"scaleway_marketplace_list_versions",
		"List all versions of a specific marketplace image",
		ListVersionsInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = ListVersionsInput.parse(params);
			return handleListVersions(client, input);
		},
	);

	server.tool(
		"scaleway_marketplace_get_version",
		"Get detailed information about a specific image version by its UUID",
		GetVersionInput.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const input = GetVersionInput.parse(params);
			return handleGetVersion(client, input);
		},
	);
}
