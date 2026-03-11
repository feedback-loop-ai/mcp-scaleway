import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CheckDomainAvailabilityInput,
	CreateContactInput,
	DisableAutoRenewInput,
	EnableAutoRenewInput,
	GetContactInput,
	GetDomainInput,
	GetTldInput,
	ListContactsInput,
	ListDomainsInput,
	ListTldsInput,
	RegisterDomainInput,
	RenewDomainInput,
	TransferDomainInput,
	UpdateContactInput,
	UpdateDomainInput,
} from "./types.js";

const API_PREFIX = "/domain/v2beta1";

function successResponse(data: unknown) {
	return {
		content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
	};
}

function buildUrlParams(
	query?: Record<string, string | number | undefined>,
): URLSearchParams | undefined {
	if (!query) return undefined;
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value !== undefined) {
			params.set(key, String(value));
		}
	}
	return params;
}

async function apiRequest(
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
	path: string,
	body?: unknown,
	query?: Record<string, string | number | undefined>,
): Promise<unknown> {
	const config = loadAuthConfig();
	const client = createScalewayClient(config);

	return client.fetch({
		method,
		path: `${API_PREFIX}${path}`,
		body: body ? JSON.stringify(body) : undefined,
		headers: body ? { "Content-Type": "application/json" } : undefined,
		urlParams: buildUrlParams(query),
	});
}

// ── Domain Handlers ────────────────────────────────────────────────────────

export async function handleListDomains(input: ListDomainsInput) {
	try {
		const { page, page_size, ...filters } = input;
		const query = {
			...paginationToQuery(page, page_size),
			...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined)),
		};
		const result = (await apiRequest("GET", "/domains", undefined, query)) as {
			domains: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(result.domains, result.total_count, page, page_size),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetDomain(input: GetDomainInput) {
	try {
		const result = await apiRequest("GET", `/domains/${input.domain}`);
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRegisterDomain(input: RegisterDomainInput) {
	try {
		const result = await apiRequest("POST", "/domains", {
			domain: input.domain,
			duration_in_years: input.duration_in_years,
			project_id: input.project_id,
			owner_contact_id: input.owner_contact_id,
			admin_contact_id: input.admin_contact_id,
			tech_contact_id: input.tech_contact_id,
		});
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleRenewDomain(input: RenewDomainInput) {
	try {
		const result = await apiRequest("POST", `/domains/${input.domain}/renew`, {
			duration_in_years: input.duration_in_years,
		});
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleTransferDomain(input: TransferDomainInput) {
	try {
		const result = await apiRequest("POST", "/domains/transfer", {
			domain: input.domain,
			auth_code: input.auth_code,
			project_id: input.project_id,
			owner_contact_id: input.owner_contact_id,
		});
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateDomain(input: UpdateDomainInput) {
	try {
		const { domain, ...body } = input;
		const result = await apiRequest("PATCH", `/domains/${domain}`, body);
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableAutoRenew(input: EnableAutoRenewInput) {
	try {
		const result = await apiRequest("POST", `/domains/${input.domain}/enable-auto-renew`);
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableAutoRenew(input: DisableAutoRenewInput) {
	try {
		const result = await apiRequest("POST", `/domains/${input.domain}/disable-auto-renew`);
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCheckDomainAvailability(input: CheckDomainAvailabilityInput) {
	try {
		const result = await apiRequest("GET", "/domains/availability", undefined, {
			domain: input.domain,
		});
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── Contact Handlers ───────────────────────────────────────────────────────

export async function handleListContacts(input: ListContactsInput) {
	try {
		const { page, page_size, ...filters } = input;
		const query = {
			...paginationToQuery(page, page_size),
			...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined)),
		};
		const result = (await apiRequest("GET", "/contacts", undefined, query)) as {
			contacts: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(result.contacts, result.total_count, page, page_size),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetContact(input: GetContactInput) {
	try {
		const result = await apiRequest("GET", `/contacts/${input.contact_id}`);
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateContact(input: CreateContactInput) {
	try {
		const result = await apiRequest("POST", "/contacts", input);
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateContact(input: UpdateContactInput) {
	try {
		const { contact_id, ...body } = input;
		const result = await apiRequest("PATCH", `/contacts/${contact_id}`, body);
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// ── TLD Handlers ───────────────────────────────────────────────────────────

export async function handleListTlds(input: ListTldsInput) {
	try {
		const { page, page_size } = input;
		const query = paginationToQuery(page, page_size);
		const result = (await apiRequest("GET", "/tlds", undefined, query)) as {
			tlds: unknown[];
			total_count: number;
		};
		return successResponse(
			buildPaginatedResponse(result.tlds, result.total_count, page, page_size),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetTld(input: GetTldInput) {
	try {
		const result = await apiRequest("GET", `/tlds/${input.tld_name}`);
		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
