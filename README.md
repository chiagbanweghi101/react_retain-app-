# Retain

Retain is a personal expense and monthly budget app. The frontend is React, TypeScript, and Vite. The API is Express, and the data lives in MongoDB.

Live app: https://retain-web-in3w.onrender.com

## Accounts

Sign-up always creates a normal user. The admin account is seeded.

| Role | Email | Password |
| --- | --- | --- |
| User | demo@retain.app | Demo123! |
| Admin | admin@retain.app | Admin123! |
| User | emmanuel@example.com | User123! |
| User | moses@example.com | User123! |
| User | perlin@example.com | User123! |
| User | chiagoziem@example.com | User123! |
| User | peter@example.com | User123! |

The demo user already has expenses across three months: this month is approaching the budget, last month is over budget, and two months ago is within budget.

## Database

The API reads `MONGODB_URI` from `server/.env`. The database name is `retain`. In Atlas or Compass, open that database to see the `users`, `expenses`, `budgets`, `categories`, and `paymentMethods` collections.

## Run it locally

Use Node.js 22.5 or newer.

```powershell
npm install
npm run install:all
npm run dev
```

- App: http://localhost:5173
- API: http://localhost:4000

The API seeds the demo accounts the first time the `retain` database is empty. To wipe and seed again, stop the API, then run `npm run seed`.

## What a signed-in user can do

- Create, view, update, and delete their own expenses. Each expense has a title, amount (NGN), category, date, payment method, and optional notes.
- Search by title or notes, filter by category, payment method, and date, and sort by date or amount. That state is in Redux. The list is paginated.
- Set or update a budget for a selected month and see the total spent, the amount left, and a status of within, approaching, or over.
- Open a dashboard for a selected month: total spent, remaining budget, highest expense, spending by category, and recent expenses.

Payment method is a label (cash, card, mobile money, or bank transfer). The app does not take payments.

## What an admin can do

- Create, rename, and delete categories.
- Deleting a category moves its expenses to **Uncategorized**. That default category cannot be renamed or deleted.
- View platform insights: registered users, expense count, total value, expenses recorded this month, spending per category, the 5 most-used categories, the 5 least-used categories, recently added expenses, and recently registered users.

A normal user cannot open admin pages or another person's expenses and budgets.

## Where the required state lives

- Authentication, roles, and protected routes: `client/src/context/AuthProvider.tsx`, `client/src/components/ProtectedRoute.tsx`, and `client/src/components/AdminRoute.tsx`.
- Search, filters, sort, and expense pagination: `client/src/store/filtersSlice.ts`.

## API

| Method | Path | Who |
| --- | --- | --- |
| POST | /api/auth/signup | Public. Always creates a user. |
| POST | /api/auth/signin | Public |
| GET | /api/auth/me | Signed in |
| GET | /api/expenses | Signed in. Own rows. Query: search, categoryId, paymentMethodId, dateFrom, dateTo, sortBy, sortOrder, page, pageSize |
| POST, GET, PUT, DELETE | /api/expenses/:id | Signed in. Own rows only. |
| GET, PUT | /api/budgets | Signed in. Own month. |
| GET | /api/dashboard?year=&month= | Signed in |
| GET | /api/categories | Signed in |
| GET | /api/payment-methods | Signed in |
| GET, POST | /api/admin/categories | Admin |
| PUT, DELETE | /api/admin/categories/:id | Admin |
| GET | /api/admin/insights | Admin |

Send the token as `Authorization: Bearer <token>`.

## Deploy

Build the client with `VITE_API_URL` set to the public API origin, and publish the `client/dist` folder. Run the API with `npm start` inside `server`. Set `JWT_SECRET`, `CORS_ORIGIN`, `MONGODB_URI`, and `MONGODB_DB` on the host. Use a hosted MongoDB database so the data survives a restart.
