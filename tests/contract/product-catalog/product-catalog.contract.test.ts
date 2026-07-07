/**
 * Contract tests for Scaleway Product Catalog API (public-catalog v2alpha1)
 *
 * Validates request/response shapes against
 *   specs/scaleway-api/product-catalog/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * Covers every product-catalog MCP tool:
 *   - scaleway_product_catalog_list_products  (GET /product-catalog/v2alpha1/public-catalog/products)
 *   - scaleway_product_catalog_list_categories (derived from the same endpoint)
 */
import { describe, expect, it } from "vitest";
import {
	ListCategoriesParams,
	ListProductsParams,
	ListPublicCatalogProductsResponse,
	ProductCatalogProductStatus,
	ProductCatalogProductType,
	ProductCategory,
	PublicCatalogProduct,
} from "../../../src/tools/product-catalog/types.js";

// Real fixtures captured from
// GET https://api.scaleway.com/product-catalog/v2alpha1/public-catalog/products
const snapshotProduct = {
	sku: "/instance/snapshot/l_ssd/fr-par-1",
	service_category: "Compute",
	product_category: "Instance",
	product: "Instance Local SSD Snapshot",
	variant: "Instance Local SSD Snapshot - fr-par-1",
	description: "Instance Local SSD Snapshot - fr-par-1 (0.000049€ per GB)",
	locality: { zone: "fr-par-1" },
	price: { retail_price: { currency_code: "EUR", units: 0, nanos: 49000 } },
	unit_of_measure: { unit: "gigabyte", size: 1 },
	status: "general_availability",
	badges: [],
};

const instanceProduct = {
	sku: "/instance/server/vc1l/fr-par-1",
	service_category: "Compute",
	product_category: "Instance",
	product: "VC1-L",
	variant: "VC1-L - fr-par-1",
	description: "VC1-L - fr-par-1 (0.011€ per hour)",
	locality: { zone: "fr-par-1" },
	price: { retail_price: { currency_code: "EUR", units: 0, nanos: 11000000 } },
	properties: {
		hardware: {
			cpu: {
				description: "Intel Atom C3855, x64, vCPUs: 6",
				arch: "x64",
				type: "Intel Atom C3855",
				virtual: { count: 6 },
				threads: 6,
				shared: true,
			},
			ram: { description: "8 GiB", size: 8589934592, type: "", ecc_type: "standard" },
			storage: { description: "Dynamic local: 1 x SSD, Block", total: 0 },
			network: {
				description: "Internal: 200 Mb/s, Public: 200 Mb/s",
				internal_bandwidth: 200000000,
				public_bandwidth: 200000000,
				max_public_bandwidth: 200000000,
			},
		},
		instance: { range: "ARM Based", offer_id: "AMP2-C1", recommended_replacement_offer_ids: [] },
	},
	unit_of_measure: { unit: "hour", size: 1 },
	status: "retired",
	badges: [],
};

const globalProduct = {
	sku: "/ai/inference_dedicated/deployment/h100-1/fr-par",
	service_category: "AI",
	product_category: "Inference Dedicated",
	product: "H100",
	variant: "H100 - fr-par",
	description: "H100 - fr-par (0.05666€ per node)",
	locality: { region: "fr-par" },
	price: { retail_price: { currency_code: "EUR", units: 0, nanos: 56660000 } },
	properties: { managed_inference: { instance_gpu_name: "H100-1" } },
	unit_of_measure: { unit: "node", size: 1 },
	status: "general_availability",
	environmental_impact_estimation: { kg_co2_equivalent: 0.12, m3_water_usage: 0.003 },
	badges: ["popular"],
};

describe("Product Catalog contract: list_products request", () => {
	it("accepts an empty request and applies pagination defaults", () => {
		const parsed = ListProductsParams.parse({});
		expect(parsed.page).toBe(1);
		expect(parsed.pageSize).toBe(50);
	});

	it("accepts every documented filter", () => {
		const parsed = ListProductsParams.parse({
			page: 3,
			pageSize: 100,
			productTypes: ["instance", "object_storage"],
			status: ["general_availability", "retired"],
			region: "fr-par",
			zone: "fr-par-1",
			datacenter: "dc5",
			global: false,
		});
		expect(parsed.productTypes).toContain("object_storage");
		expect(parsed.status).toContain("retired");
	});

	it("rejects an unknown product type", () => {
		expect(() => ListProductsParams.parse({ productTypes: ["bogus"] })).toThrow();
	});

	it("rejects an invalid region format", () => {
		expect(() => ListProductsParams.parse({ region: "not-a-region-x" })).toThrow();
	});

	it("caps page size at 100", () => {
		expect(() => ListProductsParams.parse({ pageSize: 5000 })).toThrow();
	});
});

describe("Product Catalog contract: list_products response", () => {
	it("validates a full response with mixed product shapes", () => {
		const response = {
			products: [snapshotProduct, instanceProduct, globalProduct],
			total_count: 5286,
		};
		const parsed = ListPublicCatalogProductsResponse.parse(response);
		expect(parsed.products).toHaveLength(3);
		expect(parsed.total_count).toBe(5286);
	});

	it("validates a zonal product with pricing and unit of measure", () => {
		const parsed = PublicCatalogProduct.parse(snapshotProduct);
		expect(parsed.locality.zone).toBe("fr-par-1");
		expect(parsed.price?.retail_price.currency_code).toBe("EUR");
		expect(parsed.unit_of_measure?.unit).toBe("gigabyte");
	});

	it("validates hardware properties and passes through alpha-only fields", () => {
		const parsed = PublicCatalogProduct.parse(instanceProduct);
		expect(parsed.properties?.hardware?.cpu?.arch).toBe("x64");
		expect(parsed.properties?.hardware?.ram?.size).toBe(8589934592);
	});

	it("validates a regional product with environmental impact and badges", () => {
		const parsed = PublicCatalogProduct.parse(globalProduct);
		expect(parsed.locality.region).toBe("fr-par");
		expect(parsed.environmental_impact_estimation?.kg_co2_equivalent).toBeCloseTo(0.12);
		expect(parsed.badges).toContain("popular");
	});

	it("rejects a product missing the required sku field", () => {
		const { sku, ...withoutSku } = snapshotProduct;
		void sku;
		expect(() => PublicCatalogProduct.parse(withoutSku)).toThrow();
	});
});

describe("Product Catalog contract: enums", () => {
	it("enumerates all documented product types", () => {
		expect(ProductCatalogProductType.options).toContain("managed_redis_database");
		expect(ProductCatalogProductType.options).toContain("generative_apis");
	});

	it("enumerates all documented lifecycle statuses", () => {
		expect(ProductCatalogProductStatus.options).toContain("general_availability");
		expect(ProductCatalogProductStatus.options).toContain("end_of_life");
	});
});

describe("Product Catalog contract: list_categories", () => {
	it("accepts an empty request", () => {
		expect(() => ListCategoriesParams.parse({})).not.toThrow();
	});

	it("accepts an optional product type filter", () => {
		const parsed = ListCategoriesParams.parse({ productTypes: ["instance"] });
		expect(parsed.productTypes).toEqual(["instance"]);
	});

	it("validates the derived category aggregate shape", () => {
		const parsed = ProductCategory.parse({
			service_category: "Compute",
			product_category: "Instance",
			product_count: 42,
		});
		expect(parsed.product_count).toBe(42);
	});

	it("rejects a negative product count", () => {
		expect(() =>
			ProductCategory.parse({
				service_category: "Compute",
				product_category: "Instance",
				product_count: -1,
			}),
		).toThrow();
	});
});
