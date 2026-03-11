# MongoDB API Specification

Base path: `/mongodb/v1alpha1/regions/{region}`
Locality: regional

## Endpoints

### Instances
- `GET /instances` - List instances (paginated)
- `GET /instances/{instance_id}` - Get instance
- `POST /instances` - Create instance
- `PATCH /instances/{instance_id}` - Update instance
- `DELETE /instances/{instance_id}` - Delete instance

### Users
- `GET /instances/{instance_id}/users` - List users (paginated)
- `POST /instances/{instance_id}/users` - Create user
- `PATCH /instances/{instance_id}/users/{name}` - Update user
- `DELETE /instances/{instance_id}/users/{name}` - Delete user

### Snapshots
- `GET /snapshots` - List snapshots (paginated)
- `POST /instances/{instance_id}/snapshots` - Create snapshot
- `GET /snapshots/{snapshot_id}` - Get snapshot
- `POST /snapshots/{snapshot_id}/restore` - Restore snapshot
- `DELETE /snapshots/{snapshot_id}` - Delete snapshot

### Reference
- `GET /node-types` - List node types (paginated)
- `GET /versions` - List versions (paginated)

## Instance Status Values
unknown_status, ready, provisioning, configuring, deleting, error, initializing, locked, snapshotting

## Snapshot Status Values
unknown_status, creating, ready, restoring, deleting, error, locked
