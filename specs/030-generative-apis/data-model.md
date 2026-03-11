# Data Model: Scaleway Generative APIs MCP Tools

**Feature**: 030-generative-apis | **Date**: 2026-03-11

## Entities

### Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Model identifier (e.g., "meta/llama-3.1-8b-instruct:fp8") |
| object | literal "model" | yes | Object type, always "model" |
| created | number (unix timestamp) | yes | Unix timestamp of model creation |
| owned_by | string | yes | Organization that owns the model |

### ChatMessage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| role | enum | yes | system, user, assistant |
| content | string | yes | The content of the message |

### ChatCompletionChoice

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| index | number (int) | yes | Choice index |
| message | ChatMessage | yes | The generated message |
| finish_reason | enum/null | yes | stop, length, content_filter, or null |

### Usage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt_tokens | number (int) | yes | Number of tokens in the prompt |
| completion_tokens | number (int) | yes | Number of tokens in the completion |
| total_tokens | number (int) | yes | Total number of tokens |

### ChatCompletionResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique identifier for the completion |
| object | literal "chat.completion" | yes | Object type |
| created | number (unix timestamp) | yes | Unix timestamp |
| model | string | yes | Model used for the completion |
| choices | ChatCompletionChoice[] | yes | Array of completion choices |
| usage | Usage | yes | Token usage statistics |

### EmbeddingData

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| object | literal "embedding" | yes | Object type, always "embedding" |
| embedding | number[] | yes | The embedding vector (array of floats) |
| index | number (int) | yes | Index of the embedding in the input array |

### EmbeddingResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| object | literal "list" | yes | Object type |
| data | EmbeddingData[] | yes | Array of embedding objects |
| model | string | yes | Model used for the embedding |
| usage | object | yes | Token usage (prompt_tokens, total_tokens) |

### EmbeddingUsage

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| prompt_tokens | number (int) | yes | Number of tokens in the input |
| total_tokens | number (int) | yes | Total number of tokens |

### ListModelsResponse

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| object | literal "list" | yes | Object type |
| data | Model[] | yes | Array of available models |
