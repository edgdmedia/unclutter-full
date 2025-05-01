# Product Requirements Document (PRD): Unclutter Core Plugin

## 1. Purpose
The Unclutter Core Plugin forms the backbone of the Unclutter platform. It manages user profiles, authentication, and shared utilities, providing a unified and extensible foundation for all Unclutter feature plugins (e.g., therapy, journaling, finance).

## 2. Goals
- Centralize user profile management, abstracted from WordPress user data.
- Provide secure, scalable authentication using JWT.
- Offer shared services (notifications, audit logs, utilities) for all feature plugins.
- Enable future migration away from WordPress by decoupling user data and logic from WP internals.

## 3. Target Users
- End users (app users)
- Therapists and admins (via feature plugins)
- Developers (extending Unclutter)

## 4. Features
- Custom user profiles (in `unclutter_profiles` table, with additional prefix for separation)
- Profile CRUD via REST API
- JWT-based authentication endpoints
- Shared utility services (notifications, audit logs)
- Profile lookup and mapping to WP users
- Extensible API for feature plugins

## 5. Non-Goals
- No business logic for feature modules (handled by separate plugins)
- No presentation/UI logic (handled by frontend or theme)

## 6. Success Criteria
- All user data and authentication handled via core plugin
- Feature plugins use only the core API for user/profile context
- Data model and APIs are documented and versioned

---

See FRD for functional and technical details.
