# Frontend Development Prompt for Personal Finance App

## Project Overview
I need you to help me build a React-based Progressive Web App (PWA) for personal finance management. This application will be the frontend interface that connects to a WordPress backend with custom API endpoints.

## Technical Requirements

### Core Technologies
- React.js for the main framework
- React Router for navigation
- Context API or Redux for state management
- Service workers for PWA capabilities
- JWT authentication for WordPress API
- Chart.js or similar for data visualization
- Tailwind CSS for styling

### PWA Requirements
- Installable on mobile devices
- Offline capability for core functions
- Push notifications for alerts and reminders
- Responsive design optimized for mobile-first

## App Structure and Features

### 1. User Authentication
- Login and registration forms
- Password reset functionality
- Protected routes for authenticated users
- JWT token management (storage, refresh, expiry)

### 2. Dashboard
- Financial overview with total balance
- Recent transactions list
- Budget status summary
- Savings goals progress
- Account balances summary

### 3. Accounts Management
- List of financial accounts with balances
- Add/edit/delete account functionality
- Account transaction history
- Account balance trends

### 4. Transactions
- Transaction entry form with category selection
- Transaction listing with filters and search
- Edit/delete transaction capability
- Batch transaction operations

### 5. Budget Planning
- Monthly budget setup by category
- Visual representation of budget vs. actual spending
- Budget progress indicators
- Budget history and trends

### 6. Savings Goals
- Goal creation with target amount and date
- Progress tracking visualization
- Contribution tracking
- Goal completion celebration

### 7. Reports & Analytics
- Income vs. expenses charts
- Spending by category visualization
- Monthly trends analysis
- Net worth tracking

### 8. Settings & Preferences
- User profile management
- App preferences (currency, date format)
- Notification settings
- Data management options

## API Integration

The app will connect to a WordPress backend with custom REST API endpoints for all data operations. Key API integration points include:

- Authentication (login, register, token refresh)
- Accounts (CRUD operations)
- Transactions (CRUD operations with filtering)
- Categories (CRUD operations)
- Budgets (CRUD operations)
- Goals (CRUD operations)
- Reports (data retrieval for visualizations)

For development purposes, you can initially build with mock data, but the app should be structured to easily switch to the real API endpoints.

## UI/UX Requirements

- Clean, modern interface with focus on financial data clarity
- Mobile-first design with full desktop compatibility
- Consistent color coding for financial indicators (positive/negative)
- Quick access to add transactions from anywhere in the app
- Intuitive navigation between main sections
- Accessibility compliance
- Loading states and error handling for all data operations

## Offline Functionality

- Cache critical components and assets
- Store recent transactions and account data for offline viewing
- Queue new transactions when offline for sync when connection returns
- Clear offline status indicators

## Code Quality Expectations

- Well-structured component hierarchy
- Clean separation of concerns
- Consistent code style and documentation
- Error handling for all API operations
- Performance optimization for mobile devices
- Unit tests for critical functionality

## Initial Development Phase

For the first phase, please create:

1. Project structure setup with necessary dependencies
2. Authentication system implementation
3. Main navigation and routing structure
4. Dashboard screen with placeholder components
5. Simple account and transaction management screens
6. Service worker configuration for basic PWA functionality

Please provide code in modular, reusable components that can be expanded upon in future phases.

## Development Process

Please explain your approach and outline the structure before diving into the code. For each major component, provide:

1. Component hierarchy
2. State management strategy
3. API integration points
4. Key functionality implementation details

## Additional Requirements

- The app should be able to start with demo data if no backend is available
- All forms should include validation before submission
- All API errors should be handled gracefully with user feedback
- The design should scale from small mobile devices to desktop screens
- The app should remain usable even on slower networks
