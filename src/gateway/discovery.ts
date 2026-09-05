import { z } from "zod";
import { operationId } from "../shared/toolsets.js";
import type { ApiError } from "../shared/types.js";
import type { Operation, OperationRegistry } from "./registry.js";

export const SearchInput = z.object({
	query: z.string().trim().max(512).optional(),
	area: z.string().trim().min(1).max(100).optional(),
	limit: z.number().int().min(1).max(50).default(10),
	offset: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
});
export const DescribeInput = z.object({
	ops: z.array(z.string().trim().min(1).max(200)).min(1).max(10),
});
export const ExecuteInput = z.object({
	op: z.string().trim().min(1).max(200),
	params: z.record(z.unknown()).optional(),
});

/**
 * Gateway error classes share the flat-tool error shape (`error: {type, message, statusCode}`,
 * see shared/errors.ts) so callers handle both surfaces uniformly. Gateway-specific context
 * (op, issues, suggestions, inputSchema, areas) stays at the top level next to `error`.
 */
export const GATEWAY_ERROR_STATUS = Object.freeze({
	invalid_input: 400,
	permission_denied: 403,
	not_found: 404,
	server_error: 500,
} as const) satisfies Partial<Record<ApiError["type"], number>>;
export type GatewayErrorType = keyof typeof GATEWAY_ERROR_STATUS;
export interface GatewayError {
	error: ApiError;
}

export function gatewayError<D extends object>(
	type: GatewayErrorType,
	message: string,
	details: D,
): GatewayError & D {
	return { error: { type, message, statusCode: GATEWAY_ERROR_STATUS[type] }, ...details };
}

const MAX_SUGGESTIONS = 5;
const MIN_PARTIAL_TOKEN = 4;

function tokens(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean);
}

function matches(registry: OperationRegistry, query: string, area?: string): Operation[] {
	const words = tokens(query);
	return registry.operations
		.filter((op) => !area || op.area === area)
		.map((op) => {
			const identity = new Set(tokens(`${op.op} ${op.area}`));
			const description = new Set(tokens(op.description));
			const score = words.every((word) => identity.has(word) || description.has(word))
				? words.reduce((sum, word) => sum + (identity.has(word) ? 3 : 1), 1)
				: 0;
			return { op, score: operationId(query) === op.op ? Number.MAX_SAFE_INTEGER : score };
		})
		.filter((hit) => hit.score > 0)
		.sort((a, b) => b.score - a.score || a.op.op.localeCompare(b.op.op))
		.map((hit) => hit.op);
}

/**
 * Typo fallback for lookups only. Per query word over an operation ID's tokens: an exact token
 * scores 2; containment or a shared prefix over tokens of at least four characters scores 1.
 * Ties prefer shorter IDs, then ID order. Search keeps its all-token semantics; this ranks over
 * the allowed registry only, so filtered or disabled operations are never suggested.
 */
function overlaps(word: string, token: string): boolean {
	if (word.length < MIN_PARTIAL_TOKEN || token.length < MIN_PARTIAL_TOKEN) return false;
	return (
		token.includes(word) ||
		word.includes(token) ||
		word.slice(0, MIN_PARTIAL_TOKEN) === token.slice(0, MIN_PARTIAL_TOKEN)
	);
}

function partialMatches(registry: OperationRegistry, requested: string): Operation[] {
	const words = [...new Set(tokens(requested))];
	return registry.operations
		.map((op) => {
			const idTokens = tokens(op.op);
			const score = words.reduce((sum, word) => {
				if (idTokens.includes(word)) return sum + 2;
				return idTokens.some((token) => overlaps(word, token)) ? sum + 1 : sum;
			}, 0);
			return { op, score, size: idTokens.length };
		})
		.filter((hit) => hit.score > 0)
		.sort((a, b) => b.score - a.score || a.size - b.size || a.op.op.localeCompare(b.op.op))
		.map((hit) => hit.op);
}

export function lookupError(registry: OperationRegistry, requested: string) {
	// For an unknown identifier, rank by ID-token overlap first (the "did you mean this op"
	// signal), then fall back to description-token matches. matches() scores description text,
	// which would otherwise rank an op whose description mentions a word above the op whose ID
	// the caller actually mistyped.
	const byId = partialMatches(registry, requested);
	const candidates = byId.length > 0 ? byId : matches(registry, requested);
	return gatewayError(
		"not_found",
		"Unknown or disabled operation. Use scaleway_search to find an allowed ID; filters apply to execution too.",
		{ suggestions: candidates.slice(0, MAX_SUGGESTIONS).map((op) => op.op) },
	);
}

export function searchOperations(registry: OperationRegistry, input: z.input<typeof SearchInput>) {
	const { query = "", area, limit, offset } = SearchInput.parse(input);
	const areas = [...new Set(registry.operations.map((op) => op.area))].sort();
	if (area && !areas.includes(area)) {
		return gatewayError(
			"not_found",
			"Unknown or disabled area. Use an enabled area slug or omit area to list them.",
			{ areas },
		);
	}
	if (!query && !area) {
		return {
			areas: areas.slice(offset, offset + limit).map((slug) => ({
				area: slug,
				total: registry.operations.filter((op) => op.area === slug).length,
			})),
			total: areas.length,
			totalOperations: registry.operations.length,
			...(offset + limit < areas.length ? { nextOffset: offset + limit } : {}),
		};
	}
	const found = matches(registry, query, area);
	return {
		operations: found.slice(offset, offset + limit).map((op) => {
			const required = op.inputSchema.required ?? [];
			return {
				op: op.op,
				description: op.description.split("\n")[0].slice(0, 180),
				readOnly: op.readOnly,
				required,
				optional: Object.keys(op.shape).filter((key) => !required.includes(key)),
			};
		}),
		total: found.length,
		...(offset + limit < found.length ? { nextOffset: offset + limit } : {}),
	};
}

export function describeOperations(
	registry: OperationRegistry,
	input: z.input<typeof DescribeInput>,
) {
	const { ops } = DescribeInput.parse(input);
	const operations: Operation[] = [];
	for (const id of ops) {
		const op = registry.get(id);
		if (!op) return lookupError(registry, id);
		operations.push(op);
	}
	return {
		operations: operations.map(({ op, tool, area, api, readOnly, description, inputSchema }) => ({
			op,
			tool,
			area,
			api,
			readOnly,
			description,
			inputSchema,
		})),
	};
}
