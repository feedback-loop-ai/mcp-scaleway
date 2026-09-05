/** Deterministic retrieval smoke set, not an LLM task-success benchmark. */
import { describe, expect, it } from "vitest";
import { searchOperations } from "../../../src/gateway/discovery.js";
import { createOperationRegistry } from "../../../src/gateway/registry.js";

const registry = createOperationRegistry();
const cases = [
	["rdb list databases", "rdb_list_databases"],
	["list kubernetes clusters", "k8s_list_clusters"],
	["object storage buckets", "object_storage_list_buckets"],
	["containers create container", "containers_create_container"],
	["functions create function", "functions_create_function"],
	["instances list servers", "instances_list_servers"],
	["instances create server", "instances_create_server"],
	["iam list users", "iam_list_users"],
	["dns list records", "dns_list_records"],
	["key manager list keys", "key_manager_list_keys"],
	["secret manager list secrets", "secret_manager_list_secrets"],
	["secret manager get secret version", "secret_manager_get_secret_version"],
	["sqs get info", "sqs_get_info"],
	["nats list accounts", "nats_list_accounts"],
	["lb list backends", "lb_list_backends"],
	["redis list clusters", "redis_list_clusters"],
	["registry list images", "registry_list_images"],
	["jobs list definitions", "jobs_list_definitions"],
	["billing list invoices", "billing_list_invoices"],
	["autoscaling list instance groups", "autoscaling_list_instance_groups"],
] as const;

describe("real operation keyword retrieval", () => {
	it.each(cases)("%s finds %s in the first page", (query, expected) => {
		const result = searchOperations(registry, { query });
		if (!("operations" in result)) throw new Error("Expected operation search results");
		expect(result.operations?.map((op) => op.op)).toContain(expected);
	});
});
