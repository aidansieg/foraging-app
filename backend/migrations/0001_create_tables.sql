CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               TEXT NOT NULL UNIQUE,
    password_hash       TEXT NOT NULL,
    plan                TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
    stripe_customer_id  TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE species (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    common_name             TEXT NOT NULL,
    latin_name              TEXT NOT NULL,
    season_start_month      SMALLINT NOT NULL CHECK (season_start_month BETWEEN 1 AND 12),
    season_end_month        SMALLINT NOT NULL CHECK (season_end_month BETWEEN 1 AND 12),
    substrate_type          TEXT NOT NULL,
    baseline_trigger_rules  JSONB NOT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE spots (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label       TEXT NOT NULL,
    lat         DOUBLE PRECISION NOT NULL,
    lon         DOUBLE PRECISION NOT NULL,
    notes       TEXT,
    is_private  BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE finds (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    spot_id          UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    species_id       UUID NOT NULL REFERENCES species(id) ON DELETE RESTRICT,
    date_found       DATE NOT NULL,
    yield_estimate   NUMERIC,
    photo_url        TEXT,
    notes            TEXT,
    weather_snapshot JSONB,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_spots_user_id ON spots(user_id);
CREATE INDEX idx_finds_user_id ON finds(user_id);
CREATE INDEX idx_finds_spot_id ON finds(spot_id);
CREATE INDEX idx_finds_species_id ON finds(species_id);
