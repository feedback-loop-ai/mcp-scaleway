import { z } from "zod";
import { PaginationParams, ScalewayRegion } from "../../shared/types.js";

// ─── Shared ──────────────────────────────────────────────────────────

export const ContainerRegionParam = z.object({
	region: ScalewayRegion.optional().describe(
		"Scaleway region (e.g. fr-par). Defaults to account default region",
	),
});

// ─── Namespace ───────────────────────────────────────────────────────

export const ListNamespacesParams = PaginationParams.merge(ContainerRegionParam).merge(
	z.object({
		name: z.string().optional().describe("Filter by namespace name"),
		projectId: z.string().uuid().optional().describe("Filter by project ID"),
		organizationId: z.string().uuid().optional().describe("Filter by organization ID"),
	}),
);
export type ListNamespacesParams = z.infer<typeof ListNamespacesParams>;

export const GetNamespaceParams = ContainerRegionParam.merge(
	z.object({
		namespaceId: z.string().uuid().describe("Namespace ID"),
	}),
);
export type GetNamespaceParams = z.infer<typeof GetNamespaceParams>;

export const CreateNamespaceParams = ContainerRegionParam.merge(
	z.object({
		name: z.string().min(1).describe("Namespace name"),
		projectId: z.string().uuid().optional().describe("Project ID"),
		description: z.string().optional().describe("Namespace description"),
		environmentVariables: z
			.record(z.string(), z.string())
			.optional()
			.describe("Environment variables for all containers in this namespace"),
		secretEnvironmentVariables: z
			.array(z.object({ key: z.string(), value: z.string() }))
			.optional()
			.describe("Secret environment variables (write-only)"),
	}),
);
export type CreateNamespaceParams = z.infer<typeof CreateNamespaceParams>;

export const UpdateNamespaceParams = ContainerRegionParam.merge(
	z.object({
		namespaceId: z.string().uuid().describe("Namespace ID"),
		description: z.string().optional().describe("Updated description"),
		environmentVariables: z
			.record(z.string(), z.string())
			.optional()
			.describe("Updated environment variables"),
		secretEnvironmentVariables: z
			.array(z.object({ key: z.string(), value: z.string() }))
			.optional()
			.describe("Updated secret environment variables (write-only)"),
	}),
);
export type UpdateNamespaceParams = z.infer<typeof UpdateNamespaceParams>;

export const DeleteNamespaceParams = ContainerRegionParam.merge(
	z.object({
		namespaceId: z.string().uuid().describe("Namespace ID to delete"),
	}),
);
export type DeleteNamespaceParams = z.infer<typeof DeleteNamespaceParams>;

// ─── Container ───────────────────────────────────────────────────────

export const ContainerPrivacy = z.enum(["public", "private"]).describe("Container privacy setting");

export const ContainerProtocol = z.enum(["http1", "h2c"]).describe("Container protocol");

export const ContainerHttpOption = z
	.enum(["enabled", "redirected", "doNotForce"])
	.describe("HTTP option for the container");

export const ListContainersParams = PaginationParams.merge(ContainerRegionParam).merge(
	z.object({
		namespaceId: z.string().uuid().describe("Namespace ID to list containers from"),
		name: z.string().optional().describe("Filter by container name"),
	}),
);
export type ListContainersParams = z.infer<typeof ListContainersParams>;

export const GetContainerParams = ContainerRegionParam.merge(
	z.object({
		containerId: z.string().uuid().describe("Container ID"),
	}),
);
export type GetContainerParams = z.infer<typeof GetContainerParams>;

export const CreateContainerParams = ContainerRegionParam.merge(
	z.object({
		namespaceId: z.string().uuid().describe("Namespace ID"),
		name: z.string().min(1).describe("Container name"),
		registryImage: z
			.string()
			.min(1)
			.describe("Docker image URI (e.g. rg.fr-par.scw.cloud/my-ns/my-image:latest)"),
		port: z
			.number()
			.int()
			.min(1)
			.max(65535)
			.optional()
			.describe("Container listening port (default: 8080)"),
		minScale: z
			.number()
			.int()
			.min(0)
			.optional()
			.describe("Minimum number of instances (default: 0)"),
		maxScale: z
			.number()
			.int()
			.min(1)
			.optional()
			.describe("Maximum number of instances (default: 20)"),
		memoryLimit: z.number().int().optional().describe("Memory limit in MB (default: 256)"),
		cpuLimit: z.number().int().optional().describe("CPU limit in millicores (default: 140)"),
		timeout: z.string().optional().describe("Request timeout duration (e.g. '300s')"),
		privacy: ContainerPrivacy.optional().describe("Privacy setting (default: public)"),
		protocol: ContainerProtocol.optional().describe("Protocol (default: http1)"),
		httpOption: ContainerHttpOption.optional().describe("HTTP option (default: enabled)"),
		description: z.string().optional().describe("Container description"),
		environmentVariables: z
			.record(z.string(), z.string())
			.optional()
			.describe("Environment variables"),
		secretEnvironmentVariables: z
			.array(z.object({ key: z.string(), value: z.string() }))
			.optional()
			.describe("Secret environment variables (write-only)"),
	}),
);
export type CreateContainerParams = z.infer<typeof CreateContainerParams>;

export const UpdateContainerParams = ContainerRegionParam.merge(
	z.object({
		containerId: z.string().uuid().describe("Container ID"),
		registryImage: z.string().optional().describe("Updated Docker image URI"),
		port: z.number().int().min(1).max(65535).optional().describe("Updated container port"),
		minScale: z.number().int().min(0).optional().describe("Updated minimum scale"),
		maxScale: z.number().int().min(1).optional().describe("Updated maximum scale"),
		memoryLimit: z.number().int().optional().describe("Updated memory limit in MB"),
		cpuLimit: z.number().int().optional().describe("Updated CPU limit in millicores"),
		timeout: z.string().optional().describe("Updated request timeout"),
		privacy: ContainerPrivacy.optional().describe("Updated privacy setting"),
		protocol: ContainerProtocol.optional().describe("Updated protocol"),
		httpOption: ContainerHttpOption.optional().describe("Updated HTTP option"),
		description: z.string().optional().describe("Updated description"),
		environmentVariables: z
			.record(z.string(), z.string())
			.optional()
			.describe("Updated environment variables"),
		secretEnvironmentVariables: z
			.array(z.object({ key: z.string(), value: z.string() }))
			.optional()
			.describe("Updated secret environment variables"),
	}),
);
export type UpdateContainerParams = z.infer<typeof UpdateContainerParams>;

export const DeleteContainerParams = ContainerRegionParam.merge(
	z.object({
		containerId: z.string().uuid().describe("Container ID to delete"),
	}),
);
export type DeleteContainerParams = z.infer<typeof DeleteContainerParams>;

export const DeployContainerParams = ContainerRegionParam.merge(
	z.object({
		containerId: z.string().uuid().describe("Container ID to deploy"),
	}),
);
export type DeployContainerParams = z.infer<typeof DeployContainerParams>;

// ─── Cron ────────────────────────────────────────────────────────────

export const ListCronsParams = PaginationParams.merge(ContainerRegionParam).merge(
	z.object({
		containerId: z.string().uuid().describe("Container ID to list crons for"),
	}),
);
export type ListCronsParams = z.infer<typeof ListCronsParams>;

export const CreateCronParams = ContainerRegionParam.merge(
	z.object({
		containerId: z.string().uuid().describe("Container ID"),
		schedule: z.string().min(1).describe("Cron schedule expression (e.g. '0 * * * *')"),
		args: z
			.record(z.string(), z.unknown())
			.optional()
			.describe("JSON arguments passed to the container"),
		name: z.string().optional().describe("Cron trigger name"),
	}),
);
export type CreateCronParams = z.infer<typeof CreateCronParams>;

export const UpdateCronParams = ContainerRegionParam.merge(
	z.object({
		cronId: z.string().uuid().describe("Cron ID"),
		containerId: z.string().uuid().optional().describe("Updated container ID"),
		schedule: z.string().optional().describe("Updated cron schedule expression"),
		args: z.record(z.string(), z.unknown()).optional().describe("Updated JSON arguments"),
		name: z.string().optional().describe("Updated cron name"),
	}),
);
export type UpdateCronParams = z.infer<typeof UpdateCronParams>;

export const DeleteCronParams = ContainerRegionParam.merge(
	z.object({
		cronId: z.string().uuid().describe("Cron ID to delete"),
	}),
);
export type DeleteCronParams = z.infer<typeof DeleteCronParams>;

// ─── Domain ──────────────────────────────────────────────────────────

export const ListDomainsParams = PaginationParams.merge(ContainerRegionParam).merge(
	z.object({
		containerId: z.string().uuid().describe("Container ID to list domains for"),
	}),
);
export type ListDomainsParams = z.infer<typeof ListDomainsParams>;

export const CreateDomainParams = ContainerRegionParam.merge(
	z.object({
		containerId: z.string().uuid().describe("Container ID"),
		hostname: z.string().min(1).describe("Custom domain hostname (e.g. app.example.com)"),
	}),
);
export type CreateDomainParams = z.infer<typeof CreateDomainParams>;

export const DeleteDomainParams = ContainerRegionParam.merge(
	z.object({
		domainId: z.string().uuid().describe("Domain ID to delete"),
	}),
);
export type DeleteDomainParams = z.infer<typeof DeleteDomainParams>;

// ─── Token ───────────────────────────────────────────────────────────

export const CreateTokenParams = ContainerRegionParam.merge(
	z.object({
		containerId: z
			.string()
			.uuid()
			.optional()
			.describe("Container ID (provide either containerId or namespaceId)"),
		namespaceId: z
			.string()
			.uuid()
			.optional()
			.describe("Namespace ID (provide either containerId or namespaceId)"),
		description: z.string().optional().describe("Token description"),
		expiresAt: z.string().optional().describe("Expiration date (ISO 8601 format)"),
	}),
);
export type CreateTokenParams = z.infer<typeof CreateTokenParams>;

export const DeleteTokenParams = ContainerRegionParam.merge(
	z.object({
		tokenId: z.string().uuid().describe("Token ID to delete"),
	}),
);
export type DeleteTokenParams = z.infer<typeof DeleteTokenParams>;
