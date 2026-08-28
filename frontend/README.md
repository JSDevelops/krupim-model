# FINE MODEL — Next.js Full-stack

Next.js 16 application containing the web UI, authentication, Route Handler APIs, AI integrations, and PostgreSQL access. The browser never connects directly to PostgreSQL and no separate Express service is required.

## Local setup with Laragon

1. Start PostgreSQL in Laragon. The default setup expects `127.0.0.1:5432` and user `postgres` without a password.
2. Copy `.env.example` to `.env.local`, then set unique `AUTH_SECRET` and `AI_SETTINGS_ENCRYPTION_KEY` values. Environment AI keys remain optional fallbacks because they can be configured in `/admin/settings`.
3. Create/update the dedicated `krupim_local` database:

```powershell
npm run db:setup
```

4. Install and start the app:

```bash
npm ci
npm run dev
```

The app is available at `http://localhost:3000`.

Local bootstrap login:

- Email: `admin@local.test`
- Password: `Admin123!`

Change the bootstrap password from `/admin/settings` after the first login. Do not reuse this local password in production.

## Password recovery

The login page links to `/forgot-password`. In development, the one-time reset token is filled into the form automatically and expires after 20 minutes. Production responses never expose the token; connect an email/SMS delivery service before enabling public self-service recovery.

## Backup and restore

Create a timestamped PostgreSQL custom-format backup in `frontend/backups`:

```powershell
npm run db:backup
```

Restore requires both the exact backup path and an explicit database-name confirmation because it replaces objects in the target database:

```powershell
npm run db:restore -- -BackupFile .\backups\krupim_local-YYYYMMDD-HHMMSS.dump -ConfirmDatabase krupim_local
```

To install a daily Windows Scheduled Task (default 02:00), run this deliberately from a terminal with permission to register scheduled tasks:

```powershell
npm run db:backup:schedule
# custom time
npm run db:backup:schedule -- -DailyAt 23:30
```

Schema updates after the baseline live in `database/migrations` and `npm run db:setup` records each applied filename in `schema_migrations`.

## Production: Vercel + Railway PostgreSQL

Import this repository into Vercel and set **Root Directory** to `frontend`. Keep the detected Next.js framework settings; Vercel runs `npm run build` and the Route Handlers automatically, so no separate start command or backend service is required.

`vercel.json` pins Node.js Functions to Singapore (`sin1`) to keep compute close to users in Thailand. Set the Railway PostgreSQL service region to **Southeast Asia / Singapore** as well. If the database is intentionally hosted elsewhere, change `regions` in `vercel.json` to the nearest Vercel region; distance between Functions and PostgreSQL directly adds latency to every protected API request.

Add these variables in Vercel Project Settings for the Production environment:

```env
DATABASE_URL=postgresql://user:password@public-railway-host:port/database
DATABASE_SSL=require
DATABASE_SSL_REJECT_UNAUTHORIZED=false
DATABASE_POOL_MAX=2
AUTH_SECRET=stable-random-value-at-least-32-characters
AI_SETTINGS_ENCRYPTION_KEY=another-stable-random-value-at-least-32-characters
APP_URL=https://your-domain.example
NEXT_PUBLIC_SITE_URL=https://your-domain.example
```

Use Railway PostgreSQL's `DATABASE_PUBLIC_URL` value as Vercel's `DATABASE_URL`, because Vercel is outside Railway's private network. Public proxy traffic can incur Railway network egress. `DATABASE_URL`, authentication secrets, and AI keys are server-only variables and must never use a `NEXT_PUBLIC_` prefix.

Do not point Preview deployments at the production database unless that is intentional. Prefer a separate preview database or leave `DATABASE_URL` unset for Preview.

Before the first production deployment, run migrations deliberately from a trusted terminal or controlled CI job. Do not attach production migrations to every Vercel Preview build:

```powershell
$env:DATABASE_URL = '<Railway DATABASE_PUBLIC_URL>'
$env:DATABASE_SSL = 'require'
$env:DATABASE_SSL_REJECT_UNAUTHORIZED = 'false'
npm run db:migrate
```

The migration command is idempotent and records applied files in `schema_migrations`. AI provider keys are optional environment fallbacks; the preferred workflow is to save them from `/admin/settings`, where they are encrypted in PostgreSQL. Keep `AI_SETTINGS_ENCRYPTION_KEY` unchanged between deployments or saved keys cannot be decrypted.

After deployment, verify `GET /api/health`; it reports the active Vercel region and PostgreSQL latency, and returns HTTP 503 when PostgreSQL cannot be reached. All browser requests use same-origin Next.js Route Handlers under `/api`; Railway runs PostgreSQL only.

## Security model

- Passwords are hashed with bcrypt and stored only in PostgreSQL; browser storage never contains passwords.
- Authentication uses an eight-hour signed JWT in an HttpOnly, SameSite cookie.
- New student accounts are active immediately for local development.
- New teacher accounts remain pending until a developer approves them in `/admin/users`.
- AI credentials entered in `/admin/settings` are encrypted with AES-256-GCM before PostgreSQL storage. Full keys never return to the browser; server environment keys remain supported as fallbacks.
- Protected API routes validate the local JWT, current account status, role permissions, and rate limits.
- Browser data operations pass through `/api/data`; the browser never connects directly to PostgreSQL.

## Verification

```bash
npm run build
npm run lint
npm run lint:security
npm run db:setup
npm run test:api
```

`npm run test:api` expects the development server to be running. If the bootstrap password has changed, set `KRUPIM_TEST_ADMIN_EMAIL` and `KRUPIM_TEST_ADMIN_PASSWORD` for the current terminal first.
