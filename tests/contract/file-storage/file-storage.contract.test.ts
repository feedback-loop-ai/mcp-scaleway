/**
 * Contract tests for Scaleway File Storage API (v1alpha1, Beta)
 *
 * Validates request/response shapes against specs/scaleway-api/file-storage/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	Attachment,
	AttachmentResourceType,
	CreateFileSystemParams,
	DeleteFileSystemParams,
	FileSystem,
	FileSystemStatus,
	GetFileSystemParams,
	ListAttachmentsParams,
	ListAttachmentsResponse,
	ListFileSystemsParams,
	ListFileSystemsResponse,
	UpdateFileSystemParams,
} from "../../../src/tools/file-storage/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

const validFileSystem = {
	id: VALID_UUID,
	name: "my-fs",
	size: 100000000000,
	status: "available" as const,
	project_id: VALID_UUID,
	organization_id: VALID_UUID,
	tags: ["prod"],
	number_of_attachments: 2,
	region: VALID_REGION,
	created_at: "2025-06-01T12:00:00Z",
	updated_at: "2025-06-01T12:30:00Z",
};

const validAttachment = {
	id: VALID_UUID,
	filesystem_id: VALID_UUID,
	resource_id: VALID_UUID,
	resource_type: "instance_server" as const,
	zone: "fr-par-1",
};

/**
 * API: GET /file/v1alpha1/regions/{region}/filesystems
 * Spec: specs/scaleway-api/file-storage/api-reference.md#list-filesystems
 */
describe("contract: ListFileSystems", () => {
	it("validates a list response", () => {
		const response = { filesystems: [validFileSystem], total_count: 1 };
		expect(() => ListFileSystemsResponse.parse(response)).not.toThrow();
	});

	it("validates empty response", () => {
		expect(() => ListFileSystemsResponse.parse({ filesystems: [], total_count: 0 })).not.toThrow();
	});

	it("rejects response missing filesystems array", () => {
		expect(() => ListFileSystemsResponse.parse({ total_count: 0 })).toThrow();
	});

	it("validates request with all filters", () => {
		const input = {
			region: VALID_REGION,
			projectId: VALID_UUID,
			organizationId: VALID_UUID,
			name: "fs",
			tags: ["a"],
			orderBy: "created_at_desc",
		};
		expect(() => ListFileSystemsParams.parse(input)).not.toThrow();
	});

	it("rejects invalid order_by value", () => {
		expect(() =>
			ListFileSystemsParams.parse({ region: VALID_REGION, orderBy: "size_asc" }),
		).toThrow();
	});
});

/**
 * API: GET /file/v1alpha1/regions/{region}/filesystems/{filesystem_id}
 * Spec: specs/scaleway-api/file-storage/api-reference.md#get-filesystem
 */
describe("contract: GetFileSystem / FileSystem entity", () => {
	it("validates a filesystem response", () => {
		expect(() => FileSystem.parse(validFileSystem)).not.toThrow();
	});

	it("validates all filesystem statuses", () => {
		for (const status of ["unknown_status", "available", "error", "creating", "updating"]) {
			expect(() => FileSystem.parse({ ...validFileSystem, status })).not.toThrow();
		}
	});

	it("rejects invalid filesystem status", () => {
		expect(() => FileSystem.parse({ ...validFileSystem, status: "deleting" })).toThrow();
	});

	it("validates FileSystemStatus enum directly", () => {
		expect(() => FileSystemStatus.parse("available")).not.toThrow();
		expect(() => FileSystemStatus.parse("bogus")).toThrow();
	});

	it("validates request shape", () => {
		expect(() =>
			GetFileSystemParams.parse({ region: VALID_REGION, filesystemId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing filesystem_id", () => {
		expect(() => GetFileSystemParams.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: POST /file/v1alpha1/regions/{region}/filesystems
 * Spec: specs/scaleway-api/file-storage/api-reference.md#create-filesystem
 */
describe("contract: CreateFileSystem request shape", () => {
	it("validates minimal create request", () => {
		const input = { region: VALID_REGION, name: "fs", size: 100000000000 };
		expect(() => CreateFileSystemParams.parse(input)).not.toThrow();
	});

	it("validates full create request", () => {
		const input = {
			region: VALID_REGION,
			name: "fs",
			size: 100000000000,
			projectId: VALID_UUID,
			tags: ["prod"],
		};
		expect(() => CreateFileSystemParams.parse(input)).not.toThrow();
	});

	it("rejects create without required fields", () => {
		expect(() => CreateFileSystemParams.parse({ region: VALID_REGION })).toThrow();
		expect(() => CreateFileSystemParams.parse({ region: VALID_REGION, name: "fs" })).toThrow();
	});

	it("rejects non-positive size", () => {
		expect(() =>
			CreateFileSystemParams.parse({ region: VALID_REGION, name: "fs", size: 0 }),
		).toThrow();
	});
});

/**
 * API: PATCH /file/v1alpha1/regions/{region}/filesystems/{filesystem_id}
 * Spec: specs/scaleway-api/file-storage/api-reference.md#update-filesystem
 */
describe("contract: UpdateFileSystem request shape", () => {
	it("validates update with all optional fields", () => {
		const input = {
			region: VALID_REGION,
			filesystemId: VALID_UUID,
			name: "new",
			size: 200000000000,
			tags: ["x"],
		};
		expect(() => UpdateFileSystemParams.parse(input)).not.toThrow();
	});

	it("validates update with no optional fields", () => {
		expect(() =>
			UpdateFileSystemParams.parse({ region: VALID_REGION, filesystemId: VALID_UUID }),
		).not.toThrow();
	});
});

/**
 * API: DELETE /file/v1alpha1/regions/{region}/filesystems/{filesystem_id}
 * Spec: specs/scaleway-api/file-storage/api-reference.md#delete-filesystem
 */
describe("contract: DeleteFileSystem request shape", () => {
	it("validates delete request", () => {
		expect(() =>
			DeleteFileSystemParams.parse({ region: VALID_REGION, filesystemId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects missing filesystem_id", () => {
		expect(() => DeleteFileSystemParams.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * API: GET /file/v1alpha1/regions/{region}/attachments
 * Spec: specs/scaleway-api/file-storage/api-reference.md#list-attachments
 */
describe("contract: ListAttachments", () => {
	it("validates a list response", () => {
		const response = { attachments: [validAttachment], total_count: 1 };
		expect(() => ListAttachmentsResponse.parse(response)).not.toThrow();
	});

	it("validates attachment entity", () => {
		expect(() => Attachment.parse(validAttachment)).not.toThrow();
	});

	it("validates attachment with null zone", () => {
		expect(() => Attachment.parse({ ...validAttachment, zone: null })).not.toThrow();
	});

	it("validates all resource types", () => {
		for (const t of ["unknown_resource_type", "instance_server"]) {
			expect(() => Attachment.parse({ ...validAttachment, resource_type: t })).not.toThrow();
		}
	});

	it("rejects invalid resource type", () => {
		expect(() => AttachmentResourceType.parse("elastic_metal_server")).toThrow();
	});

	it("validates request with all filters", () => {
		const input = {
			region: VALID_REGION,
			filesystemId: VALID_UUID,
			resourceId: VALID_UUID,
			resourceType: "instance_server",
			zone: "fr-par-1",
		};
		expect(() => ListAttachmentsParams.parse(input)).not.toThrow();
	});

	it("rejects invalid zone format", () => {
		expect(() => ListAttachmentsParams.parse({ region: VALID_REGION, zone: "fr-par" })).toThrow();
	});
});

// --- Pagination contracts ---

describe("contract: pagination parameters", () => {
	it("applies default pagination values", () => {
		const result = ListFileSystemsParams.parse({ region: VALID_REGION });
		expect(result.page).toBe(1);
		expect(result.pageSize).toBe(50);
	});

	it("accepts custom pagination", () => {
		const result = ListAttachmentsParams.parse({ region: VALID_REGION, page: 3, pageSize: 25 });
		expect(result.page).toBe(3);
		expect(result.pageSize).toBe(25);
	});

	it("rejects page size over 100", () => {
		expect(() => ListFileSystemsParams.parse({ region: VALID_REGION, pageSize: 101 })).toThrow();
	});

	it("rejects page 0", () => {
		expect(() => ListFileSystemsParams.parse({ region: VALID_REGION, page: 0 })).toThrow();
	});
});

// --- Auth / region contracts ---

describe("contract: authentication and region scoping", () => {
	it("requires region parameter for all operations", () => {
		expect(() => ListFileSystemsParams.parse({})).toThrow();
		expect(() => GetFileSystemParams.parse({ filesystemId: VALID_UUID })).toThrow();
		expect(() => ListAttachmentsParams.parse({})).toThrow();
	});

	it("validates region format (xx-xxx)", () => {
		expect(() => ListFileSystemsParams.parse({ region: "fr-par" })).not.toThrow();
		expect(() => ListFileSystemsParams.parse({ region: "nl-ams" })).not.toThrow();
		expect(() => ListFileSystemsParams.parse({ region: "invalid" })).toThrow();
	});
});

// --- Response envelope shape sanity ---

describe("contract: list response envelopes use total_count", () => {
	it("filesystems envelope", () => {
		const schema = z.object({
			filesystems: z.array(FileSystem),
			total_count: z.number().int(),
		});
		expect(() => schema.parse({ filesystems: [], total_count: 0 })).not.toThrow();
	});

	it("attachments envelope", () => {
		const schema = z.object({
			attachments: z.array(Attachment),
			total_count: z.number().int(),
		});
		expect(() => schema.parse({ attachments: [], total_count: 0 })).not.toThrow();
	});
});
