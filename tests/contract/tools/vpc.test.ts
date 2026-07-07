/**
 * Contract tests for VPC & Private Networks API (016-vpc)
 *
 * Validates request shapes, response shapes, pagination, auth, and error codes
 * against the Scaleway VPC v2 API.
 *
 * Scaleway API Reference: https://www.scaleway.com/en/developers/api/vpc/
 * Endpoints:
 *   GET    /vpc/v2/regions/{region}/vpcs
 *   GET    /vpc/v2/regions/{region}/vpcs/{vpc_id}
 *   POST   /vpc/v2/regions/{region}/vpcs
 *   PATCH  /vpc/v2/regions/{region}/vpcs/{vpc_id}
 *   DELETE /vpc/v2/regions/{region}/vpcs/{vpc_id}
 *   GET    /vpc/v2/regions/{region}/private-networks
 *   GET    /vpc/v2/regions/{region}/private-networks/{private_network_id}
 *   POST   /vpc/v2/regions/{region}/private-networks
 *   PATCH  /vpc/v2/regions/{region}/private-networks/{private_network_id}
 *   DELETE /vpc/v2/regions/{region}/private-networks/{private_network_id}
 *
 * Parity matrix: tests/parity-matrix.json -> vpc
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
	CreatePrivateNetworkInput,
	CreateVpcInput,
	DeletePrivateNetworkInput,
	DeleteVpcInput,
	GetPrivateNetworkInput,
	GetVpcInput,
	ListPrivateNetworksInput,
	ListVpcsInput,
	UpdatePrivateNetworkInput,
	UpdateVpcInput,
} from "../../../src/tools/vpc/types.js";

describe("VPC contract tests (016-vpc)", () => {
	// --- Input Shape Validation ---

	describe("ListVpcsInput", () => {
		it("accepts valid minimal input", () => {
			const result = ListVpcsInput.safeParse({ region: "fr-par" });
			expect(result.success).toBe(true);
		});

		it("accepts all optional fields", () => {
			const result = ListVpcsInput.safeParse({
				region: "fr-par",
				page: 2,
				pageSize: 25,
				name: "my-vpc",
				tags: ["env:test"],
				project_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(true);
		});

		it("defaults page to 1", () => {
			const result = ListVpcsInput.parse({ region: "fr-par" });
			expect(result.page).toBe(1);
		});

		it("defaults pageSize to 50", () => {
			const result = ListVpcsInput.parse({ region: "fr-par" });
			expect(result.pageSize).toBe(50);
		});

		it("rejects invalid region format", () => {
			const result = ListVpcsInput.safeParse({ region: "invalid" });
			expect(result.success).toBe(false);
		});

		it("rejects missing region", () => {
			const result = ListVpcsInput.safeParse({});
			expect(result.success).toBe(false);
		});

		it("rejects pageSize > 100", () => {
			const result = ListVpcsInput.safeParse({
				region: "fr-par",
				pageSize: 200,
			});
			expect(result.success).toBe(false);
		});

		it("rejects pageSize < 1", () => {
			const result = ListVpcsInput.safeParse({
				region: "fr-par",
				pageSize: 0,
			});
			expect(result.success).toBe(false);
		});

		it("rejects page < 1", () => {
			const result = ListVpcsInput.safeParse({
				region: "fr-par",
				page: 0,
			});
			expect(result.success).toBe(false);
		});

		it("rejects invalid project UUID", () => {
			const result = ListVpcsInput.safeParse({
				region: "fr-par",
				project_id: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("GetVpcInput", () => {
		it("accepts valid input", () => {
			const result = GetVpcInput.safeParse({
				region: "fr-par",
				vpc_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(true);
		});

		it("rejects missing vpc_id", () => {
			const result = GetVpcInput.safeParse({ region: "fr-par" });
			expect(result.success).toBe(false);
		});

		it("rejects invalid vpc_id format", () => {
			const result = GetVpcInput.safeParse({
				region: "fr-par",
				vpc_id: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});

		it("rejects invalid region", () => {
			const result = GetVpcInput.safeParse({
				region: "bad",
				vpc_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("CreateVpcInput", () => {
		it("accepts valid input", () => {
			const result = CreateVpcInput.safeParse({
				region: "fr-par",
				name: "my-vpc",
				project_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(true);
		});

		it("accepts input with tags", () => {
			const result = CreateVpcInput.safeParse({
				region: "fr-par",
				name: "my-vpc",
				project_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:prod", "team:infra"],
			});
			expect(result.success).toBe(true);
		});

		it("rejects empty name", () => {
			const result = CreateVpcInput.safeParse({
				region: "fr-par",
				name: "",
				project_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing name", () => {
			const result = CreateVpcInput.safeParse({
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing project", () => {
			const result = CreateVpcInput.safeParse({
				region: "fr-par",
				name: "my-vpc",
			});
			expect(result.success).toBe(false);
		});

		it("rejects invalid project UUID", () => {
			const result = CreateVpcInput.safeParse({
				region: "fr-par",
				name: "my-vpc",
				project_id: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("UpdateVpcInput", () => {
		it("accepts valid input with name", () => {
			const result = UpdateVpcInput.safeParse({
				region: "fr-par",
				vpc_id: "11111111-1111-1111-1111-111111111111",
				name: "updated-vpc",
			});
			expect(result.success).toBe(true);
		});

		it("accepts valid input with tags", () => {
			const result = UpdateVpcInput.safeParse({
				region: "fr-par",
				vpc_id: "11111111-1111-1111-1111-111111111111",
				tags: ["new-tag"],
			});
			expect(result.success).toBe(true);
		});

		it("accepts valid input with no optional fields", () => {
			const result = UpdateVpcInput.safeParse({
				region: "fr-par",
				vpc_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(true);
		});

		it("rejects empty name", () => {
			const result = UpdateVpcInput.safeParse({
				region: "fr-par",
				vpc_id: "11111111-1111-1111-1111-111111111111",
				name: "",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing vpc_id", () => {
			const result = UpdateVpcInput.safeParse({ region: "fr-par" });
			expect(result.success).toBe(false);
		});
	});

	describe("DeleteVpcInput", () => {
		it("accepts valid input", () => {
			const result = DeleteVpcInput.safeParse({
				region: "fr-par",
				vpc_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(true);
		});

		it("rejects missing vpc_id", () => {
			const result = DeleteVpcInput.safeParse({ region: "fr-par" });
			expect(result.success).toBe(false);
		});

		it("rejects missing region", () => {
			const result = DeleteVpcInput.safeParse({
				vpc_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(false);
		});
	});

	// --- Private Network Input Shape Validation ---

	describe("ListPrivateNetworksInput", () => {
		it("accepts valid minimal input", () => {
			const result = ListPrivateNetworksInput.safeParse({
				region: "fr-par",
			});
			expect(result.success).toBe(true);
		});

		it("accepts all optional fields", () => {
			const result = ListPrivateNetworksInput.safeParse({
				region: "nl-ams",
				page: 3,
				pageSize: 10,
				name: "my-pn",
				tags: ["env:dev"],
				vpc_id: "11111111-1111-1111-1111-111111111111",
				project_id: "22222222-2222-2222-2222-222222222222",
			});
			expect(result.success).toBe(true);
		});

		it("defaults page to 1", () => {
			const result = ListPrivateNetworksInput.parse({ region: "fr-par" });
			expect(result.page).toBe(1);
		});

		it("defaults pageSize to 50", () => {
			const result = ListPrivateNetworksInput.parse({ region: "fr-par" });
			expect(result.pageSize).toBe(50);
		});

		it("rejects invalid vpc_id UUID", () => {
			const result = ListPrivateNetworksInput.safeParse({
				region: "fr-par",
				vpc_id: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});

		it("rejects invalid project_id UUID", () => {
			const result = ListPrivateNetworksInput.safeParse({
				region: "fr-par",
				project_id: "not-a-uuid",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("GetPrivateNetworkInput", () => {
		it("accepts valid input", () => {
			const result = GetPrivateNetworkInput.safeParse({
				region: "fr-par",
				private_network_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(true);
		});

		it("rejects missing private_network_id", () => {
			const result = GetPrivateNetworkInput.safeParse({
				region: "fr-par",
			});
			expect(result.success).toBe(false);
		});

		it("rejects invalid private_network_id", () => {
			const result = GetPrivateNetworkInput.safeParse({
				region: "fr-par",
				private_network_id: "bad",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("CreatePrivateNetworkInput", () => {
		it("accepts valid input with all fields", () => {
			const result = CreatePrivateNetworkInput.safeParse({
				region: "fr-par",
				name: "my-pn",
				project_id: "11111111-1111-1111-1111-111111111111",
				vpc_id: "22222222-2222-2222-2222-222222222222",
				tags: ["env:test"],
				subnets: ["192.168.1.0/24"],
			});
			expect(result.success).toBe(true);
		});

		it("accepts valid input without optional fields", () => {
			const result = CreatePrivateNetworkInput.safeParse({
				region: "fr-par",
				name: "my-pn",
				project_id: "11111111-1111-1111-1111-111111111111",
				vpc_id: "22222222-2222-2222-2222-222222222222",
			});
			expect(result.success).toBe(true);
		});

		it("rejects empty name", () => {
			const result = CreatePrivateNetworkInput.safeParse({
				region: "fr-par",
				name: "",
				project_id: "11111111-1111-1111-1111-111111111111",
				vpc_id: "22222222-2222-2222-2222-222222222222",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing vpc_id", () => {
			const result = CreatePrivateNetworkInput.safeParse({
				region: "fr-par",
				name: "my-pn",
				project_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing project_id", () => {
			const result = CreatePrivateNetworkInput.safeParse({
				region: "fr-par",
				name: "my-pn",
				vpc_id: "22222222-2222-2222-2222-222222222222",
			});
			expect(result.success).toBe(false);
		});

		it("rejects invalid project_id UUID", () => {
			const result = CreatePrivateNetworkInput.safeParse({
				region: "fr-par",
				name: "my-pn",
				project_id: "not-a-uuid",
				vpc_id: "22222222-2222-2222-2222-222222222222",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("UpdatePrivateNetworkInput", () => {
		it("accepts valid input with name", () => {
			const result = UpdatePrivateNetworkInput.safeParse({
				region: "fr-par",
				private_network_id: "11111111-1111-1111-1111-111111111111",
				name: "updated-pn",
			});
			expect(result.success).toBe(true);
		});

		it("accepts valid input with subnets", () => {
			const result = UpdatePrivateNetworkInput.safeParse({
				region: "fr-par",
				private_network_id: "11111111-1111-1111-1111-111111111111",
				subnets: ["10.0.0.0/16"],
			});
			expect(result.success).toBe(true);
		});

		it("accepts valid input with no optional fields", () => {
			const result = UpdatePrivateNetworkInput.safeParse({
				region: "fr-par",
				private_network_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(true);
		});

		it("rejects empty name", () => {
			const result = UpdatePrivateNetworkInput.safeParse({
				region: "fr-par",
				private_network_id: "11111111-1111-1111-1111-111111111111",
				name: "",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing private_network_id", () => {
			const result = UpdatePrivateNetworkInput.safeParse({
				region: "fr-par",
			});
			expect(result.success).toBe(false);
		});
	});

	describe("DeletePrivateNetworkInput", () => {
		it("accepts valid input", () => {
			const result = DeletePrivateNetworkInput.safeParse({
				region: "fr-par",
				private_network_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(true);
		});

		it("rejects missing private_network_id", () => {
			const result = DeletePrivateNetworkInput.safeParse({
				region: "fr-par",
			});
			expect(result.success).toBe(false);
		});

		it("rejects missing region", () => {
			const result = DeletePrivateNetworkInput.safeParse({
				private_network_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.success).toBe(false);
		});
	});

	// --- Response Shape Validation ---

	describe("response shapes", () => {
		const VpcResponseSchema = z.object({
			id: z.string().uuid(),
			name: z.string(),
			region: z.string(),
			project_id: z.string().uuid(),
			tags: z.array(z.string()),
			is_default: z.boolean(),
			private_network_count: z.number().int(),
			created_at: z.string(),
			updated_at: z.string(),
		});

		const SubnetSchema = z.object({
			id: z.string().uuid(),
			subnet: z.string(),
			created_at: z.string(),
			updated_at: z.string(),
		});

		const PrivateNetworkResponseSchema = z.object({
			id: z.string().uuid(),
			name: z.string(),
			vpc_id: z.string().uuid(),
			region: z.string(),
			project_id: z.string().uuid(),
			tags: z.array(z.string()),
			subnets: z.array(SubnetSchema),
			created_at: z.string(),
			updated_at: z.string(),
		});

		const PaginatedVpcsSchema = z.object({
			items: z.array(VpcResponseSchema),
			totalCount: z.number().int(),
			page: z.number().int(),
			pageSize: z.number().int(),
		});

		const PaginatedPrivateNetworksSchema = z.object({
			items: z.array(PrivateNetworkResponseSchema),
			totalCount: z.number().int(),
			page: z.number().int(),
			pageSize: z.number().int(),
		});

		it("validates VPC response shape", () => {
			const vpc = {
				id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				name: "my-vpc",
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:test"],
				is_default: false,
				private_network_count: 2,
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-01-01T00:00:00.000Z",
			};
			expect(VpcResponseSchema.safeParse(vpc).success).toBe(true);
		});

		it("validates Private Network response shape", () => {
			const pn = {
				id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
				name: "my-pn",
				vpc_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:test"],
				subnets: [
					{
						id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
						subnet: "192.168.1.0/24",
						created_at: "2026-01-01T00:00:00.000Z",
						updated_at: "2026-01-01T00:00:00.000Z",
					},
				],
				created_at: "2026-01-01T00:00:00.000Z",
				updated_at: "2026-01-01T00:00:00.000Z",
			};
			expect(PrivateNetworkResponseSchema.safeParse(pn).success).toBe(true);
		});

		it("validates paginated VPC list response shape", () => {
			const response = {
				items: [
					{
						id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
						name: "my-vpc",
						region: "fr-par",
						project_id: "11111111-1111-1111-1111-111111111111",
						tags: [],
						is_default: true,
						private_network_count: 0,
						created_at: "2026-01-01T00:00:00.000Z",
						updated_at: "2026-01-01T00:00:00.000Z",
					},
				],
				totalCount: 1,
				page: 1,
				pageSize: 50,
			};
			expect(PaginatedVpcsSchema.safeParse(response).success).toBe(true);
		});

		it("validates paginated Private Network list response shape", () => {
			const response = {
				items: [
					{
						id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
						name: "my-pn",
						vpc_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
						region: "fr-par",
						project_id: "11111111-1111-1111-1111-111111111111",
						tags: [],
						subnets: [],
						created_at: "2026-01-01T00:00:00.000Z",
						updated_at: "2026-01-01T00:00:00.000Z",
					},
				],
				totalCount: 1,
				page: 1,
				pageSize: 50,
			};
			expect(PaginatedPrivateNetworksSchema.safeParse(response).success).toBe(true);
		});

		it("validates empty paginated response", () => {
			const response = {
				items: [],
				totalCount: 0,
				page: 1,
				pageSize: 50,
			};
			expect(PaginatedVpcsSchema.safeParse(response).success).toBe(true);
			expect(PaginatedPrivateNetworksSchema.safeParse(response).success).toBe(true);
		});
	});

	// --- Error Response Shape ---

	describe("error response shape", () => {
		const ErrorResponseSchema = z.object({
			error: z.object({
				type: z.enum([
					"not_found",
					"permission_denied",
					"invalid_input",
					"rate_limited",
					"server_error",
				]),
				message: z.string(),
				statusCode: z.number().int(),
			}),
		});

		it("validates 400 error shape", () => {
			const error = {
				error: {
					type: "invalid_input" as const,
					message: "Invalid input",
					statusCode: 400,
				},
			};
			expect(ErrorResponseSchema.safeParse(error).success).toBe(true);
		});

		it("validates 403 error shape", () => {
			const error = {
				error: {
					type: "permission_denied" as const,
					message: "Forbidden",
					statusCode: 403,
				},
			};
			expect(ErrorResponseSchema.safeParse(error).success).toBe(true);
		});

		it("validates 404 error shape", () => {
			const error = {
				error: {
					type: "not_found" as const,
					message: "Not found",
					statusCode: 404,
				},
			};
			expect(ErrorResponseSchema.safeParse(error).success).toBe(true);
		});

		it("validates 429 error shape", () => {
			const error = {
				error: {
					type: "rate_limited" as const,
					message: "Rate limited",
					statusCode: 429,
				},
			};
			expect(ErrorResponseSchema.safeParse(error).success).toBe(true);
		});

		it("validates 500 error shape", () => {
			const error = {
				error: {
					type: "server_error" as const,
					message: "Server error",
					statusCode: 500,
				},
			};
			expect(ErrorResponseSchema.safeParse(error).success).toBe(true);
		});
	});

	// --- Locality Validation ---

	describe("locality (regional)", () => {
		it("accepts fr-par region", () => {
			const result = ListVpcsInput.safeParse({ region: "fr-par" });
			expect(result.success).toBe(true);
		});

		it("accepts nl-ams region", () => {
			const result = ListVpcsInput.safeParse({ region: "nl-ams" });
			expect(result.success).toBe(true);
		});

		it("accepts pl-waw region", () => {
			const result = ListVpcsInput.safeParse({ region: "pl-waw" });
			expect(result.success).toBe(true);
		});

		it("rejects zone format (not regional)", () => {
			const result = ListVpcsInput.safeParse({ region: "fr-par-1" });
			expect(result.success).toBe(false);
		});

		it("rejects empty string", () => {
			const result = ListVpcsInput.safeParse({ region: "" });
			expect(result.success).toBe(false);
		});
	});
});
