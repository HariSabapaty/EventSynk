# EventSynk Frontend

## Setup & Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
   or (if using create-react-app):
   ```bash
   npm start
   ```

## Features
- React 18 functional components & hooks
- React Router v6 for navigation
- Axios for backend API calls (JWT auto-attached)
- AuthContext for authentication state
- Protected routes for event management
- Client-side validation helpers
- Responsive UI with simple CSS

## Main Routes
- `/` — Home (event list)
- `/login` — Login
- `/register` — Register
- `/events/:id` — Event details & registration
- `/create` — Create event (protected)
- `/my-events` — My events (protected)
- `/my-registrations` — My registrations (protected)

---

See backend README for API details and environment setup.