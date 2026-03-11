/**
 * Contract tests for Scaleway Object Storage (S3-compatible) API.
 *
 * These validate request/response shapes, pagination patterns, auth requirements,
 * and error codes against the S3-compatible API specification.
 *
 * API Reference: Scaleway Object Storage S3-compatible API
 * Spec: specs/scaleway-api/ (S3-compatible overlay)
 * Parity: tests/parity-matrix.json#object-storage
 */

import { describe, expect, it } from "vitest";
import {
	buildLifecycleXml,
	parseLifecycleXml,
	parseListBucketsXml,
	parseListObjectsV2Xml,
	parseVersioningXml,
} from "../../../src/tools/object-storage/handlers.js";
import {
	Bucket,
	BucketInfo,
	BucketPolicy,
	CreateBucketInput,
	DeleteBucketInput,
	DeleteObjectInput,
	GetBucketInfoInput,
	GetBucketLifecycleInput,
	GetBucketPolicyInput,
	GetBucketVersioningInput,
	GetObjectInfoInput,
	LifecycleRule,
	ListBucketsInput,
	ListObjectsInput,
	ObjectInfo,
	PutObjectInput,
	S3Object,
	S3Region,
	SetBucketLifecycleInput,
	SetBucketPolicyInput,
	SetBucketVersioningInput,
	StorageClass,
	VersioningStatus,
} from "../../../src/tools/object-storage/types.js";

// --- Request shape contracts ---

describe("Object Storage API request shape contracts", () => {
	// Spec: GET / (ListBuckets)
	describe("ListBuckets request", () => {
		it("accepts empty input (region optional)", () => {
			expect(ListBucketsInput.parse({})).toEqual({});
		});

		it("accepts valid region", () => {
			expect(ListBucketsInput.parse({ region: "fr-par" }).region).toBe("fr-par");
		});

		it("rejects unknown region", () => {
			expect(() => ListBucketsInput.parse({ region: "us-east-1" })).toThrow();
		});
	});

	// Spec: PUT /{bucket} (CreateBucket)
	describe("CreateBucket request", () => {
		it("requires name with 3-63 chars", () => {
			expect(CreateBucketInput.parse({ name: "abc" }).name).toBe("abc");
			expect(() => CreateBucketInput.parse({ name: "ab" })).toThrow();
			expect(() => CreateBucketInput.parse({ name: "a".repeat(64) })).toThrow();
		});

		it("accepts valid canned ACL values", () => {
			for (const acl of ["private", "public-read", "public-read-write", "authenticated-read"]) {
				expect(CreateBucketInput.parse({ name: "bucket", acl }).acl).toBe(acl);
			}
		});

		it("rejects invalid ACL", () => {
			expect(() => CreateBucketInput.parse({ name: "bucket", acl: "public" })).toThrow();
		});
	});

	// Spec: DELETE /{bucket} (DeleteBucket)
	describe("DeleteBucket request", () => {
		it("requires bucket name", () => {
			expect(DeleteBucketInput.parse({ name: "b" }).name).toBe("b");
			expect(() => DeleteBucketInput.parse({})).toThrow();
		});
	});

	// Spec: HEAD /{bucket} + GET /{bucket}?versioning (GetBucketInfo)
	describe("GetBucketInfo request", () => {
		it("requires bucket name", () => {
			expect(GetBucketInfoInput.parse({ name: "b" })).toBeTruthy();
		});
	});

	// Spec: GET /{bucket}?list-type=2 (ListObjectsV2)
	describe("ListObjects request", () => {
		it("requires bucket, provides maxKeys default of 100", () => {
			const result = ListObjectsInput.parse({ bucket: "mybucket" });
			expect(result.maxKeys).toBe(100);
		});

		it("enforces maxKeys range 1-1000", () => {
			expect(() => ListObjectsInput.parse({ bucket: "b", maxKeys: 0 })).toThrow();
			expect(() => ListObjectsInput.parse({ bucket: "b", maxKeys: 1001 })).toThrow();
			expect(ListObjectsInput.parse({ bucket: "b", maxKeys: 1000 }).maxKeys).toBe(1000);
		});

		it("supports prefix and delimiter for hierarchical listing", () => {
			const result = ListObjectsInput.parse({
				bucket: "b",
				prefix: "docs/",
				delimiter: "/",
			});
			expect(result.prefix).toBe("docs/");
			expect(result.delimiter).toBe("/");
		});

		it("supports continuation token for pagination", () => {
			const result = ListObjectsInput.parse({
				bucket: "b",
				continuationToken: "token123",
			});
			expect(result.continuationToken).toBe("token123");
		});
	});

	// Spec: HEAD /{bucket}/{key} (HeadObject)
	describe("GetObjectInfo request", () => {
		it("requires bucket and key", () => {
			expect(GetObjectInfoInput.parse({ bucket: "b", key: "k" })).toBeTruthy();
			expect(() => GetObjectInfoInput.parse({ bucket: "b" })).toThrow();
		});
	});

	// Spec: PUT /{bucket}/{key} (PutObject)
	describe("PutObject request", () => {
		it("requires bucket and key", () => {
			expect(PutObjectInput.parse({ bucket: "b", key: "k" })).toBeTruthy();
		});

		it("accepts storage class", () => {
			const result = PutObjectInput.parse({
				bucket: "b",
				key: "k",
				storageClass: "GLACIER",
			});
			expect(result.storageClass).toBe("GLACIER");
		});

		it("accepts metadata", () => {
			const result = PutObjectInput.parse({
				bucket: "b",
				key: "k",
				metadata: { env: "prod" },
			});
			expect(result.metadata?.env).toBe("prod");
		});
	});

	// Spec: DELETE /{bucket}/{key} (DeleteObject)
	describe("DeleteObject request", () => {
		it("requires bucket and key", () => {
			expect(DeleteObjectInput.parse({ bucket: "b", key: "k" })).toBeTruthy();
		});
	});

	// Spec: GET /{bucket}?policy (GetBucketPolicy)
	describe("GetBucketPolicy request", () => {
		it("requires bucket", () => {
			expect(GetBucketPolicyInput.parse({ bucket: "b" })).toBeTruthy();
		});
	});

	// Spec: PUT /{bucket}?policy (PutBucketPolicy)
	describe("SetBucketPolicy request", () => {
		it("requires bucket and policy string", () => {
			const result = SetBucketPolicyInput.parse({ bucket: "b", policy: "{}" });
			expect(result.policy).toBe("{}");
		});
	});

	// Spec: GET /{bucket}?lifecycle (GetBucketLifecycleConfiguration)
	describe("GetBucketLifecycle request", () => {
		it("requires bucket", () => {
			expect(GetBucketLifecycleInput.parse({ bucket: "b" })).toBeTruthy();
		});
	});

	// Spec: PUT /{bucket}?lifecycle (PutBucketLifecycleConfiguration)
	describe("SetBucketLifecycle request", () => {
		it("requires at least one rule", () => {
			expect(() => SetBucketLifecycleInput.parse({ bucket: "b", rules: [] })).toThrow();
		});

		it("accepts valid lifecycle rule", () => {
			const result = SetBucketLifecycleInput.parse({
				bucket: "b",
				rules: [{ Status: "Enabled", Expiration: { Days: 30 } }],
			});
			expect(result.rules[0].Status).toBe("Enabled");
		});
	});

	// Spec: GET /{bucket}?versioning (GetBucketVersioning)
	describe("GetBucketVersioning request", () => {
		it("requires bucket", () => {
			expect(GetBucketVersioningInput.parse({ bucket: "b" })).toBeTruthy();
		});
	});

	// Spec: PUT /{bucket}?versioning (PutBucketVersioning)
	describe("SetBucketVersioning request", () => {
		it("requires bucket and status (Enabled|Suspended)", () => {
			expect(SetBucketVersioningInput.parse({ bucket: "b", status: "Enabled" }).status).toBe(
				"Enabled",
			);
			expect(SetBucketVersioningInput.parse({ bucket: "b", status: "Suspended" }).status).toBe(
				"Suspended",
			);
		});

		it("rejects invalid versioning status", () => {
			expect(() => SetBucketVersioningInput.parse({ bucket: "b", status: "Disabled" })).toThrow();
		});
	});
});

// --- Response shape contracts ---

describe("Object Storage API response shape contracts", () => {
	describe("Bucket response", () => {
		it("matches S3 ListBuckets XML -> Bucket shape", () => {
			const xml = `<ListAllMyBucketsResult>
				<Buckets>
					<Bucket><Name>my-bucket</Name><CreationDate>2024-01-01T00:00:00.000Z</CreationDate></Bucket>
				</Buckets>
			</ListAllMyBucketsResult>`;
			const parsed = parseListBucketsXml(xml, "fr-par");
			for (const b of parsed) {
				expect(() => Bucket.parse(b)).not.toThrow();
			}
		});
	});

	describe("BucketInfo response", () => {
		it("validates composite bucket info shape", () => {
			const info = {
				name: "test",
				region: "fr-par",
				creationDate: "2024-01-01T00:00:00Z",
				objectCount: 10,
				size: 0,
				versioning: "Disabled",
			};
			expect(() => BucketInfo.parse(info)).not.toThrow();
		});
	});

	describe("S3Object response", () => {
		it("matches S3 ListObjectsV2 XML -> S3Object shape", () => {
			const xml = `<ListBucketResult>
				<IsTruncated>false</IsTruncated>
				<KeyCount>1</KeyCount>
				<Contents>
					<Key>file.txt</Key>
					<LastModified>2024-01-01T00:00:00Z</LastModified>
					<ETag>"abc123"</ETag>
					<Size>1024</Size>
					<StorageClass>STANDARD</StorageClass>
				</Contents>
			</ListBucketResult>`;
			const result = parseListObjectsV2Xml(xml);
			for (const obj of result.objects) {
				expect(() => S3Object.parse(obj)).not.toThrow();
			}
		});
	});

	describe("ObjectInfo response", () => {
		it("validates full object info shape with metadata", () => {
			const info = {
				key: "file.txt",
				size: 1024,
				lastModified: "2024-01-01T00:00:00Z",
				storageClass: "STANDARD",
				etag: "abc123",
				contentType: "text/plain",
				metadata: { author: "test" },
			};
			expect(() => ObjectInfo.parse(info)).not.toThrow();
		});
	});

	describe("BucketPolicy response", () => {
		it("validates standard S3 policy shape", () => {
			const policy = {
				Version: "2012-10-17",
				Statement: [
					{
						Effect: "Allow",
						Principal: "*",
						Action: "s3:GetObject",
						Resource: "arn:scw:s3:::my-bucket/*",
					},
				],
			};
			expect(() => BucketPolicy.parse(policy)).not.toThrow();
		});
	});

	describe("LifecycleRule response", () => {
		it("matches lifecycle XML -> LifecycleRule shape", () => {
			const xml = `<LifecycleConfiguration>
				<Rule>
					<ID>expire-logs</ID>
					<Status>Enabled</Status>
					<Prefix>logs/</Prefix>
					<Expiration><Days>90</Days></Expiration>
					<Transition><Days>30</Days><StorageClass>GLACIER</StorageClass></Transition>
				</Rule>
			</LifecycleConfiguration>`;
			const rules = parseLifecycleXml(xml);
			for (const rule of rules) {
				expect(() => LifecycleRule.parse(rule)).not.toThrow();
			}
		});
	});

	describe("Versioning response", () => {
		it("parses Enabled status", () => {
			expect(
				parseVersioningXml(
					"<VersioningConfiguration><Status>Enabled</Status></VersioningConfiguration>",
				),
			).toBe("Enabled");
		});

		it("parses Suspended status", () => {
			expect(
				parseVersioningXml(
					"<VersioningConfiguration><Status>Suspended</Status></VersioningConfiguration>",
				),
			).toBe("Suspended");
		});

		it("parses Disabled (no Status element)", () => {
			expect(parseVersioningXml("<VersioningConfiguration/>")).toBe("Disabled");
		});
	});
});

// --- Pagination contracts ---

describe("Object Storage pagination contracts", () => {
	it("ListObjectsV2 uses continuation token pagination (not page numbers)", () => {
		const schema = ListObjectsInput;
		const shape = schema.shape;
		expect(shape.continuationToken).toBeDefined();
		expect(shape.maxKeys).toBeDefined();
	});

	it("parses truncated response with NextContinuationToken", () => {
		const xml = `<ListBucketResult>
			<IsTruncated>true</IsTruncated>
			<KeyCount>1</KeyCount>
			<NextContinuationToken>next-page-token</NextContinuationToken>
			<Contents>
				<Key>file.txt</Key>
				<LastModified>2024-01-01T00:00:00Z</LastModified>
				<ETag>"abc"</ETag>
				<Size>100</Size>
			</Contents>
		</ListBucketResult>`;
		const result = parseListObjectsV2Xml(xml);
		expect(result.isTruncated).toBe(true);
		expect(result.nextContinuationToken).toBe("next-page-token");
	});

	it("non-truncated response has no NextContinuationToken", () => {
		const xml = `<ListBucketResult>
			<IsTruncated>false</IsTruncated>
			<KeyCount>0</KeyCount>
		</ListBucketResult>`;
		const result = parseListObjectsV2Xml(xml);
		expect(result.isTruncated).toBe(false);
		expect(result.nextContinuationToken).toBeUndefined();
	});
});

// --- Auth contracts ---

describe("Object Storage auth contracts", () => {
	it("S3Region only allows Scaleway regions (not AWS regions)", () => {
		for (const validRegion of ["fr-par", "nl-ams", "pl-waw"]) {
			expect(() => S3Region.parse(validRegion)).not.toThrow();
		}
		for (const invalidRegion of ["us-east-1", "eu-west-1", "ap-southeast-1"]) {
			expect(() => S3Region.parse(invalidRegion)).toThrow();
		}
	});
});

// --- Error code contracts ---

describe("Object Storage error code contracts", () => {
	it("S3 storage classes match Scaleway supported classes", () => {
		expect(() => StorageClass.parse("STANDARD")).not.toThrow();
		expect(() => StorageClass.parse("ONEZONE_IA")).not.toThrow();
		expect(() => StorageClass.parse("GLACIER")).not.toThrow();
		// Scaleway does not support these AWS classes
		expect(() => StorageClass.parse("INTELLIGENT_TIERING")).toThrow();
		expect(() => StorageClass.parse("DEEP_ARCHIVE")).toThrow();
	});

	it("VersioningStatus only allows Enabled/Suspended (not Disabled for PUT)", () => {
		expect(() => VersioningStatus.parse("Enabled")).not.toThrow();
		expect(() => VersioningStatus.parse("Suspended")).not.toThrow();
		expect(() => VersioningStatus.parse("Disabled")).toThrow();
	});

	it("Lifecycle XML roundtrips correctly", () => {
		const rules = [
			{
				ID: "test-rule",
				Status: "Enabled",
				Prefix: "test/",
				Expiration: { Days: 365 },
				Transition: { Days: 30, StorageClass: "GLACIER" },
			},
		];
		const xml = buildLifecycleXml(rules);
		const parsed = parseLifecycleXml(xml);
		expect(parsed).toHaveLength(1);
		expect(parsed[0].ID).toBe("test-rule");
		expect(parsed[0].Status).toBe("Enabled");
		expect(parsed[0].Expiration?.Days).toBe(365);
		expect(parsed[0].Transition?.StorageClass).toBe("GLACIER");
	});
});
