# Money Manager (MoneyFlow)

Full-stack personal finance manager for tracking income, expenses, transfers, account balances, and AI-assisted financial insights.

![Money Manager Landing](./screenshot.png)

## What This Project Is

Money Manager helps users replace manual expense tracking (notebook/spreadsheet) with a secure, real-time web app.

Core goals:
- Track money movement accurately across accounts.
- Make spending patterns visible through dashboard + summaries.
- Keep user data isolated and secure using JWT-based auth.
- Provide AI assistant insights from the logged-in user's financial data.

## Why This Project

Most people track finances inconsistently because manual tools are slow and hard to analyze. This project solves that with:
- Fast transaction entry and filtering.
- Account-level balance control and transfers.
- Automatic category summaries and trend views.
- AI assistance for natural language questions like weekly/monthly income, expense, and savings.

## Current Highlights (Updated)

- Auth system with register/login, token verification, and protected routes.
- User-specific data isolation for transactions, accounts, categories, and summaries.
- Dashboard + summary analytics endpoints.
- Account transfer flow with balance updates.
- AI finance assistant:
  - Uses authenticated user data.
  - Computes exact current week/current month metrics.
  - Returns deterministic answers for common weekly/monthly queries.
  - Limits long generic responses for factual questions.
- Floating chatbot visibility is restricted to authenticated private routes.
- Voice input removed from frontend chat UI (typing only).

## Screenshots

### Landing Page
![Landing](./screenshot.png)

### AI Assistant Widget
![AI Assistant](./screenshot.png)

### Dashboard and Insights
![Dashboard](./screenshot.png)

Note: Only one screenshot file is currently present in the repository (`screenshot.png`). Replace these with dedicated images anytime.

## Tech Stack

Frontend:
- React 19 + Vite
- React Router
- Tailwind CSS + Radix UI components
- TanStack Query
- Axios
- Framer Motion

Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication + bcryptjs
- OpenRouter SDK (AI assistant)

Deployment:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Architecture and Request Flow

1. User signs up or logs in.
2. Backend returns JWT token.
3. Frontend stores token and sends it in `Authorization: Bearer <token>`.
4. Protected backend routes validate token and attach `req.userId`.
5. Controllers query only records where `userId = req.userId`.
6. UI updates with user-specific balances, transactions, summaries, and AI replies.

### AI Assistant Flow

1. Frontend posts to `/api/chat/assistant` with typed message + recent in-memory chat history.
2. Auth middleware verifies token and sets `req.userId`.
3. Controller fetches last 120 days of that user's transactions + accounts.
4. Controller computes analytics, including exact current week/current month totals.
5. For common weekly/monthly queries, backend may return deterministic exact response directly.
6. Otherwise, backend sends a constrained prompt + metrics to OpenRouter and streams response back.

Important behavior:
- Assistant data is user-specific.
- Chat messages are currently not persisted in MongoDB.
- Chat history used for context is frontend session state only.

## Feature Breakdown

### Authentication
- Register and login.
- Password hashing.
- JWT-protected APIs.
- Current-user profile endpoint.

### Transactions
- Create income/expense/transfer transactions.
- Edit and delete transactions.
- Date/type/category/division/account filtering.

### Accounts
- Add/update/delete accounts.
- Transfer money between accounts.
- Live aggregate balance behavior via API-driven state.

### Categories
- Global + user-defined categories.
- Income and expense category grouping.

### Summary and Dashboard
- Dashboard metrics endpoint.
- Category summary endpoint.
- Weekly/monthly trends rendered on frontend pages.

### Chatbot
- Protected chat endpoints.
- Authenticated floating widget on private routes only.
- Deterministic exact answer support for week/month income, expense, and savings questions.

## API Endpoints

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Transactions:
- `POST /api/transactions`
- `GET /api/transactions`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

Accounts:
- `GET /api/accounts`
- `POST /api/accounts`
- `POST /api/accounts/transfer`
- `PUT /api/accounts/:id`
- `DELETE /api/accounts/:id`

Categories:
- `GET /api/categories`
- `POST /api/categories`

Summary:
- `GET /api/summary/dashboard`
- `GET /api/summary/categories`

Chat:
- `POST /api/chat/assistant`
- `POST /api/chat/transcribe` (backend route exists; frontend typing UI currently does not use it)

Health:
- `GET /api/health`

## Data Models (MongoDB)

User:
- `name`, `email`, `password`, `createdAt`

Transaction:
- `userId`, `type`, `amount`, `description`, `category`, `division`, `account`, `toAccount`, `fromAccount`, `dateTime`, `createdAt`

Account:
- `userId`, `name`, `balance`, `type`, `color`, `icon`, `createdAt`

Category:
- `userId` (optional for global), `name`, `type`, `icon`, `color`

## Local Setup

### Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas URI (or local MongoDB)

### 1) Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2) Configure environment variables

Frontend (`frontend/.env.local`):

```env
VITE_API_URL=http://localhost:5000/api
```

Backend (`backend/.env`):

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

# AI assistant
OPEN_ROUTER=your_openrouter_api_key
OPENROUTER_MODEL=your_model_name

# Optional (voice transcription route)
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### 3) Run both apps

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

### 4) Open app

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`

## Deployment URLs

- Frontend: https://money-flow-fawn.vercel.app
- Backend: https://moneyflow-ny29.onrender.com

## Repository Structure

```text
Money Manager/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   ├── index.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── screenshot.png
├── README.md
└── SUMMARY.md
```

## Known Behavior and Notes

- If backend logs `Port 5000 is already in use`, stop the duplicate Node process and run again.
- Chatbot should appear only for authenticated users on private app routes.
- Chat conversation persistence is not implemented yet.

## Future Improvements

- Persist chat history per user with a dedicated `Chat` collection.
- Add dedicated screenshots for dashboard, transactions, summary, and accounts pages.
- Add automated tests (API + frontend integration).

## Author

Harshit Gupta
