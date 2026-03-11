import { Mnqv1beta1 } from "@scaleway/sdk-mnq";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	ActivateSnsInput,
	CreateSnsCredentialsInput,
	DeactivateSnsInput,
	DeleteSnsCredentialsInput,
	GetSnsCredentialsInput,
	GetSnsInfoInput,
	ListSnsCredentialsInput,
	UpdateSnsCredentialsInput,
} from "./types.js";

function getSnsApi(): Mnqv1beta1.SnsAPI {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);
	return new Mnqv1beta1.SnsAPI(client);
}

function formatDate(date: Date | undefined): string | undefined {
	return date?.toISOString();
}

function formatSnsInfo(info: {
	projectId: string;
	region: string;
	createdAt?: Date;
	updatedAt?: Date;
	status: string;
	snsEndpointUrl: string;
}) {
	return {
		projectId: info.projectId,
		region: info.region,
		createdAt: formatDate(info.createdAt),
		updatedAt: formatDate(info.updatedAt),
		status: info.status,
		snsEndpointUrl: info.snsEndpointUrl,
	};
}

function formatSnsCredentials(creds: {
	id: string;
	name: string;
	projectId: string;
	region: string;
	createdAt?: Date;
	updatedAt?: Date;
	accessKey: string;
	secretKey: string;
	secretChecksum: string;
	permissions?: { canPublish?: boolean; canReceive?: boolean; canManage?: boolean };
}) {
	return {
		id: creds.id,
		name: creds.name,
		projectId: creds.projectId,
		region: creds.region,
		createdAt: formatDate(creds.createdAt),
		updatedAt: formatDate(creds.updatedAt),
		accessKey: creds.accessKey,
		secretKey: creds.secretKey,
		secretChecksum: creds.secretChecksum,
		permissions: creds.permissions,
	};
}

function jsonResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export async function handleActivateSns(input: ActivateSnsInput) {
	try {
		const api = getSnsApi();
		const result = await api.activateSns({
			region: input.region,
			projectId: input.projectId,
		});
		return jsonResponse(formatSnsInfo(result));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeactivateSns(input: DeactivateSnsInput) {
	try {
		const api = getSnsApi();
		const result = await api.deactivateSns({
			region: input.region,
			projectId: input.projectId,
		});
		return jsonResponse(formatSnsInfo(result));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetSnsInfo(input: GetSnsInfoInput) {
	try {
		const api = getSnsApi();
		const result = await api.getSnsInfo({
			region: input.region,
			projectId: input.projectId,
		});
		return jsonResponse(formatSnsInfo(result));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleListSnsCredentials(input: ListSnsCredentialsInput) {
	try {
		const api = getSnsApi();
		const result = await api.listSnsCredentials({
			region: input.region,
			projectId: input.projectId,
			orderBy: input.orderBy,
			...paginationToQuery(input.page, input.pageSize),
		});
		const formatted = result.snsCredentials.map(formatSnsCredentials);
		return jsonResponse(
			buildPaginatedResponse(formatted, result.totalCount, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetSnsCredentials(input: GetSnsCredentialsInput) {
	try {
		const api = getSnsApi();
		const result = await api.getSnsCredentials({
			region: input.region,
			snsCredentialsId: input.snsCredentialsId,
		});
		return jsonResponse(formatSnsCredentials(result));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSnsCredentials(input: CreateSnsCredentialsInput) {
	try {
		const api = getSnsApi();
		const result = await api.createSnsCredentials({
			region: input.region,
			projectId: input.projectId,
			name: input.name,
			permissions: input.permissions,
		});
		return jsonResponse(formatSnsCredentials(result));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateSnsCredentials(input: UpdateSnsCredentialsInput) {
	try {
		const api = getSnsApi();
		const result = await api.updateSnsCredentials({
			region: input.region,
			snsCredentialsId: input.snsCredentialsId,
			name: input.name,
			permissions: input.permissions,
		});
		return jsonResponse(formatSnsCredentials(result));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteSnsCredentials(input: DeleteSnsCredentialsInput) {
	try {
		const api = getSnsApi();
		await api.deleteSnsCredentials({
			region: input.region,
			snsCredentialsId: input.snsCredentialsId,
		});
		return jsonResponse({ success: true });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
