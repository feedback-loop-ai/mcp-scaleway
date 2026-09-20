import { AsyncLocalStorage } from "node:async_hooks";
import Ajv, { type AnySchema, type ValidateFunction } from "ajv";
import { fullFormats } from "ajv-formats/dist/formats.js";
import { z } from "zod";
import catalogJson from "./response-contracts.json";
import { isS3MissingConfiguration, validateS3Response } from "./s3-response.js";
import unavailableJson from "./unavailable-operations.json";

type JsonSchema = Record<string, unknown> | boolean;
interface ResponseContract {
	content?: Record<string, { schema: JsonSchema }>;
}
interface ContractDocument {
	components?: Record<string, unknown>;
	paths: Record<string, Record<string, { responses: Record<string, ResponseContract> }>>;
}
export interface ResponseRoute {
	method: string;
	path: string;
	host: string;
	query?: string;
	area: string;
	sourcePath: string;
}
interface ResponseCatalog {
	documents: Record<string, ContractDocument>;
	routes: Record<string, ResponseRoute[]>;
}
const catalog = catalogJson as unknown as ResponseCatalog;
const unavailable = unavailableJson as Record<string, unknown>;
const ajv = new Ajv({ strict: false, logger: false, allowUnionTypes: true });
for (const [name, format] of Object.entries(fullFormats)) ajv.addFormat(name, format);
for (const [name, minimum, maximum] of [
	["int32", -(2 ** 31), 2 ** 31 - 1],
	["uint32", 0, 2 ** 32 - 1],
	["int64", -(2 ** 63), 2 ** 63 - 1],
	["uint64", 0, 2 ** 64 - 1],
] as const) {
	ajv.addFormat(name, {
		type: "number",
		validate: (value) => Number.isInteger(value) && value >= minimum && value <= maximum,
	});
}
const compiled = new Map<string, ValidateFunction>();

export type ResponseFailure =
	| "missing_contract"
	| "unexpected_status"
	| "unexpected_content_type"
	| "invalid_json"
	| "invalid_body"
	| "invalid_schema"
	| "invalid_xml";

export class UpstreamResponseError extends Error {
	readonly status = 502;
	constructor(readonly reason: ResponseFailure) {
		super(`Invalid upstream response (${reason})`);
		this.name = "UpstreamResponseError";
	}
}

/** The refinement validates without transforming, coercing or stripping upstream data. */
export function responseSchema(documentId: string, schema: JsonSchema) {
	const document = catalog.documents[documentId];
	if (!document) throw new UpstreamResponseError("missing_contract");
	const key = `${documentId}:${JSON.stringify(schema)}`;
	let validate = compiled.get(key);
	if (!validate) {
		const root =
			typeof schema === "boolean" ? schema : { ...schema, components: document.components };
		validate = ajv.compile(root as AnySchema);
		compiled.set(key, validate);
	}
	const check = validate;
	return z.unknown().superRefine((value, context) => {
		if (!check(value))
			context.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid upstream shape" });
	});
}

export function validateSchema(documentId: string, schema: JsonSchema, value: unknown): void {
	if (!responseSchema(documentId, schema).safeParse(value).success) {
		throw new UpstreamResponseError("invalid_schema");
	}
}

function templatePattern(value: string): RegExp {
	return new RegExp(
		`^${value
			.split(/\{[^}]+\}/)
			.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
			.join("[^/?#]+")}$`,
	);
}

export function findResponseRoute(
	operation: string,
	url: URL,
	method: string,
): ResponseRoute | undefined {
	return catalog.routes[operation]?.find(
		(route) =>
			route.method.toUpperCase() === method.toUpperCase() &&
			templatePattern(route.host).test(url.host) &&
			templatePattern(route.path).test(url.pathname) &&
			[...new URLSearchParams(route.query)].every(([key, value]) => {
				const actual = url.searchParams.get(key);
				const correctValue = /^\{[a-z_]+\}$/i.test(value)
					? actual !== null && actual !== ""
					: actual === value;
				return url.searchParams.getAll(key).length === 1 && correctValue;
			}),
	);
}

interface RequestScope {
	operation: string | undefined;
	url: string;
	method: string;
}
const requests = new AsyncLocalStorage<RequestScope>();

/** Never call an unverified legacy endpoint, particularly a mutation, before failing. */
export function assertOperationAvailable(operation: string | undefined): void {
	if (operation && Object.hasOwn(unavailable, operation)) {
		throw Object.assign(
			new Error("Operation unavailable: upstream contract could not be verified"),
			{ status: 501 },
		);
	}
}

/** Keep concurrent SDK calls associated with their own wire request before unmarshalling. */
export function withResponseRequest<T>(scope: RequestScope, body: () => T): T {
	return requests.run(scope, body);
}

export async function validateSdkResponse(response: Response): Promise<Response> {
	const scope = requests.getStore();
	if (!scope?.operation) return response;
	return validateUpstreamResponse(scope.operation, scope.url, scope.method, response);
}

/** Runtime checks are selected from recorded upstream evidence, never tool output guesses. */
export async function validateUpstreamResponse(
	operation: string,
	rawUrl: string,
	method: string,
	response: Response,
): Promise<Response> {
	const url = new URL(rawUrl);
	if (!response.ok) {
		if (url.hostname.startsWith("s3.") && (await isS3MissingConfiguration(url, response)))
			return response;
		throw Object.assign(new Error(`Scaleway request failed (HTTP ${response.status})`), {
			status: response.status,
		});
	}
	const route = findResponseRoute(operation, url, method);
	if (!route) throw new UpstreamResponseError("missing_contract");
	if (url.hostname.startsWith("s3.")) {
		await validateS3Response(url, method, response);
		return response;
	}
	const responses =
		catalog.documents[route.area]?.paths[route.sourcePath]?.[method.toLowerCase()]?.responses;
	const contract = responses?.[String(response.status)] ?? responses?.["2XX"];
	if (!contract) throw new UpstreamResponseError("unexpected_status");
	const body = await response.clone().text();
	if (!contract.content || Object.keys(contract.content).length === 0) {
		if (body !== "") throw new UpstreamResponseError("invalid_body");
		return response;
	}
	const mediaType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
	const content = mediaType ? contract.content[mediaType] : undefined;
	if (!content) throw new UpstreamResponseError("unexpected_content_type");
	let value: unknown = body;
	if (mediaType === "application/json") {
		try {
			value = JSON.parse(body);
		} catch {
			throw new UpstreamResponseError("invalid_json");
		}
	}
	validateSchema(route.area, content.schema, value);
	// SDK 2.x tests MIME by exact equality. Preserve the body while accepting charset parameters.
	if (mediaType === "application/json" && response.headers.get("content-type") !== mediaType) {
		const headers = new Headers(response.headers);
		headers.set("content-type", mediaType);
		return new Response(body, {
			status: response.status,
			statusText: response.statusText,
			headers,
		});
	}
	return response;
}

/** Used by health and the catalog gate: missing references fail before a request is attempted. */
export function initializeResponseSchemas(): void {
	for (const [operationId, routes] of Object.entries(catalog.routes)) {
		if (routes.length === 0 && !Object.hasOwn(unavailable, operationId))
			throw new UpstreamResponseError("missing_contract");
		for (const route of routes) {
			if (route.host.startsWith("s3.")) continue;
			const operation =
				catalog.documents[route.area]?.paths[route.sourcePath]?.[route.method.toLowerCase()];
			if (!operation) throw new UpstreamResponseError("missing_contract");
			for (const [status, response] of Object.entries(operation.responses)) {
				if (!status.startsWith("2")) continue;
				for (const content of Object.values(response.content ?? {}))
					responseSchema(route.area, content.schema);
			}
		}
	}
}
