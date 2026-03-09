import { beforeEach, describe, expect, it, vi } from "vitest";
import { createScalewayClient, resetClient } from "../../../src/shared/client.js";

vi.mock("@scaleway/sdk-client", () => ({
	createClient: vi.fn((config: Record<string, unknown>) => ({
		_mock: true,
		...config,
	})),
}));

import { createClient } from "@scaleway/sdk-client";

const mockConfig = {
	accessKey: "SCWXXXXXXXXXXXXXXXXXXX",
	secretKey: "secret-key",
	defaultProjectId: "project-id",
	defaultOrganizationId: "org-id",
	defaultRegion: "fr-par",
	defaultZone: "fr-par-1",
};

describe("createScalewayClient", () => {
	beforeEach(() => {
		resetClient();
		vi.mocked(createClient).mockClear();
	});

	it("creates a client with the provided config", () => {
		const client = createScalewayClient(mockConfig);
		expect(createClient).toHaveBeenCalledWith({
			accessKey: mockConfig.accessKey,
			secretKey: mockConfig.secretKey,
			defaultProjectId: mockConfig.defaultProjectId,
			defaultOrganizationId: mockConfig.defaultOrganizationId,
			defaultRegion: mockConfig.defaultRegion,
			defaultZone: mockConfig.defaultZone,
		});
		expect(client).toBeDefined();
	});

	it("returns the same instance on subsequent calls (singleton)", () => {
		const first = createScalewayClient(mockConfig);
		const second = createScalewayClient(mockConfig);
		expect(first).toBe(second);
		expect(createClient).toHaveBeenCalledTimes(1);
	});

	it("creates a new instance after resetClient()", () => {
		const first = createScalewayClient(mockConfig);
		resetClient();
		const second = createScalewayClient(mockConfig);
		expect(first).not.toBe(second);
		expect(createClient).toHaveBeenCalledTimes(2);
	});
});

describe("resetClient", () => {
	it("clears the singleton so a new client is created next time", () => {
		createScalewayClient(mockConfig);
		const callsBefore = vi.mocked(createClient).mock.calls.length;
		resetClient();
		createScalewayClient(mockConfig);
		const callsAfter = vi.mocked(createClient).mock.calls.length;
		expect(callsAfter - callsBefore).toBe(1);
	});
});
