/**
 * Contract tests for Scaleway Block Storage (SBS) API — block/v1 (GA)
 *
 * Validates request/response shapes, pagination, auth, and error codes
 * against the GA Scaleway Block Storage v1 API.
 *
 * API Reference: specs/scaleway-api/block-storage/api-reference.md
 * Official docs: https://www.scaleway.com/en/developers/api/block/
 * Parity: tests/parity-matrix.json -> block-storage.*
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	BlockOrderBy,
	CreateSnapshotParams,
	CreateVolumeParams,
	DeleteSnapshotParams,
	DeleteVolumeParams,
	GetSnapshotParams,
	GetVolumeParams,
	ListSnapshotsParams,
	ListVolumeTypesParams,
	ListVolumesParams,
	Reference,
	Snapshot,
	SnapshotStatus,
	StorageClass,
	UpdateSnapshotParams,
	UpdateVolumeParams,
	Volume,
	VolumeSpecifications,
	VolumeStatus,
	VolumeTypeInfo,
} from "../../../src/tools/block-storage/types.js";

const VALID_UUID = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

describe("Block Storage API Contract: Volume schemas (block/v1)", () => {
	// Endpoint: GET /block/v1/zones/{zone}/volumes
	describe("ListVolumes request shape", () => {
		it("accepts empty params with defaults", () => {
			const result = ListVolumesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
			expect(result.includeDeleted).toBe(false);
		});

		it("validates zone format as xx-yyy-N", () => {
			expect(() => ListVolumesParams.parse({ zone: "bad" })).toThrow();
			expect(ListVolumesParams.parse({ zone: "fr-par-1" }).zone).toBe("fr-par-1");
		});

		it("validates projectId as UUID", () => {
			expect(() => ListVolumesParams.parse({ projectId: "not-uuid" })).toThrow();
		});

		it("validates orderBy enum", () => {
			expect(() => ListVolumesParams.parse({ orderBy: "size_asc" })).toThrow();
			expect(ListVolumesParams.parse({ orderBy: "name_desc" }).orderBy).toBe("name_desc");
		});

		it("accepts v1 filter fields (tags, productResourceId, volumeType)", () => {
			const result = ListVolumesParams.parse({
				tags: ["a", "b"],
				productResourceId: "instance-1",
				volumeType: "sbs_5k",
				includeDeleted: true,
			});
			expect(result.tags).toEqual(["a", "b"]);
			expect(result.includeDeleted).toBe(true);
		});

		it("validates pagination bounds", () => {
			expect(() => ListVolumesParams.parse({ page: 0 })).toThrow();
			expect(() => ListVolumesParams.parse({ pageSize: 0 })).toThrow();
			expect(() => ListVolumesParams.parse({ pageSize: 101 })).toThrow();
		});
	});

	// Endpoint: GET /block/v1/zones/{zone}/volumes/{volume_id}
	describe("GetVolume request shape", () => {
		it("requires volumeId as UUID", () => {
			expect(() => GetVolumeParams.parse({})).toThrow();
			expect(() => GetVolumeParams.parse({ volumeId: "bad" })).toThrow();
			expect(GetVolumeParams.parse({ volumeId: VALID_UUID }).volumeId).toBe(VALID_UUID);
		});
	});

	// Endpoint: POST /block/v1/zones/{zone}/volumes
	describe("CreateVolume request shape", () => {
		it("requires name (non-empty)", () => {
			expect(() => CreateVolumeParams.parse({ name: "" })).toThrow();
			expect(() => CreateVolumeParams.parse({})).toThrow();
		});

		it("validates fromEmpty.size as positive integer", () => {
			expect(() => CreateVolumeParams.parse({ name: "v", fromEmpty: { size: -1 } })).toThrow();
		});

		it("validates fromSnapshot.snapshotId as UUID", () => {
			expect(() =>
				CreateVolumeParams.parse({ name: "v", fromSnapshot: { snapshotId: "bad" } }),
			).toThrow();
		});

		it("accepts v1 kmsKeyId and perfIops", () => {
			const result = CreateVolumeParams.parse({
				name: "v",
				fromEmpty: { size: 1000000000 },
				perfIops: 15000,
				kmsKeyId: VALID_UUID,
			});
			expect(result.perfIops).toBe(15000);
			expect(result.kmsKeyId).toBe(VALID_UUID);
		});
	});

	// Endpoint: PATCH /block/v1/zones/{zone}/volumes/{volume_id}
	describe("UpdateVolume request shape", () => {
		it("requires volumeId as UUID", () => {
			expect(() => UpdateVolumeParams.parse({ volumeId: "bad" })).toThrow();
		});

		it("rejects empty name when provided", () => {
			expect(() => UpdateVolumeParams.parse({ volumeId: VALID_UUID, name: "" })).toThrow();
		});
	});

	// Endpoint: DELETE /block/v1/zones/{zone}/volumes/{volume_id}
	describe("DeleteVolume request shape", () => {
		it("requires volumeId as UUID", () => {
			expect(() => DeleteVolumeParams.parse({})).toThrow();
			expect(() => DeleteVolumeParams.parse({ volumeId: "bad" })).toThrow();
		});
	});

	// Response shape: scaleway.block.v1.Volume (returned directly, unwrapped)
	describe("Volume response shape", () => {
		const validVolume = {
			id: VALID_UUID,
			name: "test",
			type: "sbs_5k",
			size: 10000000000,
			project_id: "11111111-1111-1111-1111-111111111111",
			status: "available",
			tags: [],
			zone: "fr-par-1",
		};

		it("validates required fields", () => {
			expect(() => Volume.parse({})).toThrow();
			expect(Volume.parse(validVolume).id).toBe(VALID_UUID);
		});

		it("validates id as UUID", () => {
			expect(() => Volume.parse({ ...validVolume, id: "bad" })).toThrow();
		});

		it("accepts type as a free-form string (v1)", () => {
			expect(Volume.parse({ ...validVolume, type: "sbs_15k" }).type).toBe("sbs_15k");
		});

		it("validates status enum", () => {
			expect(() => Volume.parse({ ...validVolume, status: "running" })).toThrow();
		});

		it("accepts all VolumeStatus values", () => {
			for (const status of VolumeStatus.options) {
				expect(Volume.parse({ ...validVolume, status }).status).toBe(status);
			}
		});

		it("accepts optional specs with snake_case perf_iops", () => {
			const result = Volume.parse({
				...validVolume,
				specs: { perf_iops: 5000, class: "sbs" },
			});
			expect(result.specs?.perf_iops).toBe(5000);
		});

		it("accepts nullable parent_snapshot_id, last_detached_at, kms_key_id", () => {
			const result = Volume.parse({
				...validVolume,
				parent_snapshot_id: null,
				last_detached_at: null,
				kms_key_id: null,
			});
			expect(result.parent_snapshot_id).toBeNull();
		});

		it("accepts references array", () => {
			const result = Volume.parse({
				...validVolume,
				references: [
					{
						id: VALID_UUID,
						product_resource_type: "instance_server",
						product_resource_id: VALID_UUID,
						created_at: null,
						type: "exclusive",
						status: "attached",
					},
				],
			});
			expect(result.references?.[0].type).toBe("exclusive");
		});
	});
});

describe("Block Storage API Contract: Snapshot schemas (block/v1)", () => {
	// Endpoint: GET /block/v1/zones/{zone}/snapshots
	describe("ListSnapshots request shape", () => {
		it("accepts empty params with defaults", () => {
			const result = ListSnapshotsParams.parse({});
			expect(result.page).toBe(1);
			expect(result.includeDeleted).toBe(false);
		});

		it("validates volumeId as UUID when provided", () => {
			expect(() => ListSnapshotsParams.parse({ volumeId: "bad" })).toThrow();
		});

		it("validates orderBy enum", () => {
			expect(() => ListSnapshotsParams.parse({ orderBy: "bad" })).toThrow();
		});
	});

	// Endpoint: GET /block/v1/zones/{zone}/snapshots/{snapshot_id}
	describe("GetSnapshot request shape", () => {
		it("requires snapshotId as UUID", () => {
			expect(() => GetSnapshotParams.parse({})).toThrow();
			expect(() => GetSnapshotParams.parse({ snapshotId: "bad" })).toThrow();
		});
	});

	// Endpoint: POST /block/v1/zones/{zone}/snapshots
	describe("CreateSnapshot request shape", () => {
		it("requires name and volumeId", () => {
			expect(() => CreateSnapshotParams.parse({ name: "s" })).toThrow();
			expect(() => CreateSnapshotParams.parse({ volumeId: VALID_UUID })).toThrow();
		});

		it("validates volumeId as UUID", () => {
			expect(() => CreateSnapshotParams.parse({ name: "s", volumeId: "bad" })).toThrow();
		});

		it("accepts v1 public flag", () => {
			const result = CreateSnapshotParams.parse({
				name: "s",
				volumeId: VALID_UUID,
				public: true,
			});
			expect(result.public).toBe(true);
		});
	});

	// Endpoint: PATCH /block/v1/zones/{zone}/snapshots/{snapshot_id}
	describe("UpdateSnapshot request shape", () => {
		it("requires snapshotId as UUID", () => {
			expect(() => UpdateSnapshotParams.parse({ snapshotId: "bad" })).toThrow();
		});

		it("accepts v1 public flag", () => {
			const result = UpdateSnapshotParams.parse({ snapshotId: VALID_UUID, public: false });
			expect(result.public).toBe(false);
		});
	});

	// Endpoint: DELETE /block/v1/zones/{zone}/snapshots/{snapshot_id}
	describe("DeleteSnapshot request shape", () => {
		it("requires snapshotId as UUID", () => {
			expect(() => DeleteSnapshotParams.parse({})).toThrow();
		});
	});

	// Response shape: scaleway.block.v1.Snapshot
	describe("Snapshot response shape", () => {
		const validSnapshot = {
			id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			name: "snap",
			size: 10000000000,
			project_id: "11111111-1111-1111-1111-111111111111",
			status: "available",
			tags: [],
			zone: "fr-par-1",
		};

		it("validates required fields", () => {
			expect(() => Snapshot.parse({})).toThrow();
			expect(Snapshot.parse(validSnapshot).id).toBe("cccccccc-cccc-cccc-cccc-cccccccccccc");
		});

		it("accepts all SnapshotStatus values (incl. exporting)", () => {
			for (const status of SnapshotStatus.options) {
				expect(Snapshot.parse({ ...validSnapshot, status }).status).toBe(status);
			}
		});

		it("accepts all StorageClass values", () => {
			for (const cls of StorageClass.options) {
				expect(Snapshot.parse({ ...validSnapshot, class: cls }).class).toBe(cls);
			}
		});

		it("accepts parent_volume object", () => {
			const result = Snapshot.parse({
				...validSnapshot,
				parent_volume: {
					id: VALID_UUID,
					name: "vol",
					type: "sbs_5k",
					status: "available",
				},
			});
			expect(result.parent_volume?.id).toBe(VALID_UUID);
		});

		it("accepts null parent_volume and public flag", () => {
			const result = Snapshot.parse({ ...validSnapshot, parent_volume: null, public: true });
			expect(result.parent_volume).toBeNull();
			expect(result.public).toBe(true);
		});
	});
});

describe("Block Storage API Contract: VolumeType schemas (block/v1)", () => {
	// Endpoint: GET /block/v1/zones/{zone}/volume-types
	describe("ListVolumeTypes request shape", () => {
		it("accepts empty params with defaults", () => {
			const result = ListVolumeTypesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates zone format", () => {
			expect(() => ListVolumeTypesParams.parse({ zone: "bad" })).toThrow();
		});
	});

	describe("VolumeTypeInfo response shape", () => {
		it("requires type", () => {
			expect(() => VolumeTypeInfo.parse({})).toThrow();
		});

		it("validates v1 pricing (Money) and specs shape", () => {
			const result = VolumeTypeInfo.parse({
				type: "sbs_5k",
				pricing: { currency_code: "EUR", units: 0, nanos: 400000 },
				snapshot_pricing: { currency_code: "EUR", units: 0, nanos: 200000 },
				specs: { perf_iops: 5000, class: "sbs" },
				zone: "fr-par-1",
			});
			expect(result.pricing?.nanos).toBe(400000);
			expect(result.specs?.perf_iops).toBe(5000);
		});
	});
});

describe("Block Storage API Contract: pagination & list envelopes", () => {
	// Response: scaleway.block.v1.ListVolumesResponse
	it("validates ListVolumes response envelope", () => {
		const ListVolumesResponse = z.object({
			volumes: z.array(Volume),
			total_count: z.number().int(),
		});
		const validVolume = {
			id: VALID_UUID,
			name: "v",
			type: "sbs_5k",
			size: 1000000000,
			project_id: "11111111-1111-1111-1111-111111111111",
			status: "available",
			tags: [],
			zone: "fr-par-1",
		};
		expect(() =>
			ListVolumesResponse.parse({ volumes: [validVolume], total_count: 1 }),
		).not.toThrow();
		expect(() => ListVolumesResponse.parse({ volumes: [], total_count: 0 })).not.toThrow();
	});

	// Response: scaleway.block.v1.ListSnapshotsResponse
	it("validates ListSnapshots response envelope", () => {
		const ListSnapshotsResponse = z.object({
			snapshots: z.array(Snapshot),
			total_count: z.number().int(),
		});
		expect(() => ListSnapshotsResponse.parse({ snapshots: [], total_count: 0 })).not.toThrow();
	});

	// Response: scaleway.block.v1.ListVolumeTypesResponse
	it("validates ListVolumeTypes response envelope", () => {
		const ListVolumeTypesResponse = z.object({
			volume_types: z.array(VolumeTypeInfo),
			total_count: z.number().int(),
		});
		expect(() =>
			ListVolumeTypesResponse.parse({ volume_types: [{ type: "sbs_5k" }], total_count: 1 }),
		).not.toThrow();
	});

	it("applies default pagination values", () => {
		const result = ListVolumesParams.parse({});
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});
});

describe("Block Storage API Contract: enums & shared types", () => {
	it("BlockOrderBy matches v1 order_by values", () => {
		expect(BlockOrderBy.options).toEqual([
			"created_at_asc",
			"created_at_desc",
			"name_asc",
			"name_desc",
		]);
	});

	it("Reference validates v1 type/status enums", () => {
		expect(() =>
			Reference.parse({
				id: VALID_UUID,
				product_resource_type: "instance_server",
				product_resource_id: VALID_UUID,
				type: "read_only",
				status: "detaching",
			}),
		).not.toThrow();
	});

	it("VolumeSpecifications accepts nullable perf_iops", () => {
		expect(VolumeSpecifications.parse({ perf_iops: null }).perf_iops).toBeNull();
	});
});
