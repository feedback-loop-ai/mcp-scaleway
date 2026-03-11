import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as handlers from "../../../src/tools/block-storage/handlers.js";
import { registerBlockStorageTools } from "../../../src/tools/block-storage/index.js";
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
		it("accepts valid statuses", () => {
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
			]) {
				expect(VolumeStatus.parse(status)).toBe(status);
			}
		});

		it("rejects invalid status", () => {
			expect(() => VolumeStatus.parse("running")).toThrow();
		});
	});

	describe("VolumeType", () => {
		it("accepts valid types", () => {
			for (const t of ["unknown_type", "b_ssd", "sbs_5k", "sbs_15k"]) {
				expect(VolumeType.parse(t)).toBe(t);
			}
		});

		it("rejects invalid type", () => {
			expect(() => VolumeType.parse("hdd")).toThrow();
		});
	});

	describe("VolumeSpecifications", () => {
		it("parses full specs", () => {
			const result = VolumeSpecifications.parse({
				perfIops: 5000,
				class: "sbs_5k",
			});
			expect(result.perfIops).toBe(5000);
			expect(result.class).toBe("sbs_5k");
		});

		it("parses empty specs", () => {
			const result = VolumeSpecifications.parse({});
			expect(result.perfIops).toBeUndefined();
		});
	});

	describe("Volume", () => {
		it("parses a full volume", () => {
			const result = Volume.parse({
				id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				name: "test-vol",
				type: "sbs_5k",
				size: 10000000000,
				zone: "fr-par-1",
				status: "available",
				specs: { perfIops: 5000 },
				lastDetachedAt: null,
				projectId: "11111111-1111-1111-1111-111111111111",
				tags: ["env:test"],
				parentSnapshotId: null,
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z",
			});
			expect(result.id).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
			expect(result.tags).toEqual(["env:test"]);
		});

		it("parses volume with minimal fields", () => {
			const result = Volume.parse({
				id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				name: "min-vol",
				type: "b_ssd",
				size: 5000000000,
				zone: "fr-par-1",
				status: "creating",
				projectId: "11111111-1111-1111-1111-111111111111",
				tags: [],
			});
			expect(result.specs).toBeUndefined();
			expect(result.lastDetachedAt).toBeUndefined();
		});
	});

	describe("ListVolumesParams", () => {
		it("applies defaults", () => {
			const result = ListVolumesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all filter fields", () => {
			const result = ListVolumesParams.parse({
				zone: "nl-ams-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				name: "my-vol",
				status: "available",
				page: 2,
				pageSize: 10,
			});
			expect(result.zone).toBe("nl-ams-1");
			expect(result.status).toBe("available");
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
			});
			expect(result.perfIops).toBe(5000);
			expect(result.tags).toEqual(["env:prod"]);
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

	describe("SnapshotStatus", () => {
		it("accepts valid statuses", () => {
			for (const s of [
				"unknown_status",
				"creating",
				"available",
				"deleting",
				"deleted",
				"error",
				"in_use",
				"locked",
			]) {
				expect(SnapshotStatus.parse(s)).toBe(s);
			}
		});

		it("rejects invalid status", () => {
			expect(() => SnapshotStatus.parse("pending")).toThrow();
		});
	});

	describe("SnapshotClass", () => {
		it("accepts valid classes", () => {
			for (const c of ["unknown_class", "standard", "instant"]) {
				expect(SnapshotClass.parse(c)).toBe(c);
			}
		});

		it("rejects invalid class", () => {
			expect(() => SnapshotClass.parse("premium")).toThrow();
		});
	});

	describe("Snapshot", () => {
		it("parses a full snapshot", () => {
			const result = Snapshot.parse({
				id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
				name: "test-snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				size: 10000000000,
				zone: "fr-par-1",
				status: "available",
				projectId: "11111111-1111-1111-1111-111111111111",
				tags: ["backup"],
				class: "standard",
				createdAt: "2025-01-01T00:00:00Z",
				updatedAt: "2025-01-01T00:00:00Z",
				parentVolume: {
					id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
					name: "parent-vol",
					type: "sbs_5k",
					status: "available",
				},
			});
			expect(result.class).toBe("standard");
			expect(result.parentVolume?.name).toBe("parent-vol");
		});

		it("parses snapshot with null/optional fields", () => {
			const result = Snapshot.parse({
				id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
				name: "min-snap",
				volumeId: null,
				size: 5000000000,
				zone: "nl-ams-1",
				status: "creating",
				projectId: "11111111-1111-1111-1111-111111111111",
				tags: [],
				parentVolume: null,
			});
			expect(result.volumeId).toBeNull();
			expect(result.parentVolume).toBeNull();
		});
	});

	describe("ListSnapshotsParams", () => {
		it("applies defaults", () => {
			const result = ListSnapshotsParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all filter fields", () => {
			const result = ListSnapshotsParams.parse({
				zone: "fr-par-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				name: "snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				status: "available",
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
			});
			expect(result.volumeId).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
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

	describe("VolumeTypePricing", () => {
		it("parses pricing", () => {
			const result = VolumeTypePricing.parse({ pricePerHour: 0.0004 });
			expect(result.pricePerHour).toBe(0.0004);
		});

		it("parses empty pricing", () => {
			const result = VolumeTypePricing.parse({});
			expect(result.pricePerHour).toBeUndefined();
		});
	});

	describe("VolumeTypeSpecs", () => {
		it("parses full specs", () => {
			const result = VolumeTypeSpecs.parse({
				minSize: 1000000000,
				maxSize: 10000000000000,
				minIops: 100,
				maxIops: 15000,
			});
			expect(result.maxIops).toBe(15000);
		});

		it("parses empty specs", () => {
			const result = VolumeTypeSpecs.parse({});
			expect(result.minSize).toBeUndefined();
		});
	});

	describe("VolumeTypeInfo", () => {
		it("parses full volume type info", () => {
			const result = VolumeTypeInfo.parse({
				name: "sbs_5k",
				pricing: { pricePerHour: 0.0004 },
				snapshotPricing: { pricePerHour: 0.0002 },
				specs: { minSize: 1000000000, maxSize: 10000000000000 },
			});
			expect(result.name).toBe("sbs_5k");
		});

		it("parses minimal volume type info", () => {
			const result = VolumeTypeInfo.parse({ name: "b_ssd" });
			expect(result.pricing).toBeUndefined();
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
		it("returns paginated volumes", async () => {
			mockFetch.mockResolvedValueOnce({
				volumes: [{ id: "vol-1", name: "test" }],
				total_count: 1,
			});

			const result = await handlers.listVolumes({ page: 1, pageSize: 50 });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
			expect(mockFetch).toHaveBeenCalledOnce();
		});

		it("passes filter params", async () => {
			mockFetch.mockResolvedValueOnce({ volumes: [], total_count: 0 });

			await handlers.listVolumes({
				page: 1,
				pageSize: 10,
				zone: "nl-ams-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				name: "my-vol",
				status: "available",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("project_id")).toBe("11111111-1111-1111-1111-111111111111");
			expect(callArgs.urlParams.get("name")).toBe("my-vol");
			expect(callArgs.urlParams.get("status")).toBe("available");
			expect(callArgs.path).toContain("nl-ams-1");
		});

		it("returns error on failure", async () => {
			const error = new Error("Network error");
			mockFetch.mockRejectedValueOnce(error);

			const result = await handlers.listVolumes({ page: 1, pageSize: 50 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("getVolume", () => {
		it("returns volume details", async () => {
			mockFetch.mockResolvedValueOnce({
				volume: {
					id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
					name: "test-vol",
				},
			});

			const result = await handlers.getVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
		});

		it("uses specified zone", async () => {
			mockFetch.mockResolvedValueOnce({ volume: { id: "v1" } });

			await handlers.getVolume({
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				zone: "nl-ams-1",
			});

			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams-1");
		});

		it("returns error on failure", async () => {
			const error = Object.assign(new Error("Not found"), {
				statusCode: 404,
			});
			mockFetch.mockRejectedValueOnce(error);

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
			mockFetch.mockResolvedValueOnce({
				volume: { id: "new-vol", name: "test" },
			});

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

		it("creates volume from snapshot", async () => {
			mockFetch.mockResolvedValueOnce({
				volume: { id: "snap-vol" },
			});

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
			mockFetch.mockResolvedValueOnce({
				volume: { id: "snap-vol" },
			});

			await handlers.createVolume({
				name: "snap-vol",
				fromSnapshot: {
					snapshotId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
				},
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.from_snapshot.size).toBeUndefined();
		});

		it("passes optional fields", async () => {
			mockFetch.mockResolvedValueOnce({ volume: { id: "v1" } });

			await handlers.createVolume({
				name: "full-vol",
				zone: "fr-par-1",
				projectId: "22222222-2222-2222-2222-222222222222",
				perfIops: 5000,
				tags: ["env:prod"],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("22222222-2222-2222-2222-222222222222");
			expect(body.perf_iops).toBe(5000);
			expect(body.tags).toEqual(["env:prod"]);
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
			mockFetch.mockResolvedValueOnce({
				volume: { id: "v1", name: "updated" },
			});

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
			mockFetch.mockResolvedValueOnce({ volume: { id: "v1" } });

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
			mockFetch.mockResolvedValueOnce({
				snapshots: [{ id: "s1" }],
				total_count: 1,
			});

			const result = await handlers.listSnapshots({ page: 1, pageSize: 50 });
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
		});

		it("passes filter params", async () => {
			mockFetch.mockResolvedValueOnce({ snapshots: [], total_count: 0 });

			await handlers.listSnapshots({
				page: 1,
				pageSize: 10,
				zone: "fr-par-1",
				projectId: "11111111-1111-1111-1111-111111111111",
				name: "snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				status: "available",
			});

			const callArgs = mockFetch.mock.calls[0][0];
			expect(callArgs.urlParams.get("project_id")).toBe("11111111-1111-1111-1111-111111111111");
			expect(callArgs.urlParams.get("volume_id")).toBe("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
			expect(callArgs.urlParams.get("name")).toBe("snap");
			expect(callArgs.urlParams.get("status")).toBe("available");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("err"));

			const result = await handlers.listSnapshots({ page: 1, pageSize: 50 });
			expect("isError" in result && result.isError).toBe(true);
		});
	});

	describe("getSnapshot", () => {
		it("returns snapshot details", async () => {
			mockFetch.mockResolvedValueOnce({
				snapshot: { id: "cccccccc-cccc-cccc-cccc-cccccccccccc" },
			});

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
			mockFetch.mockResolvedValueOnce({
				snapshot: { id: "new-snap", name: "my-snap" },
			});

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
			mockFetch.mockResolvedValueOnce({ snapshot: { id: "s1" } });

			await handlers.createSnapshot({
				name: "tagged-snap",
				volumeId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				projectId: "22222222-2222-2222-2222-222222222222",
				tags: ["daily"],
				zone: "nl-ams-1",
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.project_id).toBe("22222222-2222-2222-2222-222222222222");
			expect(body.tags).toEqual(["daily"]);
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
			mockFetch.mockResolvedValueOnce({
				snapshot: { id: "s1", name: "renamed" },
			});

			const result = await handlers.updateSnapshot({
				snapshotId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
				name: "renamed",
				tags: ["updated"],
			});

			const body = JSON.parse(mockFetch.mock.calls[0][0].body);
			expect(body.name).toBe("renamed");
			expect(body.tags).toEqual(["updated"]);

			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.name).toBe("renamed");
		});

		it("sends empty body when no optional fields", async () => {
			mockFetch.mockResolvedValueOnce({ snapshot: { id: "s1" } });

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
				volume_types: [{ name: "sbs_5k" }],
				total_count: 1,
			});

			const result = await handlers.listVolumeTypes({
				page: 1,
				pageSize: 50,
			});
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.items[0].name).toBe("sbs_5k");
		});

		it("uses specified zone", async () => {
			mockFetch.mockResolvedValueOnce({
				volume_types: [],
				total_count: 0,
			});

			await handlers.listVolumeTypes({
				page: 1,
				pageSize: 50,
				zone: "nl-ams-1",
			});

			expect(mockFetch.mock.calls[0][0].path).toContain("nl-ams-1");
		});

		it("returns error on failure", async () => {
			mockFetch.mockRejectedValueOnce(new Error("fail"));

			const result = await handlers.listVolumeTypes({
				page: 1,
				pageSize: 50,
			});
			expect("isError" in result && result.isError).toBe(true);
		});
	});
});
