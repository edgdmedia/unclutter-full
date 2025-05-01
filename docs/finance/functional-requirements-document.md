# Personal Finance App - Functional Requirements Document (FRD)

## 1. System Overview

### 1.1 System Description
The Personal Finance App is a progressive web application (PWA) with a WordPress backend that enables users to track their financial activities, create budgets, manage accounts, and set savings goals.

### 1.2 System Architecture
- **Frontend**: React-based PWA with offline capabilities
- **Backend**: WordPress with custom database tables (all with `unclutter_` prefix) and REST API
- **Authentication**: JWT-based authentication system via Unclutter Core Plugin
- **User Context**: All finance tables (accounts, categories, transactions, budgets, goals) reference `profile_id` from core plugin
- All taxonomies (account types, income categories, expense categories, tags, etc.) are managed in a single unified categories table (e.g., `unclutter_finance_categories`) with a `type` column to distinguish usage (e.g., `account_type`, `income`, `expense`, `tag`).
- Notifications/Emails: Via core plugin
- Permissions/Rate Limiting: Via core plugin
- Audit Logging: Via core plugin
- Internationalization: All user-facing content supports i18n as per core plugin

## 2. Functional Requirements

### 2.1 User Management

#### 2.1.1 User Registration (FR-UM-01)
- System shall provide a user registration form
- Required fields: username, email, password
- System shall validate email uniqueness
- System shall enforce password strength requirements
- System shall send verification email
- System shall create user profile upon successful registration

#### 2.1.2 User Authentication (FR-UM-02)
- System shall provide login functionality using email and password
- System shall issue JWT tokens upon successful authentication
- System shall support password reset functionality
- System shall implement token refresh mechanism
- System shall enforce session timeout after 30 minutes of inactivity

#### 2.1.3 User Profile Management (FR-UM-03)
- System shall allow users to view and edit their profile information
- Editable fields: display name, email, password, notification preferences
- System shall validate changes before saving
- System shall confirm successful updates

### 2.2 Account Management

#### 2.2.1 Financial Account Creation (FR-AM-01)
- System shall allow users to add financial accounts
- Required fields: account name, account type, initial balance
- Optional fields: description, institution name
- System shall validate input data before saving
- System shall support various account types: checking, savings, credit card, cash, investment

#### 2.2.2 Account Modification (FR-AM-02)
- System shall allow users to edit account details
- Editable fields: account name, type, description
- System shall track balance changes through transactions
- System shall allow account deactivation (hiding)
- System shall prevent permanent deletion of accounts with transactions

#### 2.2.3 Account Dashboard (FR-AM-03)
- System shall display summary of all accounts
- Information to display: account name, current balance, account type
- System shall calculate and display total assets (positive accounts)
- System shall calculate and display total liabilities (negative accounts)
- System shall display net worth (assets minus liabilities)

### 2.3 Transaction Management

#### 2.3.1 Transaction Creation (FR-TM-01)
- System shall provide transaction entry form
- Required fields: date, amount, transaction type (income/expense), category, account
- Optional fields: description, notes, tags
- System shall validate input data before saving
- System shall update account balance upon transaction creation
- System shall support future-dated transactions

#### 2.3.2 Transaction Modification (FR-TM-02)
- System shall allow editing existing transactions
- System shall recalculate account balances when transaction amounts change
- System shall allow transaction deletion with confirmation
- System shall adjust affected account balances on deletion

#### 2.3.3 Transaction Categorization (FR-TM-03)
- System shall provide default transaction categories
- System shall allow users to create custom categories
- System shall allow category assignment for each transaction
- System shall support category hierarchy (parent/child relationships)
- System shall allow editing and merging of categories

#### 2.3.4 Transaction Listing and Search (FR-TM-04)
- System shall display paginated list of transactions
- System shall provide filtering by: date range, account, category, amount range
- System shall provide search functionality for transaction descriptions
- System shall allow sorting by date, amount, description
- System shall support exporting filtered transactions list

### 2.4 Budget Management

#### 2.4.1 Budget Creation (FR-BM-01)
- System shall allow users to create monthly budgets
- System shall support budget creation by expense category
- System shall allow setting target amounts for each category
- System shall enable copying previous month's budget
- System shall validate budget entries before saving

#### 2.4.2 Budget Tracking (FR-BM-02)
- System shall automatically track actual spending against budget
- System shall calculate and display remaining budget amounts
- System shall provide visual indicators for budget status
- System shall update budget tracking in real-time when transactions are added

#### 2.4.3 Budget Analysis (FR-BM-03)
- System shall display monthly budget overview
- System shall provide category-wise comparison of planned vs. actual spending
- System shall calculate percentage of budget used
- System shall identify categories exceeding budget
- System shall display historical budget adherence

### 2.5 Savings Goals

#### 2.5.1 Goal Creation (FR-SG-01)
- System shall allow users to create savings goals
- Required fields: goal name, target amount, target date
- Optional fields: description, associated account, initial contribution
- System shall validate inputs before saving
- System shall calculate required monthly contribution to reach goal

#### 2.5.2 Goal Tracking (FR-SG-02)
- System shall track progress toward savings goals
- System shall display current amount saved and percentage complete
- System shall allow manual updates to goal progress
- System shall support linking transactions to goals
- System shall provide time-based progress indicators

#### 2.5.3 Goal Management (FR-SG-03)
- System shall allow editing goal details
- System shall support goal completion confirmation
- System shall allow archiving completed goals
- System shall provide goal history view

### 2.6 Dashboard and Reporting

#### 2.6.1 Main Dashboard (FR-DR-01)
- System shall display financial overview dashboard
- Dashboard shall include: account balances, monthly spending, budget status, goal progress
- System shall automatically refresh dashboard data
- System shall allow customization of dashboard widgets

#### 2.6.2 Financial Reports (FR-DR-02)
- System shall generate income vs. expenses reports
- System shall provide spending by category reports
- System shall display historical trends of net worth
- System shall support custom date ranges for reports
- System shall generate monthly and annual summaries

#### 2.6.3 Data Visualization (FR-DR-03)
- System shall display pie charts for category distribution
- System shall display bar charts for monthly comparisons
- System shall provide line graphs for balance trends
- System shall ensure visualizations are responsive and mobile-friendly

### 2.7 PWA Features

#### 2.7.1 Offline Functionality (FR-PW-01)
- System shall cache critical data for offline access
- System shall allow transaction entry while offline
- System shall synchronize data when connection is restored
- System shall indicate offline status to user

#### 2.7.2 Notifications (FR-PW-02)
- System shall support push notifications for budget alerts
- System shall notify users when approaching budget limits
- System shall allow users to configure notification preferences
- System shall support browser notifications on desktop

#### 2.7.3 Installation and Updates (FR-PW-03)
- System shall be installable on supported devices
- System shall handle version updates gracefully
- System shall notify users of new features after updates

## 3. Database Requirements

### 3.1 Database Tables

#### 3.1.1 Users Table
- (Removed: all user data handled by core plugin, reference by `profile_id` only)

#### 3.1.2 Accounts Table
- id (PK)
- profile_id (FK, from core plugin)
- name
- type
- balance
- initial_balance
- description
- institution
- is_active
- created_at    
- updated_at

#### 3.1.3 Categories Table
- id (PK)
- profile_id (FK, from core plugin)
- name
- type (income/expense)
- parent_id
- description
- is_active
- created_at
- updated_at

#### 3.1.4 Transactions Table
- id (PK)
- profile_id (FK, from core plugin)
- account_id (FK)
- category_id (FK)
- amount
- transaction_date
- description
- notes
- type (income/expense)
- created_at
- updated_at

#### 3.1.5 Budgets Table
- id (PK)
- profile_id (FK, from core plugin)
- category_id (FK)
- amount
- month
- year
- notes
- created_at
- updated_at

#### 3.1.6 Goals Table
- id (PK)
- profile_id (FK, from core plugin)
- name
- target_amount
- current_amount
- start_date
- target_date
- description
- account_id (FK, optional)
- status
- created_at
- updated_at

### 3.2 Data Relationships
- One user can have multiple accounts, categories, transactions, budgets, and goals
- Each transaction is associated with one account and one category
- Each budget item is associated with one category
- Goals may optionally be associated with specific accounts

## 4. Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Responsive Design
- System shall adapt to various screen sizes (mobile, tablet, desktop)
- System shall ensure all functionality is accessible on mobile devices
- System shall optimize touch interactions for mobile users

#### 4.1.2 Navigation
- System shall provide intuitive navigation between main sections
- System shall include bottom navigation bar on mobile
- System shall support breadcrumb navigation for deeper pages
- System shall provide quick access to add transactions

#### 4.1.3 Accessibility
- System shall comply with WCAG 2.1 Level AA guidelines
- System shall support screen readers
- System shall maintain appropriate contrast ratios

### 4.2 API Interfaces

#### 4.2.1 API Authentication
- API shall require valid JWT token for all secured endpoints (via core plugin)
- API shall validate user permissions for requested resources (via core plugin roles/permissions)
- API shall return appropriate HTTP status codes for authentication errors
- API shall use core plugin for rate limiting and audit logging
- API shall use core plugin for notification/email triggers (e.g., budget alerts)
- API shall support internationalization for all user-facing content

#### 4.2.2 API Endpoints
- API shall support RESTful CRUD operations for all resources
- API shall implement appropriate pagination for list endpoints
- API shall support filtering and searching where appropriate
- API shall follow consistent request/response format

## 5. Non-Functional Requirements

### 5.1 Performance Requirements
- Page load time shall not exceed 3 seconds on typical connections
- API response time shall be under 500ms for 95% of requests
- System shall handle at least 100 concurrent users
- Database queries shall be optimized for performance

### 5.2 Security Requirements
- All passwords shall be stored using secure hashing algorithms
- System shall implement CSRF protection
- System shall set appropriate security headers
- System shall sanitize all user inputs
- System shall implement rate limiting for authentication attempts

### 5.3 Reliability Requirements
- System shall have 99.5% uptime
- System shall perform daily database backups
- System shall maintain data integrity across all transactions
- System shall gracefully handle and log errors

### 5.4 Scalability Requirements
- Database design shall support efficient scaling
- System architecture shall allow for horizontal scaling
- Code shall be modular to support future extensions

## 6. Testing Requirements

### 6.1 Unit Testing
- All core business logic shall have unit tests
- API endpoints shall have integration tests
- Frontend components shall have component tests

### 6.2 User Acceptance Testing
- System shall be tested against all functional requirements
- System shall be tested on multiple devices and browsers
- System shall undergo usability testing with representative users
