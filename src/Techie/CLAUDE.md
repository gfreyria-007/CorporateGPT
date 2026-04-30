# Techie: Tu Super Tutor IA - Project Brain

Professional AI-powered educational platform developed for CatalizIA. This project provides students with a personal tutor based on the Gemini 1.5 Pro/Flash models, featuring specialized modes for different subjects and age-appropriate pedagogy.

## Core Stack
- **Frontend**: Vite + React + TypeScript
- **State Management**: React Hooks + Context
- **Styling**: TailwindCSS (Modern/Premium aesthetics)
- **Animations**: Framer Motion
- **Backend & Auth**: Firebase (Authentication, Firestore)
- **AI Engine**: Google Gemini API via `@google/genai`

## Project Structure / Migration Plan
- `/src`
  - `/components`: UI and Layout components
  - `/services`: Gemini and Firebase logic
  - `/types`: TypeScript definitions
  - `/utils`: Helper functions
  - `/constants`: Configuration and static data
  - `App.tsx`: Main entry component
  - `firebase.ts`: Firebase initialization
- `index.html`: Entry points
- `package.json`: Dependencies and scripts

## Development Workflows
- **Install**: `npm install`
- **Develop**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## Deployment (Vercel)
1. Install Vercel CLI: `npm install -g vercel`
2. Link project: `vercel link`
3. Configure Envs: Add `GEMINI_API_KEY` in Vercel Dashboard
4. Deploy: `vercel --prod`

## Design Guidelines
- **Aesthetics**: Premium, modern, educator-focused interface.
- **Visuals**: Glassmorphism, subtle gradients, vibrant blues/purples.
- **Interactions**: Smooth micro-animations for feedback and engagement.
- **Responsive**: Mobile-first, adaptive layouts for tablets and desktops.
