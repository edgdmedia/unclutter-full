# Shared Specifications & Guidelines

## Coding Standards
- All business logic and data access must be in plugins, not themes.
- Use custom tables for all app data (no reliance on WP post types).
- All API endpoints must use the custom profile ID (not WP user ID directly).
- REST API endpoints should be versioned and follow RESTful conventions.
- Plugins should be independent but may depend on the core plugin for shared logic.

## Data Model
- Each feature/plugin defines its own tables, but all link to the `profiles` table via `profile_id`.
- The `profiles` table links to `wp_users.ID` for authentication.
- All user interactions and data storage reference `profile_id` for portability.

## API & Security
- Use JWT authentication for all custom API endpoints.
- Validate and sanitize all input.
- Standardize error responses and logging.

## Frontend
- PWAs should communicate with backend via REST API only.
- Shared UI components and styles are encouraged for consistency.

---

See each feature folder for specific details and requirements.
