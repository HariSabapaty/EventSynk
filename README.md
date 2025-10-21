# EventSynk

## Architecture Overview

- **Frontend:** React (pages: Login, Register, Home, EventDetails, CreateEvent, MyEvents, MyRegistrations)
  - Components: Navbar, EventCard, ToastNotification
  - AuthContext manages user and JWT
  - React Router for navigation
  - Axios for API calls (JWT in Authorization header)
- **Backend:** Flask REST API
  - SQLAlchemy ORM (MySQL)
  - Blueprints for auth and events
  - JWT authentication, bcrypt password hashing
  - Input validation and error handling
- **Database:** MySQL
  - User, Event, Registration, RegistrationField, RegistrationFieldResponse tables

## Setup Steps

### Backend
1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables in `.env` (MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, SECRET_KEY)
3. Create tables directly by adding this to your app startup:
   ```python
   from models import db
   db.create_all()
   ```
   Or run a one-time script to create tables.
4. Start server: `python app.py`

### Frontend
1. Install dependencies: `npm install axios react-router-dom`
2. Start React app: `npm start`

## CRUD Demo

1. **Register:** Sign up with college email and strong password.
2. **Login:** Authenticate and receive JWT.
3. **Create Event:** Organiser creates event with details and custom registration fields.
4. **Register/Cancel:** Users register for events, fill custom fields, and can cancel registration.
5. **My Events:** Organiser views, edits, deletes their events and sees participant details.
6. **My Registrations:** Users view events they've registered for.

## Validation & Error Handling
- Client-side JS validation for required fields, date logic, and password strength.
- Backend input validation for all endpoints; errors returned as `{message, status}` JSON.

## Design Patterns
- MVC (Flask Blueprints, SQLAlchemy models)
- Context (React AuthContext)
- Repository (SQLAlchemy ORM)

---

**EventSynk** streamlines college event management with secure authentication, robust validation, and a modern responsive UI.