import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { deriveOperationMetadata, isReadOnly } from "../../../src/gateway/metadata.js";
import operations from "../../../src/gateway/operations.json";

describe("operation metadata generation", () => {
	it("matches the parity matrix without runtime references to tests or specs", () => {
		const matrix = JSON.parse(
			readFileSync(new URL("../../parity-matrix.json", import.meta.url), "utf8"),
		);
		expect(deriveOperationMetadata(matrix)).toEqual(operations);
		expect(deriveOperationMetadata({ ...matrix, meta: { anything: "ignored" } })).toEqual(
			operations,
		);
		expect(new Set(operations.map((r) => r.tool)).size).toBe(operations.length);
	});
	it.each([
		["GET /items", true],
		["HEAD /items", true],
		["POST /items", false],
		["PATCH /items", false],
		["PUT /items", false],
		["DELETE /items", false],
		["GET /items + PUT /item", false],
		["HEAD /bucket + GET /bucket?versioning", true],
		["GET https://api.scaleway.ai/{region}/v1/models", true],
		["OPTIONS /items", false],
		["garbage", false],
	])("classifies %s conservatively", (api, expected) =>
		expect(isReadOnly("scaleway_test_operation", api)).toBe(expected),
	);
	it("derives stable sorted records and ignores meta", () => {
		expect(
			deriveOperationMetadata({
				meta: { local: true },
				test: {
					z: { tool: "scaleway_zed_get", api: "GET /zed" },
					a: { tool: "scaleway_alpha_put", api: "PUT /alpha" },
				},
			}),
		).toEqual([
			{ tool: "scaleway_alpha_put", api: "PUT /alpha", area: "test", readOnly: false },
			{ tool: "scaleway_zed_get", api: "GET /zed", area: "test", readOnly: true },
		]);
	});
	it("overrides ephemeral secret GET access", () => {
		expect(
			isReadOnly("scaleway_secret_manager_access_secret_version", "GET /secrets/x/access"),
		).toBe(false);
		expect(
			operations.find((r) => r.tool === "scaleway_secret_manager_access_secret_version")?.readOnly,
		).toBe(false);
	});
	it("rejects malformed entries and duplicates with operation context", () => {
		const item = { tool: "scaleway_test_operation", api: "GET /items" };
		expect(() => deriveOperationMetadata({ test: { a: item, b: item } })).toThrow(
			"Duplicate operation metadata: scaleway_test_operation",
		);
		for (const invalid of [
			null,
			[],
			{ test: { a: {} } },
			{ "bad area": {} },
			{ test: { a: { ...item, api: "not an API" } } },
		]) {
			expect(() => deriveOperationMetadata(invalid)).toThrow();
		}
	});
});
