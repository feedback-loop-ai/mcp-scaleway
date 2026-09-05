import { type Client, createClient } from "@scaleway/sdk-client";
import type { ScalewayConfig } from "./auth.js";
import { assertScwPathAllowed } from "./route-guard.js";

let clientInstance: Client | null = null;

export function createScalewayClient(config: ScalewayConfig): Client {
	if (clientInstance) {
		return clientInstance;
	}

	const client = createClient({
		accessKey: config.accessKey,
		secretKey: config.secretKey,
		defaultProjectId: config.defaultProjectId,
		defaultOrganizationId: config.defaultOrganizationId,
		defaultRegion: config.defaultRegion,
		defaultZone: config.defaultZone,
	});

	// Confine every request to the running operation's declared endpoint. The check is a
	// no-op outside gateway/flat dispatch (no AsyncLocalStorage context), so direct handler
	// tests and startup probes are unaffected.
	const innerFetch = client.fetch;
	clientInstance = Object.assign(client, {
		fetch: ((...args: Parameters<typeof innerFetch>) => {
			assertScwPathAllowed(args[0].path, args[0].method);
			// Forward the exact argument list so SDK call shapes (and their tests) stay unchanged.
			return innerFetch(...args);
		}) as typeof innerFetch,
	});

	return clientInstance;
}

export function resetClient(): void {
	clientInstance = null;
}
