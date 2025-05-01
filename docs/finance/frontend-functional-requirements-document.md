# Unclutter Finance Frontend - Functional Requirements Document (FRD)

## 1. System Overview
The Unclutter Finance frontend is a React-based PWA that communicates with the Unclutter Core and Finance plugin REST APIs. It provides a secure, responsive, and user-friendly interface for all finance features.

## 2. Functional Requirements
### 2.1 User Management (via Core)
- Registration, login, logout, password reset, profile management
- JWT authentication, token refresh, session timeout (30 min inactivity)
- Route guards for protected pages

### 2.2 Dashboard
- Display account balances, budgets, goals, recent transactions
- Render charts for income vs. expenses, budget status, goal progress

### 2.3 Accounts
- List all user accounts
- Add, edit, delete accounts (with type selection)
- Show account balances, recent transactions
- Account type selection from unified taxonomy

### 2.4 Transactions
- List, add, edit, delete transactions
- Assign category (from unified taxonomy)
- Attach notes, receipts (file upload), tags
- Search/filter by date, amount, category, account, tag
- Export transactions (CSV)
- Offline entry and sync

### 2.5 Categories & Taxonomies
- List, add, edit, delete categories (income, expense, account types, tags)
- Hierarchical category support
- Category selection in forms

### 2.6 Budgets
- List, add, edit, delete budgets (by category/month)
- Visualize budget status (progress bar, color indicators)
- Budget trends/history

### 2.7 Savings Goals
- List, add, edit, delete goals
- Track progress (amount saved, % complete)
- Link goals to accounts
- Support both fixed and percentage-of-income goals
- Visualize goal achievement

### 2.8 Reports & Analytics
- Generate and display reports (income/expense, budget, goal progress)
- Export reports (CSV/PDF)

### 2.9 Notifications
- Display notifications/alerts from backend (budget, goals, reminders)

### 2.10 PWA Features
- Offline support (local cache, sync on reconnect)
- Installable on mobile/desktop
- Push notifications (via backend)

### 2.11 Security & Compliance
- JWT authentication for all API calls
- Secure token storage
- Input validation, error handling
- Accessibility (WCAG 2.1 AA)

### 2.12 Internationalization
- All UI supports i18n/localization

## 3. Non-Functional Requirements
- Responsive, fast, and reliable UI
- Modern codebase (React, TypeScript)
- Well-documented

## 4. Deliverables
- Production-ready PWA codebase
- Documentation and usage guides
