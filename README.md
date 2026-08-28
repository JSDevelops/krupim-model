# FINE MODEL

The production application is the Next.js full-stack project in [`frontend`](./frontend). It owns the web UI, authentication, API routes, PostgreSQL access, AI integrations, certificates, and 3D generation workflow.

```powershell
cd frontend
npm ci
npm run db:setup
npm run dev
```

For production, deploy `/frontend` to Vercel and use Railway only for PostgreSQL. Follow [`frontend/README.md`](./frontend/README.md). The former Express implementation has been removed; all server-side work runs in Next.js Route Handlers.
