import { z } from "zod";

// --- Shared ---

export const FunctionsRegion = z
	.string()
	.regex(/^[a-z]{2}-[a-z]{3}$/, "Invalid region format (e.g., fr-par)")
	.describe("Scaleway region (fr-par, nl-ams, pl-waw)");

export const SecretEnvVar = z.object({
	key: z.string().describe("Secret variable key"),
	value: z.string().nullable().describe("Secret variable value (write-only)"),
});

// --- Namespace Schemas ---

export const ListNamespacesInput = z.object({
	region: FunctionsRegion,
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
	name: z.string().optional().describe("Filter by name"),
	order_by: z.string().optional().describe("Order by field"),
});

export const GetNamespaceInput = z.object({
	region: FunctionsRegion,
	namespace_id: z.string().uuid().describe("Namespace ID"),
});

export const CreateNamespaceInput = z.object({
	region: FunctionsRegion,
	name: z.string().min(1).describe("Namespace name"),
	project_id: z.string().uuid().optional().describe("Project ID"),
	description: z.string().optional().describe("Description"),
	environment_variables: z
		.record(z.string(), z.string())
		.optional()
		.describe("Environment variables"),
	secret_environment_variables: z
		.array(SecretEnvVar)
		.optional()
		.describe("Secret environment variables"),
});

export const UpdateNamespaceInput = z.object({
	region: FunctionsRegion,
	namespace_id: z.string().uuid().describe("Namespace ID"),
	description: z.string().optional().describe("Description"),
	environment_variables: z
		.record(z.string(), z.string())
		.optional()
		.describe("Environment variables"),
	secret_environment_variables: z
		.array(SecretEnvVar)
		.optional()
		.describe("Secret environment variables"),
});

export const DeleteNamespaceInput = z.object({
	region: FunctionsRegion,
	namespace_id: z.string().uuid().describe("Namespace ID"),
});

// --- Function Schemas ---

export const ListFunctionsInput = z.object({
	region: FunctionsRegion,
	namespace_id: z.string().uuid().describe("Namespace ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	name: z.string().optional().describe("Filter by name"),
	order_by: z.string().optional().describe("Order by field"),
	project_id: z.string().uuid().optional().describe("Filter by project ID"),
});

export const GetFunctionInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
});

export const CreateFunctionInput = z.object({
	region: FunctionsRegion,
	namespace_id: z.string().uuid().describe("Namespace ID"),
	name: z.string().min(1).describe("Function name"),
	runtime: z.string().min(1).describe("Runtime (e.g., node22, python312)"),
	handler: z.string().min(1).describe("Handler entry point"),
	privacy: z.enum(["public", "private"]).describe("Privacy level"),
	memory_limit: z.number().int().min(128).max(4096).optional().describe("Memory limit in MB"),
	timeout: z.string().optional().describe('Timeout duration (e.g., "300s")'),
	min_scale: z.number().int().min(0).optional().describe("Minimum instances"),
	max_scale: z.number().int().min(0).optional().describe("Maximum instances"),
	description: z.string().optional().describe("Description"),
	environment_variables: z
		.record(z.string(), z.string())
		.optional()
		.describe("Environment variables"),
	secret_environment_variables: z
		.array(SecretEnvVar)
		.optional()
		.describe("Secret environment variables"),
	http_option: z.enum(["enabled", "redirected"]).optional().describe("HTTP option"),
});

export const UpdateFunctionInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
	runtime: z.string().optional().describe("Runtime"),
	handler: z.string().optional().describe("Handler entry point"),
	privacy: z.enum(["public", "private"]).optional().describe("Privacy level"),
	memory_limit: z.number().int().min(128).max(4096).optional().describe("Memory limit in MB"),
	timeout: z.string().optional().describe("Timeout duration"),
	min_scale: z.number().int().min(0).optional().describe("Minimum instances"),
	max_scale: z.number().int().min(0).optional().describe("Maximum instances"),
	description: z.string().optional().describe("Description"),
	environment_variables: z
		.record(z.string(), z.string())
		.optional()
		.describe("Environment variables"),
	secret_environment_variables: z
		.array(SecretEnvVar)
		.optional()
		.describe("Secret environment variables"),
	http_option: z.enum(["enabled", "redirected"]).optional().describe("HTTP option"),
});

export const DeleteFunctionInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
});

export const DeployFunctionInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
});

// --- Cron Schemas ---

export const ListCronsInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: z.string().optional().describe("Order by field"),
});

export const CreateCronInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
	schedule: z.string().min(1).describe("Cron schedule expression"),
	name: z.string().optional().describe("Cron name"),
	args: z.record(z.string(), z.unknown()).optional().describe("JSON args passed to function"),
});

export const UpdateCronInput = z.object({
	region: FunctionsRegion,
	cron_id: z.string().uuid().describe("Cron ID"),
	schedule: z.string().optional().describe("Cron schedule expression"),
	name: z.string().optional().describe("Cron name"),
	args: z.record(z.string(), z.unknown()).optional().describe("JSON args"),
	function_id: z.string().uuid().optional().describe("Function ID"),
});

export const DeleteCronInput = z.object({
	region: FunctionsRegion,
	cron_id: z.string().uuid().describe("Cron ID"),
});

// --- Domain Schemas ---

export const ListDomainsInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
	page: z.number().int().positive().optional().default(1).describe("Page number"),
	page_size: z.number().int().min(1).max(100).optional().default(50).describe("Items per page"),
	order_by: z.string().optional().describe("Order by field"),
});

export const CreateDomainInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
	hostname: z.string().min(1).describe("Custom domain hostname"),
});

export const DeleteDomainInput = z.object({
	region: FunctionsRegion,
	domain_id: z.string().uuid().describe("Domain ID"),
});

// --- Token Schemas ---

export const CreateTokenInput = z.object({
	region: FunctionsRegion,
	function_id: z.string().uuid().describe("Function ID"),
	description: z.string().optional().describe("Token description"),
	expires_at: z.string().optional().describe("Expiration datetime (ISO 8601)"),
});

export const DeleteTokenInput = z.object({
	region: FunctionsRegion,
	token_id: z.string().uuid().describe("Token ID"),
});
