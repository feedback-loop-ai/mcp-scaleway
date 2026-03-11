/**
 * Contract tests for Scaleway Managed Database (RDB) API.
 *
 * These tests validate the Zod schemas and input/output shapes against
 * the Scaleway RDB API specification (specs/scaleway-api/rdb/).
 *
 * Scaleway API Reference: https://www.scaleway.com/en/developers/api/managed-database-postgre-mysql/
 * Regional API: POST/GET/PATCH/DELETE https://api.scaleway.com/rdb/v1/regions/{region}/...
 */
import { describe, expect, it } from "vitest";
import {
	AddAclRulesInput,
	CreateBackupInput,
	CreateDatabaseInput,
	CreateEndpointInput,
	CreateInstanceInput,
	CreateSnapshotInput,
	CreateUserInput,
	DeleteAclRulesInput,
	DeleteDatabaseInput,
	DeleteEndpointInput,
	DeleteInstanceInput,
	DeleteUserInput,
	GetInstanceInput,
	ListAclRulesInput,
	ListBackupsInput,
	ListDatabaseEnginesInput,
	ListDatabasesInput,
	ListEndpointsInput,
	ListInstancesInput,
	ListNodeTypesInput,
	ListSnapshotsInput,
	ListUsersInput,
	RdbAclRule,
	RdbAclRuleAction,
	RdbAclRuleDirection,
	RdbAclRuleProtocol,
	RdbBackup,
	RdbBackupSchedule,
	RdbBackupStatus,
	RdbDatabase,
	RdbDatabaseEngine,
	RdbEndpoint,
	RdbInstance,
	RdbInstanceStatus,
	RdbNodeType,
	RdbSnapshot,
	RdbSnapshotStatus,
	RdbUser,
	RdbVolume,
	RestoreBackupInput,
	RestoreSnapshotInput,
	UpdateInstanceInput,
	UpdateUserInput,
	UpgradeInstanceInput,
} from "../../src/tools/rdb/types.js";

// --- Entity schema validation ---

describe("RDB entity schemas", () => {
	// Spec: GET /rdb/v1/regions/{region}/instances/{instance_id}
	describe("RdbInstance", () => {
		it("validates a complete instance object", () => {
			const instance = {
				id: "d1e3c6e2-4f3a-4b5e-9d1a-2b3c4d5e6f7a",
				name: "my-postgresql",
				engine: "PostgreSQL-15",
				node_type: "db-dev-s",
				status: "ready",
				region: "fr-par",
				project_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
				is_ha_cluster: false,
				volume: { type: "lssd", size: 10000000000 },
				endpoints: [
					{
						id: "ep-123",
						ip: "51.159.1.1",
						port: 5432,
						name: "public",
					},
				],
				backup_schedule: { frequency: 24, retention: 7, disabled: false },
				tags: ["env:production"],
				created_at: "2026-01-15T10:30:00.000Z",
			};
			expect(RdbInstance.parse(instance)).toEqual(instance);
		});

		it("validates a minimal instance object", () => {
			const instance = {
				id: "abc-123",
				name: "minimal-db",
				engine: "MySQL-8",
				node_type: "db-play2-pico",
				status: "provisioning",
				region: "nl-ams",
				project_id: "proj-1",
				is_ha_cluster: true,
			};
			expect(RdbInstance.parse(instance)).toEqual(instance);
		});

		it("rejects invalid status", () => {
			expect(() =>
				RdbInstance.parse({
					id: "x",
					name: "x",
					engine: "x",
					node_type: "x",
					status: "invalid_status",
					region: "x",
					project_id: "x",
					is_ha_cluster: false,
				}),
			).toThrow();
		});
	});

	describe("RdbInstanceStatus", () => {
		it("validates all known statuses", () => {
			const statuses = [
				"unknown",
				"ready",
				"provisioning",
				"configuring",
				"deleting",
				"error",
				"autohealing",
				"locked",
				"initializing",
				"disk_full",
				"backuping",
				"snapshotting",
			];
			for (const s of statuses) {
				expect(RdbInstanceStatus.parse(s)).toBe(s);
			}
		});
	});

	describe("RdbVolume", () => {
		it("validates volume", () => {
			expect(RdbVolume.parse({ type: "lssd", size: 5000000000 })).toEqual({
				type: "lssd",
				size: 5000000000,
			});
		});
	});

	describe("RdbBackupSchedule", () => {
		it("validates schedule", () => {
			expect(RdbBackupSchedule.parse({ frequency: 24, retention: 7, disabled: false })).toEqual({
				frequency: 24,
				retention: 7,
				disabled: false,
			});
		});
	});

	describe("RdbEndpoint", () => {
		it("validates a complete endpoint", () => {
			const ep = { id: "ep-1", ip: "10.0.0.1", port: 5432, name: "private" };
			expect(RdbEndpoint.parse(ep)).toEqual(ep);
		});

		it("validates a minimal endpoint", () => {
			expect(RdbEndpoint.parse({ id: "ep-1", port: 3306 })).toEqual({
				id: "ep-1",
				port: 3306,
			});
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/instances/{instance_id}/databases
	describe("RdbDatabase", () => {
		it("validates a database object", () => {
			const db = { name: "mydb", owner: "admin", managed: false, size: 1048576 };
			expect(RdbDatabase.parse(db)).toEqual(db);
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/instances/{instance_id}/users
	describe("RdbUser", () => {
		it("validates a user object", () => {
			expect(RdbUser.parse({ name: "admin", is_admin: true })).toEqual({
				name: "admin",
				is_admin: true,
			});
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/backups
	describe("RdbBackup", () => {
		it("validates a complete backup", () => {
			const backup = {
				id: "bak-1",
				instance_id: "inst-1",
				name: "daily-2026-01-15",
				status: "ready",
				size: 50000000,
				created_at: "2026-01-15T02:00:00Z",
				expires_at: "2026-02-15T02:00:00Z",
				database_name: "mydb",
				instance_name: "my-postgresql",
				region: "fr-par",
			};
			expect(RdbBackup.parse(backup)).toEqual(backup);
		});

		it("validates a minimal backup", () => {
			expect(
				RdbBackup.parse({
					id: "bak-1",
					instance_id: "inst-1",
					name: "snap",
					status: "creating",
				}),
			).toBeTruthy();
		});
	});

	describe("RdbBackupStatus", () => {
		it("validates all backup statuses", () => {
			const statuses = [
				"unknown",
				"creating",
				"ready",
				"restoring",
				"deleting",
				"error",
				"exporting",
				"locked",
			];
			for (const s of statuses) {
				expect(RdbBackupStatus.parse(s)).toBe(s);
			}
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/instances/{instance_id}/acls
	describe("RdbAclRule", () => {
		it("validates a complete ACL rule", () => {
			const rule = {
				ip: "10.0.0.0/8",
				port: 5432,
				protocol: "tcp",
				direction: "inbound",
				action: "allow",
				description: "Private network access",
			};
			expect(RdbAclRule.parse(rule)).toEqual(rule);
		});

		it("validates a minimal ACL rule", () => {
			expect(
				RdbAclRule.parse({
					ip: "0.0.0.0/0",
					direction: "inbound",
					action: "allow",
				}),
			).toBeTruthy();
		});
	});

	describe("RdbAclRuleDirection", () => {
		it("validates directions", () => {
			expect(RdbAclRuleDirection.parse("inbound")).toBe("inbound");
			expect(RdbAclRuleDirection.parse("outbound")).toBe("outbound");
		});
	});

	describe("RdbAclRuleAction", () => {
		it("validates actions", () => {
			expect(RdbAclRuleAction.parse("allow")).toBe("allow");
			expect(RdbAclRuleAction.parse("deny")).toBe("deny");
		});
	});

	describe("RdbAclRuleProtocol", () => {
		it("validates protocols", () => {
			expect(RdbAclRuleProtocol.parse("tcp")).toBe("tcp");
			expect(RdbAclRuleProtocol.parse("udp")).toBe("udp");
			expect(RdbAclRuleProtocol.parse("icmp")).toBe("icmp");
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/snapshots
	describe("RdbSnapshot", () => {
		it("validates a complete snapshot", () => {
			const snapshot = {
				id: "snap-1",
				instance_id: "inst-1",
				name: "pre-upgrade-snapshot",
				status: "ready",
				size: 100000000,
				created_at: "2026-01-15T10:00:00Z",
				instance_name: "my-postgresql",
				node_type: "db-dev-s",
				region: "fr-par",
				expires_at: "2026-04-15T10:00:00Z",
			};
			expect(RdbSnapshot.parse(snapshot)).toEqual(snapshot);
		});

		it("validates a minimal snapshot", () => {
			expect(
				RdbSnapshot.parse({
					id: "snap-1",
					instance_id: "inst-1",
					name: "snap",
					status: "creating",
				}),
			).toBeTruthy();
		});
	});

	describe("RdbSnapshotStatus", () => {
		it("validates all snapshot statuses", () => {
			const statuses = ["unknown", "creating", "ready", "restoring", "deleting", "error", "locked"];
			for (const s of statuses) {
				expect(RdbSnapshotStatus.parse(s)).toBe(s);
			}
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/node-types
	describe("RdbNodeType", () => {
		it("validates a complete node type", () => {
			const nodeType = {
				name: "db-dev-s",
				stock_status: "available",
				description: "Development small",
				vcpus: 2,
				memory: 2147483648,
				disabled: false,
				region: "fr-par",
			};
			expect(RdbNodeType.parse(nodeType)).toEqual(nodeType);
		});

		it("validates a minimal node type", () => {
			expect(RdbNodeType.parse({ name: "db-gp-m", stock_status: "available" })).toBeTruthy();
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/database-engines
	describe("RdbDatabaseEngine", () => {
		it("validates a complete engine", () => {
			const engine = {
				name: "PostgreSQL",
				default_version: "15",
				versions: [
					{
						version: "15",
						name: "PostgreSQL 15",
						end_of_life: "2027-11-11",
						available_settings: [{ name: "max_connections", default_value: "100", type: "INT" }],
					},
				],
			};
			expect(RdbDatabaseEngine.parse(engine)).toEqual(engine);
		});

		it("validates engine with minimal version info", () => {
			expect(
				RdbDatabaseEngine.parse({
					name: "MySQL",
					default_version: "8",
					versions: [{ version: "8", name: "MySQL 8" }],
				}),
			).toBeTruthy();
		});
	});
});

// --- Input schema validation ---

describe("RDB input schemas", () => {
	// Spec: GET /rdb/v1/regions/{region}/instances
	describe("ListInstancesInput", () => {
		it("accepts empty input (all defaults)", () => {
			const result = ListInstancesInput.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all parameters", () => {
			const input = {
				region: "fr-par",
				page: 2,
				pageSize: 25,
				project_id: "proj-1",
				name: "mydb",
				order_by: "name_asc" as const,
				tags: ["env:prod"],
			};
			expect(ListInstancesInput.parse(input)).toMatchObject(input);
		});

		it("rejects invalid region format", () => {
			expect(() => ListInstancesInput.parse({ region: "invalid" })).toThrow();
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/instances/{instance_id}
	describe("GetInstanceInput", () => {
		it("accepts instance_id", () => {
			expect(GetInstanceInput.parse({ instance_id: "inst-1" })).toEqual({
				instance_id: "inst-1",
			});
		});

		it("accepts region and instance_id", () => {
			expect(GetInstanceInput.parse({ region: "nl-ams", instance_id: "inst-1" })).toEqual({
				region: "nl-ams",
				instance_id: "inst-1",
			});
		});

		it("rejects missing instance_id", () => {
			expect(() => GetInstanceInput.parse({})).toThrow();
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/instances
	describe("CreateInstanceInput", () => {
		it("accepts minimal create params", () => {
			const input = {
				name: "mydb",
				engine: "PostgreSQL-15",
				node_type: "db-dev-s",
			};
			expect(CreateInstanceInput.parse(input)).toMatchObject(input);
		});

		it("accepts all create params", () => {
			const input = {
				region: "fr-par",
				project_id: "proj-1",
				name: "mydb",
				engine: "PostgreSQL-15",
				node_type: "db-dev-s",
				is_ha_cluster: true,
				disable_backup: false,
				volume_type: "lssd" as const,
				volume_size: 10000000000,
				user_name: "admin",
				password: "secret",
				tags: ["env:prod"],
				backup_same_region: true,
				init_endpoints: [
					{
						private_network: {
							private_network_id: "pn-123",
							service_ip: "10.0.0.1/24",
						},
					},
				],
			};
			expect(CreateInstanceInput.parse(input)).toMatchObject(input);
		});

		it("rejects missing required fields", () => {
			expect(() => CreateInstanceInput.parse({ name: "x" })).toThrow();
		});
	});

	// Spec: PATCH /rdb/v1/regions/{region}/instances/{instance_id}
	describe("UpdateInstanceInput", () => {
		it("accepts instance_id only", () => {
			expect(UpdateInstanceInput.parse({ instance_id: "inst-1" })).toMatchObject({
				instance_id: "inst-1",
			});
		});

		it("accepts all update fields", () => {
			const input = {
				instance_id: "inst-1",
				name: "new-name",
				tags: ["updated"],
				backup_schedule_frequency: 12,
				backup_schedule_retention: 14,
				is_backup_schedule_disabled: false,
				backup_same_region: true,
			};
			expect(UpdateInstanceInput.parse(input)).toMatchObject(input);
		});
	});

	// Spec: DELETE /rdb/v1/regions/{region}/instances/{instance_id}
	describe("DeleteInstanceInput", () => {
		it("accepts instance_id", () => {
			expect(DeleteInstanceInput.parse({ instance_id: "inst-1" })).toEqual({
				instance_id: "inst-1",
			});
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/instances/{instance_id}/upgrade
	describe("UpgradeInstanceInput", () => {
		it("accepts instance_id only", () => {
			expect(UpgradeInstanceInput.parse({ instance_id: "inst-1" })).toMatchObject({
				instance_id: "inst-1",
			});
		});

		it("accepts all upgrade options", () => {
			const input = {
				instance_id: "inst-1",
				node_type: "db-gp-l",
				enable_ha: true,
				volume_size: 100000000000,
				volume_type: "bssd" as const,
				upgradable_version_id: "ver-1",
				major_upgrade_workflow: {
					upgradable_version_id: "ver-1",
					with_endpoints: true,
				},
			};
			expect(UpgradeInstanceInput.parse(input)).toMatchObject(input);
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/instances/{instance_id}/databases
	describe("ListDatabasesInput", () => {
		it("requires instance_id", () => {
			expect(() => ListDatabasesInput.parse({})).toThrow();
		});

		it("accepts all params", () => {
			const input = {
				instance_id: "inst-1",
				name: "mydb",
				managed: true,
				owner: "admin",
				order_by: "size_desc" as const,
			};
			expect(ListDatabasesInput.parse(input)).toMatchObject(input);
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/instances/{instance_id}/databases
	describe("CreateDatabaseInput", () => {
		it("requires instance_id and name", () => {
			expect(CreateDatabaseInput.parse({ instance_id: "inst-1", name: "newdb" })).toMatchObject({
				instance_id: "inst-1",
				name: "newdb",
			});
		});

		it("rejects missing name", () => {
			expect(() => CreateDatabaseInput.parse({ instance_id: "inst-1" })).toThrow();
		});
	});

	// Spec: DELETE /rdb/v1/regions/{region}/instances/{instance_id}/databases/{name}
	describe("DeleteDatabaseInput", () => {
		it("requires instance_id and name", () => {
			expect(DeleteDatabaseInput.parse({ instance_id: "inst-1", name: "mydb" })).toMatchObject({
				instance_id: "inst-1",
				name: "mydb",
			});
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/instances/{instance_id}/users
	describe("ListUsersInput", () => {
		it("requires instance_id", () => {
			expect(() => ListUsersInput.parse({})).toThrow();
		});

		it("accepts all params", () => {
			const input = {
				instance_id: "inst-1",
				name: "admin",
				order_by: "is_admin_desc" as const,
			};
			expect(ListUsersInput.parse(input)).toMatchObject(input);
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/instances/{instance_id}/users
	describe("CreateUserInput", () => {
		it("requires instance_id, name, password", () => {
			expect(
				CreateUserInput.parse({
					instance_id: "inst-1",
					name: "user1",
					password: "pass",
				}),
			).toMatchObject({ name: "user1" });
		});

		it("accepts is_admin option", () => {
			expect(
				CreateUserInput.parse({
					instance_id: "inst-1",
					name: "admin2",
					password: "pass",
					is_admin: true,
				}),
			).toMatchObject({ is_admin: true });
		});
	});

	// Spec: PATCH /rdb/v1/regions/{region}/instances/{instance_id}/users/{name}
	describe("UpdateUserInput", () => {
		it("requires instance_id and name", () => {
			expect(UpdateUserInput.parse({ instance_id: "inst-1", name: "user1" })).toMatchObject({
				name: "user1",
			});
		});

		it("accepts password and is_admin", () => {
			expect(
				UpdateUserInput.parse({
					instance_id: "inst-1",
					name: "user1",
					password: "new",
					is_admin: true,
				}),
			).toMatchObject({ password: "new", is_admin: true });
		});
	});

	// Spec: DELETE /rdb/v1/regions/{region}/instances/{instance_id}/users/{name}
	describe("DeleteUserInput", () => {
		it("requires instance_id and name", () => {
			expect(DeleteUserInput.parse({ instance_id: "inst-1", name: "user1" })).toMatchObject({
				name: "user1",
			});
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/backups
	describe("ListBackupsInput", () => {
		it("accepts empty input", () => {
			const result = ListBackupsInput.parse({});
			expect(result.page).toBe(1);
		});

		it("accepts all filter params", () => {
			const input = {
				instance_id: "inst-1",
				name: "daily",
				order_by: "created_at_desc" as const,
				project_id: "proj-1",
			};
			expect(ListBackupsInput.parse(input)).toMatchObject(input);
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/backups
	describe("CreateBackupInput", () => {
		it("requires instance_id and name", () => {
			expect(CreateBackupInput.parse({ instance_id: "inst-1", name: "backup-1" })).toMatchObject({
				instance_id: "inst-1",
			});
		});

		it("accepts optional fields", () => {
			expect(
				CreateBackupInput.parse({
					instance_id: "inst-1",
					name: "backup-1",
					database_name: "mydb",
					expires_at: "2026-12-31T00:00:00Z",
				}),
			).toMatchObject({ database_name: "mydb" });
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/backups/{backup_id}/restore
	describe("RestoreBackupInput", () => {
		it("requires backup_id and instance_id", () => {
			expect(RestoreBackupInput.parse({ backup_id: "bak-1", instance_id: "inst-1" })).toMatchObject(
				{ backup_id: "bak-1" },
			);
		});

		it("accepts database_name", () => {
			expect(
				RestoreBackupInput.parse({
					backup_id: "bak-1",
					instance_id: "inst-1",
					database_name: "target_db",
				}),
			).toMatchObject({ database_name: "target_db" });
		});
	});

	// Spec: Endpoints are retrieved from instance object
	describe("ListEndpointsInput", () => {
		it("requires instance_id", () => {
			expect(() => ListEndpointsInput.parse({})).toThrow();
		});

		it("accepts instance_id and region", () => {
			expect(ListEndpointsInput.parse({ instance_id: "inst-1", region: "fr-par" })).toMatchObject({
				instance_id: "inst-1",
			});
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/instances/{instance_id}/endpoints
	describe("CreateEndpointInput", () => {
		it("requires instance_id and endpoint_spec", () => {
			expect(
				CreateEndpointInput.parse({
					instance_id: "inst-1",
					endpoint_spec: { load_balancer: true },
				}),
			).toMatchObject({ instance_id: "inst-1" });
		});

		it("accepts private network spec", () => {
			const input = {
				instance_id: "inst-1",
				endpoint_spec: {
					private_network: {
						private_network_id: "pn-123",
						service_ip: "10.0.0.1/24",
					},
				},
			};
			expect(CreateEndpointInput.parse(input)).toMatchObject(input);
		});
	});

	// Spec: DELETE /rdb/v1/regions/{region}/endpoints/{endpoint_id}
	describe("DeleteEndpointInput", () => {
		it("requires endpoint_id", () => {
			expect(DeleteEndpointInput.parse({ endpoint_id: "ep-1" })).toMatchObject({
				endpoint_id: "ep-1",
			});
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/instances/{instance_id}/acls
	describe("ListAclRulesInput", () => {
		it("requires instance_id", () => {
			expect(() => ListAclRulesInput.parse({})).toThrow();
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/instances/{instance_id}/acls
	describe("AddAclRulesInput", () => {
		it("requires instance_id and rules", () => {
			expect(
				AddAclRulesInput.parse({
					instance_id: "inst-1",
					rules: [{ ip: "10.0.0.0/8" }],
				}),
			).toMatchObject({ instance_id: "inst-1" });
		});

		it("accepts description in rules", () => {
			expect(
				AddAclRulesInput.parse({
					instance_id: "inst-1",
					rules: [
						{ ip: "10.0.0.0/8", description: "Private" },
						{ ip: "192.168.0.0/16", description: "LAN" },
					],
				}).rules,
			).toHaveLength(2);
		});
	});

	// Spec: DELETE /rdb/v1/regions/{region}/instances/{instance_id}/acls
	describe("DeleteAclRulesInput", () => {
		it("requires instance_id and acl_rule_ips", () => {
			expect(
				DeleteAclRulesInput.parse({
					instance_id: "inst-1",
					acl_rule_ips: ["10.0.0.0/8"],
				}),
			).toMatchObject({ acl_rule_ips: ["10.0.0.0/8"] });
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/snapshots
	describe("ListSnapshotsInput", () => {
		it("accepts empty input", () => {
			const result = ListSnapshotsInput.parse({});
			expect(result.page).toBe(1);
		});

		it("accepts all filter params", () => {
			const input = {
				instance_id: "inst-1",
				name: "snap",
				order_by: "name_asc" as const,
				project_id: "proj-1",
			};
			expect(ListSnapshotsInput.parse(input)).toMatchObject(input);
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/snapshots
	describe("CreateSnapshotInput", () => {
		it("requires instance_id and name", () => {
			expect(CreateSnapshotInput.parse({ instance_id: "inst-1", name: "snap-1" })).toMatchObject({
				instance_id: "inst-1",
			});
		});

		it("accepts expires_at", () => {
			expect(
				CreateSnapshotInput.parse({
					instance_id: "inst-1",
					name: "snap-1",
					expires_at: "2026-12-31T00:00:00Z",
				}),
			).toMatchObject({ expires_at: "2026-12-31T00:00:00Z" });
		});
	});

	// Spec: POST /rdb/v1/regions/{region}/snapshots/{snapshot_id}/create-instance-from-snapshot
	describe("RestoreSnapshotInput", () => {
		it("requires snapshot_id and instance_name", () => {
			expect(
				RestoreSnapshotInput.parse({
					snapshot_id: "snap-1",
					instance_name: "restored-db",
				}),
			).toMatchObject({ snapshot_id: "snap-1" });
		});

		it("accepts node_type and is_ha_cluster", () => {
			expect(
				RestoreSnapshotInput.parse({
					snapshot_id: "snap-1",
					instance_name: "restored-db",
					node_type: "db-gp-m",
					is_ha_cluster: true,
				}),
			).toMatchObject({ node_type: "db-gp-m", is_ha_cluster: true });
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/node-types
	describe("ListNodeTypesInput", () => {
		it("accepts empty input", () => {
			expect(ListNodeTypesInput.parse({})).toEqual({});
		});

		it("accepts include_disabled_types", () => {
			expect(
				ListNodeTypesInput.parse({
					region: "fr-par",
					include_disabled_types: true,
				}),
			).toMatchObject({ include_disabled_types: true });
		});
	});

	// Spec: GET /rdb/v1/regions/{region}/database-engines
	describe("ListDatabaseEnginesInput", () => {
		it("accepts empty input", () => {
			expect(ListDatabaseEnginesInput.parse({})).toEqual({});
		});

		it("accepts name and version filters", () => {
			expect(
				ListDatabaseEnginesInput.parse({
					region: "fr-par",
					name: "PostgreSQL",
					version: "15",
				}),
			).toMatchObject({ name: "PostgreSQL", version: "15" });
		});
	});
});
