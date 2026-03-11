# Feature Specification: Scaleway Generative APIs MCP Tools

**Feature Branch**: `030-generative-apis`
**Created**: 2026-03-11
**Status**: Approved
**Input**: Implement MCP tools for the Scaleway Generative APIs (OpenAI-compatible AI inference)

## User Scenarios & Testing

### User Story 1 - Model Discovery (Priority: P1)

As an AI agent, I need to list and inspect available generative AI models on Scaleway so that I can choose the right model for a task.

**Why this priority**: Model discovery is a prerequisite for all inference operations. Users must know which models are available before they can generate completions or embeddings.

**Independent Test**: Can be fully tested by listing models and retrieving a specific model by ID.

**Acceptance Scenarios**:

1. **Given** valid credentials and region, **When** I call `scaleway_generative_apis_list_models`, **Then** I receive a list of available models with their IDs, creation timestamps, and owners
2. **Given** a valid model_id and region, **When** I call `scaleway_generative_apis_get_model`, **Then** I receive the model details
3. **Given** a non-existent model_id, **When** I call `scaleway_generative_apis_get_model`, **Then** I receive a `not_found` error

---

### User Story 2 - Chat Completion (Priority: P1)

As an AI agent, I need to generate chat completions using Scaleway's generative AI models so that I can perform text generation tasks.

**Why this priority**: Chat completion is the core inference capability and the primary use case for generative APIs.

**Independent Test**: Can be tested by sending a chat completion request with a valid model and messages array.

**Acceptance Scenarios**:

1. **Given** valid credentials, region, model, and messages, **When** I call `scaleway_generative_apis_chat_completion`, **Then** I receive a completion response with choices and usage statistics
2. **Given** optional parameters (temperature, max_tokens, top_p), **When** I call `scaleway_generative_apis_chat_completion`, **Then** the generation respects those parameters
3. **Given** an invalid model ID, **When** I call `scaleway_generative_apis_chat_completion`, **Then** I receive a structured error response

---

### User Story 3 - Text Embeddings (Priority: P2)

As an AI agent, I need to create text embeddings using Scaleway's generative AI models so that I can perform semantic search and similarity tasks.

**Why this priority**: Embeddings are a secondary inference capability used for search, clustering, and retrieval-augmented generation.

**Independent Test**: Can be tested by sending a single text or array of texts to the embedding endpoint.

**Acceptance Scenarios**:

1. **Given** valid credentials, region, model, and a text string, **When** I call `scaleway_generative_apis_create_embedding`, **Then** I receive an embedding vector with usage statistics
2. **Given** an array of text strings, **When** I call `scaleway_generative_apis_create_embedding`, **Then** I receive an embedding vector for each input text
3. **Given** an invalid model ID, **When** I call `scaleway_generative_apis_create_embedding`, **Then** I receive a structured error response

---

### Edge Cases

- Invalid region format returns a structured validation error
- Model not found (404) returns a `not_found` error type
- Missing required fields (e.g., no messages on chat completion) returns `invalid_input` error
- Empty messages array is rejected by Zod validation (min 1)
- Temperature out of range (< 0 or > 2) is rejected by Zod validation
- max_tokens with non-positive value is rejected by Zod validation
- Network errors to the Generative APIs endpoint return structured error responses

## Requirements

### Functional Requirements

- **FR-001**: System MUST list available generative AI models
- **FR-002**: System MUST get a specific model by ID (client-side filtering from list endpoint)
- **FR-003**: System MUST create chat completions with model, messages, and optional parameters (temperature, max_tokens, top_p)
- **FR-004**: System MUST create text embeddings with model and input (string or string array)
- **FR-005**: All tools MUST validate inputs using Zod schemas
- **FR-006**: All Scaleway API errors MUST be mapped to structured MCP error responses
- **FR-007**: All tools MUST accept a region parameter (regional API locality, defaults to fr-par)
- **FR-008**: Authentication MUST use Bearer token with SCW_SECRET_KEY via shared auth module

### Key Entities

- **Model**: AI model with id, object ("model"), created (unix timestamp), owned_by
- **ChatMessage**: Message with role (system, user, assistant) and content
- **ChatCompletionChoice**: Response choice with index, message, finish_reason (stop, length, content_filter)
- **Usage**: Token usage with prompt_tokens, completion_tokens, total_tokens
- **ChatCompletionResponse**: Full response with id, object, created, model, choices, usage
- **EmbeddingData**: Embedding with object ("embedding"), embedding (float array), index
- **EmbeddingResponse**: Full response with object, data (array of embeddings), model, usage

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 4 MCP tools are registered and callable via the MCP protocol
- **SC-002**: 100% line and branch code coverage across all generative API tool files
- **SC-003**: All tools map to documented Scaleway Generative APIs endpoints
- **SC-004**: Contract tests validate request/response shapes for every tool
- **SC-005**: Parity matrix includes all Generative APIs operations

## Clarifications

**Resolved decisions from self-clarification:**

- **Locality**: Regional API. Base URL pattern: `https://api.scaleway.ai/{region}/v1/`. Default region: fr-par
- **Pagination**: No pagination for model listing (returns all models in a single response)
- **Auth**: SCW_SECRET_KEY used as Bearer token (via shared `loadAuthConfig`)
- **Tool naming**: `scaleway_generative_apis_{action}` pattern (e.g., `scaleway_generative_apis_list_models`)
- **Error handling**: Use shared `mapScalewayError` + `formatErrorResponse` from `src/shared/errors.ts`
- **OpenAI compatibility**: The API follows the OpenAI API format (models, chat/completions, embeddings endpoints)
- **Streaming**: Not supported. All requests use `stream: false`
- **Get model**: Implemented via client-side filtering of the list models response (no dedicated GET endpoint)
- **Chat roles**: system, user, assistant
- **Finish reasons**: stop, length, content_filter
