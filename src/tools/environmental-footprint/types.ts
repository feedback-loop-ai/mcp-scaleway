import { z } from "zod";
import { ScalewayRegion, ScalewayZone } from "../../shared/types.js";

// --- Enums ---

export const ServiceCategory = z.enum([
	"unknown_service_category",
	"baremetal",
	"compute",
	"storage",
	"network",
	"containers",
	"databases",
	"ai",
]);
export type ServiceCategory = z.infer<typeof ServiceCategory>;

export const ProductCategory = z.enum([
	"unknown_product_category",
	"apple_silicon",
	"block_storage",
	"dedibox",
	"elastic_metal",
	"instances",
	"object_storage",
	"load_balancer",
	"kubernetes",
	"managed_relational_databases",
	"managed_mongodb",
	"managed_redis",
	"managed_inference",
	"generative_apis",
]);
export type ProductCategory = z.infer<typeof ProductCategory>;

export const ReportType = z.enum(["unknown_report_type", "monthly", "yearly"]);
export type ReportType = z.infer<typeof ReportType>;

// --- Entity schemas ---

export const Impact = z.object({
	kg_co2_equivalent: z
		.number()
		.describe("Estimated carbon emissions in kilograms of CO₂ equivalent (kgCO₂e)"),
	m3_water_usage: z.number().describe("Estimated water consumption in cubic meters (m³)"),
});
export type Impact = z.infer<typeof Impact>;

export const SkuImpact = z.object({
	sku: z.string().describe("Unique ID of the combination of product, region and zone"),
	total_sku_impact: Impact.nullable().describe(
		"Total estimated impact for this SKU during the given period",
	),
	service_category: ServiceCategory.describe("Service category associated with this SKU"),
	product_category: ProductCategory.describe("Product category associated with this SKU"),
});
export type SkuImpact = z.infer<typeof SkuImpact>;

export const ZoneImpact = z.object({
	zone: z.string().describe("ID of the zone"),
	total_zone_impact: Impact.nullable().describe("Total estimated impact for this zone"),
	skus: z.array(SkuImpact).describe("List of estimated impact values per SKU for this zone"),
});
export type ZoneImpact = z.infer<typeof ZoneImpact>;

export const RegionImpact = z.object({
	region: z.string().describe("ID of the region"),
	total_region_impact: Impact.nullable().describe("Total estimated impact for this region"),
	zones: z.array(ZoneImpact).describe("List of estimated impact values per zone"),
	skus: z.array(SkuImpact).describe("List of estimated impact values per SKU for this region"),
});
export type RegionImpact = z.infer<typeof RegionImpact>;

export const ProjectImpact = z.object({
	project_id: z.string().describe("ID of the project"),
	total_project_impact: Impact.nullable().describe("Total estimated impact for this project"),
	regions: z.array(RegionImpact).describe("List of estimated impact values per region"),
});
export type ProjectImpact = z.infer<typeof ProjectImpact>;

export const ImpactDataResponse = z.object({
	start_date: z.string().nullable().describe("Start date of the impact data period (inclusive)"),
	end_date: z.string().nullable().describe("End date of the impact data period (exclusive)"),
	total_impact: Impact.nullable().describe("Total estimated impact across all projects"),
	projects: z.array(ProjectImpact).describe("List of estimated impact values per project"),
});
export type ImpactDataResponse = z.infer<typeof ImpactDataResponse>;

export const ImpactReportAvailability = z.object({
	month_summary_reports: z
		.array(z.string())
		.describe("List of calendar months for which impact reports are available"),
	yearly_summary_reports: z
		.array(z.string())
		.describe("List of calendar years for which impact reports are available"),
});
export type ImpactReportAvailability = z.infer<typeof ImpactReportAvailability>;

// --- Tool input schemas ---

export const GetImpactDataParams = z.object({
	organizationId: z
		.string()
		.uuid()
		.optional()
		.describe("Organization ID to query (defaults to the credentials' Organization)"),
	startDate: z
		.string()
		.datetime()
		.optional()
		.describe("Start date (inclusive), ISO 8601 e.g. 2025-05-01T00:00:00Z"),
	endDate: z
		.string()
		.datetime()
		.optional()
		.describe("End date (exclusive), ISO 8601. Defaults to today's date"),
	regions: z
		.array(ScalewayRegion)
		.optional()
		.describe("Regions to filter by (e.g. fr-par). Defaults to all regions"),
	zones: z
		.array(ScalewayZone)
		.optional()
		.describe("Zones to filter by (e.g. fr-par-1). Defaults to all zones"),
	projectIds: z
		.array(z.string().uuid())
		.optional()
		.describe("Project IDs to filter by. Defaults to all projects in the Organization"),
	serviceCategories: z
		.array(ServiceCategory)
		.optional()
		.describe("Service categories to filter by. Defaults to all"),
	productCategories: z
		.array(ProductCategory)
		.optional()
		.describe("Product categories to filter by. Defaults to all"),
});
export type GetImpactDataParams = z.infer<typeof GetImpactDataParams>;

export const GetReportAvailabilityParams = z.object({
	organizationId: z
		.string()
		.uuid()
		.optional()
		.describe("Organization ID to query (defaults to the credentials' Organization)"),
	startDate: z
		.string()
		.datetime()
		.optional()
		.describe("Start date of the search period (inclusive), ISO 8601"),
	endDate: z
		.string()
		.datetime()
		.optional()
		.describe("End date of the search period (inclusive), ISO 8601. Defaults to today's date"),
});
export type GetReportAvailabilityParams = z.infer<typeof GetReportAvailabilityParams>;

export const DownloadImpactReportParams = z.object({
	organizationId: z
		.string()
		.uuid()
		.optional()
		.describe("Organization ID for which to download a report (defaults to credentials' Org)"),
	date: z
		.string()
		.datetime()
		.describe("Start date of the report period, ISO 8601 e.g. 2025-05-01T00:00:00Z"),
	type: z.enum(["monthly", "yearly"]).describe("Type of report to download: monthly or yearly"),
});
export type DownloadImpactReportParams = z.infer<typeof DownloadImpactReportParams>;
