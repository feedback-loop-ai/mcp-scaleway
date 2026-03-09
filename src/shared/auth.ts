export interface ScalewayConfig {
	accessKey: string;
	secretKey: string;
	defaultProjectId: string;
	defaultOrganizationId?: string;
	defaultRegion: string;
	defaultZone: string;
}

export function loadAuthConfig(): ScalewayConfig {
	const accessKey = process.env.SCW_ACCESS_KEY;
	const secretKey = process.env.SCW_SECRET_KEY;
	const defaultProjectId = process.env.SCW_DEFAULT_PROJECT_ID;

	if (!accessKey) {
		throw new Error("SCW_ACCESS_KEY environment variable is required");
	}
	if (!secretKey) {
		throw new Error("SCW_SECRET_KEY environment variable is required");
	}
	if (!defaultProjectId) {
		throw new Error("SCW_DEFAULT_PROJECT_ID environment variable is required");
	}

	return {
		accessKey,
		secretKey,
		defaultProjectId,
		defaultOrganizationId: process.env.SCW_DEFAULT_ORGANIZATION_ID,
		defaultRegion: process.env.SCW_DEFAULT_REGION ?? "fr-par",
		defaultZone: process.env.SCW_DEFAULT_ZONE ?? "fr-par-1",
	};
}
