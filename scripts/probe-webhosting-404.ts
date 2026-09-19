/**
 * Local Webhosting HTTP diagnostic. Run explicitly with Scaleway credentials:
 *
 *   set -o allexport && . .env.test.local && bun scripts/probe-webhosting-404.ts
 *
 * Sends GET requests only, with a 10-second timeout and redirects disabled.
 * A placeholder resource ID does not establish that a mutating request is safe,
 * so the restore POST is reported as skipped. HTTP responses are observations,
 * not proof that an endpoint exists or matches a published contract. In
 * particular, 404/410 cannot distinguish an unknown route from a missing or
 * inaccessible resource. The published control read is subject to the same
 * ambiguity and never changes the interpretation of another row.
 *
 * Reads SCW_SECRET_KEY and optional SCW_DEFAULT_REGION (default fr-par).
 * Diagnostic outcomes exit 0; invalid/missing configuration exits 1.
 */
const BASE = "https://api.scaleway.com";
const PLACEHOLDER_ID = "00000000-0000-4000-8000-000000000000";
const TIMEOUT_MS = 10_000;

type Interpretation = {
	outcome: "success" | "inconclusive" | "skipped";
	explanation: string;
};

export type Observation = Interpretation & {
	method: "GET" | "POST";
	path: string;
	note: string;
	status?: number;
};

export type ProbeReport = { checkedAt: string; observations: Observation[] };

export function interpretStatus(status: number): Interpretation {
	if (status >= 200 && status < 300)
		return {
			outcome: "success",
			explanation:
				"Successful HTTP response observed; the published API contract remains unverified.",
		};
	if (status === 404 || status === 410)
		return {
			outcome: "inconclusive",
			explanation:
				"Cannot distinguish an unknown route from a missing or inaccessible resource; does not establish route absence.",
		};
	if (status === 401 || status === 403)
		return {
			outcome: "inconclusive",
			explanation: "Authentication or authorization refusal; no route conclusion.",
		};
	if (status === 429)
		return { outcome: "inconclusive", explanation: "Rate limit response; no route conclusion." };
	if (status >= 300 && status < 400)
		return {
			outcome: "inconclusive",
			explanation: "Redirect was not followed; no route conclusion.",
		};
	if (status >= 500)
		return {
			outcome: "inconclusive",
			explanation: "Server or gateway error; no route conclusion.",
		};
	return {
		outcome: "inconclusive",
		explanation: "HTTP error does not establish whether the requested route exists.",
	};
}

/** Injected fetch keeps the diagnostic testable without cloud requests. */
export async function probeWebhosting(
	options: { secretKey: string; region?: string },
	request: typeof fetch = fetch,
): Promise<ProbeReport> {
	if (!options.secretKey.trim()) throw new Error("SCW_SECRET_KEY is required.");
	const region = options.region ?? "fr-par";
	if (!/^[a-z]{2}-[a-z0-9]+$/.test(region))
		throw new Error("SCW_DEFAULT_REGION must be a region identifier such as fr-par.");
	const prefix = `/webhosting/v1/regions/${region}`;
	const probes = [
		{ path: `${prefix}/offers`, note: "offers" },
		{ path: `${prefix}/control-panels`, note: "control-panels" },
		{
			path: `${prefix}/hostings/${PLACEHOLDER_ID}/dns-records`,
			note: "hostings/{id}/dns-records: placeholder resource ID",
		},
		{
			path: `${prefix}/hostings/${PLACEHOLDER_ID}`,
			note: "published control read: placeholder resource ID; not a route-existence yardstick",
		},
	];
	const observations: Observation[] = [];
	for (const probe of probes) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
		try {
			const response = await request(`${BASE}${probe.path}`, {
				method: "GET",
				headers: { "X-Auth-Token": options.secretKey },
				redirect: "manual",
				signal: controller.signal,
			});
			observations.push({
				...probe,
				method: "GET",
				status: response.status,
				...interpretStatus(response.status),
			});
			// Discard bodies rather than printing resource data or upstream error details.
			await response.body?.cancel().catch(() => {});
		} catch {
			observations.push({
				...probe,
				method: "GET",
				outcome: "inconclusive",
				explanation: controller.signal.aborted
					? "Request timed out after 10 seconds; no route conclusion."
					: "Transport failure; no route conclusion. Error details omitted.",
			});
		} finally {
			clearTimeout(timeout);
		}
	}
	observations.push({
		method: "POST",
		path: `${prefix}/hostings/${PLACEHOLDER_ID}/restore`,
		note: "hostings/{id}/restore",
		outcome: "skipped",
		explanation:
			"No request sent: restore is a mutating operation, and a placeholder ID does not establish that calling it is safe.",
	});
	return { checkedAt: new Date().toISOString(), observations };
}

export function renderReport(report: ProbeReport): string {
	return `${[
		"# Webhosting HTTP diagnostic",
		"",
		`Checked ${report.checkedAt}; GET requests only; restore POST skipped.`,
		"HTTP responses are observations, not proof of route existence or published contract correctness.",
		"A failed control read does not determine candidate results; each response is reported independently.",
		"Response bodies, headers, credentials, and transport error details are omitted.",
		"",
		...report.observations.map(
			(row) =>
				`- ${row.method} ${row.path} — ${row.status ?? "no HTTP response"} — ${row.outcome}: ${row.explanation} (${row.note})`,
		),
		"",
		"Diagnostic complete; exit 0 reports observations, not a compatibility verdict.",
		"",
	].join("\n")}`;
}

export async function main(
	env: NodeJS.ProcessEnv = process.env,
	request: typeof fetch = fetch,
): Promise<number> {
	try {
		const report = await probeWebhosting(
			{ secretKey: env.SCW_SECRET_KEY ?? "", region: env.SCW_DEFAULT_REGION },
			request,
		);
		console.log(renderReport(report));
		return 0;
	} catch {
		console.error(
			"Webhosting diagnostic requires SCW_SECRET_KEY and a valid SCW_DEFAULT_REGION (default fr-par). Source .env.test.local before running it.",
		);
		return 1;
	}
}

if (import.meta.main) process.exitCode = await main();
