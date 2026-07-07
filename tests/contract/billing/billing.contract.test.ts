/**
 * Contract tests for Scaleway Billing API v2beta1
 *
 * Validates request/response shapes against
 *   specs/scaleway-api/billing/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 *
 * API: https://www.scaleway.com/en/developers/api/billing/
 *      https://www.scaleway.com/en/developers/api/billing_finops/ (Billing - FinOps: charges)
 * Base URL: https://api.scaleway.com/billing/v2beta1
 * Auth: X-Auth-Token header
 */
import { describe, expect, it } from "vitest";
import {
	Charge,
	ChargeOrderBy,
	Consumption,
	Discount,
	DiscountFilter,
	DiscountFilterType,
	DiscountMode,
	DownloadInvoiceParams,
	GetInvoiceParams,
	Invoice,
	InvoiceState,
	InvoiceType,
	ListChargesParams,
	ListChargesResponse,
	ListConsumptionsParams,
	ListConsumptionsResponse,
	ListDiscountsParams,
	ListDiscountsResponse,
	ListInvoicesParams,
	ListInvoicesResponse,
	Money,
} from "../../../src/tools/billing/types.js";

// --- Shared fixtures ---

const ORG_UUID = "11111111-2222-3333-4444-555555555555";
const PROJECT_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

const validMoney = {
	currency_code: "EUR",
	units: 42,
	nanos: 500000000,
};

const validConsumption = {
	value: validMoney,
	product_name: "Instances",
	resource_name: "my-instance",
	sku: "instance_dev1_s",
	project_id: PROJECT_UUID,
	category_name: "Compute",
	unit: "hour",
	billed_quantity: "720",
};

const validInvoice = {
	id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
	organization_id: ORG_UUID,
	billing_period: "2025-06-01T00:00:00Z",
	issued_date: "2025-07-01T00:00:00Z",
	due_date: "2025-07-15T00:00:00Z",
	total_untaxed: validMoney,
	total_taxed: { currency_code: "EUR", units: 51, nanos: 0 },
	invoice_type: "periodic" as const,
	state: "paid" as const,
	number: 12345,
	seller_name: "Scaleway SAS",
	start_date: "2025-06-01T00:00:00Z",
};

const validDiscount = {
	id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
	creation_date: "2025-01-01T00:00:00Z",
	organization_id: ORG_UUID,
	description: "Welcome credit",
	value: 100,
	value_used: 25,
	value_remaining: 75,
	mode: "discount_mode_value" as const,
	start_date: "2025-01-01T00:00:00Z",
	stop_date: "2025-12-31T00:00:00Z",
	coupon: { description: "WELCOME2025" },
	filters: [{ type: "category_name" as const, value: "Compute" }],
};

const validCharge = {
	category_name: "Compute",
	resource_name: "my-instance",
	resource_id: "res-11111111",
	project_id: PROJECT_UUID,
	value: validMoney,
	discount_value: { currency_code: "EUR", units: 0, nanos: 0 },
	begin_date: "2025-06-01T00:00:00Z",
	end_date: "2025-06-30T23:59:59Z",
	unit: "hour",
	billed_quantity: 720,
};

// --- Entity contracts ---

describe("contract: Money entity shape", () => {
	it("validates a money object", () => {
		expect(() => Money.parse(validMoney)).not.toThrow();
	});

	it("rejects money missing currency_code", () => {
		expect(() => Money.parse({ units: 1, nanos: 0 })).toThrow();
	});
});

/**
 * API: GET /billing/v2beta1/consumptions
 * Spec: specs/scaleway-api/billing/api-reference.md#list-consumptions
 */
describe("contract: ListConsumptions", () => {
	it("validates consumption entity", () => {
		expect(() => Consumption.parse(validConsumption)).not.toThrow();
	});

	it("validates list consumptions response", () => {
		const response = {
			consumptions: [validConsumption],
			total_count: 1,
			total_discount_untaxed_value: 0,
			updated_at: "2025-07-01T00:00:00Z",
		};
		expect(() => ListConsumptionsResponse.parse(response)).not.toThrow();
	});

	it("validates empty consumptions response", () => {
		const response = {
			consumptions: [],
			total_count: 0,
			total_discount_untaxed_value: 0,
			updated_at: "2025-07-01T00:00:00Z",
		};
		expect(() => ListConsumptionsResponse.parse(response)).not.toThrow();
	});

	it("applies default pagination", () => {
		const result = ListConsumptionsParams.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("validates full filter request", () => {
		const input = {
			order_by: "updated_at_desc",
			organization_id: ORG_UUID,
			project_id: PROJECT_UUID,
			category_name: "Compute",
			billing_period: "2025-06",
			page: 2,
			pageSize: 20,
		};
		expect(() => ListConsumptionsParams.parse(input)).not.toThrow();
	});

	it("validates all order_by values", () => {
		for (const order_by of [
			"updated_at_desc",
			"updated_at_asc",
			"category_name_desc",
			"category_name_asc",
		]) {
			expect(() => ListConsumptionsParams.parse({ order_by })).not.toThrow();
		}
	});

	it("rejects invalid order_by", () => {
		expect(() => ListConsumptionsParams.parse({ order_by: "price_asc" })).toThrow();
	});
});

/**
 * API: GET /billing/v2beta1/invoices
 * Spec: specs/scaleway-api/billing/api-reference.md#list-invoices
 */
describe("contract: ListInvoices", () => {
	it("validates invoice entity", () => {
		expect(() => Invoice.parse(validInvoice)).not.toThrow();
	});

	it("validates list invoices response", () => {
		const response = { invoices: [validInvoice], total_count: 1 };
		expect(() => ListInvoicesResponse.parse(response)).not.toThrow();
	});

	it("validates all invoice types", () => {
		for (const invoice_type of ["periodic", "purchase"]) {
			expect(() => Invoice.parse({ ...validInvoice, invoice_type })).not.toThrow();
		}
	});

	it("validates all invoice states", () => {
		for (const state of ["unknown_invoice_state", "stopped", "outstanding", "paid", "errored"]) {
			expect(() => Invoice.parse({ ...validInvoice, state })).not.toThrow();
		}
	});

	it("rejects invalid invoice state", () => {
		expect(() => Invoice.parse({ ...validInvoice, state: "cancelled" })).toThrow();
	});

	it("rejects invalid invoice type", () => {
		expect(() => InvoiceType.parse("refund")).toThrow();
	});

	it("requires organization_id", () => {
		expect(() => ListInvoicesParams.parse({})).toThrow();
	});

	it("validates full filter request", () => {
		const input = {
			organization_id: ORG_UUID,
			billing_period_start_after: "2025-01-01T00:00:00Z",
			billing_period_start_before: "2025-12-31T00:00:00Z",
			invoice_type: "periodic",
			order_by: "issued_date_desc",
			page: 1,
			pageSize: 50,
		};
		expect(() => ListInvoicesParams.parse(input)).not.toThrow();
	});

	it("rejects invalid order_by", () => {
		expect(() =>
			ListInvoicesParams.parse({ organization_id: ORG_UUID, order_by: "amount_desc" }),
		).toThrow();
	});
});

/**
 * API: GET /billing/v2beta1/invoices/{invoice_id}
 * Spec: specs/scaleway-api/billing/api-reference.md#get-invoice
 */
describe("contract: GetInvoice", () => {
	it("validates request shape", () => {
		expect(() => GetInvoiceParams.parse({ invoice_id: validInvoice.id })).not.toThrow();
	});

	it("rejects missing invoice_id", () => {
		expect(() => GetInvoiceParams.parse({})).toThrow();
	});
});

/**
 * API: GET /billing/v2beta1/invoices/{invoice_id}/download
 * Spec: specs/scaleway-api/billing/api-reference.md#download-invoice
 */
describe("contract: DownloadInvoice", () => {
	it("defaults file_type to pdf", () => {
		const result = DownloadInvoiceParams.parse({ invoice_id: validInvoice.id });
		expect(result.file_type).toBe("pdf");
	});

	it("accepts explicit pdf file_type", () => {
		expect(() =>
			DownloadInvoiceParams.parse({ invoice_id: validInvoice.id, file_type: "pdf" }),
		).not.toThrow();
	});

	it("rejects unsupported file_type", () => {
		expect(() =>
			DownloadInvoiceParams.parse({ invoice_id: validInvoice.id, file_type: "csv" }),
		).toThrow();
	});

	it("rejects missing invoice_id", () => {
		expect(() => DownloadInvoiceParams.parse({})).toThrow();
	});
});

/**
 * API: GET /billing/v2beta1/discounts
 * Spec: specs/scaleway-api/billing/api-reference.md#list-discounts
 */
describe("contract: ListDiscounts", () => {
	it("validates discount entity", () => {
		expect(() => Discount.parse(validDiscount)).not.toThrow();
	});

	it("validates discount with null coupon", () => {
		expect(() => Discount.parse({ ...validDiscount, coupon: null })).not.toThrow();
	});

	it("validates discount without coupon field", () => {
		const { coupon, ...withoutCoupon } = validDiscount;
		void coupon;
		expect(() => Discount.parse(withoutCoupon)).not.toThrow();
	});

	it("validates list discounts response", () => {
		const response = { discounts: [validDiscount], total_count: 1 };
		expect(() => ListDiscountsResponse.parse(response)).not.toThrow();
	});

	it("validates all discount modes", () => {
		for (const mode of [
			"unknown_discount_mode",
			"discount_mode_rate",
			"discount_mode_value",
			"discount_mode_splittable",
		]) {
			expect(() => DiscountMode.parse(mode)).not.toThrow();
		}
	});

	it("rejects invalid discount mode", () => {
		expect(() => DiscountMode.parse("discount_mode_percent")).toThrow();
	});

	it("validates all discount filter types", () => {
		for (const type of ["unknown_filter_type", "category_name", "product_name"]) {
			expect(() => DiscountFilter.parse({ type, value: "x" })).not.toThrow();
		}
	});

	it("rejects invalid discount filter type", () => {
		expect(() => DiscountFilterType.parse("region_name")).toThrow();
	});

	it("requires organization_id", () => {
		expect(() => ListDiscountsParams.parse({})).toThrow();
	});

	it("validates request with order_by", () => {
		expect(() =>
			ListDiscountsParams.parse({ organization_id: ORG_UUID, order_by: "creation_date_asc" }),
		).not.toThrow();
	});

	it("rejects invalid order_by", () => {
		expect(() =>
			ListDiscountsParams.parse({ organization_id: ORG_UUID, order_by: "value_desc" }),
		).toThrow();
	});
});

/**
 * API: GET /billing/v2beta1/charges (Billing - FinOps)
 * Spec: specs/scaleway-api/billing/api-reference.md#finops-list-charges
 */
describe("contract: ListCharges (FinOps)", () => {
	it("validates charge entity", () => {
		expect(() => Charge.parse(validCharge)).not.toThrow();
	});

	it("rejects charge missing resource_id", () => {
		const { resource_id, ...rest } = validCharge;
		void resource_id;
		expect(() => Charge.parse(rest)).toThrow();
	});

	it("validates list charges response", () => {
		const response = { charges: [validCharge], total_count: 1, next_page_token: "tok" };
		expect(() => ListChargesResponse.parse(response)).not.toThrow();
	});

	it("validates list charges response without next_page_token", () => {
		expect(() => ListChargesResponse.parse({ charges: [], total_count: 0 })).not.toThrow();
	});

	it("validates all order_by values", () => {
		for (const order_by of ["start_date_asc", "start_date_desc"]) {
			expect(() => ListChargesParams.parse({ organization_id: ORG_UUID, order_by })).not.toThrow();
		}
	});

	it("rejects invalid order_by", () => {
		expect(() => ChargeOrderBy.parse("updated_at_desc")).toThrow();
	});

	it("requires organization_id", () => {
		expect(() => ListChargesParams.parse({})).toThrow();
	});

	it("validates full filter request with array filters and cursor", () => {
		const input = {
			organization_id: ORG_UUID,
			order_by: "start_date_desc",
			page_size: 100,
			page_token: "tok-abc",
			start_date_after: "2025-06-01T00:00:00Z",
			end_date_before: "2025-06-30T00:00:00Z",
			clamp_to_time_range: true,
			invoice_ids: ["inv-1"],
			project_ids: [PROJECT_UUID],
			resource_ids: ["res-1"],
			resource_names: ["my-instance"],
			skus: ["instance_dev1_s"],
		};
		expect(() => ListChargesParams.parse(input)).not.toThrow();
	});

	it("rejects page_size above the documented maximum of 100", () => {
		expect(() => ListChargesParams.parse({ organization_id: ORG_UUID, page_size: 101 })).toThrow();
	});
});

/**
 * Auth contract: all billing operations authenticate via X-Auth-Token.
 * Spec: specs/scaleway-api/billing/api-reference.md#authentication
 */
describe("contract: InvoiceState enum", () => {
	it("accepts every documented state", () => {
		expect(InvoiceState.options).toEqual([
			"unknown_invoice_state",
			"stopped",
			"outstanding",
			"paid",
			"errored",
		]);
	});
});
