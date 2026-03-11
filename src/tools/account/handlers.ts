import { Accountv3 } from "@scaleway/sdk-account";
import type { Client } from "@scaleway/sdk-client";
import { formatErrorResponse, mapScalewayError } from "../../shared/errors.js";
import type {
	CreateProjectParams,
	DeleteProjectParams,
	GetProjectParams,
	ListProjectsApiResponse,
	ListProjectsParams,
	ProjectResponse,
	UpdateProjectParams,
} from "./types.js";

function formatProject(project: Accountv3.Project): ProjectResponse {
	return {
		id: project.id,
		name: project.name,
		organization_id: project.organizationId,
		description: project.description,
		created_at: project.createdAt?.toISOString() ?? null,
		updated_at: project.updatedAt?.toISOString() ?? null,
	};
}

function successResponse(data: unknown) {
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

export function createProjectApi(client: Client): Accountv3.ProjectAPI {
	return new Accountv3.ProjectAPI(client);
}

export async function handleListProjects(api: Accountv3.ProjectAPI, params: ListProjectsParams) {
	try {
		const response = await api.listProjects({
			organizationId: params.organization_id,
			name: params.name,
			projectIds: params.project_ids,
			orderBy: params.order_by,
			page: params.page,
			pageSize: params.page_size,
		});

		const result: ListProjectsApiResponse = {
			projects: response.projects.map(formatProject),
			total_count: response.totalCount,
			page: params.page,
			page_size: params.page_size,
		};

		return successResponse(result);
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleGetProject(api: Accountv3.ProjectAPI, params: GetProjectParams) {
	try {
		const project = await api.getProject({
			projectId: params.project_id,
		});

		return successResponse(formatProject(project));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleCreateProject(api: Accountv3.ProjectAPI, params: CreateProjectParams) {
	try {
		const project = await api.createProject({
			name: params.name,
			organizationId: params.organization_id,
			description: params.description,
		});

		return successResponse(formatProject(project));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleUpdateProject(api: Accountv3.ProjectAPI, params: UpdateProjectParams) {
	try {
		const project = await api.updateProject({
			projectId: params.project_id,
			name: params.name,
			description: params.description,
		});

		return successResponse(formatProject(project));
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}

export async function handleDeleteProject(api: Accountv3.ProjectAPI, params: DeleteProjectParams) {
	try {
		await api.deleteProject({
			projectId: params.project_id,
		});

		return successResponse({
			message: `Project ${params.project_id} deleted successfully`,
		});
	} catch (error) {
		return formatErrorResponse(mapScalewayError(error));
	}
}
