# Therapy & Booking Plugin Specification

## Purpose
Provides all features for therapy sessions, therapist directory, and session booking.

## Responsibilities
- Therapist management (directory, profiles, specialties)
- Session booking and calendar management
- Booking CRUD API endpoints
- Therapist and client dashboards
- Integration with core plugin for user/profile context

## API Endpoints (examples)
- `GET /api/v1/therapists`
- `POST /api/v1/therapy-sessions/book`
- `GET /api/v1/therapy-sessions`
- `PUT /api/v1/therapy-sessions/{id}`

## Data Model
- See `../shared-guidelines.md` for table relationships.
- Custom tables: `therapists`, `therapy_sessions`, `bookings`

## Dependencies
- Requires core plugin

## Future Extensions
- Payments, video calls, reminders, etc.
