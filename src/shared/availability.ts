import manifest from "./unavailable-operations.json";

interface UnavailableDetails {
	reason: string;
	migration: string;
	sources: string[];
}
const unavailable: Readonly<Record<string, UnavailableDetails>> = manifest;

/** Discovery may retain a legacy ID whose current cloud contract cannot yet be verified. */
export function operationAvailability(tool: string) {
	const details = unavailable[tool];
	return details ? { status: "unavailable" as const, ...structuredClone(details) } : undefined;
}
