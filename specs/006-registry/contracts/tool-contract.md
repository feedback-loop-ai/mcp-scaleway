# Tool Contracts: 006-registry

## Contract: scaleway_registry_list_namespaces
- **Input**: `{ region: string, page?: number, page_size?: number, project_id?: string, name?: string, order_by?: string }`
- **Output**: `{ namespaces: Namespace[], total_count: number }`
- **Errors**: 400, 401, 403, 429, 500

## Contract: scaleway_registry_get_namespace
- **Input**: `{ region: string, namespace_id: string }`
- **Output**: `Namespace`
- **Errors**: 400, 401, 403, 404, 500

## Contract: scaleway_registry_create_namespace
- **Input**: `{ region: string, name: string, project_id?: string, description?: string, is_public?: boolean }`
- **Output**: `Namespace`
- **Errors**: 400, 401, 403, 409, 500

## Contract: scaleway_registry_update_namespace
- **Input**: `{ region: string, namespace_id: string, description?: string, is_public?: boolean }`
- **Output**: `Namespace`
- **Errors**: 400, 401, 403, 404, 500

## Contract: scaleway_registry_delete_namespace
- **Input**: `{ region: string, namespace_id: string }`
- **Output**: `Namespace`
- **Errors**: 400, 401, 403, 404, 500

## Contract: scaleway_registry_list_images
- **Input**: `{ region: string, page?: number, page_size?: number, namespace_id?: string, name?: string, order_by?: string }`
- **Output**: `{ images: Image[], total_count: number }`
- **Errors**: 400, 401, 403, 429, 500

## Contract: scaleway_registry_get_image
- **Input**: `{ region: string, image_id: string }`
- **Output**: `Image`
- **Errors**: 400, 401, 403, 404, 500

## Contract: scaleway_registry_update_image
- **Input**: `{ region: string, image_id: string, visibility?: string }`
- **Output**: `Image`
- **Errors**: 400, 401, 403, 404, 500

## Contract: scaleway_registry_delete_image
- **Input**: `{ region: string, image_id: string }`
- **Output**: `Image`
- **Errors**: 400, 401, 403, 404, 500

## Contract: scaleway_registry_list_tags
- **Input**: `{ region: string, image_id: string, page?: number, page_size?: number, name?: string, order_by?: string }`
- **Output**: `{ tags: Tag[], total_count: number }`
- **Errors**: 400, 401, 403, 429, 500

## Contract: scaleway_registry_get_tag
- **Input**: `{ region: string, tag_id: string }`
- **Output**: `Tag`
- **Errors**: 400, 401, 403, 404, 500

## Contract: scaleway_registry_delete_tag
- **Input**: `{ region: string, tag_id: string }`
- **Output**: `Tag`
- **Errors**: 400, 401, 403, 404, 500
