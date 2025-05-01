# AI Prompt: Build the Unclutter Journal Plugin

## Context
You are to build the "Unclutter Journal" plugin for WordPress, enabling users to create, organize, and share journal entries with advanced privacy, prompts, and community features. The plugin must be modular, extensible, and fully integrated with the Unclutter Core plugin for authentication, user management, notifications, permissions, and extensibility. All custom tables must use the `unclutter_` prefix after the WP prefix (e.g., `wp_unclutter_journal_entries`).

## Requirements

### 1. Core Integration
- All user references must use `profile_id` from the core plugin (not WP user ID).
- Authentication, roles/permissions, notifications, rate limiting, audit logging, and internationalization are handled via the core plugin.
- All endpoints require JWT authentication via the core plugin.
- Use the core plugin's notification/email system for prompts, sharing, and community alerts.

### 2. Data Model
- Implement all tables as specified in the FRD, using the `unclutter_` prefix.
- All journal tables (entries, prompts, comments, reactions) reference `profile_id` from the core plugin.
- Data model must be extensible for future features (voice, new journal types, etc).

### 3. Features
- Rich text editor for journal entries (formatting, autosave, offline support)
- Prompts system: automated, theme-based, and context-aware recommendations
- Voice-to-text journaling and transcription (future extension)
- Multiple journal types (Reflection, Gratitude, Notes, Custom)
- Tagging and mood association with entries
- Full-text search, filtering, and sorting (by date, type, mood, tags)
- End-to-end encryption for all entries
- Entry locking (time-based unlock)
- Selective and anonymous sharing to Community Notes
- Community Notes: feed of shared entries, with comments and reactions (anonymous or not)
- Mobile-first, PWA-ready, and offline-capable

### 4. API Endpoints
- Implement REST API endpoints for all resources (entries, prompts, comments, reactions, community) as described in the FRD.
- All endpoints must be versioned (`/api/v1/journal/`) and require JWT/auth/role validation.
- Support filtering, pagination, and search where appropriate.

### 5. Security & Privacy
- All sensitive data encrypted at rest and in transit (as per core plugin).
- Strict input validation and audit logging for all actions.
- Rate limiting via core plugin for sensitive endpoints.
- Entry locking and time-based unlock for privacy
- Anonymous and selective sharing for Community Notes

### 6. Notifications & Internationalization
- Use core plugin notification/email system for prompts, sharing, and community alerts.
- All user-facing content must support i18n/localization.

### 7. Documentation
- Inline code comments and a README for plugin usage, API, and extensibility.

## Deliverables
- Production-ready WordPress plugin code in PHP
- Database migration/installation scripts for all tables
- REST API endpoints as described
- Example usage for feature plugins and integrations
- README.md documenting setup, API, and extensibility
