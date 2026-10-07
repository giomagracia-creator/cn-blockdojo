# Supabase

Create the free project yourself. Choose a Canadian region if one is offered.

Then, in the SQL editor, run `migrations/0001_phase0_health.sql`.

Add these Vercel environment variables for Production and Preview:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

Do not commit the values. The service role key is server-only and is unused in Phase 0.
