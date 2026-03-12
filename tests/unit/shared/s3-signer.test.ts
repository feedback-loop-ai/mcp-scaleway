import { describe, expect, it } from "vitest";
import { signS3Request } from "../../../src/shared/s3-signer.js";

describe("s3-signer", () => {
	describe("signS3Request", () => {
		it("returns headers with Authorization, x-amz-date, x-amz-content-sha256, and host", () => {
			const result = signS3Request({
				method: "GET",
				url: "https://s3.fr-par.scw.cloud",
				headers: {},
				accessKey: "SCWTEST123",
				secretKey: "secret-key-456",
				region: "fr-par",
			});

			expect(result.Authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=SCWTEST123\//);
			expect(result.Authorization).toContain("/fr-par/s3/aws4_request");
			expect(result.Authorization).toContain("SignedHeaders=");
			expect(result.Authorization).toContain("Signature=");
			expect(result["x-amz-date"]).toMatch(/^\d{8}T\d{6}Z$/);
			expect(result["x-amz-content-sha256"]).toBeTruthy();
			expect(result.host).toBe("s3.fr-par.scw.cloud");
		});

		it("includes extra headers in signed headers", () => {
			const result = signS3Request({
				method: "PUT",
				url: "https://s3.fr-par.scw.cloud/my-bucket",
				headers: { "Content-Type": "application/xml" },
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "fr-par",
			});

			expect(result.Authorization).toContain("content-type");
			expect(result["Content-Type"]).toBe("application/xml");
		});

		it("hashes body when provided as string", () => {
			const withBody = signS3Request({
				method: "PUT",
				url: "https://s3.fr-par.scw.cloud/bucket/key",
				headers: {},
				body: "hello world",
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "fr-par",
			});

			const withoutBody = signS3Request({
				method: "PUT",
				url: "https://s3.fr-par.scw.cloud/bucket/key",
				headers: {},
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "fr-par",
			});

			// Different body content should produce different payload hashes
			expect(withBody["x-amz-content-sha256"]).not.toBe(withoutBody["x-amz-content-sha256"]);
		});

		it("hashes body when provided as Buffer", () => {
			const result = signS3Request({
				method: "PUT",
				url: "https://s3.fr-par.scw.cloud/bucket/key",
				headers: {},
				body: Buffer.from("binary data"),
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "fr-par",
			});

			expect(result["x-amz-content-sha256"]).toBeTruthy();
			// SHA256 of "binary data" is deterministic
			expect(result["x-amz-content-sha256"]).toHaveLength(64);
		});

		it("handles URLs with query parameters", () => {
			const result = signS3Request({
				method: "GET",
				url: "https://s3.fr-par.scw.cloud/bucket?list-type=2&max-keys=100",
				headers: {},
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "fr-par",
			});

			expect(result.Authorization).toMatch(/^AWS4-HMAC-SHA256/);
		});

		it("handles different regions", () => {
			const frPar = signS3Request({
				method: "GET",
				url: "https://s3.fr-par.scw.cloud",
				headers: {},
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "fr-par",
			});

			const nlAms = signS3Request({
				method: "GET",
				url: "https://s3.nl-ams.scw.cloud",
				headers: {},
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "nl-ams",
			});

			expect(frPar.Authorization).toContain("/fr-par/s3/");
			expect(nlAms.Authorization).toContain("/nl-ams/s3/");
			// Different regions produce different signatures
			expect(frPar.Authorization).not.toBe(nlAms.Authorization);
		});

		it("produces deterministic signatures for same input at same time", () => {
			const params = {
				method: "GET",
				url: "https://s3.fr-par.scw.cloud",
				headers: {},
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "fr-par",
			};

			// Same second should produce same signature
			const result1 = signS3Request(params);
			const result2 = signS3Request(params);
			expect(result1.Authorization).toBe(result2.Authorization);
		});

		it("preserves original extra headers in output", () => {
			const result = signS3Request({
				method: "PUT",
				url: "https://s3.fr-par.scw.cloud/bucket/key",
				headers: {
					"x-amz-acl": "public-read",
					"x-amz-meta-author": "test",
				},
				accessKey: "SCWTEST",
				secretKey: "secret",
				region: "fr-par",
			});

			expect(result["x-amz-acl"]).toBe("public-read");
			expect(result["x-amz-meta-author"]).toBe("test");
		});
	});
});
