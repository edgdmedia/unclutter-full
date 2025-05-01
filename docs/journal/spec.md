# Journalling Plugin Specification

## Purpose
Handles private and public journaling, prompts, and mood tracking.

## Responsibilities
- Journal entry management (private/public)
- Prompt management
- Mood checker and analytics
- Integration with core plugin for user/profile context

## API Endpoints (examples)
- `GET /api/v1/journals`
- `POST /api/v1/journals`
- `GET /api/v1/prompts`
- `POST /api/v1/moods`

## Data Model
- Custom tables: `journals`, `prompts`, `moods`
- All link to `profile_id`

## Dependencies
- Requires core plugin

## Future Extensions
- AI-powered prompts, public note sharing, etc.
