import { writeFileSync } from "node:fs";
/** Every supported operation crosses the real SDK/raw HTTP boundary against independent wire contracts. */
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import Ajv from "ajv";
import { fullFormats } from "ajv-formats/dist/formats.js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { sampleInput } from "../../../scripts/sample-input.js";
import examplesJson from "../../../src/gateway/examples.json";
import { executeOperation } from "../../../src/gateway/index.js";
import {
	type Operation,
	type OperationExtra,
	createOperationRegistry,
} from "../../../src/gateway/registry.js";
import { resetClient } from "../../../src/shared/client.js";
import { findResponseRoute, validateSchema } from "../../../src/shared/response-validation.js";
import unavailable from "../../../src/shared/unavailable-operations.json";
import {
	type Schema,
	type WireOperation,
	resolveSchema,
	successFixture,
	wireCatalog,
	wireValue,
} from "../../helpers/wire-fixtures.js";

// Hoist the network replacement before SDK imports: its default HTTP client captures fetch.
const { interceptedFetch } = vi.hoisted(() => {
	const interceptedFetch = vi.fn<
		(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
	>(() => Promise.reject(new Error("HTTP fixture is not installed")));
	vi.stubGlobal("fetch", interceptedFetch);
	return { interceptedFetch };
});

const examples = examplesJson as Record<string, Record<string, unknown>>;
const registry = createOperationRegistry();
const supported = registry.operations.filter((op) => !Object.hasOwn(unavailable, op.tool));
const extra = { signal: new AbortController().signal, requestId: 1 } as OperationExtra;
const SECRET = "00000000-0000-4000-8000-000000000002";
const CANARY = "provider-private-body-must-not-escape";
type Mode = "success" | "malformed" | "wrong-shape" | 401 | 403 | 404 | 429;
let active: Operation;
let mode: Mode = "success";
let failureRequest = 1;
let seen: Request[] = [];
let errors: string[] = [];
const diagnostics: Record<string, unknown> = {};
const diagnosticAjv = new Ajv({ strict: false, logger: false, formats: fullFormats });

function resultBody(result: CallToolResult): Record<string, unknown> {
	const text = result.content.find((part) => part.type === "text");
	if (!text || text.type !== "text") throw new Error("Missing text compatibility result");
	return JSON.parse(text.text);
}

function scalar(document: string, schema: Schema, values: string[]): unknown {
	const resolved = resolveSchema(document, schema);
	if (typeof resolved === "boolean") return values[0];
	const union = resolved.oneOf ?? resolved.anyOf;
	if (Array.isArray(union)) {
		const candidates = union.map((candidate) => resolveSchema(document, candidate as Schema));
		const choice = candidates.find(
			(candidate) => typeof candidate !== "boolean" && candidate.type !== "null",
		);
		if (choice) return scalar(document, choice, values);
	}
	if (Array.isArray(resolved.type))
		return scalar(
			document,
			{ ...resolved, type: resolved.type.find((type) => type !== "null") },
			values,
		);
	if (resolved.type === "array")
		return values.map((value) => scalar(document, resolved.items as Schema, [value]));
	if (resolved.type === "integer" || resolved.type === "number")
		return /^-?(?:\d+\.?\d*|\.\d+)$/.test(values[0]) ? Number(values[0]) : values[0];
	if (resolved.type === "boolean")
		return values[0] === "true" ? true : values[0] === "false" ? false : values[0];
	return values[0];
}

async function checkRequest(
	request: Request,
	area: string,
	contract: WireOperation,
	sourcePath: string,
): Promise<void> {
	const url = new URL(request.url);
	const parameters = contract.parameters ?? [];
	const pathNames: string[] = [];
	const pathPattern = sourcePath
		.split(/(\{[^}]+\})/)
		.map((part) => {
			if (part.startsWith("{")) {
				pathNames.push(part.slice(1, -1));
				return "([^/]+)";
			}
			return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		})
		.join("");
	const matches = new RegExp(`^${pathPattern}$`).exec(url.pathname);
	for (const parameter of parameters.filter((p) => p.in === "path" || p.in === "header")) {
		const pathIndex = pathNames.indexOf(parameter.name);
		const value =
			parameter.in === "header"
				? request.headers.get(parameter.name)
				: pathIndex < 0
					? undefined
					: matches?.[pathIndex + 1];
		if (value === undefined || value === null) {
			if (parameter.required) errors.push(`Missing required ${parameter.in} ${parameter.name}`);
			continue;
		}
		try {
			validateSchema(
				area,
				parameter.schema,
				scalar(area, parameter.schema, [
					parameter.in === "path" ? decodeURIComponent(value) : value,
				]),
			);
		} catch {
			errors.push(`Invalid ${parameter.in} ${parameter.name}`);
		}
	}
	for (const parameter of parameters.filter((p) => p.in === "query")) {
		const values = url.searchParams.getAll(parameter.name);
		if (!values.length) {
			if (parameter.required) errors.push(`Missing required query ${parameter.name}`);
			continue;
		}
		try {
			validateSchema(area, parameter.schema, scalar(area, parameter.schema, values));
		} catch {
			errors.push(`Invalid query ${parameter.name}`);
		}
	}
	for (const name of new Set(url.searchParams.keys()))
		if (!parameters.some((p) => p.in === "query" && p.name === name))
			errors.push(`Undocumented query ${name}`);
	const body = await request.clone().text();
	if (contract.requestBody?.required && !body) errors.push("Missing required request body");
	if (body && contract.requestBody) {
		const contentType = request.headers.get("content-type")?.split(";")[0];
		const content = contentType ? contract.requestBody.content[contentType] : undefined;
		if (!content) errors.push("Undocumented request content type");
		else {
			try {
				validateSchema(
					area,
					content.schema,
					contentType === "application/json" ? JSON.parse(body) : body,
				);
			} catch {
				const schema = resolveSchema(area, content.schema);
				const check = diagnosticAjv.compile(
					typeof schema === "boolean"
						? schema
						: { ...schema, components: wireCatalog.documents[area].components },
				);
				check(contentType === "application/json" ? JSON.parse(body) : body);
				errors.push(`Invalid request body: ${JSON.stringify(check.errors)}`);
			}
		}
	}
}

function s3Success(request: Request): Response {
	const url = new URL(request.url);
	if (request.method === "DELETE" || (request.method === "PUT" && url.searchParams.has("policy")))
		return new Response(null, { status: 204 });
	if (request.method !== "GET")
		return new Response(null, {
			status: 200,
			headers: {
				etag: '"example-etag"',
				"content-length": "0",
				"last-modified": "Thu, 01 Jan 2026 00:00:00 GMT",
			},
		});
	if (url.searchParams.has("policy"))
		return Response.json({ Version: "2012-10-17", Statement: [] });
	const kind = url.searchParams.has("versioning")
		? "VersioningConfiguration"
		: url.searchParams.has("lifecycle")
			? "LifecycleConfiguration"
			: url.pathname === "/"
				? "ListAllMyBucketsResult"
				: "ListBucketResult";
	const middle =
		kind === "ListAllMyBucketsResult"
			? "<Buckets/>"
			: kind === "ListBucketResult"
				? "<IsTruncated>false</IsTruncated>"
				: "";
	return new Response(
		`<${kind} xmlns="http://s3.amazonaws.com/doc/2006-03-01/">${middle}</${kind}>`,
		{ headers: { "content-type": "application/xml" } },
	);
}

beforeAll(() => {
	for (const [name, value] of Object.entries({
		SCW_ACCESS_KEY: "SCWXXXXXXXXXXXXXXXXX",
		SCW_SECRET_KEY: SECRET,
		SCW_DEFAULT_PROJECT_ID: "00000000-0000-4000-8000-000000000001",
		SCW_DEFAULT_ORGANIZATION_ID: "00000000-0000-4000-8000-000000000001",
		SCW_DEFAULT_REGION: "fr-par",
		SCW_DEFAULT_ZONE: "fr-par-1",
	}))
		vi.stubEnv(name, value);
	interceptedFetch.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
		const request = input instanceof Request ? input : new Request(input, init);
		seen.push(request);
		const requestMode = seen.length === failureRequest ? mode : "success";
		const url = new URL(request.url);
		const route = findResponseRoute(active.tool, url, request.method);
		if (!route) throw new Error(`No independent route for ${active.tool}`);
		const auth = request.headers.get(
			url.host === "api.scaleway.com" ? "x-auth-token" : "authorization",
		);
		if (!auth) errors.push("Missing authentication");
		if (url.host === "api.scaleway.com" && auth !== SECRET) errors.push("Incorrect authentication");
		if (url.host === "api.scaleway.ai" && auth !== `Bearer ${SECRET}`)
			errors.push("Incorrect bearer authentication");
		if (url.host.startsWith("s3.") && !auth?.startsWith("AWS4-HMAC-SHA256 "))
			errors.push("Missing S3 signature");
		if (typeof requestMode === "number")
			return Response.json(
				{ message: CANARY },
				{ status: requestMode, headers: { "retry-after": "0" } },
			);
		if (route.area === "s3") {
			if (requestMode === "malformed")
				return new Response("<invalid>", { headers: { "content-type": "application/xml" } });
			if (requestMode === "wrong-shape") {
				if (request.method !== "GET") return new Response("unexpected-body");
				if (url.searchParams.has("policy")) return Response.json({ Statement: "invalid" });
				const fixture = await s3Success(request).text();
				const invalid = fixture
					.replace("<Buckets/>", "<Buckets><Bucket><Name/></Bucket></Buckets>")
					.replace("<IsTruncated>false</IsTruncated>", "<IsTruncated>invalid</IsTruncated>")
					.replace(
						"</VersioningConfiguration>",
						"<Status>invalid</Status></VersioningConfiguration>",
					)
					.replace(
						"</LifecycleConfiguration>",
						"<Rule><Status>invalid</Status></Rule></LifecycleConfiguration>",
					);
				return new Response(invalid, { headers: { "content-type": "application/xml" } });
			}
			return s3Success(request);
		}
		const operation =
			wireCatalog.documents[route.area].paths[route.sourcePath][route.method.toLowerCase()];
		await checkRequest(request, route.area, operation, route.sourcePath);
		const fixture = successFixture(route.area, operation);
		if (requestMode === "wrong-shape" && fixture.body !== null) {
			if (fixture.headers["content-type"] !== "application/json")
				return new Response("invalid-value", { status: fixture.status, headers: fixture.headers });
			const body = JSON.parse(fixture.body);
			// Mutate a documented property when possible, so this tests parsed data,
			// including optional fields, rather than only the JSON parser.
			const candidates: unknown[] = [];
			if (body && typeof body === "object" && !Array.isArray(body)) {
				for (const field of Object.keys(body))
					for (const value of [null, 42, "wrong-wire-type", [], {}])
						candidates.push({ ...body, [field]: value });
			}
			candidates.push(null, 42, "wrong-wire-type", [], {});
			const invalid = candidates.find((candidate) => {
				try {
					validateSchema(route.area, fixture.schema as Schema, candidate);
					return false;
				} catch {
					return true;
				}
			});
			if (invalid === undefined) throw new Error(`No invalid response fixture for ${active.tool}`);
			return Response.json(invalid, { status: fixture.status });
		}
		if (requestMode === "malformed" && fixture.body !== null)
			return new Response(
				fixture.headers["content-type"] === "application/json" ? "{invalid-json" : "invalid-value",
				{ status: fixture.status, headers: fixture.headers },
			);
		if (
			request.method === "GET" &&
			route.sourcePath === "/iam/v1alpha1/rules" &&
			active.op !== "iam_list_rules" &&
			fixture.body
		) {
			const schema = resolveSchema(route.area, fixture.schema as Schema) as Record<string, unknown>;
			const arraySchema = resolveSchema(
				route.area,
				(schema.properties as Record<string, Schema>).rules,
			) as Record<string, unknown>;
			const rule = wireValue(route.area, arraySchema.items as Schema) as Record<string, unknown>;
			rule.id = examples[active.tool].rule_id ?? "00000000-0000-4000-8000-000000000001";
			rule.account_root_user_id = null;
			rule.project_ids = ["00000000-0000-4000-8000-000000000001"];
			rule.organization_id = null;
			const body = { ...JSON.parse(fixture.body), rules: [rule], total_count: 1 };
			validateSchema(route.area, fixture.schema as Schema, body);
			return Response.json(body, { status: fixture.status });
		}
		if ((requestMode === "malformed" || requestMode === "wrong-shape") && fixture.body === null)
			return new Response("unexpected-body", {
				status: fixture.status === 204 ? 200 : fixture.status,
			});
		return new Response(fixture.body, { status: fixture.status, headers: fixture.headers });
	});
});
afterAll(() => {
	if (process.env.EVIDENCE_DIAGNOSTICS)
		writeFileSync(process.env.EVIDENCE_DIAGNOSTICS, JSON.stringify(diagnostics, null, 2));
	resetClient();
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

async function invoke(
	op: Operation,
	params: Record<string, unknown>,
	nextMode: Mode = "success",
	failedRequest = 1,
) {
	active = op;
	mode = nextMode;
	failureRequest = failedRequest;
	seen = [];
	errors = [];
	resetClient();
	return executeOperation(registry, { op: op.op, params }, extra, false);
}

describe("every operation: independent request and response contract", () => {
	for (const op of supported)
		it(op.op, async () => {
			const params = examples[op.tool];
			expect(op.schema.safeParse(params).success).toBe(true);
			const result = await invoke(op, params);
			diagnostics[op.op] = {
				errors,
				result: result.isError ? resultBody(result) : null,
				requests: await Promise.all(
					seen.map(async (request) => ({
						method: request.method,
						url: request.url,
						body: await request.clone().text(),
					})),
				),
			};
			expect(seen.length, "No HTTP request was observed").toBeGreaterThan(0);
			const expectedLegs = new Set(
				wireCatalog.routes[op.tool].map((route) =>
					JSON.stringify([route.method, route.sourcePath, route.query ?? ""]),
				),
			);
			const observedLegs = new Set(
				seen.map((request) => {
					const route = findResponseRoute(op.tool, new URL(request.url), request.method);
					if (!route) throw new Error("Observed request has no independent route");
					return JSON.stringify([route.method, route.sourcePath, route.query ?? ""]);
				}),
			);
			expect(observedLegs, "Every declared request leg must execute").toEqual(expectedLegs);
			expect(errors).toEqual([]);
			// An empty authoritative catalog correctly reports a client-side lookup miss.
			if (op.op === "generative_apis_get_model")
				expect(resultBody(result)).toMatchObject({ error: { type: "not_found" } });
			else expect(result.isError, JSON.stringify(resultBody(result))).not.toBe(true);
		});
});

describe("every operation: authentication, authorization, not-found and rate limits", () => {
	for (const op of supported)
		it(op.op, async () => {
			for (const status of [401, 403, 404, 429] as const) {
				const result = await invoke(op, examples[op.tool], status);
				expect(seen.length).toBeGreaterThan(0);
				if (wireCatalog.routes[op.tool].length > 1) expect(seen).toHaveLength(1);
				expect(result.isError).toBe(true);
				expect(resultBody(result)).toMatchObject({
					error: {
						statusCode: status,
						type:
							status === 404 ? "not_found" : status === 429 ? "rate_limited" : "permission_denied",
					},
				});
				expect(JSON.stringify(result)).not.toContain(CANARY);
			}
		});
});

describe("every applicable operation: invalid input is rejected before HTTP", () => {
	for (const op of supported)
		it(op.op, async () => {
			const params = examples[op.tool];
			let bad: Record<string, unknown> | undefined;
			for (const key of Object.keys(op.shape)) {
				const missing = { ...params };
				delete missing[key];
				if (!op.schema.safeParse(missing).success) {
					bad = missing;
					break;
				}
				const mistyped = { ...params, [key]: { invalid: true } };
				if (!op.schema.safeParse(mistyped).success) {
					bad = mistyped;
					break;
				}
			}
			if (!bad) {
				expect(Object.keys(op.shape)).toHaveLength(0);
				return;
			}
			const result = await invoke(op, bad);
			expect(seen).toHaveLength(0);
			expect(result.isError).toBe(true);
			expect(resultBody(result)).toMatchObject({ error: { type: "invalid_input" } });
		});
});

describe("unverified operation IDs: explicit local rejection without HTTP", () => {
	for (const tool of Object.keys(unavailable))
		it(tool, async () => {
			const op = registry.get(tool);
			if (!op) throw new Error("Missing compatibility identifier");
			const result = await invoke(op, examples[tool]);
			expect(seen).toHaveLength(0);
			expect(resultBody(result)).toMatchObject({
				error: { type: "unsupported_operation", statusCode: 501 },
			});
		});
});

describe("every supported operation: malformed upstream data fails safely", () => {
	for (const op of supported)
		it(op.op, async () => {
			for (const malformedMode of ["malformed", "wrong-shape"] as const) {
				const result = await invoke(op, examples[op.tool], malformedMode);
				expect(seen.length).toBeGreaterThan(0);
				if (wireCatalog.routes[op.tool].length > 1) expect(seen).toHaveLength(1);
				expect(result.isError).toBe(true);
				expect(resultBody(result)).toMatchObject({ error: { statusCode: 502 } });
				expect(JSON.stringify(result)).not.toContain(CANARY);
			}
		});
});

describe("composite operations: each later response boundary fails without partial success", () => {
	for (const op of supported.filter((operation) => wireCatalog.routes[operation.tool].length > 1)) {
		const routes = wireCatalog.routes[op.tool];
		for (let leg = 1; leg < routes.length; leg++) {
			for (const fault of [401, 403, 429, "malformed", "wrong-shape"] as const) {
				it(`${op.op}: leg ${leg + 1} ${fault}`, async () => {
					const result = await invoke(op, examples[op.tool], fault, leg + 1);
					expect(errors).toEqual([]);
					// The prior read succeeds; the failing mutation/secondary read cannot be hidden.
					expect(seen).toHaveLength(leg + 1);
					const failed = seen[leg];
					expect(findResponseRoute(op.tool, new URL(failed.url), failed.method)).toEqual(
						routes[leg],
					);
					expect(result.isError).toBe(true);
					expect(resultBody(result)).toMatchObject({
						error: {
							statusCode: typeof fault === "number" ? fault : 502,
							type:
								typeof fault !== "number"
									? "server_error"
									: fault === 429
										? "rate_limited"
										: "permission_denied",
						},
					});
					expect(JSON.stringify(result)).not.toContain(CANARY);
				});
			}
		}
	}
});

describe("every applicable operation: pagination reaches the documented query", () => {
	for (const op of supported)
		it(op.op, async () => {
			const params = { ...examples[op.tool] };
			const changed: Array<{ input: string; query: string[]; value: unknown }> = [];
			for (const [input, query, value] of [
				["page", ["page"], 2],
				["pageSize", ["page_size", "per_page"], 2],
				["page_size", ["page_size", "per_page"], 2],
				["per_page", ["per_page"], 2],
				["pageToken", ["page_token"], "next-page-example"],
				["page_token", ["page_token"], "next-page-example"],
				["continuation_token", ["continuation-token"], "next-page-example"],
				["continuationToken", ["continuation-token"], "next-page-example"],
				["max_keys", ["max-keys"], 2],
				["maxKeys", ["max-keys"], 2],
			] as const) {
				if (op.shape[input]?.safeParse(value).success) {
					params[input] = value;
					changed.push({ input, query: [...query], value });
				}
			}
			if (!changed.length) return;
			const result = await invoke(op, params);
			expect(seen.length).toBeGreaterThan(0);
			expect(errors).toEqual([]);
			for (const field of changed)
				expect(
					seen.some((request) =>
						field.query.some(
							(query) => new URL(request.url).searchParams.get(query) === String(field.value),
						),
					),
					`Pagination ${field.input} was not serialized`,
				).toBe(true);
			const body = resultBody(result);
			if (body.page !== undefined) expect(body.page).toBe(params.page ?? 1);
			if (body.pageSize !== undefined)
				expect(body.pageSize).toBe(params.pageSize ?? params.page_size ?? 50);
			expect(result.isError, JSON.stringify(body)).not.toBe(true);
		});
});

describe("each optional input: serialize a nondefault value against the independent contract", () => {
	for (const op of supported) {
		for (const [field, wrapped] of Object.entries(op.shape)) {
			if (!wrapped.isOptional() || field === "region" || field === "zone") continue;
			let schema = wrapped;
			while (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault)
				schema = schema._def.innerType;
			if (schema instanceof z.ZodNever) {
				it(`${op.op}.${field}: unsupported compatibility input`, async () => {
					const result = await invoke(op, { ...examples[op.tool], [field]: "unsupported" });
					expect(seen).toHaveLength(0);
					expect(resultBody(result)).toMatchObject({
						error: { type: "invalid_input", statusCode: 400 },
					});
				});
				continue;
			}
			let value = sampleInput(schema, field);
			let sourceDefault: unknown;
			let sourceAllowsFreeString = true;
			const snake = field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
			for (const route of wireCatalog.routes[op.tool] ?? []) {
				if (route.area === "s3") continue;
				const wire =
					wireCatalog.documents[route.area].paths[route.sourcePath][route.method.toLowerCase()];
				let source = wire.parameters?.find(
					(parameter) => parameter.name === snake || parameter.name === field,
				)?.schema;
				if (!source && wire.requestBody) {
					const bodySchema = Object.values(wire.requestBody.content)[0]?.schema;
					const body = bodySchema ? resolveSchema(route.area, bodySchema) : undefined;
					if (body && typeof body !== "boolean")
						source =
							(body.properties as Record<string, Schema> | undefined)?.[snake] ??
							(body.properties as Record<string, Schema> | undefined)?.[field];
				}
				if (source) {
					try {
						const resolved = resolveSchema(route.area, source);
						if (typeof resolved !== "boolean") {
							sourceDefault = resolved.default;
							sourceAllowsFreeString &&= !resolved.enum && !resolved.pattern && !resolved.format;
						}
						const candidate = wireValue(
							route.area,
							typeof resolved !== "boolean" && resolved.type === "array"
								? { ...resolved, minItems: Math.max(1, Number(resolved.minItems ?? 0)) }
								: source,
						);
						if (schema.safeParse(candidate).success) value = candidate;
					} catch {
						/* A constrained tool sample is validated below. */
					}
				}
			}
			const baseline = { ...examples[op.tool] };
			delete baseline[field];
			// SDKs and cron creation synthesize names; hold them stable while varying another input.
			if (field !== "name" && op.shape.name?.safeParse("contract-stable-example").success)
				baseline.name = "contract-stable-example";
			const defaultValue = wrapped.safeParse(undefined);
			const omittedValue =
				defaultValue.success && defaultValue.data !== undefined ? defaultValue.data : sourceDefault;
			const candidates =
				typeof value === "boolean"
					? [omittedValue !== true]
					: typeof value === "number"
						? [typeof omittedValue === "number" ? omittedValue + 1 : 2, 1, value]
						: typeof value === "string" && /^[\da-f]{8}-[\da-f-]{27}$/i.test(value)
							? ["00000000-0000-4000-8000-000000000003"]
							: schema instanceof z.ZodEnum
								? [...schema.options].reverse()
								: typeof value === "string" && sourceAllowsFreeString
									? ["optional-example", value]
									: schema instanceof z.ZodRecord
										? [{ example: sampleInput(schema._def.valueType, field) }, value]
										: [value];
			value =
				candidates.find(
					(candidate) => candidate !== omittedValue && schema.safeParse(candidate).success,
				) ?? value;
			const params = { ...baseline, [field]: value };
			// Upgrade selects exactly one target; removing an omitted alternative makes the fixture valid.
			if (op.op === "rabbitmq_upgrade_deployment" && field === "volume_size_bytes")
				params.node_count = undefined;
			if (!op.schema.safeParse(params).success)
				throw new Error(`Invalid optional-input fixture ${op.op}.${field}`);
			it(`${op.op}.${field}`, async () => {
				// A required one-of refinement has no valid omitted-field baseline.
				let baselineRequests: string | undefined;
				if (op.schema.safeParse(baseline).success) {
					await invoke(op, baseline);
					baselineRequests = JSON.stringify(
						await Promise.all(
							seen.map(async (request) => ({
								method: request.method,
								url: request.url,
								headers: Object.fromEntries(
									[...request.headers].filter(
										([name]) => !["authorization", "x-auth-token", "x-amz-date"].includes(name),
									),
								),
								body: await request.clone().text(),
							})),
						),
					);
				}
				const result = await invoke(op, params);
				diagnostics[`${op.op}.${field}`] = {
					errors,
					result: result.isError ? resultBody(result) : null,
					requests: await Promise.all(
						seen.map(async (request) => ({
							method: request.method,
							url: request.url,
							headers: Object.fromEntries(
								[...request.headers].filter(
									([name]) => !["authorization", "x-auth-token", "x-amz-date"].includes(name),
								),
							),
							body: await request.clone().text(),
						})),
					),
				};
				if (op.op === "containers_update_cron" && field === "containerId") {
					expect(seen).toHaveLength(0);
					expect(resultBody(result)).toMatchObject({
						error: { type: "unsupported_operation", statusCode: 501 },
					});
					return;
				}
				if (
					(op.op === "containers_create_container" || op.op === "containers_update_container") &&
					field === "httpOption" &&
					value !== "enabled"
				) {
					expect(seen).toHaveLength(0);
					expect(resultBody(result)).toMatchObject({
						error: { type: "invalid_input", statusCode: 400 },
					});
					return;
				}
				expect(seen.length).toBeGreaterThan(0);
				expect(errors).toEqual([]);
				if (baselineRequests !== undefined) {
					const requests = JSON.stringify(
						await Promise.all(
							seen.map(async (request) => ({
								method: request.method,
								url: request.url,
								headers: Object.fromEntries(
									[...request.headers].filter(
										([name]) => !["authorization", "x-auth-token", "x-amz-date"].includes(name),
									),
								),
								body: await request.clone().text(),
							})),
						),
					);
					const sameDefault =
						(schema instanceof z.ZodEnum && schema.options.length === 1) ||
						(op.op === "kafka_create_endpoint" && field === "publicNetwork") ||
						(op.op === "opensearch_create_endpoint" && field === "public") ||
						(op.op === "rabbitmq_create_endpoint" && field === "is_public");
					// A sole supported format or the default public endpoint is intentionally equivalent.
					// Its explicit wire request is still validated against the source above.
					if (!sameDefault)
						expect(
							requests,
							`Optional input ${field} did not affect the outgoing request`,
						).not.toBe(baselineRequests);
				}
				if (op.op === "generative_apis_get_model")
					expect(resultBody(result)).toMatchObject({ error: { type: "not_found" } });
				else expect(result.isError, JSON.stringify(resultBody(result))).not.toBe(true);
			});
		}
	}
});
