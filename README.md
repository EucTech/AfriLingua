# AfriLingua

AfriLingua is a peer-to-peer language exchange platform for African languages. Users work through structured courses, then get matched live with a "tandem partner" for video, audio, or text practice.

**Live app:** https://afrilingua-web.vercel.app/

The project is a monorepo with two independent apps:

```
AfriLingua/
├── backend/     NestJS API (TypeScript, Prisma, PostgreSQL)
├── frontend/    Next.js web app (TypeScript, Tailwind, shadcn/ui)
└── docs/        Notes on issues encountered and how they were fixed
```

There is no shared build step between them — each has its own dependencies, its own `.env`, and runs as its own process.

## Prerequisites

- **Node.js 20+**
- **pnpm** — install with `npm install -g pnpm` if you don't have it. Both apps use pnpm.
- A **PostgreSQL database**. The project was built against [Neon](https://neon.tech) (serverless Postgres), but any Postgres 14+ instance works.
- A **LiveKit Cloud** project ([livekit.io](https://livekit.io)) for video/audio calls — you'll need its WebSocket URL, API key, and API secret.
- A **Cloudinary** account for avatar/media uploads — you'll need its `CLOUDINARY_URL`.

The backend will fail to start if any of the required environment variables below are missing — they're validated at boot, not just when the feature is used.

## 1. Clone and install root tooling

```bash
git clone <repo-url> AfriLingua
cd AfriLingua
pnpm install
```

This installs [Husky](https://typicode.github.io/husky/) at the repo root, which enables the commit hooks under `.husky/` (commit message format, one-logical-change-per-commit reminders). Do this once before making any commits.

## 2. Backend setup

```bash
cd backend
pnpm install
```

Copy the example env file and fill in real values:

```bash
cp .env.example .env
```

| Variable              | Description                                                                 |
| ---------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`        | Postgres connection string (Neon or any Postgres instance)                  |
| `JWT_SECRET`          | Any long random string, used to sign auth tokens                            |
| `JWT_EXPIRES_IN`      | Token lifetime, e.g. `7d`                                                    |
| `PORT`                | Port the API listens on (defaults to `4000`)                                |
| `LIVEKIT_URL`         | Your LiveKit Cloud project's WebSocket URL, e.g. `wss://xxx.livekit.cloud`   |
| `LIVEKIT_API_KEY`     | From your LiveKit Cloud project's **API keys** page                         |
| `LIVEKIT_API_SECRET`  | From the same page — only shown once when the key is created                |
| `CLOUDINARY_URL`      | From your Cloudinary dashboard, format `cloudinary://key:secret@cloud_name` |

Set up the database (creates tables and applies all migrations):

```bash
npx prisma migrate deploy
```

Seed it with sample courses, a guest user, and a set of tandem-partner accounts:

```bash
npx tsx prisma/seed.ts
```

This creates several accounts with the password `password123`, including `guest@afrilingua.app` — useful for logging in immediately without registering.

Start the API in watch mode:

```bash
pnpm start:dev
```

The API runs at `http://localhost:4000/api`, with interactive Swagger docs at `http://localhost:4000/api/docs`.

### Other backend scripts

| Command             | What it does                                    |
| -------------------- | -------------------------------------------------- |
| `pnpm build`        | Compile TypeScript to `dist/`                   |
| `pnpm start:prod`   | Run the compiled build (`node dist/main`)       |
| `pnpm lint`         | ESLint with auto-fix                            |
| `pnpm test`         | Unit tests (Jest)                               |
| `pnpm test:e2e`     | End-to-end tests                                |

## 3. Frontend setup

In a separate terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`. By default it talks to the backend at `http://localhost:4000/api` — no `.env` file is needed unless you're running the backend somewhere else, in which case create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

### Other frontend scripts

| Command         | What it does                          |
| ----------------- | ------------------------------------------ |
| `pnpm build`    | Production build                      |
| `pnpm start`    | Run the production build              |
| `pnpm lint`     | ESLint                                |

## Running both together

You need two terminals open at once — the backend and frontend are separate long-running processes:

```bash
# terminal 1
cd backend && pnpm start:dev

# terminal 2
cd frontend && pnpm dev
```

Then open `http://localhost:3000` and log in with a seeded account (e.g. `guest@afrilingua.app` / `password123`), or register a new one.

To try the tandem-partner matching + video call flow, you need **two** logged-in users at once (e.g. two browser profiles, or one normal + one incognito window) both practicing the same language and call mode.

## Troubleshooting

**LiveKit calls fail with "invalid token" / 401 Unauthorized, even with correct-looking credentials.**
This almost always means the machine's system clock has drifted from real time — LiveKit signs tokens with a "not valid before" timestamp based on the local clock, and rejects tokens that appear to be from the future. Resync your system clock (Windows: Settings → Time & Language → Date & time → "Sync now") and try again before assuming the API key/secret is wrong. See `docs/livekit-invalid-token-fix.md` for the full investigation.

**Prisma commands fail with a connection error.**
Double-check `DATABASE_URL` in `backend/.env` — if using Neon, make sure `sslmode=require` is in the connection string.

**Video/audio never connects after matching.**
Confirm `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET` are all set and belong to the *same* LiveKit Cloud project (mixing keys from different projects will authenticate against the dashboard but fail to sign valid tokens for that project's URL).

## Commit conventions

See `frontend/CLAUDE.md` for the full frontend design system and commit rules. In short: Conventional Commits, one file or one logical change per commit, no AI attribution in commit messages — enforced by the Husky hooks installed in step 1.
