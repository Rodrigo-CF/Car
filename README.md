# Peru Driving Prep MVP Mock

Runnable mock implementation of the requested MVP update with independent scoring pipelines:

- Theory score pipeline (`exam_attempts`)
- Simulation score pipeline (`sim_sessions`)
- Two separate leaderboards:
  - `GET /v1/leaderboard/theory`
  - `GET /v1/leaderboard/simulation`
- Profile fields:
  - `bestTheoryScore`
  - `bestSimulationScore`

No combined score or blended ranking is implemented.

## Run

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase + Vercel Setup (persistent mode)

By default, the app runs in-memory.  
To enable persistent storage (required for Vercel production), configure Supabase:

1. In Supabase SQL Editor, run:
   - [`data/supabase/schema.sql`](/Users/rodrigocf/Documents/Car/data/supabase/schema.sql)
2. Set environment variables (local shell and Vercel project settings):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CREATOR_EMAIL` (optional but recommended; only this email can publish global maps)
   - `SIM_ACTIVE_TTL_SEC` (optional; default `900` = 15 minutes)
   - `SIM_CLEANUP_MIN_INTERVAL_SEC` (optional; default `60` = throttles cleanup in request path)
   - `SIM_KEEPALIVE_INTERVAL_SEC` (optional; default `30`)
   - `SIM_INPUT_IDLE_TIMEOUT_SEC` (optional; default `900` = 15 minutes)
   - `MULTIPLAYER_PEER_TTL_SEC` (optional; default `30`)
   - `MULTIPLAYER_COLLISION_STALE_SEC` (optional; default `10`)
   - `MULTIPLAYER_TAB_HIDDEN_AFK_SEC` (optional; default `10`)
   - `MULTIPLAYER_INPUT_IDLE_AFK_SEC` (optional; default `180`)

When `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are present, the API automatically uses Supabase.
Otherwise it falls back to in-memory mode.

### Local verification

```bash
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_ANON_KEY="<publishable-key>"
export SUPABASE_SERVICE_ROLE_KEY="<secret-key>"
export CREATOR_EMAIL="you@example.com"
export SIM_ACTIVE_TTL_SEC="900"
export SIM_CLEANUP_MIN_INTERVAL_SEC="60"
export SIM_KEEPALIVE_INTERVAL_SEC="30"
export SIM_INPUT_IDLE_TIMEOUT_SEC="900"
export MULTIPLAYER_PEER_TTL_SEC="30"
export MULTIPLAYER_COLLISION_STALE_SEC="10"
export MULTIPLAYER_TAB_HIDDEN_AFK_SEC="10"
export MULTIPLAYER_INPUT_IDLE_AFK_SEC="180"
npm start
```

The startup log should show: `(... supabase backend)`.

### Vercel

This repo includes:
- [`vercel.json`](/Users/rodrigocf/Documents/Car/vercel.json): rewrites `/v1/*` and `/health` to API handler
- [`api/index.js`](/Users/rodrigocf/Documents/Car/api/index.js): serverless adapter for the Node app

In Vercel Project Settings -> Environment Variables, add the same variables listed above.

### Supabase Cron (recommended cleanup scheduler)

Use Supabase cron for periodic stale-session cleanup (instead of Vercel cron):

```sql
select cron.schedule(
  'cleanup-sim-active-every-30m',
  '*/30 * * * *',
  $$ select cleanup_stale_sim_active_sessions(15); $$
);
```

If you need to remove it later:

```sql
select cron.unschedule('cleanup-sim-active-every-30m');
```

### Active simulation session lifecycle

`sim_active_sessions` now enforces one active row per user and supports stale cleanup:

- `last_seen_at` heartbeat timestamp
- keepalive is sent directly from browser to Supabase RPC (`sim_session_keepalive`) when realtime config is available
- unique active session per user (`uq_sim_active_sessions_user_id`)
- stale rows auto-cleaned by API logic (throttled, mainly on `start`) using `SIM_ACTIVE_TTL_SEC`
- client keepalive interval configurable by `SIM_KEEPALIVE_INTERVAL_SEC` (default 30s)
- simulation auto-abandons after `SIM_INPUT_IDLE_TIMEOUT_SEC` with no simulator keyboard input
- multiplayer peer presence configurable by:
  - `MULTIPLAYER_PEER_TTL_SEC` (hide peer after stale timeout)
  - `MULTIPLAYER_COLLISION_STALE_SEC` (peer still visible but non-solid / AFK after this)
  - `MULTIPLAYER_TAB_HIDDEN_AFK_SEC` (AFK when browser tab stays hidden)
  - `MULTIPLAYER_INPUT_IDLE_AFK_SEC` (AFK when no simulator input)
- manual cleanup endpoint for creator:
  - `POST /v1/admin/cleanup/sim-active` with optional body `{ "ttl_sec": 900 }`

## Keyboard controls (simulation)

- `W/S`: accelerate and brake
- `A/D`: steer
- `Space`: handbrake
- `Q/E`: left/right signal
- `C`: switch first/third camera mode
- `R`: reset to route start pose
- `P`: validate parallel parking rule
- `O`: validate diagonal parking rule

## Test

```bash
npm test
```

Tests cover:

- No combined score fields in API responses
- Theory leaderboard updates only after theory submit
- Simulation leaderboard updates only after simulation finish
- Independent ranking order logic
- Cross-impact protection between theory and simulation rankings
- Independent profile best scores
