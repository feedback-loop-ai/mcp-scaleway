import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as handlers from "../../../src/tools/block-storage/handlers.js";
import { registerBlockStorageTools } from "../../../src/tools/block-storage/index.js";
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
	Money,
	Reference,
	ReferenceStatus,
	ReferenceType,
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

// Mock shared modules
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCW-ACCESS-KEY",
		secretKey: "SCW-SECRET-KEY",
		defaultProjectId: "11111111-1111-1111-1111-111111111111",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

const mockFetch = vi.fn();
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({
		fetch: (...args: unknown[]) => mockFetch(...args),
	}),
}));

describe("block-storage module", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerBlockStorageTools(server)).not.toThrow();
	});
});

describe("block-storage types", () => {
	describe("VolumeStatus", () => {
		it("accepts all v1 statuses including updating", () => {
			for (const status of [
				"unknown_status",
				"creating",
				"available",
				"in_use",
				"deleting",
				"deleted",
				"resizing",
				"error",
				"snapshotting",
				"locked",
				"updating",
			]) {
				expect(VolumeStatus.parse(status)).toBe(status);
			}
		});

		it("rejects invalid status", () => {
			expect(() => VolumeStatus.parse("running")).toThrow();
		});
	});

	describe("SnapshotStatus", () => {
		it("accepts all v1 statuses including exporting", () => {
			for (const s of [
				"unknown_status",
				"creating",
				"available",
				"error",
				"deleting",
				"deleted",
				"in_use",
				"locked",
				"exporting",
			]) {
				expect(SnapshotStatus.parse(s)).toBe(s);
			}
		});

		it("rejects invalid status", () => {
			expect(() => SnapshotStatus.parse("pending")).toThrow();
		});
	});

	describe("StorageClass", () => {
		it("accepts v1 storage classes", () => {
			for (const c of ["unknown_storage_class", "unspecified", "bssd", "sbs"]) {
				expect(StorageClass.parse(c)).toBe(c);
			}
		});

		it("rejects old v1alpha1 class values", () => {
			expect(() => StorageClass.parse("instant")).toThrow();
		});
	});

	describe("ReferenceType / ReferenceStatus", () => {
		it("accepts reference type values", () => {
			for (const t of ["unknown_type", "link", "exclusive", "read_only"]) {
				expect(ReferenceType.parse(t)).toBe(t);
			}
		});

		it("accepts reference status values", () => {
			for (const s of [
				"unknown_status",
				"attaching",
				"attached",
				"detaching",
				"detached",
				"creating",
				"error",
			]) {
				expect(ReferenceStatus.parse(s)).toBe(s);
			}
		});
	});

	describe("BlockOrderBy", () => {
		it("accepts ordering values", () => {
			for (const o of ["created_at_asc", "created_at_desc", "name_asc", "name_desc"]) {
				expect(BlockOrderBy.parse(o)).toBe(o);
			}
		});

		it("rejects invalid ordering", () => {
			expect(() => BlockOrderBy.parse("size_asc")).toThrow();
		});
	});

	describe("Reference", () => {
		it("parses a reference", () => {
			const result = Reference.parse({
				id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
				product_resource_type: "instance_server",
				product_resource_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
				created_at: "2025-01-01T00:00:00Z",
				type: "exclusive",
				status: "attached",
			});
			expect(result.type).toBe("exclusive");
		});
	});

	describe("VolumeSpecifications", () => {
		it("parses full specs", () => {
			const result = VolumeSpecifications.parse({ perf_iops: 5000, class: "sbs" });
			expect(result.perf_iops).toBe(5000);
			expect(result.class).toBe("sbs");
		});

		it("parses null perf_iops and empty specs", () => {
			const result = VolumeSpecifications.parse({ perf_iops: null });
			expect(result.perf_iops).toBeNull();
			expect(VolumeSpecifications.parse({}).class).toBeUndefined();
		});
	});

	describe("Volume", () => {
		it("parses a full volume with snake_case fields", () => {
			const result = Volume.parse({
				id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				name: "test-vol",
				type: "sbs_5k",
				size: 10000000000,
				project_id: "11111111-1111-1111-1111-111111111111",
				created_at: "2025-01-01T00:00:00Z",
				updated_at: "2025-01-01T00:00:00Z",
				references: [
					{
						id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
						product_resource_type: "instance_server",
						product_resource_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
						created_at: null,
						type: "exclusive",
						status: "attached",
					},
				],
				parent_snapshot_id: null,
				status: "available",
				tags: ["env:test"],
				zone: "fr-par-1",
				specs: { perf_iops: 5000, class: "sbs" },
				last_detached_at: null,
				kms_key_id: null,
			});
			expect(result.id).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
			expect(result.references?.[0].status).toBe("attached");
		});

		it("parses a minimal volume", () => {
			const result = Volume.parse({
				id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				name: "min-vol",
				type: "sbs_15k",
				size: 5000000000,
				project_id: "11111111-1111-1111-1111-111111111111",
				status: "creating",
				tags: [],
				zone: "fr-par-1",
			});
			expect(result.specs).toBeUndefined();
			expect(result.references).toBeUndefined();
		});
	});

	describe("Snapshot", () => {
		it("parses a full snapshot", () => {
			const result = Snapshot.parse({
				id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
				name: "test-snap",
				parent_volume: {
					id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
					name: "parent-vol",
					type: "sbs_5k",
					status: "available",
				},
				size: 10000000000,
				project_id: "11111111-1111-1111-1111-111111111111",
				created_at: "2025-01-01T00:00:00Z",
				updated_at: "2025-01-01T00:00:00Z",
				references: [],
				status: "available",
				tags: ["backup"],
				zone: "fr-par-1",
				class: "sbs",
				public: false,
			});
			expect(result.class).toBe("sbs");
			expect(result.parent_volume?.name).toBe("parent-vol");
		});

		it("parses snapshot with null parent_volume", () => {
			const result = Snapshot.parse({
				id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
				name: "min-snap",
				parent_volume: null,
				size: 5000000000,
				project_id: "11111111-1111-1111-1111-111111111111",
				status: "creating",
				tags: [],
				zone: "nl-ams-1",
			});
			expect(result.parent_volume).toBeNull();
			expect(result.public).toBeUndefined();
		});
	});

	describe("Money / VolumeTypeInfo", () => {
		it("parses money", () => {
			const result = Money.parse({ currency_code: "EUR", units: 0, nanos: 400000 });
			expect(result.currency_code).toBe("EUR");
		});

		it("parses full volume type info", () => {
			const result = VolumeTypeInfo.parse({
				type: "sbs_5k",
				pricing: { currency_code: "EUR", units: 0, nanos: 400000 },
				snapshot_pricing: { currency_code: "EUR", units: 0, nanos: 200000 },
				specs: { perf_iops: 5000, class: "sbs" },
				zone: "fr-par-1",
			});
			expect(result.type).toBe("sbs_5k");
			expect(result.specs?.perf_iops).toBe(5000);
		});

		it("parses minimal volume type info", () => {
			const result = VolumeTypeInfo.parse({ type: "sbs_15k" });
			expect(result.pricing).toBeUndefined();
		});
	});

	describe("ListVolumesParams", () => {
		it("applies defaults", () => {
			const result = ListVolumesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
			expect(result.includeDeleted).toBe(false);
		});

		it("accepts all filter fields", () => {
			const result = ListVolumesParams.parse({
				zone: "nl-ams-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				organizationId: "22222222-2222-2222-2222-222222222222",
				name: "my-vol",
				orderBy: "name_asc",
				tags: ["env:prod"],
				productResourceId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
				volumeType: "sbs_5k",
				includeDeleted: true,
				page: 2,
				pageSize: 10,
			});
			expect(result.orderBy).toBe("name_asc");
			expect(result.includeDeleted).toBe(true);
		});

		it("rejects invalid zone format", () => {
			expect(() => ListVolumesParams.parse({ zone: "invalid" })).toThrow();
		});
	});

	describe("GetVolumeParams", () => {
		it("parses valid params", () => {
			const result = GetVolumeParams.parse({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect(result.volumeId).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
		});

		it("rejects non-uuid volumeId", () => {
			expect(() => GetVolumeParams.parse({ volumeId: "not-a-uuid" })).toThrow();
		});
	});

	describe("CreateVolumeParams", () => {
		it("parses from empty", () => {
			const result = CreateVolumeParams.parse({
				name: "new-vol",
				fromEmpty: { size: 10000000000 },
			});
			expect(result.fromEmpty?.size).toBe(10000000000);
		});

		it("parses from snapshot", () => {
			const result = CreateVolumeParams.parse({
				name: "snap-vol",
				fromSnapshot: {
					snapshotId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
					size: 20000000000,
				},
			});
			expect(result.fromSnapshot?.snapshotId).toBe("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
		});

		it("parses with all optional fields", () => {
			const result = CreateVolumeParams.parse({
				name: "full-vol",
				zone: "fr-par-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				fromEmpty: { size: 10000000000 },
				perfIops: 5000,
				tags: ["env:prod"],
				kmsKeyId: "ffffffff-ffff-ffff-ffff-ffffffffffff",
			});
			expect(result.perfIops).toBe(5000);
			expect(result.kmsKeyId).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
		});

		it("rejects empty name", () => {
			expect(() => CreateVolumeParams.parse({ name: "" })).toThrow();
		});
	});

	describe("UpdateVolumeParams", () => {
		it("parses with all fields", () => {
			const result = UpdateVolumeParams.parse({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				name: "renamed",
				size: 20000000000,
				perfIops: 15000,
				tags: ["updated"],
			});
			expect(result.name).toBe("renamed");
		});

		it("parses with only required fields", () => {
			const result = UpdateVolumeParams.parse({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect(result.name).toBeUndefined();
		});
	});

	describe("DeleteVolumeParams", () => {
		it("parses valid params", () => {
			const result = DeleteVolumeParams.parse({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect(result.volumeId).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
		});
	});

	describe("ListSnapshotsParams", () => {
		it("applies defaults", () => {
			const result = ListSnapshotsParams.parse({});
			expect(result.page).toBe(1);
			expect(result.includeDeleted).toBe(false);
		});

		it("accepts all filter fields", () => {
			const result = ListSnapshotsParams.parse({
				zone: "fr-par-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				organizationId: "22222222-2222-2222-2222-222222222222",
				name: "snap",
				orderBy: "created_at_desc",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				tags: ["daily"],
				includeDeleted: true,
			});
			expect(result.volumeId).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
		});
	});

	describe("GetSnapshotParams", () => {
		it("parses valid params", () => {
			const result = GetSnapshotParams.parse({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});
			expect(result.snapshotId).toBe("cccccccc-cccc-cccc-cccc-cccccccccccc");
		});
	});

	describe("CreateSnapshotParams", () => {
		it("parses with all fields", () => {
			const result = CreateSnapshotParams.parse({
				name: "my-snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				zone: "fr-par-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				tags: ["daily"],
				public: true,
			});
			expect(result.public).toBe(true);
		});

		it("parses with only required fields", () => {
			const result = CreateSnapshotParams.parse({
				name: "min-snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect(result.tags).toBeUndefined();
		});
	});

	describe("UpdateSnapshotParams", () => {
		it("parses with all fields", () => {
			const result = UpdateSnapshotParams.parse({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
				name: "renamed-snap",
				tags: ["updated"],
				public: false,
			});
			expect(result.name).toBe("renamed-snap");
		});

		it("parses with only required fields", () => {
			const result = UpdateSnapshotParams.parse({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});
			expect(result.name).toBeUndefined();
		});
	});

	describe("DeleteSnapshotParams", () => {
		it("parses valid params", () => {
			const result = DeleteSnapshotParams.parse({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});
			expect(result.snapshotId).toBe("cccccccc-cccc-cccc-cccc-cccccccccccc");
		});
	});

	describe("ListVolumeTypesParams", () => {
		it("applies defaults", () => {
			const result = ListVolumeTypesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts zone", () => {
			const result = ListVolumeTypesParams.parse({ zone: "fr-par-1" });
			expect(result.zone).toBe("fr-par-1");
		});
	});
});

describe("block-storage handlers", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("listVolumes", () => {
		it("returns paginated volumes and targets block/v1 path", async () => {
			mockFetch.mockResolvedValueOnce({
				volumes: [{ id: "vol-1", name: "test" }],
				total_count: 1,
			});

			const result = await handlers.listVolumes({ page: 1, pageSize: 50, includeDeleted: false });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.path).toBe("/block/v1/zones/fr-par-1/volumes");
			expect(callArgs.urlParams.get("include_deleted")).toBe("false");
		});

		it("passes filter params", async () => {
			mockFetch.mockResolvedValueOnce({ volumes: [], total_count: 0 });

			await handlers.listVolumes({
				page: 1,
				pageSize: 10,
				zone: "nl-ams-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				organizationId: "22222222-2222-2222-2222-222222222222",
				name: "my-vol",
				orderBy: "name_asc",
				tags: ["env:prod"],
				productResourceId: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
				volumeType: "sbs_5k",
				includeDeleted: true,
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("project_id")).toBe("11111111-1111-1111-1111-111111111111");
			expect(callArgs.urlParams.get("organization_id")).toBe(
				"22222222-2222-2222-2222-222222222222",
			);
			expect(callArgs.urlParams.get("name")).toBe("my-vol");
			expect(callArgs.urlParams.get("order_by")).toBe("name_asc");
			expect(callArgs.urlParams.get("tags")).toBe("env:prod");
			expect(callArgs.urlParams.get("product_resource_id")).toBe(
				"eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
			);
			expect(callArgs.urlParams.get("volume_type")).toBe("sbs_5k");
			expect(callArgs.urlParams.get("include_deleted")).toBe("true");
			expect(callArgs.path).toContain("nl-ams-1");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			const result = await handlers.listVolumes({ page: 1, pageSize: 50, includeDeleted: false });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("getVolume", () => {
		it("returns volume details directly (unwrapped)", async () => {
			mockFetch.mockResolvedValueOnce({
				id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				name: "test-vol",
			});

			const result = await handlers.getVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
			expect(mockFetch.mock.calls[0][0].path).toBe(
				"/block/v1/zones/fr-par-1/volumes/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			);
		});

		it("uses specified zone", async () => {
			mockFetch.mockResolvedValueOnce({ id: "v1" });

			await handlers.getVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				zone: "nl-ams-1",
			});

			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams-1");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(Object.assign(new Error("Not found"), { statusCode: 404 }));

			const result = await handlers.getVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect("isError" in result && result.isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("createVolume", () => {
		it("creates volume from empty", async () => {
			mockFetch.mockResolvedValueOnce({ id: "new-vol", name: "test" });

			const result = await handlers.createVolume({
				name: "test",
				fromEmpty: { size: 10000000000 },
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("new-vol");

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.from_empty.size).toBe(10000000000);
			expect(body.project_id).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("creates volume from snapshot with size override", async () => {
			mockFetch.mockResolvedValueOnce({ id: "snap-vol" });

			await handlers.createVolume({
				name: "snap-vol",
				fromSnapshot: {
					snapshotId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
					size: 20000000000,
				},
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.from_snapshot.snapshot_id).toBe("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
			expect(body.from_snapshot.size).toBe(20000000000);
		});

		it("creates volume from snapshot without size override", async () => {
			mockFetch.mockResolvedValueOnce({ id: "snap-vol" });

			await handlers.createVolume({
				name: "snap-vol",
				fromSnapshot: { snapshotId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" },
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.from_snapshot.size).toBeUndefined();
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValueOnce({ id: "v1" });

			await handlers.createVolume({
				name: "full-vol",
				zone: "fr-par-1",
				projectId: "22222222-2222-2222-2222-222222222222",
				perfIops: 5000,
				tags: ["env:prod"],
				kmsKeyId: "ffffffff-ffff-ffff-ffff-ffffffffffff",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("22222222-2222-2222-2222-222222222222");
			expect(body.perf_iops).toBe(5000);
			expect(body.tags).toEqual(["env:prod"]);
			expect(body.kms_key_id).toBe("ffffffff-ffff-ffff-ffff-ffffffffffff");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("create failed"));

			const result = await handlers.createVolume({
				name: "fail-vol",
				fromEmpty: { size: 10000000000 },
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("updateVolume", () => {
		it("updates volume fields", async () => {
			mockFetch.mockResolvedValueOnce({ id: "v1", name: "updated" });

			const result = await handlers.updateVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				name: "updated",
				size: 20000000000,
				perfIops: 15000,
				tags: ["new-tag"],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("updated");
			expect(body.size).toBe(20000000000);
			expect(body.perf_iops).toBe(15000);
			expect(body.tags).toEqual(["new-tag"]);

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("updated");
		});

		it("sends empty body when no optional fields", async () => {
			mockFetch.mockResolvedValueOnce({ id: "v1" });

			await handlers.updateVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(Object.keys(body)).toHaveLength(0);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("update failed"));

			const result = await handlers.updateVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("deleteVolume", () => {
		it("deletes volume successfully", async () => {
			mockFetch.mockResolvedValueOnce(undefined);

			const result = await handlers.deleteVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
			expect(parsed.volumeId).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(Object.assign(new Error("Forbidden"), { statusCode: 403 }));

			const result = await handlers.deleteVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect("isError" in result && result.isError).toBe(true);
			const errParsed = JSON.parse(result.content[0].text);
			expect(errParsed.error.type).toBe("permission_denied");
		});
	});

	describe("listSnapshots", () => {
		it("returns paginated snapshots", async () => {
			mockFetch.mockResolvedValueOnce({ snapshots: [{ id: "s1" }], total_count: 1 });

			const result = await handlers.listSnapshots({
				page: 1,
				pageSize: 50,
				includeDeleted: false,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(mockFetch.mock.calls[0][0].path).toBe("/block/v1/zones/fr-par-1/snapshots");
		});

		it("passes filter params", async () => {
			mockFetch.mockResolvedValueOnce({ snapshots: [], total_count: 0 });

			await handlers.listSnapshots({
				page: 1,
				pageSize: 10,
				zone: "fr-par-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				organizationId: "22222222-2222-2222-2222-222222222222",
				name: "snap",
				orderBy: "created_at_desc",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				tags: ["daily"],
				includeDeleted: true,
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("project_id")).toBe("11111111-1111-1111-1111-111111111111");
			expect(callArgs.urlParams.get("organization_id")).toBe(
				"22222222-2222-2222-2222-222222222222",
			);
			expect(callArgs.urlParams.get("volume_id")).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
			expect(callArgs.urlParams.get("name")).toBe("snap");
			expect(callArgs.urlParams.get("order_by")).toBe("created_at_desc");
			expect(callArgs.urlParams.get("tags")).toBe("daily");
			expect(callArgs.urlParams.get("include_deleted")).toBe("true");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("err"));

			const result = await handlers.listSnapshots({
				page: 1,
				pageSize: 50,
				includeDeleted: false,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("getSnapshot", () => {
		it("returns snapshot details directly", async () => {
			mockFetch.mockResolvedValueOnce({ id: "cccccccc-cccc-cccc-cccc-cccccccccccc" });

			const result = await handlers.getSnapshot({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("cccccccc-cccc-cccc-cccc-cccccccccccc");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.getSnapshot({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("createSnapshot", () => {
		it("creates snapshot", async () => {
			mockFetch.mockResolvedValueOnce({ id: "new-snap", name: "my-snap" });

			const result = await handlers.createSnapshot({
				name: "my-snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("new-snap");

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.volume_id).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
			expect(body.project_id).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValueOnce({ id: "s1" });

			await handlers.createSnapshot({
				name: "tagged-snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				projectId: "22222222-2222-2222-2222-222222222222",
				tags: ["daily"],
				public: true,
				zone: "nl-ams-1",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("22222222-2222-2222-2222-222222222222");
			expect(body.tags).toEqual(["daily"]);
			expect(body.public).toBe(true);
			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams-1");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.createSnapshot({
				name: "fail-snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("updateSnapshot", () => {
		it("updates snapshot fields", async () => {
			mockFetch.mockResolvedValueOnce({ id: "s1", name: "renamed" });

			const result = await handlers.updateSnapshot({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
				name: "renamed",
				tags: ["updated"],
				public: false,
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("renamed");
			expect(body.tags).toEqual(["updated"]);
			expect(body.public).toBe(false);

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("renamed");
		});

		it("sends empty body when no optional fields", async () => {
			mockFetch.mockResolvedValueOnce({ id: "s1" });

			await handlers.updateSnapshot({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(Object.keys(body)).toHaveLength(0);
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.updateSnapshot({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("deleteSnapshot", () => {
		it("deletes snapshot successfully", async () => {
			mockFetch.mockResolvedValueOnce(undefined);

			const result = await handlers.deleteSnapshot({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
			expect(parsed.snapshotId).toBe("cccccccc-cccc-cccc-cccc-cccccccccccc");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.deleteSnapshot({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("listVolumeTypes", () => {
		it("returns paginated volume types", async () => {
			mockFetch.mockResolvedValueOnce({
				volume_types: [{ type: "sbs_5k" }],
				total_count: 1,
			});

			const result = await handlers.listVolumeTypes({ page: 1, pageSize: 50 });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].type).toBe("sbs_5k");
			expect(mockFetch.mock.calls[0][0].path).toBe("/block/v1/zones/fr-par-1/volume-types");
		});

		it("uses specified zone", async () => {
			mockFetch.mockResolvedValueOnce({ volume_types: [], total_count: 0 });

			await handlers.listVolumeTypes({ page: 1, pageSize: 50, zone: "nl-ams-1" });

			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams-1");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.listVolumeTypes({ page: 1, pageSize: 50 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});
});
