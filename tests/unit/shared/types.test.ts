import { describe, expect, it } from "vitest";
import {
	ApiErrorType,
	Locality,
	PaginationParams,
	ScalewayRegion,
	ScalewayZone,
} from "../../../src/shared/types.js";

describe("Locality", () => {
	it("accepts valid locality values", () => {
		expect(Locality.parse("zoned")).toBe("zoned");
		expect(Locality.parse("regional")).toBe("regional");
		expect(Locality.parse("global")).toBe("global");
	});

	it("rejects invalid locality values", () => {
		expect(() => Locality.parse("local")).toThrow();
		expect(() => Locality.parse("")).toThrow();
	});
});

describe("PaginationParams", () => {
	it("applies defaults when no values provided", () => {
		const result = PaginationParams.parse({});
		expect(result).toEqual({ page: 1, pageSize: 50 });
	});

	it("accepts valid page and pageSize", () => {
		const result = PaginationParams.parse({ page: 3, pageSize: 25 });
		expect(result).toEqual({ page: 3, pageSize: 25 });
	});

	it("rejects non-integer page", () => {
		expect(() => PaginationParams.parse({ page: 1.5 })).toThrow();
	});

	it("rejects zero or negative page", () => {
		expect(() => PaginationParams.parse({ page: 0 })).toThrow();
		expect(() => PaginationParams.parse({ page: -1 })).toThrow();
	});

	it("rejects pageSize below 1", () => {
		expect(() => PaginationParams.parse({ pageSize: 0 })).toThrow();
	});

	it("rejects pageSize above 100", () => {
		expect(() => PaginationParams.parse({ pageSize: 101 })).toThrow();
	});

	it("rejects non-integer pageSize", () => {
		expect(() => PaginationParams.parse({ pageSize: 10.5 })).toThrow();
	});

	it("accepts boundary values", () => {
		expect(PaginationParams.parse({ page: 1, pageSize: 1 })).toEqual({
			page: 1,
			pageSize: 1,
		});
		expect(PaginationParams.parse({ page: 1, pageSize: 100 })).toEqual({
			page: 1,
			pageSize: 100,
		});
	});
});

describe("ApiErrorType", () => {
	it("accepts all valid error types", () => {
		const types = [
			"not_found",
			"permission_denied",
			"invalid_input",
			"rate_limited",
			"server_error",
		] as const;
		for (const t of types) {
			expect(ApiErrorType.parse(t)).toBe(t);
		}
	});

	it("rejects invalid error types", () => {
		expect(() => ApiErrorType.parse("unknown")).toThrow();
	});
});

describe("ScalewayRegion", () => {
	it("accepts valid region formats", () => {
		expect(ScalewayRegion.parse("fr-par")).toBe("fr-par");
		expect(ScalewayRegion.parse("nl-ams")).toBe("nl-ams");
		expect(ScalewayRegion.parse("pl-waw")).toBe("pl-waw");
	});

	it("rejects invalid region formats", () => {
		expect(() => ScalewayRegion.parse("fr-par-1")).toThrow();
		expect(() => ScalewayRegion.parse("FR-PAR")).toThrow();
		expect(() => ScalewayRegion.parse("f-par")).toThrow();
		expect(() => ScalewayRegion.parse("fr-pa")).toThrow();
		expect(() => ScalewayRegion.parse("")).toThrow();
		expect(() => ScalewayRegion.parse("123-abc")).toThrow();
	});
});

describe("ScalewayZone", () => {
	it("accepts valid zone formats", () => {
		expect(ScalewayZone.parse("fr-par-1")).toBe("fr-par-1");
		expect(ScalewayZone.parse("nl-ams-2")).toBe("nl-ams-2");
		expect(ScalewayZone.parse("pl-waw-10")).toBe("pl-waw-10");
	});

	it("rejects invalid zone formats", () => {
		expect(() => ScalewayZone.parse("fr-par")).toThrow();
		expect(() => ScalewayZone.parse("FR-PAR-1")).toThrow();
		expect(() => ScalewayZone.parse("fr-par-a")).toThrow();
		expect(() => ScalewayZone.parse("")).toThrow();
		expect(() => ScalewayZone.parse("f-par-1")).toThrow();
		expect(() => ScalewayZone.parse("fr-pa-1")).toThrow();
	});
});
