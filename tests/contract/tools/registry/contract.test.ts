import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	CreateNamespaceInput,
	DeleteImageInput,
	DeleteNamespaceInput,
	DeleteTagInput,
	GetImageInput,
	GetNamespaceInput,
	GetTagInput,
	ImageSchema,
	ImageStatus,
	ImageVisibility,
	ListImagesInput,
	ListNamespacesInput,
	ListTagsInput,
	NamespaceSchema,
	NamespaceStatus,
	TagSchema,
	TagStatus,
	UpdateImageInput,
	UpdateNamespaceInput,
} from "../../../../src/tools/registry/types.js";

/**
 * Contract tests for Scaleway Container Registry API.
 *
 * API Reference: https://www.scaleway.com/en/developers/api/registry/
 * Spec: specs/006-registry/spec.md
 * Parity: tests/parity-matrix.json -> registry.*
 */

const VALID_REGION = "fr-par";
const VALID_UUID = "11111111-1111-1111-1111-111111111111";

describe("registry contract tests", () => {
	// --- Entity Schema Validation ---

	describe("NamespaceSchema", () => {
		it("validates a well-formed namespace", () => {
			const namespace = {
				id: VALID_UUID,
				name: "my-namespace",
				description: "A test namespace",
				organization_id: VALID_UUID,
				project_id: VALID_UUID,
				status: "ready",
				status_message: "",
				endpoint: "rg.fr-par.scw.cloud/my-namespace",
				is_public: false,
				size: 1024000,
				image_count: 5,
				region: "fr-par",
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-01-02T00:00:00.000Z",
			};
			expect(NamespaceSchema.parse(namespace)).toEqual(namespace);
		});

		it("rejects namespace with invalid id", () => {
			expect(() =>
				NamespaceSchema.parse({
					id: "not-a-uuid",
					name: "test",
					description: "",
					organization_id: VALID_UUID,
					project_id: VALID_UUID,
					status: "ready",
					status_message: "",
					endpoint: "",
					is_public: false,
					size: 0,
					image_count: 0,
					region: "fr-par",
					created_at: "",
					updated_at: "",
				}),
			).toThrow();
		});

		it("validates all namespace statuses", () => {
			for (const status of ["ready", "deleting", "error", "locked", "unknown"]) {
				expect(NamespaceStatus.parse(status)).toBe(status);
			}
		});

		it("rejects invalid namespace status", () => {
			expect(() => NamespaceStatus.parse("invalid")).toThrow();
		});
	});

	describe("ImageSchema", () => {
		it("validates a well-formed image", () => {
			const image = {
				id: VALID_UUID,
				name: "my-image",
				namespace_id: VALID_UUID,
				status: "ready",
				visibility: "inherit",
				size: 512000,
				tags: ["latest", "v1.0"],
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-01-02T00:00:00.000Z",
			};
			expect(ImageSchema.parse(image)).toEqual(image);
		});

		it("rejects image with invalid visibility", () => {
			expect(() =>
				ImageSchema.parse({
					id: VALID_UUID,
					name: "test",
					namespace_id: VALID_UUID,
					status: "ready",
					visibility: "invalid_visibility",
					size: 0,
					tags: [],
					created_at: "",
					updated_at: "",
				}),
			).toThrow();
		});

		it("validates all image statuses", () => {
			for (const status of ["unknown", "ready", "deleting", "error", "locked"]) {
				expect(ImageStatus.parse(status)).toBe(status);
			}
		});

		it("validates all image visibilities", () => {
			for (const v of ["visibility_unknown", "inherit", "public", "private"]) {
				expect(ImageVisibility.parse(v)).toBe(v);
			}
		});
	});

	describe("TagSchema", () => {
		it("validates a well-formed tag", () => {
			const tag = {
				id: VALID_UUID,
				name: "latest",
				image_id: VALID_UUID,
				status: "ready",
				digest: "sha256:abcdef1234567890",
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-01-02T00:00:00.000Z",
			};
			expect(TagSchema.parse(tag)).toEqual(tag);
		});

		it("rejects tag with missing required fields", () => {
			expect(() => TagSchema.parse({ id: VALID_UUID })).toThrow();
		});

		it("validates all tag statuses", () => {
			for (const status of ["unknown", "ready", "deleting", "error", "locked"]) {
				expect(TagStatus.parse(status)).toBe(status);
			}
		});
	});

	// --- Input Schema Validation ---

	describe("ListNamespacesInput", () => {
		it("accepts minimal input", () => {
			const result = ListNamespacesInput.parse({ region: VALID_REGION });
			expect(result.region).toBe(VALID_REGION);
		});

		it("accepts all optional fields", () => {
			const input = {
				region: VALID_REGION,
				page: 2,
				page_size: 25,
				project_id: VALID_UUID,
				name: "test",
				order_by: "created_at_asc",
			};
			expect(ListNamespacesInput.parse(input)).toEqual(input);
		});

		it("rejects invalid region format", () => {
			expect(() => ListNamespacesInput.parse({ region: "invalid" })).toThrow();
		});

		it("rejects page_size > 100", () => {
			expect(() => ListNamespacesInput.parse({ region: VALID_REGION, page_size: 101 })).toThrow();
		});

		it("rejects page < 1", () => {
			expect(() => ListNamespacesInput.parse({ region: VALID_REGION, page: 0 })).toThrow();
		});
	});

	describe("GetNamespaceInput", () => {
		it("accepts valid input", () => {
			const input = { region: VALID_REGION, namespace_id: VALID_UUID };
			expect(GetNamespaceInput.parse(input)).toEqual(input);
		});

		it("rejects invalid UUID", () => {
			expect(() =>
				GetNamespaceInput.parse({ region: VALID_REGION, namespace_id: "bad" }),
			).toThrow();
		});
	});

	describe("CreateNamespaceInput", () => {
		it("accepts minimal input", () => {
			const input = { region: VALID_REGION, name: "my-ns" };
			expect(CreateNamespaceInput.parse(input).name).toBe("my-ns");
		});

		it("accepts all optional fields", () => {
			const input = {
				region: VALID_REGION,
				name: "my-ns",
				project_id: VALID_UUID,
				description: "desc",
				is_public: true,
			};
			expect(CreateNamespaceInput.parse(input)).toEqual(input);
		});

		it("rejects empty name", () => {
			expect(() => CreateNamespaceInput.parse({ region: VALID_REGION, name: "" })).toThrow();
		});
	});

	describe("UpdateNamespaceInput", () => {
		it("accepts valid input with description", () => {
			const input = {
				region: VALID_REGION,
				namespace_id: VALID_UUID,
				description: "new desc",
			};
			expect(UpdateNamespaceInput.parse(input)).toEqual(input);
		});

		it("accepts valid input with is_public", () => {
			const input = {
				region: VALID_REGION,
				namespace_id: VALID_UUID,
				is_public: true,
			};
			expect(UpdateNamespaceInput.parse(input)).toEqual(input);
		});

		it("accepts input with no optional fields", () => {
			const input = { region: VALID_REGION, namespace_id: VALID_UUID };
			expect(UpdateNamespaceInput.parse(input)).toEqual(input);
		});
	});

	describe("DeleteNamespaceInput", () => {
		it("accepts valid input", () => {
			const input = { region: VALID_REGION, namespace_id: VALID_UUID };
			expect(DeleteNamespaceInput.parse(input)).toEqual(input);
		});
	});

	describe("ListImagesInput", () => {
		it("accepts minimal input", () => {
			const result = ListImagesInput.parse({ region: VALID_REGION });
			expect(result.region).toBe(VALID_REGION);
		});

		it("accepts all optional fields", () => {
			const input = {
				region: VALID_REGION,
				page: 1,
				page_size: 50,
				namespace_id: VALID_UUID,
				name: "myimage",
				order_by: "name_asc",
			};
			expect(ListImagesInput.parse(input)).toEqual(input);
		});
	});

	describe("GetImageInput", () => {
		it("accepts valid input", () => {
			const input = { region: VALID_REGION, image_id: VALID_UUID };
			expect(GetImageInput.parse(input)).toEqual(input);
		});
	});

	describe("UpdateImageInput", () => {
		it("accepts valid input with visibility", () => {
			const input = {
				region: VALID_REGION,
				image_id: VALID_UUID,
				visibility: "public" as const,
			};
			expect(UpdateImageInput.parse(input)).toEqual(input);
		});

		it("accepts input without optional fields", () => {
			const input = { region: VALID_REGION, image_id: VALID_UUID };
			expect(UpdateImageInput.parse(input)).toEqual(input);
		});

		it("rejects invalid visibility value", () => {
			expect(() =>
				UpdateImageInput.parse({
					region: VALID_REGION,
					image_id: VALID_UUID,
					visibility: "bad",
				}),
			).toThrow();
		});
	});

	describe("DeleteImageInput", () => {
		it("accepts valid input", () => {
			const input = { region: VALID_REGION, image_id: VALID_UUID };
			expect(DeleteImageInput.parse(input)).toEqual(input);
		});
	});

	describe("ListTagsInput", () => {
		it("accepts minimal input", () => {
			const result = ListTagsInput.parse({
				region: VALID_REGION,
				image_id: VALID_UUID,
			});
			expect(result.image_id).toBe(VALID_UUID);
		});

		it("accepts all optional fields", () => {
			const input = {
				region: VALID_REGION,
				image_id: VALID_UUID,
				page: 1,
				page_size: 50,
				name: "latest",
				order_by: "created_at_desc",
			};
			expect(ListTagsInput.parse(input)).toEqual(input);
		});
	});

	describe("GetTagInput", () => {
		it("accepts valid input", () => {
			const input = { region: VALID_REGION, tag_id: VALID_UUID };
			expect(GetTagInput.parse(input)).toEqual(input);
		});
	});

	describe("DeleteTagInput", () => {
		it("accepts valid input", () => {
			const input = { region: VALID_REGION, tag_id: VALID_UUID };
			expect(DeleteTagInput.parse(input)).toEqual(input);
		});

		it("rejects invalid region", () => {
			expect(() =>
				DeleteTagInput.parse({ region: "bad-format-123", tag_id: VALID_UUID }),
			).toThrow();
		});
	});
});
