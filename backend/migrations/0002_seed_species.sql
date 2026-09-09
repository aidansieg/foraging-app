INSERT INTO species (common_name, latin_name, season_start_month, season_end_month, substrate_type, baseline_trigger_rules)
VALUES
(
    'Golden Oyster',
    'Pleurotus citrinopileatus',
    4, 10,
    'dead hardwood',
    '{
        "trigger_type": "temp_drop_after_warm_spell",
        "warm_spell_days": 5,
        "warm_temp_f": 65,
        "drop_threshold_f": 15,
        "drop_window_days": 3
    }'::jsonb
),
(
    'Chicken of the Woods',
    'Laetiporus sulphureus',
    7, 10,
    'living or recently dead hardwood (esp. oak)',
    '{
        "trigger_type": "seasonal_window",
        "peak_start_month": 8,
        "peak_end_month": 9,
        "min_recent_rain_inches": 0.5,
        "rain_lookback_days": 14
    }'::jsonb
),
(
    'Morel',
    'Morchella spp.',
    3, 5,
    'soil (often near dead/dying elm, ash)',
    '{
        "trigger_type": "soil_temp_threshold_plus_rain",
        "soil_temp_threshold_f": 50,
        "min_rain_inches": 0.5,
        "rain_lookback_days": 10
    }'::jsonb
),
(
    'Chanterelle',
    'Cantharellus spp.',
    6, 9,
    'soil, mycorrhizal with hardwoods/conifers',
    '{
        "trigger_type": "rain_lag",
        "min_rain_inches": 1.0,
        "lag_days_min": 7,
        "lag_days_max": 14
    }'::jsonb
);
