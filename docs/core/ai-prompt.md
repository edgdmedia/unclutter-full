# AI Prompt: Build the Unclutter Core Plugin for WordPress

## Context
You are to build the "Unclutter Core" plugin, which forms the foundation of a modular mental health platform. The plugin must be architected for extensibility and portability, using custom database tables with the prefix `unclutter_` (e.g., `wp_unclutter_profiles`). All business logic must be in the plugin (not the theme), and all user-related data must be decoupled from WordPress post types.

## Requirements

### 1. Database
- Create custom tables:
  - `wp_unclutter_profiles`: User profiles, linked to `wp_users.ID`.
  - `wp_unclutter_audit_logs`: Audit logs for user actions.
  - `wp_unclutter_notifications`: User notifications.
- All tables must use the `unclutter_` prefix after the standard WP prefix.

### 2. User Profile Management & Verification
- On user registration, create a profile in `wp_unclutter_profiles`.
- Generate a verification code and send via email (code must be input, not just a clickable link).
- Provide CRUD operations for profiles via REST API.
- Store additional metadata in a `meta` JSON field.
- Store user preferences (notifications, language, etc.) in a `preferences` JSON field or related table.
- Store user roles in a many-to-many relationship (profile/role tables).
- All feature plugins must reference users by `profile_id` (not WP user ID).
- Track email verification status and code expiry.

### 3. Authentication, Roles & Permissions
- Implement JWT-based authentication endpoints:
  - Login, register, logout, verify token.
  - Email verification (accepts code input, not just a clickable link)
  - Resend verification code
  - Password reset (request code, reset with code)
- Issue JWT on login, validate for all protected endpoints.
- Implement role-based access control for APIs (roles: user, therapist, admin, etc.)
- Provide endpoints to query and assign roles (admin only).

### 4. REST API
- All endpoints must be under `/api/v1/`.
- Endpoints for profile management, authentication (including verification and password reset), roles, subscriptions, preferences, notifications, emails, and audit logs.
- All endpoints (except login/register/verification/password reset) require JWT auth.
- Input validation and standardized error responses.
- API rate limiting enforced per user/IP/endpoint for sensitive actions.

### 5. Shared Utilities: Notifications, Emails, Subscriptions, and Logging
- Provide functions for feature plugins to:
  - Lookup/create profile by WP user
  - Generate notifications (service and feature-specific) via a centralized notification system
  - Send emails (service and feature-specific) via a centralized email system
  - Log actions to audit table
  - Query and check user roles/permissions
  - Query and check user subscriptions and feature entitlements
  - Access and update user preferences (notifications, language, etc.)
  - Log errors and monitor system health
- Allow feature plugins to extend profile metadata.
- All notifications and emails are handled by the core plugin, with customizable templates, logging, and i18n support.
- Subscription system is centralized, but supports feature-level entitlements/tiers.

### 6. Security
- Sanitize and validate all input.
- Use WP nonces and capabilities where appropriate.
- Follow WordPress coding standards.

### 7. Documentation
- Inline code comments and a README for plugin usage and API.

## Deliverables
- Production-ready WordPress plugin code in PHP
- Database migration/installation scripts (including all tables for profiles, roles, subscriptions, preferences, rate limits, logs, etc.)
- REST API endpoints as described (including roles, subscriptions, preferences, rate limiting, logging, and i18n)
- Example usage for feature plugins (roles, subscriptions, notifications, preferences)
- README.md documenting setup, API, extensibility, and internationalization

---

**Build for extensibility, portability, and security. All user and shared logic must be in this plugin, with no reliance on themes or WP post types.**
