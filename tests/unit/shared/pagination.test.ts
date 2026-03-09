import { describe, expect, it } from "vitest";
import { buildPaginatedResponse, paginationToQuery } from "../../../src/shared/pagination.js";

describe("buildPaginatedResponse", () => {
	it("returns correct structure with items", () => {
		const items = [{ id: 1 }, { id: 2 }];
		const result = buildPaginatedResponse(items, 10, 1, 50);
		expect(result).toEqual({
			items: [{ id: 1 }, { id: 2 }],
			totalCount: 10,
			page: 1,
			pageSize: 50,
		});
	});

	it("returns correct structure with empty items", () => {
		const result = buildPaginatedResponse([], 0, 1, 50);
		expect(result).toEqual({
			items: [],
			totalCount: 0,
			page: 1,
			pageSize: 50,
		});
	});

	it("preserves generic type information", () => {
		const items = ["a", "b", "c"];
		const result = buildPaginatedResponse(items, 3, 2, 10);
		expect(result.items).toEqual(["a", "b", "c"]);
		expect(result.totalCount).toBe(3);
		expect(result.page).toBe(2);
		expect(result.pageSize).toBe(10);
	});
});

describe("paginationToQuery", () => {
	it("maps page and pageSize to query params", () => {
		const result = paginationToQuery(1, 50);
		expect(result).toEqual({ page: 1, page_size: 50 });
	});

	it("maps different values correctly", () => {
		const result = paginationToQuery(3, 25);
		expect(result).toEqual({ page: 3, page_size: 25 });
	});
});
