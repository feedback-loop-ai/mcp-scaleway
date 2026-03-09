import { describe, expect, it } from "vitest";
import { formatErrorResponse, mapScalewayError } from "../../../src/shared/errors.js";

describe("mapScalewayError", () => {
	function createErrorWithStatus(message: string, statusCode: number): Error {
		const err = new Error(message);
		(err as Error & { statusCode: number }).statusCode = statusCode;
		return err;
	}

	it("maps 400 to invalid_input", () => {
		const result = mapScalewayError(createErrorWithStatus("bad request", 400));
		expect(result).toEqual({
			type: "invalid_input",
			message: "bad request",
			statusCode: 400,
		});
	});

	it("maps 401 to permission_denied", () => {
		const result = mapScalewayError(createErrorWithStatus("unauthorized", 401));
		expect(result).toEqual({
			type: "permission_denied",
			message: "unauthorized",
			statusCode: 401,
		});
	});

	it("maps 403 to permission_denied", () => {
		const result = mapScalewayError(createErrorWithStatus("forbidden", 403));
		expect(result).toEqual({
			type: "permission_denied",
			message: "forbidden",
			statusCode: 403,
		});
	});

	it("maps 404 to not_found", () => {
		const result = mapScalewayError(createErrorWithStatus("not found", 404));
		expect(result).toEqual({
			type: "not_found",
			message: "not found",
			statusCode: 404,
		});
	});

	it("maps 429 to rate_limited", () => {
		const result = mapScalewayError(createErrorWithStatus("too many requests", 429));
		expect(result).toEqual({
			type: "rate_limited",
			message: "too many requests",
			statusCode: 429,
		});
	});

	it("maps 500+ to server_error", () => {
		const result = mapScalewayError(createErrorWithStatus("internal error", 500));
		expect(result).toEqual({
			type: "server_error",
			message: "internal error",
			statusCode: 500,
		});
	});

	it("maps unknown status codes to server_error", () => {
		const result = mapScalewayError(createErrorWithStatus("teapot", 418));
		expect(result).toEqual({
			type: "server_error",
			message: "teapot",
			statusCode: 418,
		});
	});

	it("handles plain Error without statusCode", () => {
		const result = mapScalewayError(new Error("something broke"));
		expect(result).toEqual({
			type: "server_error",
			message: "something broke",
			statusCode: 500,
		});
	});

	it("handles non-Error values (string)", () => {
		const result = mapScalewayError("unexpected string error");
		expect(result).toEqual({
			type: "server_error",
			message: "unexpected string error",
			statusCode: 500,
		});
	});

	it("handles non-Error values (number)", () => {
		const result = mapScalewayError(42);
		expect(result).toEqual({
			type: "server_error",
			message: "42",
			statusCode: 500,
		});
	});

	it("handles non-Error values (null)", () => {
		const result = mapScalewayError(null);
		expect(result).toEqual({
			type: "server_error",
			message: "null",
			statusCode: 500,
		});
	});
});

describe("formatErrorResponse", () => {
	it("formats an ApiError into MCP error response", () => {
		const apiError = {
			type: "not_found" as const,
			message: "Resource not found",
			statusCode: 404,
		};
		const result = formatErrorResponse(apiError);
		expect(result.isError).toBe(true);
		expect(result.content).toHaveLength(1);
		expect(result.content[0].type).toBe("text");

		const parsed = JSON.parse(result.content[0].text);
		expect(parsed).toEqual({ error: apiError });
	});

	it("produces valid JSON with pretty formatting", () => {
		const apiError = {
			type: "server_error" as const,
			message: "Internal error",
			statusCode: 500,
		};
		const result = formatErrorResponse(apiError);
		const text = result.content[0].text;
		// Verify it's pretty-printed (contains newlines)
		expect(text).toContain("\n");
		// Verify it round-trips
		expect(JSON.parse(text)).toEqual({ error: apiError });
	});
});
