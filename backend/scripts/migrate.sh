#!/usr/bin/env bash
# Runs every .sql file in migrations/ in filename order, using
# DATABASE_URL from .env. No migration-tracking table yet - at 2 files,
# that's more machinery than value. We'll add tracking (or switch to a
# real migration tool) before this becomes a problem, once there are
# enough migrations that re-running them all from scratch is annoying.

set -euo pipefail

# Load .env into this script's environment. set -a means every variable
# defined from here until `set +a` gets auto-exported, so DATABASE_URL
# becomes available to the psql calls below.
set -a
source .env
set +a

for file in migrations/*.sql; do
    echo "Applying $file..."
    psql "$DATABASE_URL" -f "$file"
done

echo "All migrations applied."