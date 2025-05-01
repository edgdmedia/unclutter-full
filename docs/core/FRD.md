# Functional Requirements Document (FRD): Unclutter Core Plugin

## 1. Overview
The core plugin provides all foundational user, authentication, and shared services for the Unclutter platform. It is designed for extensibility and portability, with all custom tables using an additional `unclutter_` prefix (e.g., `wp_unclutter_profiles`).

---

## 2. Database Schema

### 2.1. Table: `wp_unclutter_profiles`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Unique profile ID                        |
| wp_user_id    | BIGINT, FK     | Links to wp_users.ID                     |
| display_name  | VARCHAR(120)   | User’s display name                      |
| avatar_url    | VARCHAR(255)   | Profile picture URL                      |
| email_verified| TINYINT(1)     | Email verification status                |
| verification_code | VARCHAR(16) | Code for email verification              |
| verification_expires | DATETIME | Code expiry                              |
| language      | VARCHAR(10)    | Preferred language (for i18n)            |
| preferences   | JSON           | User preferences (notifications, etc.)   |
| created_at    | DATETIME       | Profile creation time                    |
| updated_at    | DATETIME       | Last update time                         |
| meta          | JSON           | Additional metadata (extensible)         |

### 2.2. Table: `wp_unclutter_audit_logs`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Log ID                                   |
| profile_id    | BIGINT, FK     | Linked profile                           |
| action        | VARCHAR(100)   | Action performed                         |
| details       | TEXT           | Details/context                          |
| created_at    | DATETIME       | Timestamp                                |

### 2.3. Table: `wp_unclutter_notifications`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Notification ID                          |
| profile_id    | BIGINT, FK     | Recipient profile                        |
| type          | VARCHAR(50)    | Notification type (service, feature, etc.)|
| feature       | VARCHAR(50)    | Feature/plugin source (optional)         |
| message       | TEXT           | Notification message                     |
| is_read       | TINYINT(1)     | Read status                              |
| created_at    | DATETIME       | Timestamp                                |

### 2.4. Table: `wp_unclutter_roles`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Role ID                                  |
| name          | VARCHAR(50)    | Role name (user, therapist, admin, etc.) |
| description   | VARCHAR(255)   | Role description                         |

### 2.5. Table: `wp_unclutter_profile_roles`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| profile_id    | BIGINT, FK     | Linked profile                           |
| role_id       | BIGINT, FK     | Linked role                              |

### 2.6. Table: `wp_unclutter_subscriptions`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Subscription ID                          |
| profile_id    | BIGINT, FK     | Linked profile                           |
| plan          | VARCHAR(50)    | Subscription plan/tier                   |
| status        | VARCHAR(20)    | (active, canceled, trial, etc.)          |
| started_at    | DATETIME       | Subscription start                       |
| expires_at    | DATETIME       | Expiry date                              |
| meta          | JSON           | Extensible (billing, etc.)               |

### 2.7. Table: `wp_unclutter_subscription_features`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Feature entitlement ID                   |
| subscription_id | BIGINT, FK   | Linked subscription                      |
| feature       | VARCHAR(50)    | Feature/module name                      |
| tier          | VARCHAR(50)    | Tier/level (if applicable)               |
| meta          | JSON           | Extensible                               |

### 2.8. Table: `wp_unclutter_rate_limits`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Limit record ID                          |
| profile_id    | BIGINT, FK     | Linked profile                           |
| endpoint      | VARCHAR(100)   | API endpoint                             |
| count         | INT            | Number of requests                       |
| window_start  | DATETIME       | Start of rate limit window               |

### 2.9. Table: `wp_unclutter_error_logs`
| Field         | Type           | Description                              |
|-------------- |--------------- |------------------------------------------|
| id            | BIGINT, PK     | Error log ID                             |
| profile_id    | BIGINT, FK     | Linked profile (optional)                |
| endpoint      | VARCHAR(100)   | API endpoint                             |
| error_message | TEXT           | Error details                            |
| created_at    | DATETIME       | Timestamp                                |

---

## 3. API Endpoints

### 3.1. Authentication
- `POST /api/v1/auth/login` — Authenticate (returns JWT)
- `POST /api/v1/auth/register` — Register new user/profile (triggers email with verification code)
- `POST /api/v1/auth/verify-email` — Verify email with code (user submits code)
- `POST /api/v1/auth/resend-verification` — Resend verification code
- `POST /api/v1/auth/forgot-password` — Request password reset (sends code via email)
- `POST /api/v1/auth/reset-password` — Reset password with code and new password
- `POST /api/v1/auth/logout` — Invalidate token
- `POST /api/v1/auth/verify-token` — Validate JWT

### 3.2. Profile Management
- `GET /api/v1/profiles/me` — Get current profile
- `PUT /api/v1/profiles/me` — Update current profile
- `GET /api/v1/profiles/{id}` — Get profile by ID
- `GET /api/v1/profiles/me/preferences` — Get user preferences
- `PUT /api/v1/profiles/me/preferences` — Update user preferences
- `GET /api/v1/profiles/me/roles` — Get roles for current user
- `POST /api/v1/profiles/me/roles` — Assign new role (admin only)

### 3.3. Notifications & Emails
- `GET /api/v1/notifications` — List notifications for current user
- `POST /api/v1/notifications/mark-read` — Mark notification as read
- `POST /api/v1/notifications/send` — Send notification (for core and feature plugins)
- `GET /api/v1/emails` — List sent emails for current user (optional/logging)
- `POST /api/v1/emails/send` — Send email (for core and feature plugins)
- `GET /api/v1/notifications/settings` — Get notification/email preferences
- `PUT /api/v1/notifications/settings` — Update notification/email preferences

### 3.4. Audit Logs & Logging
- `GET /api/v1/audit-logs` — List audit logs for current user
- `GET /api/v1/error-logs` — List error logs (admin only)

---

## 4. Business Logic
- All plugin features reference users by `profile_id` (not WP user ID)
- JWT issued on login, required for all API requests
- Profile creation on user registration
- Email verification required before full account activation (code-based, not just clickable link)
- Password reset via code sent to email
- Role-based access control for API endpoints and features
- Subscription status and feature entitlements checked on all relevant endpoints
- User preferences (notifications, language, etc.) respected in all communications
- API rate limiting enforced per user/IP/endpoint
- Extensible metadata for profiles (for future features)
- All actions (login, update, etc.) logged in audit table
- All errors logged for monitoring
- Notifications and emails can be generated by core or by feature plugins via centralized APIs
- Email system supports both service and feature-specific emails, using customizable templates
- All notifications/emails support i18n (sent in user’s preferred language)

---

## 5. Security
- All endpoints require JWT except registration/login/verification/password reset
- Input validation and sanitization for all endpoints
- Standardized error responses
- All verification and reset codes are time-limited and securely stored
- Rate limiting to prevent abuse
- Role-based access for sensitive endpoints

---

## 6. Extensibility
- Feature plugins can add fields to `meta` JSON in profiles
- Feature plugins can generate notifications, emails, and audit logs via core APIs
- Email/notification system is extensible for new types and templates
- Subscription and entitlement system is extensible for new features/tiers
- Preferences and language options are extensible

---

## 7. Migration/Portability
- All data is decoupled from WP post types and stored in custom tables
- Only link to WP user for authentication
- All business logic and data models are documented for future migration

---

## 8. Non-Functional Requirements
- All tables use `unclutter_` prefix after the WP prefix
- All APIs are versioned (`/api/v1/`)
- Documentation for all endpoints and data models
- Logging and monitoring for operational health
- Support for internationalization (i18n) in all user-facing content
