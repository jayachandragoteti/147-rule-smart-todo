# 🛠️ Developer Documentation: TodoSpace

This document outlines the architecture, data flow, and development standards for the TodoSpace platform.

## 🏗️ Architecture Overview

The project is built on a modern **React 19 + Vite** stack, utilizing **Redux Toolkit** for complex state management and **Firebase (Firestore/Auth)** for real-time data persistence and security.

### 📁 Folder Structure

```text
src/
├── app/            # Redux store configuration and custom hooks
├── components/     # Reusable UI elements
│   ├── layout/     # Structural components (Navbar, Sidebar, Layout)
│   ├── ui/         # Base UI components (Modals, Toasts, IFrameViewer)
│   └── todos/      # Domain-specific components
├── features/       # Redux slices and thunks (grouped by domain)
│   ├── auth/       # Authentication logic
│   ├── todos/      # Task management, recurrence & 1-4-7 logic
│   ├── notes/      # Quick capture system
│   └── journal/    # Diary management
├── pages/          # Top-level page components and routing
├── services/       # External service integrations (Firebase, Firestore)
├── utils/          # Pure functions, helpers (Date logic, Audio synthesis)
└── types/          # TypeScript interface and type definitions
```

## 🔐 Authentication & Security

- **Auth**: Firebase Authentication (Email/Password).
- **Security Rules**: All Firestore data is strictly user-scoped. Subcollections are nested under `users/{uid}/` to ensure high performance and strict isolation.

## 📡 State Management & Data Flow

- **Redux Toolkit**: Used for global UI state, authentication status, and cached Firestore data.
- **Thunks**: Centralized business logic (like the 1-4-7 series calculation and recurrence math) is handled in `todoThunks.ts` and `journalSlice.ts`.
- **Global UI State**: Persists theme settings and IFrame viewer coordinates.

## ⏰ Notification & Sound System

- **Web Audio API**: Sounds are generated programmatically in `src/utils/soundEngine.ts`. No external MP3 files are consumed.
- **ReminderSystem**: A background listener in the main app layout that checks every minute for scheduled tasks. It manages both browser `Notification` permissions and `AudioContext` unlocking via a non-intrusive permission bar.

## 🔄 Core Logic: 1-4-7 Rule

The 1-4-7 rule is a spaced repetition algorithm implemented in `src/utils/rule147.ts`. When a learning task is marked complete, the system:
1. Checks the `seriesDates` array.
2. Identifies the next date in the sequence.
3. Reschedules the task to the next date with a `PENDING` status.
4. Marks the series as fully finished only after the 7th-day review.

## 🛠️ Development Workflow

1. **Environment**: Ensure `.env` is populated with valid Firebase keys.
2. **Components**: Build new components in `src/components`, adhering to the defined `THEME_CLASSES` in `src/utils/themeUtils.ts` for consistent styling.
3. **Styles**: Uses Tailwind CSS with a custom design system configured in `tailwind.config.ts`.
4. **Build**: `npm run build` generates a production-optimized bundle.

## 🚀 Deployment

The project is designed to be hosted on **Vercel** or **Firebase Hosting**. Ensure environment variables are configured in your CI/CD pipeline.

---
**Engineering Constraint**: Maintain "No-AI" policy. All functionalities must rely on deterministic logic and client-side processing where possible.
