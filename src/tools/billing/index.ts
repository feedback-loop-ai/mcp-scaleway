import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import {
	handleDownloadInvoice,
	handleGetInvoice,
	handleListCharges,
	handleListConsumptions,
	handleListDiscounts,
	handleListInvoices,
} from "./handlers.js";
import {
	DownloadInvoiceParams,
	GetInvoiceParams,
	ListChargesParams,
	ListConsumptionsParams,
	ListDiscountsParams,
	ListInvoicesParams,
} from "./types.js";

export function registerBillingTools(server: McpServer): void {
	server.tool(
		"scaleway_billing_list_consumptions",
		"List consumption data for a Scaleway organization or project. Returns itemized consumption with product names, SKUs, quantities, and monetary values. Supports filtering by category, project, and billing period.",
		ListConsumptionsParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const parsed = ListConsumptionsParams.parse(params);
			return handleListConsumptions(client, parsed);
		},
	);

	server.tool(
		"scaleway_billing_list_invoices",
		"List invoices for a Scaleway organization. Returns invoice metadata including billing period, amounts (taxed/untaxed), state, and type. Supports filtering by date range and invoice type.",
		ListInvoicesParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const parsed = ListInvoicesParams.parse(params);
			return handleListInvoices(client, parsed);
		},
	);

	server.tool(
		"scaleway_billing_get_invoice",
		"Get details of a specific Scaleway invoice by ID. Returns full invoice metadata including billing period, amounts, state, and seller information.",
		GetInvoiceParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const parsed = GetInvoiceParams.parse(params);
			return handleGetInvoice(client, parsed);
		},
	);

	server.tool(
		"scaleway_billing_download_invoice",
		"Download a Scaleway invoice as PDF. Returns the download URL or file content for the specified invoice.",
		DownloadInvoiceParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const parsed = DownloadInvoiceParams.parse(params);
			return handleDownloadInvoice(client, parsed);
		},
	);

	server.tool(
		"scaleway_billing_list_charges",
		"List FinOps charges for a Scaleway organization with per-resource and fine-grained time granularity. Returns itemized charges (resource, project, category, untaxed value, discount, unit, billed quantity) over a time window. Supports filtering by project, resource, invoice, SKU and date range, and cursor pagination via page_token. Requires organization_id.",
		ListChargesParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const parsed = ListChargesParams.parse(params);
			return handleListCharges(client, parsed);
		},
	);

	server.tool(
		"scaleway_billing_list_discounts",
		"List active discounts for a Scaleway organization. Returns discount details including value, amount used/remaining, mode, date range, and any applied filters.",
		ListDiscountsParams.shape,
		async (params) => {
			const config = loadAuthConfig();
			const client = createScalewayClient(config);
			const parsed = ListDiscountsParams.parse(params);
			return handleListDiscounts(client, parsed);
		},
	);
}
