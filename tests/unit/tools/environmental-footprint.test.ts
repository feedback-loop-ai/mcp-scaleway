import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { registerEnvironmentalFootprintTools } from "../../../src/tools/environmental-footprint/index.js";

// Mock the shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "00000000-0000-0000-0000-000000000001",
		defaultOrganizationId: "00000000-0000-0000-0000-0000000000aa",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({ fetch: mockFetch }),
}));

interface ErrorResult {
	content: { type: "text"; text: string }[];
	isError?: boolean;
}

const ORG_ID = "00000000-0000-0000-0000-0000000000aa";
const PROJECT_ID = "00000000-0000-0000-0000-000000000001";

const impact = { kg_co2_equivalent: 12.5, m3_water_usage: 3.2 };

const impactDataResponse = {
	start_date: "2025-05-01T00:00:00Z",
	end_date: "2025-06-01T00:00:00Z",
	total_impact: impact,
	projects: [
		{
			project_id: PROJECT_ID,
			total_project_impact: impact,
			regions: [
				{
					region: "fr-par",
					total_region_impact: impact,
					zones: [
						{
							zone: "fr-par-1",
							total_zone_impact: impact,
							skus: [
								{
									sku: "instance-fr-par-1",
									total_sku_impact: impact,
									service_category: "compute",
									product_category: "instances",
								},
							],
						},
					],
					skus: [],
				},
			],
		},
	],
};

describe("environmental-footprint module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerEnvironmentalFootprintTools(server)).not.toThrow();
	});

	it("registers all 3 environmental footprint tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerEnvironmentalFootprintTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(3);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_environmental_footprint_get_impact_data");
		expect(toolNames).toContain("scaleway_environmental_footprint_get_report_availability");
		expect(toolNames).toContain("scaleway_environmental_footprint_download_impact_report");
	});
});

describe("environmental-footprint handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	describe("handleGetImpactData", () => {
		it("retrieves impact data with no optional filters", async () => {
			const { handleGetImpactData } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			mockFetch.mockResolvedValue(impactDataResponse);

			const result = await handleGetImpactData({});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/environmental-footprint/v1alpha1/data/query",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			const callArgs = mockFetch.mock.calls[0][0];
			// No filters -> empty query string
			expect(callArgs.urlParams.toString()).toBe("");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.total_impact.kg_co2_equivalent).toBe(12.5);
			expect(parsed.projects).toHaveLength(1);
		});

		it("passes all optional filters including array params", async () => {
			const { handleGetImpactData } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			mockFetch.mockResolvedValue(impactDataResponse);

			await handleGetImpactData({
				organizationId: ORG_ID,
				startDate: "2025-05-01T00:00:00Z",
				endDate: "2025-06-01T00:00:00Z",
				regions: ["fr-par", "nl-ams"],
				zones: ["fr-par-1"],
				projectIds: [PROJECT_ID],
				serviceCategories: ["compute", "storage"],
				productCategories: ["instances"],
			});

			const callArgs = mockFetch.mock.calls[0][0];
			const qp: URLSearchParams = callArgs.urlParams;
			expect(qp.get("organization_id")).toBe(ORG_ID);
			expect(qp.get("start_date")).toBe("2025-05-01T00:00:00Z");
			expect(qp.get("end_date")).toBe("2025-06-01T00:00:00Z");
			expect(qp.getAll("regions")).toEqual(["fr-par", "nl-ams"]);
			expect(qp.getAll("zones")).toEqual(["fr-par-1"]);
			expect(qp.getAll("project_ids")).toEqual([PROJECT_ID]);
			expect(qp.getAll("service_categories")).toEqual(["compute", "storage"]);
			expect(qp.getAll("product_categories")).toEqual(["instances"]);
		});

		it("returns error on failure", async () => {
			const { handleGetImpactData } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			const err = new Error("Unauthorized");
			(err as unknown as { statusCode: number }).statusCode = 401;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleGetImpactData({});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleGetReportAvailability", () => {
		it("lists report availability with no optional filters", async () => {
			const { handleGetReportAvailability } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			mockFetch.mockResolvedValue({
				month_summary_reports: ["2025-05-01T00:00:00Z"],
				yearly_summary_reports: ["2024-01-01T00:00:00Z"],
			});

			const result = await handleGetReportAvailability({});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.objectContaining({
					method: "GET",
					path: "/environmental-footprint/v1alpha1/reports/availability",
					urlParams: expect.any(URLSearchParams),
				}),
			);
			expect(mockFetch.mock.calls[0][0].urlParams.toString()).toBe("");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.month_summary_reports).toHaveLength(1);
		});

		it("passes optional org and date range", async () => {
			const { handleGetReportAvailability } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			mockFetch.mockResolvedValue({
				month_summary_reports: [],
				yearly_summary_reports: [],
			});

			await handleGetReportAvailability({
				organizationId: ORG_ID,
				startDate: "2025-01-01T00:00:00Z",
				endDate: "2025-06-01T00:00:00Z",
			});

			const qp: URLSearchParams = mockFetch.mock.calls[0][0].urlParams;
			expect(qp.get("organization_id")).toBe(ORG_ID);
			expect(qp.get("start_date")).toBe("2025-01-01T00:00:00Z");
			expect(qp.get("end_date")).toBe("2025-06-01T00:00:00Z");
		});

		it("returns error on failure", async () => {
			const { handleGetReportAvailability } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			const err = new Error("Rate limited");
			(err as unknown as { statusCode: number }).statusCode = 429;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleGetReportAvailability({});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});

	describe("handleDownloadImpactReport", () => {
		it("downloads a report with organization id", async () => {
			const { handleDownloadImpactReport } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			mockFetch.mockResolvedValue({ name: "report.pdf", content: "base64data" });

			const result = await handleDownloadImpactReport({
				organizationId: ORG_ID,
				date: "2025-05-01T00:00:00Z",
				type: "monthly",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/environmental-footprint/v1alpha1/reports/download",
				body: JSON.stringify({
					date: "2025-05-01T00:00:00Z",
					type: "monthly",
					organization_id: ORG_ID,
				}),
				headers: { "Content-Type": "application/json" },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("report.pdf");
		});

		it("downloads a report without optional organization id", async () => {
			const { handleDownloadImpactReport } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			mockFetch.mockResolvedValue({ name: "report.pdf" });

			await handleDownloadImpactReport({
				date: "2025-01-01T00:00:00Z",
				type: "yearly",
			});

			expect(mockFetch).toHaveBeenCalledWith({
				method: "POST",
				path: "/environmental-footprint/v1alpha1/reports/download",
				body: JSON.stringify({
					date: "2025-01-01T00:00:00Z",
					type: "yearly",
				}),
				headers: { "Content-Type": "application/json" },
			});
		});

		it("returns error on failure", async () => {
			const { handleDownloadImpactReport } = await import(
				"../../../src/tools/environmental-footprint/handlers.js"
			);
			const err = new Error("Not found");
			(err as unknown as { statusCode: number }).statusCode = 404;
			mockFetch.mockRejectedValue(err);

			const result: ErrorResult = await handleDownloadImpactReport({
				date: "2025-05-01T00:00:00Z",
				type: "monthly",
			});

			expect(result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});
});
