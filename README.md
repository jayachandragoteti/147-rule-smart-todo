# 147 Rule Smart Todo

A productivity web application built around the **1-4-7 spaced repetition rule** for effective learning. When you create a task and enable the 147 Rule, it automatically schedules reviews on **Day 1**, **Day 4**, and **Day 7** — reinforcing knowledge through scientifically-proven interval repetition.

## ✨ Features

- **1-4-7 Rule Engine** — Automatic spaced repetition scheduling for learning tasks
- **Task Management** — Full CRUD with rich details (descriptions, links, images)
- **Today's View** — See exactly what needs your attention today
- **Dashboard** — Overview stats for total, pending, completed, and 147-active tasks
- **Search & Filter** — Quickly find tasks by title, description, or status
- **Dark/Light Theme** — Persisted theme preference with OS detection
- **Firebase Auth** — Email/password authentication with protected routes
- **Responsive Design** — Mobile-first layout with slide-out sidebar

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · TypeScript · Vite 7 |
| State | Redux Toolkit |
| Styling | TailwindCSS v4 |
| Forms | react-hook-form |
| Routing | react-router-dom v7 |
| Backend | Firebase (Auth · Firestore · Storage) |
| Icons | lucide-react |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Auth and Firestore enabled

### Setup

```bash
# Install dependencies
npm install

# Copy environment file and fill in your Firebase config
cp .env.example .env.local

# Start dev server
npm run dev
```

### Environment Variables

Create a `.env.local` file with your Firebase project values:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 📁 Project Structure

```
src/
├── app/              # Redux store, hooks, root reducer
├── components/
│   ├── layout/       # Layout, Navbar, Sidebar, Footer
│   └── todos/        # TodoCard
├── features/
│   ├── auth/         # Auth slice & thunks
│   ├── todos/        # Todo slice & thunks
│   └── ui/           # Theme slice & toggle
├── pages/            # Route pages (Dashboard, Today, Todos, etc.)
├── routes/           # AppRoutes & ProtectedRoute
├── services/firebase/# Firebase config, auth & todo services
├── types/            # TypeScript type definitions
└── utils/            # Constants, date utils, rule147, theme utils
```

## 📖 The 1-4-7 Rule

The 1-4-7 Rule is a simplified spaced repetition technique:

1. **Day 1** — Learn the material for the first time
2. **Day 4** — First review (3 days later)
3. **Day 7** — Second review (6 days later)

This approach helps transfer knowledge from short-term to long-term memory through strategically timed reviews.

## 🔒 Firebase Deployment

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy
```

## 📝 License

MIT
