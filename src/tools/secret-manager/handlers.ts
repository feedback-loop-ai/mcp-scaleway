import { Secretv1beta1 } from "@scaleway/sdk-secret";
import type { z } from "zod";
import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse } from "../../shared/pagination.js";
import type {
	AccessSecretVersionInput,
	AddSecretOwnerInput,
	CreateSecretInput,
	CreateSecretVersionInput,
	DeleteSecretInput,
	DestroySecretVersionInput,
	DisableSecretVersionInput,
	EnableSecretVersionInput,
	GetSecretInput,
	GetSecretVersionInput,
	ListSecretVersionsInput,
	ListSecretsInput,
	ListTagsInput,
	ProtectSecretInput,
	UnprotectSecretInput,
	UpdateSecretInput,
} from "./types.js";

function getApi(): Secretv1beta1.API {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);
	return new Secretv1beta1.API(client);
}

function formatSuccess(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

// ── Secret CRUD ────────────────────────────────────────────────────────────

export async function handleListSecrets(
	input: z.infer<typeof import("./types.js").ListSecretsInput>,
) {
	try {
		const api = getApi();
		const { page, pageSize, ...rest } = input;
		const response = await api.listSecrets({
			...rest,
			page,
			pageSize,
			scheduledForDeletion: false,
		});
		return formatSuccess(
			buildPaginatedResponse(response.secrets, response.totalCount, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetSecret(input: z.infer<typeof import("./types.js").GetSecretInput>) {
	try {
		const api = getApi();
		const response = await api.getSecret(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSecret(
	input: z.infer<typeof import("./types.js").CreateSecretInput>,
) {
	try {
		const api = getApi();
		const { isProtected, ...rest } = input;
		const response = await api.createSecret({
			...rest,
			protected: isProtected,
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateSecret(
	input: z.infer<typeof import("./types.js").UpdateSecretInput>,
) {
	try {
		const api = getApi();
		const response = await api.updateSecret(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteSecret(
	input: z.infer<typeof import("./types.js").DeleteSecretInput>,
) {
	try {
		const api = getApi();
		await api.deleteSecret(input);
		return formatSuccess({ success: true, secretId: input.secretId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Secret Versions ────────────────────────────────────────────────────────

export async function handleListSecretVersions(
	input: z.infer<typeof import("./types.js").ListSecretVersionsInput>,
) {
	try {
		const api = getApi();
		const { page, pageSize, ...rest } = input;
		const response = await api.listSecretVersions({
			...rest,
			page,
			pageSize,
		});
		return formatSuccess(
			buildPaginatedResponse(response.versions, response.totalCount, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetSecretVersion(
	input: z.infer<typeof import("./types.js").GetSecretVersionInput>,
) {
	try {
		const api = getApi();
		const response = await api.getSecretVersion(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateSecretVersion(
	input: z.infer<typeof import("./types.js").CreateSecretVersionInput>,
) {
	try {
		const api = getApi();
		const response = await api.createSecretVersion(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleAccessSecretVersion(
	input: z.infer<typeof import("./types.js").AccessSecretVersionInput>,
) {
	try {
		const api = getApi();
		const response = await api.accessSecretVersion(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableSecretVersion(
	input: z.infer<typeof import("./types.js").DisableSecretVersionInput>,
) {
	try {
		const api = getApi();
		const response = await api.disableSecretVersion(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableSecretVersion(
	input: z.infer<typeof import("./types.js").EnableSecretVersionInput>,
) {
	try {
		const api = getApi();
		const response = await api.enableSecretVersion(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDestroySecretVersion(
	input: z.infer<typeof import("./types.js").DestroySecretVersionInput>,
) {
	try {
		const api = getApi();
		await api.deleteSecretVersion(input);
		return formatSuccess({
			success: true,
			secretId: input.secretId,
			revision: input.revision,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Protect / Unprotect ────────────────────────────────────────────────────

export async function handleProtectSecret(
	input: z.infer<typeof import("./types.js").ProtectSecretInput>,
) {
	try {
		const api = getApi();
		const response = await api.protectSecret(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUnprotectSecret(
	input: z.infer<typeof import("./types.js").UnprotectSecretInput>,
) {
	try {
		const api = getApi();
		const response = await api.unprotectSecret(input);
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Tags ───────────────────────────────────────────────────────────────────

export async function handleListTags(input: z.infer<typeof import("./types.js").ListTagsInput>) {
	try {
		const api = getApi();
		const { page, pageSize, ...rest } = input;
		const response = await api.listTags({
			...rest,
			page,
			pageSize,
		});
		return formatSuccess(
			buildPaginatedResponse(response.tags, response.totalCount, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Ownership ──────────────────────────────────────────────────────────────

export async function handleAddSecretOwner(
	input: z.infer<typeof import("./types.js").AddSecretOwnerInput>,
) {
	try {
		const api = getApi();
		await api.addSecretOwner(input);
		return formatSuccess({ success: true, secretId: input.secretId });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
