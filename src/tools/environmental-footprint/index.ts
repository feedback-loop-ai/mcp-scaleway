import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleDownloadImpactReport,
	handleGetImpactData,
	handleGetReportAvailability,
} from "./handlers.js";
import {
	DownloadImpactReportParams,
	GetImpactDataParams,
	GetReportAvailabilityParams,
} from "./types.js";

export function registerEnvironmentalFootprintTools(server: McpServer): void {
	server.tool(
		"scaleway_environmental_footprint_get_impact_data",
		"Retrieve detailed estimated environmental impact data (carbon emissions in kgCO₂e and water usage in m³) for your Scaleway projects within a date range, optionally filtered by project, region, zone, service category, and/or product category",
		GetImpactDataParams.shape,
		async (params) => handleGetImpactData(GetImpactDataParams.parse(params)),
	);

	server.tool(
		"scaleway_environmental_footprint_get_report_availability",
		"List the calendar months and years for which environmental impact reports are available for an Organization",
		GetReportAvailabilityParams.shape,
		async (params) => handleGetReportAvailability(GetReportAvailabilityParams.parse(params)),
	);

	server.tool(
		"scaleway_environmental_footprint_download_impact_report",
		"Download a Scaleway environmental impact PDF report (monthly or yearly) with detailed impact data for your projects",
		DownloadImpactReportParams.shape,
		async (params) => handleDownloadImpactReport(DownloadImpactReportParams.parse(params)),
	);
}
