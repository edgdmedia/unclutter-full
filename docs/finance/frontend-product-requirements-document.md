# Unclutter Finance Frontend - Product Requirements Document (PRD)

## 1. Introduction
This document outlines the product requirements for the Unclutter Finance frontend, a modern, mobile-first Progressive Web App (PWA) that enables users to manage their finances. The frontend is tightly integrated with the Unclutter Core and Finance plugins via REST APIs and uses JWT authentication.

## 2. Goals
- Deliver a seamless, intuitive, and responsive user experience for personal finance management
- Support all finance features: accounts, transactions, budgets, goals, dashboard, and reporting
- Ensure security, accessibility, and extensibility

## 3. Scope
- All features must be accessible on mobile, tablet, and desktop
- PWA: installable, offline support, push notifications (via backend)
- Internationalization (i18n) for all UI content

## 4. User Personas
- Individuals seeking to track and improve their finances
- Users with varying levels of financial literacy
- Mobile-first users

## 5. Features
### 5.1 User Management (via Core)
- Registration, login, logout, password reset, and profile management
- JWT-based authentication, session management, and token refresh

### 5.2 Dashboard
- Overview of account balances, budgets, savings goals, and recent transactions
- Visual charts: income vs. expenses, budget status, goal progress

### 5.3 Accounts
- List, add, edit, delete accounts (checking, savings, investment, credit card, etc.)
- View account balances and transaction summaries
- Support for multiple account types (from unified taxonomy)

### 5.4 Transactions
- Add, edit, delete transactions (income/expense/transfer)
- Assign categories (from unified taxonomy)
- Attach notes, receipts (file upload), and tags
- Transaction search, filtering, and export (CSV)

### 5.5 Categories & Taxonomies
- Manage categories for income, expense, account types, and tags (from unified taxonomy)
- Hierarchical category support

### 5.6 Budgets
- Create, edit, delete monthly budgets by category
- Visualize budget status (under/over)
- Budget history and trends

### 5.7 Savings Goals
- Create, edit, delete savings goals
- Track goal progress, link to accounts
- Visualize goal achievement
- Support both fixed target and percentage-of-income goals

### 5.8 Reports & Analytics
- Income/expense breakdowns, trends, and summaries
- Budget and goal progress over time
- Export reports (CSV/PDF)

### 5.9 Notifications
- Receive notifications for budget limits, goal milestones, reminders (via backend/core)

### 5.10 PWA Features
- Offline support: view and add transactions offline, sync when online
- Installable on mobile and desktop
- Push notifications (via backend)

### 5.11 Security & Compliance
- JWT authentication for all API calls
- Secure storage of tokens (httpOnly if possible, otherwise secure local storage)
- Input validation and error handling
- Accessibility (WCAG 2.1 AA)

### 5.12 Internationalization
- All UI supports i18n/localization

## 6. Non-Functional Requirements
- Fast, responsive, and reliable UI
- Modern, maintainable codebase (React, TypeScript preferred)
- Well-documented for future contributors

## 7. Deliverables
- Production-ready PWA codebase
- Documentation (README, API usage, extensibility)
- Example usage and integration guides
