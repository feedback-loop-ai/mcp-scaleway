# Quickstart: Scaleway Generative APIs MCP Tools

**Feature**: 030-generative-apis | **Date**: 2026-03-11

## Prerequisites

1. Set environment variables:
   ```bash
   export SCW_ACCESS_KEY="your-access-key"
   export SCW_SECRET_KEY="your-secret-key"
   export SCW_DEFAULT_PROJECT_ID="your-project-id"
   ```

2. Start the MCP server:
   ```bash
   bun run start
   ```

## Usage Examples

### List Available Models

```json
{
  "tool": "scaleway_generative_apis_list_models",
  "arguments": {
    "region": "fr-par"
  }
}
```

### Get a Specific Model

```json
{
  "tool": "scaleway_generative_apis_get_model",
  "arguments": {
    "region": "fr-par",
    "model_id": "meta/llama-3.1-8b-instruct:fp8"
  }
}
```

### Create a Chat Completion

```json
{
  "tool": "scaleway_generative_apis_chat_completion",
  "arguments": {
    "region": "fr-par",
    "model": "meta/llama-3.1-8b-instruct:fp8",
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "What is Scaleway?" }
    ],
    "temperature": 0.7,
    "max_tokens": 512
  }
}
```

### Create a Chat Completion with Custom Parameters

```json
{
  "tool": "scaleway_generative_apis_chat_completion",
  "arguments": {
    "region": "fr-par",
    "model": "meta/llama-3.1-70b-instruct:fp8",
    "messages": [
      { "role": "user", "content": "Explain quantum computing in one paragraph." }
    ],
    "temperature": 0.3,
    "max_tokens": 256,
    "top_p": 0.9
  }
}
```

### Create Text Embeddings (Single Text)

```json
{
  "tool": "scaleway_generative_apis_create_embedding",
  "arguments": {
    "region": "fr-par",
    "model": "sentence-transformers/sentence-t5-xxl:fp32",
    "input": "Scaleway is a European cloud provider."
  }
}
```

### Create Text Embeddings (Batch)

```json
{
  "tool": "scaleway_generative_apis_create_embedding",
  "arguments": {
    "region": "fr-par",
    "model": "sentence-transformers/sentence-t5-xxl:fp32",
    "input": [
      "Scaleway is a European cloud provider.",
      "MCP enables AI tool integration.",
      "Embeddings are useful for semantic search."
    ]
  }
}
```
