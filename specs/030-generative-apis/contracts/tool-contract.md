# Tool Contracts: Scaleway Generative APIs MCP Tools

**Feature**: 030-generative-apis | **Date**: 2026-03-11

## Model Tools

### scaleway_generative_apis_list_models

**Scaleway API**: `GET https://api.scaleway.ai/{region}/v1/models`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Scaleway region (e.g., fr-par) |

**Output**: `{ object: "list", data: Model[] }`

---

### scaleway_generative_apis_get_model

**Scaleway API**: `GET https://api.scaleway.ai/{region}/v1/models` (client-side filter by model_id)

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Scaleway region |
| model_id | string | yes | - | Model identifier to retrieve |

**Output**: `Model` (single model object)

**Error**: 404 if model_id not found in the models list

---

## Chat Completion Tools

### scaleway_generative_apis_chat_completion

**Scaleway API**: `POST https://api.scaleway.ai/{region}/v1/chat/completions`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Scaleway region |
| model | string | yes | - | Model ID (e.g., "meta/llama-3.1-8b-instruct:fp8") |
| messages | ChatMessage[] | yes | - | Array of messages (min 1). Each has role and content |
| temperature | number | no | 0.7 | Sampling temperature (0-2) |
| max_tokens | number | no | 512 | Maximum tokens to generate (positive integer) |
| top_p | number | no | 1 | Nucleus sampling parameter (0-1) |

**Request Body** (sent to Scaleway):
```json
{
  "model": "meta/llama-3.1-8b-instruct:fp8",
  "messages": [{ "role": "user", "content": "Hello" }],
  "temperature": 0.7,
  "max_tokens": 512,
  "top_p": 1,
  "stream": false
}
```

**Output**: `ChatCompletionResponse`
```json
{
  "id": "completion-id",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "meta/llama-3.1-8b-instruct:fp8",
  "choices": [{
    "index": 0,
    "message": { "role": "assistant", "content": "..." },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 50,
    "total_tokens": 60
  }
}
```

---

## Embedding Tools

### scaleway_generative_apis_create_embedding

**Scaleway API**: `POST https://api.scaleway.ai/{region}/v1/embeddings`

**Input**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| region | string | no | fr-par | Scaleway region |
| model | string | yes | - | Model ID for embeddings |
| input | string or string[] | yes | - | Text or array of texts to embed |

**Request Body** (sent to Scaleway):
```json
{
  "model": "sentence-transformers/sentence-t5-xxl:fp32",
  "input": "Text to embed"
}
```

**Output**: `EmbeddingResponse`
```json
{
  "object": "list",
  "data": [{
    "object": "embedding",
    "embedding": [0.1, 0.2, ...],
    "index": 0
  }],
  "model": "sentence-transformers/sentence-t5-xxl:fp32",
  "usage": {
    "prompt_tokens": 5,
    "total_tokens": 5
  }
}
```

---

## Common Patterns

### Authentication

All requests use Bearer token authentication:
```
Authorization: Bearer {SCW_SECRET_KEY}
Content-Type: application/json
```

### Error Responses

All errors are mapped through `mapScalewayError` + `formatErrorResponse`:
- HTTP 401/403: Authentication error
- HTTP 404: Resource not found (used for model not found in get_model)
- HTTP 422: Validation error
- HTTP 429: Rate limit exceeded
- HTTP 500+: Server error
