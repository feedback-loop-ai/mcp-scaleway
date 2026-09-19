/**
 * Webhosting live 404 probe — the operator's local, side-effect-free check.
 *
 * The three-way hand pass (`.forge/reports/proposals/webhosting.md`) settled
 * four shipped webhosting routes that the fetched schema's `paths:` block does
 * not publish: `…/hostings/{hosting_id}/restore`, `…/hostings/{hosting_id}/dns-records`,
 * `…/offers`, `…/control-panels`. The record's own lines flag them
 * implementation-verified pending confirmation from the published surface; the
 * schema has since been downloaded and still names none of them as paths, while
 * the schema document's own quickstart text issues `…/offers` against
 * `api.scaleway.com`. The state has three readings and this probe cannot
 * choose between them: the route moved out of the published block, the download
 * predates it, or it lives on a head the block does not show.
 *
 * So: ask the live API directly. The probe performs **existence checks with
 * deliberately non-existent ids** at each route's true verb — the question is
 * purely *"does this path exist?"*, and an absent path answers 404 while a live
 * one answers a business error code. A 401/403 means the gateway's auth layer
 * answered before routing and carries no path information; the probe says so.
 * No metered billing attaches to the calls. Run it as you run every other
 * integration check in this repo: locally, with `.env.test.local` sourced, NOT
 * in CI.
 *
 *   set -o allexport && . .env.test.local && bun scripts/probe-webhosting-404.ts
 *
 * Reads the region from `SCW_DEFAULT_REGION` (fr-par). Exit code is 0 for every
 * outcome the probe can produce; a non-zero exit means the probe itself could
 * not run (missing env), not that a route is dead. It asserts nothing — an
 * alarm, in the same spirit as `test:drift`.
 */
const BASE = "https://api.scaleway.com";
const secretKey = process.env.SCW_SECRET_KEY;
const region = process.env.SCW_DEFAULT_REGION ?? "fr-par";

if (!secretKey) {
	console.error(
		"SCW_SECRET_KEY is required — source .env.test.local first (see .env.test.local.example).",
	);
	process.exit(1);
}

// An id shaped like a real one but statistically never present: nothing is
// fetched, and an existing path still reaches its business layer.
const GHOST = "00000000-0000-4000-8000-000000000000";

type Probe = { method: "GET" | "POST"; path: string; note: string; body?: string };

const probes: Probe[] = [
	{ method: "GET", path: `/webhosting/v1/regions/${region}/offers`, note: "offers" },
	{
		method: "GET",
		path: `/webhosting/v1/regions/${region}/control-panels`,
		note: "control-panels",
	},
	{
		method: "GET",
		path: `/webhosting/v1/regions/${region}/hostings/${GHOST}/dns-records`,
		note: "hostings/{id}/dns-records",
	},
	{
		method: "POST",
		path: `/webhosting/v1/regions/${region}/hostings/${GHOST}/restore`,
		body: "{}",
		note: "hostings/{id}/restore — probed at its true verb; the ghost id makes it a not-found, it restores nothing",
	},
	{
		method: "GET",
		path: `/webhosting/v1/regions/${region}/hostings/${GHOST}`,
		note: "control read: a published path — its status is the probe's yardstick",
	},
];

const run = async (p: Probe): Promise<number> => {
	const res = await fetch(`${BASE}${p.path}`, {
		method: p.method,
		headers: {
			"X-Auth-Token": secretKey as string,
			...(p.body ? { "Content-Type": "application/json" } : {}),
		},
		...(p.body ? { body: p.body } : {}),
	});
	return res.status;
};

export {};

const lines: string[] = [];
const verdicts: string[] = [];
for (const p of probes) {
	let status = 0;
	try {
		status = await run(p);
	} catch (e) {
		verdicts.push(`could not probe: ${(e as Error).name} — the probe did not run`);
		lines.push(
			`- ${p.method} ${p.path} — probe error (${(e as Error).name}); the probe is silent on this row`,
		);
		continue;
	}
	let verdict: string;
	if (status === 401 || status === 403)
		// The gateway's auth layer answered before routing, so the status carries
		// no information about the path at all.
		verdict =
			"the gateway's auth layer answered before routing — the probe learns nothing about the path (re-run with a valid token from .env.test.local)";
	else if (status === 404)
		verdict = "the live API answers 404 — the path is not on the published surface";
	else if (status >= 200 && status < 300) verdict = "a live path, and it answered in the 2xx band";
	else
		verdict = `the live API answered ${status} — the path was reached; the business layer refused it, but it is not a 404`;
	verdicts.push(verdict);
	lines.push(`- ${p.method} ${p.path} — ${status} — ${verdict}${p.note ? ` (${p.note})` : ""}`);
}

const stamp = new Date().toISOString();
const head = [
	"# Webhosting live 404 probe",
	"",
	`ran ${stamp}; existence checks only, no metered billing; the operator runs it locally, never CI.`,
	"A non-404 on a probed row says the path exists; a 404 on the control read means the probe",
	"cannot read this environment and every row here says nothing.",
	"",
];
const out = `${[...head, ...lines, ""].join("\n")}`;
process.stdout.write(out);
console.log(
	`probe done: ${verdicts.filter((v) => v.startsWith("the live API answered")).length} row(s) reached past a business code, ` +
		`${verdicts.filter((v) => v.startsWith("the live API answers 404")).length} row(s) answered 404, ` +
		`${verdicts.filter((v) => v.startsWith("a live path")).length} live 2xx; exit 0 — a listing, not a verdict.`,
);
