# MoneyFlow - Money Manager Application

A full-stack money management application built with React, Node.js, Express, and MongoDB.

## Features

- 💰 Track income and expenses
- 📊 Visual dashboards with charts
- 🏦 Multiple account management (Cash, Bank, Credit Card, Investments)
- 📁 Category-based organization
- 🔐 User authentication with JWT
- 📱 Responsive design with Tailwind CSS
- 🎨 Beautiful UI with Radix UI components

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS 3
- Radix UI
- Framer Motion
- Recharts
- React Router
- Axios

### Backend
- Node.js
- Express 5
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env` file is already configured with MongoDB connection string

4. Seed the database with initial categories:
```bash
node seed.js
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `https://moneyflow-ny29.onrender.com`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5174`

## Usage

1. **Sign Up**: Create a new account at `/signup`
2. **Log In**: Log in with your credentials at `/login`
3. **Dashboard**: View your financial overview
4. **Transactions**: Add, edit, or delete transactions
   - Note: Transactions can only be edited within 12 hours of creation
5. **Accounts**: Manage multiple accounts and transfer money between them
6. **Summary**: View category-wise spending analysis

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction (within 12 hours)
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/dashboard` - Get dashboard data

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account
- `POST /api/accounts/transfer` - Transfer money between accounts

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

### Summary
- `GET /api/summary/categories` - Get category-wise summary

## Default Categories

The application comes with pre-configured categories:

**Income:**
- Salary
- Freelance
- Investment
- Other Income

**Expenses:**
- Food & Dining
- Transportation
- Shopping
- Bills & Utilities
- Entertainment
- Healthcare
- Education
- Travel
- Other Expense

## Project Structure

```
Money Manager/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── modals/
│   │   │   └── ui/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── MoneyContext.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── TransactionsPage.jsx
│   │   │   ├── AccountsPage.jsx
│   │   │   └── SummaryPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── index.js
│   ├── seed.js
│   └── package.json
│
└── README.md
```

## Business Logic

### Transaction Edit Restriction
- Transactions can only be edited within 12 hours of creation
- After 12 hours, transactions become read-only
- This ensures financial data integrity

### Account Balance Updates
- Account balances automatically update when transactions are added/deleted
- Transfers between accounts are atomic operations
- Negative balances are allowed for credit card accounts

## Development

### Running in Development Mode

Backend:
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

Frontend:
```bash
cd frontend
npm run dev  # Vite dev server with HMR
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm start  # Production mode
```

## Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Input validation
- ✅ MongoDB injection protection with Mongoose

## License

MIT

## Author

MoneyFlow Team
