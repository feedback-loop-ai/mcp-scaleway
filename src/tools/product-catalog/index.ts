import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleListCategories, handleListProducts } from "./handlers.js";
import { ListCategoriesParams, ListProductsParams } from "./types.js";

export function registerProductCatalogTools(server: McpServer): void {
	server.tool(
		"scaleway_product_catalog_list_products",
		"List products (SKUs) from the Scaleway public product catalog with pricing, hardware properties, locality and environmental impact. Filter by product type, commercial status, and locality (region/zone/datacenter/global). No authentication required.",
		ListProductsParams.shape,
		async (params) => handleListProducts(ListProductsParams.parse(params)),
	);

	server.tool(
		"scaleway_product_catalog_list_categories",
		"List the distinct service and product categories available in the Scaleway public product catalog, with a count of products in each. Derived by scanning the catalog products endpoint (there is no dedicated categories endpoint).",
		ListCategoriesParams.shape,
		async (params) => handleListCategories(ListCategoriesParams.parse(params)),
	);
}
