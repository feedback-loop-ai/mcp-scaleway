import type { PaginatedResponse } from "./types.js";

/**
 * The MCP envelope boundary (Decision 1): this shape — `{ items, totalCount,
 * page, pageSize }` — is this server's own camelCase boundary over upstream
 * list responses. Upstream Scaleway JSON is snake_case and is passed through
 * unrenamed: the upstream wire field is `total_count`; the camelCase names here
 * are the MCP side of the boundary and exist nowhere upstream.
 */
export function buildPaginatedResponse<T>(
	items: T[],
	totalCount: number,
	page: number,
	pageSize: number,
): PaginatedResponse<T> {
	return { items, totalCount, page, pageSize };
}

export function paginationToQuery(page: number, pageSize: number) {
	return { page, page_size: pageSize };
}
