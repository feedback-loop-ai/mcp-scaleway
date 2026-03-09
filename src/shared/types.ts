import { z } from "zod";

export const Locality = z.enum(["zoned", "regional", "global"]);
export type Locality = z.infer<typeof Locality>;

export const PaginationParams = z.object({
	page: z.number().int().positive().optional().default(1).describe("Page number (1-indexed)"),
	pageSize: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
});
export type PaginationParams = z.infer<typeof PaginationParams>;

export interface PaginatedResponse<T> {
	items: T[];
	totalCount: number;
	page: number;
	pageSize: number;
}

export const ApiErrorType = z.enum([
	"not_found",
	"permission_denied",
	"invalid_input",
	"rate_limited",
	"server_error",
]);
export type ApiErrorType = z.infer<typeof ApiErrorType>;

export interface ApiError {
	type: ApiErrorType;
	message: string;
	statusCode: number;
}

export const ScalewayRegion = z
	.string()
	.regex(/^[a-z]{2}-[a-z]{3}$/, "Invalid region format (e.g., fr-par)");

export const ScalewayZone = z
	.string()
	.regex(/^[a-z]{2}-[a-z]{3}-[0-9]+$/, "Invalid zone format (e.g., fr-par-1)");
