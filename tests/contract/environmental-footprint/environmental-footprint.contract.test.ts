/**
 * Contract tests for Scaleway Environmental Footprint API (User API, v1alpha1)
 *
 * Validates request/response shapes against
 * specs/scaleway-api/environmental-footprint/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * Source of truth for shapes: scaleway-sdk-go
 * api/environmental_footprint/v1alpha1 and
 * https://www.scaleway.com/en/developers/api/environmental-footprint/user-api/
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	DownloadImpactReportParams,
	GetImpactDataParams,
	GetReportAvailabilityParams,
	Impact,
	ImpactDataResponse,
	ImpactReportAvailability,
	ProductCategory,
	RegionImpact,
	ReportType,
	ServiceCategory,
	SkuImpact,
	ZoneImpact,
} from "../../../src/tools/environmental-footprint/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const impact = { kg_co2_equivalent: 12.5, m3_water_usage: 3.2 };

const skuImpact = {
	sku: "instance-fr-par-1",
	total_sku_impact: impact,
	service_category: "compute" as const,
	product_category: "instances" as const,
};

const zoneImpact = {
	zone: "fr-par-1",
	total_zone_impact: impact,
	skus: [skuImpact],
};

const regionImpact = {
	region: "fr-par",
	total_region_impact: impact,
	zones: [zoneImpact],
	skus: [skuImpact],
};

const impactDataResponse = {
	start_date: "2025-05-01T00:00:00Z",
	end_date: "2025-06-01T00:00:00Z",
	total_impact: impact,
	projects: [
		{
			project_id: VALID_UUID,
			total_project_impact: impact,
			regions: [regionImpact],
		},
	],
};

// --- Response shape contracts ---

/**
 * API: GET /environmental-footprint/v1alpha1/data/query
 * Spec: specs/scaleway-api/environmental-footprint/api-reference.md#retrieve-detailed-impact-data
 * Tool: scaleway_environmental_footprint_get_impact_data
 */
describe("contract: GetImpactData response shape", () => {
	it("validates a full impact data response", () => {
		expect(() => ImpactDataResponse.parse(impactDataResponse)).not.toThrow();
	});

	it("validates an empty response with null aggregates", () => {
		const response = {
			start_date: null,
			end_date: null,
			total_impact: null,
			projects: [],
		};
		expect(() => ImpactDataResponse.parse(response)).not.toThrow();
	});

	it("rejects response missing projects array", () => {
		expect(() =>
			ImpactDataResponse.parse({
				start_date: null,
				end_date: null,
				total_impact: null,
			}),
		).toThrow();
	});

	it("validates the Impact metric shape (kgCO₂e + water)", () => {
		expect(() => Impact.parse(impact)).not.toThrow();
		expect(() => Impact.parse({ kg_co2_equivalent: 0, m3_water_usage: 0 })).not.toThrow();
		expect(() => Impact.parse({ kg_co2_equivalent: 1 })).toThrow();
	});

	it("validates nested SKU, zone and region impact shapes", () => {
		expect(() => SkuImpact.parse(skuImpact)).not.toThrow();
		expect(() => ZoneImpact.parse(zoneImpact)).not.toThrow();
		expect(() => RegionImpact.parse(regionImpact)).not.toThrow();
	});
});

/**
 * API: GET /environmental-footprint/v1alpha1/data/query
 * Request parameter validation.
 */
describe("contract: GetImpactData request shape", () => {
	it("validates an empty request (all params optional)", () => {
		expect(() => GetImpactDataParams.parse({})).not.toThrow();
	});

	it("validates a fully-populated request with array filters", () => {
		const input = {
			organizationId: VALID_UUID,
			startDate: "2025-05-01T00:00:00Z",
			endDate: "2025-06-01T00:00:00Z",
			regions: ["fr-par", "nl-ams"],
			zones: ["fr-par-1"],
			projectIds: [VALID_UUID],
			serviceCategories: ["compute", "storage"],
			productCategories: ["instances", "object_storage"],
		};
		expect(() => GetImpactDataParams.parse(input)).not.toThrow();
	});

	it("rejects an invalid region format", () => {
		expect(() => GetImpactDataParams.parse({ regions: ["invalid"] })).toThrow();
	});

	it("rejects an invalid zone format", () => {
		expect(() => GetImpactDataParams.parse({ zones: ["fr-par"] })).toThrow();
	});

	it("rejects an invalid service category", () => {
		expect(() => GetImpactDataParams.parse({ serviceCategories: ["gpu"] })).toThrow();
	});

	it("rejects an invalid product category", () => {
		expect(() => GetImpactDataParams.parse({ productCategories: ["nonsense"] })).toThrow();
	});

	it("rejects a non-datetime start date", () => {
		expect(() => GetImpactDataParams.parse({ startDate: "2025-05-01" })).toThrow();
	});

	it("rejects a non-uuid organization id", () => {
		expect(() => GetImpactDataParams.parse({ organizationId: "not-a-uuid" })).toThrow();
	});
});

/**
 * API: GET /environmental-footprint/v1alpha1/reports/availability
 * Spec: specs/scaleway-api/environmental-footprint/api-reference.md#list-available-reports
 * Tool: scaleway_environmental_footprint_get_report_availability
 */
describe("contract: GetReportAvailability response shape", () => {
	it("validates a report availability response", () => {
		const response = {
			month_summary_reports: ["2025-05-01T00:00:00Z", "2025-06-01T00:00:00Z"],
			yearly_summary_reports: ["2024-01-01T00:00:00Z"],
		};
		expect(() => ImpactReportAvailability.parse(response)).not.toThrow();
	});

	it("validates an empty availability response", () => {
		expect(() =>
			ImpactReportAvailability.parse({
				month_summary_reports: [],
				yearly_summary_reports: [],
			}),
		).not.toThrow();
	});

	it("rejects a response missing yearly_summary_reports", () => {
		expect(() => ImpactReportAvailability.parse({ month_summary_reports: [] })).toThrow();
	});
});

describe("contract: GetReportAvailability request shape", () => {
	it("validates an empty request", () => {
		expect(() => GetReportAvailabilityParams.parse({})).not.toThrow();
	});

	it("validates a request with org and date range", () => {
		const input = {
			organizationId: VALID_UUID,
			startDate: "2025-01-01T00:00:00Z",
			endDate: "2025-06-01T00:00:00Z",
		};
		expect(() => GetReportAvailabilityParams.parse(input)).not.toThrow();
	});

	it("rejects a non-datetime end date", () => {
		expect(() => GetReportAvailabilityParams.parse({ endDate: "yesterday" })).toThrow();
	});
});

/**
 * API: POST /environmental-footprint/v1alpha1/reports/download
 * Spec: specs/scaleway-api/environmental-footprint/api-reference.md#download-report
 * Tool: scaleway_environmental_footprint_download_impact_report
 */
describe("contract: DownloadImpactReport request shape", () => {
	it("validates a minimal download request", () => {
		const input = { date: "2025-05-01T00:00:00Z", type: "monthly" };
		expect(() => DownloadImpactReportParams.parse(input)).not.toThrow();
	});

	it("validates a download request with organization id", () => {
		const input = {
			organizationId: VALID_UUID,
			date: "2025-01-01T00:00:00Z",
			type: "yearly",
		};
		expect(() => DownloadImpactReportParams.parse(input)).not.toThrow();
	});

	it("rejects a request missing the required date", () => {
		expect(() => DownloadImpactReportParams.parse({ type: "monthly" })).toThrow();
	});

	it("rejects a request missing the required type", () => {
		expect(() => DownloadImpactReportParams.parse({ date: "2025-05-01T00:00:00Z" })).toThrow();
	});

	it("rejects an invalid report type", () => {
		expect(() =>
			DownloadImpactReportParams.parse({ date: "2025-05-01T00:00:00Z", type: "weekly" }),
		).toThrow();
	});
});

// --- Enum contracts ---

describe("contract: enum values", () => {
	it("accepts every documented service category", () => {
		for (const c of [
			"unknown_service_category",
			"baremetal",
			"compute",
			"storage",
			"network",
			"containers",
			"databases",
			"ai",
		]) {
			expect(() => ServiceCategory.parse(c)).not.toThrow();
		}
	});

	it("accepts every documented product category", () => {
		for (const c of [
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
		]) {
			expect(() => ProductCategory.parse(c)).not.toThrow();
		}
	});

	it("accepts every documented report type", () => {
		for (const t of ["unknown_report_type", "monthly", "yearly"]) {
			expect(() => ReportType.parse(t)).not.toThrow();
		}
	});

	it("rejects unknown enum values", () => {
		expect(() => ServiceCategory.parse("quantum")).toThrow();
		expect(() => ProductCategory.parse("mainframe")).toThrow();
		expect(() => ReportType.parse("daily")).toThrow();
	});
});
