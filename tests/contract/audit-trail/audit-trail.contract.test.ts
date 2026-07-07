/**
 * Contract tests for Scaleway Audit Trail API (v1alpha1)
 *
 * Validates request/response shapes against
 *   specs/scaleway-api/audit-trail/api-reference.md
 * Parity matrix: tests/parity-matrix.json
 */
import { describe, expect, it } from "vitest";
import {
	AuditEvent,
	AuditTrailResource,
	AuditTrailResourceType,
	CreateAuditTrailExportJobParams,
	DeleteAuditTrailExportJobParams,
	ExportJob,
	ListAuditTrailEventsParams,
	ListAuditTrailExportJobsParams,
	ListAuditTrailProductsParams,
	ListEventsResponse,
	ListExportJobsResponse,
	ListProductsResponse,
	Product,
} from "../../../src/tools/audit-trail/types.js";

const VALID_UUID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const VALID_REGION = "fr-par";

const validEvent = {
	id: "event-1",
	recorded_at: "2025-01-01T00:00:00+00:00",
	locality: "fr-par",
	principal: { id: "user-1" },
	organization_id: VALID_UUID,
	project_id: VALID_UUID,
	source_ip: "1.2.3.4",
	user_agent: "cli/1.0",
	product_name: "instance",
	service_name: "InstanceV1",
	method_name: "CreateServer",
	resources: [
		{
			id: "srv-1",
			type: "instance_server",
			name: "web",
			created_at: "2025-01-01T00:00:00+00:00",
			updated_at: "2025-01-01T00:00:00+00:00",
		},
	],
	request_id: "req-1",
	request_body: { name: "web" },
	status_code: 200,
};

const validProduct = {
	title: "Instances",
	name: "instance",
	services: [{ name: "InstanceV1", methods: ["CreateServer", "DeleteServer"] }],
};

const validExportJob = {
	id: VALID_UUID,
	organization_id: VALID_UUID,
	name: "nightly-export",
	s3: { bucket: "audit-bucket", region: "fr-par", prefix: "logs/", project_id: VALID_UUID },
	created_at: "2025-01-01T00:00:00+00:00",
	last_run_at: "2025-01-02T00:00:00+00:00",
	tags: ["prod"],
	last_status: { status_code: "success" },
};

/**
 * API: GET /audit-trail/v1alpha1/regions/{region}/events
 * Spec: specs/scaleway-api/audit-trail/api-reference.md#list-events
 */
describe("contract: ListEvents", () => {
	it("validates the events response shape", () => {
		const response = { events: [validEvent], next_page_token: "cursor" };
		expect(() => ListEventsResponse.parse(response)).not.toThrow();
	});

	it("validates an empty / final page (no next_page_token)", () => {
		expect(() => ListEventsResponse.parse({ events: [] })).not.toThrow();
		expect(() => ListEventsResponse.parse({ events: [], next_page_token: null })).not.toThrow();
	});

	it("validates an event with nullable fields omitted", () => {
		const minimal = {
			id: "e2",
			locality: "global",
			organization_id: VALID_UUID,
			source_ip: "5.6.7.8",
			product_name: "iam",
			service_name: "IamV1",
			method_name: "CreateUser",
			resources: [],
			request_id: "req-2",
			status_code: 403,
		};
		expect(() => AuditEvent.parse(minimal)).not.toThrow();
	});

	it("tolerates product-specific *_info keys on a resource (unknown keys stripped)", () => {
		const resource = {
			id: "sec-1",
			type: "secm_secret",
			name: "db-password",
			secm_secret_info: { path: "/db", key_id: VALID_UUID },
		};
		const parsed = AuditTrailResource.parse(resource);
		expect(parsed.id).toBe("sec-1");
		expect((parsed as Record<string, unknown>).secm_secret_info).toBeUndefined();
	});

	it("accepts a representative sample of resource types", () => {
		for (const type of [
			"instance_server",
			"iam_user",
			"load_balancer_lb",
			"vpc_private_network",
			"audit_trail_export_job",
			"rdb_instance",
			"unknown_type",
		]) {
			expect(() => AuditTrailResourceType.parse(type)).not.toThrow();
		}
	});

	it("rejects an unknown resource type", () => {
		expect(() => AuditTrailResourceType.parse("not_a_real_type")).toThrow();
	});

	it("validates a request with only required params", () => {
		expect(() =>
			ListAuditTrailEventsParams.parse({ region: VALID_REGION, organizationId: VALID_UUID }),
		).not.toThrow();
	});

	it("validates a request with all filters", () => {
		const input = {
			region: VALID_REGION,
			organizationId: VALID_UUID,
			projectId: VALID_UUID,
			resourceType: "instance_server",
			methodName: "CreateServer",
			status: 200,
			recordedAfter: "2025-01-01T00:00:00+00:00",
			recordedBefore: "2025-02-01T00:00:00+00:00",
			productName: "instance",
			serviceName: "InstanceV1",
			resourceId: "srv-1",
			principalId: "user-1",
			sourceIp: "1.2.3.4",
			orderBy: "recorded_at_desc",
			pageSize: 50,
			pageToken: "cursor",
		};
		expect(() => ListAuditTrailEventsParams.parse(input)).not.toThrow();
	});

	it("requires organizationId", () => {
		expect(() => ListAuditTrailEventsParams.parse({ region: VALID_REGION })).toThrow();
	});

	it("rejects pageSize over 100 and invalid order_by", () => {
		expect(() =>
			ListAuditTrailEventsParams.parse({
				region: VALID_REGION,
				organizationId: VALID_UUID,
				pageSize: 101,
			}),
		).toThrow();
		expect(() =>
			ListAuditTrailEventsParams.parse({
				region: VALID_REGION,
				organizationId: VALID_UUID,
				orderBy: "name_asc",
			}),
		).toThrow();
	});
});

/**
 * API: GET /audit-trail/v1alpha1/regions/{region}/products
 * Spec: specs/scaleway-api/audit-trail/api-reference.md#list-products
 */
describe("contract: ListProducts", () => {
	it("validates the products response shape", () => {
		const response = { products: [validProduct], total_count: 1 };
		expect(() => ListProductsResponse.parse(response)).not.toThrow();
	});

	it("validates a product entity", () => {
		expect(() => Product.parse(validProduct)).not.toThrow();
	});

	it("validates the request shape", () => {
		expect(() =>
			ListAuditTrailProductsParams.parse({ region: VALID_REGION, organizationId: VALID_UUID }),
		).not.toThrow();
	});

	it("requires region and organizationId", () => {
		expect(() => ListAuditTrailProductsParams.parse({ region: VALID_REGION })).toThrow();
		expect(() => ListAuditTrailProductsParams.parse({ organizationId: VALID_UUID })).toThrow();
	});
});

/**
 * API: GET /audit-trail/v1alpha1/regions/{region}/export-jobs
 * Spec: specs/scaleway-api/audit-trail/api-reference.md#list-export-jobs
 */
describe("contract: ListExportJobs", () => {
	it("validates the export jobs response shape", () => {
		const response = { export_jobs: [validExportJob], total_count: 1 };
		expect(() => ListExportJobsResponse.parse(response)).not.toThrow();
	});

	it("validates an export job entity", () => {
		expect(() => ExportJob.parse(validExportJob)).not.toThrow();
	});

	it("applies default pagination", () => {
		const parsed = ListAuditTrailExportJobsParams.parse({
			region: VALID_REGION,
			organizationId: VALID_UUID,
		});
		expect(parsed.page).toBe(1);
		expect(parsed.pageSize).toBe(50);
	});

	it("validates optional filters", () => {
		expect(() =>
			ListAuditTrailExportJobsParams.parse({
				region: VALID_REGION,
				organizationId: VALID_UUID,
				name: "nightly",
				tags: ["prod"],
				orderBy: "created_at_desc",
				page: 2,
				pageSize: 25,
			}),
		).not.toThrow();
	});
});

/**
 * API: POST /audit-trail/v1alpha1/regions/{region}/export-jobs
 * Spec: specs/scaleway-api/audit-trail/api-reference.md#create-export-job
 */
describe("contract: CreateExportJob", () => {
	it("validates a minimal create request", () => {
		expect(() =>
			CreateAuditTrailExportJobParams.parse({
				region: VALID_REGION,
				organizationId: VALID_UUID,
				name: "job",
				s3Bucket: "bucket",
				s3Region: "fr-par",
			}),
		).not.toThrow();
	});

	it("validates a full create request", () => {
		expect(() =>
			CreateAuditTrailExportJobParams.parse({
				region: VALID_REGION,
				organizationId: VALID_UUID,
				name: "job",
				s3Bucket: "bucket",
				s3Region: "nl-ams",
				s3Prefix: "logs/",
				s3ProjectId: VALID_UUID,
				tags: ["prod"],
			}),
		).not.toThrow();
	});

	it("rejects requests missing required fields", () => {
		expect(() =>
			CreateAuditTrailExportJobParams.parse({
				region: VALID_REGION,
				organizationId: VALID_UUID,
				name: "job",
			}),
		).toThrow();
		expect(() =>
			CreateAuditTrailExportJobParams.parse({
				region: VALID_REGION,
				organizationId: VALID_UUID,
				s3Bucket: "bucket",
				s3Region: "fr-par",
			}),
		).toThrow();
	});
});

/**
 * API: DELETE /audit-trail/v1alpha1/regions/{region}/export-jobs/{export_job_id}
 * Spec: specs/scaleway-api/audit-trail/api-reference.md#delete-export-job
 */
describe("contract: DeleteExportJob", () => {
	it("validates a delete request", () => {
		expect(() =>
			DeleteAuditTrailExportJobParams.parse({ region: VALID_REGION, exportJobId: VALID_UUID }),
		).not.toThrow();
	});

	it("rejects a missing export job ID", () => {
		expect(() => DeleteAuditTrailExportJobParams.parse({ region: VALID_REGION })).toThrow();
	});
});

/**
 * Auth & locality contracts (X-Auth-Token, regional API)
 */
describe("contract: authentication & locality", () => {
	it("requires a region for all operations", () => {
		expect(() => ListAuditTrailEventsParams.parse({ organizationId: VALID_UUID })).toThrow();
		expect(() => ListAuditTrailProductsParams.parse({ organizationId: VALID_UUID })).toThrow();
	});

	it("validates region format (xx-xxx)", () => {
		for (const region of ["fr-par", "nl-ams", "pl-waw"]) {
			expect(() =>
				ListAuditTrailEventsParams.parse({ region, organizationId: VALID_UUID }),
			).not.toThrow();
		}
		expect(() =>
			ListAuditTrailEventsParams.parse({ region: "invalid", organizationId: VALID_UUID }),
		).toThrow();
	});
});
