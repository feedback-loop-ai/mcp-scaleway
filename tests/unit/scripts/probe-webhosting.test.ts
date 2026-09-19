import { afterEach, describe, expect, it, vi } from "vitest";
import {
	interpretStatus,
	main,
	probeWebhosting,
	renderReport,
} from "../../../scripts/probe-webhosting-404.js";

const TOKEN = "offline-test-token";
const options = { secretKey: TOKEN };
const respond = (...statuses: number[]) =>
	vi.fn(
		async () => new Response(null, { status: statuses.shift() ?? 200 }),
	) as unknown as typeof fetch;

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("Webhosting HTTP observations", () => {
	it.each([404, 410, 401, 403, 429, 500, 502, 503, 400, 405, 422, 301, 302])(
		"does not infer route presence or absence from HTTP %s",
		(status) => {
			expect(interpretStatus(status).outcome).toBe("inconclusive");
		},
	);

	it("records a successful response without claiming published contract correctness", () => {
		expect(interpretStatus(200)).toEqual({
			outcome: "success",
			explanation:
				"Successful HTTP response observed; the published API contract remains unverified.",
		});
		expect(interpretStatus(204).outcome).toBe("success");
	});

	it("keeps candidate and published-control 404s inconclusive", async () => {
		const report = await probeWebhosting(options, respond(404, 404, 404, 404));
		const sent = report.observations.filter((row) => row.method === "GET");
		expect(sent).toHaveLength(4);
		for (const row of sent) {
			expect(row.status).toBe(404);
			expect(row.outcome).toBe("inconclusive");
			expect(row.explanation).toContain("does not establish route absence");
		}
		expect(sent[3].note).toContain("published control read");
	});

	it.each([200, 404, 403, 503])(
		"does not use control HTTP %s to reinterpret candidate errors or success",
		async (controlStatus) => {
			const report = await probeWebhosting(options, respond(404, 503, 200, controlStatus));
			expect(report.observations.slice(0, 3).map((row) => row.outcome)).toEqual([
				"inconclusive",
				"inconclusive",
				"success",
			]);
			expect(renderReport(report)).toContain("each response is reported independently");
		},
	);

	it("sends only GETs to the fixed origin and explicitly skips restore", async () => {
		const request = respond(200, 200, 404, 404);
		const report = await probeWebhosting({ ...options, region: "nl-ams" }, request);
		expect(request).toHaveBeenCalledTimes(4);
		for (const [url, init] of vi.mocked(request).mock.calls) {
			expect(String(url)).toMatch(
				/^https:\/\/api\.scaleway\.com\/webhosting\/v1\/regions\/nl-ams\//,
			);
			expect(String(url)).not.toContain("/restore");
			expect(init).toEqual({
				method: "GET",
				headers: { "X-Auth-Token": TOKEN },
				redirect: "manual",
				signal: expect.any(AbortSignal),
			});
		}
		expect(report.observations[4]).toMatchObject({
			method: "POST",
			outcome: "skipped",
			explanation: expect.stringContaining("No request sent: restore is a mutating operation"),
		});
		expect(report.observations[4].status).toBeUndefined();
	});

	it("does not follow redirects or expose their location and response data", async () => {
		const response = () =>
			new Response(`sensitive-body-${TOKEN}`, {
				status: 302,
				headers: { Location: `https://other.invalid/${TOKEN}`, "Set-Cookie": TOKEN },
			});
		const request = vi.fn(async () => response()) as unknown as typeof fetch;
		const report = await probeWebhosting(options, request);
		for (const [url, init] of vi.mocked(request).mock.calls) {
			expect(String(url)).toMatch(/^https:\/\/api\.scaleway\.com\//);
			expect(init?.redirect).toBe("manual");
		}
		expect(report.observations[0]).toMatchObject({
			status: 302,
			outcome: "inconclusive",
			explanation: "Redirect was not followed; no route conclusion.",
		});
		expect(JSON.stringify(report)).not.toContain(TOKEN);
		expect(renderReport(report)).not.toContain("other.invalid");
	});

	it("aborts each hung request after 10 seconds and continues to report every row", async () => {
		vi.useFakeTimers();
		const request = vi.fn(
			async (_url: string | URL | Request, init?: RequestInit) =>
				new Promise<Response>((_resolve, reject) => {
					init?.signal?.addEventListener("abort", () => reject(new Error(TOKEN)), { once: true });
				}),
		) as unknown as typeof fetch;
		const pending = probeWebhosting(options, request);
		await vi.advanceTimersByTimeAsync(40_000);
		const report = await pending;
		expect(request).toHaveBeenCalledTimes(4);
		for (const row of report.observations.slice(0, 4)) {
			expect(row.outcome).toBe("inconclusive");
			expect(row.explanation).toContain("timed out after 10 seconds");
			expect(row.status).toBeUndefined();
		}
		expect(vi.getTimerCount()).toBe(0);
		expect(renderReport(report)).not.toContain(TOKEN);
	});

	it("sanitizes network failures and continues after a failed request", async () => {
		const request = vi
			.fn()
			.mockRejectedValueOnce(Object.assign(new Error(TOKEN), { name: TOKEN }))
			.mockRejectedValueOnce({ detail: TOKEN })
			.mockResolvedValue(new Response(null, { status: 503 })) as unknown as typeof fetch;
		const report = await probeWebhosting(options, request);
		expect(request).toHaveBeenCalledTimes(4);
		expect(report.observations[0]).toMatchObject({
			outcome: "inconclusive",
			explanation: "Transport failure; no route conclusion. Error details omitted.",
		});
		expect(report.observations[1].status).toBeUndefined();
		expect(report.observations[2].status).toBe(503);
		expect(renderReport(report)).not.toContain(TOKEN);
	});

	it("discards response bodies without changing HTTP observations when cancellation fails", async () => {
		const cancel = vi.fn(async () => {
			throw new Error(TOKEN);
		});
		const request = vi.fn(
			async () => new Response(new ReadableStream({ cancel })),
		) as unknown as typeof fetch;
		const report = await probeWebhosting(options, request);
		expect(cancel).toHaveBeenCalledTimes(4);
		expect(report.observations[0]).toMatchObject({ status: 200, outcome: "success" });
		expect(renderReport(report)).not.toContain(TOKEN);
	});

	it.each([
		"",
		"fr-par/../../other",
		"fr-par?secret=value",
		"https://other.invalid",
		"fr-par\nsecret",
	])("rejects unsafe region configuration before sending credentials: %s", async (region) => {
		const request = respond();
		await expect(probeWebhosting({ ...options, region }, request)).rejects.toThrow(
			"region identifier",
		);
		expect(request).not.toHaveBeenCalled();
	});

	it("keeps diagnostic outcomes at exit 0 and uses the default region", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});
		const request = respond(401, 404, 429, 503);
		expect(await main({ SCW_SECRET_KEY: TOKEN }, request)).toBe(0);
		expect(String(vi.mocked(request).mock.calls[0][0])).toContain("/regions/fr-par/");
		expect(log.mock.calls[0][0]).toContain("restore POST skipped");
		expect(log.mock.calls[0][0]).not.toContain(TOKEN);
	});

	it.each([{}, { SCW_SECRET_KEY: " " }, { SCW_SECRET_KEY: TOKEN, SCW_DEFAULT_REGION: "../bad" }])(
		"exits 1 without requests for invalid or missing configuration",
		async (env) => {
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			const request = respond();
			expect(await main(env, request)).toBe(1);
			expect(request).not.toHaveBeenCalled();
			expect(error.mock.calls[0][0]).toContain("requires SCW_SECRET_KEY");
			expect(error.mock.calls[0][0]).not.toContain(TOKEN);
		},
	);
});
