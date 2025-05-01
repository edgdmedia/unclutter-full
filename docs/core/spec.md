# Core Plugin Specification

## Purpose
Manages user profiles, authentication, and all shared utilities needed by other plugins/features.

## Responsibilities
- Custom `profiles` table linked to `wp_users.ID`
- Profile CRUD API endpoints
- JWT authentication endpoints
- Shared services (notifications, audit logs, etc.)
- Utility functions for plugins to access user/profile context

## API Endpoints (examples)
- `POST /api/v1/auth/login`
- `GET /api/v1/profiles/me`
- `PUT /api/v1/profiles/me`

## Data Model
- See `../shared-guidelines.md` for the standard profile schema.

## Dependencies
- None (other plugins depend on core)

## Future Extensions
- Multi-factor auth, advanced profile fields, etc.
