import { afterEach, describe, expect, it, vi } from "vitest";
import {
	assertRouteAllowed,
	assertScwPathAllowed,
	guardedFetch,
	parseApiMatchers,
	withRouteContext,
} from "../../../src/shared/route-guard.js";

const UUID = "11111111-1111-4111-8111-111111111111";
const ok = (label: string, api: string, url: string, method: string) =>
	withRouteContext(label, api, () => assertRouteAllowed(url, method));
const blocked = (label: string, api: string, url: string, method: string) =>
	expect(() => ok(label, api, url, method)).toThrow("endpoint confinement");

afterEach(() => vi.unstubAllGlobals());

describe("parseApiMatchers", () => {
	it("compiles single, composite, annotated and absolute declarations", () => {
		expect(parseApiMatchers("x", "GET /a/{id} (note)")).toHaveLength(1);
		expect(parseApiMatchers("x", "HEAD /{bucket} + GET /{bucket}?versioning")).toHaveLength(2);
		expect(
			parseApiMatchers("x", "GET https://api.scaleway.ai/{region}/v1/models")[0].host.test(
				"api.scaleway.ai",
			),
		).toBe(true);
		expect(parseApiMatchers("scaleway_iam_update_rule", "PUT /iam/v1alpha1/rules")).toHaveLength(2);
		// Relative S3 legs (composite get_bucket_info) default to the regional S3 host.
		const [head] = parseApiMatchers("scaleway_object_storage_get_bucket_info", "HEAD /{bucket}");
		expect(head.host.test("s3.fr-par.scw.cloud")).toBe(true);
		expect(head.host.test("api.scaleway.com")).toBe(false);
	});
	it("fails closed on malformed metadata", () => {
		expect(() => parseApiMatchers("x", "FETCH /a")).toThrow("Invalid endpoint metadata");
		expect(() => parseApiMatchers("x", "GET relative/path")).toThrow("Invalid endpoint metadata");
	});
});

describe("assertRouteAllowed", () => {
	const api = "GET /rdb/v1/regions/{region}/instances/{instance_id}";
	it("is a no-op outside any operation context", () => {
		expect(() => assertRouteAllowed("https://evil.example/anything", "DELETE")).not.toThrow();
		expect(() => assertScwPathAllowed("/../secret", "GET")).not.toThrow();
	});
	it("accepts the declared endpoint and its trailing query", () => {
		ok(
			"rdb",
			api,
			`https://api.scaleway.com/rdb/v1/regions/fr-par/instances/${UUID}?page=1`,
			"get",
		);
		ok(
			"rdb",
			api,
			`https://api.scaleway.com/rdb/v1/regions/fr-par/instances/${encodeURIComponent("a b")}`,
			"GET",
		);
	});
	it("rejects wrong method, host, scheme, credentials, fragment, and structure", () => {
		const url = `https://api.scaleway.com/rdb/v1/regions/fr-par/instances/${UUID}`;
		blocked("rdb", api, url, "DELETE");
		blocked("rdb", api, url.replace("api.scaleway.com", "api.scaleway.com.evil"), "GET");
		blocked("rdb", api, url.replace("https:", "http:"), "GET");
		blocked("rdb", api, url.replace("https://", "https://u:p@"), "GET");
		blocked("rdb", api, `${url}#frag`, "GET");
		blocked("rdb", api, `${url}/extra`, "GET");
		blocked("rdb", api, "https://api.scaleway.com/rdb/v1/regions/fr-par/instances", "GET");
	});
	it("rejects raw traversal, encoded traversal, separators, controls and empty segments", () => {
		const base = "https://api.scaleway.com/rdb/v1/regions/fr-par/instances/";
		for (const bad of [
			"..",
			".",
			"%2e%2e",
			"%2E",
			"a%2fb",
			"a%5cb",
			"a\\b",
			"a b",
			"a\tb",
			"a%00b",
			"a%ZZ",
			"a%23b",
		]) {
			blocked("rdb", api, `${base}${bad}`, "GET");
		}
		// A decoded literal '%' cannot change routing, so it stays allowed.
		ok("rdb", api, `${base}a%25b`, "GET");
		blocked("rdb", api, `${base}${UUID}/../..`, "GET");
	});
	it("enforces declared query values exactly once", () => {
		const s3 = "GET https://s3.{region}.scw.cloud/{bucket}?versioning";
		ok(
			"scaleway_object_storage_get_bucket_versioning",
			s3,
			"https://s3.fr-par.scw.cloud/mine?versioning",
			"GET",
		);
		blocked(
			"scaleway_object_storage_get_bucket_versioning",
			s3,
			"https://s3.fr-par.scw.cloud/mine",
			"GET",
		);
		blocked(
			"scaleway_object_storage_get_bucket_versioning",
			s3,
			"https://s3.fr-par.scw.cloud/mine?versioning=x",
			"GET",
		);
		blocked(
			"scaleway_object_storage_get_bucket_versioning",
			s3,
			"https://s3.fr-par.scw.cloud/mine?versioning&versioning",
			"GET",
		);
		blocked(
			"scaleway_object_storage_get_bucket_versioning",
			s3,
			"https://s3.fr-par.scw.cloud/mine?versioning&policy",
			"GET",
		);
	});
	it("allows encoded object keys with slashes but not dot-segment keys", () => {
		const s3 = "HEAD https://s3.{region}.scw.cloud/{bucket}/{key}";
		ok(
			"scaleway_object_storage_get_object_info",
			s3,
			`https://s3.fr-par.scw.cloud/mine/${encodeURIComponent("dir/file.txt")}`,
			"HEAD",
		);
		ok(
			"scaleway_object_storage_get_object_info",
			s3,
			"https://s3.fr-par.scw.cloud/mine/a%25b",
			"HEAD",
		);
		// list-type selects ListObjectsV2, a different declared operation on the same path.
		blocked(
			"scaleway_object_storage_get_object_info",
			s3,
			"https://s3.fr-par.scw.cloud/mine/a%25b?list-type=2",
			"HEAD",
		);
		blocked(
			"scaleway_object_storage_get_object_info",
			s3,
			"https://s3.fr-par.scw.cloud/mine/%2e%2e",
			"HEAD",
		);
		blocked(
			"scaleway_object_storage_get_object_info",
			s3,
			"https://s3.fr-par.scw.cloud/mine/dir/file.txt",
			"HEAD",
		);
	});
	it("accepts any leg of a composite operation", () => {
		const composite = "GET /iam/v1alpha1/rules + PUT /iam/v1alpha1/rules";
		ok(
			"scaleway_iam_update_rule",
			composite,
			"https://api.scaleway.com/iam/v1alpha1/rules?policy_id=x",
			"GET",
		);
		ok("scaleway_iam_update_rule", composite, "https://api.scaleway.com/iam/v1alpha1/rules", "PUT");
		blocked(
			"scaleway_iam_update_rule",
			composite,
			"https://api.scaleway.com/iam/v1alpha1/rules",
			"DELETE",
		);
	});
});

describe("guardedFetch", () => {
	const api = "GET https://api.scaleway.ai/{region}/v1/models";
	it("forwards string, URL and Request inputs unchanged when allowed", async () => {
		const spy = vi.fn(async (..._args: Parameters<typeof fetch>) => new Response("{}"));
		vi.stubGlobal("fetch", spy);
		await withRouteContext("gen", api, async () => {
			await guardedFetch("https://api.scaleway.ai/fr-par/v1/models", { method: "GET" });
			await guardedFetch(new URL("https://api.scaleway.ai/fr-par/v1/models"));
			await guardedFetch(new Request("https://api.scaleway.ai/fr-par/v1/models"));
		});
		expect(spy).toHaveBeenCalledTimes(3);
		expect(spy.mock.calls[0][1]).toEqual({ method: "GET" });
	});
	it("blocks before calling fetch", async () => {
		const spy = vi.fn();
		vi.stubGlobal("fetch", spy);
		await expect(
			withRouteContext("gen", api, () =>
				guardedFetch("https://api.scaleway.ai/fr-par/v1/models", { method: "POST" }),
			),
		).rejects.toThrow("endpoint confinement");
		expect(spy).not.toHaveBeenCalled();
	});
});
