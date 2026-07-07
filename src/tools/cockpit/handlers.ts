import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	ActivateCockpitInput,
	CreateContactPointInput,
	CreateDataSourceInput,
	CreateGrafanaUserInput,
	CreateTokenInput,
	DeactivateCockpitInput,
	DeleteContactPointInput,
	DeleteDataSourceInput,
	DeleteGrafanaUserInput,
	DeleteTokenInput,
	DisableAlertManagerInput,
	DisableManagedAlertsInput,
	EnableAlertManagerInput,
	EnableManagedAlertsInput,
	GetAlertManagerInput,
	GetCockpitInput,
	ListContactPointsInput,
	ListDataSourcesInput,
	ListGrafanaUsersInput,
	ListManagedAlertsContactPointsInput,
	ListTokensInput,
	ResetGrafanaUserPasswordInput,
} from "./types.js";

const COCKPIT_API_PREFIX = "cockpit/v1";

function resolveRegion(region?: string): string {
	const config = loadAuthConfig();
	return region ?? config.defaultRegion;
}

function formatSuccess(data: unknown) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

// --- Cockpit ---

export async function handleGetCockpit(input: GetCockpitInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "GET",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/cockpit`,
			urlParams: new URLSearchParams({ project_id: input.project_id }),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleActivateCockpit(input: ActivateCockpitInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/activate-cockpit`,
			body: JSON.stringify({ project_id: input.project_id }),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeactivateCockpit(input: DeactivateCockpitInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/deactivate-cockpit`,
			body: JSON.stringify({ project_id: input.project_id }),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Data Sources ---

export async function handleListDataSources(input: ListDataSourcesInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const pagination = paginationToQuery(input.page, input.pageSize);
		const params = new URLSearchParams({
			project_id: input.project_id,
			page: String(pagination.page),
			page_size: String(pagination.page_size),
		});
		if (input.order_by) {
			params.set("order_by", input.order_by);
		}
		if (input.types) {
			for (const t of input.types) {
				params.append("types", t);
			}
		}
		const response = (await client.fetch({
			method: "GET",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/data-sources`,
			urlParams: params,
		})) as {
			data_sources: unknown[];
			total_count: number;
		};
		return formatSuccess(
			buildPaginatedResponse(
				response.data_sources ?? [],
				response.total_count ?? 0,
				input.page,
				input.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateDataSource(input: CreateDataSourceInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const body: Record<string, unknown> = {
			project_id: input.project_id,
			name: input.name,
		};
		if (input.type) {
			body.type = input.type;
		}
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/data-sources`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteDataSource(input: DeleteDataSourceInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		await client.fetch({
			method: "DELETE",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/data-sources/${encodeURIComponent(input.data_source_id)}`,
		});
		return formatSuccess({ status: "deleted", data_source_id: input.data_source_id });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Tokens ---

export async function handleListTokens(input: ListTokensInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const pagination = paginationToQuery(input.page, input.pageSize);
		const params = new URLSearchParams({
			project_id: input.project_id,
			page: String(pagination.page),
			page_size: String(pagination.page_size),
		});
		if (input.order_by) {
			params.set("order_by", input.order_by);
		}
		const response = (await client.fetch({
			method: "GET",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/tokens`,
			urlParams: params,
		})) as {
			tokens: unknown[];
			total_count: number;
		};
		return formatSuccess(
			buildPaginatedResponse(
				response.tokens ?? [],
				response.total_count ?? 0,
				input.page,
				input.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateToken(input: CreateTokenInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const body: Record<string, unknown> = {
			project_id: input.project_id,
			name: input.name,
		};
		if (input.scopes) {
			body.token_scopes = input.scopes;
		}
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/tokens`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteToken(input: DeleteTokenInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		await client.fetch({
			method: "DELETE",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/tokens/${encodeURIComponent(input.token_id)}`,
		});
		return formatSuccess({ status: "deleted", token_id: input.token_id });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Grafana Users ---

export async function handleListGrafanaUsers(input: ListGrafanaUsersInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const pagination = paginationToQuery(input.page, input.pageSize);
		const params = new URLSearchParams({
			project_id: input.project_id,
			page: String(pagination.page),
			page_size: String(pagination.page_size),
		});
		if (input.order_by) {
			params.set("order_by", input.order_by);
		}
		const response = (await client.fetch({
			method: "GET",
			path: `/${COCKPIT_API_PREFIX}/grafana/users`,
			urlParams: params,
		})) as {
			grafana_users: unknown[];
			total_count: number;
		};
		return formatSuccess(
			buildPaginatedResponse(
				response.grafana_users ?? [],
				response.total_count ?? 0,
				input.page,
				input.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateGrafanaUser(input: CreateGrafanaUserInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const body: Record<string, unknown> = {
			project_id: input.project_id,
			login: input.login,
		};
		if (input.role) {
			body.role = input.role;
		}
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/grafana/users`,
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteGrafanaUser(input: DeleteGrafanaUserInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		await client.fetch({
			method: "DELETE",
			path: `/${COCKPIT_API_PREFIX}/grafana/users/${encodeURIComponent(String(input.grafana_user_id))}`,
			urlParams: new URLSearchParams({ project_id: input.project_id }),
		});
		return formatSuccess({
			status: "deleted",
			grafana_user_id: input.grafana_user_id,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleResetGrafanaUserPassword(input: ResetGrafanaUserPasswordInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/grafana/users/${encodeURIComponent(String(input.grafana_user_id))}/reset-password`,
			body: JSON.stringify({ project_id: input.project_id }),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Alert Manager ---

export async function handleGetAlertManager(input: GetAlertManagerInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "GET",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager`,
			urlParams: new URLSearchParams({ project_id: input.project_id }),
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableAlertManager(input: EnableAlertManagerInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager/enable`,
			body: JSON.stringify({ project_id: input.project_id }),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableAlertManager(input: DisableAlertManagerInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager/disable`,
			body: JSON.stringify({ project_id: input.project_id }),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Contact Points ---

export async function handleListContactPoints(input: ListContactPointsInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const pagination = paginationToQuery(input.page, input.pageSize);
		const params = new URLSearchParams({
			project_id: input.project_id,
			page: String(pagination.page),
			page_size: String(pagination.page_size),
		});
		const response = (await client.fetch({
			method: "GET",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager/contact-points`,
			urlParams: params,
		})) as {
			contact_points: unknown[];
			total_count: number;
		};
		return formatSuccess(
			buildPaginatedResponse(
				response.contact_points ?? [],
				response.total_count ?? 0,
				input.page,
				input.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateContactPoint(input: CreateContactPointInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager/contact-points`,
			body: JSON.stringify({
				project_id: input.project_id,
				email: { to: input.email },
			}),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteContactPoint(input: DeleteContactPointInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		await client.fetch({
			method: "DELETE",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager/contact-points`,
			body: JSON.stringify({
				project_id: input.project_id,
				email: { to: input.email },
			}),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess({
			status: "deleted",
			email: input.email,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Managed Alerts ---

export async function handleListManagedAlertsContactPoints(
	input: ListManagedAlertsContactPointsInput,
) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const pagination = paginationToQuery(input.page, input.pageSize);
		const params = new URLSearchParams({
			project_id: input.project_id,
			page: String(pagination.page),
			page_size: String(pagination.page_size),
		});
		const response = (await client.fetch({
			method: "GET",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager/managed-alerts-contact-points`,
			urlParams: params,
		})) as {
			contact_points: unknown[];
			total_count: number;
		};
		return formatSuccess(
			buildPaginatedResponse(
				response.contact_points ?? [],
				response.total_count ?? 0,
				input.page,
				input.pageSize,
			),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleEnableManagedAlerts(input: EnableManagedAlertsInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager/managed-alerts/enable`,
			body: JSON.stringify({ project_id: input.project_id }),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDisableManagedAlerts(input: DisableManagedAlertsInput) {
	try {
		const config = loadAuthConfig();
		const client = createScalewayClient(config);
		const region = resolveRegion(input.region);
		const response = await client.fetch({
			method: "POST",
			path: `/${COCKPIT_API_PREFIX}/regions/${region}/alert-manager/managed-alerts/disable`,
			body: JSON.stringify({ project_id: input.project_id }),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(response);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
