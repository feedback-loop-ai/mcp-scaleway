import { loadAuthConfig } from "./auth.js";

/** Organization identity has no safe fallback to a project identifier. */
export function requiredOrganizationId(input: string | undefined): string {
	const organization = input ?? loadAuthConfig().defaultOrganizationId;
	if (!organization)
		throw Object.assign(
			new Error("Organization ID is required: supply it or configure SCW_DEFAULT_ORGANIZATION_ID"),
			{ status: 400 },
		);
	return organization;
}
