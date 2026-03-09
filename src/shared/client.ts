import { type Client, createClient } from "@scaleway/sdk-client";
import type { ScalewayConfig } from "./auth.js";

let clientInstance: Client | null = null;

export function createScalewayClient(config: ScalewayConfig): Client {
	if (clientInstance) {
		return clientInstance;
	}

	clientInstance = createClient({
		accessKey: config.accessKey,
		secretKey: config.secretKey,
		defaultProjectId: config.defaultProjectId,
		defaultOrganizationId: config.defaultOrganizationId,
		defaultRegion: config.defaultRegion,
		defaultZone: config.defaultZone,
	});

	return clientInstance;
}

export function resetClient(): void {
	clientInstance = null;
}
