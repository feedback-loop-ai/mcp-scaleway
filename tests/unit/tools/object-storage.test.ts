import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildLifecycleXml,
	extractMetadata,
	handleCreateBucket,
	handleDeleteBucket,
	handleDeleteObject,
	handleGetBucketInfo,
	handleGetBucketLifecycle,
	handleGetBucketPolicy,
	handleGetBucketVersioning,
	handleGetObjectInfo,
	handleListBuckets,
	handleListObjects,
	handlePutObject,
	handleSetBucketLifecycle,
	handleSetBucketPolicy,
	handleSetBucketVersioning,
	parseKeyCount,
	parseLifecycleXml,
	parseListBucketsXml,
	parseListObjectsV2Xml,
	parseVersioningXml,
} from "../../../src/tools/object-storage/handlers.js";
import { registerObjectStorageTools } from "../../../src/tools/object-storage/index.js";
import {
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
	S3_REGIONS,
	SetBucketLifecycleInput,
	SetBucketPolicyInput,
	SetBucketVersioningInput,
	StorageClass,
	VersioningStatus,
} from "../../../src/tools/object-storage/types.js";

// --- Types / Zod schema tests ---

describe("object-storage types", () => {
	describe("S3Region", () => {
		it("accepts valid regions", () => {
			for (const r of S3_REGIONS) {
				expect(S3Region.parse(r)).toBe(r);
			}
		});

		it("rejects invalid region", () => {
			expect(() => S3Region.parse("us-east-1")).toThrow();
		});
	});

	describe("StorageClass", () => {
		it("accepts valid storage classes", () => {
			expect(StorageClass.parse("STANDARD")).toBe("STANDARD");
			expect(StorageClass.parse("ONEZONE_IA")).toBe("ONEZONE_IA");
			expect(StorageClass.parse("GLACIER")).toBe("GLACIER");
		});

		it("rejects invalid class", () => {
			expect(() => StorageClass.parse("DEEP_ARCHIVE")).toThrow();
		});
	});

	describe("BucketInfo", () => {
		it("parses a valid bucket info", () => {
			const data = {
				name: "test-bucket",
				region: "fr-par",
				creationDate: "2024-01-01T00:00:00Z",
				objectCount: 42,
				size: 1024,
				versioning: "Enabled",
			};
			expect(BucketInfo.parse(data)).toEqual(data);
		});

		it("rejects invalid versioning status", () => {
			expect(() =>
				BucketInfo.parse({
					name: "b",
					region: "fr-par",
					creationDate: "",
					objectCount: 0,
					size: 0,
					versioning: "Unknown",
				}),
			).toThrow();
		});
	});

	describe("S3Object", () => {
		it("parses valid object", () => {
			const data = {
				key: "file.txt",
				size: 100,
				lastModified: "2024-01-01T00:00:00Z",
				etag: "abc123",
			};
			const result = S3Object.parse(data);
			expect(result.key).toBe("file.txt");
			expect(result.storageClass).toBeUndefined();
		});

		it("parses object with optional storageClass", () => {
			const data = {
				key: "file.txt",
				size: 100,
				lastModified: "2024-01-01T00:00:00Z",
				etag: "abc123",
				storageClass: "GLACIER",
			};
			expect(S3Object.parse(data).storageClass).toBe("GLACIER");
		});
	});

	describe("ObjectInfo", () => {
		it("parses with optional fields", () => {
			const data = {
				key: "file.txt",
				size: 100,
				lastModified: "2024-01-01T00:00:00Z",
				etag: "abc123",
				contentType: "text/plain",
				metadata: { author: "test" },
			};
			const result = ObjectInfo.parse(data);
			expect(result.contentType).toBe("text/plain");
			expect(result.metadata).toEqual({ author: "test" });
		});
	});

	describe("ListBucketsInput", () => {
		it("allows empty input", () => {
			expect(ListBucketsInput.parse({})).toEqual({});
		});

		it("accepts region", () => {
			expect(ListBucketsInput.parse({ region: "nl-ams" }).region).toBe("nl-ams");
		});
	});

	describe("CreateBucketInput", () => {
		it("requires name", () => {
			expect(() => CreateBucketInput.parse({})).toThrow();
		});

		it("validates name length min", () => {
			expect(() => CreateBucketInput.parse({ name: "ab" })).toThrow();
		});

		it("validates name length max", () => {
			expect(() => CreateBucketInput.parse({ name: "a".repeat(64) })).toThrow();
		});

		it("accepts valid input with acl", () => {
			const result = CreateBucketInput.parse({
				name: "my-bucket",
				region: "fr-par",
				acl: "public-read",
			});
			expect(result.acl).toBe("public-read");
		});

		it("rejects invalid acl", () => {
			expect(() => CreateBucketInput.parse({ name: "my-bucket", acl: "invalid" })).toThrow();
		});
	});

	describe("DeleteBucketInput", () => {
		it("requires name", () => {
			expect(DeleteBucketInput.parse({ name: "b" }).name).toBe("b");
		});
	});

	describe("GetBucketInfoInput", () => {
		it("requires name", () => {
			expect(GetBucketInfoInput.parse({ name: "b" }).name).toBe("b");
		});
	});

	describe("ListObjectsInput", () => {
		it("requires bucket", () => {
			const result = ListObjectsInput.parse({ bucket: "b" });
			expect(result.bucket).toBe("b");
			expect(result.maxKeys).toBe(100);
		});

		it("validates maxKeys range", () => {
			expect(() => ListObjectsInput.parse({ bucket: "b", maxKeys: 0 })).toThrow();
			expect(() => ListObjectsInput.parse({ bucket: "b", maxKeys: 1001 })).toThrow();
		});

		it("accepts all optional fields", () => {
			const result = ListObjectsInput.parse({
				bucket: "b",
				prefix: "docs/",
				delimiter: "/",
				maxKeys: 50,
				continuationToken: "token123",
			});
			expect(result.prefix).toBe("docs/");
			expect(result.delimiter).toBe("/");
		});
	});

	describe("GetObjectInfoInput", () => {
		it("requires bucket and key", () => {
			expect(GetObjectInfoInput.parse({ bucket: "b", key: "k" })).toBeTruthy();
		});
	});

	describe("PutObjectInput", () => {
		it("requires bucket and key", () => {
			const result = PutObjectInput.parse({ bucket: "b", key: "k" });
			expect(result.bucket).toBe("b");
		});

		it("accepts all optional fields", () => {
			const result = PutObjectInput.parse({
				bucket: "b",
				key: "k",
				contentType: "text/plain",
				contentBase64: "aGVsbG8=",
				metadata: { foo: "bar" },
				storageClass: "GLACIER",
			});
			expect(result.storageClass).toBe("GLACIER");
		});
	});

	describe("DeleteObjectInput", () => {
		it("requires bucket and key", () => {
			expect(DeleteObjectInput.parse({ bucket: "b", key: "k" })).toBeTruthy();
		});
	});

	describe("BucketPolicy", () => {
		it("parses valid policy", () => {
			const policy = {
				Version: "2012-10-17",
				Statement: [{ Effect: "Allow", Action: "s3:GetObject" }],
			};
			expect(BucketPolicy.parse(policy).Version).toBe("2012-10-17");
		});
	});

	describe("GetBucketPolicyInput", () => {
		it("requires bucket", () => {
			expect(GetBucketPolicyInput.parse({ bucket: "b" })).toBeTruthy();
		});
	});

	describe("SetBucketPolicyInput", () => {
		it("requires bucket and policy", () => {
			expect(SetBucketPolicyInput.parse({ bucket: "b", policy: "{}" })).toBeTruthy();
		});
	});

	describe("LifecycleRule", () => {
		it("parses minimal rule", () => {
			expect(LifecycleRule.parse({ Status: "Enabled" }).Status).toBe("Enabled");
		});

		it("parses full rule with expiration and transition", () => {
			const rule = {
				ID: "expire-old",
				Status: "Enabled",
				Prefix: "logs/",
				Expiration: { Days: 30 },
				Transition: { Days: 7, StorageClass: "GLACIER" },
			};
			const result = LifecycleRule.parse(rule);
			expect(result.Expiration?.Days).toBe(30);
			expect(result.Transition?.StorageClass).toBe("GLACIER");
		});

		it("parses expiration with Date", () => {
			const rule = {
				Status: "Enabled",
				Expiration: { Date: "2025-01-01T00:00:00Z" },
			};
			expect(LifecycleRule.parse(rule).Expiration?.Date).toBe("2025-01-01T00:00:00Z");
		});
	});

	describe("GetBucketLifecycleInput", () => {
		it("requires bucket", () => {
			expect(GetBucketLifecycleInput.parse({ bucket: "b" })).toBeTruthy();
		});
	});

	describe("SetBucketLifecycleInput", () => {
		it("requires bucket and at least one rule", () => {
			const input = {
				bucket: "b",
				rules: [{ Status: "Enabled" }],
			};
			expect(SetBucketLifecycleInput.parse(input).rules).toHaveLength(1);
		});

		it("rejects empty rules", () => {
			expect(() => SetBucketLifecycleInput.parse({ bucket: "b", rules: [] })).toThrow();
		});
	});

	describe("VersioningStatus", () => {
		it("accepts Enabled and Suspended", () => {
			expect(VersioningStatus.parse("Enabled")).toBe("Enabled");
			expect(VersioningStatus.parse("Suspended")).toBe("Suspended");
		});

		it("rejects Disabled", () => {
			expect(() => VersioningStatus.parse("Disabled")).toThrow();
		});
	});

	describe("GetBucketVersioningInput", () => {
		it("requires bucket", () => {
			expect(GetBucketVersioningInput.parse({ bucket: "b" })).toBeTruthy();
		});
	});

	describe("SetBucketVersioningInput", () => {
		it("requires bucket and status", () => {
			const result = SetBucketVersioningInput.parse({
				bucket: "b",
				status: "Enabled",
			});
			expect(result.status).toBe("Enabled");
		});
	});
});

// --- XML parser tests ---

describe("XML parsing helpers", () => {
	describe("parseListBucketsXml", () => {
		it("parses valid XML with buckets", () => {
			const xml = `<ListAllMyBucketsResult>
				<Buckets>
					<Bucket><Name>bucket1</Name><CreationDate>2024-01-01T00:00:00Z</CreationDate></Bucket>
					<Bucket><Name>bucket2</Name><CreationDate>2024-06-15T12:00:00Z</CreationDate></Bucket>
				</Buckets>
			</ListAllMyBucketsResult>`;
			const result = parseListBucketsXml(xml, "fr-par");
			expect(result).toHaveLength(2);
			expect(result[0]).toEqual({
				name: "bucket1",
				region: "fr-par",
				creationDate: "2024-01-01T00:00:00Z",
			});
			expect(result[1].name).toBe("bucket2");
		});

		it("returns empty array for no buckets", () => {
			const xml = "<ListAllMyBucketsResult><Buckets></Buckets></ListAllMyBucketsResult>";
			expect(parseListBucketsXml(xml, "nl-ams")).toEqual([]);
		});
	});

	describe("parseListObjectsV2Xml", () => {
		it("parses valid objects with continuation token", () => {
			const xml = `<ListBucketResult>
				<IsTruncated>true</IsTruncated>
				<KeyCount>2</KeyCount>
				<NextContinuationToken>tok123</NextContinuationToken>
				<Contents>
					<Key>file1.txt</Key>
					<LastModified>2024-01-01T00:00:00Z</LastModified>
					<ETag>"abc123"</ETag>
					<Size>1024</Size>
					<StorageClass>STANDARD</StorageClass>
				</Contents>
				<Contents>
					<Key>file2.txt</Key>
					<LastModified>2024-02-01T00:00:00Z</LastModified>
					<ETag>def456</ETag>
					<Size>2048</Size>
				</Contents>
			</ListBucketResult>`;
			const result = parseListObjectsV2Xml(xml);
			expect(result.objects).toHaveLength(2);
			expect(result.objects[0].key).toBe("file1.txt");
			expect(result.objects[0].etag).toBe("abc123");
			expect(result.objects[0].storageClass).toBe("STANDARD");
			expect(result.objects[1].storageClass).toBeUndefined();
			expect(result.isTruncated).toBe(true);
			expect(result.nextContinuationToken).toBe("tok123");
			expect(result.keyCount).toBe(2);
		});

		it("handles empty listing", () => {
			const xml =
				"<ListBucketResult><IsTruncated>false</IsTruncated><KeyCount>0</KeyCount></ListBucketResult>";
			const result = parseListObjectsV2Xml(xml);
			expect(result.objects).toHaveLength(0);
			expect(result.isTruncated).toBe(false);
			expect(result.nextContinuationToken).toBeUndefined();
			expect(result.keyCount).toBe(0);
		});

		it("uses objects length when KeyCount missing", () => {
			const xml = `<ListBucketResult>
				<IsTruncated>false</IsTruncated>
				<Contents>
					<Key>file.txt</Key>
					<LastModified>2024-01-01T00:00:00Z</LastModified>
					<ETag>"abc"</ETag>
					<Size>100</Size>
				</Contents>
			</ListBucketResult>`;
			const result = parseListObjectsV2Xml(xml);
			expect(result.keyCount).toBe(1);
		});
	});

	describe("parseVersioningXml", () => {
		it("returns Enabled when status is Enabled", () => {
			expect(
				parseVersioningXml(
					"<VersioningConfiguration><Status>Enabled</Status></VersioningConfiguration>",
				),
			).toBe("Enabled");
		});

		it("returns Suspended when status is Suspended", () => {
			expect(
				parseVersioningXml(
					"<VersioningConfiguration><Status>Suspended</Status></VersioningConfiguration>",
				),
			).toBe("Suspended");
		});

		it("returns Disabled when no Status element", () => {
			expect(parseVersioningXml("<VersioningConfiguration></VersioningConfiguration>")).toBe(
				"Disabled",
			);
		});

		it("returns Disabled for empty string", () => {
			expect(parseVersioningXml("")).toBe("Disabled");
		});

		it("returns Disabled for unknown status", () => {
			expect(
				parseVersioningXml(
					"<VersioningConfiguration><Status>Unknown</Status></VersioningConfiguration>",
				),
			).toBe("Disabled");
		});
	});

	describe("parseKeyCount", () => {
		it("extracts key count", () => {
			expect(parseKeyCount("<KeyCount>42</KeyCount>")).toBe(42);
		});

		it("returns 0 when missing", () => {
			expect(parseKeyCount("<Result></Result>")).toBe(0);
		});
	});

	describe("parseLifecycleXml", () => {
		it("parses rules with expiration and transition", () => {
			const xml = `<LifecycleConfiguration>
				<Rule>
					<ID>rule1</ID>
					<Status>Enabled</Status>
					<Prefix>logs/</Prefix>
					<Expiration><Days>30</Days></Expiration>
					<Transition><Days>7</Days><StorageClass>GLACIER</StorageClass></Transition>
				</Rule>
			</LifecycleConfiguration>`;
			const rules = parseLifecycleXml(xml);
			expect(rules).toHaveLength(1);
			expect(rules[0].ID).toBe("rule1");
			expect(rules[0].Status).toBe("Enabled");
			expect(rules[0].Prefix).toBe("logs/");
			expect(rules[0].Expiration?.Days).toBe(30);
			expect(rules[0].Transition?.Days).toBe(7);
			expect(rules[0].Transition?.StorageClass).toBe("GLACIER");
		});

		it("parses rule with Date expiration", () => {
			const xml = `<LifecycleConfiguration>
				<Rule>
					<Status>Enabled</Status>
					<Expiration><Date>2025-01-01T00:00:00Z</Date></Expiration>
				</Rule>
			</LifecycleConfiguration>`;
			const rules = parseLifecycleXml(xml);
			expect(rules[0].Expiration?.Date).toBe("2025-01-01T00:00:00Z");
			expect(rules[0].ID).toBeUndefined();
			expect(rules[0].Prefix).toBeUndefined();
			expect(rules[0].Transition).toBeUndefined();
		});

		it("returns empty array for no rules", () => {
			expect(parseLifecycleXml("<LifecycleConfiguration></LifecycleConfiguration>")).toEqual([]);
		});

		it("parses rule without optional fields", () => {
			const xml = `<LifecycleConfiguration>
				<Rule><Status>Disabled</Status></Rule>
			</LifecycleConfiguration>`;
			const rules = parseLifecycleXml(xml);
			expect(rules[0].Status).toBe("Disabled");
			expect(rules[0].Expiration).toBeUndefined();
		});

		it("defaults Status to Disabled when Status element is missing", () => {
			const xml = `<LifecycleConfiguration>
				<Rule><Prefix>test/</Prefix></Rule>
			</LifecycleConfiguration>`;
			const rules = parseLifecycleXml(xml);
			expect(rules[0].Status).toBe("Disabled");
			expect(rules[0].Prefix).toBe("test/");
		});
	});

	describe("buildLifecycleXml", () => {
		it("builds XML with full rule", () => {
			const xml = buildLifecycleXml([
				{
					ID: "rule1",
					Status: "Enabled",
					Prefix: "logs/",
					Expiration: { Days: 30 },
					Transition: { Days: 7, StorageClass: "GLACIER" },
				},
			]);
			expect(xml).toContain("<ID>rule1</ID>");
			expect(xml).toContain("<Status>Enabled</Status>");
			expect(xml).toContain("<Prefix>logs/</Prefix>");
			expect(xml).toContain("<Days>30</Days>");
			expect(xml).toContain("<StorageClass>GLACIER</StorageClass>");
			expect(xml).toContain('<?xml version="1.0"');
			expect(xml).toContain("<LifecycleConfiguration>");
		});

		it("builds XML with minimal rule", () => {
			const xml = buildLifecycleXml([{ Status: "Disabled" }]);
			expect(xml).toContain("<Status>Disabled</Status>");
			expect(xml).not.toContain("<ID>");
			expect(xml).not.toContain("<Expiration>");
			expect(xml).not.toContain("<Transition>");
		});

		it("builds XML with date expiration", () => {
			const xml = buildLifecycleXml([
				{
					Status: "Enabled",
					Expiration: { Date: "2025-01-01T00:00:00Z" },
				},
			]);
			expect(xml).toContain("<Date>2025-01-01T00:00:00Z</Date>");
			expect(xml).not.toContain("<Days>");
		});

		it("builds XML with Prefix set to empty string", () => {
			const xml = buildLifecycleXml([{ Status: "Enabled", Prefix: "" }]);
			expect(xml).toContain("<Prefix></Prefix>");
		});

		it("builds XML with transition only", () => {
			const xml = buildLifecycleXml([
				{ Status: "Enabled", Transition: { StorageClass: "ONEZONE_IA" } },
			]);
			expect(xml).toContain("<StorageClass>ONEZONE_IA</StorageClass>");
			expect(xml).not.toContain("<Expiration>");
		});
	});

	describe("extractMetadata", () => {
		it("extracts x-amz-meta- headers", () => {
			const headers = new Headers();
			headers.set("x-amz-meta-author", "test");
			headers.set("x-amz-meta-version", "1");
			headers.set("content-type", "text/plain");
			const result = extractMetadata(headers);
			expect(result).toEqual({ author: "test", version: "1" });
		});

		it("returns undefined when no metadata headers", () => {
			const headers = new Headers();
			headers.set("content-type", "text/plain");
			expect(extractMetadata(headers)).toBeUndefined();
		});
	});
});

// --- Handler tests (with mocked fetch and auth) ---

describe("object-storage handlers", () => {
	const MOCK_CONFIG = {
		accessKey: "SCWTEST",
		secretKey: "secret-test",
		defaultProjectId: "proj-123",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	};

	beforeEach(() => {
		vi.restoreAllMocks();
		process.env.SCW_ACCESS_KEY = MOCK_CONFIG.accessKey;
		process.env.SCW_SECRET_KEY = MOCK_CONFIG.secretKey;
		process.env.SCW_DEFAULT_PROJECT_ID = MOCK_CONFIG.defaultProjectId;
		process.env.SCW_DEFAULT_REGION = MOCK_CONFIG.defaultRegion;
		process.env.SCW_DEFAULT_ZONE = MOCK_CONFIG.defaultZone;
	});

	function mockFetch(response: {
		ok: boolean;
		status?: number;
		text?: string;
		json?: unknown;
		headers?: Record<string, string>;
	}) {
		const headers = new Headers(response.headers ?? {});
		const mock = vi.fn().mockResolvedValue({
			ok: response.ok,
			status: response.status ?? (response.ok ? 200 : 500),
			text: vi.fn().mockResolvedValue(response.text ?? ""),
			json: vi.fn().mockResolvedValue(response.json ?? {}),
			headers,
		});
		vi.stubGlobal("fetch", mock);
		return mock;
	}

	function mockFetchSequence(
		responses: Array<{
			ok: boolean;
			status?: number;
			text?: string;
			json?: unknown;
			headers?: Record<string, string>;
		}>,
	) {
		let callIndex = 0;
		const mock = vi.fn().mockImplementation(() => {
			const response = responses[callIndex] ?? responses[responses.length - 1];
			callIndex++;
			const headers = new Headers(response.headers ?? {});
			return Promise.resolve({
				ok: response.ok,
				status: response.status ?? (response.ok ? 200 : 500),
				text: vi.fn().mockResolvedValue(response.text ?? ""),
				json: vi.fn().mockResolvedValue(response.json ?? {}),
				headers,
			});
		});
		vi.stubGlobal("fetch", mock);
		return mock;
	}

	describe("handleListBuckets", () => {
		it("returns buckets on success", async () => {
			const xml = `<ListAllMyBucketsResult><Buckets>
				<Bucket><Name>b1</Name><CreationDate>2024-01-01T00:00:00Z</CreationDate></Bucket>
			</Buckets></ListAllMyBucketsResult>`;
			mockFetch({ ok: true, text: xml });

			const result = await handleListBuckets({});
			expect(result.content[0].type).toBe("text");
			const data = JSON.parse(result.content[0].text);
			expect(data.buckets).toHaveLength(1);
			expect(data.buckets[0].name).toBe("b1");
		});

		it("uses custom region", async () => {
			const fetchMock = mockFetch({
				ok: true,
				text: "<ListAllMyBucketsResult><Buckets></Buckets></ListAllMyBucketsResult>",
			});

			await handleListBuckets({ region: "nl-ams" });
			expect(fetchMock).toHaveBeenCalledWith("https://s3.nl-ams.scw.cloud", expect.anything());
		});

		it("returns error on fetch failure", async () => {
			mockFetch({ ok: false, status: 403, text: "Forbidden" });

			const result = await handleListBuckets({});
			expect(result.isError).toBe(true);
		});

		it("returns error on network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));

			const result = await handleListBuckets({});
			expect(result.isError).toBe(true);
			const data = JSON.parse(result.content[0].text);
			expect(data.error.message).toBe("Network error");
		});
	});

	describe("handleCreateBucket", () => {
		it("creates bucket successfully", async () => {
			const fetchMock = mockFetch({ ok: true });
			const result = await handleCreateBucket({ name: "new-bucket" });
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toContain("new-bucket");
			expect(fetchMock).toHaveBeenCalledWith(
				"https://s3.fr-par.scw.cloud/new-bucket",
				expect.objectContaining({ method: "PUT" }),
			);
		});

		it("passes ACL header when provided", async () => {
			const fetchMock = mockFetch({ ok: true });
			await handleCreateBucket({ name: "b", acl: "public-read" });
			const callArgs = fetchMock.mock.calls[0][1];
			expect(callArgs.headers["x-amz-acl"]).toBe("public-read");
		});

		it("does not pass ACL header when not provided", async () => {
			const fetchMock = mockFetch({ ok: true });
			await handleCreateBucket({ name: "b" });
			const callArgs = fetchMock.mock.calls[0][1];
			expect(callArgs.headers["x-amz-acl"]).toBeUndefined();
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 409, text: "BucketAlreadyExists" });
			const result = await handleCreateBucket({ name: "existing" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
			const result = await handleCreateBucket({ name: "b" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteBucket", () => {
		it("deletes bucket successfully", async () => {
			mockFetch({ ok: true });
			const result = await handleDeleteBucket({ name: "old-bucket" });
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toContain("old-bucket");
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 409, text: "BucketNotEmpty" });
			const result = await handleDeleteBucket({ name: "b" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleDeleteBucket({ name: "b" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetBucketInfo", () => {
		it("returns bucket info on success", async () => {
			mockFetchSequence([
				{ ok: true, headers: { date: "2024-01-01T00:00:00Z" } },
				{
					ok: true,
					text: "<VersioningConfiguration><Status>Enabled</Status></VersioningConfiguration>",
				},
				{ ok: true, text: "<ListBucketResult><KeyCount>5</KeyCount></ListBucketResult>" },
			]);

			const result = await handleGetBucketInfo({ name: "mybucket" });
			const data = JSON.parse(result.content[0].text);
			expect(data.name).toBe("mybucket");
			expect(data.versioning).toBe("Enabled");
			expect(data.objectCount).toBe(5);
		});

		it("returns error when bucket not found", async () => {
			mockFetch({ ok: false, status: 404 });
			const result = await handleGetBucketInfo({ name: "missing" });
			expect(result.isError).toBe(true);
		});

		it("handles versioning fetch failure gracefully", async () => {
			mockFetchSequence([
				{ ok: true, headers: { date: "2024-01-01T00:00:00Z" } },
				{ ok: false, status: 500, text: "" },
				{ ok: true, text: "<ListBucketResult><KeyCount>0</KeyCount></ListBucketResult>" },
			]);

			const result = await handleGetBucketInfo({ name: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.versioning).toBe("Disabled");
		});

		it("handles list fetch failure gracefully", async () => {
			mockFetchSequence([
				{ ok: true, headers: { date: "2024-01-01T00:00:00Z" } },
				{
					ok: true,
					text: "<VersioningConfiguration></VersioningConfiguration>",
				},
				{ ok: false, status: 500, text: "" },
			]);

			const result = await handleGetBucketInfo({ name: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.objectCount).toBe(0);
		});

		it("uses fallback date when header missing", async () => {
			mockFetchSequence([
				{ ok: true },
				{ ok: true, text: "<VersioningConfiguration></VersioningConfiguration>" },
				{ ok: true, text: "<KeyCount>0</KeyCount>" },
			]);

			const result = await handleGetBucketInfo({ name: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.creationDate).toBeTruthy();
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleGetBucketInfo({ name: "b" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleListObjects", () => {
		it("returns objects on success", async () => {
			const xml = `<ListBucketResult>
				<IsTruncated>false</IsTruncated>
				<KeyCount>1</KeyCount>
				<Contents>
					<Key>file.txt</Key>
					<LastModified>2024-01-01T00:00:00Z</LastModified>
					<ETag>"abc"</ETag>
					<Size>100</Size>
				</Contents>
			</ListBucketResult>`;
			mockFetch({ ok: true, text: xml });

			const result = await handleListObjects({ bucket: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.objects).toHaveLength(1);
		});

		it("passes all query params", async () => {
			const fetchMock = mockFetch({
				ok: true,
				text: "<ListBucketResult><IsTruncated>false</IsTruncated><KeyCount>0</KeyCount></ListBucketResult>",
			});

			await handleListObjects({
				bucket: "b",
				prefix: "docs/",
				delimiter: "/",
				maxKeys: 50,
				continuationToken: "tok",
				region: "nl-ams",
			});

			const url = fetchMock.mock.calls[0][0] as string;
			expect(url).toContain("prefix=docs");
			expect(url).toContain("delimiter=");
			expect(url).toContain("max-keys=50");
			expect(url).toContain("continuation-token=tok");
			expect(url).toContain("s3.nl-ams.scw.cloud");
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 404, text: "NoSuchBucket" });
			const result = await handleListObjects({ bucket: "missing" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleListObjects({ bucket: "b" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetObjectInfo", () => {
		it("returns object info on success", async () => {
			mockFetch({
				ok: true,
				headers: {
					"content-length": "1024",
					"last-modified": "2024-01-01T00:00:00Z",
					etag: '"abc123"',
					"content-type": "text/plain",
					"x-amz-meta-author": "test",
				},
			});

			const result = await handleGetObjectInfo({ bucket: "b", key: "file.txt" });
			const data = JSON.parse(result.content[0].text);
			expect(data.key).toBe("file.txt");
			expect(data.size).toBe(1024);
			expect(data.etag).toBe("abc123");
			expect(data.contentType).toBe("text/plain");
			expect(data.metadata).toEqual({ author: "test" });
		});

		it("handles missing optional headers", async () => {
			mockFetch({ ok: true, headers: {} });

			const result = await handleGetObjectInfo({ bucket: "b", key: "k" });
			const data = JSON.parse(result.content[0].text);
			expect(data.size).toBe(0);
			expect(data.etag).toBe("");
		});

		it("returns error when object not found", async () => {
			mockFetch({ ok: false, status: 404 });
			const result = await handleGetObjectInfo({ bucket: "b", key: "missing" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleGetObjectInfo({ bucket: "b", key: "k" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handlePutObject", () => {
		it("uploads object successfully", async () => {
			mockFetch({ ok: true, headers: { etag: '"etag123"' } });

			const result = await handlePutObject({
				bucket: "b",
				key: "file.txt",
				contentBase64: Buffer.from("hello").toString("base64"),
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toContain("file.txt");
			expect(data.etag).toBe("etag123");
		});

		it("sends metadata headers", async () => {
			const fetchMock = mockFetch({ ok: true, headers: {} });
			await handlePutObject({
				bucket: "b",
				key: "k",
				metadata: { foo: "bar" },
			});
			const callHeaders = fetchMock.mock.calls[0][1].headers;
			expect(callHeaders["x-amz-meta-foo"]).toBe("bar");
		});

		it("sends storage class header", async () => {
			const fetchMock = mockFetch({ ok: true, headers: {} });
			await handlePutObject({
				bucket: "b",
				key: "k",
				storageClass: "GLACIER",
			});
			const callHeaders = fetchMock.mock.calls[0][1].headers;
			expect(callHeaders["x-amz-storage-class"]).toBe("GLACIER");
		});

		it("sends content-type header", async () => {
			const fetchMock = mockFetch({ ok: true, headers: {} });
			await handlePutObject({
				bucket: "b",
				key: "k",
				contentType: "application/json",
			});
			const callHeaders = fetchMock.mock.calls[0][1].headers;
			expect(callHeaders["Content-Type"]).toBe("application/json");
		});

		it("sends no body when contentBase64 is not provided", async () => {
			const fetchMock = mockFetch({ ok: true, headers: {} });
			await handlePutObject({ bucket: "b", key: "k" });
			expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 403, text: "AccessDenied" });
			const result = await handlePutObject({ bucket: "b", key: "k" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handlePutObject({ bucket: "b", key: "k" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleDeleteObject", () => {
		it("deletes object successfully", async () => {
			mockFetch({ ok: true });
			const result = await handleDeleteObject({ bucket: "b", key: "file.txt" });
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toContain("file.txt");
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 404, text: "NoSuchKey" });
			const result = await handleDeleteObject({ bucket: "b", key: "missing" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleDeleteObject({ bucket: "b", key: "k" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetBucketPolicy", () => {
		it("returns policy on success", async () => {
			const policy = { Version: "2012-10-17", Statement: [] };
			mockFetch({ ok: true, json: policy });
			const result = await handleGetBucketPolicy({ bucket: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.policy.Version).toBe("2012-10-17");
		});

		it("returns null policy when 404", async () => {
			mockFetch({ ok: false, status: 404, text: "NoSuchBucketPolicy" });
			const result = await handleGetBucketPolicy({ bucket: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.policy).toBeNull();
			expect(data.message).toContain("No bucket policy");
		});

		it("returns error on other failures", async () => {
			mockFetch({ ok: false, status: 403, text: "Forbidden" });
			const result = await handleGetBucketPolicy({ bucket: "b" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleGetBucketPolicy({ bucket: "b" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleSetBucketPolicy", () => {
		it("sets policy successfully", async () => {
			mockFetch({ ok: true });
			const result = await handleSetBucketPolicy({ bucket: "b", policy: "{}" });
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toContain("policy set");
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 400, text: "MalformedPolicy" });
			const result = await handleSetBucketPolicy({ bucket: "b", policy: "bad" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleSetBucketPolicy({ bucket: "b", policy: "{}" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetBucketLifecycle", () => {
		it("returns lifecycle rules on success", async () => {
			const xml = `<LifecycleConfiguration>
				<Rule><ID>r1</ID><Status>Enabled</Status><Expiration><Days>30</Days></Expiration></Rule>
			</LifecycleConfiguration>`;
			mockFetch({ ok: true, text: xml });
			const result = await handleGetBucketLifecycle({ bucket: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.rules).toHaveLength(1);
			expect(data.rules[0].ID).toBe("r1");
		});

		it("returns empty rules when 404", async () => {
			mockFetch({ ok: false, status: 404, text: "NoSuchLifecycleConfiguration" });
			const result = await handleGetBucketLifecycle({ bucket: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.rules).toEqual([]);
		});

		it("returns error on other failures", async () => {
			mockFetch({ ok: false, status: 500, text: "InternalError" });
			const result = await handleGetBucketLifecycle({ bucket: "b" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleGetBucketLifecycle({ bucket: "b" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleSetBucketLifecycle", () => {
		it("sets lifecycle rules successfully", async () => {
			const fetchMock = mockFetch({ ok: true });
			const result = await handleSetBucketLifecycle({
				bucket: "b",
				rules: [{ Status: "Enabled", Expiration: { Days: 30 } }],
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toContain("Lifecycle configuration set");
			const body = fetchMock.mock.calls[0][1].body;
			expect(body).toContain("<Days>30</Days>");
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 400, text: "MalformedXML" });
			const result = await handleSetBucketLifecycle({
				bucket: "b",
				rules: [{ Status: "Enabled" }],
			});
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleSetBucketLifecycle({
				bucket: "b",
				rules: [{ Status: "Enabled" }],
			});
			expect(result.isError).toBe(true);
		});
	});

	describe("handleGetBucketVersioning", () => {
		it("returns versioning status on success", async () => {
			mockFetch({
				ok: true,
				text: "<VersioningConfiguration><Status>Enabled</Status></VersioningConfiguration>",
			});
			const result = await handleGetBucketVersioning({ bucket: "b" });
			const data = JSON.parse(result.content[0].text);
			expect(data.versioning).toBe("Enabled");
			expect(data.bucket).toBe("b");
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 404, text: "NoSuchBucket" });
			const result = await handleGetBucketVersioning({ bucket: "b" });
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleGetBucketVersioning({ bucket: "b" });
			expect(result.isError).toBe(true);
		});
	});

	describe("handleSetBucketVersioning", () => {
		it("sets versioning successfully", async () => {
			const fetchMock = mockFetch({ ok: true });
			const result = await handleSetBucketVersioning({
				bucket: "b",
				status: "Enabled",
			});
			const data = JSON.parse(result.content[0].text);
			expect(data.message).toContain("Enabled");
			const body = fetchMock.mock.calls[0][1].body;
			expect(body).toContain("<Status>Enabled</Status>");
		});

		it("returns error on failure", async () => {
			mockFetch({ ok: false, status: 403, text: "Forbidden" });
			const result = await handleSetBucketVersioning({
				bucket: "b",
				status: "Suspended",
			});
			expect(result.isError).toBe(true);
		});

		it("handles network exception", async () => {
			vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("fail")));
			const result = await handleSetBucketVersioning({
				bucket: "b",
				status: "Enabled",
			});
			expect(result.isError).toBe(true);
		});
	});
});

// --- Registration test ---

describe("registerObjectStorageTools", () => {
	it("registers all 14 tools without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerObjectStorageTools(server)).not.toThrow();
	});
});
