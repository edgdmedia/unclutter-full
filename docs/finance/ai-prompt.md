# AI Prompt: Build the Unclutter Finance Plugin

## Context
You are to build the "Unclutter Finance" plugin for WordPress, enabling users to track income, expenses, accounts, budgets, and savings goals. The plugin must be modular, extensible, and fully integrated with the Unclutter Core plugin for authentication, user management, notifications, permissions, and extensibility. All custom tables must use the `unclutter_` prefix after the WP prefix (e.g., `wp_unclutter_finance_accounts`).

## Requirements

### 1. Core Integration
- All user references must use `profile_id` from the core plugin (not WP user ID).
- Authentication, roles/permissions, notifications, rate limiting, audit logging, and internationalization are handled via the core plugin.
- All endpoints require JWT authentication via the core plugin.
- Use the core plugin's notification/email system for alerts (e.g., budget limits, reminders).

### 2. Data Model
- Implement all tables as specified in the FRD, using the `unclutter_` prefix.
- All finance tables (accounts, categories, transactions, budgets, goals) reference `profile_id` from the core plugin.
- All taxonomies (account types, income categories, expense categories, tags, etc.) are managed in a single unified categories table (e.g., `unclutter_finance_categories`) with a `type` column to distinguish usage (e.g., `account_type`, `income`, `expense`, `tag`).
- Data model must be extensible for future features (shared finances, advanced budgeting, new taxonomy types, etc).

### 3. Features
- CRUD for financial accounts (checking, savings, credit cards, etc.)
- CRUD for income/expense transactions, with category assignment
- Category management (default and custom, with hierarchy)
- Monthly budgets by category, with budget tracking and visualizations
- Savings goals: creation, progress tracking, linking to accounts
- Finance dashboard: account balances, income/expense charts, budget status
- Transaction search, filtering, and export (CSV)
- PWA features: offline support, mobile-first UI

### 4. API Endpoints
- Implement REST API endpoints for all resources (accounts, transactions, categories, budgets, goals) as described in the FRD.
- All endpoints must be versioned (`/api/v1/finance/`) and require JWT/auth/role validation.
- Support filtering, pagination, and search where appropriate.

### 5. Security & Compliance
- All sensitive data encrypted at rest and in transit (as per core plugin).
- Strict input validation and audit logging for all actions.
- Rate limiting via core plugin for sensitive endpoints.

### 6. Notifications & Internationalization
- Use core plugin notification/email system for alerts (budget, reminders, etc).
- All user-facing content must support i18n/localization.

### 7. Documentation
- Inline code comments and a README for plugin usage, API, and extensibility.

## Deliverables
- Production-ready WordPress plugin code in PHP
- Database migration/installation scripts for all tables
- REST API endpoints as described
- Example usage for feature plugins and integrations
- README.md documenting setup, API, and extensibility
