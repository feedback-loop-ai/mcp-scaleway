# 048-data-warehouse: Data Warehouse for ClickHouse® API

## Overview
MCP tools for Scaleway Data Warehouse for ClickHouse® — a managed, regional
ClickHouse® analytics database. The API manages deployments (clusters), their
databases, users, and endpoints, and exposes read-only catalogs of sizing
presets and available ClickHouse® versions.

- API slug: `datawarehouse`, version `v1beta1`, region-scoped (`fr-par`).
- Auth: `X-Auth-Token` secret key header.
- Status: **Implemented** (public API reference verified).

## User Stories

### P1 - Deployment lifecycle
- As a user, I can list, get, create, update, and delete Data Warehouse deployments.
- As a user, I can start and stop a deployment.
- As a user, I can retrieve a deployment's TLS certificate to connect securely.

### P1 - Manage databases
- As a user, I can list, create, and delete databases within a deployment.

### P1 - Manage users
- As a user, I can list, create, update, and delete deployment users (setting passwords and admin rights).

### P2 - Manage endpoints
- As a user, I can create a public or Private Network endpoint for a deployment and delete an endpoint.

### P3 - Discover sizing and versions
- As a user, I can list available configuration presets.
- As a user, I can list available ClickHouse® versions.

## Acceptance Scenarios
1. Given a valid region and Project, when I create a deployment with a name, then a Deployment object is returned with status `creating`.
2. Given a deployment ID, when I stop then start it, then the returned status transitions through `stopping`/`starting`.
3. Given a deployment, when I create a database `analytics`, then it appears in the database list.
4. Given a deployment, when I create a user with `is_admin=true`, then the user list reports it as an admin.
5. Given a deployment, when I create a public endpoint, then an Endpoint object with a `public` block and a DNS record is returned.
6. Given an invalid deployment ID, when I get it, then a `not_found` error is returned.

## Functional Requirements
- FR-1: Expose list/get/create/update/delete for deployments.
- FR-2: Expose start, stop, and TLS-certificate retrieval for deployments.
- FR-3: Expose list/create/delete for databases (delete keyed by database name).
- FR-4: Expose list/create/update/delete for users (update/delete keyed by user name).
- FR-5: Expose create/delete for endpoints (public or Private Network).
- FR-6: Expose read-only list of presets and versions.
- FR-7: All list tools support `page`/`page_size` and documented `order_by`/filter query params.
- FR-8: All tools map Scaleway HTTP errors to the shared error taxonomy.

## Out of Scope
- No `get`/`update` for individual databases or endpoints — the API provides none (databases have only list/create/delete; endpoints only create/delete).
- No metrics, logs, backups, or ACL endpoints — none exist in the `datawarehouse/v1beta1` reference.
- Only `fr-par` is currently accepted by the API; the region parameter is left as a general Scaleway region string for forward compatibility.
