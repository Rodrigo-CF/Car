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

When `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` are present, the API automatically uses Supabase.
Otherwise it falls back to in-memory mode.

### Local verification

```bash
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_ANON_KEY="<publishable-key>"
export SUPABASE_SERVICE_ROLE_KEY="<secret-key>"
export CREATOR_EMAIL="you@example.com"
npm start
```

The startup log should show: `(... supabase backend)`.

### Vercel

This repo includes:
- [`vercel.json`](/Users/rodrigocf/Documents/Car/vercel.json): rewrites `/v1/*` and `/health` to API handler
- [`api/index.js`](/Users/rodrigocf/Documents/Car/api/index.js): serverless adapter for the Node app

In Vercel Project Settings -> Environment Variables, add the same four variables above.

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
