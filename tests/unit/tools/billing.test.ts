import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Client } from "@scaleway/sdk-client";
import { describe, expect, it, vi } from "vitest";
import {
	handleDownloadInvoice,
	handleGetInvoice,
	handleListCharges,
	handleListConsumptions,
	handleListDiscounts,
	handleListInvoices,
} from "../../../src/tools/billing/handlers.js";
import { registerBillingTools } from "../../../src/tools/billing/index.js";
import {
	Charge,
	ChargeOrderBy,
	Consumption,
	ConsumptionOrderBy,
	Discount,
	DiscountCoupon,
	DiscountFilter,
	DiscountFilterType,
	DiscountMode,
	DiscountOrderBy,
	DownloadInvoiceParams,
	GetInvoiceParams,
	Invoice,
	InvoiceOrderBy,
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

// --- Types Tests ---

describe("billing types", () => {
	describe("Money", () => {
		it("parses valid money", () => {
			const result = Money.parse({ currency_code: "EUR", units: 10, nanos: 500000000 });
			expect(result.currency_code).toBe("EUR");
			expect(result.units).toBe(10);
			expect(result.nanos).toBe(500000000);
		});

		it("rejects missing fields", () => {
			expect(() => Money.parse({})).toThrow();
		});
	});

	describe("Consumption", () => {
		it("parses valid consumption", () => {
			const result = Consumption.parse({
				value: { currency_code: "EUR", units: 5, nanos: 0 },
				product_name: "Instance",
				resource_name: "my-server",
				sku: "SKU-001",
				project_id: "proj-123",
				category_name: "compute",
				unit: "hours",
				billed_quantity: "720",
			});
			expect(result.product_name).toBe("Instance");
			expect(result.billed_quantity).toBe("720");
		});

		it("rejects missing fields", () => {
			expect(() =>
				Consumption.parse({ value: { currency_code: "EUR", units: 0, nanos: 0 } }),
			).toThrow();
		});
	});

	describe("InvoiceType", () => {
		it("accepts periodic", () => {
			expect(InvoiceType.parse("periodic")).toBe("periodic");
		});

		it("accepts purchase", () => {
			expect(InvoiceType.parse("purchase")).toBe("purchase");
		});

		it("rejects invalid type", () => {
			expect(() => InvoiceType.parse("refund")).toThrow();
		});
	});

	describe("InvoiceState", () => {
		it("accepts all valid states", () => {
			for (const state of ["unknown_invoice_state", "stopped", "outstanding", "paid", "errored"]) {
				expect(InvoiceState.parse(state)).toBe(state);
			}
		});

		it("rejects invalid state", () => {
			expect(() => InvoiceState.parse("cancelled")).toThrow();
		});
	});

	describe("Invoice", () => {
		const validInvoice = {
			id: "inv-123",
			organization_id: "org-456",
			billing_period: "2025-01-01T00:00:00Z",
			issued_date: "2025-02-01T00:00:00Z",
			due_date: "2025-03-01T00:00:00Z",
			total_untaxed: { currency_code: "EUR", units: 100, nanos: 0 },
			total_taxed: { currency_code: "EUR", units: 120, nanos: 0 },
			invoice_type: "periodic",
			state: "paid",
			number: 42,
			seller_name: "Scaleway",
			start_date: "2025-01-01T00:00:00Z",
		};

		it("parses valid invoice", () => {
			const result = Invoice.parse(validInvoice);
			expect(result.id).toBe("inv-123");
			expect(result.invoice_type).toBe("periodic");
			expect(result.state).toBe("paid");
		});

		it("rejects missing id", () => {
			const { id, ...rest } = validInvoice;
			expect(() => Invoice.parse(rest)).toThrow();
		});
	});

	describe("DiscountMode", () => {
		it("accepts all valid modes", () => {
			for (const mode of [
				"unknown_discount_mode",
				"discount_mode_rate",
				"discount_mode_value",
				"discount_mode_splittable",
			]) {
				expect(DiscountMode.parse(mode)).toBe(mode);
			}
		});

		it("rejects invalid mode", () => {
			expect(() => DiscountMode.parse("percentage")).toThrow();
		});
	});

	describe("DiscountFilterType", () => {
		it("accepts valid types", () => {
			for (const t of ["unknown_filter_type", "category_name", "product_name"]) {
				expect(DiscountFilterType.parse(t)).toBe(t);
			}
		});

		it("rejects invalid type", () => {
			expect(() => DiscountFilterType.parse("region")).toThrow();
		});
	});

	describe("DiscountCoupon", () => {
		it("parses valid coupon", () => {
			const result = DiscountCoupon.parse({ description: "Welcome coupon" });
			expect(result.description).toBe("Welcome coupon");
		});
	});

	describe("DiscountFilter", () => {
		it("parses valid filter", () => {
			const result = DiscountFilter.parse({ type: "category_name", value: "compute" });
			expect(result.type).toBe("category_name");
			expect(result.value).toBe("compute");
		});
	});

	describe("Discount", () => {
		const validDiscount = {
			id: "disc-001",
			creation_date: "2025-01-01T00:00:00Z",
			organization_id: "org-123",
			description: "Test discount",
			value: 100.0,
			value_used: 25.0,
			value_remaining: 75.0,
			mode: "discount_mode_value",
			start_date: "2025-01-01T00:00:00Z",
			stop_date: "2025-12-31T00:00:00Z",
			coupon: { description: "WELCOME" },
			filters: [{ type: "category_name", value: "compute" }],
		};

		it("parses valid discount", () => {
			const result = Discount.parse(validDiscount);
			expect(result.id).toBe("disc-001");
			expect(result.value_remaining).toBe(75.0);
			expect(result.filters).toHaveLength(1);
		});

		it("accepts null coupon", () => {
			const result = Discount.parse({ ...validDiscount, coupon: null });
			expect(result.coupon).toBeNull();
		});

		it("accepts undefined coupon", () => {
			const { coupon, ...rest } = validDiscount;
			const result = Discount.parse(rest);
			expect(result.coupon).toBeUndefined();
		});

		it("accepts empty filters array", () => {
			const result = Discount.parse({ ...validDiscount, filters: [] });
			expect(result.filters).toHaveLength(0);
		});
	});

	describe("ConsumptionOrderBy", () => {
		it("accepts all valid values", () => {
			for (const v of [
				"updated_at_desc",
				"updated_at_asc",
				"category_name_desc",
				"category_name_asc",
			]) {
				expect(ConsumptionOrderBy.parse(v)).toBe(v);
			}
		});
	});

	describe("InvoiceOrderBy", () => {
		it("accepts all valid values", () => {
			for (const v of [
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
			]) {
				expect(InvoiceOrderBy.parse(v)).toBe(v);
			}
		});
	});

	describe("DiscountOrderBy", () => {
		it("accepts all valid values", () => {
			for (const v of ["creation_date_desc", "creation_date_asc"]) {
				expect(DiscountOrderBy.parse(v)).toBe(v);
			}
		});
	});

	describe("ChargeOrderBy", () => {
		it("accepts all valid values", () => {
			for (const v of ["start_date_asc", "start_date_desc"]) {
				expect(ChargeOrderBy.parse(v)).toBe(v);
			}
		});

		it("rejects invalid value", () => {
			expect(() => ChargeOrderBy.parse("value_desc")).toThrow();
		});
	});

	describe("Charge", () => {
		const validCharge = {
			category_name: "Compute",
			resource_name: "my-instance",
			resource_id: "res-123",
			project_id: "proj-456",
			value: { currency_code: "EUR", units: 3, nanos: 250000000 },
			discount_value: { currency_code: "EUR", units: 0, nanos: 0 },
			begin_date: "2025-06-01T00:00:00Z",
			end_date: "2025-06-30T23:59:59Z",
			unit: "hour",
			billed_quantity: 720,
		};

		it("parses valid charge", () => {
			const result = Charge.parse(validCharge);
			expect(result.resource_id).toBe("res-123");
			expect(result.billed_quantity).toBe(720);
			expect(result.value.currency_code).toBe("EUR");
		});

		it("rejects missing resource_id", () => {
			const { resource_id, ...rest } = validCharge;
			expect(() => Charge.parse(rest)).toThrow();
		});
	});

	describe("ListChargesParams", () => {
		it("requires organization_id", () => {
			expect(() => ListChargesParams.parse({})).toThrow();
		});

		it("parses with only organization_id", () => {
			const result = ListChargesParams.parse({ organization_id: "org-123" });
			expect(result.organization_id).toBe("org-123");
			expect(result.page_token).toBeUndefined();
		});

		it("parses with all optional params", () => {
			const result = ListChargesParams.parse({
				organization_id: "org-123",
				order_by: "start_date_desc",
				page_size: 100,
				page_token: "tok-abc",
				start_date_after: "2025-06-01T00:00:00Z",
				end_date_before: "2025-06-30T00:00:00Z",
				clamp_to_time_range: true,
				invoice_ids: ["inv-1"],
				project_ids: ["proj-1", "proj-2"],
				resource_ids: ["res-1"],
				resource_names: ["name-1"],
				skus: ["sku-1"],
			});
			expect(result.order_by).toBe("start_date_desc");
			expect(result.clamp_to_time_range).toBe(true);
			expect(result.project_ids).toEqual(["proj-1", "proj-2"]);
		});

		it("rejects page_size above 100", () => {
			expect(() =>
				ListChargesParams.parse({ organization_id: "org-123", page_size: 101 }),
			).toThrow();
		});
	});

	describe("ListChargesResponse", () => {
		it("parses valid response", () => {
			const result = ListChargesResponse.parse({
				charges: [],
				total_count: 0,
				next_page_token: "next-tok",
			});
			expect(result.total_count).toBe(0);
			expect(result.next_page_token).toBe("next-tok");
		});

		it("parses response without next_page_token", () => {
			const result = ListChargesResponse.parse({ charges: [], total_count: 0 });
			expect(result.next_page_token).toBeUndefined();
		});
	});

	describe("ListConsumptionsParams", () => {
		it("parses with defaults", () => {
			const result = ListConsumptionsParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("parses with all optional params", () => {
			const result = ListConsumptionsParams.parse({
				page: 2,
				pageSize: 20,
				order_by: "category_name_asc",
				organization_id: "org-123",
				project_id: "proj-456",
				category_name: "compute",
				billing_period: "2025-01",
			});
			expect(result.order_by).toBe("category_name_asc");
			expect(result.billing_period).toBe("2025-01");
		});
	});

	describe("ListInvoicesParams", () => {
		it("requires organization_id", () => {
			expect(() => ListInvoicesParams.parse({})).toThrow();
		});

		it("parses with organization_id", () => {
			const result = ListInvoicesParams.parse({ organization_id: "org-123" });
			expect(result.organization_id).toBe("org-123");
			expect(result.page).toBe(1);
		});

		it("parses with all optional params", () => {
			const result = ListInvoicesParams.parse({
				organization_id: "org-123",
				billing_period_start_after: "2025-01-01T00:00:00Z",
				billing_period_start_before: "2025-12-31T00:00:00Z",
				invoice_type: "periodic",
				order_by: "issued_date_desc",
				page: 3,
				pageSize: 10,
			});
			expect(result.invoice_type).toBe("periodic");
			expect(result.order_by).toBe("issued_date_desc");
		});
	});

	describe("GetInvoiceParams", () => {
		it("requires invoice_id", () => {
			expect(() => GetInvoiceParams.parse({})).toThrow();
		});

		it("parses valid params", () => {
			const result = GetInvoiceParams.parse({ invoice_id: "inv-123" });
			expect(result.invoice_id).toBe("inv-123");
		});
	});

	describe("DownloadInvoiceParams", () => {
		it("requires invoice_id", () => {
			expect(() => DownloadInvoiceParams.parse({})).toThrow();
		});

		it("defaults file_type to pdf", () => {
			const result = DownloadInvoiceParams.parse({ invoice_id: "inv-123" });
			expect(result.file_type).toBe("pdf");
		});

		it("accepts explicit pdf file_type", () => {
			const result = DownloadInvoiceParams.parse({ invoice_id: "inv-123", file_type: "pdf" });
			expect(result.file_type).toBe("pdf");
		});
	});

	describe("ListDiscountsParams", () => {
		it("requires organization_id", () => {
			expect(() => ListDiscountsParams.parse({})).toThrow();
		});

		it("parses with organization_id and defaults", () => {
			const result = ListDiscountsParams.parse({ organization_id: "org-123" });
			expect(result.organization_id).toBe("org-123");
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts order_by", () => {
			const result = ListDiscountsParams.parse({
				organization_id: "org-123",
				order_by: "creation_date_asc",
			});
			expect(result.order_by).toBe("creation_date_asc");
		});
	});

	describe("ListConsumptionsResponse", () => {
		it("parses valid response", () => {
			const result = ListConsumptionsResponse.parse({
				consumptions: [],
				total_count: 0,
				total_discount_untaxed_value: 0,
				updated_at: "2025-01-01T00:00:00Z",
			});
			expect(result.total_count).toBe(0);
		});
	});

	describe("ListInvoicesResponse", () => {
		it("parses valid response", () => {
			const result = ListInvoicesResponse.parse({
				invoices: [],
				total_count: 0,
			});
			expect(result.total_count).toBe(0);
		});
	});

	describe("ListDiscountsResponse", () => {
		it("parses valid response", () => {
			const result = ListDiscountsResponse.parse({
				discounts: [],
				total_count: 0,
			});
			expect(result.total_count).toBe(0);
		});
	});
});

// --- Handlers Tests ---

function createMockClient(response: unknown): Client {
	return {
		fetch: vi.fn().mockResolvedValue(response),
		settings: {} as Client["settings"],
	};
}

function createFailingClient(error: Error): Client {
	return {
		fetch: vi.fn().mockRejectedValue(error),
		settings: {} as Client["settings"],
	};
}

describe("billing handlers", () => {
	describe("handleListConsumptions", () => {
		it("returns consumption data on success", async () => {
			const mockResponse = {
				consumptions: [
					{ product_name: "Instance", value: { currency_code: "EUR", units: 5, nanos: 0 } },
				],
				total_count: 1,
				total_discount_untaxed_value: 0,
				updated_at: "2025-01-01T00:00:00Z",
			};
			const client = createMockClient(mockResponse);
			const result = await handleListConsumptions(client, { page: 1, pageSize: 50 });

			expect(result.content).toHaveLength(1);
			expect(result.content[0].type).toBe("text");
			expect(JSON.parse(result.content[0].text)).toEqual(mockResponse);
		});

		it("passes all parameters to the API", async () => {
			const client = createMockClient({
				consumptions: [],
				total_count: 0,
				total_discount_untaxed_value: 0,
				updated_at: "",
			});
			await handleListConsumptions(client, {
				page: 2,
				pageSize: 20,
				order_by: "category_name_asc",
				organization_id: "org-123",
				project_id: "proj-456",
				category_name: "compute",
				billing_period: "2025-01",
			});

			const fetchCall = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/billing/v2beta1/consumptions");
			expect(fetchCall.urlParams.get("page")).toBe("2");
			expect(fetchCall.urlParams.get("page_size")).toBe("20");
			expect(fetchCall.urlParams.get("order_by")).toBe("category_name_asc");
			expect(fetchCall.urlParams.get("organization_id")).toBe("org-123");
			expect(fetchCall.urlParams.get("project_id")).toBe("proj-456");
			expect(fetchCall.urlParams.get("category_name")).toBe("compute");
			expect(fetchCall.urlParams.get("billing_period")).toBe("2025-01");
		});

		it("omits undefined optional parameters", async () => {
			const client = createMockClient({
				consumptions: [],
				total_count: 0,
				total_discount_untaxed_value: 0,
				updated_at: "",
			});
			await handleListConsumptions(client, { page: 1, pageSize: 50 });

			const fetchCall = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(fetchCall.urlParams.has("order_by")).toBe(false);
			expect(fetchCall.urlParams.has("organization_id")).toBe(false);
			expect(fetchCall.urlParams.has("project_id")).toBe(false);
		});

		it("returns error response on failure", async () => {
			const error = new Error("unauthorized");
			(error as Error & { statusCode: number }).statusCode = 401;
			const client = createFailingClient(error);
			const result = await handleListConsumptions(client, { page: 1, pageSize: 50 });

			expect(result).toHaveProperty("isError", true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
			expect(parsed.error.statusCode).toBe(401);
		});
	});

	describe("handleListInvoices", () => {
		it("returns invoice data on success", async () => {
			const mockResponse = {
				invoices: [{ id: "inv-1", number: 1 }],
				total_count: 1,
			};
			const client = createMockClient(mockResponse);
			const result = await handleListInvoices(client, {
				page: 1,
				pageSize: 50,
				organization_id: "org-123",
			});

			expect(result.content).toHaveLength(1);
			expect(JSON.parse(result.content[0].text)).toEqual(mockResponse);
		});

		it("passes all parameters to the API", async () => {
			const client = createMockClient({ invoices: [], total_count: 0 });
			await handleListInvoices(client, {
				page: 1,
				pageSize: 50,
				organization_id: "org-123",
				billing_period_start_after: "2025-01-01T00:00:00Z",
				billing_period_start_before: "2025-12-31T00:00:00Z",
				invoice_type: "periodic",
				order_by: "issued_date_desc",
			});

			const fetchCall = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/billing/v2beta1/invoices");
			expect(fetchCall.urlParams.get("organization_id")).toBe("org-123");
			expect(fetchCall.urlParams.get("billing_period_start_after")).toBe("2025-01-01T00:00:00Z");
			expect(fetchCall.urlParams.get("invoice_type")).toBe("periodic");
			expect(fetchCall.urlParams.get("order_by")).toBe("issued_date_desc");
		});

		it("returns error response on failure", async () => {
			const error = new Error("not found");
			(error as Error & { statusCode: number }).statusCode = 404;
			const client = createFailingClient(error);
			const result = await handleListInvoices(client, {
				page: 1,
				pageSize: 50,
				organization_id: "org-123",
			});

			expect(result).toHaveProperty("isError", true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleGetInvoice", () => {
		it("returns invoice on success", async () => {
			const mockInvoice = { id: "inv-123", number: 42 };
			const client = createMockClient(mockInvoice);
			const result = await handleGetInvoice(client, { invoice_id: "inv-123" });

			expect(result.content).toHaveLength(1);
			expect(JSON.parse(result.content[0].text)).toEqual(mockInvoice);
		});

		it("calls correct API path with encoded invoice_id", async () => {
			const client = createMockClient({});
			await handleGetInvoice(client, { invoice_id: "inv-123" });

			const fetchCall = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/billing/v2beta1/invoices/inv-123");
		});

		it("returns error response on failure", async () => {
			const error = new Error("not found");
			(error as Error & { statusCode: number }).statusCode = 404;
			const client = createFailingClient(error);
			const result = await handleGetInvoice(client, { invoice_id: "inv-999" });

			expect(result).toHaveProperty("isError", true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleDownloadInvoice", () => {
		it("returns download response on success", async () => {
			const mockResponse = { url: "https://example.com/invoice.pdf" };
			const client = createMockClient(mockResponse);
			const result = await handleDownloadInvoice(client, {
				invoice_id: "inv-123",
				file_type: "pdf",
			});

			expect(result.content).toHaveLength(1);
			expect(JSON.parse(result.content[0].text)).toEqual(mockResponse);
		});

		it("calls correct API path with file_type param", async () => {
			const client = createMockClient({});
			await handleDownloadInvoice(client, { invoice_id: "inv-123", file_type: "pdf" });

			const fetchCall = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/billing/v2beta1/invoices/inv-123/download");
			expect(fetchCall.urlParams.get("file_type")).toBe("pdf");
		});

		it("returns error response on failure", async () => {
			const error = new Error("server error");
			(error as Error & { statusCode: number }).statusCode = 500;
			const client = createFailingClient(error);
			const result = await handleDownloadInvoice(client, {
				invoice_id: "inv-123",
				file_type: "pdf",
			});

			expect(result).toHaveProperty("isError", true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});

	describe("handleListDiscounts", () => {
		it("returns discount data on success", async () => {
			const mockResponse = {
				discounts: [{ id: "disc-1", value: 100 }],
				total_count: 1,
			};
			const client = createMockClient(mockResponse);
			const result = await handleListDiscounts(client, {
				page: 1,
				pageSize: 50,
				organization_id: "org-123",
			});

			expect(result.content).toHaveLength(1);
			expect(JSON.parse(result.content[0].text)).toEqual(mockResponse);
		});

		it("passes all parameters to the API", async () => {
			const client = createMockClient({ discounts: [], total_count: 0 });
			await handleListDiscounts(client, {
				page: 2,
				pageSize: 10,
				organization_id: "org-123",
				order_by: "creation_date_desc",
			});

			const fetchCall = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/billing/v2beta1/discounts");
			expect(fetchCall.urlParams.get("page")).toBe("2");
			expect(fetchCall.urlParams.get("page_size")).toBe("10");
			expect(fetchCall.urlParams.get("organization_id")).toBe("org-123");
			expect(fetchCall.urlParams.get("order_by")).toBe("creation_date_desc");
		});

		it("returns error response on failure", async () => {
			const error = new Error("forbidden");
			(error as Error & { statusCode: number }).statusCode = 403;
			const client = createFailingClient(error);
			const result = await handleListDiscounts(client, {
				page: 1,
				pageSize: 50,
				organization_id: "org-123",
			});

			expect(result).toHaveProperty("isError", true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleListCharges", () => {
		it("returns charge data on success", async () => {
			const mockResponse = {
				charges: [{ resource_id: "res-1", value: { currency_code: "EUR", units: 1, nanos: 0 } }],
				total_count: 1,
				next_page_token: "next-tok",
			};
			const client = createMockClient(mockResponse);
			const result = await handleListCharges(client, { organization_id: "org-123" });

			expect(result.content).toHaveLength(1);
			expect(JSON.parse(result.content[0].text)).toEqual(mockResponse);
		});

		it("passes all parameters to the API, appending array filters", async () => {
			const client = createMockClient({ charges: [], total_count: 0 });
			await handleListCharges(client, {
				organization_id: "org-123",
				order_by: "start_date_desc",
				page_size: 100,
				page_token: "tok-abc",
				start_date_after: "2025-06-01T00:00:00Z",
				end_date_before: "2025-06-30T00:00:00Z",
				clamp_to_time_range: true,
				invoice_ids: ["inv-1"],
				project_ids: ["proj-1", "proj-2"],
				resource_ids: ["res-1"],
				resource_names: ["name-1"],
				skus: ["sku-1"],
			});

			const fetchCall = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(fetchCall.method).toBe("GET");
			expect(fetchCall.path).toBe("/billing/v2beta1/charges");
			expect(fetchCall.urlParams.get("organization_id")).toBe("org-123");
			expect(fetchCall.urlParams.get("order_by")).toBe("start_date_desc");
			expect(fetchCall.urlParams.get("page_size")).toBe("100");
			expect(fetchCall.urlParams.get("page_token")).toBe("tok-abc");
			expect(fetchCall.urlParams.get("clamp_to_time_range")).toBe("true");
			expect(fetchCall.urlParams.getAll("project_ids")).toEqual(["proj-1", "proj-2"]);
			expect(fetchCall.urlParams.getAll("resource_ids")).toEqual(["res-1"]);
			expect(fetchCall.urlParams.getAll("skus")).toEqual(["sku-1"]);
		});

		it("omits undefined optional parameters", async () => {
			const client = createMockClient({ charges: [], total_count: 0 });
			await handleListCharges(client, { organization_id: "org-123" });

			const fetchCall = (client.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
			expect(fetchCall.urlParams.has("order_by")).toBe(false);
			expect(fetchCall.urlParams.has("page_token")).toBe(false);
			expect(fetchCall.urlParams.has("resource_ids")).toBe(false);
			expect(fetchCall.urlParams.has("clamp_to_time_range")).toBe(false);
		});

		it("returns error response on failure", async () => {
			const error = new Error("forbidden");
			(error as Error & { statusCode: number }).statusCode = 403;
			const client = createFailingClient(error);
			const result = await handleListCharges(client, { organization_id: "org-123" });

			expect(result).toHaveProperty("isError", true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});
});

// --- Registration Tests ---

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: vi.fn().mockReturnValue({
		accessKey: "SCW-KEY",
		secretKey: "secret",
		defaultProjectId: "proj-123",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: vi.fn().mockReturnValue({
		fetch: vi.fn().mockResolvedValue({ result: "ok" }),
		settings: {},
	}),
}));

describe("billing module registration", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerBillingTools(server)).not.toThrow();
	});

	it("registers all six billing tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerBillingTools(server);

		expect(toolSpy).toHaveBeenCalledTimes(6);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_billing_list_consumptions");
		expect(toolNames).toContain("scaleway_billing_list_invoices");
		expect(toolNames).toContain("scaleway_billing_get_invoice");
		expect(toolNames).toContain("scaleway_billing_download_invoice");
		expect(toolNames).toContain("scaleway_billing_list_charges");
		expect(toolNames).toContain("scaleway_billing_list_discounts");
	});
});

describe("billing tool callbacks", () => {
	it("list_consumptions callback invokes auth, client, and handler", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerBillingTools(server);

		// Get the callback (4th argument to server.tool)
		const listConsumptionsCall = toolSpy.mock.calls.find(
			(call) => call[0] === "scaleway_billing_list_consumptions",
		);
		const callback = listConsumptionsCall?.[3] as (
			params: Record<string, unknown>,
		) => Promise<unknown>;
		const result = await callback({});
		expect(result).toHaveProperty("content");
	});

	it("list_invoices callback invokes auth, client, and handler", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerBillingTools(server);

		const call = toolSpy.mock.calls.find((c) => c[0] === "scaleway_billing_list_invoices");
		const callback = call?.[3] as (params: Record<string, unknown>) => Promise<unknown>;
		const result = await callback({ organization_id: "org-123" });
		expect(result).toHaveProperty("content");
	});

	it("get_invoice callback invokes auth, client, and handler", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerBillingTools(server);

		const call = toolSpy.mock.calls.find((c) => c[0] === "scaleway_billing_get_invoice");
		const callback = call?.[3] as (params: Record<string, unknown>) => Promise<unknown>;
		const result = await callback({ invoice_id: "inv-123" });
		expect(result).toHaveProperty("content");
	});

	it("download_invoice callback invokes auth, client, and handler", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerBillingTools(server);

		const call = toolSpy.mock.calls.find((c) => c[0] === "scaleway_billing_download_invoice");
		const callback = call?.[3] as (params: Record<string, unknown>) => Promise<unknown>;
		const result = await callback({ invoice_id: "inv-123" });
		expect(result).toHaveProperty("content");
	});

	it("list_charges callback invokes auth, client, and handler", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerBillingTools(server);

		const call = toolSpy.mock.calls.find((c) => c[0] === "scaleway_billing_list_charges");
		const callback = call?.[3] as (params: Record<string, unknown>) => Promise<unknown>;
		const result = await callback({ organization_id: "org-123" });
		expect(result).toHaveProperty("content");
	});

	it("list_discounts callback invokes auth, client, and handler", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerBillingTools(server);

		const call = toolSpy.mock.calls.find((c) => c[0] === "scaleway_billing_list_discounts");
		const callback = call?.[3] as (params: Record<string, unknown>) => Promise<unknown>;
		const result = await callback({ organization_id: "org-123" });
		expect(result).toHaveProperty("content");
	});
});
