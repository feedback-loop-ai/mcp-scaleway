# 045-instance-scaling-groups: Instance Scaling Groups (Autoscaling) API

**Status**: Implemented
**Area**: `autoscaling`
**Tool prefix**: `scaleway_autoscaling_`
**API**: Scaleway Autoscaling `v1alpha1` (zoned)

## Overview

MCP tools for the Scaleway Instance Scaling Groups (Autoscaling) API. A zoned API
that automatically adjusts the number of Compute Instances based on user-defined
scaling policies. The product is composed of three primary resources:

- **Instance groups** — the autoscaling unit tying a template to a capacity range.
- **Instance templates** — reusable blueprints describing the Instances created on scale-up.
- **Instance policies** — scaling rules (metric + threshold + action) attached to a group.

## User Stories

### P1 - Instance Group lifecycle
- As a user, I can list, get, create, update, and delete autoscaling instance groups.
- As a user, I can list the lifecycle/scaling events of an instance group.

### P1 - Instance Template lifecycle
- As a user, I can list, get, create, update, and delete instance templates.

### P1 - Scaling Policy lifecycle
- As a user, I can list, get, create, update, and delete scaling policies, optionally
  filtered by instance group.

## Acceptance Scenarios

1. **List instance groups** — Given a zone, when I list instance groups, then I receive a
   paginated collection with `totalCount`, `page`, `pageSize`, and `items`.
2. **Create instance group** — Given a name, template ID, and capacity, when I create a
   group, then the created group is returned.
3. **Create scaling policy** — Given a metric, action, type, value, priority, and instance
   group ID, when I create a policy, then the created policy is returned.
4. **Filter policies by group** — Given an `instanceGroupId`, when I list policies, then only
   policies of that group are returned.
5. **Delete resource** — Given a resource ID, when I delete it, then a `{ deleted: true, id }`
   confirmation is returned.
6. **Error mapping** — Given an API error (401/403/404/429/5xx), when a handler fails, then a
   structured `{ error: { type, message, statusCode } }` payload is returned with `isError: true`.

## Functional Requirements

- **FR-001**: Expose full CRUD for instance groups (`list`, `get`, `create`, `update`, `delete`).
- **FR-002**: Expose `list_instance_group_events` for an instance group.
- **FR-003**: Expose full CRUD for instance templates.
- **FR-004**: Expose full CRUD for instance policies (scaling policies), with an optional
  `instanceGroupId` filter on list.
- **FR-005**: All operations require a `zone` parameter validated against the Scaleway zone
  format (`xx-xxx-N`).
- **FR-006**: List operations support `page`, `pageSize`, and `orderBy`
  (`created_at_asc` | `created_at_desc`) and return `buildPaginatedResponse` output.
- **FR-007**: Request/response shapes must validate against
  `specs/scaleway-api/autoscaling/api-reference.md`.
- **FR-008**: Errors are mapped through the shared error mapper.

## Entities

See `data-model.md`. Primary entities: InstanceGroup, Capacity, Loadbalancer,
InstanceTemplate, VolumeInstanceTemplate, InstancePolicy, Metric, InstanceGroupEvent.

## Out of Scope

- **Metric detail endpoints / Cockpit wiring** — the autoscaling API surfaces metrics only as
  part of a policy definition; there are no standalone metric CRUD endpoints to expose.
- **Instance-level introspection** (listing the individual Instances spawned by a group) — the
  v1alpha1 API does not expose a dedicated endpoint for this; the underlying Instances are
  observable via the existing `scaleway_instances_*` tools.
- **Regions/zones other than the two currently in beta** (`fr-par-1`, `fr-par-2`); the tools
  accept any valid zone string so no code change is needed as availability expands.
