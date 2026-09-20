import { describe, expect, it } from "vitest";
import examples from "../../../src/gateway/examples.json";
import { createOperationRegistry } from "../../../src/gateway/registry.js";

const registry = createOperationRegistry();
const inputs: Record<string, Record<string, unknown>> = examples;
describe("required creation inputs from the source contract", () => {
	it.each([
		["cockpit_create_data_source", "type"],
		["jobs_create_definition", "local_storage_capacity"],
		["lb_create_backend", "health_check"],
		["mongodb_restore_snapshot", "volume_type"],
		["rdb_create_backup", "database_name"],
		["rdb_create_instance", "user_name"],
		["rdb_create_instance", "password"],
	])("%s requires %s before dispatch", async (id, field) => {
		const op = registry.get(id);
		if (!op) throw new Error("Missing operation");
		const valid = structuredClone(inputs[op.tool]);
		expect((await op.schema.safeParseAsync(valid)).success).toBe(true);
		delete valid[field];
		expect((await op.schema.safeParseAsync(valid)).success).toBe(false);
	});
	it("rejects nonexistent Functions runtimes and uses the source LB SSL enum", async () => {
		const fn = registry.get("functions_create_function");
		const lb = registry.get("lb_create_lb");
		if (!fn || !lb) throw new Error("Missing operation");
		expect(
			(await fn.schema.safeParseAsync({ ...inputs[fn.tool], runtime: "invented-runtime" })).success,
		).toBe(false);
		expect(
			(
				await lb.schema.safeParseAsync({
					...inputs[lb.tool],
					ssl_compatibility_level: "ssl_compatibility_level_old",
				})
			).success,
		).toBe(true);
		expect(
			(
				await lb.schema.safeParseAsync({
					...inputs[lb.tool],
					ssl_compatibility_level: "ssl_compatibility_level_old_backward",
				})
			).success,
		).toBe(false);
	});
});
