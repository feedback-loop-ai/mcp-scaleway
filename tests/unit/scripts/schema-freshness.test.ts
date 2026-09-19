import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { SourcesSchema, checkSchemas, main, renderReport } from "../../../scripts/fetch-schemas.js";
import { diffSchemas, semanticSchema } from "../../../scripts/schema-diff.js";

const schema = (extra: Record<string, unknown> = {}) =>
	JSON.stringify({
		openapi: "3.0.3",
		paths: { "/resources": { get: { responses: { "200": { description: "Success" } } } } },
		...extra,
	});
const hash = (text: string) => createHash("sha256").update(text).digest("hex");
const url = "https://www.scaleway.com/en/developers/api/example/v1/schema.yml";
const source = (body: string) => ({ example: { url, sha256: hash(body) } });
const baseline = (body: string) => ({
	example: { sha256: hash(body), schema: semanticSchema(body) },
});
const fetchResponse = (body: string, status = 200) =>
	vi.fn(async () => new Response(body, { status })) as unknown as typeof fetch;

describe("public schema freshness", () => {
	it("writes review artifacts and fails the CLI for fetch failures, while changes remain alarms", async () => {
		const directory = await mkdtemp(join(tmpdir(), "scaleway-schema-check-"));
		vi.spyOn(console, "log").mockImplementation(() => {});
		try {
			vi.stubGlobal("fetch", fetchResponse("unavailable", 503));
			expect(await main(["--output", directory])).toBe(1);
			const report = JSON.parse(await readFile(join(directory, "report.json"), "utf8"));
			expect(report.summary.failed).toBe(report.checks.length);
			expect(await readFile(join(directory, "report.md"), "utf8")).toContain("Failure: HTTP 503");
			vi.stubGlobal("fetch", fetchResponse(schema()));
			expect(await main(["--output", directory])).toBe(0);
			const alarm = JSON.parse(await readFile(join(directory, "report.json"), "utf8"));
			expect(alarm.summary.changed).toBe(alarm.checks.length);
			await expect(main(["--unknown"])).rejects.toThrow("Usage:");
		} finally {
			vi.unstubAllGlobals();
			vi.restoreAllMocks();
			await rm(directory, { recursive: true, force: true });
		}
	});
	it("compares successful fetches without the former response-scope crash", async () => {
		const body = schema();
		const request = fetchResponse(body);
		const report = await checkSchemas(source(body), baseline(body), request);
		expect(report.summary).toEqual({ unchanged: 1, changed: 0, failed: 0 });
		expect(report.checks[0].diff).toEqual({
			addedEndpoints: [],
			removedEndpoints: [],
			changedFields: [],
		});
		expect(request).toHaveBeenCalledWith(
			url,
			expect.objectContaining({ redirect: "error", signal: expect.any(AbortSignal) }),
		);
	});
	it("reports changed endpoints and request constraints while preserving accepted evidence", async () => {
		const before = schema();
		const after = schema({
			paths: { "/resources/{id}": { post: { requestBody: { required: true } } } },
		});
		const sources = source(before);
		const accepted = baseline(before);
		const snapshot = JSON.stringify({ sources, accepted });
		const report = await checkSchemas(sources, accepted, fetchResponse(after));
		expect(report.summary).toEqual({ unchanged: 0, changed: 1, failed: 0 });
		expect(report.checks[0].diff).toMatchObject({
			addedEndpoints: ["POST /resources/{id}"],
			removedEndpoints: ["GET /resources"],
		});
		expect(JSON.stringify({ sources, accepted })).toBe(snapshot);
		expect(renderReport(report)).toContain("POST /resources/{id}");
	});
	it.each([404, 429, 503])("makes HTTP %s an observable checker failure", async (status) => {
		const report = await checkSchemas(source(schema()), {}, fetchResponse("failure", status));
		expect(report.summary.failed).toBe(1);
		expect(report.checks[0].error).toBe(`HTTP ${status}`);
	});
	it("reports transport errors and invalid documents instead of fresh comparisons", async () => {
		const request = vi.fn(async () => {
			throw new Error("timeout");
		}) as unknown as typeof fetch;
		expect((await checkSchemas(source(schema()), {}, request)).checks[0].error).toBe("timeout");
		const invalid = await checkSchemas(
			source(schema()),
			{},
			fetchResponse("<html>not a schema</html>"),
		);
		expect(invalid.summary.failed).toBe(1);
		expect(invalid.checks[0].error).toContain("not an OpenAPI document");
	});
	it("does not compare against a baseline from a different upstream digest", async () => {
		const body = schema();
		const report = await checkSchemas(
			source(body),
			baseline(schema({ info: { title: "other bytes" } })),
			fetchResponse(body),
		);
		expect(report.checks[0].diff).toBeUndefined();
		expect(report.checks[0].note).toContain("No semantic baseline matching");
	});
	it("rejects missing sources and private/nonofficial URLs before any request", async () => {
		const request = fetchResponse(schema());
		expect(() => SourcesSchema.parse({})).toThrow("No schema sources");
		await expect(
			checkSchemas(
				{ example: { url: "https://api.scaleway.com/private", sha256: hash("") } },
				{},
				request,
			),
		).rejects.toThrow();
		expect(request).not.toHaveBeenCalled();
	});
	it("ships semantic baselines corresponding to every recorded schema digest", () => {
		const matrix = JSON.parse(
			readFileSync(new URL("../../parity-matrix.json", import.meta.url), "utf8"),
		);
		for (const [area, entry] of Object.entries(SourcesSchema.parse(matrix.meta.schemaFiles))) {
			const accepted = JSON.parse(
				readFileSync(
					new URL(`../../../scripts/schema-baselines/${area}.json`, import.meta.url),
					"utf8",
				),
			);
			expect(accepted.sha256, area).toBe(entry.sha256);
			expect(Object.keys(accepted.schema.paths).length, area).toBeGreaterThan(0);
		}
	});
});

describe("semantic schema diff", () => {
	it.each(["default", "enum", "const"])("preserves arbitrary object literals in %s", (keyword) => {
		const document = (description: string) => {
			const value = {
				description,
				"x-data": { summary: "literal meaning", examples: ["literal"] },
			};
			return semanticSchema(
				schema({
					components: {
						schemas: {
							Resource: {
								type: "object",
								[keyword]: keyword === "enum" ? [value] : value,
							},
						},
					},
				}),
			);
		};
		const before = document("old value");
		const after = document("new value");
		expect(JSON.stringify(before)).toContain("literal meaning");
		expect(JSON.stringify(before)).toContain('"examples":["literal"]');
		expect(diffSchemas(before, after).changedFields).toHaveLength(1);
		expect(JSON.stringify(diffSchemas(before, after))).toContain("old value");
		expect(JSON.stringify(diffSchemas(before, after))).toContain("new value");
	});
	it("reports OpenAPI server origin changes", () => {
		const document = (url: string) => semanticSchema(schema({ servers: [{ url }] }));
		expect(
			diffSchemas(document("https://old.example/v1"), document("https://new.example/v2"))
				.changedFields,
		).toEqual([
			{
				path: "/servers",
				before: [{ url: "https://old.example/v1" }],
				after: [{ url: "https://new.example/v2" }],
			},
		]);
	});
	it("reports Swagger origin, scheme and base path changes", () => {
		const document = (host: string, basePath: string, schemes: string[]) =>
			semanticSchema(JSON.stringify({ swagger: "2.0", paths: {}, host, basePath, schemes }));
		expect(
			diffSchemas(
				document("old.example", "/v1", ["http"]),
				document("new.example", "/v2", ["https"]),
			).changedFields,
		).toEqual([
			{ path: "/basePath", before: "/v1", after: "/v2" },
			{ path: "/host", before: "old.example", after: "new.example" },
			{ path: "/schemes", before: ["http"], after: ["https"] },
		]);
	});
	it("omits prose but preserves similarly named fields, requirements and enum changes", () => {
		const object = (values: string[]) => ({
			type: "object",
			description: "prose",
			required: ["description"],
			properties: { description: { type: "string", enum: values }, "x-state": { type: "string" } },
		});
		const before = semanticSchema(
			schema({ components: { schemas: { Resource: object(["one"]) } } }),
		);
		const after = semanticSchema(
			schema({ components: { schemas: { Resource: object(["one", "two"]) } } }),
		);
		const diff = diffSchemas(before, after);
		expect(diff.changedFields).toEqual([
			{
				path: "/components/schemas/Resource/properties/description/enum",
				before: ["one"],
				after: ["one", "two"],
			},
		]);
		expect(JSON.stringify(before)).toContain("x-state");
		expect(JSON.stringify(before)).not.toContain("prose");
	});
	it("ignores documentation-only differences and detects inline required-field changes", () => {
		const document = (required: boolean, prose: string) =>
			semanticSchema(
				schema({
					paths: { "/a~b/c": { post: { description: prose, requestBody: { required } } } },
				}),
			);
		expect(diffSchemas(document(false, "old"), document(false, "new")).changedFields).toEqual([]);
		expect(diffSchemas(document(false, "old"), document(true, "new")).changedFields).toEqual([
			{ path: "/paths/~1a~0b~1c/post/requestBody/required", before: false, after: true },
		]);
	});
});
