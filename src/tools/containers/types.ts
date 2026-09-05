import { z } from "zod";
import { PaginationParams } from "../../shared/types.js";

// ─── Shared ──────────────────────────────────────────────────────────

export const ContainerRegionParam = z.object({
	region: z
		.enum(["fr-par", "nl-ams", "pl-waw", "it-mil"])
		.optional()
		.describe("Scaleway region (e.g. fr-par). Defaults to account default region"),
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
	.describe(
		"Legacy HTTP option: enabled allows HTTP and HTTPS; redirected and doNotForce are unsupported in v1. Prefer httpsConnectionsOnly.",
	);

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
		memoryLimit: z
			.number()
			.int()
			.positive()
			.max(Math.floor(Number.MAX_SAFE_INTEGER / 1_048_576))
			.optional()
			.describe("Memory limit in MiB; converted to bytes for v1"),
		cpuLimit: z
			.number()
			.int()
			.positive()
			.max(4_294_967_295)
			.optional()
			.describe("CPU limit in millicores (1000 = 1 vCPU)"),
		timeout: z.string().optional().describe("Request timeout duration (e.g. '300s')"),
		privacy: ContainerPrivacy.optional().describe("Privacy setting (default: public)"),
		protocol: ContainerProtocol.optional().describe("Protocol (default: http1)"),
		httpOption: ContainerHttpOption.optional(),
		httpsConnectionsOnly: z
			.boolean()
			.optional()
			.describe("Only allow HTTPS connections; does not promise HTTP redirection"),
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
		memoryLimit: z
			.number()
			.int()
			.positive()
			.max(Math.floor(Number.MAX_SAFE_INTEGER / 1_048_576))
			.optional()
			.describe("Updated memory limit in MiB; converted to bytes for v1"),
		cpuLimit: z
			.number()
			.int()
			.positive()
			.max(4_294_967_295)
			.optional()
			.describe("Updated CPU limit in millicores"),
		timeout: z.string().optional().describe("Updated request timeout"),
		privacy: ContainerPrivacy.optional().describe("Updated privacy setting"),
		protocol: ContainerProtocol.optional().describe("Updated protocol"),
		httpOption: ContainerHttpOption.optional(),
		httpsConnectionsOnly: z
			.boolean()
			.optional()
			.describe("Only allow HTTPS connections; does not promise HTTP redirection"),
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
		timezone: z
			.string()
			.min(1)
			.optional()
			.describe("IANA cron time zone (default on creation: UTC)"),
		args: z
			.record(z.string(), z.unknown())
			.optional()
			.describe("JSON arguments passed to the container"),
		name: z
			.string()
			.min(1)
			.max(50)
			.optional()
			.describe("Cron trigger name (auto-generated when omitted)"),
	}),
);
export type CreateCronParams = z.infer<typeof CreateCronParams>;

export const UpdateCronParams = ContainerRegionParam.merge(
	z.object({
		cronId: z.string().uuid().describe("v1 cron trigger ID"),
		containerId: z
			.string()
			.uuid()
			.optional()
			.describe("Unsupported in v1: triggers cannot be retargeted; omit this field"),
		schedule: z.string().min(1).optional().describe("Updated cron schedule expression"),
		timezone: z
			.string()
			.min(1)
			.optional()
			.describe("Updated IANA cron time zone; omitted means unchanged"),
		args: z.record(z.string(), z.unknown()).optional().describe("Updated JSON arguments"),
		name: z.string().min(1).max(50).optional().describe("Updated cron name"),
	}),
);
export type UpdateCronParams = z.infer<typeof UpdateCronParams>;

export const DeleteCronParams = ContainerRegionParam.merge(
	z.object({
		cronId: z.string().uuid().describe("v1 cron trigger ID to delete"),
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
