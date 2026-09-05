import type { ApiError, ApiErrorType } from "./types.js";

const STATUS_TO_ERROR_TYPE: Record<number, ApiErrorType> = {
	400: "invalid_input",
	401: "permission_denied",
	403: "permission_denied",
	404: "not_found",
	429: "rate_limited",
};

/**
 * Extract an HTTP status from an error thrown by any transport used in this
 * server. `@scaleway/sdk-client` throws `ScalewayError` (and subclasses) that
 * expose the response status as `.status`; hand-rolled transports attach
 * `.statusCode`. Anything else has no usable status.
 */
function extractStatus(error: Error): number | undefined {
	const candidate = error as Error & { status?: unknown; statusCode?: unknown };
	if (typeof candidate.statusCode === "number") return candidate.statusCode;
	if (typeof candidate.status === "number") return candidate.status;
	return undefined;
}

export function mapScalewayError(error: unknown): ApiError {
	if (error instanceof Error) {
		const statusCode = extractStatus(error);
		if (statusCode !== undefined) {
			const type = STATUS_TO_ERROR_TYPE[statusCode] ?? "server_error";
			return { type, message: error.message, statusCode };
		}
	}

	if (error instanceof Error) {
		return { type: "server_error", message: error.message, statusCode: 500 };
	}

	return {
		type: "server_error",
		message: String(error),
		statusCode: 500,
	};
}

export function formatErrorResponse(apiError: ApiError) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify({ error: apiError }, null, 2),
			},
		],
		isError: true,
	};
}
