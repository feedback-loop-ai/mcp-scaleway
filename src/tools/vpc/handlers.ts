import { loadAuthConfig } from "../../shared/auth.js";
import { createScalewayClient } from "../../shared/client.js";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import { buildPaginatedResponse, paginationToQuery } from "../../shared/pagination.js";
import type {
	CreatePrivateNetworkInput,
	CreateVpcInput,
	DeletePrivateNetworkInput,
	DeleteVpcInput,
	GetPrivateNetworkInput,
	GetVpcInput,
	ListPrivateNetworksInput,
	ListVpcsInput,
	PrivateNetwork,
	UpdatePrivateNetworkInput,
	UpdateVpcInput,
	Vpc,
} from "./types.js";

const VPC_API_V2 = "/vpc/v2/regions";

function getClient() {
	const config = loadAuthConfig();
	return createScalewayClient(config);
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

// --- VPC Handlers ---

export async function handleListVpcs(input: ListVpcsInput) {
	try {
		const client = getClient();
		const { page, pageSize, region, ...filters } = input;
		const pq = paginationToQuery(page, pageSize);
		const urlParams = new URLSearchParams({
			page: String(pq.page),
			page_size: String(pq.page_size),
			...(filters.name ? { name: filters.name } : {}),
			...(filters.project ? { project: filters.project } : {}),
		});
		if (filters.tags) {
			for (const tag of filters.tags) {
				urlParams.append("tags", tag);
			}
		}

		const body = await client.fetch<{ vpcs: Vpc[]; total_count: number }>({
			method: "GET",
			path: `${VPC_API_V2}/${region}/vpcs`,
			urlParams,
		});
		return formatSuccess(
			buildPaginatedResponse(body.vpcs ?? [], body.total_count ?? 0, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetVpc(input: GetVpcInput) {
	try {
		const client = getClient();
		const body = await client.fetch<Vpc>({
			method: "GET",
			path: `${VPC_API_V2}/${input.region}/vpcs/${input.vpc_id}`,
		});
		return formatSuccess(body);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateVpc(input: CreateVpcInput) {
	try {
		const client = getClient();
		const body = await client.fetch<Vpc>({
			method: "POST",
			path: `${VPC_API_V2}/${input.region}/vpcs`,
			body: JSON.stringify({
				name: input.name,
				project: input.project,
				tags: input.tags ?? [],
			}),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(body);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateVpc(input: UpdateVpcInput) {
	try {
		const client = getClient();
		const { region, vpc_id, ...updateFields } = input;
		const body = await client.fetch<Vpc>({
			method: "PATCH",
			path: `${VPC_API_V2}/${region}/vpcs/${vpc_id}`,
			body: JSON.stringify(updateFields),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(body);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteVpc(input: DeleteVpcInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${VPC_API_V2}/${input.region}/vpcs/${input.vpc_id}`,
		});
		return formatSuccess({ success: true, vpc_id: input.vpc_id });
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

// --- Private Network Handlers ---

export async function handleListPrivateNetworks(input: ListPrivateNetworksInput) {
	try {
		const client = getClient();
		const { page, pageSize, region, ...filters } = input;
		const pq = paginationToQuery(page, pageSize);
		const urlParams = new URLSearchParams({
			page: String(pq.page),
			page_size: String(pq.page_size),
			...(filters.name ? { name: filters.name } : {}),
			...(filters.vpc_id ? { vpc_id: filters.vpc_id } : {}),
			...(filters.project_id ? { project_id: filters.project_id } : {}),
		});
		if (filters.tags) {
			for (const tag of filters.tags) {
				urlParams.append("tags", tag);
			}
		}

		const body = await client.fetch<{ private_networks: PrivateNetwork[]; total_count: number }>({
			method: "GET",
			path: `${VPC_API_V2}/${region}/private-networks`,
			urlParams,
		});
		return formatSuccess(
			buildPaginatedResponse(body.private_networks ?? [], body.total_count ?? 0, page, pageSize),
		);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetPrivateNetwork(input: GetPrivateNetworkInput) {
	try {
		const client = getClient();
		const body = await client.fetch<PrivateNetwork>({
			method: "GET",
			path: `${VPC_API_V2}/${input.region}/private-networks/${input.private_network_id}`,
		});
		return formatSuccess(body);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreatePrivateNetwork(input: CreatePrivateNetworkInput) {
	try {
		const client = getClient();
		const body = await client.fetch<PrivateNetwork>({
			method: "POST",
			path: `${VPC_API_V2}/${input.region}/private-networks`,
			body: JSON.stringify({
				name: input.name,
				project_id: input.project_id,
				vpc_id: input.vpc_id,
				tags: input.tags ?? [],
				subnets: input.subnets ?? [],
			}),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(body);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdatePrivateNetwork(input: UpdatePrivateNetworkInput) {
	try {
		const client = getClient();
		const { region, private_network_id, ...updateFields } = input;
		const body = await client.fetch<PrivateNetwork>({
			method: "PATCH",
			path: `${VPC_API_V2}/${region}/private-networks/${private_network_id}`,
			body: JSON.stringify(updateFields),
			headers: { "Content-Type": "application/json" },
		});
		return formatSuccess(body);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeletePrivateNetwork(input: DeletePrivateNetworkInput) {
	try {
		const client = getClient();
		await client.fetch<void>({
			method: "DELETE",
			path: `${VPC_API_V2}/${input.region}/private-networks/${input.private_network_id}`,
		});
		return formatSuccess({
			success: true,
			private_network_id: input.private_network_id,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
