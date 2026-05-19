# 🧠 Team Aptitude Training Platform

A full-stack MERN application for team-based aptitude practice, performance tracking, and gamified learning.

---

## 📁 Project Structure

```
aptitude-platform/
├── backend/                  # Node.js + Express API
│   ├── config/               # DB connection, environment config
│   ├── controllers/          # Business logic for each module
│   ├── middleware/           # Auth, error handling, validation
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route definitions
│   ├── utils/                # Helpers (JWT, mailer, etc.)
│   ├── .env.example
│   ├── package.json
│   └── server.js             # Entry point
│
└── frontend/                 # React app (Vite)
    ├── public/
    └── src/
        ├── components/       # Reusable UI components
        │   ├── auth/
        │   ├── dashboard/
        │   ├── quiz/
        │   ├── admin/
        │   ├── notes/
        │   ├── practice/
        │   ├── gamification/
        │   └── shared/
        ├── pages/            # Route-level page components
        ├── context/          # React Context (Auth, Quiz state)
        ├── hooks/            # Custom React hooks
        ├── utils/            # API calls, formatters
        ├── styles/           # Global CSS + theme
        ├── App.jsx
        └── main.jsx
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

```bash
# Copy and fill in your values
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/aptitude_platform
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
```

### 3. Seed Database (Optional)

```bash
cd backend
npm run seed
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend runs on: http://localhost:5000  
Frontend runs on: http://localhost:5173

---

## 🔑 Default Credentials (after seeding)

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | admin@aptitude.com  | Admin@123  |
| User  | user1@aptitude.com  | User@123   |

---

## 📚 API Overview

| Module       | Base Route          |
|--------------|---------------------|
| Auth         | `/api/auth`         |
| Users        | `/api/users`        |
| Questions    | `/api/questions`    |
| Quizzes      | `/api/quizzes`      |
| Results      | `/api/results`      |
| Notes        | `/api/notes`        |
| Badges       | `/api/badges`       |
| Leaderboard  | `/api/leaderboard`  |
| Practice     | `/api/practice`     |

---

## 🧩 Core Features

- **JWT Authentication** with role-based access (Admin / User)
- **Quiz Engine** with per-question timers, auto-submit, randomization
- **Personal Dashboard** with accuracy, weak topics, streak tracking
- **Admin Panel** for question management, bulk JSON upload, analytics
- **Team Leaderboard** with rankings, comparisons, weak area detection
- **Notes & Formula Sheets** with Markdown rendering
- **Practice Modules** (Tables, Fractions, Speed Math)
- **Review System** with explanations and retry
- **Gamification** (Badges, Streaks, Daily Goals)
