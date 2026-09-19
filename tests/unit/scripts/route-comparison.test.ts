import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { comparePublishedRoute } from "../../../scripts/route-comparison.js";
import matrix from "../../parity-matrix.json";

const cases = [
	{
		area: "domain-registrar",
		api: matrix["domain-registrar"].get_tld.api,
		endpoint: "GET /domain/v2beta1/tlds",
		query: "tlds={tld_name}",
		parameter: { in: "query", name: "tlds", schema: { type: "array", items: { type: "string" } } },
	},
	{
		area: "nats",
		api: matrix.nats.ListNatsCredentials.api,
		endpoint: "GET /mnq/v1beta1/regions/{region}/nats-credentials",
		query: "nats_account_id={id}",
		parameter: { in: "query", name: "nats_account_id", schema: { type: "string" } },
	},
];

describe("published route comparison", () => {
	it.each(cases)(
		"resolves the #74/#75 query-qualified $area route against its schema",
		(testCase) => {
			const baseline = JSON.parse(
				readFileSync(
					new URL(`../../../scripts/schema-baselines/${testCase.area}.json`, import.meta.url),
					"utf8",
				),
			);
			const published = new Set<string>(
				Object.entries(baseline.schema.paths).flatMap(([path, value]) =>
					Object.keys(value as object).map((method) => `${method.toUpperCase()} ${path}`),
				),
			);
			expect(published.has(testCase.api)).toBe(false);
			expect(comparePublishedRoute(testCase.api, published)).toEqual({
				endpoint: testCase.endpoint,
				query: testCase.query,
				published: true,
			});
			const path = testCase.endpoint.slice(4);
			expect(baseline.schema.paths[path].get.parameters).toContainEqual(testCase.parameter);
			expect(testCase.api).toBe(`${testCase.endpoint}?${testCase.query}`);
		},
	);

	it.each(cases)(
		"still reports a missing path or wrong method for $area",
		({ endpoint, query }) => {
			const published = new Set([endpoint]);
			for (const api of [
				`POST${endpoint.slice(3)}?${query}`,
				`${endpoint}/missing?${query}`,
				`${endpoint.toUpperCase()}?${query}`,
				`${endpoint}/?${query}`,
				`GET https://api.scaleway.com${endpoint.slice(4)}?${query}`,
				`${endpoint.replace(/v\d+beta\d+/, "v99")}?${query}`,
			]) {
				expect(comparePublishedRoute(api, published).published, api).toBe(false);
			}
		},
	);

	it("does not reinterpret path placeholders or namespace aliases", () => {
		const published = new Set(["GET /mnq/v1beta1/regions/{region}/nats-credentials"]);
		for (const api of [
			"GET /mnq/v1beta1/regions/{location}/nats-credentials?account={id}",
			"GET /messaging-and-queuing/nats/v1beta1/regions/{region}/nats-credentials?account={id}",
		]) {
			expect(comparePublishedRoute(api, published).published).toBe(false);
		}
	});

	it("preserves a query for separate review instead of treating a path match as parameter validation", () => {
		const endpoint = "GET /resources";
		const query = "unknown={value}&redirect=%2Fpath%3Fx%3D1&filter=a?b";
		expect(comparePublishedRoute(`${endpoint}?${query}`, new Set([endpoint]))).toEqual({
			endpoint,
			query,
			published: true,
		});
	});

	it("matches query-free routes without changing their identity", () => {
		const endpoint = "GET /resources/{id}";
		expect(comparePublishedRoute(endpoint, new Set([endpoint]))).toEqual({
			endpoint,
			query: undefined,
			published: true,
		});
		expect(comparePublishedRoute(endpoint, new Set()).published).toBe(false);
	});
});
