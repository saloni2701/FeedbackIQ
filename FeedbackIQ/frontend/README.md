# FeedbackIQ Frontend

React + TypeScript + Tailwind CSS dashboard for FeedbackIQ: Transforming Customer Feedback into Product Insights.

## Stack
React 18, TypeScript, Vite, Tailwind CSS, Recharts, Axios, React Router.

## Run
```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

## Features
- Pages: Overview, Feedback, Topics, Issues, Requests, Trends, Reports
- Light and dark theme toggle (saved in the browser, follows the system setting on first visit)
- Plain-language wording, large text, and labels so meaning never depends on colour alone
- Built-in sample data, so the UI works before the backend is ready

## Connecting the FastAPI backend
1. Set `VITE_USE_MOCK=false` and `VITE_API_URL` in `.env`.
2. Enable CORS for `http://localhost:5173` in FastAPI.
3. Make the backend return the shapes in `src/types.ts` from these routes (rename them in `src/api/feedback.ts` if yours differ):

| Route | Returns |
| --- | --- |
| `GET /api/summary` | `Summary` |
| `GET /api/trends` | `TrendPoint[]` |
| `GET /api/aspects` | `AspectSentiment[]` |
| `GET /api/issues` | `Issue[]` |
| `GET /api/feature-requests` | `FeatureRequest[]` |
| `GET /api/topics` | `Topic[]` |
| `GET /api/feedback` | `FeedbackItem[]` |

## Structure
```
src/
  api/         Axios client and data functions (mock or real)
  components/  Layout, theme toggle, shared UI
  context/     Theme provider and chart colours
  data/        Sample data
  hooks/       useAsync
  pages/       One file per route
  types.ts     Shared data shapes
```
