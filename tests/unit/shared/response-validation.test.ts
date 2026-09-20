/** Contracts: specs/064-remaining-remediation/contracts/response-validation.md. */
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	assertOperationAvailable,
	findResponseRoute,
	initializeResponseSchemas,
	responseSchema,
	validateSchema,
	validateSdkResponse,
	validateUpstreamResponse,
	withResponseRequest,
} from "../../../src/shared/response-validation.js";

const fixture = vi.hoisted(() => ({
	documents: {
		fixture: {
			components: {
				schemas: {
					Item: {
						type: "object",
						required: ["id"],
						properties: { id: { type: "string" }, count: { type: "integer", minimum: 0 } },
					},
				},
			},
			paths: {
				"/wildcard": {
					get: {
						responses: {
							"2XX": { content: { "application/json": { schema: { type: "string" } } } },
						},
					},
				},
				"/items/{id}": {
					get: {
						responses: {
							"200": {
								content: { "application/json": { schema: { $ref: "#/components/schemas/Item" } } },
							},
							"201": { content: { "text/plain": { schema: { type: "string", minLength: 3 } } } },
							"202": { content: {} },
							"204": {},
							"400": { content: { "application/json": { schema: false } } },
						},
					},
				},
			},
		},
	},
	routes: {
		scaleway_fixture_unavailable: [],
		scaleway_fixture_wildcard: [
			{
				method: "GET",
				path: "/wildcard",
				host: "api.scaleway.com",
				area: "fixture",
				sourcePath: "/wildcard",
			},
		],
		scaleway_fixture_dynamic: [
			{
				method: "GET",
				path: "/items/{id}",
				host: "api.scaleway.com",
				area: "fixture",
				sourcePath: "/items/{id}",
				query: "view={view}",
			},
		],
		scaleway_fixture_get: [
			{
				method: "GET",
				path: "/items/{id}",
				host: "api.scaleway.com",
				area: "fixture",
				sourcePath: "/items/{id}",
				query: "view=full",
			},
		],
		scaleway_fixture_absent: [
			{
				method: "GET",
				path: "/absent",
				host: "api.scaleway.com",
				area: "fixture",
				sourcePath: "/absent",
			},
		],
		scaleway_fixture_missing_document: [
			{
				method: "GET",
				path: "/missing",
				host: "api.scaleway.com",
				area: "absent",
				sourcePath: "/absent",
			},
		],
		scaleway_fixture_s3: [
			{ method: "GET", path: "/", host: "s3.{region}.scw.cloud", area: "s3", sourcePath: "/" },
		],
	},
}));
vi.mock("../../../src/shared/response-contracts.json", () => ({ default: fixture }));
vi.mock("../../../src/shared/unavailable-operations.json", () => ({
	default: { scaleway_fixture_unavailable: {} },
}));

const url = "https://api.scaleway.com/items/public-id?view=full";
function json(body: unknown, status = 200, contentType = "application/json") {
	return new Response(JSON.stringify(body), { status, headers: { "content-type": contentType } });
}
function validate(response: Response, operation = "scaleway_fixture_get", address = url) {
	return validateUpstreamResponse(operation, address, "GET", response);
}
afterEach(() => vi.restoreAllMocks());

describe("source response schemas", () => {
	it("validates nested reference constraints and preserves unknown properties", () => {
		const schema = { type: "array", items: { $ref: "#/components/schemas/Item" } };
		const payload = [{ id: "one", count: 3, future: { present: true } }];
		expect(responseSchema("fixture", schema).parse(payload)).toBe(payload);
		for (const invalid of [null, {}, [null], [{}], [{ id: 3 }], [{ id: "one", count: -1 }]]) {
			expect(() => validateSchema("fixture", schema, invalid)).toThrow("invalid_schema");
		}
	});
	it("retains optional properties, does not insert defaults, and does not coerce strings", () => {
		const value = { id: "one" };
		validateSchema("fixture", { $ref: "#/components/schemas/Item" }, value);
		expect(value).toEqual({ id: "one" });
		expect(() => validateSchema("fixture", { type: "number", default: 1 }, "3")).toThrow(
			"invalid_schema",
		);
	});
	it("checks unions, enums, nullability, formats and limits", () => {
		for (const [schema, valid, invalid] of [
			[{ oneOf: [{ type: "string", enum: ["ready"] }, { type: "null" }] }, null, "invented"],
			[{ type: "string", nullable: true }, null, false],
			[{ type: "string", format: "date-time" }, "2026-09-19T12:00:00Z", "not-a-time"],
			[{ type: "integer", format: "uint32" }, 0, 2 ** 32],
			[{ type: "integer", format: "uint32" }, 2 ** 32 - 1, -1],
			[{ type: "number", format: "uint32" }, 3, 0.5],
			[{ type: "integer", format: "int32" }, -(2 ** 31), 2 ** 31],
			[{ type: "integer", format: "uint64" }, 10, -1],
			[{ type: "integer", format: "int64" }, -10, 2 ** 64],
			[{ type: "string", minLength: 3, pattern: "^a" }, "abc", "xyz"],
		] as const) {
			validateSchema("fixture", schema, valid);
			expect(() => validateSchema("fixture", schema, invalid)).toThrow("invalid_schema");
		}
	});
	it("supports boolean schemas and fails unknown sources", () => {
		validateSchema("fixture", true, { arbitrary: "json" });
		expect(() => validateSchema("fixture", false, {})).toThrow("invalid_schema");
		expect(() => validateSchema("missing", {}, {})).toThrow("missing_contract");
	});
	it("checks all catalog schemas during health, including missing route evidence", () => {
		expect(() => initializeResponseSchemas()).toThrow("missing_contract");
		const absent = fixture.routes.scaleway_fixture_absent;
		const missing = fixture.routes.scaleway_fixture_missing_document;
		const routes = fixture.routes as Record<string, unknown>;
		Reflect.deleteProperty(routes, "scaleway_fixture_absent");
		Reflect.deleteProperty(routes, "scaleway_fixture_missing_document");
		try {
			expect(() => initializeResponseSchemas()).not.toThrow();
		} finally {
			fixture.routes.scaleway_fixture_absent = absent;
			fixture.routes.scaleway_fixture_missing_document = missing;
		}
	});
});

describe("wire responses", () => {
	it("blocks unverified legacy operations before requests and rejects unrecorded empty routes", () => {
		expect(() => assertOperationAvailable(undefined)).not.toThrow();
		expect(() => assertOperationAvailable("scaleway_fixture_get")).not.toThrow();
		expect(() => assertOperationAvailable("scaleway_fixture_unavailable")).toThrow(
			"Operation unavailable",
		);
		const routes = fixture.routes as Record<string, unknown>;
		routes.empty = [];
		const original = routes.scaleway_fixture_absent;
		const missing = routes.scaleway_fixture_missing_document;
		Reflect.deleteProperty(routes, "scaleway_fixture_absent");
		Reflect.deleteProperty(routes, "scaleway_fixture_missing_document");
		try {
			expect(() => initializeResponseSchemas()).toThrow("missing_contract");
		} finally {
			Reflect.deleteProperty(routes, "empty");
			routes.scaleway_fixture_absent = original;
			routes.scaleway_fixture_missing_document = missing;
		}
	});
	it("accepts a source-documented success status family", async () => {
		const response = json("valid", 203);
		expect(
			await validate(response, "scaleway_fixture_wildcard", "https://api.scaleway.com/wildcard"),
		).toBe(response);
	});
	it("selects the correct literal host, path, method and selector", () => {
		expect(findResponseRoute("scaleway_fixture_get", new URL(url), "get")?.area).toBe("fixture");
		for (const [operation, address, method] of [
			["missing", url, "GET"],
			["scaleway_fixture_get", url, "POST"],
			["scaleway_fixture_get", url.replace("api.scaleway.com", "apiXscalewayXcom"), "GET"],
			["scaleway_fixture_get", url.replace("/items/", "/unrelated/"), "GET"],
			["scaleway_fixture_get", url.replace("view=full", "view=other"), "GET"],
		])
			expect(findResponseRoute(operation, new URL(address), method)).toBeUndefined();
	});
	it("requires a single nonempty actual value for templated query selectors", () => {
		for (const address of [url, url.replace("view=full", "view=another")])
			expect(findResponseRoute("scaleway_fixture_dynamic", new URL(address), "GET")).toBeDefined();
		for (const address of [
			url.split("?")[0],
			url.replace("view=full", "view="),
			`${url}&view=full`,
		])
			expect(
				findResponseRoute("scaleway_fixture_dynamic", new URL(address), "GET"),
			).toBeUndefined();
	});
	it("passes a validated JSON response without consuming its body", async () => {
		const response = json({ id: "one", future: "kept" });
		expect(await validate(response)).toBe(response);
		expect(await response.json()).toEqual({ id: "one", future: "kept" });
	});
	it("normalizes JSON MIME parameters for the SDK while retaining headers", async () => {
		const original = json({ id: "one" }, 200, "Application/JSON; charset=utf-8");
		original.headers.set("x-total-count", "7");
		const response = await validate(original);
		expect(response.headers.get("content-type")).toBe("application/json");
		expect(response.headers.get("x-total-count")).toBe("7");
		expect(await response.json()).toEqual({ id: "one" });
	});
	it("accepts a documented text response and exact no-content semantics", async () => {
		const text = new Response("zone text", {
			status: 201,
			headers: { "content-type": "text/plain" },
		});
		expect(await validate(text)).toBe(text);
		for (const status of [202, 204]) {
			const empty = new Response(null, { status });
			expect(await validate(empty)).toBe(empty);
		}
		await expect(validate(new Response("unexpected", { status: 202 }))).rejects.toMatchObject({
			reason: "invalid_body",
			status: 502,
		});
	});
	it("rejects absent evidence, unknown statuses, wrong MIME and malformed bodies safely", async () => {
		for (const [response, reason] of [
			[json({ id: "one" }, 203), "unexpected_status"],
			[new Response("secret value"), "unexpected_content_type"],
			[new Response(null), "unexpected_content_type"],
			[
				new Response("secret value", { headers: { "content-type": "application/json" } }),
				"invalid_json",
			],
			[json({ id: 5, secret: "secret value" }), "invalid_schema"],
		] as const) {
			await expect(validate(response)).rejects.toMatchObject({ reason, status: 502 });
		}
		await expect(validate(json({}), "unknown")).rejects.toThrow("missing_contract");
		await expect(
			validate(json({}), "scaleway_fixture_absent", "https://api.scaleway.com/absent"),
		).rejects.toThrow("unexpected_status");
		await expect(
			validate(json({}), "scaleway_fixture_missing_document", "https://api.scaleway.com/missing"),
		).rejects.toThrow("unexpected_status");
	});
	it.each([400, 401, 403, 404, 429, 500, 503])(
		"preserves HTTP %i without leaking upstream error data",
		async (status) => {
			await expect(
				validate(json({ detail: "private upstream data" }, status)),
			).rejects.toMatchObject({
				status,
				message: `Scaleway request failed (HTTP ${status})`,
			});
		},
	);
	it("runs the S3 protocol adapter and preserves documented missing configuration", async () => {
		const buckets = new Response("<ListAllMyBucketsResult><Buckets/></ListAllMyBucketsResult>");
		expect(await validate(buckets, "scaleway_fixture_s3", "https://s3.fr-par.scw.cloud/")).toBe(
			buckets,
		);
		const absent = new Response("<Error><Code>NoSuchBucketPolicy</Code></Error>", { status: 404 });
		expect(
			await validate(absent, "scaleway_fixture_s3", "https://s3.fr-par.scw.cloud/bucket?policy"),
		).toBe(absent);
		await expect(
			validate(json({}, 403), "scaleway_fixture_s3", "https://s3.fr-par.scw.cloud/"),
		).rejects.toMatchObject({ status: 403 });
	});
	it("keeps concurrent request scopes isolated and skips direct helper calls", async () => {
		const unscoped = json({ malformed: true });
		expect(await validateSdkResponse(unscoped)).toBe(unscoped);
		expect(
			await withResponseRequest({ operation: undefined, url, method: "GET" }, () =>
				validateSdkResponse(unscoped),
			),
		).toBe(unscoped);
		const outcomes = await Promise.allSettled([
			withResponseRequest({ operation: "scaleway_fixture_get", url, method: "GET" }, async () => {
				await Promise.resolve();
				return validateSdkResponse(json({ id: "one" }));
			}),
			withResponseRequest({ operation: "missing", url, method: "GET" }, () =>
				validateSdkResponse(json({ id: "one" })),
			),
		]);
		expect(outcomes[0].status).toBe("fulfilled");
		expect(outcomes[1].status).toBe("rejected");
	});
});
