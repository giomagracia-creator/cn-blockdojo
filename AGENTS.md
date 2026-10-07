# CN Rention working rules

- The source of truth is docs/PROJECT_BRIEF.md. If something conflicts, ask.
- TypeScript everywhere. Shared rules (XP, coins, levels) live in packages/shared.
- All tunable numbers come from the settings table, never hard-coded.
- Never log or store typed content. The agent counts input events only.
- Every coin, XP, power-up, belt-up and PIN lookup action writes to audit_log.
- Only the Director role may change coins.
- Keep secrets in environment variables. The repository is private but still contains no secrets.
- Build and verify one phase at a time; add tests for the XP and coin engine.
- Respect free-plan limits: batch writes, purge old rows, compress images.
- Commit in small steps with clear messages and stop at the end of each phase.
