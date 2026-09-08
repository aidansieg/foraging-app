# ForageCast Backend — Step 1: Scaffolding

## What's here
A minimal Express + TypeScript API with:
- Typed, validated env config (`src/config/env.ts`)
- A shared Postgres connection pool (`src/db/pool.ts`)
- A `/health` endpoint that pings the DB to confirm everything's wired up
- Dev tooling (`ts-node-dev`) that auto-restarts on file changes

Nothing product-specific yet — no `species`/`spots`/`finds` tables or routes.
That's Step 2. This step is just: "does the server boot and talk to Postgres."

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure you have Postgres running locally. Quickest way if you don't
   already have it:
   ```
   brew install postgresql@16
   brew services start postgresql@16
   createdb forecast_mushroom
   ```
   Then create a dedicated user (don't use the Postgres superuser for app traffic):
   ```
   psql forecast_mushroom -c "CREATE USER forecast_user WITH PASSWORD 'forecast_pass';"
   psql forecast_mushroom -c "GRANT ALL PRIVILEGES ON DATABASE forecast_mushroom TO forecast_user;"
   ```

3. Copy the example env file and adjust if your local Postgres setup differs:
   ```
   cp .env.example .env
   ```

4. Run in dev mode:
   ```
   npm run dev
   ```

5. Verify it's alive:
   ```
   curl http://localhost:4000/health
   ```
   Expect: `{"status":"ok","db":"connected"}`

   If you get `db: "unreachable"`, double check your `DATABASE_URL` in `.env`
   and that Postgres is actually running (`brew services list`).

## Why these specific choices (for when this comes up in an interview)

- **A connection pool, not a single client**: `pg.Pool` reuses connections
  across requests instead of opening/closing a TCP connection to Postgres
  per request — cheap in dev, matters a lot under real concurrent load.
- **`requireEnv()` fails at boot, not at first use**: if `DATABASE_URL` is
  missing, the app refuses to start with a clear error, instead of booting
  fine and then throwing a confusing error the first time a route needs it.
- **`/health` actually queries the DB**: a health check that only checks
  "is the Node process running" gives false confidence — this one proves
  the DB connection specifically is good, which is what actually breaks in
  production deployments (bad connection string, DB not reachable from the
  new environment, etc).