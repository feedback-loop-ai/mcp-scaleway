import { z } from "zod";
import { PaginationParams, ScalewayRegion, ScalewayZone } from "../../shared/types.js";

// --- Enums (product-catalog v2alpha1) ---

/**
 * Product type used both to filter the catalog (`product_types` query param)
 * and returned as the discriminator of the product `properties` object.
 */
export const ProductCatalogProductType = z.enum([
	"unknown_product_type",
	"instance",
	"apple_silicon",
	"elastic_metal",
	"dedibox",
	"block_storage",
	"object_storage",
	"managed_inference",
	"generative_apis",
	"load_balancer",
	"secret_manager",
	"key_manager",
	"managed_redis_database",
]);
export type ProductCatalogProductType = z.infer<typeof ProductCatalogProductType>;

/** Commercial lifecycle status of a product. */
export const ProductCatalogProductStatus = z.enum([
	"unknown_status",
	"public_beta",
	"preview",
	"general_availability",
	"end_of_new_features",
	"end_of_growth",
	"end_of_deployment",
	"end_of_support",
	"end_of_sale",
	"end_of_life",
	"retired",
]);
export type ProductCatalogProductStatus = z.infer<typeof ProductCatalogProductStatus>;

/** CPU architecture reported in hardware properties. */
export const ProductCatalogCpuArch = z.enum([
	"unknown_arch",
	"x64",
	"arm64",
	"riscv",
	"apple_silicon",
]);
export type ProductCatalogCpuArch = z.infer<typeof ProductCatalogCpuArch>;

/** Marketing badges attached to a product. */
export const ProductCatalogProductBadge = z.enum([
	"unknown_product_badge",
	"new_product",
	"best_seller",
	"best_value",
	"popular",
]);
export type ProductCatalogProductBadge = z.infer<typeof ProductCatalogProductBadge>;

// --- Response value objects ---

/** Scaleway Money value object (`scw.Money`). */
export const Money = z.object({
	currency_code: z.string(),
	units: z.number().int(),
	nanos: z.number().int(),
});
export type Money = z.infer<typeof Money>;

/**
 * Locality of a product. Exactly one of the fields is set depending on whether
 * the product is global, regional, zonal, or datacenter-scoped.
 */
export const ProductLocality = z
	.object({
		global: z.boolean().optional(),
		region: z.string().optional(),
		zone: z.string().optional(),
		datacenter: z.string().optional(),
	})
	.passthrough();
export type ProductLocality = z.infer<typeof ProductLocality>;

export const ProductPrice = z.object({
	retail_price: Money,
});
export type ProductPrice = z.infer<typeof ProductPrice>;

export const HardwareCpu = z
	.object({
		description: z.string().optional(),
		arch: z.string().optional(),
		type: z.string().optional(),
		threads: z.number().int().optional(),
		virtual: z.object({ count: z.number().int() }).passthrough().optional(),
		physical: z.record(z.unknown()).optional(),
	})
	.passthrough();
export type HardwareCpu = z.infer<typeof HardwareCpu>;

export const HardwareRam = z
	.object({
		description: z.string().optional(),
		size: z.number().optional(),
		type: z.string().optional(),
	})
	.passthrough();
export type HardwareRam = z.infer<typeof HardwareRam>;

export const HardwareStorage = z
	.object({
		description: z.string().optional(),
		total: z.number().optional(),
	})
	.passthrough();
export type HardwareStorage = z.infer<typeof HardwareStorage>;

export const HardwareNetwork = z
	.object({
		description: z.string().optional(),
		internal_bandwidth: z.number().optional(),
		public_bandwidth: z.number().optional(),
		max_public_bandwidth: z.number().optional(),
	})
	.passthrough();
export type HardwareNetwork = z.infer<typeof HardwareNetwork>;

export const HardwareGpu = z
	.object({
		description: z.string().optional(),
		count: z.number().int().optional(),
		type: z.string().optional(),
	})
	.passthrough();
export type HardwareGpu = z.infer<typeof HardwareGpu>;

export const ProductHardware = z
	.object({
		cpu: HardwareCpu.optional(),
		ram: HardwareRam.optional(),
		storage: HardwareStorage.optional(),
		network: HardwareNetwork.optional(),
		gpu: HardwareGpu.optional(),
	})
	.passthrough();
export type ProductHardware = z.infer<typeof ProductHardware>;

/**
 * Product properties. `hardware` may be present alongside exactly one
 * product-specific key (instance, apple_silicon, object_storage, ...). Extra
 * keys are preserved via passthrough because the alpha API adds product types.
 */
export const ProductProperties = z
	.object({
		hardware: ProductHardware.optional(),
	})
	.passthrough();
export type ProductProperties = z.infer<typeof ProductProperties>;

export const EnvironmentalImpactEstimation = z
	.object({
		kg_co2_equivalent: z.number().optional(),
		m3_water_usage: z.number().optional(),
	})
	.passthrough();
export type EnvironmentalImpactEstimation = z.infer<typeof EnvironmentalImpactEstimation>;

export const UnitOfMeasure = z
	.object({
		unit: z.string(),
		size: z.number().int(),
	})
	.passthrough();
export type UnitOfMeasure = z.infer<typeof UnitOfMeasure>;

/** A single product/SKU entry in the public catalog. */
export const PublicCatalogProduct = z
	.object({
		sku: z.string(),
		service_category: z.string(),
		product_category: z.string(),
		product: z.string(),
		variant: z.string(),
		description: z.string(),
		locality: ProductLocality,
		price: ProductPrice.optional(),
		properties: ProductProperties.optional(),
		environmental_impact_estimation: EnvironmentalImpactEstimation.optional(),
		unit_of_measure: UnitOfMeasure.optional(),
		status: z.string(),
		end_of_life_at: z.string().datetime({ offset: true }).nullable().optional(),
		badges: z.array(z.string()).optional(),
	})
	.passthrough();
export type PublicCatalogProduct = z.infer<typeof PublicCatalogProduct>;

export const ListPublicCatalogProductsResponse = z.object({
	products: z.array(PublicCatalogProduct),
	total_count: z.number().int().nonnegative(),
});
export type ListPublicCatalogProductsResponse = z.infer<typeof ListPublicCatalogProductsResponse>;

// --- Tool parameter schemas ---

export const ListProductsParams = PaginationParams.extend({
	productTypes: z
		.array(ProductCatalogProductType)
		.optional()
		.describe("Filter by one or more product types (e.g. instance, object_storage)"),
	status: z
		.array(ProductCatalogProductStatus)
		.optional()
		.describe("Filter by one or more commercial statuses (e.g. general_availability)"),
	region: ScalewayRegion.optional().describe("Only return products available in this region"),
	zone: ScalewayZone.optional().describe("Only return products available in this zone"),
	datacenter: z.string().optional().describe("Only return products available in this datacenter"),
	global: z.boolean().optional().describe("Only return globally-available products"),
});
export type ListProductsParams = z.infer<typeof ListProductsParams>;

export const ListCategoriesParams = z.object({
	productTypes: z
		.array(ProductCatalogProductType)
		.optional()
		.describe("Restrict the scan to one or more product types before aggregating categories"),
});
export type ListCategoriesParams = z.infer<typeof ListCategoriesParams>;

/** A distinct category pair aggregated from the catalog. */
export const ProductCategory = z.object({
	service_category: z.string(),
	product_category: z.string(),
	product_count: z.number().int().nonnegative(),
});
export type ProductCategory = z.infer<typeof ProductCategory>;
