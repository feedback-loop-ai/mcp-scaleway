import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
	handleCreatePrivateNetwork,
	handleCreateVpc,
	handleDeletePrivateNetwork,
	handleDeleteVpc,
	handleGetPrivateNetwork,
	handleGetVpc,
	handleListPrivateNetworks,
	handleListVpcs,
	handleUpdatePrivateNetwork,
	handleUpdateVpc,
} from "./handlers.js";
import {
	CreatePrivateNetworkInput,
	CreateVpcInput,
	DeletePrivateNetworkInput,
	DeleteVpcInput,
	GetPrivateNetworkInput,
	GetVpcInput,
	ListPrivateNetworksInput,
	ListVpcsInput,
	UpdatePrivateNetworkInput,
	UpdateVpcInput,
} from "./types.js";

export function registerVpcTools(server: McpServer): void {
	// --- VPC Tools ---

	server.tool(
		"scaleway_vpc_list_vpcs",
		"List all VPCs in a region. Returns paginated results with VPC details including name, tags, and private network count.",
		ListVpcsInput.shape,
		async (params) => handleListVpcs(ListVpcsInput.parse(params)),
	);

	server.tool(
		"scaleway_vpc_get_vpc",
		"Get details of a specific VPC by ID, including its name, tags, default status, and private network count.",
		GetVpcInput.shape,
		async (params) => handleGetVpc(GetVpcInput.parse(params)),
	);

	server.tool(
		"scaleway_vpc_create_vpc",
		"Create a new VPC in a region. Requires a name and project ID. Optionally accepts tags.",
		CreateVpcInput.shape,
		async (params) => handleCreateVpc(CreateVpcInput.parse(params)),
	);

	server.tool(
		"scaleway_vpc_update_vpc",
		"Update a VPC's name or tags. Specify only the fields you want to change.",
		UpdateVpcInput.shape,
		async (params) => handleUpdateVpc(UpdateVpcInput.parse(params)),
	);

	server.tool(
		"scaleway_vpc_delete_vpc",
		"Delete a VPC by ID. The VPC must have no private networks attached.",
		DeleteVpcInput.shape,
		async (params) => handleDeleteVpc(DeleteVpcInput.parse(params)),
	);

	// --- Private Network Tools ---

	server.tool(
		"scaleway_vpc_list_private_networks",
		"List private networks in a region. Supports filtering by VPC ID, name, tags, and project. Returns paginated results.",
		ListPrivateNetworksInput.shape,
		async (params) => handleListPrivateNetworks(ListPrivateNetworksInput.parse(params)),
	);

	server.tool(
		"scaleway_vpc_get_private_network",
		"Get details of a specific private network by ID, including its VPC, subnets, and tags.",
		GetPrivateNetworkInput.shape,
		async (params) => handleGetPrivateNetwork(GetPrivateNetworkInput.parse(params)),
	);

	server.tool(
		"scaleway_vpc_create_private_network",
		"Create a new private network within a VPC. Requires name, project ID, and VPC ID. Optionally accepts tags and CIDR subnets.",
		CreatePrivateNetworkInput.shape,
		async (params) => handleCreatePrivateNetwork(CreatePrivateNetworkInput.parse(params)),
	);

	server.tool(
		"scaleway_vpc_update_private_network",
		"Update a private network's name, tags, or subnets. Specify only the fields you want to change.",
		UpdatePrivateNetworkInput.shape,
		async (params) => handleUpdatePrivateNetwork(UpdatePrivateNetworkInput.parse(params)),
	);

	server.tool(
		"scaleway_vpc_delete_private_network",
		"Delete a private network by ID. The network must have no attached resources.",
		DeletePrivateNetworkInput.shape,
		async (params) => handleDeletePrivateNetwork(DeletePrivateNetworkInput.parse(params)),
	);
}
