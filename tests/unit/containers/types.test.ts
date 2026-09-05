import { describe, expect, it } from "vitest";
import * as schemas from "../../../src/tools/containers/types.js";
import {
	ContainerHttpOption,
	ContainerPrivacy,
	ContainerProtocol,
	ContainerRegionParam,
	CreateContainerParams,
	CreateCronParams,
	CreateDomainParams,
	CreateNamespaceParams,
	DeleteContainerParams,
	DeleteCronParams,
	DeleteDomainParams,
	DeleteNamespaceParams,
	GetContainerParams,
	GetNamespaceParams,
	ListContainersParams,
	ListCronsParams,
	ListDomainsParams,
	ListNamespacesParams,
	UpdateContainerParams,
	UpdateCronParams,
	UpdateNamespaceParams,
} from "../../../src/tools/containers/types.js";

describe("containers/types", () => {
	it.each(["DeployContainerParams", "CreateTokenParams", "DeleteTokenParams"])(
		"does not export the removed %s schema",
		(schema) => {
			expect(schemas).not.toHaveProperty(schema);
		},
	);
	describe("ContainerRegionParam", () => {
		it("accepts valid region", () => {
			expect(ContainerRegionParam.parse({ region: "fr-par" })).toEqual({
				region: "fr-par",
			});
		});

		it("allows region to be omitted", () => {
			expect(ContainerRegionParam.parse({})).toEqual({});
		});

		it("rejects invalid region format", () => {
			expect(() => ContainerRegionParam.parse({ region: "invalid" })).toThrow();
		});
	});

	describe("ContainerPrivacy", () => {
		it("accepts 'public'", () => {
			expect(ContainerPrivacy.parse("public")).toBe("public");
		});

		it("accepts 'private'", () => {
			expect(ContainerPrivacy.parse("private")).toBe("private");
		});

		it("rejects invalid value", () => {
			expect(() => ContainerPrivacy.parse("unknown")).toThrow();
		});
	});

	describe("ContainerProtocol", () => {
		it("accepts 'http1'", () => {
			expect(ContainerProtocol.parse("http1")).toBe("http1");
		});

		it("accepts 'h2c'", () => {
			expect(ContainerProtocol.parse("h2c")).toBe("h2c");
		});

		it("rejects invalid value", () => {
			expect(() => ContainerProtocol.parse("grpc")).toThrow();
		});
	});

	describe("ContainerHttpOption", () => {
		it("accepts 'enabled'", () => {
			expect(ContainerHttpOption.parse("enabled")).toBe("enabled");
		});

		it("accepts 'redirected'", () => {
			expect(ContainerHttpOption.parse("redirected")).toBe("redirected");
		});

		it("accepts 'doNotForce'", () => {
			expect(ContainerHttpOption.parse("doNotForce")).toBe("doNotForce");
		});

		it("rejects invalid value", () => {
			expect(() => ContainerHttpOption.parse("bad")).toThrow();
		});
	});

	// ─── Namespace Schemas ──────────────────────────────────────────

	describe("ListNamespacesParams", () => {
		it("parses with defaults", () => {
			const result = ListNamespacesParams.parse({});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});

		it("accepts all optional filters", () => {
			const result = ListNamespacesParams.parse({
				page: 2,
				pageSize: 10,
				region: "nl-ams",
				name: "my-ns",
				projectId: "00000000-0000-0000-0000-000000000001",
				organizationId: "00000000-0000-0000-0000-000000000002",
			});
			expect(result.name).toBe("my-ns");
			expect(result.projectId).toBe("00000000-0000-0000-0000-000000000001");
			expect(result.organizationId).toBe("00000000-0000-0000-0000-000000000002");
		});
	});

	describe("GetNamespaceParams", () => {
		it("requires namespaceId", () => {
			expect(() => GetNamespaceParams.parse({})).toThrow();
		});

		it("parses valid input", () => {
			const result = GetNamespaceParams.parse({
				namespaceId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.namespaceId).toBe("00000000-0000-0000-0000-000000000001");
		});
	});

	describe("CreateNamespaceParams", () => {
		it("requires name", () => {
			expect(() => CreateNamespaceParams.parse({})).toThrow();
		});

		it("parses full input", () => {
			const result = CreateNamespaceParams.parse({
				name: "my-ns",
				projectId: "00000000-0000-0000-0000-000000000001",
				description: "test",
				environmentVariables: { FOO: "bar" },
				secretEnvironmentVariables: [{ key: "SECRET", value: "val" }],
			});
			expect(result.name).toBe("my-ns");
			expect(result.environmentVariables).toEqual({ FOO: "bar" });
		});

		it("rejects empty name", () => {
			expect(() => CreateNamespaceParams.parse({ name: "" })).toThrow();
		});
	});

	describe("UpdateNamespaceParams", () => {
		it("requires namespaceId", () => {
			expect(() => UpdateNamespaceParams.parse({})).toThrow();
		});

		it("parses with optional fields", () => {
			const result = UpdateNamespaceParams.parse({
				namespaceId: "00000000-0000-0000-0000-000000000001",
				description: "updated",
			});
			expect(result.description).toBe("updated");
		});
	});

	describe("DeleteNamespaceParams", () => {
		it("requires namespaceId", () => {
			expect(() => DeleteNamespaceParams.parse({})).toThrow();
		});

		it("parses valid input", () => {
			const result = DeleteNamespaceParams.parse({
				namespaceId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.namespaceId).toBe("00000000-0000-0000-0000-000000000001");
		});
	});

	// ─── Container Schemas ──────────────────────────────────────────

	describe("ListContainersParams", () => {
		it("requires namespaceId", () => {
			expect(() => ListContainersParams.parse({})).toThrow();
		});

		it("parses with defaults and namespaceId", () => {
			const result = ListContainersParams.parse({
				namespaceId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
			expect(result.namespaceId).toBe("00000000-0000-0000-0000-000000000001");
		});

		it("accepts name filter", () => {
			const result = ListContainersParams.parse({
				namespaceId: "00000000-0000-0000-0000-000000000001",
				name: "my-container",
			});
			expect(result.name).toBe("my-container");
		});
	});

	describe("GetContainerParams", () => {
		it("requires containerId", () => {
			expect(() => GetContainerParams.parse({})).toThrow();
		});

		it("parses valid input", () => {
			const result = GetContainerParams.parse({
				containerId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.containerId).toBe("00000000-0000-0000-0000-000000000001");
		});
	});

	describe("CreateContainerParams", () => {
		it("requires namespaceId, name, registryImage", () => {
			expect(() => CreateContainerParams.parse({})).toThrow();
			expect(() =>
				CreateContainerParams.parse({
					namespaceId: "00000000-0000-0000-0000-000000000001",
					name: "c1",
				}),
			).toThrow();
		});

		it("parses minimal input", () => {
			const result = CreateContainerParams.parse({
				namespaceId: "00000000-0000-0000-0000-000000000001",
				name: "c1",
				registryImage: "rg.fr-par.scw.cloud/ns/img:latest",
			});
			expect(result.registryImage).toBe("rg.fr-par.scw.cloud/ns/img:latest");
		});

		it("parses full input", () => {
			const result = CreateContainerParams.parse({
				namespaceId: "00000000-0000-0000-0000-000000000001",
				name: "c1",
				registryImage: "rg.fr-par.scw.cloud/ns/img:latest",
				port: 8080,
				minScale: 0,
				maxScale: 5,
				memoryLimit: 512,
				cpuLimit: 1000,
				timeout: "300s",
				privacy: "public",
				protocol: "http1",
				httpOption: "enabled",
				description: "test container",
				environmentVariables: { NODE_ENV: "production" },
				secretEnvironmentVariables: [{ key: "DB_PASS", value: "secret" }],
			});
			expect(result.port).toBe(8080);
			expect(result.privacy).toBe("public");
		});

		it("rejects invalid port", () => {
			expect(() =>
				CreateContainerParams.parse({
					namespaceId: "00000000-0000-0000-0000-000000000001",
					name: "c1",
					registryImage: "img",
					port: 0,
				}),
			).toThrow();
			expect(() =>
				CreateContainerParams.parse({
					namespaceId: "00000000-0000-0000-0000-000000000001",
					name: "c1",
					registryImage: "img",
					port: 70000,
				}),
			).toThrow();
		});

		it("rejects negative minScale", () => {
			expect(() =>
				CreateContainerParams.parse({
					namespaceId: "00000000-0000-0000-0000-000000000001",
					name: "c1",
					registryImage: "img",
					minScale: -1,
				}),
			).toThrow();
		});
	});

	describe("UpdateContainerParams", () => {
		it("requires containerId", () => {
			expect(() => UpdateContainerParams.parse({})).toThrow();
		});

		it("parses with optional fields", () => {
			const result = UpdateContainerParams.parse({
				containerId: "00000000-0000-0000-0000-000000000001",
				memoryLimit: 1024,
				privacy: "private",
			});
			expect(result.memoryLimit).toBe(1024);
			expect(result.privacy).toBe("private");
		});
	});

	describe("DeleteContainerParams", () => {
		it("requires containerId", () => {
			expect(() => DeleteContainerParams.parse({})).toThrow();
		});

		it("parses valid input", () => {
			const result = DeleteContainerParams.parse({
				containerId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.containerId).toBe("00000000-0000-0000-0000-000000000001");
		});
	});

	// ─── Cron Schemas ───────────────────────────────────────────────

	describe("ListCronsParams", () => {
		it("requires containerId", () => {
			expect(() => ListCronsParams.parse({})).toThrow();
		});

		it("parses with defaults", () => {
			const result = ListCronsParams.parse({
				containerId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
		});
	});

	describe("CreateCronParams", () => {
		it("requires containerId and schedule", () => {
			expect(() => CreateCronParams.parse({})).toThrow();
			expect(() =>
				CreateCronParams.parse({
					containerId: "00000000-0000-0000-0000-000000000001",
				}),
			).toThrow();
		});

		it("parses full input", () => {
			const result = CreateCronParams.parse({
				containerId: "00000000-0000-0000-0000-000000000001",
				schedule: "0 * * * *",
				args: { key: "value" },
				name: "my-cron",
			});
			expect(result.schedule).toBe("0 * * * *");
			expect(result.args).toEqual({ key: "value" });
		});
	});

	describe("UpdateCronParams", () => {
		it("requires cronId", () => {
			expect(() => UpdateCronParams.parse({})).toThrow();
		});

		it("parses with optional fields", () => {
			const result = UpdateCronParams.parse({
				cronId: "00000000-0000-0000-0000-000000000001",
				schedule: "*/5 * * * *",
			});
			expect(result.schedule).toBe("*/5 * * * *");
		});
	});

	describe("DeleteCronParams", () => {
		it("requires cronId", () => {
			expect(() => DeleteCronParams.parse({})).toThrow();
		});

		it("parses valid input", () => {
			const result = DeleteCronParams.parse({
				cronId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.cronId).toBe("00000000-0000-0000-0000-000000000001");
		});
	});

	// ─── Domain Schemas ─────────────────────────────────────────────

	describe("ListDomainsParams", () => {
		it("requires containerId", () => {
			expect(() => ListDomainsParams.parse({})).toThrow();
		});

		it("parses with defaults", () => {
			const result = ListDomainsParams.parse({
				containerId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.page).toBe(1);
		});
	});

	describe("CreateDomainParams", () => {
		it("requires containerId and hostname", () => {
			expect(() => CreateDomainParams.parse({})).toThrow();
			expect(() =>
				CreateDomainParams.parse({
					containerId: "00000000-0000-0000-0000-000000000001",
				}),
			).toThrow();
		});

		it("parses valid input", () => {
			const result = CreateDomainParams.parse({
				containerId: "00000000-0000-0000-0000-000000000001",
				hostname: "app.example.com",
			});
			expect(result.hostname).toBe("app.example.com");
		});
	});

	describe("DeleteDomainParams", () => {
		it("requires domainId", () => {
			expect(() => DeleteDomainParams.parse({})).toThrow();
		});

		it("parses valid input", () => {
			const result = DeleteDomainParams.parse({
				domainId: "00000000-0000-0000-0000-000000000001",
			});
			expect(result.domainId).toBe("00000000-0000-0000-0000-000000000001");
		});
	});
});

describe("containers v1 additions and exact numeric units", () => {
	const required = {
		namespaceId: "00000000-0000-0000-0000-000000000001",
		name: "app",
		registryImage: "example/app:1",
	};
	it("accepts it-mil and the new HTTPS-only boolean", () => {
		expect(
			CreateContainerParams.parse({ ...required, region: "it-mil", httpsConnectionsOnly: false })
				.httpsConnectionsOnly,
		).toBe(false);
	});
	it.each([0, -1, 1.5, 8589934592])("rejects inexact or invalid MiB memory %s", (memoryLimit) => {
		expect(() => CreateContainerParams.parse({ ...required, memoryLimit })).toThrow();
		expect(() =>
			UpdateContainerParams.parse({ containerId: required.namespaceId, memoryLimit }),
		).toThrow();
	});
	it.each([0, -1, 1.5, 4294967296])("rejects invalid CPU millicores %s", (cpuLimit) => {
		expect(() => CreateContainerParams.parse({ ...required, cpuLimit })).toThrow();
		expect(() =>
			UpdateContainerParams.parse({ containerId: required.namespaceId, cpuLimit }),
		).toThrow();
	});
	it("keeps timezone optional and allows explicitly updating it", () => {
		expect(
			CreateCronParams.parse({ containerId: required.namespaceId, schedule: "0 * * * *" }).timezone,
		).toBeUndefined();
		expect(
			UpdateCronParams.parse({ cronId: required.namespaceId, timezone: "Europe/Paris" }).timezone,
		).toBe("Europe/Paris");
	});
	it("rejects empty cron name and timezone", () => {
		expect(() =>
			CreateCronParams.parse({
				containerId: required.namespaceId,
				schedule: "0 * * * *",
				name: "",
			}),
		).toThrow();
		expect(() => UpdateCronParams.parse({ cronId: required.namespaceId, timezone: "" })).toThrow();
	});
});
