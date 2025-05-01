# Unclutter Finance Frontend - Detailed Specification

## Design System & UI Components

The Unclutter Finance frontend will follow a clean, modern design language with:

- **Color Palette**: Primary (Unclutter brand yellow), Secondary (dark blue), Neutral (grays)
- **Typography**: Sans-serif (e.g., Inter, Roboto), with clear hierarchy
- **Components**: Cards, buttons, forms, charts, tables, modals, alerts
- **Responsive**: Mobile-first, with breakpoints for tablet and desktop

## Page Structure & Navigation

### Global Navigation
- **Mobile**: Bottom navigation bar with 5 icons: Dashboard, Accounts, Transactions, Budgets, More
- **Desktop**: Left sidebar with same items plus Goals and Settings
- **Header**: App logo, profile menu dropdown, notifications bell

## Page Specifications

### 1. Authentication Pages

#### 1.1 Login Page
- **Sections**:
  - Logo/branding
  - Login form (email, password)
  - "Remember me" checkbox
  - "Forgot password" link
  - "Register" link
- **Buttons**:
  - Primary: "Log In"
- **API Consumption**:
  - `POST /api/v1/auth/login` (email, password)
  - Store JWT token in secure storage
  - Redirect to Dashboard on success

#### 1.2 Registration Page
- **Sections**:
  - Logo/branding
  - Registration form (email, password, confirm password, first name, last name)
  - Terms acceptance checkbox
- **Buttons**:
  - Primary: "Register"
  - Secondary: "Back to Login"
- **API Consumption**:
  - `POST /api/v1/auth/register` (email, password, first_name, last_name)
  - Redirect to Email Verification page

#### 1.3 Email Verification Page
- **Sections**:
  - Verification code input
  - Instructions text
  - Countdown timer for resend
- **Buttons**:
  - Primary: "Verify"
  - Text link: "Resend Code"
- **API Consumption**:
  - `POST /api/v1/auth/verify-email` (email, code)
  - `POST /api/v1/auth/resend-verification` (email)

#### 1.4 Forgot Password Page
- **Sections**:
  - Email input form
  - Instructions text
- **Buttons**:
  - Primary: "Send Reset Link"
  - Secondary: "Back to Login"
- **API Consumption**:
  - `POST /api/v1/auth/forgot-password` (email)

#### 1.5 Reset Password Page
- **Sections**:
  - New password input
  - Confirm password input
  - Password strength indicator
- **Buttons**:
  - Primary: "Reset Password"
- **API Consumption**:
  - `POST /api/v1/auth/reset-password` (profile_id, token, new_password)

### 2. Dashboard Page

#### 2.1 Overview Section
- **Sections**:
  - Welcome message with user's name
  - Date range selector (This month, Last month, Custom)
  - Quick stats cards: Total Balance, Income, Expenses, Savings
- **Buttons**:
  - Icon buttons for date range selection
  - "View All" links for each section
- **API Consumption**:
  - `GET /api/v1/finance/dashboard/summary` (date_range)

#### 2.2 Accounts Summary Section
- **Sections**:
  - Horizontal scrollable cards for each account type
  - Each card shows: Account name, balance, icon
- **Buttons**:
  - "+ Add Account" button
  - "View All" link
- **API Consumption**:
  - `GET /api/v1/finance/accounts` (limit=5)

#### 2.3 Budget Status Section
- **Sections**:
  - Progress bars for top 3-5 budget categories
  - Each shows: Category name, spent/total, percentage, visual indicator
- **Buttons**:
  - "View All Budgets" link
- **API Consumption**:
  - `GET /api/v1/finance/budgets/status` (month, year, limit=5)

#### 2.4 Recent Transactions Section
- **Sections**:
  - List of 5 most recent transactions
  - Each shows: Date, category icon, description, amount (colored by type)
- **Buttons**:
  - "View All" link
  - "+ Add Transaction" button
- **API Consumption**:
  - `GET /api/v1/finance/transactions` (limit=5, sort=date_desc)

#### 2.5 Savings Goals Section
- **Sections**:
  - Horizontal scrollable cards for active goals
  - Each shows: Goal name, progress bar, amount saved/target, target date
- **Buttons**:
  - "+ Add Goal" button
  - "View All" link
- **API Consumption**:
  - `GET /api/v1/finance/goals` (status=active, limit=3)

#### 2.6 Income vs. Expenses Chart
- **Sections**:
  - Bar or line chart showing income vs. expenses over time
  - Legend and tooltip on hover
- **Buttons**:
  - Time period selector (Week, Month, Year)
- **API Consumption**:
  - `GET /api/v1/finance/reports/income-expenses` (period, start_date, end_date)

### 3. Accounts Page

#### 3.1 Accounts List Section
- **Sections**:
  - Filterable list of accounts grouped by type
  - Each shows: Name, institution, balance, last updated
  - Total balance summary at top
- **Buttons**:
  - "+ Add Account" button
  - Filter/sort options
  - Edit/delete buttons for each account
- **API Consumption**:
  - `GET /api/v1/finance/accounts` (with filters)
  - `DELETE /api/v1/finance/accounts/{id}` (for delete)

#### 3.2 Add/Edit Account Modal
- **Sections**:
  - Form fields: Name, type (dropdown from taxonomy), institution, initial balance, notes
  - Type selection affects available fields
- **Buttons**:
  - Primary: "Save Account"
  - Secondary: "Cancel"
- **API Consumption**:
  - `POST /api/v1/finance/accounts` (for new)
  - `PUT /api/v1/finance/accounts/{id}` (for edit)
  - `GET /api/v1/finance/categories` (type=account_type) for dropdown

#### 3.3 Account Detail Page
- **Sections**:
  - Account summary card (name, type, balance, institution)
  - Balance history chart
  - Recent transactions list specific to this account
- **Buttons**:
  - "Edit Account" button
  - "+ Add Transaction" button
  - "Export Transactions" button
- **API Consumption**:
  - `GET /api/v1/finance/accounts/{id}`
  - `GET /api/v1/finance/accounts/{id}/transactions` (with pagination)
  - `GET /api/v1/finance/accounts/{id}/balance-history` (for chart)

### 4. Transactions Page

#### 4.1 Transactions List Section
- **Sections**:
  - Filterable, sortable transaction list
  - Each shows: Date, category, description, account, amount
  - Grouped by date or category (user selectable)
- **Buttons**:
  - "+ Add Transaction" button
  - Filter options (date range, category, account, amount range)
  - Sort options (date, amount, category)
  - Export button
- **API Consumption**:
  - `GET /api/v1/finance/transactions` (with filters, pagination)
  - `DELETE /api/v1/finance/transactions/{id}` (for delete)

#### 4.2 Add/Edit Transaction Modal
- **Sections**:
  - Form fields: Type (income/expense/transfer), date, amount, category (from taxonomy), account, description, notes, receipt upload
  - Different fields based on transaction type
- **Buttons**:
  - Primary: "Save Transaction"
  - Secondary: "Cancel"
  - "Upload Receipt" button
- **API Consumption**:
  - `POST /api/v1/finance/transactions` (for new)
  - `PUT /api/v1/finance/transactions/{id}` (for edit)
  - `GET /api/v1/finance/categories` (type=income/expense) for dropdown
  - `GET /api/v1/finance/accounts` for account dropdown

#### 4.3 Transaction Detail Modal
- **Sections**:
  - All transaction details
  - Receipt image if attached
  - Related budget impact
- **Buttons**:
  - "Edit" button
  - "Delete" button
  - "Close" button
- **API Consumption**:
  - `GET /api/v1/finance/transactions/{id}`

### 5. Categories Page

#### 5.1 Categories Management Section
- **Sections**:
  - Tabs for different category types (Income, Expense, Account Types, Tags)
  - Hierarchical list with parent/child relationships
  - Each shows: Name, description, usage count
- **Buttons**:
  - "+ Add Category" button
  - Edit/delete buttons for each category
- **API Consumption**:
  - `GET /api/v1/finance/categories` (with type filter)
  - `DELETE /api/v1/finance/categories/{id}` (for delete)

#### 5.2 Add/Edit Category Modal
- **Sections**:
  - Form fields: Name, type (dropdown), parent category (optional), description
- **Buttons**:
  - Primary: "Save Category"
  - Secondary: "Cancel"
- **API Consumption**:
  - `POST /api/v1/finance/categories` (for new)
  - `PUT /api/v1/finance/categories/{id}` (for edit)

### 6. Budgets Page

#### 6.1 Budget Overview Section
- **Sections**:
  - Month/year selector
  - Progress summary: Total budget, spent, remaining
  - Circular progress chart
- **Buttons**:
  - Month navigation buttons
  - "+ Create Budget" button
- **API Consumption**:
  - `GET /api/v1/finance/budgets/summary` (month, year)

#### 6.2 Budget Categories Section
- **Sections**:
  - List of budget categories with progress bars
  - Each shows: Category name, spent/budgeted, percentage, visual indicator
  - Sorted by percentage spent (highest first)
- **Buttons**:
  - Edit button for each category
- **API Consumption**:
  - `GET /api/v1/finance/budgets` (month, year)

#### 6.3 Add/Edit Budget Modal
- **Sections**:
  - Form fields: Month/year, category (from taxonomy), amount
  - Option to copy from previous month
- **Buttons**:
  - Primary: "Save Budget"
  - Secondary: "Cancel"
  - "Copy Last Month" button
- **API Consumption**:
  - `POST /api/v1/finance/budgets` (for new)
  - `PUT /api/v1/finance/budgets/{id}` (for edit)
  - `GET /api/v1/finance/categories` (type=expense) for dropdown

### 7. Savings Goals Page

#### 7.1 Goals List Section
- **Sections**:
  - Tabs for Active/Completed goals
  - Cards for each goal
  - Each shows: Name, target amount, current amount, progress bar, target date, days remaining
- **Buttons**:
  - "+ Add Goal" button
  - Edit/delete buttons for each goal
- **API Consumption**:
  - `GET /api/v1/finance/goals` (with status filter)
  - `DELETE /api/v1/finance/goals/{id}` (for delete)

#### 7.2 Add/Edit Goal Modal
- **Sections**:
  - Form fields: Name, target amount, start date, target date, linked account (optional), description, goal type (fixed/percentage)
  - If percentage type: income percentage, qualifying income categories
- **Buttons**:
  - Primary: "Save Goal"
  - Secondary: "Cancel"
- **API Consumption**:
  - `POST /api/v1/finance/goals` (for new)
  - `PUT /api/v1/finance/goals/{id}` (for edit)
  - `GET /api/v1/finance/accounts` for account dropdown
  - `GET /api/v1/finance/categories` (type=income) for income categories

#### 7.3 Goal Detail Page
- **Sections**:
  - Goal summary card
  - Progress chart over time
  - Related transactions list (contributions to goal)
- **Buttons**:
  - "Edit Goal" button
  - "Add Contribution" button (shortcut to add transaction linked to goal)
- **API Consumption**:
  - `GET /api/v1/finance/goals/{id}`
  - `GET /api/v1/finance/goals/{id}/progress-history`
  - `GET /api/v1/finance/goals/{id}/transactions`

### 8. Reports Page

#### 8.1 Reports Selection Section
- **Sections**:
  - Cards for different report types: Income/Expense, Category Breakdown, Net Worth, Budget Performance, Savings Rate
- **Buttons**:
  - Select button for each report type
- **API Consumption**: None (client-side navigation)

#### 8.2 Report Configuration Section
- **Sections**:
  - Date range selector
  - Report-specific filters
  - Chart type selector (where applicable)
- **Buttons**:
  - "Generate Report" button
  - "Export" button (CSV/PDF)
- **API Consumption**:
  - Depends on report type, generally: `GET /api/v1/finance/reports/{report-type}` with parameters

#### 8.3 Report Results Section
- **Sections**:
  - Visual chart/graph
  - Data table with details
  - Summary statistics
- **Buttons**:
  - "Save Report" button (for favorites)
  - "Print" button
- **API Consumption**:
  - `POST /api/v1/finance/reports/favorites` (to save)

### 9. Settings Page

#### 9.1 Profile Settings Section
- **Sections**:
  - User profile information
  - Password change form
  - Email preferences
- **Buttons**:
  - "Save Changes" button
- **API Consumption**:
  - `PUT /api/v1/auth/profile` (for profile updates)
  - `POST /api/v1/auth/change-password` (for password)

#### 9.2 Finance Settings Section
- **Sections**:
  - Default currency
  - Default account
  - Start of month (for budgeting)
  - Default categories
- **Buttons**:
  - "Save Preferences" button
- **API Consumption**:
  - `PUT /api/v1/finance/settings` (for finance preferences)

#### 9.3 Notifications Settings Section
- **Sections**:
  - Budget alerts toggles and thresholds
  - Goal milestone notifications
  - Weekly/monthly report emails
- **Buttons**:
  - "Save Notification Settings" button
- **API Consumption**:
  - `PUT /api/v1/finance/notifications/settings`

## Offline Functionality

### Offline-Enabled Features
- **View**: Dashboard summary, recent transactions, account list, budgets
- **Add**: New transactions (synced when online)
- **Edit**: Existing cached transactions

### Offline Indicators
- Connection status indicator in header
- "Offline mode" banner when working offline
- Sync status indicators for queued changes

### API Consumption for Offline
- Service worker to cache critical API responses
- IndexedDB for storing offline transactions
- Background sync when connection is restored

## Error Handling & Feedback

### Error States
- Form validation errors (inline)
- API errors (toast notifications)
- Connection errors (offline mode activation)
- Authentication errors (redirect to login)

### Loading States
- Skeleton loaders for lists and cards
- Progress indicators for forms and uploads
- Pull-to-refresh on mobile

## Responsive Behavior

### Mobile (< 768px)
- Single column layout
- Bottom navigation
- Collapsible sections
- Modal dialogs for forms

### Tablet (768px - 1024px)
- Two column layout where appropriate
- Side navigation (collapsible)
- Expanded charts and tables

### Desktop (> 1024px)
- Multi-column dashboard
- Persistent side navigation
- Advanced filtering and reporting options
- Keyboard shortcuts

## Accessibility Considerations

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Sufficient color contrast
- Focus indicators
- Alt text for all images and charts
