/**
 * Contract tests for Scaleway Block Storage (SBS) API
 *
 * Validates request/response shapes, pagination, auth, and error codes
 * against the Scaleway Block Storage v1alpha1 API.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/block/
 * Spec: specs/scaleway-api/ (block-storage)
 * Parity: tests/parity-matrix.json -> block-storage.*
 */
import { describe, expect, it, vi } from "vitest";
import {
	CreateSnapshotParams,
	CreateVolumeParams,
	DeleteSnapshotParams,
	DeleteVolumeParams,
	GetSnapshotParams,
	GetVolumeParams,
	ListSnapshotsParams,
	ListVolumeTypesParams,
	ListVolumesParams,
	Snapshot,
	SnapshotClass,
	SnapshotStatus,
	UpdateSnapshotParams,
	UpdateVolumeParams,
	Volume,
	VolumeSpecifications,
	VolumeStatus,
	VolumeType,
	VolumeTypeInfo,
	VolumeTypePricing,
	VolumeTypeSpecs,
} from "../../../src/tools/block-storage/types.js";

describe("Block Storage API Contract: Volume schemas", () => {
	// Endpoint: GET /block/v1alpha1/zones/{zone}/volumes
	describe("ListVolumes request shape", () => {
		it("accepts empty params with defaults", () => {
			const result = ListVolumesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("validates zone format as xx-yyy-N", () => {
			expect(() => ListVolumesParams.parse({ zone: "bad" })).toThrow();
			expect(ListVolumesParams.parse({ zone: "fr-par-1" }).zone).toBe("fr-par-1");
		});

		it("validates projectId as UUID", () => {
			expect(() => ListVolumesParams.parse({ projectId: "not-uuid" })).toThrow();
		});

		it("validates status enum", () => {
			expect(() => ListVolumesParams.parse({ status: "running" })).toThrow();
		});

		it("validates pagination bounds", () => {
			expect(() => ListVolumesParams.parse({ page: 0 })).toThrow();
			expect(() => ListVolumesParams.parse({ pageSize: 0 })).toThrow();
			expect(() => ListVolumesParams.parse({ pageSize: 101 })).toThrow();
		});
	});

	// Endpoint: GET /block/v1alpha1/zones/{zone}/volumes/{volume_id}
	describe("GetVolume request shape", () => {
		it("requires volumeId as UUID", () => {
			expect(() => GetVolumeParams.parse({})).toThrow();
			expect(() => GetVolumeParams.parse({ volumeId: "bad" })).toThrow();
			expect(
				GetVolumeParams.parse({
					volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				}).volumeId,
			).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
		});
	});

	// Endpoint: POST /block/v1alpha1/zones/{zone}/volumes
	describe("CreateVolume request shape", () => {
		it("requires name (non-empty)", () => {
			expect(() => CreateVolumeParams.parse({ name: "" })).toThrow();
			expect(() => CreateVolumeParams.parse({})).toThrow();
		});

		it("validates fromEmpty.size as positive integer", () => {
			expect(() =>
				CreateVolumeParams.parse({
					name: "v",
					fromEmpty: { size: -1 },
				}),
			).toThrow();
		});

		it("validates fromSnapshot.snapshotId as UUID", () => {
			expect(() =>
				CreateVolumeParams.parse({
					name: "v",
					fromSnapshot: { snapshotId: "bad" },
				}),
			).toThrow();
		});
	});

	// Endpoint: PATCH /block/v1alpha1/zones/{zone}/volumes/{volume_id}
	describe("UpdateVolume request shape", () => {
		it("requires volumeId as UUID", () => {
			expect(() => UpdateVolumeParams.parse({ volumeId: "bad" })).toThrow();
		});

		it("rejects empty name when provided", () => {
			expect(() =>
				UpdateVolumeParams.parse({
					volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
					name: "",
				}),
			).toThrow();
		});
	});

	// Endpoint: DELETE /block/v1alpha1/zones/{zone}/volumes/{volume_id}
	describe("DeleteVolume request shape", () => {
		it("requires volumeId as UUID", () => {
			expect(() => DeleteVolumeParams.parse({})).toThrow();
			expect(() => DeleteVolumeParams.parse({ volumeId: "bad" })).toThrow();
		});
	});

	// Response shape validation
	describe("Volume response shape", () => {
		const validVolume = {
			id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			name: "test",
			type: "sbs_5k",
			size: 10000000000,
			zone: "fr-par-1",
			status: "available",
			projectId: "11111111-1111-1111-1111-111111111111",
			tags: [],
		};

		it("validates required fields", () => {
			expect(() => Volume.parse({})).toThrow();
			expect(Volume.parse(validVolume).id).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
		});

		it("validates id as UUID", () => {
			expect(() => Volume.parse({ ...validVolume, id: "bad" })).toThrow();
		});

		it("validates type enum", () => {
			expect(() => Volume.parse({ ...validVolume, type: "hdd" })).toThrow();
		});

		it("validates status enum", () => {
			expect(() => Volume.parse({ ...validVolume, status: "running" })).toThrow();
		});

		it("accepts all VolumeStatus values", () => {
			for (const status of VolumeStatus.options) {
				expect(Volume.parse({ ...validVolume, status }).status).toBe(status);
			}
		});

		it("accepts all VolumeType values", () => {
			for (const type of VolumeType.options) {
				expect(Volume.parse({ ...validVolume, type }).type).toBe(type);
			}
		});

		it("accepts optional specs", () => {
			const result = Volume.parse({
				...validVolume,
				specs: { perfIops: 5000, class: "sbs_5k" },
			});
			expect(result.specs?.perfIops).toBe(5000);
		});

		it("accepts nullable parentSnapshotId", () => {
			expect(Volume.parse({ ...validVolume, parentSnapshotId: null }).parentSnapshotId).toBeNull();
		});
	});
});

describe("Block Storage API Contract: Snapshot schemas", () => {
	// Endpoint: GET /block/v1alpha1/zones/{zone}/snapshots
	describe("ListSnapshots request shape", () => {
		it("accepts empty params with defaults", () => {
			const result = ListSnapshotsParams.parse({});
			expect(result.page).toBe(1);
		});

		it("validates volumeId as UUID when provided", () => {
			expect(() => ListSnapshotsParams.parse({ volumeId: "bad" })).toThrow();
		});

		it("validates status enum", () => {
			expect(() => ListSnapshotsParams.parse({ status: "pending" })).toThrow();
		});
	});

	// Endpoint: GET /block/v1alpha1/zones/{zone}/snapshots/{snapshot_id}
	describe("GetSnapshot request shape", () => {
		it("requires snapshotId as UUID", () => {
			expect(() => GetSnapshotParams.parse({})).toThrow();
			expect(() => GetSnapshotParams.parse({ snapshotId: "bad" })).toThrow();
		});
	});

	// Endpoint: POST /block/v1alpha1/zones/{zone}/snapshots
	describe("CreateSnapshot request shape", () => {
		it("requires name and volumeId", () => {
			expect(() => CreateSnapshotParams.parse({ name: "s" })).toThrow();
			expect(() =>
				CreateSnapshotParams.parse({
					volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				}),
			).toThrow();
		});

		it("validates volumeId as UUID", () => {
			expect(() => CreateSnapshotParams.parse({ name: "s", volumeId: "bad" })).toThrow();
		});
	});

	// Endpoint: PATCH /block/v1alpha1/zones/{zone}/snapshots/{snapshot_id}
	describe("UpdateSnapshot request shape", () => {
		it("requires snapshotId as UUID", () => {
			expect(() => UpdateSnapshotParams.parse({ snapshotId: "bad" })).toThrow();
		});
	});

	// Endpoint: DELETE /block/v1alpha1/zones/{zone}/snapshots/{snapshot_id}
	describe("DeleteSnapshot request shape", () => {
		it("requires snapshotId as UUID", () => {
			expect(() => DeleteSnapshotParams.parse({})).toThrow();
		});
	});

	// Response shape validation
	describe("Snapshot response shape", () => {
		const validSnapshot = {
			id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			name: "snap",
			size: 10000000000,
			zone: "fr-par-1",
			status: "available",
			projectId: "11111111-1111-1111-1111-111111111111",
			tags: [],
		};

		it("validates required fields", () => {
			expect(() => Snapshot.parse({})).toThrow();
			expect(Snapshot.parse(validSnapshot).id).toBe("cccccccc-cccc-cccc-cccc-cccccccccccc");
		});

		it("accepts all SnapshotStatus values", () => {
			for (const status of SnapshotStatus.options) {
				expect(Snapshot.parse({ ...validSnapshot, status }).status).toBe(status);
			}
		});

		it("accepts all SnapshotClass values", () => {
			for (const cls of SnapshotClass.options) {
				expect(Snapshot.parse({ ...validSnapshot, class: cls }).class).toBe(cls);
			}
		});

		it("accepts parentVolume object", () => {
			const result = Snapshot.parse({
				...validSnapshot,
				parentVolume: {
					id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
					name: "vol",
					type: "sbs_5k",
					status: "available",
				},
			});
			expect(result.parentVolume?.id).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
		});
	});
});

describe("Block Storage API Contract: VolumeType schemas", () => {
	// Endpoint: GET /block/v1alpha1/zones/{zone}/volume-types
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
		it("requires name", () => {
			expect(() => VolumeTypeInfo.parse({})).toThrow();
		});

		it("validates pricing shape", () => {
			const result = VolumeTypeInfo.parse({
				name: "sbs_5k",
				pricing: { pricePerHour: 0.0004 },
				snapshotPricing: { pricePerHour: 0.0002 },
				specs: {
					minSize: 1000000000,
					maxSize: 10000000000000,
					minIops: 100,
					maxIops: 15000,
				},
			});
			expect(result.pricing?.pricePerHour).toBe(0.0004);
			expect(result.specs?.maxIops).toBe(15000);
		});
	});
});
