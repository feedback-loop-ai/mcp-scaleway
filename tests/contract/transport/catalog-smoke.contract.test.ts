/**
 * Whole-catalog HTTP-boundary smoke (Constitution VIII, feature 060 SC-001).
 * Every registered operation is invoked once with synthesized valid input against the REAL
 * SDK client (createAdvancedClient + injected recording HTTP) and a fail-closed global fetch.
 * Asserts: request reached an allowed host, path has exactly one leading slash and no
 * traversal, and an authentication header is present. Endpoints are taken from
 * tests/parity-matrix.json; no request leaves the process.
 */
import { readFileSync } from "node:fs";
import type { McpServer, ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAdvancedClient, withHTTPClient, withProfile } from "@scaleway/sdk-client";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { registerAllTools } from "../../../src/tools/index.js";

const UUID = "11111111-1111-4111-8111-111111111111";
const DUMMY_SECRET = "00000000-0000-4000-8000-000000000000";

const { http, getClient } = vi.hoisted(() => ({
	http: vi.fn<(input: Request) => Promise<Response>>(),
	getClient: vi.fn(),
}));
vi.mock("../../../src/shared/client.js", () => ({ createScalewayClient: getClient }));
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "00000000-0000-4000-8000-000000000000",
		defaultProjectId: "11111111-1111-4111-8111-111111111111",
		defaultOrganizationId: "11111111-1111-4111-8111-111111111111",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

type Rec = { shape: z.ZodRawShape; callback: ToolCallback<z.ZodRawShape> };
const records = new Map<string, Rec>();
registerAllTools({
	tool(name: string, _d: string, shape: z.ZodRawShape, callback: ToolCallback<z.ZodRawShape>) {
		records.set(name, { shape, callback });
	},
} as unknown as McpServer);

const matrix = JSON.parse(
	readFileSync(new URL("../../parity-matrix.json", import.meta.url), "utf8"),
);
const declared = new Map<string, string>();
for (const [area, ops] of Object.entries<Record<string, { tool: string; api: string }>>(matrix)) {
	if (area === "meta") continue;
	for (const entry of Object.values(ops)) declared.set(entry.tool, entry.api);
}

const ALLOWED_HOST = /^(api\.scaleway\.com|s3\.[a-z0-9-]+\.scw\.cloud|api\.scaleway\.ai)$/;

// Minimal, deterministic input synthesis from the Zod raw shape: required fields only,
// plus region/zone when present so defaults do not have to be relied upon.
function unwrap(schema: z.ZodTypeAny): z.ZodTypeAny {
	let s = schema;
	for (;;) {
		const d = s._def as { typeName?: string; innerType?: z.ZodTypeAny; schema?: z.ZodTypeAny };
		if (d.typeName === "ZodOptional" || d.typeName === "ZodNullable" || d.typeName === "ZodDefault")
			s = d.innerType as z.ZodTypeAny;
		else if (d.typeName === "ZodEffects") s = d.schema as z.ZodTypeAny;
		else return s;
	}
}
function synth(schema: z.ZodTypeAny, key: string, depth = 0): unknown {
	const s = unwrap(schema);
	const d = s._def as Record<string, unknown> & { typeName: string };
	const lk = key.toLowerCase();
	switch (d.typeName) {
		case "ZodString": {
			const checks = (d.checks as Array<{ kind: string; regex?: RegExp }>) ?? [];
			if (checks.some((c) => c.kind === "uuid")) return UUID;
			if (checks.some((c) => c.kind === "datetime")) return "2026-01-01T00:00:00Z";
			if (lk === "zone" || lk.endsWith("_zone")) return "fr-par-1";
			if (lk === "region" || lk.endsWith("_region")) return "fr-par";
			for (const c of checks) {
				if (c.kind === "regex" && c.regex) {
					const src = c.regex.source;
					if (src.includes("[0-9]+$") || src.includes("-[0-9]")) return "fr-par-1";
					if (src.includes("[a-z]{2}-[a-z]{3}")) return "fr-par";
					if (src.includes("latest")) return "1";
				}
			}
			if (lk.includes("email")) return "user@example.com";
			if (lk.includes("domain") || lk.includes("hostname")) return "example.com";
			if (lk.includes("cidr") || lk === "ip" || lk.endsWith("_ip")) return "192.0.2.0/24";
			if (lk === "revision") return "1";
			return "example";
		}
		case "ZodNumber": {
			const checks = (d.checks as Array<{ kind: string; value?: number }>) ?? [];
			const min = checks.find((c) => c.kind === "min")?.value;
			return typeof min === "number" && min > 1 ? min : 1;
		}
		case "ZodBoolean":
			return false;
		case "ZodEnum":
			return (d.values as string[])[0];
		case "ZodNativeEnum":
			return Object.values(d.values as Record<string, string>)[0];
		case "ZodLiteral":
			return d.value;
		case "ZodArray": {
			const min = (d.minLength as { value: number } | null)?.value ?? 0;
			return min > 0 ? [synth(d.type as z.ZodTypeAny, key, depth + 1)] : [];
		}
		case "ZodObject": {
			if (depth > 4) return {};
			const shape = (d.shape as () => z.ZodRawShape)();
			const out: Record<string, unknown> = {};
			for (const [k, v] of Object.entries(shape))
				if (!v.isOptional()) out[k] = synth(v, k, depth + 1);
			return out;
		}
		case "ZodRecord":
			return {};
		case "ZodUnion":
		case "ZodDiscriminatedUnion": {
			const options = d.options as z.ZodTypeAny[];
			for (const option of options) {
				const candidate = synth(option, key, depth + 1);
				if (option.safeParse(candidate).success) return candidate;
			}
			return synth(options[0], key, depth + 1);
		}
		default:
			return "example";
	}
}
function inputFor(shape: z.ZodRawShape): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [k, v] of Object.entries(shape)) {
		if (!v.isOptional() || k === "region" || k === "zone") out[k] = synth(v, k);
	}
	return out;
}

const seen: Request[] = [];
beforeAll(() => {
	vi.stubGlobal(
		"fetch",
		vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
			// Raw-fetch areas (object storage, generative APIs, IoT) bypass the SDK client.
			const request = input instanceof Request ? input : new Request(input, init);
			seen.push(request);
			return Promise.resolve(
				new Response("<ListAllMyBucketsResult></ListAllMyBucketsResult>", {
					status: 200,
					headers: { "content-type": "application/xml" },
				}),
			);
		}),
	);
	http.mockImplementation(async (request) => {
		seen.push(request);
		const generic = { id: UUID, name: "example", status: "ready", total_count: 0 };
		for (const k of [
			"servers",
			"volumes",
			"instances",
			"clusters",
			"databases",
			"users",
			"keys",
			"secrets",
			"projects",
			"images",
			"domains",
			"records",
			"zones",
			"policies",
			"rules",
			"groups",
			"events",
			"products",
			"items",
			"templates",
			"hubs",
			"devices",
			"routes",
			"networks",
			"deployments",
			"endpoints",
			"pipelines",
			"stages",
			"backups",
			"snapshots",
			"flexible_ips",
			"nats_accounts",
			"credentials",
			"sqs_credentials",
			"sns_credentials",
			"invoices",
			"consumptions",
			"discounts",
			"offers",
			"os",
			"ips",
			"gateways",
			"pat_rules",
			"private_networks",
			"vpcs",
			"lbs",
			"frontends",
			"backends",
			"certificates",
			"hostings",
			"emails",
			"webhooks",
			"mailboxes",
			"aliases",
			"jobs",
			"job_definitions",
			"job_runs",
			"runs",
			"definitions",
			"filesystems",
			"attachments",
			"connections",
			"links",
			"pops",
			"partners",
			"models",
			"node_types",
			"versions",
			"categories",
			"local_images",
			"tags",
			"namespaces",
			"containers",
			"functions",
			"crons",
			"triggers",
			"tokens",
			"data_sources",
			"contact_points",
			"grafana_users",
			"alerts",
			"logs",
			"export_jobs",
			"acl_rules",
			"cluster_versions",
			"presets",
			"notebook_versions",
			"dedicated_connections",
			"routing_policies",
			"customer_gateways",
			"gateway_types",
			"impact_data",
			"charges",
			"tlds",
			"contacts",
			"nameservers",
			"usage",
			"dhcps",
			"instance_groups",
		])
			(generic as Record<string, unknown>)[k] = [];
		return new Response(JSON.stringify(generic), {
			status: 200,
			headers: { "content-type": "application/json" },
		});
	});
	getClient.mockReturnValue(
		createAdvancedClient(
			withProfile({
				accessKey: "SCWXXXXXXXXXXXXXXXXX",
				secretKey: DUMMY_SECRET,
				defaultProjectId: UUID,
				defaultOrganizationId: UUID,
				defaultRegion: "fr-par",
				defaultZone: "fr-par-1",
			}),
			withHTTPClient(http as unknown as typeof fetch),
		),
	);
});
afterAll(() => vi.unstubAllGlobals());

describe("every registered operation constructs a well-formed authenticated request", () => {
	it("registers exactly the operations declared in the parity matrix", () => {
		expect([...records.keys()].sort()).toEqual([...declared.keys()].sort());
	});

	// One case per product area (not per operation): identical assertions, far less runner
	// overhead, and a failure message that names every offending operation in the area.
	const byArea = new Map<string, string[]>();
	for (const [area, ops] of Object.entries<Record<string, { tool: string }>>(matrix)) {
		if (area === "meta") continue;
		byArea.set(
			area,
			Object.values(ops)
				.map((e) => e.tool)
				.sort(),
		);
	}

	async function exercise(name: string): Promise<string | null> {
		const record = records.get(name) as Rec;
		const input = inputFor(record.shape);
		let parsed = z.object(record.shape).safeParse(input);
		if (!parsed.success) {
			// Object-level refinements (e.g. "exactly one of A|B") are invisible in the raw shape;
			// retry once with the first optional field the schema mentions in its issues.
			const hint = parsed.error.issues.flatMap((i) => i.path).find((p) => typeof p === "string");
			const candidates = Object.entries(record.shape).filter(
				([k, v]) => v.isOptional() && !(k in input),
			);
			const pick = candidates.find(([k]) => k === hint) ?? candidates[0];
			if (pick)
				parsed = z.object(record.shape).safeParse({ ...input, [pick[0]]: synth(pick[1], pick[0]) });
		}
		if (!parsed.success)
			return `${name}: synthesized input rejected (${parsed.error.issues.map((i) => i.path.join(".")).join(", ")})`;
		const before = seen.length;
		const extra = {} as Parameters<typeof record.callback>[1];
		try {
			await record.callback(parsed.data, extra);
		} catch (error) {
			// Some callbacks re-parse with a refinement the raw shape cannot express; retry once
			// with the first unused optional field. A second failure is a real defect.
			if (!(error instanceof z.ZodError)) return `${name}: threw ${String(error)}`;
			const unused = Object.entries(record.shape).find(
				([k, v]) => v.isOptional() && !(k in parsed.data),
			);
			if (!unused) return `${name}: callback rejected input and no optional field left to try`;
			await record.callback({ ...parsed.data, [unused[0]]: synth(unused[1], unused[0]) }, extra);
		}
		const requests = seen.slice(before);
		if (requests.length === 0) return `${name}: issued no request`;
		for (const request of requests) {
			const url = new URL(request.url);
			if (!ALLOWED_HOST.test(url.host)) return `${name}: disallowed host ${url.host}`;
			const s3Root = url.host.startsWith("s3.") && url.pathname === "/";
			if (!s3Root && !/^\/[^/]/.test(url.pathname))
				return `${name}: malformed path ${url.pathname}`;
			if (/\/\.\.?(\/|$)|undefined|NaN|\[object/.test(url.pathname))
				return `${name}: bad path ${url.pathname}`;
			const token = request.headers.get("x-auth-token");
			const authed = token !== null || request.headers.has("authorization");
			if (!authed) return `${name}: no auth header on ${request.method} ${request.url}`;
			if (token !== null && token !== DUMMY_SECRET) return `${name}: wrong x-auth-token`;
		}
		return null;
	}

	it.each([...byArea.keys()])("%s", async (area) => {
		const failures: string[] = [];
		for (const name of byArea.get(area) as string[]) {
			const failure = await exercise(name);
			if (failure) failures.push(failure);
		}
		expect(failures).toEqual([]);
	});
});
