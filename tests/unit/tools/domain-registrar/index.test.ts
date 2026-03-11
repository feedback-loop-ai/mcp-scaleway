import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { describe, expect, it, vi } from "vitest";
import { registerDomainRegistrarTools } from "../../../../src/tools/domain-registrar/index.js";

describe("registerDomainRegistrarTools", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerDomainRegistrarTools(server)).not.toThrow();
	});

	it("registers all 15 domain registrar tools", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerDomainRegistrarTools(server);
		expect(toolSpy).toHaveBeenCalledTimes(15);
	});

	it("registers tools with correct names", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerDomainRegistrarTools(server);

		const registeredNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(registeredNames).toContain("scaleway_domain_registrar_list_domains");
		expect(registeredNames).toContain("scaleway_domain_registrar_get_domain");
		expect(registeredNames).toContain("scaleway_domain_registrar_register_domain");
		expect(registeredNames).toContain("scaleway_domain_registrar_renew_domain");
		expect(registeredNames).toContain("scaleway_domain_registrar_transfer_domain");
		expect(registeredNames).toContain("scaleway_domain_registrar_update_domain");
		expect(registeredNames).toContain("scaleway_domain_registrar_enable_auto_renew");
		expect(registeredNames).toContain("scaleway_domain_registrar_disable_auto_renew");
		expect(registeredNames).toContain("scaleway_domain_registrar_check_domain_availability");
		expect(registeredNames).toContain("scaleway_domain_registrar_list_contacts");
		expect(registeredNames).toContain("scaleway_domain_registrar_get_contact");
		expect(registeredNames).toContain("scaleway_domain_registrar_create_contact");
		expect(registeredNames).toContain("scaleway_domain_registrar_update_contact");
		expect(registeredNames).toContain("scaleway_domain_registrar_list_tlds");
		expect(registeredNames).toContain("scaleway_domain_registrar_get_tld");
	});

	it("registers tools with descriptions", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerDomainRegistrarTools(server);

		for (const call of toolSpy.mock.calls) {
			const description = call[1] as string;
			expect(description).toBeTruthy();
			expect(typeof description).toBe("string");
			expect(description.length).toBeGreaterThan(10);
		}
	});
});
