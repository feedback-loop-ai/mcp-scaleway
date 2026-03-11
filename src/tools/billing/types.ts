import { z } from "zod";
import { PaginationParams } from "../../shared/types.js";

// --- Money ---
export const Money = z.object({
	currency_code: z.string().describe("ISO 4217 currency code"),
	units: z.number().describe("Whole units of the amount"),
	nanos: z.number().describe("Nano units (10^-9) of the amount"),
});
export type Money = z.infer<typeof Money>;

// --- Consumption ---
export const Consumption = z.object({
	value: Money.describe("Monetary value of the consumption"),
	product_name: z.string().describe("Product name"),
	resource_name: z.string().describe("Resource name"),
	sku: z.string().describe("SKU identifier"),
	project_id: z.string().describe("Project ID"),
	category_name: z.string().describe("Category name"),
	unit: z.string().describe("Unit of measure"),
	billed_quantity: z.string().describe("Quantity billed"),
});
export type Consumption = z.infer<typeof Consumption>;

// --- Invoice ---
export const InvoiceType = z.enum(["periodic", "purchase"]);
export type InvoiceType = z.infer<typeof InvoiceType>;

export const InvoiceState = z.enum([
	"unknown_invoice_state",
	"stopped",
	"outstanding",
	"paid",
	"errored",
]);
export type InvoiceState = z.infer<typeof InvoiceState>;

export const Invoice = z.object({
	id: z.string().describe("Invoice ID"),
	organization_id: z.string().describe("Organization ID"),
	billing_period: z.string().describe("Billing period start date"),
	issued_date: z.string().describe("Date issued"),
	due_date: z.string().describe("Due date"),
	total_untaxed: Money.describe("Total before tax"),
	total_taxed: Money.describe("Total after tax"),
	invoice_type: InvoiceType.describe("Invoice type"),
	state: InvoiceState.describe("Invoice state"),
	number: z.number().describe("Invoice number"),
	seller_name: z.string().describe("Seller name"),
	start_date: z.string().describe("Start date"),
});
export type Invoice = z.infer<typeof Invoice>;

// --- Discount ---
export const DiscountMode = z.enum([
	"unknown_discount_mode",
	"discount_mode_rate",
	"discount_mode_value",
	"discount_mode_splittable",
]);
export type DiscountMode = z.infer<typeof DiscountMode>;

export const DiscountFilterType = z.enum(["unknown_filter_type", "category_name", "product_name"]);
export type DiscountFilterType = z.infer<typeof DiscountFilterType>;

export const DiscountCoupon = z.object({
	description: z.string().describe("Coupon description"),
});
export type DiscountCoupon = z.infer<typeof DiscountCoupon>;

export const DiscountFilter = z.object({
	type: DiscountFilterType.describe("Filter type"),
	value: z.string().describe("Filter value"),
});
export type DiscountFilter = z.infer<typeof DiscountFilter>;

export const Discount = z.object({
	id: z.string().describe("Discount ID"),
	creation_date: z.string().describe("Creation date"),
	organization_id: z.string().describe("Organization ID"),
	description: z.string().describe("Description"),
	value: z.number().describe("Discount value"),
	value_used: z.number().describe("Amount used"),
	value_remaining: z.number().describe("Amount remaining"),
	mode: DiscountMode.describe("Discount mode"),
	start_date: z.string().describe("Start date"),
	stop_date: z.string().describe("Stop date"),
	coupon: DiscountCoupon.nullable().optional().describe("Coupon details"),
	filters: z.array(DiscountFilter).describe("Discount filters"),
});
export type Discount = z.infer<typeof Discount>;

// --- Request Schemas ---
export const ConsumptionOrderBy = z.enum([
	"updated_at_desc",
	"updated_at_asc",
	"category_name_desc",
	"category_name_asc",
]);

export const ListConsumptionsParams = PaginationParams.extend({
	order_by: ConsumptionOrderBy.optional().describe("Sort order"),
	organization_id: z.string().optional().describe("Organization ID filter"),
	project_id: z.string().optional().describe("Project ID filter"),
	category_name: z.string().optional().describe("Filter by category name"),
	billing_period: z.string().optional().describe("Billing period in YYYY-MM format"),
});
export type ListConsumptionsParams = z.infer<typeof ListConsumptionsParams>;

export const InvoiceOrderBy = z.enum([
	"invoice_number_desc",
	"invoice_number_asc",
	"start_date_desc",
	"start_date_asc",
	"issued_date_desc",
	"issued_date_asc",
	"due_date_desc",
	"due_date_asc",
	"total_untaxed_desc",
	"total_untaxed_asc",
	"total_taxed_desc",
	"total_taxed_asc",
	"invoice_type_desc",
	"invoice_type_asc",
]);

export const ListInvoicesParams = PaginationParams.extend({
	organization_id: z.string().describe("Organization ID (required)"),
	billing_period_start_after: z
		.string()
		.optional()
		.describe("Filter invoices after this date (ISO 8601)"),
	billing_period_start_before: z
		.string()
		.optional()
		.describe("Filter invoices before this date (ISO 8601)"),
	invoice_type: InvoiceType.optional().describe("Filter by invoice type"),
	order_by: InvoiceOrderBy.optional().describe("Sort order"),
});
export type ListInvoicesParams = z.infer<typeof ListInvoicesParams>;

export const GetInvoiceParams = z.object({
	invoice_id: z.string().describe("Invoice ID"),
});
export type GetInvoiceParams = z.infer<typeof GetInvoiceParams>;

export const DownloadInvoiceParams = z.object({
	invoice_id: z.string().describe("Invoice ID"),
	file_type: z.enum(["pdf"]).optional().default("pdf").describe("File type (default: pdf)"),
});
export type DownloadInvoiceParams = z.infer<typeof DownloadInvoiceParams>;

export const DiscountOrderBy = z.enum(["creation_date_desc", "creation_date_asc"]);

export const ListDiscountsParams = PaginationParams.extend({
	organization_id: z.string().describe("Organization ID (required)"),
	order_by: DiscountOrderBy.optional().describe("Sort order"),
});
export type ListDiscountsParams = z.infer<typeof ListDiscountsParams>;

// --- Response Schemas ---
export const ListConsumptionsResponse = z.object({
	consumptions: z.array(Consumption),
	total_count: z.number(),
	total_discount_untaxed_value: z.number(),
	updated_at: z.string(),
});
export type ListConsumptionsResponse = z.infer<typeof ListConsumptionsResponse>;

export const ListInvoicesResponse = z.object({
	invoices: z.array(Invoice),
	total_count: z.number(),
});
export type ListInvoicesResponse = z.infer<typeof ListInvoicesResponse>;

export const ListDiscountsResponse = z.object({
	discounts: z.array(Discount),
	total_count: z.number(),
});
export type ListDiscountsResponse = z.infer<typeof ListDiscountsResponse>;
