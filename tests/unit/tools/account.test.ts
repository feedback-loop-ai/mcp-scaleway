import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { registerAccountTools } from "../../../src/tools/account/index.js";

// Mock auth
vi.mock("../../../src/shared/auth.js", () => ({
	loadAuthConfig: () => ({
		accessKey: "SCWXXXXXXXXXXXXXXXXX",
		secretKey: "11111111-1111-1111-1111-111111111111",
		defaultProjectId: "22222222-2222-2222-2222-222222222222",
		defaultRegion: "fr-par",
		defaultZone: "fr-par-1",
	}),
}));

// Mock client
vi.mock("../../../src/shared/client.js", () => ({
	createScalewayClient: () => ({}),
}));

const mockProject = {
	id: "33333333-3333-3333-3333-333333333333",
	name: "test-project",
	organizationId: "22222222-2222-2222-2222-222222222222",
	description: "Test",
	createdAt: new Date("2025-01-01T00:00:00Z"),
	updatedAt: new Date("2025-01-02T00:00:00Z"),
};

const mockListResponse = {
	projects: [mockProject],
	totalCount: 1,
};

// Mock SDK
vi.mock("@scaleway/sdk-account", () => {
	const ProjectAPI = vi.fn().mockImplementation(() => ({
		listProjects: vi.fn().mockResolvedValue({
			projects: [
				{
					id: "33333333-3333-3333-3333-333333333333",
					name: "test-project",
					organizationId: "22222222-2222-2222-2222-222222222222",
					description: "Test",
					createdAt: new Date("2025-01-01T00:00:00Z"),
					updatedAt: new Date("2025-01-02T00:00:00Z"),
				},
			],
			totalCount: 1,
		}),
		getProject: vi.fn().mockResolvedValue({
			id: "33333333-3333-3333-3333-333333333333",
			name: "test-project",
			organizationId: "22222222-2222-2222-2222-222222222222",
			description: "Test",
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-02T00:00:00Z"),
		}),
		createProject: vi.fn().mockResolvedValue({
			id: "33333333-3333-3333-3333-333333333333",
			name: "test-project",
			organizationId: "22222222-2222-2222-2222-222222222222",
			description: "Test",
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-02T00:00:00Z"),
		}),
		updateProject: vi.fn().mockResolvedValue({
			id: "33333333-3333-3333-3333-333333333333",
			name: "updated",
			organizationId: "22222222-2222-2222-2222-222222222222",
			description: "Updated",
			createdAt: new Date("2025-01-01T00:00:00Z"),
			updatedAt: new Date("2025-01-02T00:00:00Z"),
		}),
		deleteProject: vi.fn().mockResolvedValue(undefined),
	}));

	return { Accountv3: { ProjectAPI } };
});

async function createConnectedClient() {
	const server = new McpServer({ name: "test", version: "0.0.1" });
	registerAccountTools(server);

	const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
	const client = new Client({ name: "test-client", version: "0.0.1" });

	await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

	return client;
}

describe("account module", () => {
	it("registers all five tools without error", () => {
		const server = new McpServer({ name: "test", version: "0.0.1" });
		expect(() => registerAccountTools(server)).not.toThrow();
	});
});

describe("account tool callbacks", () => {
	let client: Client;

	beforeEach(async () => {
		client = await createConnectedClient();
	});

	afterEach(async () => {
		await client.close();
	});

	it("scaleway_account_list_projects returns projects", async () => {
		const result = await client.callTool({
			name: "scaleway_account_list_projects",
			arguments: {},
		});

		const content = result.content as Array<{ type: string; text: string }>;
		const data = JSON.parse(content[0].text);
		expect(data.projects).toHaveLength(1);
		expect(data.projects[0].id).toBe("33333333-3333-3333-3333-333333333333");
		expect(data.total_count).toBe(1);
	});

	it("scaleway_account_get_project returns a project", async () => {
		const result = await client.callTool({
			name: "scaleway_account_get_project",
			arguments: {
				project_id: "33333333-3333-3333-3333-333333333333",
			},
		});

		const content = result.content as Array<{ type: string; text: string }>;
		const data = JSON.parse(content[0].text);
		expect(data.id).toBe("33333333-3333-3333-3333-333333333333");
		expect(data.name).toBe("test-project");
	});

	it("scaleway_account_create_project returns the created project", async () => {
		const result = await client.callTool({
			name: "scaleway_account_create_project",
			arguments: {
				name: "new-project",
				description: "A new project",
			},
		});

		const content = result.content as Array<{ type: string; text: string }>;
		const data = JSON.parse(content[0].text);
		expect(data.id).toBe("33333333-3333-3333-3333-333333333333");
	});

	it("scaleway_account_update_project returns the updated project", async () => {
		const result = await client.callTool({
			name: "scaleway_account_update_project",
			arguments: {
				project_id: "33333333-3333-3333-3333-333333333333",
				name: "updated",
			},
		});

		const content = result.content as Array<{ type: string; text: string }>;
		const data = JSON.parse(content[0].text);
		expect(data.name).toBe("updated");
	});

	it("scaleway_account_delete_project returns success", async () => {
		const result = await client.callTool({
			name: "scaleway_account_delete_project",
			arguments: {
				project_id: "33333333-3333-3333-3333-333333333333",
			},
		});

		const content = result.content as Array<{ type: string; text: string }>;
		const data = JSON.parse(content[0].text);
		expect(data.message).toContain("deleted successfully");
	});
});
