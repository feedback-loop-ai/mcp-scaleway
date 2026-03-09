import type { ApiError, ApiErrorType } from "./types.js";

const STATUS_TO_ERROR_TYPE: Record<number, ApiErrorType> = {
	400: "invalid_input",
	401: "permission_denied",
	403: "permission_denied",
	404: "not_found",
	429: "rate_limited",
};

export function mapScalewayError(error: unknown): ApiError {
	if (error instanceof Error && "statusCode" in error) {
		const statusCode = (error as { statusCode: number }).statusCode;
		const type = STATUS_TO_ERROR_TYPE[statusCode] ?? "server_error";
		return { type, message: error.message, statusCode };
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
