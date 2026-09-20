import { afterEach, describe, expect, it, vi } from "vitest";
import { requiredOrganizationId } from "../../../src/shared/request-defaults.js";

afterEach(() => vi.unstubAllEnvs());
describe("required organization scope", () => {
	it("preserves explicit identity without loading credentials", () => {
		vi.stubEnv("SCW_ACCESS_KEY", undefined);
		expect(requiredOrganizationId("provided-org")).toBe("provided-org");
	});
	it("uses only the configured organization and fails if it is absent", () => {
		vi.stubEnv("SCW_ACCESS_KEY", "fixture-access");
		vi.stubEnv("SCW_SECRET_KEY", "fixture-secret");
		vi.stubEnv("SCW_DEFAULT_PROJECT_ID", "fixture-project");
		vi.stubEnv("SCW_DEFAULT_ORGANIZATION_ID", "configured-org");
		expect(requiredOrganizationId(undefined)).toBe("configured-org");
		vi.stubEnv("SCW_DEFAULT_ORGANIZATION_ID", undefined);
		expect(() => requiredOrganizationId(undefined)).toThrow("Organization ID is required");
		try {
			requiredOrganizationId(undefined);
		} catch (error) {
			expect(error).toMatchObject({ status: 400 });
		}
	});
});
