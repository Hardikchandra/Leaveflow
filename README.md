# LeaveFlow — Simple, Practical Leave Management

LeaveFlow is a minimal, interview-ready leave management system. It helps teams apply for leave, track balances, and approve requests quickly with a clean, role-based workflow.

## Why this exists
- Problem: Teams need a lightweight way to request and approve leave without complexity.
- Solution: LeaveFlow lets Employees apply, HR review, and Managers finalize approvals — with sensible defaults like auto-approving valid paid leave.

## How it works (quick overview)
- Employees submit leave requests (Paid, Medical, Emergency, Unpaid) with dates and a reason.
- System calculates days automatically (inclusive of start/end).
- If it’s Paid leave and applied at least 1 day before 5 PM, it’s auto-approved (balance deducted immediately).
- Otherwise, HR reviews first. Approved requests go to Manager for final approval.
- Leave balances update on approval. Calendar and logs show status and who’s on leave today.

## Live roles and demo accounts
Use these to explore the app end-to-end:
- Manager: manager@leaveflow.com / 123456
- HR: hr@leaveflow.com / 123456
- Employee: hardik@leaveflow.com / 123456

## Features (full breakdown)
- Role-based dashboards: Manager, HR, Employee — tailored actions per role.
- Leave types: Paid, Medical (with certificate URL), Emergency (requires message), Unpaid.
- Auto-approval: Paid leave auto-approves when applied ≥1 day before 5 PM and balance is sufficient.
- Two-step approvals: HR → Manager workflow for non-auto-approved requests.
- Balance tracking: Total, used, remaining — updated when leave is approved.
- Calendar view: Multi-month UI to visualize upcoming leave.
- Activity log: Last 5 approvals/rejections for HR visibility.
- On-leave today: Quick list of colleagues currently on approved leave.

## Architecture
- Frontend (React): Pages for login and dashboards; components for forms, tables, calendar; services for API calls.
- Backend (Express): Routes for auth, users, and leaves; controllers handle validation and business rules.
- Database (SQLite): Simple tables for `users`, `leave_balances`, and `leaves`.

Data flow:
1. Frontend submits via `fetch/axios` to Express routes.
2. Controllers validate input, enforce rules (auto-approval, balance checks).
3. SQLite stores everything; queries keep dashboards updated.

## Setup & Run Locally

Backend (API):
```bash
cd backend
npm install
npm run seed   # seeds demo users and balances
npm start      # defaults to http://localhost:5001
```

Frontend (React):
```bash
cd frontend
npm install
npm start      # runs on http://localhost:3000
```

Ports used:
- Backend: 5001 (auto-fallback to 5002 if busy)
- Frontend: 3000

## Core business logic (key rules)
- Day counting: Days are inclusive of start and end date.
- Auto-approve (Paid):
    - Must be applied ≥1 day before 5 PM of the start date.
    - Remaining paid leave must cover the request.
    - If both true: status, HR, and Manager all set to APPROVED; balance deducted immediately.
- Medical: Certificate URL recommended; goes through HR.
- Emergency: Requires approval message; goes through HR.
- Unpaid: Goes through HR → Manager like other non-auto-approved requests.

## Important files
- Backend
    - `backend/server.js`: Express setup, routes, static serving (production).
    - `backend/controllers/leaveController.js`: All leave logic (auto-approval, status updates, logs).
    - `backend/db/seedUsers.js` and `seedLeaveBalances.js`: Demo data.
- Frontend
    - `frontend/src/pages/*`: Dashboards by role.
    - `frontend/src/components/*`: Leave form, calendar, history, approval lists.
    - `frontend/src/services/*`: API clients for auth, users, leaves.

## Troubleshooting
- “Port in use” on backend: Run `pkill -f "node.*server"` then `npm start` in `backend`.
- Frontend fails “missing index.html”: Ensure `frontend/public/index.html` exists (this repo includes it).
- Seed not visible: Re-run `npm run seed` in `backend` and restart the server.

## Project Structure
```
backend/
├── controllers/    # API logic
├── db/             # SQLite and seed scripts
├── routes/         # Express routes
└── server.js       # Express bootstrap

frontend/
├── public/         # index.html
└── src/
        ├── components/ # Reusable UI pieces
        ├── pages/      # Role dashboards and login
        ├── services/   # API calls
        └── assets/     # Styles, icons
```

## Coding conventions (quick)
- Components: PascalCase (`LeaveForm.js`)
- Functions/vars: camelCase (`handleSubmit`)
- Keep comments practical and close to logic.

## License
MIT
