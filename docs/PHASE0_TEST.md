# How to test Phase 0

1. Open the Vercel URL. You should see the CN Rention Phase 0 page, not a game.
2. Open `/api/health` on that same URL.
   - Before Supabase keys are set, `database` is `not_configured`. The page still loads. That is expected.
   - After keys are set and the migration has run, `database` is `reachable`.
3. In GitHub, the Actions tab should show the check workflow on `main` passing: test, typecheck, lint.
4. Confirm the repository is private and that no `.env` file is in the tree.

Stop here. Phase 1 (schema, staff login, roster import) does not start until you say so.
