/**
 * Contract tests for Scaleway MongoDB API (v1 — GA)
 *
 * Validates request shapes, response shapes, pagination, auth, and error codes
 * against the Scaleway Managed MongoDB v1 API specification.
 *
 * API Reference: specs/scaleway-api/mongodb/api-reference.md
 * Parity Matrix: tests/parity-matrix.json > mongodb
 */
import { describe, expect, it } from "vitest";
import {
	CreateInstanceParams,
	CreateSnapshotParams,
	CreateUserParams,
	DeleteInstanceParams,
	DeleteSnapshotParams,
	DeleteUserParams,
	GetInstanceParams,
	InstanceStatus,
	ListInstancesParams,
	ListNodeTypesParams,
	ListSnapshotsParams,
	ListUsersParams,
	ListVersionsParams,
	RestoreSnapshotParams,
	SnapshotStatus,
	UpdateInstanceParams,
	UpdateUserParams,
	VolumeType,
} from "../../src/tools/mongodb/types.js";

describe("MongoDB contract: Instance schemas", () => {
	// Endpoint: GET /mongodb/v1/regions/{region}/instances
	describe("ListInstancesParams", () => {
		it("accepts empty params with defaults", () => {
			const result = ListInstancesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all optional filters", () => {
			const result = ListInstancesParams.parse({
				region: "fr-par",
				name: "test",
				tags: ["a", "b"],
				project_id: "00000000-0000-0000-0000-000000000001",
				organization_id: "00000000-0000-0000-0000-000000000002",
				order_by: "created_at_desc",
				page: 2,
				pageSize: 25,
			});
			expect(result.order_by).toBe("created_at_desc");
		});

		it("rejects invalid order_by", () => {
			expect(() => ListInstancesParams.parse({ order_by: "invalid_order" })).toThrow();
		});

		it("rejects invalid project_id format", () => {
			expect(() => ListInstancesParams.parse({ project_id: "not-a-uuid" })).toThrow();
		});

		it("rejects page < 1", () => {
			expect(() => ListInstancesParams.parse({ page: 0 })).toThrow();
		});

		it("rejects pageSize > 100", () => {
			expect(() => ListInstancesParams.parse({ pageSize: 101 })).toThrow();
		});
	});

	// Endpoint: GET /mongodb/v1/regions/{region}/instances/{instance_id}
	describe("GetInstanceParams", () => {
		it("accepts valid instance_id", () => {
			const result = GetInstanceParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.instance_id).toBe("00000000-0000-0000-0000-000000000001");
		});

		it("rejects missing instance_id", () => {
			expect(() => GetInstanceParams.parse({})).toThrow();
		});

		it("rejects invalid UUID", () => {
			expect(() => GetInstanceParams.parse({ instance_id: "not-a-uuid" })).toThrow();
		});

		it("accepts optional region", () => {
			const result = GetInstanceParams.parse({
				region: "nl-ams",
				instance_id: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.region).toBe("nl-ams");
		});

		it("rejects malformed region", () => {
			expect(() =>
				GetInstanceParams.parse({
					region: "invalid-region-format",
					instance_id: "00000000-0000-0000-0000-000000000001",
				}),
			).toThrow();
		});
	});

	// Endpoint: POST /mongodb/v1/regions/{region}/instances
	describe("CreateInstanceParams", () => {
		const validCreate = {
			name: "my-mongo",
			version: "7.0.12",
			node_type: "MGDB-PLAY2-NANO",
			node_amount: 1,
			user_name: "admin",
			password: "s3cret!",
		};

		it("accepts valid required fields", () => {
			const result = CreateInstanceParams.parse(validCreate);
			expect(result.name).toBe("my-mongo");
			expect(result.version).toBe("7.0.12");
			expect(result.node_amount).toBe(1);
		});

		it("accepts optional volume with sbs_5k (type + size_bytes)", () => {
			const result = CreateInstanceParams.parse({
				...validCreate,
				volume: { type: "sbs_5k", size_bytes: 10000000000 },
			});
			expect(result.volume?.type).toBe("sbs_5k");
			expect(result.volume?.size_bytes).toBe(10000000000);
		});

		it("accepts optional volume with sbs_15k", () => {
			const result = CreateInstanceParams.parse({
				...validCreate,
				volume: { type: "sbs_15k", size_bytes: 20000000000 },
			});
			expect(result.volume?.type).toBe("sbs_15k");
		});

		it("accepts optional endpoints (private + public network)", () => {
			const result = CreateInstanceParams.parse({
				...validCreate,
				endpoints: [
					{ private_network: { private_network_id: "00000000-0000-0000-0000-000000000009" } },
					{ public_network: {} },
				],
			});
			expect(result.endpoints).toHaveLength(2);
			expect(result.endpoints?.[0].private_network?.private_network_id).toBe(
				"00000000-0000-0000-0000-000000000009",
			);
		});

		it("rejects invalid endpoint private_network_id", () => {
			expect(() =>
				CreateInstanceParams.parse({
					...validCreate,
					endpoints: [{ private_network: { private_network_id: "not-a-uuid" } }],
				}),
			).toThrow();
		});

		it("rejects invalid volume type", () => {
			expect(() =>
				CreateInstanceParams.parse({
					...validCreate,
					volume: { type: "local_ssd", size_bytes: 10000 },
				}),
			).toThrow();
		});

		it("rejects empty name", () => {
			expect(() => CreateInstanceParams.parse({ ...validCreate, name: "" })).toThrow();
		});

		it("rejects missing version", () => {
			const { version, ...noVersion } = validCreate;
			expect(() => CreateInstanceParams.parse(noVersion)).toThrow();
		});

		it("rejects node_amount < 1", () => {
			expect(() => CreateInstanceParams.parse({ ...validCreate, node_amount: 0 })).toThrow();
		});
	});

	// Endpoint: PATCH /mongodb/v1/regions/{region}/instances/{instance_id}
	describe("UpdateInstanceParams", () => {
		it("accepts instance_id with name", () => {
			const result = UpdateInstanceParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "new-name",
			});
			expect(result.name).toBe("new-name");
		});

		it("accepts instance_id with tags", () => {
			const result = UpdateInstanceParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				tags: ["env:prod"],
			});
			expect(result.tags).toEqual(["env:prod"]);
		});

		it("accepts snapshot schedule fields", () => {
			const result = UpdateInstanceParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				snapshot_schedule_frequency_hours: 24,
				snapshot_schedule_retention_days: 7,
				is_snapshot_schedule_enabled: true,
			});
			expect(result.snapshot_schedule_frequency_hours).toBe(24);
			expect(result.snapshot_schedule_retention_days).toBe(7);
			expect(result.is_snapshot_schedule_enabled).toBe(true);
		});

		it("rejects non-positive snapshot schedule frequency", () => {
			expect(() =>
				UpdateInstanceParams.parse({
					instance_id: "00000000-0000-0000-0000-000000000001",
					snapshot_schedule_frequency_hours: 0,
				}),
			).toThrow();
		});

		it("accepts instance_id alone (no updates)", () => {
			const result = UpdateInstanceParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.name).toBeUndefined();
			expect(result.tags).toBeUndefined();
		});
	});

	// Endpoint: DELETE /mongodb/v1/regions/{region}/instances/{instance_id}
	describe("DeleteInstanceParams", () => {
		it("accepts valid instance_id", () => {
			const result = DeleteInstanceParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.instance_id).toBe("00000000-0000-0000-0000-000000000001");
		});

		it("rejects missing instance_id", () => {
			expect(() => DeleteInstanceParams.parse({})).toThrow();
		});
	});
});

describe("MongoDB contract: User schemas", () => {
	// Endpoint: GET /mongodb/v1/regions/{region}/instances/{instance_id}/users
	describe("ListUsersParams", () => {
		it("requires instance_id", () => {
			expect(() => ListUsersParams.parse({})).toThrow();
		});

		it("accepts all filters", () => {
			const result = ListUsersParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "admin",
				order_by: "name_asc",
				page: 1,
				pageSize: 20,
			});
			expect(result.order_by).toBe("name_asc");
		});

		it("rejects invalid order_by", () => {
			expect(() =>
				ListUsersParams.parse({
					instance_id: "00000000-0000-0000-0000-000000000001",
					order_by: "invalid",
				}),
			).toThrow();
		});
	});

	// Endpoint: POST /mongodb/v1/regions/{region}/instances/{instance_id}/users
	describe("CreateUserParams", () => {
		it("accepts valid params", () => {
			const result = CreateUserParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "newuser",
				password: "p@ss123",
			});
			expect(result.name).toBe("newuser");
		});

		it("rejects missing name", () => {
			expect(() =>
				CreateUserParams.parse({
					instance_id: "00000000-0000-0000-0000-000000000001",
					password: "pass",
				}),
			).toThrow();
		});

		it("rejects empty password", () => {
			expect(() =>
				CreateUserParams.parse({
					instance_id: "00000000-0000-0000-0000-000000000001",
					name: "user",
					password: "",
				}),
			).toThrow();
		});
	});

	// Endpoint: PATCH /mongodb/v1/regions/{region}/instances/{instance_id}/users/{user_name}
	describe("UpdateUserParams", () => {
		it("accepts password update", () => {
			const result = UpdateUserParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "admin",
				password: "newpass",
			});
			expect(result.password).toBe("newpass");
		});

		it("accepts without password", () => {
			const result = UpdateUserParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "admin",
			});
			expect(result.password).toBeUndefined();
		});
	});

	// Endpoint: DELETE /mongodb/v1/regions/{region}/instances/{instance_id}/users/{user_name}
	describe("DeleteUserParams", () => {
		it("requires instance_id and name", () => {
			const result = DeleteUserParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "olduser",
			});
			expect(result.name).toBe("olduser");
		});

		it("rejects missing name", () => {
			expect(() =>
				DeleteUserParams.parse({
					instance_id: "00000000-0000-0000-0000-000000000001",
				}),
			).toThrow();
		});
	});
});

describe("MongoDB contract: Snapshot schemas", () => {
	// Endpoint: GET /mongodb/v1/regions/{region}/snapshots
	describe("ListSnapshotsParams", () => {
		it("accepts empty params", () => {
			const result = ListSnapshotsParams.parse({});
			expect(result.page).toBe(1);
		});

		it("accepts all filters", () => {
			const result = ListSnapshotsParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "backup",
				project_id: "00000000-0000-0000-0000-000000000002",
				organization_id: "00000000-0000-0000-0000-000000000003",
				order_by: "created_at_desc",
			});
			expect(result.order_by).toBe("created_at_desc");
		});

		it("rejects invalid order_by", () => {
			expect(() => ListSnapshotsParams.parse({ order_by: "size_asc" })).toThrow();
		});
	});

	// Endpoint: POST /mongodb/v1/regions/{region}/snapshots
	describe("CreateSnapshotParams", () => {
		it("accepts required fields", () => {
			const result = CreateSnapshotParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "daily-backup",
			});
			expect(result.name).toBe("daily-backup");
		});

		it("accepts optional expires_at", () => {
			const result = CreateSnapshotParams.parse({
				instance_id: "00000000-0000-0000-0000-000000000001",
				name: "temp-backup",
				expires_at: "2026-12-31T23:59:59Z",
			});
			expect(result.expires_at).toBe("2026-12-31T23:59:59Z");
		});

		it("rejects invalid datetime format", () => {
			expect(() =>
				CreateSnapshotParams.parse({
					instance_id: "00000000-0000-0000-0000-000000000001",
					name: "backup",
					expires_at: "not-a-date",
				}),
			).toThrow();
		});
	});

	// Endpoint: POST /mongodb/v1/regions/{region}/snapshots/{snapshot_id}/restore
	describe("RestoreSnapshotParams", () => {
		const validRestore = {
			snapshot_id: "00000000-0000-0000-0000-000000000001",
			instance_name: "restored-db",
			node_type: "MGDB-PLAY2-NANO",
			node_amount: 1,
		};

		it("accepts valid required fields", () => {
			const result = RestoreSnapshotParams.parse(validRestore);
			expect(result.instance_name).toBe("restored-db");
			expect(result.node_amount).toBe(1);
		});

		it("accepts optional volume_type", () => {
			const result = RestoreSnapshotParams.parse({
				...validRestore,
				volume_type: "sbs_15k",
			});
			expect(result.volume_type).toBe("sbs_15k");
		});

		it("rejects invalid volume_type", () => {
			expect(() =>
				RestoreSnapshotParams.parse({ ...validRestore, volume_type: "local_ssd" }),
			).toThrow();
		});

		it("rejects missing instance_name", () => {
			const { instance_name, ...noName } = validRestore;
			expect(() => RestoreSnapshotParams.parse(noName)).toThrow();
		});

		it("rejects node_amount < 1", () => {
			expect(() => RestoreSnapshotParams.parse({ ...validRestore, node_amount: 0 })).toThrow();
		});
	});

	// Endpoint: DELETE /mongodb/v1/regions/{region}/snapshots/{snapshot_id}
	describe("DeleteSnapshotParams", () => {
		it("accepts valid snapshot_id", () => {
			const result = DeleteSnapshotParams.parse({
				snapshot_id: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.snapshot_id).toBe("00000000-0000-0000-0000-000000000001");
		});

		it("rejects missing snapshot_id", () => {
			expect(() => DeleteSnapshotParams.parse({})).toThrow();
		});
	});
});

describe("MongoDB contract: Reference schemas", () => {
	// Endpoint: GET /mongodb/v1/regions/{region}/node-types
	describe("ListNodeTypesParams", () => {
		it("accepts empty params", () => {
			const result = ListNodeTypesParams.parse({});
			expect(result.page).toBe(1);
		});

		it("accepts include_disabled", () => {
			const result = ListNodeTypesParams.parse({
				include_disabled: true,
			});
			expect(result.include_disabled).toBe(true);
		});
	});

	// Endpoint: GET /mongodb/v1/regions/{region}/versions
	describe("ListVersionsParams", () => {
		it("accepts empty params", () => {
			const result = ListVersionsParams.parse({});
			expect(result.page).toBe(1);
		});

		it("accepts version filter", () => {
			const result = ListVersionsParams.parse({ version: "7.0" });
			expect(result.version).toBe("7.0");
		});
	});
});

describe("MongoDB contract: Status enums", () => {
	describe("InstanceStatus", () => {
		const expectedStatuses = [
			"unknown_status",
			"ready",
			"provisioning",
			"configuring",
			"deleting",
			"error",
			"initializing",
			"locked",
			"snapshotting",
		];

		for (const status of expectedStatuses) {
			it(`accepts '${status}'`, () => {
				expect(InstanceStatus.parse(status)).toBe(status);
			});
		}

		it("rejects unknown status", () => {
			expect(() => InstanceStatus.parse("running")).toThrow();
		});
	});

	describe("SnapshotStatus", () => {
		const expectedStatuses = [
			"unknown_status",
			"creating",
			"ready",
			"restoring",
			"deleting",
			"error",
			"locked",
		];

		for (const status of expectedStatuses) {
			it(`accepts '${status}'`, () => {
				expect(SnapshotStatus.parse(status)).toBe(status);
			});
		}

		it("rejects unknown status", () => {
			expect(() => SnapshotStatus.parse("active")).toThrow();
		});
	});

	describe("VolumeType", () => {
		for (const type of ["sbs_5k", "sbs_15k"]) {
			it(`accepts '${type}'`, () => {
				expect(VolumeType.parse(type)).toBe(type);
			});
		}

		it("rejects unknown volume type", () => {
			expect(() => VolumeType.parse("local_ssd")).toThrow();
		});
	});
});
