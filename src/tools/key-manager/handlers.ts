import type { Client } from "@scaleway/sdk-client";
import { KeyManagerv1alpha1 } from "@scaleway/sdk-key-manager";
import type { z } from "zod";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	CreateKeyInput,
	DecryptInput,
	DeleteKeyInput,
	DisableKeyInput,
	EnableKeyInput,
	EncryptInput,
	GenerateDataKeyInput,
	GetKeyInput,
	ListKeysInput,
	ProtectKeyInput,
	RotateKeyInput,
	UnprotectKeyInput,
	UpdateKeyInput,
} from "./types.js";

function createApi(client: Client): KeyManagerv1alpha1.API {
	return new KeyManagerv1alpha1.API(client);
}

function formatSuccess(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

export async function handleListKeys(client: Client, input: z.infer<typeof ListKeysInput>) {
	try {
		const api = createApi(client);
		const response = await api.listKeys({
			region: input.region,
			organizationId: input.organizationId,
			projectId: input.projectId,
			orderBy: input.orderBy,
			tags: input.tags,
			name: input.name,
			usage: input.usage,
			scheduledForDeletion: input.scheduledForDeletion,
			page: input.page,
			pageSize: input.pageSize,
		});
		return formatSuccess(
			buildPaginatedResponse(response.keys, response.totalCount, input.page, input.pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetKey(client: Client, input: z.infer<typeof GetKeyInput>) {
	try {
		const api = createApi(client);
		const key = await api.getKey({ region: input.region, keyId: input.keyId });
		return formatSuccess(key);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateKey(client: Client, input: z.infer<typeof CreateKeyInput>) {
	try {
		const api = createApi(client);
		const key = await api.createKey({
			region: input.region,
			projectId: input.projectId,
			name: input.name,
			usage: input.usage,
			description: input.description,
			tags: input.tags,
			rotationPolicy: input.rotationPolicy
				? {
						rotationPeriod: input.rotationPolicy.rotationPeriod,
						nextRotationAt: input.rotationPolicy.nextRotationAt
							? new Date(input.rotationPolicy.nextRotationAt)
							: undefined,
					}
				: undefined,
			unprotected: input.unprotected,
			origin: input.origin,
		});
		return formatSuccess(key);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateKey(client: Client, input: z.infer<typeof UpdateKeyInput>) {
	try {
		const api = createApi(client);
		const key = await api.updateKey({
			region: input.region,
			keyId: input.keyId,
			name: input.name,
			description: input.description,
			tags: input.tags,
			rotationPolicy: input.rotationPolicy
				? {
						rotationPeriod: input.rotationPolicy.rotationPeriod,
						nextRotationAt: input.rotationPolicy.nextRotationAt
							? new Date(input.rotationPolicy.nextRotationAt)
							: undefined,
					}
				: undefined,
		});
		return formatSuccess(key);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteKey(client: Client, input: z.infer<typeof DeleteKeyInput>) {
	try {
		const api = createApi(client);
		await api.deleteKey({ region: input.region, keyId: input.keyId });
		return formatSuccess({ message: "Key successfully deleted", keyId: input.keyId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRotateKey(client: Client, input: z.infer<typeof RotateKeyInput>) {
	try {
		const api = createApi(client);
		const key = await api.rotateKey({ region: input.region, keyId: input.keyId });
		return formatSuccess(key);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleProtectKey(client: Client, input: z.infer<typeof ProtectKeyInput>) {
	try {
		const api = createApi(client);
		const key = await api.protectKey({ region: input.region, keyId: input.keyId });
		return formatSuccess(key);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUnprotectKey(client: Client, input: z.infer<typeof UnprotectKeyInput>) {
	try {
		const api = createApi(client);
		const key = await api.unprotectKey({ region: input.region, keyId: input.keyId });
		return formatSuccess(key);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableKey(client: Client, input: z.infer<typeof EnableKeyInput>) {
	try {
		const api = createApi(client);
		const key = await api.enableKey({ region: input.region, keyId: input.keyId });
		return formatSuccess(key);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableKey(client: Client, input: z.infer<typeof DisableKeyInput>) {
	try {
		const api = createApi(client);
		const key = await api.disableKey({ region: input.region, keyId: input.keyId });
		return formatSuccess(key);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEncrypt(client: Client, input: z.infer<typeof EncryptInput>) {
	try {
		const api = createApi(client);
		const response = await api.encrypt({
			region: input.region,
			keyId: input.keyId,
			plaintext: input.plaintext,
			associatedData: input.associatedData,
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDecrypt(client: Client, input: z.infer<typeof DecryptInput>) {
	try {
		const api = createApi(client);
		const response = await api.decrypt({
			region: input.region,
			keyId: input.keyId,
			ciphertext: input.ciphertext,
			associatedData: input.associatedData,
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGenerateDataKey(
	client: Client,
	input: z.infer<typeof GenerateDataKeyInput>,
) {
	try {
		const api = createApi(client);
		const dataKey = await api.generateDataKey({
			region: input.region,
			keyId: input.keyId,
			algorithm: input.algorithm,
			withoutPlaintext: input.withoutPlaintext,
		});
		return formatSuccess(dataKey);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
