# 🛠️ Developer Guide

This guide provides an overview of the technical architecture and development workflow for the TodoSpace platform.

## 🚀 Tech Stack
- **Frontend**: React 19 (Vite)
- **State Management**: Redux Toolkit (RTK)
- **Styling**: Vanilla CSS / Tailwind CSS (Aesthetic framework)
- **Icons**: Lucide React
- **Backend**: Firebase 12 (Firestore, Auth)
- **Audio**: Web Audio API (Manual Synthesis)
- **Date Handling**: date-fns

## 📂 Project Structure
```text
src/
├── app/          # Store configuration and hooks
├── components/   # Shared UI components and layout
├── features/     # Redux slices and business logic (thunks)
├── pages/        # Main application views
├── services/     # Firebase and external API integrations
├── types/        # TypeScript interfaces and types
└── utils/        # Shared constants, helpers, and sound engine
```

## 🔊 Sound Engine (`src/utils/soundEngine.ts`)
The application uses a custom-built audio engine based on the **Web Audio API**. 
- **Synthesis over Assets**: Sounds like 'Bell', 'Chime', and 'Alert' are synthesized in real-time using oscillators, reducing bundle size and external dependencies.
- **Autoplay Compliance**: Browsers block background audio. Use `resumeAudioContext()` within a user gesture (like the "Enable Alerts" bar or a "Preview" click) to unlock audio playback.

## ✨ 1-4-7 Rule Implementation
The 1-4-7 Rule schedules repeated occurrences of a task:
- **Base Date**: Day 0
- **Review 1**: Day 1
- **Review 2**: Day 4
- **Review 3**: Day 7
Logic is handled in `src/utils/rule147.ts` and integrated into the task creation flow.

## 🗃️ Firestore Schema
Data is organized in a user-centric sub-collection structure for security and performance:
- `users/{uid}/todos/{todoId}`: Task items
- `users/{uid}/journals/{entryId}`: Diary entries
- `users/{uid}/notes/{noteId}`: Quick notes

## 🚦 Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up a `.env` file with your Firebase configuration.
4. Run development server: `npm run dev`

## 🏗️ Build & Deploy
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Preview**: `npm run preview`
