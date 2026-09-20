import { type Client, createClient } from "@scaleway/sdk-client";
import type { ScalewayConfig } from "./auth.js";
import {
	assertOperationAvailable,
	validateSdkResponse,
	withResponseRequest,
} from "./response-validation.js";
import { assertScwPathAllowed, currentOperation } from "./route-guard.js";

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
		interceptors: [{ response: ({ response }) => validateSdkResponse(response) }],
	});

	// Confine every request to the running operation's declared endpoint. The check is a
	// no-op outside gateway/flat dispatch (no AsyncLocalStorage context), so direct handler
	// tests and startup probes are unaffected.
	const innerFetch = client.fetch;
	clientInstance = Object.assign(client, {
		fetch: ((...args: Parameters<typeof innerFetch>) => {
			assertOperationAvailable(currentOperation());
			const path =
				args[0].path +
				(args[0].urlParams instanceof URLSearchParams ? `?${args[0].urlParams}` : "");
			assertScwPathAllowed(path, args[0].method);
			// Forward the exact argument list so SDK call shapes (and their tests) stay unchanged.
			return withResponseRequest(
				{
					operation: currentOperation(),
					url: `https://api.scaleway.com${path}`,
					method: args[0].method,
				},
				() => innerFetch(...args),
			);
		}) as typeof innerFetch,
	});

	return clientInstance;
}

export function resetClient(): void {
	clientInstance = null;
}
