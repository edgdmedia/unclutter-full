# AI Prompt: Build the Unclutter Therapy Plugin

## Context
You are to build the "Unclutter Therapy" plugin for WordPress, which enables organizations or solo practitioners to deliver digital therapy services. The plugin must be modular, extensible, and integrate with the Unclutter Core plugin for authentication, roles, notifications, email, subscriptions, and payments. All custom tables must use the `unclutter_` prefix after the WP prefix (e.g., `wp_unclutter_therapy_sessions`).

## Requirements

### 1. Therapist & Organization Management
- Support multi-therapist organizations and solo therapists.
- Therapist profiles: bio, credentials, specialties, photo, availability, Google Calendar integration.
- Admin/owner can manage therapists and bookings.

### 2. Booking & Calendar
- Flexible booking calendar: therapists set available slots (recurring or specific dates/times).
- Users can view and book available slots.
- Google Calendar integration (sync availability, add bookings).
- Session types: in-person, video, phone, etc.
- Time zone handling.
- Booking approval/confirmation flow (optional).

### 3. Forms & Onboarding
- Dynamic forms (pre-session, in-session, post-session; assignable to bookings).
- Admin/therapist can create, edit, and assign forms.
- Automated onboarding emails and form requests.
- Forms must be completed before session when required.

### 4. Reminders & Notifications
- Automated reminders for sessions (24h, 1h before, etc.) and incomplete forms.
- Manual reminders/messages from therapist.
- All notifications/emails handled via core plugin.

### 5. Resources
- Therapists/admins can upload/share resources (PDFs, videos, links).
- Resources can be public, or assigned to specific clients/bookings.

### 6. Session Notes & Reporting
- Therapists can record private notes and share summaries with clients.
- Reporting: session history, attendance, form completion, resource engagement.
- Exportable reports for admin/therapist.

### 7. Packages & Coupons
- Support for session packages (multi-session, monthly, etc.).
- Coupon codes and discounts for sessions and packages.

### 8. API Endpoints
- Implement all endpoints as specified in the FRD (therapists, sessions, bookings, forms, packages, coupons, resources, reporting).
- All endpoints must be versioned (`/api/v1/`) and require JWT/auth/role validation.

### 9. Data Model
- Implement all tables as specified in the FRD, using the `unclutter_` prefix.
- Ensure all relationships (therapist, client, organization, session, package, coupon, resource) are enforced.

### 10. Security & Extensibility
- All endpoints require JWT and role validation.
- Input validation and sanitization for all endpoints.
- All actions logged via the core audit system.
- Data model and APIs must be extensible for future features/integrations.

### 11. Integration
- Use the core plugin for authentication, notifications, email, roles, subscriptions, and payments.
- All user references must use `profile_id` from the core plugin.

### 12. Documentation
- Inline code comments and a README for plugin usage, API, and extensibility.

## Deliverables
- Production-ready WordPress plugin code in PHP
- Database migration/installation scripts for all tables
- REST API endpoints as described
- Example usage for feature plugins and integrations
- README.md documenting setup, API, and extensibility
