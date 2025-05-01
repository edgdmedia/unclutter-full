# AI Prompt: Build the Unclutter Finance Frontend

## Context
You are to build the Unclutter Finance frontend as a modern, mobile-first Progressive Web App (PWA). The app must integrate seamlessly with the Unclutter Core and Finance plugin REST APIs, using JWT authentication. All user/account references use `profile_id` from the core plugin. The frontend must support all finance features, be highly responsive, accessible, and internationalized.

## Requirements

### 1. Core Integration
- Authenticate via JWT (Unclutter Core API)
- All user/account references use `profile_id`
- Use REST APIs for all data (accounts, transactions, categories, budgets, goals, notifications)
- Handle token refresh and session timeout
- Use core plugin's notification system for alerts
- Support rate limiting and audit logging via backend

### 2. Data Model (Frontend)
- Mirror backend data model: accounts, transactions, categories (unified taxonomy), budgets, goals
- Local state management for offline support
- Use category `type` for account types, income/expense, tags, etc.

### 3. Features
- User registration/login/profile (via Core)
- CRUD for accounts, transactions, categories, budgets, goals
- Dashboard with charts (income/expense, budgets, goals)
- Search, filter, and export (CSV/PDF)
- Attach receipts/files to transactions
- Notifications (budget, reminders, goal milestones)
- PWA: offline support, installable, push notifications
- i18n/localization for all UI
- Accessibility (WCAG 2.1 AA)

### 4. UI/UX
- Responsive, mobile-first layouts
- Modern, intuitive navigation (sidebar/drawer, tabs, etc.)
- Visual indicators for budget/goal status
- Friendly onboarding and help
- Error handling and user feedback

### 5. Security
- Secure JWT storage (httpOnly if possible, else secure local storage)
- Input validation on all forms
- Route guards and protected pages

### 6. Tech Stack
- React (with TypeScript preferred)
- State management (Redux, Zustand, or Context)
- Service workers for offline/PWA
- Charting library (e.g., Chart.js, Recharts)
- i18n library (e.g., react-i18next)
- Testing (Jest, React Testing Library)
- Linting/formatting (ESLint, Prettier)

### 7. Deliverables
- Production-ready PWA codebase
- Documentation (setup, API usage, extensibility)
- Example usage and integration guides
