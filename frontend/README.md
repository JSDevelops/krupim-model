# FINE MODEL frontend

Next.js 16 application using local PostgreSQL for development.

## Local setup with Laragon

1. Start PostgreSQL in Laragon. The default setup expects `127.0.0.1:5432` and user `postgres` without a password.
2. Copy `.env.example` to `.env.local`, then set unique `AUTH_SECRET` and `AI_SETTINGS_ENCRYPTION_KEY` values. Environment AI keys remain optional fallbacks.
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

Change the bootstrap password from `/admin/users` after the first login. Do not reuse this local password in production.

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
```

The optional Express backend lives in `../backend`. Copy `backend/.env.example` to `backend/.env` and use the same `DATABASE_URL` and `AUTH_SECRET` as the frontend.
