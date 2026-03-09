import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { registerAppleSiliconTools } from "./apple-silicon/index.js";
import { registerElasticMetalTools } from "./elastic-metal/index.js";
// Compute (US1)
import { registerInstancesTools } from "./instances/index.js";

// Storage & Data (US2)
import { registerBlockStorageTools } from "./block-storage/index.js";
import { registerMongodbTools } from "./mongodb/index.js";
import { registerObjectStorageTools } from "./object-storage/index.js";
import { registerRdbTools } from "./rdb/index.js";
import { registerRedisTools } from "./redis/index.js";

import { registerDnsTools } from "./dns/index.js";
import { registerDomainRegistrarTools } from "./domain-registrar/index.js";
import { registerEdgeServicesTools } from "./edge-services/index.js";
import { registerIamTools } from "./iam/index.js";
import { registerIpamTools } from "./ipam/index.js";
import { registerKeyManagerTools } from "./key-manager/index.js";
import { registerLbTools } from "./lb/index.js";
import { registerPublicGatewayTools } from "./public-gateway/index.js";
import { registerSecretManagerTools } from "./secret-manager/index.js";
// Networking & Security (US3)
import { registerVpcTools } from "./vpc/index.js";

import { registerContainersTools } from "./containers/index.js";
import { registerFunctionsTools } from "./functions/index.js";
import { registerJobsTools } from "./jobs/index.js";
// Serverless & Containers (US4)
import { registerK8sTools } from "./k8s/index.js";
import { registerRegistryTools } from "./registry/index.js";
import { registerServerlessSqldbTools } from "./serverless-sqldb/index.js";

import { registerCockpitTools } from "./cockpit/index.js";
import { registerGenerativeApisTools } from "./generative-apis/index.js";
// AI & Managed Services (US5)
import { registerInferenceTools } from "./inference/index.js";
import { registerIotTools } from "./iot/index.js";
import { registerNatsTools } from "./nats/index.js";
import { registerSnsTools } from "./sns/index.js";
import { registerSqsTools } from "./sqs/index.js";
import { registerTemTools } from "./tem/index.js";
import { registerWebhostingTools } from "./webhosting/index.js";

// Account & Billing (US6)
import { registerAccountTools } from "./account/index.js";
import { registerBillingTools } from "./billing/index.js";
import { registerMarketplaceTools } from "./marketplace/index.js";

export function registerAllTools(server: McpServer): void {
	// Compute
	registerInstancesTools(server);
	registerElasticMetalTools(server);
	registerAppleSiliconTools(server);

	// Storage & Data
	registerBlockStorageTools(server);
	registerObjectStorageTools(server);
	registerRdbTools(server);
	registerRedisTools(server);
	registerMongodbTools(server);

	// Networking & Security
	registerVpcTools(server);
	registerLbTools(server);
	registerPublicGatewayTools(server);
	registerDnsTools(server);
	registerDomainRegistrarTools(server);
	registerIpamTools(server);
	registerEdgeServicesTools(server);
	registerIamTools(server);
	registerSecretManagerTools(server);
	registerKeyManagerTools(server);

	// Serverless & Containers
	registerK8sTools(server);
	registerRegistryTools(server);
	registerFunctionsTools(server);
	registerContainersTools(server);
	registerJobsTools(server);
	registerServerlessSqldbTools(server);

	// AI & Managed Services
	registerInferenceTools(server);
	registerGenerativeApisTools(server);
	registerCockpitTools(server);
	registerNatsTools(server);
	registerSqsTools(server);
	registerSnsTools(server);
	registerTemTools(server);
	registerIotTools(server);
	registerWebhostingTools(server);

	// Account & Billing
	registerAccountTools(server);
	registerBillingTools(server);
	registerMarketplaceTools(server);
}
