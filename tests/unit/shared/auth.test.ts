import { beforeEach, describe, expect, it } from "vitest";
import { loadAuthConfig } from "../../../src/shared/auth.js";

const ENV_KEYS = [
	"SCW_ACCESS_KEY",
	"SCW_SECRET_KEY",
	"SCW_DEFAULT_PROJECT_ID",
	"SCW_DEFAULT_ORGANIZATION_ID",
	"SCW_DEFAULT_REGION",
	"SCW_DEFAULT_ZONE",
] as const;

function clearEnv() {
	for (const key of ENV_KEYS) {
		delete process.env[key];
	}
}

describe("loadAuthConfig", () => {
	const REQUIRED_ENV = {
		SCW_ACCESS_KEY: "SCWXXXXXXXXXXXXXXXXXXX",
		SCW_SECRET_KEY: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
		SCW_DEFAULT_PROJECT_ID: "project-id-123",
	};

	beforeEach(() => {
		clearEnv();
	});

	it("returns config with all env vars set", () => {
		Object.assign(process.env, {
			...REQUIRED_ENV,
			SCW_DEFAULT_ORGANIZATION_ID: "org-id-456",
			SCW_DEFAULT_REGION: "nl-ams",
			SCW_DEFAULT_ZONE: "nl-ams-1",
		});

		const config = loadAuthConfig();
		expect(config).toEqual({
			accessKey: REQUIRED_ENV.SCW_ACCESS_KEY,
			secretKey: REQUIRED_ENV.SCW_SECRET_KEY,
			defaultProjectId: REQUIRED_ENV.SCW_DEFAULT_PROJECT_ID,
			defaultOrganizationId: "org-id-456",
			defaultRegion: "nl-ams",
			defaultZone: "nl-ams-1",
		});
	});

	it("uses default region and zone when not provided", () => {
		Object.assign(process.env, REQUIRED_ENV);

		const config = loadAuthConfig();
		expect(config.defaultRegion).toBe("fr-par");
		expect(config.defaultZone).toBe("fr-par-1");
	});

	it("sets defaultOrganizationId to undefined when not provided", () => {
		Object.assign(process.env, REQUIRED_ENV);

		const config = loadAuthConfig();
		expect(config.defaultOrganizationId).toBeUndefined();
	});

	it("throws when SCW_ACCESS_KEY is missing", () => {
		process.env.SCW_SECRET_KEY = REQUIRED_ENV.SCW_SECRET_KEY;
		process.env.SCW_DEFAULT_PROJECT_ID = REQUIRED_ENV.SCW_DEFAULT_PROJECT_ID;

		expect(() => loadAuthConfig()).toThrow("SCW_ACCESS_KEY environment variable is required");
	});

	it("throws when SCW_SECRET_KEY is missing", () => {
		process.env.SCW_ACCESS_KEY = REQUIRED_ENV.SCW_ACCESS_KEY;
		process.env.SCW_DEFAULT_PROJECT_ID = REQUIRED_ENV.SCW_DEFAULT_PROJECT_ID;

		expect(() => loadAuthConfig()).toThrow("SCW_SECRET_KEY environment variable is required");
	});

	it("throws when SCW_DEFAULT_PROJECT_ID is missing", () => {
		process.env.SCW_ACCESS_KEY = REQUIRED_ENV.SCW_ACCESS_KEY;
		process.env.SCW_SECRET_KEY = REQUIRED_ENV.SCW_SECRET_KEY;

		expect(() => loadAuthConfig()).toThrow(
			"SCW_DEFAULT_PROJECT_ID environment variable is required",
		);
	});
});
