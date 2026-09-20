import { z } from "zod";

/** Numeric milliseconds or the documented legacy ms/s spelling; never coerce arbitrary strings. */
export const Milliseconds = z.union([
	z.number().finite().nonnegative(),
	z.string().regex(/^\d+(?:\.\d+)?(?:ms|s)$/),
]);

function milliseconds(value: unknown): number {
	const parsed = Milliseconds.parse(value);
	if (typeof parsed === "number") return parsed;
	return parsed.endsWith("ms") ? Number(parsed.slice(0, -2)) : Number(parsed.slice(0, -1)) * 1000;
}
const FIELDS = [
	"timeout_client",
	"timeout_server",
	"timeout_connect",
	"timeout_tunnel",
	"check_delay",
	"check_timeout",
];

/** The current LB wire contract uses numeric milliseconds for these specific fields. */
export function normalizeLbTimeouts(input: Record<string, unknown>): Record<string, unknown> {
	const result = { ...input };
	for (const key of FIELDS) if (result[key] !== undefined) result[key] = milliseconds(result[key]);
	if (result.health_check !== undefined) {
		result.health_check = normalizeLbTimeouts(z.record(z.unknown()).parse(result.health_check));
	}
	return result;
}
