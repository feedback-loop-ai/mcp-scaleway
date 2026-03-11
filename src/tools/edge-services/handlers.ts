import { API } from "@scaleway/sdk-edge-services/v1beta1";
import type { z } from "zod";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreateBackendStageParams,
	CreateCacheStageParams,
	CreateDNSStageParams,
	CreatePipelineParams,
	CreatePurgeRequestParams,
	CreateTLSStageParams,
	DeleteBackendStageParams,
	DeleteCacheStageParams,
	DeleteDNSStageParams,
	DeletePipelineParams,
	DeleteTLSStageParams,
	GetBackendStageParams,
	GetCacheStageParams,
	GetDNSStageParams,
	GetPipelineParams,
	GetPurgeRequestParams,
	GetTLSStageParams,
	ListBackendStagesParams,
	ListCacheStagesParams,
	ListDNSStagesParams,
	ListPipelinesParams,
	ListPurgeRequestsParams,
	ListTLSStagesParams,
	UpdateBackendStageParams,
	UpdateCacheStageParams,
	UpdateDNSStageParams,
	UpdatePipelineParams,
	UpdateTLSStageParams,
} from "./types.js";

function getApi(): API {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);
	return new API(client);
}

function successResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// ── Pipeline Handlers ──────────────────────────────────────────────────────

export async function handleListPipelines(
	params: z.infer<typeof import("./types.js").ListPipelinesParams>,
) {
	try {
		const api = getApi();
		const response = await api.listPipelines({
			...paginationToQuery(params.page, params.pageSize),
			name: params.name,
			projectId: params.projectId,
			organizationId: params.organizationId,
			orderBy: params.orderBy,
		});
		return successResponse(
			buildPaginatedResponse(response.pipelines, response.totalCount, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPipeline(
	params: z.infer<typeof import("./types.js").GetPipelineParams>,
) {
	try {
		const api = getApi();
		const pipeline = await api.getPipeline({ pipelineId: params.pipelineId });
		return successResponse(pipeline);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreatePipeline(
	params: z.infer<typeof import("./types.js").CreatePipelineParams>,
) {
	try {
		const api = getApi();
		const pipeline = await api.createPipeline({
			name: params.name,
			description: params.description,
			projectId: params.projectId,
		});
		return successResponse(pipeline);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdatePipeline(
	params: z.infer<typeof import("./types.js").UpdatePipelineParams>,
) {
	try {
		const api = getApi();
		const pipeline = await api.updatePipeline({
			pipelineId: params.pipelineId,
			name: params.name,
			description: params.description,
		});
		return successResponse(pipeline);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeletePipeline(
	params: z.infer<typeof import("./types.js").DeletePipelineParams>,
) {
	try {
		const api = getApi();
		await api.deletePipeline({ pipelineId: params.pipelineId });
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── DNS Stage Handlers ─────────────────────────────────────────────────────

export async function handleListDNSStages(
	params: z.infer<typeof import("./types.js").ListDNSStagesParams>,
) {
	try {
		const api = getApi();
		const response = await api.listDNSStages({
			pipelineId: params.pipelineId,
			...paginationToQuery(params.page, params.pageSize),
			orderBy: params.orderBy,
			fqdn: params.fqdn,
		});
		return successResponse(
			buildPaginatedResponse(response.stages, response.totalCount, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDNSStage(
	params: z.infer<typeof import("./types.js").GetDNSStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.getDNSStage({ dnsStageId: params.dnsStageId });
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDNSStage(
	params: z.infer<typeof import("./types.js").CreateDNSStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.createDNSStage({
			pipelineId: params.pipelineId,
			fqdns: params.fqdns,
			tlsStageId: params.tlsStageId,
			cacheStageId: params.cacheStageId,
			backendStageId: params.backendStageId,
		});
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDNSStage(
	params: z.infer<typeof import("./types.js").UpdateDNSStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.updateDNSStage({
			dnsStageId: params.dnsStageId,
			fqdns: params.fqdns,
			tlsStageId: params.tlsStageId,
			cacheStageId: params.cacheStageId,
			backendStageId: params.backendStageId,
		});
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDNSStage(
	params: z.infer<typeof import("./types.js").DeleteDNSStageParams>,
) {
	try {
		const api = getApi();
		await api.deleteDNSStage({ dnsStageId: params.dnsStageId });
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── TLS Stage Handlers ─────────────────────────────────────────────────────

export async function handleListTLSStages(
	params: z.infer<typeof import("./types.js").ListTLSStagesParams>,
) {
	try {
		const api = getApi();
		const response = await api.listTLSStages({
			pipelineId: params.pipelineId,
			...paginationToQuery(params.page, params.pageSize),
			orderBy: params.orderBy,
			secretId: params.secretId,
			secretRegion: params.secretRegion,
		});
		return successResponse(
			buildPaginatedResponse(response.stages, response.totalCount, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetTLSStage(
	params: z.infer<typeof import("./types.js").GetTLSStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.getTLSStage({ tlsStageId: params.tlsStageId });
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateTLSStage(
	params: z.infer<typeof import("./types.js").CreateTLSStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.createTLSStage({
			pipelineId: params.pipelineId,
			secrets: params.secrets,
			managedCertificate: params.managedCertificate,
			cacheStageId: params.cacheStageId,
			backendStageId: params.backendStageId,
			routeStageId: params.routeStageId,
			wafStageId: params.wafStageId,
		});
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateTLSStage(
	params: z.infer<typeof import("./types.js").UpdateTLSStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.updateTLSStage({
			tlsStageId: params.tlsStageId,
			managedCertificate: params.managedCertificate,
			tlsSecretsConfig: params.tlsSecretsConfig,
			cacheStageId: params.cacheStageId,
			backendStageId: params.backendStageId,
			routeStageId: params.routeStageId,
			wafStageId: params.wafStageId,
		});
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteTLSStage(
	params: z.infer<typeof import("./types.js").DeleteTLSStageParams>,
) {
	try {
		const api = getApi();
		await api.deleteTLSStage({ tlsStageId: params.tlsStageId });
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Cache Stage Handlers ───────────────────────────────────────────────────

export async function handleListCacheStages(
	params: z.infer<typeof import("./types.js").ListCacheStagesParams>,
) {
	try {
		const api = getApi();
		const response = await api.listCacheStages({
			pipelineId: params.pipelineId,
			...paginationToQuery(params.page, params.pageSize),
			orderBy: params.orderBy,
		});
		return successResponse(
			buildPaginatedResponse(response.stages, response.totalCount, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetCacheStage(
	params: z.infer<typeof import("./types.js").GetCacheStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.getCacheStage({ cacheStageId: params.cacheStageId });
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateCacheStage(
	params: z.infer<typeof import("./types.js").CreateCacheStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.createCacheStage({
			pipelineId: params.pipelineId,
			fallbackTtl: params.fallbackTtl,
			includeCookies: params.includeCookies,
			backendStageId: params.backendStageId,
			wafStageId: params.wafStageId,
			routeStageId: params.routeStageId,
		});
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateCacheStage(
	params: z.infer<typeof import("./types.js").UpdateCacheStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.updateCacheStage({
			cacheStageId: params.cacheStageId,
			fallbackTtl: params.fallbackTtl,
			includeCookies: params.includeCookies,
			backendStageId: params.backendStageId,
			wafStageId: params.wafStageId,
			routeStageId: params.routeStageId,
		});
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteCacheStage(
	params: z.infer<typeof import("./types.js").DeleteCacheStageParams>,
) {
	try {
		const api = getApi();
		await api.deleteCacheStage({ cacheStageId: params.cacheStageId });
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Backend Stage Handlers ─────────────────────────────────────────────────

export async function handleListBackendStages(
	params: z.infer<typeof import("./types.js").ListBackendStagesParams>,
) {
	try {
		const api = getApi();
		const response = await api.listBackendStages({
			pipelineId: params.pipelineId,
			...paginationToQuery(params.page, params.pageSize),
			orderBy: params.orderBy,
			bucketName: params.bucketName,
			bucketRegion: params.bucketRegion,
			lbId: params.lbId,
		});
		return successResponse(
			buildPaginatedResponse(response.stages, response.totalCount, params.page, params.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetBackendStage(
	params: z.infer<typeof import("./types.js").GetBackendStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.getBackendStage({ backendStageId: params.backendStageId });
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateBackendStage(
	params: z.infer<typeof import("./types.js").CreateBackendStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.createBackendStage({
			pipelineId: params.pipelineId,
			scalewayS3: params.scalewayS3,
			scalewayLb: params.scalewayLb,
		});
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateBackendStage(
	params: z.infer<typeof import("./types.js").UpdateBackendStageParams>,
) {
	try {
		const api = getApi();
		const stage = await api.updateBackendStage({
			backendStageId: params.backendStageId,
			pipelineId: params.pipelineId,
			scalewayS3: params.scalewayS3,
			scalewayLb: params.scalewayLb,
		});
		return successResponse(stage);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteBackendStage(
	params: z.infer<typeof import("./types.js").DeleteBackendStageParams>,
) {
	try {
		const api = getApi();
		await api.deleteBackendStage({ backendStageId: params.backendStageId });
		return successResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Purge Request Handlers ─────────────────────────────────────────────────

export async function handlePurgeCache(
	params: z.infer<typeof import("./types.js").CreatePurgeRequestParams>,
) {
	try {
		const api = getApi();
		const purgeRequest = await api.createPurgeRequest({
			pipelineId: params.pipelineId,
			assets: params.assets,
			all: params.all,
		});
		return successResponse(purgeRequest);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListPurgeRequests(
	params: z.infer<typeof import("./types.js").ListPurgeRequestsParams>,
) {
	try {
		const api = getApi();
		const response = await api.listPurgeRequests({
			...paginationToQuery(params.page, params.pageSize),
			pipelineId: params.pipelineId,
			projectId: params.projectId,
			organizationId: params.organizationId,
			orderBy: params.orderBy,
		});
		return successResponse(
			buildPaginatedResponse(
				response.purgeRequests,
				response.totalCount,
				params.page,
				params.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPurgeRequest(
	params: z.infer<typeof import("./types.js").GetPurgeRequestParams>,
) {
	try {
		const api = getApi();
		const purgeRequest = await api.getPurgeRequest({ purgeRequestId: params.purgeRequestId });
		return successResponse(purgeRequest);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
