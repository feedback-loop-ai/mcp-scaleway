import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerProductCatalogTools } from "../../../src/tools/product-catalog/index.js";

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

interface TextResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

function parseResult(result: TextResult) {
	return JSON.parse(result.content[0].text);
}

const sampleProduct = {
	sku: "/instance/server/vc1l/fr-par-1",
	service_category: "Compute",
	product_category: "Instance",
	product: "VC1-L",
	variant: "VC1-L - fr-par-1",
	description: "VC1-L - fr-par-1 (0.011€ per hour)",
	locality: { zone: "fr-par-1" },
	price: { retail_price: { currency_code: "EUR", units: 0, nanos: 11000000 } },
	unit_of_measure: { unit: "hour", size: 1 },
	status: "general_availability",
	badges: [],
};

describe("product-catalog module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerProductCatalogTools(server)).not.toThrow();
	});

	it("registers all 2 product-catalog tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerProductCatalogTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(2);
		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_product_catalog_list_products");
		expect(toolNames).toContain("scaleway_product_catalog_list_categories");
	});
});

describe("product-catalog handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleListProducts", () => {
		it("returns a paginated list of products", async () => {
			const { handleListProducts } = await import("../../../src/tools/product-catalog/handlers.js");
			mockFetch.mockResolvedValue({ products: [sampleProduct], total_count: 1 });

			const result = await handleListProducts({ page: 1, pageSize: 50 });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "product-catalog/v2alpha1/public-catalog/products",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const parsed = parseResult(result);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.page).toBe(1);
			expect(parsed.pageSize).toBe(50);
		});

		it("applies every optional filter (arrays + locality)", async () => {
			const { handleListProducts } = await import("../../../src/tools/product-catalog/handlers.js");
			mockFetch.mockResolvedValue({ products: [], total_count: 0 });

			await handleListProducts({
				page: 2,
				pageSize: 10,
				productTypes: ["instance", "object_storage"],
				status: ["general_availability"],
				region: "fr-par",
				zone: "fr-par-1",
				datacenter: "dc5",
				global: true,
			});

			const call = mockFetch.mock.calls[0][0];
			const query = call.urlParams as URLSearchParams;
			expect(query.getAll("product_types")).toEqual(["instance", "object_storage"]);
			expect(query.getAll("status")).toEqual(["general_availability"]);
			expect(query.get("region")).toBe("fr-par");
			expect(query.get("zone")).toBe("fr-par-1");
			expect(query.get("datacenter")).toBe("dc5");
			expect(query.get("global")).toBe("true");
		});

		it("returns a formatted error on failure", async () => {
			const { handleListProducts } = await import("../../../src/tools/product-catalog/handlers.js");
			mockFetch.mockRejectedValue(new Error("boom"));

			const result = (await handleListProducts({ page: 1, pageSize: 50 })) as TextResult;

			expect(result.isError).toBe(true);
			expect(parseResult(result).error.message).toBe("boom");
		});
	});

	describe("handleListCategories", () => {
		it("aggregates categories from a single page", async () => {
			const { handleListCategories } = await import(
				"../../../src/tools/product-catalog/handlers.js"
			);
			mockFetch.mockResolvedValue({
				products: [
					sampleProduct,
					{ ...sampleProduct, sku: "/instance/server/vc1l/fr-par-2" },
					// Same service_category, different product_category => exercises the
					// secondary sort comparator (product_category).
					{
						...sampleProduct,
						sku: "/block/x",
						service_category: "Compute",
						product_category: "Block Storage",
					},
					{
						...sampleProduct,
						sku: "/storage/x",
						service_category: "Storage",
						product_category: "Object Storage",
					},
				],
				total_count: 4,
			});

			const result = await handleListCategories({});

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const parsed = parseResult(result);
			expect(parsed.total_count).toBe(3);
			expect(parsed.products_scanned).toBe(4);
			// Sorted: Compute/Block Storage, Compute/Instance, Storage/Object Storage
			expect(parsed.categories[0]).toEqual({
				service_category: "Compute",
				product_category: "Block Storage",
				product_count: 1,
			});
			expect(parsed.categories[1]).toEqual({
				service_category: "Compute",
				product_category: "Instance",
				product_count: 2,
			});
			expect(parsed.categories[2].service_category).toBe("Storage");
			expect(parsed.categories[2].product_count).toBe(1);
		});

		it("pages through the catalog until all products are scanned", async () => {
			const { handleListCategories } = await import(
				"../../../src/tools/product-catalog/handlers.js"
			);
			mockFetch
				.mockResolvedValueOnce({ products: [sampleProduct], total_count: 2 })
				.mockResolvedValueOnce({
					products: [
						{
							...sampleProduct,
							service_category: "AI",
							product_category: "Inference",
						},
					],
					total_count: 2,
				});

			const result = await handleListCategories({ productTypes: ["instance"] });

			expect(mockFetch).toHaveBeenCalledTimes(2);
			expect((mockFetch.mock.calls[0][0].urlParams as URLSearchParams).get("page")).toBe("1");
			expect((mockFetch.mock.calls[1][0].urlParams as URLSearchParams).get("page")).toBe("2");
			expect(
				(mockFetch.mock.calls[0][0].urlParams as URLSearchParams).getAll("product_types"),
			).toEqual(["instance"]);
			const parsed = parseResult(result);
			expect(parsed.total_count).toBe(2);
			expect(parsed.products_scanned).toBe(2);
		});

		it("stops when a page returns no products", async () => {
			const { handleListCategories } = await import(
				"../../../src/tools/product-catalog/handlers.js"
			);
			mockFetch.mockResolvedValue({ products: [], total_count: 100 });

			const result = await handleListCategories({});

			expect(mockFetch).toHaveBeenCalledTimes(1);
			const parsed = parseResult(result);
			expect(parsed.categories).toEqual([]);
			expect(parsed.products_scanned).toBe(0);
		});

		it("stops at the page-scan cap when the catalog never drains", async () => {
			const { handleListCategories } = await import(
				"../../../src/tools/product-catalog/handlers.js"
			);
			// total_count always exceeds scanned and pages are never empty => hits cap.
			mockFetch.mockResolvedValue({ products: [sampleProduct], total_count: 999999 });

			const result = await handleListCategories({});

			expect(mockFetch).toHaveBeenCalledTimes(50);
			const parsed = parseResult(result);
			expect(parsed.products_scanned).toBe(50);
		});

		it("returns a formatted error on failure", async () => {
			const { handleListCategories } = await import(
				"../../../src/tools/product-catalog/handlers.js"
			);
			mockFetch.mockRejectedValue(new Error("catalog down"));

			const result = (await handleListCategories({})) as TextResult;

			expect(result.isError).toBe(true);
			expect(parseResult(result).error.message).toBe("catalog down");
		});
	});
});
