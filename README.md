# XYZ PRM — Frontend (Next.js)

## Status

| Item | Status |
|------|--------|
| Next.js 16 + App Router | Done |
| Root-level folders (no `src/`) | Done |
| Tailwind CSS v4 | Done |
| Login screen + auth service | Done |
| shadcn/ui | Pending — with next design screens |
| Remaining Stitch screens | Pending |

## Prerequisites

- Node.js 20+
- Backend on **http://127.0.0.1:3004** with `FRONTEND_URL=http://localhost:3001`

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open **http://localhost:3001** (redirects to `/login`).

## Project layout

```
frontend/
├── app/                # routes & layouts (App Router)
│   ├── (auth)/
│   ├── admin/
│   ├── manager/
│   └── employee/
├── components/
│   ├── ui/
│   ├── auth/
│   ├── admin/
│   ├── manager/
│   └── employee/
├── services/           # API calls per domain
├── hooks/
├── contexts/
├── lib/
│   ├── api/client.js
│   ├── auth/
│   ├── config.js
│   └── utils.js
├── styles/
│   └── tokens.css
└── public/
```

### Conventions

| Layer | Responsibility |
|-------|----------------|
| `app/` | URLs, layouts, metadata |
| `components/` | UI |
| `services/` | Backend API (`apiFetch`) |
| `hooks/` | Client logic |
| `lib/` | Config, HTTP client, helpers |
| `contexts/` | Global client state (when needed) |

Imports use `@/` → project root (see `jsconfig.json`).

## API usage

```javascript
import * as authService from '@/services/auth.service';

await authService.login(email, password);
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server port **3001** |
| `npm run build` | Production build |
| `npm run start` | Production server |
