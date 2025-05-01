# Functional Requirements Document (FRD): Unclutter Journal Plugin

## 1. Overview
The Journal Plugin provides a secure, flexible, and community-enabled journaling system. It integrates with the Unclutter Core plugin for authentication, permissions, notifications, logging, and internationalization.

---

## 2. Data Model

### 2.1. Table: `wp_unclutter_journal_entries`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Entry ID                                 |
| profile_id    | BIGINT, FK     | Linked user profile                      |
| type          | VARCHAR(30)    | Journal type (reflection, gratitude, etc.)|
| title         | VARCHAR(255)   | Entry title                              |
| content       | TEXT           | Entry content (encrypted)                |
| mood          | VARCHAR(30)    | Mood/emotion tag                         |
| tags          | VARCHAR(255)   | Comma-separated tags                     |
| is_locked     | TINYINT(1)     | Locked status                            |
| unlock_at     | DATETIME       | Unlock date/time (if locked)             |
| is_shared     | TINYINT(1)     | Shared to Community Notes                |
| is_anonymous  | TINYINT(1)     | Shared anonymously                       |
| created_at    | DATETIME       | Creation timestamp                       |
| updated_at    | DATETIME       | Last update timestamp                    |
| meta          | JSON           | Extensible                               |

### 2.2. Table: `wp_unclutter_journal_prompts`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Prompt ID                                |
| theme         | VARCHAR(50)    | Prompt theme/category                    |
| content       | TEXT           | Prompt text                              |
| context_rules | JSON           | Context-aware delivery rules             |
| is_active     | TINYINT(1)     | Active/inactive                          |
| created_at    | DATETIME       | Creation timestamp                       |
| meta          | JSON           | Extensible                               |

### 2.3. Table: `wp_unclutter_journal_comments`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Comment ID                               |
| entry_id      | BIGINT, FK     | Linked journal entry                     |
| profile_id    | BIGINT, FK     | User who commented                       |
| content       | TEXT           | Comment text                             |
| is_anonymous  | TINYINT(1)     | Anonymous comment flag                   |
| created_at    | DATETIME       | Timestamp                                |
| meta          | JSON           | Extensible                               |

### 2.4. Table: `wp_unclutter_journal_reactions`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Reaction ID                              |
| entry_id      | BIGINT, FK     | Linked journal entry                     |
| profile_id    | BIGINT, FK     | User who reacted                         |
| type          | VARCHAR(30)    | Reaction type (like, support, etc.)      |
| created_at    | DATETIME       | Timestamp                                |
| meta          | JSON           | Extensible                               |

---

## 3. API Endpoints

### 3.1. Journal Entries
- `GET /api/v1/journal/entries` — List/search/filter/sort entries
- `POST /api/v1/journal/entries` — Create entry
- `PUT /api/v1/journal/entries/{id}` — Update entry
- `DELETE /api/v1/journal/entries/{id}` — Delete entry
- `POST /api/v1/journal/entries/{id}/lock` — Lock entry (with unlock time)
- `POST /api/v1/journal/entries/{id}/share` — Share to Community Notes (anonymous or not)

### 3.2. Prompts
- `GET /api/v1/journal/prompts` — List prompts (by theme/context)
- `POST /api/v1/journal/prompts` — Create/edit prompt (admin)
- `GET /api/v1/journal/prompts/recommend` — Get recommended prompt (context-aware)

### 3.3. Community Notes (Sharing)
- `GET /api/v1/journal/community` — List shared entries (with filters, pagination)
- `POST /api/v1/journal/community/{id}/comment` — Add comment (anonymous or not)
- `GET /api/v1/journal/community/{id}/comments` — List comments
- `POST /api/v1/journal/community/{id}/react` — Add reaction
- `GET /api/v1/journal/community/{id}/reactions` — List reactions

---

## 4. Business Logic
- Rich text and mood tagging for all entries
- Prompts system: delivers theme-based, automated, and context-aware prompts
- Voice-to-text (future extension)
- Tagging, full-text search, filtering, sorting
- End-to-end encryption for all entries
- Entry locking with time-based unlock
- Selective and anonymous sharing to Community Notes
- Community Notes: comments and reactions (anonymous or not)
- Core plugin integration: authentication, permissions, notifications, logging, i18n
- All user references via `profile_id` from core plugin
- All tables use `unclutter_` prefix

---

## 5. Security & Extensibility
- All endpoints require JWT and role validation (via core plugin)
- Input validation and sanitization for all endpoints
- All actions logged via the core audit system
- Data model and APIs must be extensible for future features/integrations
- End-to-end encryption for all sensitive data

---

## 6. Non-Functional Requirements
- All tables use `unclutter_` prefix after the WP prefix
- All APIs are versioned (`/api/v1/`)
- Documentation for all endpoints and data models
