import { describe, expect, it, vi } from "vitest";
import { type OperationRegistry, createOperationRegistry } from "../../../src/gateway/registry.js";
import { localCandidates } from "../../../src/routing/fallback.js";
import { fixtureRegistry } from "../gateway/fixtures.js";

describe("local routing fallback", () => {
	it("retrieves natural-language virtual machines without network or execution", () => {
		const callback = vi.fn();
		const registry = fixtureRegistry(callback);
		const candidates = localCandidates(registry, "Please show my virtual machines", undefined, 3);
		expect(candidates[0].op).toBe("instances_list_servers");
		for (const candidate of candidates) expect(candidate).toBe(registry.get(candidate.op));
		expect(callback).not.toHaveBeenCalled();
		expect(candidates[0]).not.toHaveProperty("probability");
		expect(candidates[0]).not.toHaveProperty("score");
	});
	it("honors toolsets, read-only filtering and exclusions even for a write intent", () => {
		const registry = fixtureRegistry(undefined, {
			toolsets: ["instances"],
			readOnly: true,
		});
		expect(localCandidates(registry, "Create a VM", undefined, 5).map((op) => op.op)).toEqual([
			"instances_list_servers",
		]);
		const excluded = fixtureRegistry(undefined, {
			toolsets: ["instances", "dns"],
			readOnly: true,
			excludeTools: ["scaleway_instances_list_servers"],
		});
		for (const candidate of localCandidates(excluded, "Show my VMs", undefined, 5)) {
			expect(candidate).toBe(excluded.get(candidate.op));
			expect(candidate.readOnly).toBe(true);
			expect(candidate.op).not.toBe("instances_list_servers");
		}
		expect(
			localCandidates({ operations: [], get: () => undefined }, "Show VMs", undefined, 5),
		).toEqual([]);
	});
	it.each(["", " ", "show me", "show me today's weather", "zxqv private jellyfish"])(
		"returns no suggestions for empty or irrelevant query %j",
		(intent) => {
			expect(localCandidates(fixtureRegistry(), intent, undefined, 3)).toEqual([]);
		},
	);
	it("uses resource context when the intent alone is underspecified", () => {
		const registry = createOperationRegistry();
		expect(
			localCandidates(
				registry,
				"List databases",
				"Inside an existing managed PostgreSQL instance",
				3,
			)[0].op,
		).toBe("rdb_list_databases");
		expect(localCandidates(registry, "Show", "Kubernetes clusters", 1)[0].op).toBe(
			"k8s_list_clusters",
		);
		expect(localCandidates(registry, "List Redis clusters", undefined, 1)[0].op).toBe(
			"redis_list_clusters",
		);
	});
	it("distinguishes virtual machines from bare-metal servers in the full catalog", () => {
		const registry = createOperationRegistry();
		for (const intent of ["Show my virtual machines", "List VMs"])
			expect(localCandidates(registry, intent, undefined, 3)[0].op).toBe("instances_list_servers");
		const generic = localCandidates(registry, "List servers", undefined, 5).map((op) => op.op);
		expect(generic).toContain("instances_list_servers");
		expect(generic).toContain("dedibox_list_servers");
	});
	it("breaks ties by operation ID independently of registry order and bounds the limit", () => {
		const template = fixtureRegistry().operations[0];
		const operations = Array.from({ length: 8 }, (_, index) => ({
			...template,
			op: `test_${index}_server`,
			area: "test",
			description: "Server lookup",
		}));
		const registry: OperationRegistry = {
			operations: [...operations].reverse(),
			get: (op) => operations.find((operation) => operation.op === op),
		};
		expect(localCandidates(registry, "server", undefined, 2).map((op) => op.op)).toEqual([
			"test_0_server",
			"test_1_server",
		]);
		expect(localCandidates(registry, "server", undefined, 99)).toHaveLength(5);
		for (const limit of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])
			expect(localCandidates(registry, "server", undefined, limit)).toEqual([]);
	});
});
