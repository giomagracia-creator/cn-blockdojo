# CN Rention: Project Brief (Grok edition)

**Code Ninjas retention and gamification platform**

- Version 1.0, October 7, 2026
- Owner: Franchise Owner, two-dojo Code Ninjas center, Edmonton, Alberta
- Audience: Grok Build (xAI coding agent) and anyone reviewing the plan

This brief records every decision made during planning so the application can be built phase by phase. Where this brief and a later instruction differ, ask before building.

## 1. Overview

CN Rention is a web platform that turns time at the keyboard into an RPG-style game for Ninjas (students, ages 7 to 14) at a two-dojo Code Ninjas center in Edmonton, Alberta. Ninjas earn XP and coins for real activity at their dojo PC, watch their characters mine, build, craft and train on screen, climb a battle-pass style reward track for each belt, and spend coins in a small shop. Parents see progress, photos and notes. Senseis motivate and manage. The Associate Center Director and Owner run the system.

### Goals

- Increase Ninja engagement, weekly attendance and retention by making progress visible and fun.
- Give parents clear visibility into their Ninja's journey without any notifications or payments inside the app.
- Give Senseis fast tools to motivate Ninjas (bonus XP, power-ups, notes, photos) and to react to inappropriate screen content.
- Run entirely on the Vercel Pro plan the owner already pays for plus the free Supabase plan, so there is no new monthly cost.

### Non-goals (explicitly out of scope)

- No online payments or transactions of any kind. Coins are sold in person and added by the Associate Center Director.
- No chat or messaging between users and no trading between Ninjas.
- No push, email or SMS notifications.
- No sensitive information stored: no payment details, addresses, medical data or government IDs.
- No integration with MyStudio (CRM) or attendance systems for now (built behind switches that stay off).
- No automatic web filtering or site blocking (handled by a separate application). The Sensei can lock a screen.
- No native mobile app. Sensei tools must work in a phone or tablet browser.

### Success metrics (measured during the pilot)

- Average active minutes per Ninja per week.
- Check-ins per Ninja per week and attendance trend compared with the period before launch.
- Belt-up pace and the share of Ninjas finishing each battle pass.
- Parent portal visits per week.
- Re-enrollment or retention rate compared with the same period last year (tracked by the owner outside the app).

## 2. Decisions locked in

| Topic | Decision |
| --- | --- |
| Locations | One center with two dojos. Each dojo has its own live dashboard on its own TV; both run at the same time. A third TV in the lobby shows the belt-up celebration. |
| Capacity | Default 15 Ninjas per dojo, configurable seat limit up to 30 per dojo. At most two simultaneous sessions per dojo. |
| Devices | Desktop PCs only (Windows), all on the same network across both dojos. Ninjas use a mix of coding tools, and all activity counts (including YouTube camps). |
| Where XP is earned | Only inside the dojo, on registered PCs on the dojo network, with a Ninja signed in. |
| Hosting | Next.js on the existing Vercel Pro plan. Code in GitHub. Database, file storage and live features on the Supabase free plan. |
| Build tooling | Grok Build (xAI's coding agent) writes the code, commits to GitHub and deploys to Vercel using the git and Vercel command-line tools. |
| Theme | Blocky voxel/pixel look in a Minecraft or Roblox style using free assets. The owner holds trademark permission for both. The Sensei can change the scene at any time during a session. |
| Logins | Ninjas and parents use a PIN. Senseis can look up a forgotten Ninja PIN. |
| Money | 100 coins = $10. All coin sales happen in person. Only the Associate Center Director can add coins. Senseis and Ninjas cannot. |
| XP and coins | XP is 1 to 2 per active minute. Coins are 0.1 to 0.2 per active minute. A Sensei can start a 5-minute power-up that doubles both. |
| Progression | 20 levels per belt, each belt acts as its own battle pass. Belt-ups are triggered manually by a Sensei. |
| Rewards | Digital rewards plus small physical rewards. Both are small and low-cost. |
| Integrations | MyStudio and attendance are off but switchable later. An Excel import of active students and current belts replaces them. Belt changes in Head Office's Impact system are made manually by Senseis. |
| Display names | First name only on TVs, shown above the character. Inappropriate names must never display. |
| Monitoring | Agent reports the active app or site. A Sensei is alerted on inappropriate content, with a screenshot. A Sensei lock-screen button is the only enforcement action in version 1. |

## 3. Portals and views

| Portal or view | Used by | Purpose |
| --- | --- | --- |
| Ninja portal | Ninjas (on their dojo PC) | Character and pet customization, XP and level progress, battle-pass rewards, coins, shop, achievements, live view of their own character working. |
| Parent portal | Parents (any browser) | Current belt and level, XP earned, check-in history, live view of their Ninja working, recent achievements, photos, Sensei notes, weekly and monthly summaries, and first-login waivers. |
| Sensei portal | Senseis (tablet, phone, PC) | Live roster for their sessions, session assignment, bonus or removed XP, power-ups, belt-up button, notes, photos, alerts with screenshots, lock-screen button, challenges, quests, teams, match days, custom achievements, scene control, forgotten-PIN lookup. |
| Admin portal | Associate Center Director and Owner | Roster import, users, dojos, sessions, devices, seat limits, settings (XP, coin and level tables), shop and rewards management, coin adjustments (Director only), reward fulfillment, reports, audit log, feature switches. |
| Dojo display (one per dojo) | Large TV in each dojo | Live scene with each checked-in Ninja's character, first name, XP gain, power-up effects, leaderboards, active challenges, weekly champions. |
| Belt-up display | Lobby TV | Full-screen belt-up celebration controlled by the Sensei, plus an idle screen of recent belt-ups and leaderboards. |

All portals live in one Next.js application, separated by role-based routes (for example /ninja, /parent, /sensei, /admin, /display/dojo/[id], /display/lobby). Each TV opens a display URL in a full-screen browser and signs in with a display key.

## 4. Roles and permissions

| Action | Ninja | Parent | Sensei | Director / Owner |
| --- | --- | --- | --- | --- |
| View own or own child's progress | Yes | Yes | Yes | Yes |
| View other Ninjas' public info (first name, belt, level) | Yes | No | Yes | Yes |
| Award or remove XP | No | No | Yes | Yes |
| Start a 5-minute power-up | No | No | Yes | Yes |
| Trigger a belt-up | No | No | Yes | Yes |
| Add notes and photos | No | No | Yes | Yes |
| Lock a screen, review alerts and screenshots | No | No | Yes | Yes |
| Look up a Ninja PIN | No | No | Yes | Yes |
| Create challenges, quests, teams, matches, achievements | No | No | Yes | Yes |
| Add or remove coins | No | No | No | Director only |
| Import roster, manage users, shop, settings | No | No | No | Yes |
| View audit log and reports | No | No | No | Yes |

> Every coin change, XP adjustment, power-up, belt-up, PIN lookup and screenshot view is written to the audit log with who did it and when.

## 5. Game design

### Theme and art

- Blocky voxel/pixel 2D style. Use free or CC0 asset packs (for example Kenney.nl and OpenGameArt) and original sprites. If the owner supplies licensed Minecraft or Roblox art files, the coding agent should be told where they are and how they may be used.
- Asset folders are organized by pack so artwork can be upgraded later without code changes.
- Rendering uses PixiJS (or Phaser) inside React for the TV and Ninja scenes. Framer Motion handles interface animation.

### Characters, classes, pets and skins

- Each Ninja has one character built from layered sprite parts (body, hair, outfit, headgear, tool) and one active pet.
- Classes are cosmetic: Miner, Builder, Crafter, Fighter, Explorer. A class sets the default activity animation and flair. Classes do not change XP or coin rates, to keep things fair.
- Skins for characters and pets are purchased with coins in the shop. Battle-pass tiers unlock other cosmetics.
- Display name is the Ninja's first name from the roster. Free-typed names are not allowed. A Sensei can override a display name.

### Scenes and activities

- Scenes: mine, build site, craft workshop, training dojo, forest exploration, boss arena. Each scene maps activity to an animation (mining, building, crafting, training, exploring, fighting).
- The Sensei can switch the scene for a session or a whole dojo at any moment. The default scene is configurable per dojo.
- Characters react to power-ups, level-ups and alerts-resolved events with short effects.
- Seasonal scene packs (Halloween, winter, summer camp) are added as content later.

### Quests, teams, matches and achievements

- Challenges and quests are created by Senseis (for example: code 30 minutes, finish a project, help another Ninja). Completion awards XP or a cosmetic, as configured.
- Teams (guilds) are created by Senseis. Team totals add up members' XP for the period.
- Competitive match days: a Sensei starts a timed XP race between teams or Ninjas in a session, with a live scoreboard on the TV. Match XP uses the normal rates plus any configured bonus.
- Achievements are custom badges created by Senseis (leadership, teamwork, helping others, exceptional coding, attendance milestones). Awarding one can also grant XP.

### Leaderboards

- Shown per dojo and per session.
- Rank is based on the belt system: higher belt first, then level within the belt, then XP within the current level as a tie-break.
- Only first names and characters are shown.

## 6. XP, coins and the battle pass

### What counts as active

- The agent splits time into 10-second buckets. A bucket is active when it contains real keyboard or mouse input above a small threshold.
- A minute is active when at least 3 of its 6 buckets are active.
- Any application counts (coding tools, browsers, games, YouTube camps).

### XP rate (dynamic, 1 to 2 per active minute)

| Streak tier | Reached after | XP per active minute |
| --- | --- | --- |
| Tier 1 | Start of activity | 1.0 |
| Tier 2 | 2 consecutive active minutes | 1.5 |
| Tier 3 | 5 consecutive active minutes | 2.0 |

Each inactive minute drops the streak by one tier rather than resetting it fully, so natural thinking pauses are forgiven. Thresholds are settings.

### Coin rate

Coins per active minute = 0.1 + (XP rate - 1) x 0.1, so coins run from 0.1 (tier 1) to 0.2 (tier 3). At a typical tier-2 rate of 0.15 coins per minute, a 1.5-hour week earns about 10 coins, roughly $1 of shop credit, and about 100 coins ($10) over a 10-week belt. Coins are stored with two decimals; the interface shows whole coins.

### Power-ups

- A Sensei (or the Director) can start a power-up on one Ninja, a whole session, or a whole dojo.
- Duration is 5 minutes. Effect is x2 on both XP and coins. Power-ups do not stack; starting another while one is active extends nothing.
- A configurable limit on power-ups per Sensei per session prevents overuse. Every power-up is audit-logged.
- The TV shows a visible power-up effect on affected characters.

### Caps and fairness

- Maximum XP rate is 2 per minute. Optional daily cap of 120 active minutes per Ninja (setting).
- XP and coins only accrue while the Ninja is signed in, the PC is registered, the PC is on the dojo network, and a session is active.
- Held-down keys count at most once per second. Perfectly periodic input (auto-clickers) and repeated identical mouse patterns (jigglers) do not count as active.
- Anomalies appear in the Sensei dashboard for review. Senseis can remove incorrect XP.

### XP needed per level (base belts White to Green)

Formula: XP for level n = round((30 + 2 x (n - 1)) x belt multiplier), for n = 1 to 20.

| Levels | XP per level | Cumulative XP |
| --- | --- | --- |
| 1 to 5 | 30, 32, 34, 36, 38 | 170 |
| 6 to 10 | 40, 42, 44, 46, 48 | 390 |
| 11 to 15 | 50, 52, 54, 56, 58 | 660 |
| 16 to 20 | 60, 62, 64, 66, 68 | 980 |

| Belts | Multiplier | Approx. XP for 20 levels |
| --- | --- | --- |
| White, Yellow, Orange, Green | x1.0 | 980 |
| Blue, Purple, Brown, Red, Black | x1.25 | about 1,225 |
| Bronze, Silver, Platinum, Gold (bonus tracks) | x1.5 | about 1,470 |

Planning assumptions: about 45 active minutes per class hour and an average of 1.5 XP per minute. Estimated time to finish one base pass is about 15 weeks at 1 hour a week, about 10 weeks at 1.5 hours, and about 7 weeks at 2 hours. Power-ups shorten this. All numbers are editable in admin settings and should be retuned after the pilot.

### Battle pass rewards

- Each belt has its own pass of 20 tiers, themed in the belt's color. Reaching a level unlocks that tier's reward.
- Digital rewards on most levels: skins, pets, scenes, titles, badges, with rarer items near the top.
- Small physical rewards at levels 5, 10, 15 and 20 (for example a sticker, a snack, a pencil, and a small 3D-printed keychain at level 20). The app lists each as 'ready to hand out' and a Sensei marks it handed out so none are missed or given twice.
- Estimated cost is about $2 to $6 per Ninja per belt at $0.50 to $1.50 per physical reward.

### Belt-up rules

- A Ninja's belt changes only when a Sensei triggers a belt-up. XP never promotes a Ninja automatically.
- The Sensei also updates the belt manually in Head Office's Impact system. The app does not connect to Impact.
- On belt-up the Ninja starts the new belt's pass at level 1. Unclaimed tiers from the old pass stay claimable and nothing is lost.
- If a Ninja completes level 20 before their belt-up, extra XP earns stars toward a small repeating reward so they never feel stuck.
- Belt-up triggers the lobby celebration (see section 7).

### Shop

- Categories: 3D prints, PNO (parent night out), candy, chips, pop, character and pet skins, special dojo events.
- Each item has a name, description, photo, coin price, stock, optional per-Ninja limit, and an internal source link (for example a Temu or Alibaba product). Items are entered by hand in an Add Item form. The app never scrapes other websites.
- Digital cosmetics are delivered instantly. Physical items create an order that the Director or Sensei marks as handed out. Coins are held when the order is placed and refunded if the Director cancels it.
- No real money moves in the app.

## 7. Belt system and celebration

| Belts | Curriculum |
| --- | --- |
| White, Yellow, Orange, Green | Block coding (MakeCode). |
| Blue, Purple, Brown, Red, Black | JavaScript. |
| Bronze, Silver, Platinum, Gold (bonus tracks after Black) | Advanced belts: original games in Unity (C#) or Godot. |

Ninjas receive color-coded wristbands as they progress. All belts sit inside the CREATE program, the year-round track for ages 7 to 14.

### Belt-up celebration (lobby TV)

- Triggered by a Sensei from their portal. Multiple belt-ups queue and play one after another.
- Sequence of about 20 to 30 seconds: lobby screen dims, Ninja's character steps forward with first name, wristband color transitions from the old belt to the new one with a pixel-block burst, confetti and a reveal of the new belt, then a short summary (levels earned, achievements).
- Full 'bells and whistles' but clean: strong motion and sound design with uncluttered layout and large type for a room full of people. Sound can be muted.
- The Sensei can replay or skip an animation. The lobby screen shows recent belt-ups and leaderboards when idle.

## 8. Windows activity agent

A small background app installed on every dojo PC. It is the source of truth for activity, check-in, location trust and screen monitoring.

### Sign-in and check-in

- On Windows start the agent shows a sign-in window: the Ninja taps their character or first name from the active session's roster, then enters a 4-digit PIN. This prevents PIN collisions and guessing.
- Three wrong PINs lock that Ninja out until a Sensei unlocks them.
- The seat limit is enforced: sign-ins beyond the dojo's limit are refused.
- Signing in joins the Ninja to the dojo's active session (default is their roster session). A Sensei can move Ninjas between sessions.
- Auto sign-out after a configurable idle period, or when a Sensei signs the Ninja out.

### Heartbeat

- Every 30 seconds the agent sends a heartbeat over HTTPS to the web app with: device ID, signed-in Ninja ID, active seconds per 10-second bucket, aggregate input counts (for pattern checks only), foreground app name, active browser domain (via a small Chrome/Edge extension), and agent version.
- If the network drops the agent queues heartbeats locally and sends them when it reconnects.
- At roughly 1 million heartbeat calls per month, confirm usage against Vercel Pro included allowances during the pilot.

### Location and device trust

- Each PC is registered once by the Director with a device token and assigned to a dojo. Both dojos share a network, so the device registration (not the network) decides which dojo a PC belongs to.
- The server also checks that the request comes from the dojo's public IP address (allowlist in settings). Heartbeats from unknown devices or other networks earn nothing.
- Browser GPS is not used. It is unreliable indoors and easy to fake.

### Monitoring and alerts

- The agent reports the foreground app and browser domain. An admin-managed flagged list of domains and keywords triggers an alert.
- On an alert the agent captures a screenshot, compresses it, and uploads it with the alert. The Sensei gets an on-screen alert on their portal (no email or push).
- The Sensei reviews and can press Lock screen, which locks that Windows session within seconds. The Sensei can then dismiss or log the alert with a note.
- Screenshots are visible only to Senseis and the Director and are deleted after 30 days (setting).
- The agent never records what is typed. It counts input events only and discards key identities immediately.

### Resilience and tamper protection

- Ninjas should use standard (non-admin) Windows accounts so they cannot uninstall or stop the agent. The agent restarts automatically.
- If a registered PC with a signed-in Ninja stops sending heartbeats, the Sensei dashboard flags it.
- Lock commands arrive over a live connection to the agent, with the heartbeat response as a fallback.

### Technology and rollout

- Electron with TypeScript (shared code with the web app). Global input counting via a native hook library, active window detection via a maintained library, screenshots via the Electron desktop capturer, lock via the Windows LockWorkStation call.
- Packaged as a Windows installer with auto-update from GitHub Releases. The installer carries no secrets; the device token is entered at registration.
- Install on about 60 desktops (two dojos at up to 30 seats each); installation needs administrator rights on each PC.

## 9. Architecture

| Layer | Choice |
| --- | --- |
| Web app | Next.js (App Router), React, TypeScript, Tailwind CSS, Framer Motion, PixiJS (or Phaser) for scenes. One app for every portal and display. |
| Hosting | Vercel Pro (existing plan). GitHub repository connected to Vercel for automatic deploys. |
| Database and storage | Supabase free plan: Postgres with row-level security, Storage for photos and screenshots. Canadian region if offered. |
| Live updates | TVs and parent views poll a cached summary endpoint every 5 seconds. Rare events (alerts, belt-up, lock-screen, power-up start) use Supabase Realtime broadcast to the agents, Sensei devices and TVs. |
| Sessions and login | Ninjas and parents sign in with a PIN. The server issues a short-lived signed token with role and dojo claims that works with row-level security. Staff accounts use email and password (recommendation, see section 16). |
| Agent | Electron app on each PC (section 8). |
| Payments | None. |
| Monitoring of the system | Vercel logs and error reporting, Supabase dashboard, a daily health check job. |

### Repository layout

```
cn-retention/
  apps/web/          Next.js app (all portals and TV displays)
  apps/agent/        Windows agent (Electron and TypeScript)
  packages/shared/   Shared types, XP and coin rules, constants
  supabase/          Migrations, seed data, security policies
  docs/              PROJECT_BRIEF.md and decision log
  AGENTS.md          Working rules for the coding agent
```

### Why polling for TVs

Supabase's free plan allows about 200 concurrent realtime connections and 2 million realtime messages a month. Sending one realtime message per Ninja per tick would exceed that. Polling a cached summary every 5 seconds from three TVs and a few Sensei devices costs almost nothing and is simpler. Realtime is reserved for rare events.

### Free-plan guardrails

- Auto-pause: free Supabase projects pause after a week without activity, which could happen during holiday closures. A daily keep-alive job on Vercel prevents it.
- Backups: schedule a weekly export of the database to a file the owner keeps, because free projects may not include automatic backups.
- Storage: photos are resized to about 300 KB, screenshots to about 100 KB and deleted after 30 days. Minute-level activity rows are purged after 14 days while daily totals are kept.
- Videos are deferred because of storage limits; photos only in the first release.
- Upgrade trigger: move to the Supabase Pro plan (about $25 a month) if the database passes about 400 MB, a pause or data loss becomes unacceptable, or concurrent connections approach 200.

## 10. Data model (high level)

The coding agent should design the exact schema and migrations. These are the required tables and their key fields.

| Table | Purpose and key fields |
| --- | --- |
| dojos | Name, seat limit, allowed public IPs, default scene. |
| sessions | Dojo, name, start and end, status, current scene. At most two active per dojo. |
| devices | Dojo, name, token hash, last seen, agent version. |
| staff_users | Auth link, role (sensei, director, owner), dojo access. |
| ninjas | First name, last initial (staff only), dojo, default session, current belt, encrypted PIN, avatar and pet configuration, photo consent flag, active flag. |
| parents and parent_ninja | Parent name, hashed PIN, links to Ninjas, waiver status. |
| belts | Name, track, order, XP multiplier. |
| pass_tiers | Belt, level, base XP, digital reward, physical reward. |
| ninja_progress | Ninja, belt, level, XP in level, total XP, stars, timestamps. |
| activity_minutes | Ninja, device, minute, active seconds, XP, coins, power-up applied. Purged after 14 days. |
| daily_totals | Ninja, date, active minutes, XP, coins. Kept long term. |
| xp_events | Manual awards and removals with reason and actor. |
| coin_ledger | Append-only: Ninja, amount, type (earn, spend, adjust, refund), reason, actor, reference. Balance is the sum. |
| powerups | Scope (Ninja, session, dojo), target, multiplier, start and end, creator. |
| rewards and inventory | Digital cosmetics (skins, pets, scenes, titles) and what each Ninja owns. |
| shop_items and orders | Item details, stock, price, source link, order status (placed, handed out, cancelled). |
| achievements, quests, teams, matches | Sensei-created content and Ninja completions and scores. |
| notes and photos | Sensei notes with parent-visible flag. Photos tagged to Ninjas, shown only to those Ninjas' parents, gated by the photo consent flag. |
| alerts | Ninja, device, category, app or domain, screenshot path, status, handled by, action taken. |
| waivers and signatures | Versioned waiver text; parent, version, signed name, timestamp. |
| settings and feature_flags | All tunable values (appendix A); switches for MyStudio and attendance integrations (off). |
| audit_log | Actor, action, target, details, timestamp. |
| roster_imports | File name, row counts, errors, who imported, when. |

## 11. Security and privacy

- Ninja PINs are 4 digits, stored encrypted (not hashed) so Senseis can look them up. Each lookup is audit-logged. PINs are only usable together with picking the Ninja from the roster, on a registered PC, with lockout after 3 failures.
- Parent PINs are 6 digits, globally unique, stored hashed, with rate limiting and lockout after repeated failures. The Director can reset them.
- Row-level security on every table so each role only reads what it should (a parent sees only their own children's data).
- No sensitive data is stored: no payment details, addresses, medical information or government IDs.
- Even so, first names, photos, progress and screenshots are children's personal information under Alberta's private-sector privacy law. The app therefore needs parent waivers and disclosures, restricted access to photos and screenshots, retention limits, and an audit trail. The owner should have a lawyer review the waiver and monitoring disclosure wording. This brief is not legal advice.
- Waivers: on a parent's first sign-in they must read and sign the agreement, media/photo consent, and a monitoring disclosure (activity tracking, active app or site reporting, and screenshots on alerts). Waivers are versioned and re-signed when changed. The Director sees a list of unsigned waivers.
- Photos are only shown for Ninjas whose photo consent is recorded.
- Secrets live only in Vercel and Supabase environment variables and never in the repository. The GitHub repository is private.
- Dependencies are kept current and checked for known vulnerabilities.

## 12. Roster import and integrations

### Excel or CSV import (replaces the CRM for now)

- Columns: Ninja first name, last name or last initial, belt, dojo, default session, parent name(s), photo consent (optional).
- The importer validates rows, detects duplicates, previews the changes and only then commits. Belts must match the list in section 7.
- New Ninjas get a unique 4-digit PIN and their parents a unique 6-digit PIN. The Director can export a printable PIN sheet to hand out in person.
- Re-importing updates belts and activity status without duplicating Ninjas.

### MyStudio and attendance

- Built as optional modules behind feature switches that are off. Nothing connects to them now.
- Attendance shown to parents comes from the app's own check-ins.

### Head Office Impact system

- No integration. Senseis change belts in Impact manually and also trigger the belt-up in this app.

## 13. Phased build plan

Build one phase at a time. Each phase ends with a working, deployed result that the owner can try before the next one starts.

### Phase 0: Setup

- Create the monorepo, private GitHub repository, Vercel project and Supabase project, and store environment variables.
- Set up linting, type checking, tests, migrations and preview deployments.
- Deploy a hello-world page at the Vercel URL.

Done when: the site loads from Vercel and the database is reachable from it.

### Phase 1: Foundation

- Schema, row-level security and seed data (belts, level tables, a demo dojo).
- Staff login, roles and role-based routing.
- Admin tools: dojos, sessions, seat limits, devices, settings.
- Excel import with PIN generation and printable PIN sheet.
- Ninja PIN sign-in with roster picker and lockout.

Done when: the owner can import the real roster and sign in as Ninja, Sensei and Director.

### Phase 2: Core loop (this is what proves the idea)

- Windows agent v1: sign-in window, heartbeats, device registration, IP check, anti-cheat basics, auto-start.
- XP and coin engine with streak tiers, caps and the coin ledger.
- Dojo TV display with PixiJS scenes, live characters, first names and XP gain.
- Ninja portal: character, XP bar, level, battle-pass view.
- Sensei portal: live roster, award or remove XP, power-ups, scene switching, alerts with screenshot, Lock screen button.

Done when: five pilot PCs in one session earn the XP and coins the rules predict, and a Sensei can lock a screen.

### Phase 3: Economy and parents

- Battle-pass tiers and rewards, character and pet customization, inventory.
- Shop with Add Item form, orders, hand-out tracking, Director-only coin adjustments.
- Parent portal with live view, notes, photos, summaries and first-login waivers.
- Reports for the Director: active minutes, check-ins, attendance trends, and a simple list of Ninjas whose activity is dropping.

Done when: a Ninja can earn coins, buy a skin and a physical item, and a parent can see it all.

### Phase 4: Celebration and depth

- Belt-up flow and lobby celebration with queueing, replay and sound.
- Leaderboards per dojo and session.
- Challenges, quests, teams, match days and custom achievements.
- More scenes, animations and seasonal packs.

### Phase 5: Pilot and rollout

- Two-week pilot in one dojo. Review active minutes, anti-cheat flags, reward costs and Ninja feedback, then retune settings.
- Roll out the agent to all desktops in both dojos. Turn on the second dojo display and the lobby TV.
- Confirm backups, keep-alive and screenshot purge jobs are running.

## 14. Setup checklist (Grok Build)

Grok Build is xAI's terminal-based coding agent. xAI's official guide is at docs.x.ai/build and x.ai/cli. Check it before installing, because install details can change.

1. Windows users: xAI's documented installer is a shell command (curl -fsSL https://x.ai/cli/install.sh | bash). Run it from a Linux shell such as WSL (install with: wsl --install, then restart), unless xAI's page lists a native Windows option. If you use WSL, keep the project folder, Git and Node.js inside WSL.
2. Install Git (inside WSL if you use it) and Node.js LTS. VS Code is optional but handy for reviewing code.
3. Start Grok Build by typing grok inside your project folder. On first launch it opens a browser to sign in. Where a browser is not available, an xAI API key can be supplied instead. You may need a qualifying xAI subscription or API credits, so confirm on x.ai/cli.
4. Create a private GitHub repository named cn-retention and sign in to GitHub from the terminal (GitHub CLI) so the agent can push.
5. Create a Supabase account and a free project, choosing a Canadian region if offered.
6. Connect the GitHub repository to your existing Vercel Pro account, and install the Vercel CLI so the agent can deploy. You sign in to each service yourself; never paste passwords or keys into the chat.
7. Create the folder (for example ~/code/cn-retention), put this brief at docs/PROJECT_BRIEF.md, add the rules file from section 15, then run: grok inspect. It lists what Grok discovered in the folder, so confirm your rules file appears. If Grok expects a different file name, rename the rules file accordingly.
8. Run grok and paste the first message from section 15.

## 15. Starting prompts for Grok Build

### First message

```
You are the lead developer for CN Rention. Read docs/PROJECT_BRIEF.md in full before doing anything.
Build exactly what the brief describes. Do not add features that are not in it.
Work one phase at a time, starting with Phase 0 only.
Step 1: reply with a short plan for Phase 0, the files you will create, and anything you need from me (accounts, keys, decisions). Wait for my OK.
Step 2: after I approve, build Phase 0, run the checks, commit in small steps, and deploy to Vercel.
Step 3: tell me exactly how to test it, then stop and wait. Do not start the next phase until I say so.
Rules: never put secrets in the repository, ask before anything destructive, and tell me when something in the brief is unclear instead of guessing.
```

### Suggested rules file for the repository (AGENTS.md)

```
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
```

### Tips for working with a coding agent

- Give it one phase at a time and ask for a plan first. Large single requests produce more mistakes.
- After each phase, ask it to run the tests and explain what it built in plain language.
- Ask it to show you the XP rules, coin ledger and permission rules in plain English so you can check them against the brief.
- If it gets stuck or starts rewriting things you did not ask about, stop it and point back to the relevant section of the brief.

## 16. Assumptions and items to confirm

1. Staff login: Senseis and the Director can see PINs, review screenshots and (Director) add coins. This brief recommends email and password for staff accounts rather than PINs. Confirm.
2. Waiver gating: should a Ninja be blocked from earning XP until a parent signs the waiver? This brief assumes no block, with an unsigned list for the Director. Confirm with your lawyer.
3. On-demand screenshots: screenshots are taken only when an alert fires. A Sensei 'view screen now' option is not included. Confirm if wanted.
4. TV updates use 5-second polling plus realtime for rare events, instead of realtime for everything, to stay within the free plan.
5. Birthdays and weekly champions on the TV: weekly champions are included in later phases. Birthdays are left out because the app does not store dates of birth.
6. Video uploads are deferred; photos only at first.
7. The Windows installer is not code-signed, so Windows may show a warning on first install. This is acceptable for internal deployment on your own PCs.
8. The brief assumes belts can be promoted only by a Sensei. Confirm whether the Director may also promote.
9. If you hold licensed Minecraft or Roblox art files, tell the coding agent where they are and what the license allows. Otherwise the app uses original and CC0 assets.
10. Tool choice: this version of the brief targets Grok Build. The plan itself is tool-neutral, so it can be handed to any coding agent.
11. Code review: whichever agent writes the code, have a developer or a second AI review the security-critical parts (database security rules, PIN handling, the coin ledger, and the Windows agent) before real children's data goes in.

## Appendix A: Settings editable in the admin portal

| Setting | Default |
| --- | --- |
| XP per active minute by tier | 1.0 / 1.5 / 2.0 |
| Minutes to reach tier 2 and tier 3 | 2 and 5 |
| Coins per active minute | 0.1 + (XP rate - 1) x 0.1 (range 0.1 to 0.2) |
| Active minute rule | At least 3 of 6 ten-second buckets active |
| Idle timeout and auto sign-out | Idle stops XP after 60 s; auto sign-out after a set period |
| Daily active-minute cap per Ninja | 120 |
| Levels per belt and base XP formula | 20 levels; 30 + 2 x (n - 1) |
| Belt XP multipliers | x1.0 White to Green, x1.25 Blue to Black, x1.5 bonus tracks |
| Power-up duration, multiplier, limit | 5 minutes, x2, limit per Sensei per session |
| Seat limit per dojo | 15 (maximum 30) |
| Allowed public IPs per dojo | Set at install |
| Flagged domains and keywords | Admin-managed list |
| Screenshot retention | 30 days |
| Minute-level activity retention | 14 days |
| Physical reward levels | 5, 10, 15, 20 |
| Coin value reference | 100 coins = $10 |
| Feature switches | MyStudio off, attendance import off |
