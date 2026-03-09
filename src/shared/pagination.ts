import type { PaginatedResponse } from "./types.js";

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
