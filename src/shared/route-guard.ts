import { AsyncLocalStorage } from "node:async_hooks";

interface RouteMatcher {
	method: string;
	host: RegExp;
	path: RegExp;
	fields: readonly string[];
	query: URLSearchParams;
	s3: boolean;
}
interface RouteContext {
	label: string;
	matchers: readonly RouteMatcher[];
}
const storage = new AsyncLocalStorage<RouteContext>();
const SUBRESOURCES = new Set([
	"policy",
	"lifecycle",
	"versioning",
	"list-type",
	"acl",
	"tagging",
	"uploads",
	"uploadId",
	"versionId",
	"delete",
	"website",
	"cors",
	"notification",
	"logging",
	"replication",
	"object-lock",
	"retention",
	"legal-hold",
]);

function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function compileTemplate(template: string, host = false) {
	const fields: string[] = [];
	const pattern = template
		.split(/(\{[a-z_]+\})/gi)
		.map((part) => {
			if (!part.startsWith("{")) return escapeRegex(part);
			fields.push(part.slice(1, -1));
			return host ? "([a-z0-9-]+)" : "([^/?#]+)";
		})
		.join("");
	return { regex: new RegExp(`^${pattern}$`), fields };
}

/**
 * Every allowed request leg comes from the operation's declared `api` metadata alone
 * (composites join legs with " + "; trailing parenthesised notes are ignored). Labels select
 * the default host family only; they never add legs that the declaration does not name.
 */
export function parseApiMatchers(label: string, api: string): readonly RouteMatcher[] {
	const s3 = label.startsWith("scaleway_object_storage_");
	const declarations = api.replace(/\s+\([^)]*\)/g, "");
	return declarations.split(/\s+\+\s+/).map((declaration) => {
		const match = /^(GET|HEAD|POST|PUT|PATCH|DELETE) (?:https:\/\/([^/]+))?(\/\S*)$/.exec(
			declaration,
		);
		if (!match) throw new Error(`Invalid endpoint metadata for ${label}`);
		const [, method, authority, reference] = match;
		const [path, query = ""] = reference.split("?");
		const compiled = compileTemplate(path);
		return {
			method,
			host: compileTemplate(authority ?? (s3 ? "s3.{region}.scw.cloud" : "api.scaleway.com"), true)
				.regex,
			path: compiled.regex,
			fields: compiled.fields,
			query: new URLSearchParams(query),
			s3,
		};
	});
}

/** No global mutable current-operation variable: concurrent requests keep independent contexts. */
export function withRouteContext<T>(label: string, api: string, body: () => T): T {
	return storage.run({ label, matchers: parseApiMatchers(label, api) }, body);
}

/** Code-point scan for ASCII controls and DEL (kept out of regex literals). */
function hasControl(value: string): boolean {
	for (const char of value) {
		const code = char.codePointAt(0) as number;
		if (code < 0x20 || code === 0x7f) return true;
	}
	return false;
}

/** Raw (pre-decoding) path text must not contain literal whitespace or controls. */
function hasRawControlOrSpace(value: string): boolean {
	for (const char of value) {
		const code = char.codePointAt(0) as number;
		if (code <= 0x20 || code === 0x7f) return true;
	}
	return false;
}

function safeSegment(value: string, objectKey: boolean): boolean {
	try {
		const decoded = decodeURIComponent(value);
		// Object keys are explicitly encoded by S3 handlers and legitimately contain '/' or '%'.
		if (objectKey) return decoded !== "." && decoded !== ".." && decoded.length > 0;
		return (
			decoded.length > 0 &&
			decoded !== "." &&
			decoded !== ".." &&
			!hasControl(decoded) &&
			!/[\\/?#]/u.test(decoded)
		);
	} catch {
		return false;
	}
}

function matches(route: RouteMatcher, url: URL, method: string): boolean {
	if (
		url.protocol !== "https:" ||
		url.username ||
		url.password ||
		url.hash ||
		!route.host.test(url.host) ||
		route.method !== method.toUpperCase()
	)
		return false;
	const parts = route.path.exec(url.pathname);
	if (
		!parts ||
		!parts
			.slice(1)
			.every((value, index) => safeSegment(value, route.s3 && route.fields[index] === "key"))
	)
		return false;
	for (const [name, value] of route.query) {
		if (url.searchParams.getAll(name).length !== 1 || url.searchParams.get(name) !== value)
			return false;
	}
	// S3 routes distinguish operations by subresource query as well as method and path.
	if (route.s3) {
		for (const name of url.searchParams.keys()) {
			if (SUBRESOURCES.has(name) && !route.query.has(name)) return false;
		}
	}
	return true;
}

/** Validate the RAW path before URL normalization erases dot segments. Errors never echo inputs. */
export function assertRouteAllowed(rawUrl: string, method: string): void {
	const context = storage.getStore();
	if (!context) return;
	const rawPath = rawUrl.replace(/^https:\/\/[^/]+/, "").split(/[?#]/)[0];
	const malformedPath =
		hasRawControlOrSpace(rawPath) ||
		rawPath.includes("\\") ||
		rawPath.split("/").some((part) => /^(?:\.|%2e){1,2}$/i.test(part));
	if (malformedPath || !context.matchers.some((route) => matches(route, new URL(rawUrl), method))) {
		throw Object.assign(new Error(`Request blocked by endpoint confinement for ${context.label}`), {
			status: 400,
		});
	}
}

/** SDK requests are checked before the fetcher creates and normalizes a Request. */
export function assertScwPathAllowed(rawPath: string, method: string): void {
	assertRouteAllowed(`https://api.scaleway.com${rawPath}`, method);
}

/** Preserve raw-fetch call arguments for the existing transports and their tests. */
export async function guardedFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
	assertRouteAllowed(raw, init?.method ?? (input instanceof Request ? input.method : "GET"));
	return fetch(input, init);
}
