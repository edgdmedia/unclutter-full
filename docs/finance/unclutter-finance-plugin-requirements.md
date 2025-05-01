# Unclutter Finance Plugin - Unified Requirements

## 1. Introduction
The **Unclutter Finance Plugin** is an official module for the Unclutter platform, enabling users to track income, expenses, accounts, budgets, and savings goals. It is tightly integrated with the Unclutter Core plugin, leveraging its authentication, user management, permissions, notifications, and extensibility features. All custom tables use the `unclutter_` prefix and reference `profile_id` from the core plugin.

---

## 2. System Architecture
- **Frontend**: React-based Progressive Web App (PWA) with offline support and mobile-first UX.
- **Backend**: WordPress plugin (PHP), with custom REST API endpoints and database tables.
- **Authentication**: JWT-based, via Unclutter Core plugin.
- **User Context**: All user/account references use `profile_id` (never WP user ID).
- **Notifications, Permissions, Rate Limiting, Audit Logging, i18n**: Provided by Unclutter Core plugin.

---

## 3. Data Model
- All finance tables (accounts, categories, transactions, budgets, goals) use the `unclutter_` prefix and reference `profile_id`.
- All taxonomies (account types, income categories, expense categories, tags, etc.) are managed in a single unified categories table (e.g., `unclutter_finance_categories`) with a `type` column to distinguish usage (e.g., `account_type`, `income`, `expense`, `tag`).
- Data model is extensible for future features (e.g., shared finances, advanced budgeting, new taxonomy types).

### Main Entities
- **Accounts**: Checking, savings, credit cards, etc.
- **Transactions**: Income/expenses, with category assignment.
- **Categories**: All category/taxonomy types (account types, income, expense, tags, etc.) unified in one table, with type and hierarchy.
- **Budgets**: Monthly budgets by category, with tracking.
- **Goals**: Savings goals, progress tracking, linking to accounts.

---

## 4. Features
- CRUD for financial accounts.
- CRUD for transactions (income/expense), with category assignment.
- Category management (default/custom, hierarchy).
- Monthly budgets by category, with budget tracking and visualizations.
- Savings goals: creation, progress tracking, linking to accounts.
- Finance dashboard: account balances, income/expense charts, budget status.
- Transaction search, filtering, and export (CSV).
- PWA features: offline support, mobile-first UI.

---

## 5. API Endpoints
- REST API endpoints for all resources (accounts, transactions, categories, budgets, goals).
- All endpoints are versioned (`/api/v1/finance/`) and require JWT authentication and role validation via Unclutter Core.
- Support for filtering, pagination, and search.

---

## 6. Security & Compliance
- All sensitive data encrypted at rest and in transit.
- Strict input validation and audit logging for all actions.
- Rate limiting for sensitive endpoints (via core plugin).

---

## 7. Notifications & Internationalization
- Use Unclutter Core notification/email system for alerts (budget, reminders, etc).
- All user-facing content supports i18n/localization.

---

## 8. Documentation
- Inline code comments and a README for plugin usage, API, and extensibility.

---

## 9. Deliverables
- Production-ready Unclutter Finance Plugin code (PHP, JS/React)
- Database migration/installation scripts for all tables
- REST API endpoints as described
- Example usage for feature plugins and integrations
- README.md documenting setup, API, and extensibility

---

## 10. Frontend Feature Requirements

### 10.1 User Management (via Core)
- Registration, login, password reset, and profile management handled by Unclutter Core.

### 10.2 Finance Dashboard
- Overview of account balances, budgets, goals, and charts.
- Responsive, mobile-first UI.

### 10.3 Accounts
- List, add, edit, delete accounts.
- View account balances and transaction history.

### 10.4 Transactions
- Add, edit, delete transactions (income/expense).
- Assign categories.
- Search, filter, and export transactions.

### 10.5 Categories
- Manage default and custom categories (with hierarchy).

### 10.6 Budgets
- Create/edit monthly budgets by category.
- Visual indicators for budget status (under/over).

### 10.7 Goals
- Create/edit savings goals.
- Track progress and link to accounts.

### 10.8 PWA Features
- Offline support, installable on mobile, push notifications (via core).

### 10.9 Security
- JWT authentication for all API calls.
- Handle session timeout and token refresh.

### 10.10 Internationalization
- All UI text supports i18n/localization.

---

## 11. Non-Functional Requirements
- Fast, responsive UI.
- Accessible (WCAG 2.1 AA).
- Secure (OWASP Top 10).
- Extensible for future features.
- Well-documented for developers.
