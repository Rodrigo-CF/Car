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
