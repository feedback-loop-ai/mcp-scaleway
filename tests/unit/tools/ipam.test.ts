import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";
import {
	buildUrlParams,
	handleBookIP,
	handleGetIP,
	handleListIPs,
	handleReleaseIP,
	handleUpdateIP,
} from "../../../src/tools/ipam/handlers.js";
import { registerIpamTools } from "../../../src/tools/ipam/index.js";
import {
	BookIPInput,
	CustomResource,
	GetIPInput,
	ListIPsInput,
	ListIPsOrderBy,
	ReleaseIPInput,
	Resource,
	ResourceType,
	Reverse,
	Source,
	UpdateIPInput,
} from "../../../src/tools/ipam/types.js";

// --- Mock auth and client ---
const mockFetch = vi.fn();

vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
		defaultProjectId: "00000000-0000-0000-0000-000000000000",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({
		fetch: mockFetch,
	}),
}));

// --- Schema Validation Tests ---

describe("IPAM types", () => {
	describe("ResourceType", () => {
		it("accepts valid resource types", () => {
			expect(ResourceType.parse("instance_server")).toBe("instance_server");
			expect(ResourceType.parse("lb_server")).toBe("lb_server");
			expect(ResourceType.parse("custom")).toBe("custom");
			expect(ResourceType.parse("unknown_type")).toBe("unknown_type");
		});

		it("rejects invalid resource types", () => {
			expect(() => ResourceType.parse("invalid")).toThrow();
		});
	});

	describe("ListIPsOrderBy", () => {
		it("accepts valid order_by values", () => {
			expect(ListIPsOrderBy.parse("created_at_desc")).toBe("created_at_desc");
			expect(ListIPsOrderBy.parse("attached_at_asc")).toBe("attached_at_asc");
		});

		it("rejects invalid order_by values", () => {
			expect(() => ListIPsOrderBy.parse("invalid_order")).toThrow();
		});
	});

	describe("Source", () => {
		it("accepts zonal source", () => {
			const result = Source.parse({ zonal: "fr-par-1" });
			expect(result.zonal).toBe("fr-par-1");
		});

		it("accepts private_network_id source", () => {
			const result = Source.parse({
				private_network_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.private_network_id).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("accepts subnet_id source", () => {
			const result = Source.parse({
				subnet_id: "22222222-2222-2222-2222-222222222222",
			});
			expect(result.subnet_id).toBe("22222222-2222-2222-2222-222222222222");
		});

		it("accepts empty object", () => {
			const result = Source.parse({});
			expect(result).toEqual({});
		});

		it("rejects invalid private_network_id (not UUID)", () => {
			expect(() => Source.parse({ private_network_id: "not-a-uuid" })).toThrow();
		});

		it("accepts null values", () => {
			const result = Source.parse({ zonal: null, private_network_id: null });
			expect(result.zonal).toBeNull();
			expect(result.private_network_id).toBeNull();
		});
	});

	describe("Resource", () => {
		it("accepts valid resource", () => {
			const result = Resource.parse({
				type: "instance_server",
				id: "33333333-3333-3333-3333-333333333333",
				mac_address: "de:ad:be:ef:00:01",
				name: "my-server",
			});
			expect(result.type).toBe("instance_server");
			expect(result.id).toBe("33333333-3333-3333-3333-333333333333");
		});

		it("accepts resource with nullable fields", () => {
			const result = Resource.parse({
				type: "custom",
				id: "44444444-4444-4444-4444-444444444444",
				mac_address: null,
				name: null,
			});
			expect(result.mac_address).toBeNull();
			expect(result.name).toBeNull();
		});

		it("rejects missing required fields", () => {
			expect(() => Resource.parse({ type: "custom" })).toThrow();
			expect(() => Resource.parse({ id: "44444444-4444-4444-4444-444444444444" })).toThrow();
		});
	});

	describe("Reverse", () => {
		it("accepts valid reverse", () => {
			const result = Reverse.parse({ hostname: "example.com", address: "10.0.0.1" });
			expect(result.hostname).toBe("example.com");
			expect(result.address).toBe("10.0.0.1");
		});

		it("accepts reverse with null address", () => {
			const result = Reverse.parse({ hostname: "example.com", address: null });
			expect(result.address).toBeNull();
		});

		it("rejects missing hostname", () => {
			expect(() => Reverse.parse({ address: "10.0.0.1" })).toThrow();
		});
	});

	describe("CustomResource", () => {
		it("accepts valid custom resource", () => {
			const result = CustomResource.parse({ mac_address: "de:ad:be:ef:00:01", name: "my-res" });
			expect(result.mac_address).toBe("de:ad:be:ef:00:01");
		});

		it("accepts without optional name", () => {
			const result = CustomResource.parse({ mac_address: "de:ad:be:ef:00:01" });
			expect(result.name).toBeUndefined();
		});

		it("rejects missing mac_address", () => {
			expect(() => CustomResource.parse({ name: "test" })).toThrow();
		});
	});

	describe("ListIPsInput", () => {
		it("accepts minimal input with defaults", () => {
			const result = ListIPsInput.parse({ region: "fr-par" });
			expect(result.region).toBe("fr-par");
			expect(result.page).toBe(1);
			expect(result.pageSize).toBe(50);
			expect(result.order_by).toBe("created_at_desc");
		});

		it("accepts full input with all filters", () => {
			const result = ListIPsInput.parse({
				region: "nl-ams",
				page: 2,
				pageSize: 25,
				order_by: "updated_at_asc",
				project_id: "55555555-5555-5555-5555-555555555555",
				zonal: "nl-ams-1",
				private_network_id: "66666666-6666-6666-6666-666666666666",
				subnet_id: "77777777-7777-7777-7777-777777777777",
				vpc_id: "88888888-8888-8888-8888-888888888888",
				attached: true,
				resource_type: "instance_server",
				resource_id: "99999999-9999-9999-9999-999999999999",
				mac_address: "de:ad:be:ef:00:01",
				tags: ["env:prod", "team:infra"],
				is_ipv6: false,
				resource_name: "web-server",
				organization_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});
			expect(result.page).toBe(2);
			expect(result.pageSize).toBe(25);
			expect(result.attached).toBe(true);
			expect(result.tags).toEqual(["env:prod", "team:infra"]);
		});

		it("rejects invalid region format", () => {
			expect(() => ListIPsInput.parse({ region: "invalid" })).toThrow();
		});

		it("rejects page size over 100", () => {
			expect(() => ListIPsInput.parse({ region: "fr-par", pageSize: 101 })).toThrow();
		});

		it("rejects page size of 0", () => {
			expect(() => ListIPsInput.parse({ region: "fr-par", pageSize: 0 })).toThrow();
		});
	});

	describe("GetIPInput", () => {
		it("accepts valid input", () => {
			const result = GetIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.ip_id).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("rejects invalid UUID", () => {
			expect(() => GetIPInput.parse({ region: "fr-par", ip_id: "not-uuid" })).toThrow();
		});

		it("rejects invalid region", () => {
			expect(() =>
				GetIPInput.parse({
					region: "bad",
					ip_id: "11111111-1111-1111-1111-111111111111",
				}),
			).toThrow();
		});
	});

	describe("BookIPInput", () => {
		it("accepts minimal input with defaults", () => {
			const result = BookIPInput.parse({
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
				source: { zonal: "fr-par-1" },
			});
			expect(result.is_ipv6).toBe(false);
			expect(result.tags).toEqual([]);
		});

		it("accepts full input", () => {
			const result = BookIPInput.parse({
				region: "fr-par",
				project_id: "11111111-1111-1111-1111-111111111111",
				source: { private_network_id: "22222222-2222-2222-2222-222222222222" },
				is_ipv6: true,
				address: "10.0.0.5/32",
				tags: ["env:dev"],
				resource: { mac_address: "de:ad:be:ef:00:01", name: "custom-res" },
			});
			expect(result.is_ipv6).toBe(true);
			expect(result.address).toBe("10.0.0.5/32");
			expect(result.resource?.mac_address).toBe("de:ad:be:ef:00:01");
		});

		it("rejects missing required fields", () => {
			expect(() => BookIPInput.parse({ region: "fr-par" })).toThrow();
			expect(() =>
				BookIPInput.parse({
					region: "fr-par",
					project_id: "11111111-1111-1111-1111-111111111111",
				}),
			).toThrow();
		});
	});

	describe("ReleaseIPInput", () => {
		it("accepts valid input", () => {
			const result = ReleaseIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.ip_id).toBe("11111111-1111-1111-1111-111111111111");
		});

		it("rejects missing ip_id", () => {
			expect(() => ReleaseIPInput.parse({ region: "fr-par" })).toThrow();
		});
	});

	describe("UpdateIPInput", () => {
		it("accepts tags update", () => {
			const result = UpdateIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:prod"],
			});
			expect(result.tags).toEqual(["env:prod"]);
		});

		it("accepts reverses update", () => {
			const result = UpdateIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				reverses: [{ hostname: "example.com", address: "10.0.0.1" }],
			});
			expect(result.reverses).toHaveLength(1);
		});

		it("accepts update with no optional fields", () => {
			const result = UpdateIPInput.parse({
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});
			expect(result.tags).toBeUndefined();
			expect(result.reverses).toBeUndefined();
		});
	});
});

// --- buildUrlParams Tests ---

describe("buildUrlParams", () => {
	it("skips undefined values", () => {
		const result = buildUrlParams({ a: "hello", b: undefined });
		expect(result.get("a")).toBe("hello");
		expect(result.has("b")).toBe(false);
	});

	it("skips null values", () => {
		const result = buildUrlParams({ a: "hello", b: null });
		expect(result.get("a")).toBe("hello");
		expect(result.has("b")).toBe(false);
	});

	it("handles arrays by appending each item", () => {
		const result = buildUrlParams({ tags: ["env:prod", "team:infra"] });
		expect(result.getAll("tags")).toEqual(["env:prod", "team:infra"]);
	});

	it("handles scalar values", () => {
		const result = buildUrlParams({ page: 1, active: true });
		expect(result.get("page")).toBe("1");
		expect(result.get("active")).toBe("true");
	});

	it("handles empty params", () => {
		const result = buildUrlParams({});
		expect(result.toString()).toBe("");
	});
});

// --- Handler Tests ---

function createMockClient(fetchMock: Mock) {
	return { fetch: fetchMock, settings: {} } as never;
}

const SAMPLE_IP = {
	id: "11111111-1111-1111-1111-111111111111",
	address: "10.0.0.1/32",
	project_id: "22222222-2222-2222-2222-222222222222",
	is_ipv6: false,
	created_at: "2025-01-01T00:00:00Z",
	updated_at: "2025-01-01T00:00:00Z",
	source: { zonal: "fr-par-1" },
	resource: null,
	tags: ["env:dev"],
	reverses: [],
	region: "fr-par",
	zone: "fr-par-1",
};

describe("IPAM handlers", () => {
	let fetchMock: Mock;

	beforeEach(() => {
		fetchMock = vi.fn();
	});

	describe("handleListIPs", () => {
		it("returns paginated IP list", async () => {
			fetchMock.mockResolvedValue({ ips: [SAMPLE_IP], total_count: 1 });
			const client = createMockClient(fetchMock);

			const result = await handleListIPs(client, {
				region: "fr-par",
				page: 1,
				pageSize: 50,
				order_by: "created_at_desc",
			});

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.items).toHaveLength(1);
			expect(parsed.totalCount).toBe(1);
			expect(parsed.page).toBe(1);
			expect(parsed.pageSize).toBe(50);

			// Verify the fetch call
			expect(fetchMock).toHaveBeenCalledOnce();
			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("GET");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips");
		});

		it("passes all filter parameters", async () => {
			fetchMock.mockResolvedValue({ ips: [], total_count: 0 });
			const client = createMockClient(fetchMock);

			await handleListIPs(client, {
				region: "nl-ams",
				page: 2,
				pageSize: 25,
				order_by: "updated_at_asc",
				project_id: "55555555-5555-5555-5555-555555555555",
				zonal: "nl-ams-1",
				private_network_id: "66666666-6666-6666-6666-666666666666",
				subnet_id: "77777777-7777-7777-7777-777777777777",
				vpc_id: "88888888-8888-8888-8888-888888888888",
				attached: true,
				resource_type: "instance_server",
				resource_id: "99999999-9999-9999-9999-999999999999",
				mac_address: "de:ad:be:ef:00:01",
				tags: ["env:prod"],
				is_ipv6: false,
				resource_name: "web-server",
				organization_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
			});

			const [request] = fetchMock.mock.calls[0];
			expect(request.path).toBe("/ipam/v1/regions/nl-ams/ips");
			const urlParams: URLSearchParams = request.urlParams;
			expect(urlParams.get("page")).toBe("2");
			expect(urlParams.get("page_size")).toBe("25");
			expect(urlParams.get("order_by")).toBe("updated_at_asc");
			expect(urlParams.get("project_id")).toBe("55555555-5555-5555-5555-555555555555");
			expect(urlParams.get("zonal")).toBe("nl-ams-1");
			expect(urlParams.get("attached")).toBe("true");
			expect(urlParams.get("is_ipv6")).toBe("false");
			expect(urlParams.get("resource_name")).toBe("web-server");
		});

		it("handles API errors", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			fetchMock.mockRejectedValue(err);
			const client = createMockClient(fetchMock);

			const result = await handleListIPs(client, {
				region: "fr-par",
				page: 1,
				pageSize: 50,
				order_by: "created_at_desc",
			});

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
			expect(parsed.error.statusCode).toBe(404);
		});

		it("handles non-Error thrown values", async () => {
			fetchMock.mockRejectedValue("unexpected string error");
			const client = createMockClient(fetchMock);

			const result = await handleListIPs(client, {
				region: "fr-par",
				page: 1,
				pageSize: 50,
				order_by: "created_at_desc",
			});

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("server_error");
		});
	});

	describe("handleGetIP", () => {
		it("returns IP details", async () => {
			fetchMock.mockResolvedValue(SAMPLE_IP);
			const client = createMockClient(fetchMock);

			const result = await handleGetIP(client, {
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("11111111-1111-1111-1111-111111111111");

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("GET");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips/11111111-1111-1111-1111-111111111111");
		});

		it("handles API errors", async () => {
			const err = new Error("permission denied");
			(err as Error & { statusCode: number }).statusCode = 403;
			fetchMock.mockRejectedValue(err);
			const client = createMockClient(fetchMock);

			const result = await handleGetIP(client, {
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("permission_denied");
		});
	});

	describe("handleBookIP", () => {
		it("books an IP with minimal params", async () => {
			fetchMock.mockResolvedValue(SAMPLE_IP);
			const client = createMockClient(fetchMock);

			const result = await handleBookIP(client, {
				region: "fr-par",
				project_id: "22222222-2222-2222-2222-222222222222",
				source: { zonal: "fr-par-1" },
				is_ipv6: false,
				tags: [],
			});

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.id).toBe("11111111-1111-1111-1111-111111111111");

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("POST");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips");
			expect(request.headers?.["Content-Type"]).toBe("application/json");

			const body = JSON.parse(request.body);
			expect(body.project_id).toBe("22222222-2222-2222-2222-222222222222");
			expect(body.source.zonal).toBe("fr-par-1");
			expect(body.is_ipv6).toBe(false);
		});

		it("books an IP with address and resource", async () => {
			fetchMock.mockResolvedValue(SAMPLE_IP);
			const client = createMockClient(fetchMock);

			await handleBookIP(client, {
				region: "fr-par",
				project_id: "22222222-2222-2222-2222-222222222222",
				source: { private_network_id: "33333333-3333-3333-3333-333333333333" },
				is_ipv6: false,
				address: "10.0.0.5/32",
				tags: ["env:test"],
				resource: { mac_address: "de:ad:be:ef:00:01", name: "my-res" },
			});

			const [request] = fetchMock.mock.calls[0];
			const body = JSON.parse(request.body);
			expect(body.address).toBe("10.0.0.5/32");
			expect(body.resource.mac_address).toBe("de:ad:be:ef:00:01");
			expect(body.tags).toEqual(["env:test"]);
		});

		it("handles API errors", async () => {
			const err = new Error("bad request");
			(err as Error & { statusCode: number }).statusCode = 400;
			fetchMock.mockRejectedValue(err);
			const client = createMockClient(fetchMock);

			const result = await handleBookIP(client, {
				region: "fr-par",
				project_id: "22222222-2222-2222-2222-222222222222",
				source: { zonal: "fr-par-1" },
				is_ipv6: false,
				tags: [],
			});

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("invalid_input");
		});
	});

	describe("handleReleaseIP", () => {
		it("releases an IP successfully", async () => {
			fetchMock.mockResolvedValue(undefined);
			const client = createMockClient(fetchMock);

			const result = await handleReleaseIP(client, {
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.success).toBe(true);
			expect(parsed.ip_id).toBe("11111111-1111-1111-1111-111111111111");

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("DELETE");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips/11111111-1111-1111-1111-111111111111");
		});

		it("handles API errors", async () => {
			const err = new Error("not found");
			(err as Error & { statusCode: number }).statusCode = 404;
			fetchMock.mockRejectedValue(err);
			const client = createMockClient(fetchMock);

			const result = await handleReleaseIP(client, {
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("not_found");
		});
	});

	describe("handleUpdateIP", () => {
		it("updates IP tags", async () => {
			const updatedIP = { ...SAMPLE_IP, tags: ["env:prod", "team:infra"] };
			fetchMock.mockResolvedValue(updatedIP);
			const client = createMockClient(fetchMock);

			const result = await handleUpdateIP(client, {
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				tags: ["env:prod", "team:infra"],
			});

			expect(result.content[0].type).toBe("text");
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.tags).toEqual(["env:prod", "team:infra"]);

			const [request] = fetchMock.mock.calls[0];
			expect(request.method).toBe("PATCH");
			expect(request.path).toBe("/ipam/v1/regions/fr-par/ips/11111111-1111-1111-1111-111111111111");
			expect(request.headers?.["Content-Type"]).toBe("application/json");

			const body = JSON.parse(request.body);
			expect(body.tags).toEqual(["env:prod", "team:infra"]);
		});

		it("updates IP reverses", async () => {
			const updatedIP = {
				...SAMPLE_IP,
				reverses: [{ hostname: "example.com", address: "10.0.0.1" }],
			};
			fetchMock.mockResolvedValue(updatedIP);
			const client = createMockClient(fetchMock);

			await handleUpdateIP(client, {
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				reverses: [{ hostname: "example.com", address: "10.0.0.1" }],
			});

			const [request] = fetchMock.mock.calls[0];
			const body = JSON.parse(request.body);
			expect(body.reverses).toEqual([{ hostname: "example.com", address: "10.0.0.1" }]);
		});

		it("sends empty body when no updates provided", async () => {
			fetchMock.mockResolvedValue(SAMPLE_IP);
			const client = createMockClient(fetchMock);

			await handleUpdateIP(client, {
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
			});

			const [request] = fetchMock.mock.calls[0];
			const body = JSON.parse(request.body);
			expect(body).toEqual({});
		});

		it("handles API errors", async () => {
			const err = new Error("rate limited");
			(err as Error & { statusCode: number }).statusCode = 429;
			fetchMock.mockRejectedValue(err);
			const client = createMockClient(fetchMock);

			const result = await handleUpdateIP(client, {
				region: "fr-par",
				ip_id: "11111111-1111-1111-1111-111111111111",
				tags: ["test"],
			});

			expect((result as { isError: boolean }).isError).toBe(true);
			const parsed = JSON.parse(result.content[0].text);
			expect(parsed.error.type).toBe("rate_limited");
		});
	});
});

// --- Registration Tests ---

describe("ipam module registration", () => {
	it("registers without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerIpamTools(server)).not.toThrow();
	});

	it("registers all 5 IPAM tools and callbacks work", async () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		const toolSpy = vi.spyOn(server, "tool");
		registerIpamTools(server);

		expect(toolSpy).toHaveBeenCalledTimes(5);

		const toolNames = toolSpy.mock.calls.map((call) => call[0]);
		expect(toolNames).toContain("scaleway_ipam_list_ips");
		expect(toolNames).toContain("scaleway_ipam_get_ip");
		expect(toolNames).toContain("scaleway_ipam_book_ip");
		expect(toolNames).toContain("scaleway_ipam_release_ip");
		expect(toolNames).toContain("scaleway_ipam_update_ip");

		// Exercise each callback to get coverage on index.ts tool registration code
		const sampleIP = {
			id: "11111111-1111-1111-1111-111111111111",
			address: "10.0.0.1/32",
			project_id: "22222222-2222-2222-2222-222222222222",
			is_ipv6: false,
			created_at: "2025-01-01T00:00:00Z",
			updated_at: "2025-01-01T00:00:00Z",
			source: { zonal: "fr-par-1" },
			resource: null,
			tags: [],
			reverses: [],
			region: "fr-par",
			zone: "fr-par-1",
		};

		// list_ips callback
		mockFetch.mockResolvedValue({ ips: [sampleIP], total_count: 1 });
		const listCb = toolSpy.mock.calls.find((c) => c[0] === "scaleway_ipam_list_ips")?.[3] as (
			params: Record<string, unknown>,
		) => Promise<unknown>;
		const listResult = await listCb({ region: "fr-par" });
		expect(listResult).toBeDefined();

		// get_ip callback
		mockFetch.mockResolvedValue(sampleIP);
		const getCb = toolSpy.mock.calls.find((c) => c[0] === "scaleway_ipam_get_ip")?.[3] as (
			params: Record<string, unknown>,
		) => Promise<unknown>;
		const getResult = await getCb({
			region: "fr-par",
			ip_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(getResult).toBeDefined();

		// book_ip callback
		mockFetch.mockResolvedValue(sampleIP);
		const bookCb = toolSpy.mock.calls.find((c) => c[0] === "scaleway_ipam_book_ip")?.[3] as (
			params: Record<string, unknown>,
		) => Promise<unknown>;
		const bookResult = await bookCb({
			region: "fr-par",
			project_id: "22222222-2222-2222-2222-222222222222",
			source: { zonal: "fr-par-1" },
		});
		expect(bookResult).toBeDefined();

		// release_ip callback
		mockFetch.mockResolvedValue(undefined);
		const releaseCb = toolSpy.mock.calls.find((c) => c[0] === "scaleway_ipam_release_ip")?.[3] as (
			params: Record<string, unknown>,
		) => Promise<unknown>;
		const releaseResult = await releaseCb({
			region: "fr-par",
			ip_id: "11111111-1111-1111-1111-111111111111",
		});
		expect(releaseResult).toBeDefined();

		// update_ip callback
		mockFetch.mockResolvedValue(sampleIP);
		const updateCb = toolSpy.mock.calls.find((c) => c[0] === "scaleway_ipam_update_ip")?.[3] as (
			params: Record<string, unknown>,
		) => Promise<unknown>;
		const updateResult = await updateCb({
			region: "fr-par",
			ip_id: "11111111-1111-1111-1111-111111111111",
			tags: ["test"],
		});
		expect(updateResult).toBeDefined();

		toolSpy.mockRestore();
	});
});
