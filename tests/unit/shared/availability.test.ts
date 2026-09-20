import { describe, expect, it, vi } from "vitest";
import { describeOperations, searchOperations } from "../../../src/gateway/discovery.js";
import { createOperationRegistry, registerFlatTools } from "../../../src/gateway/registry.js";
import { type DecisionRequest, createIntentRouter } from "../../../src/routing/index.js";
import { operationAvailability } from "../../../src/shared/availability.js";
import manifest from "../../../src/shared/unavailable-operations.json";
import { server } from "../gateway/fixtures.js";

const registry = createOperationRegistry();
const blocked = new Set(Object.keys(manifest));

describe("explicit unavailable operation metadata", () => {
	it.each(Object.keys(manifest))("retains %s in discovery with documented restrictions", (tool) => {
		const op = tool.replace(/^scaleway_/, "");
		expect(registry.get(op)).toBeDefined();
		expect(describeOperations(registry, { ops: [op] })).toMatchObject({
			operations: [
				{
					op,
					availability: {
						status: "unavailable",
						reason: expect.any(String),
						migration: expect.any(String),
						sources: expect.any(Array),
					},
				},
			],
		});
		expect(searchOperations(registry, { query: op, limit: 1 })).toMatchObject({
			operations: [
				expect.objectContaining({
					op,
					availability: expect.objectContaining({ status: "unavailable" }),
				}),
			],
		});
	});
	it("adds flat description notices while leaving ordinary operations compact", () => {
		const tools = registerFlatTools(server(), createOperationRegistry({ toolsets: ["cockpit"] }));
		expect(
			tools.find((tool) => tool.name === "scaleway_cockpit_get_cockpit")?.description,
		).toContain("Temporarily unavailable:");
		const [tool] = Object.keys(manifest);
		const availability = operationAvailability(tool);
		if (!availability) throw new Error("Expected manifest entry");
		availability.sources.push("modified");
		expect(operationAvailability(tool)?.sources).not.toContain("modified");
		expect(operationAvailability("scaleway_instances_list_servers")).toBeUndefined();
		expect(describeOperations(registry, { ops: ["instances_list_servers"] })).not.toHaveProperty(
			"operations.0.availability",
		);
	});
	it("excludes unavailable operations from both provider choices and local suggestions", async () => {
		const choose = vi.fn(async (request: DecisionRequest) => {
			for (const id of Object.keys(request.choices))
				expect(blocked.has(`scaleway_${id}`)).toBe(false);
			const choice = "cockpit" in request.choices ? "cockpit" : "cockpit_list_data_sources";
			return {
				choice,
				confidence: 1,
				probabilities: Object.fromEntries(
					Object.keys(request.choices).map((id) => [id, id === choice ? 1 : 0]),
				),
			};
		});
		const filtered = createOperationRegistry({ toolsets: ["cockpit"] });
		const provider = await createIntentRouter(filtered, { provider: { choose } }).route({
			intent: "list cockpit data sources",
		});
		expect(provider.candidates[0].op).toBe("cockpit_list_data_sources");
		expect(choose).toHaveBeenCalledTimes(2);
		const local = await createIntentRouter(filtered, {}).route({ intent: "get cockpit" });
		for (const candidate of local.candidates)
			expect(blocked.has(`scaleway_${candidate.op}`)).toBe(false);
	});
	it("does not call a provider when configured operations are all unavailable", async () => {
		const choose = vi.fn();
		const onlyUnavailable = {
			...registry,
			operations: registry.operations.filter((op) => blocked.has(op.tool)),
		};
		const result = await createIntentRouter(onlyUnavailable, { provider: { choose } }).route({
			intent: "activate cockpit",
		});
		expect(result).toMatchObject({
			status: "unavailable",
			source: "local",
			reason: "no_available_operations",
			candidates: [],
			providerCalls: 0,
		});
		expect(choose).not.toHaveBeenCalled();
	});
});
