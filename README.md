# CN Rention

Retention and gamification platform for a two-dojo Code Ninjas center in Edmonton.

Phase 0 is the foundation only: this repository, the Next.js hello page, shared defaults, a Supabase migration, and checks. Gameplay, portals, and the Windows agent come in later phases. Do not start those until the owner says so.

The source of truth is [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md). Working rules are in [AGENTS.md](AGENTS.md).

## What is live in Phase 0

- A hello page at `/` that confirms the web app is up.
- `GET /api/health` that reports whether Supabase is configured and reachable. It does not read Ninja data.
- Shared default settings from Appendix A, covered by tests. These are seed values. The running app will read the settings table once Phase 1 builds it.
- A first migration that creates `health_pings` with row-level security on and no public access.

## Local checks

```bash
npm install
npm test
npm run typecheck
npm run dev
```

Open http://localhost:3000 and http://localhost:3000/api/health.

## What the owner still does by hand

Supabase is not created from this repository. Create a free project, pick a Canadian region if offered, then add the three variables from `.env.example` in Vercel. Run `supabase/migrations/0001_phase0_health.sql` in the Supabase SQL editor. After that, `/api/health` should say the database is reachable.

Secrets stay in Vercel and Supabase. They never go in this repository.
