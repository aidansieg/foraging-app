import { config } from "../config/env";

const NOAA_BASE_URL = "https://api.weather.gov";

const NOAA_HEADERS = {
  "User-Agent": config.noaaUserAgent,
  Accept: "application/geo+json",
};

const FETCH_TIMEOUT_MS = 10_000;

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: NOAA_HEADERS,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`NOAA request failed: ${response.status} ${response.statusText} (${url})`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

interface StationInfo {
  id: string;
  name: string;
}

async function getObservationStationsUrl(lat: number, lon: number): Promise<string> {
  const pointUrl = `${NOAA_BASE_URL}/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
  const pointData = await fetchJson<{
    properties: { observationStations: string };
  }>(pointUrl);
  return pointData.properties.observationStations;
}

async function getNearestStation(lat: number, lon: number): Promise<StationInfo> {
  const stationsUrl = await getObservationStationsUrl(lat, lon);
  const stationsData = await fetchJson<{
    features: Array<{ properties: { stationIdentifier: string; name: string } }>;
  }>(stationsUrl);

  const nearest = stationsData.features[0];
  if (!nearest) {
    throw new Error(`No observation stations found near (${lat}, ${lon})`);
  }

  return { id: nearest.properties.stationIdentifier, name: nearest.properties.name };
}

interface RawObservation {
  properties: {
    timestamp: string;
    temperature: { value: number | null; unitCode: string };
    precipitationLastHour: { value: number | null; unitCode: string };
  };
}

async function getRecentObservations(
  stationId: string,
  days: number
): Promise<RawObservation[]> {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);

  const url = `${NOAA_BASE_URL}/stations/${stationId}/observations?start=${start.toISOString()}&end=${end.toISOString()}`;
  const data = await fetchJson<{ features: RawObservation[] }>(url);
  return data.features;
}

export interface DailyWeatherSummary {
  date: string;
  maxTempF: number | null;
  minTempF: number | null;
  precipIn: number | null;
  tempReadingCount: number;
  precipReadingCount: number;
}

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

function mmToInches(mm: number): number {
  return mm / 25.4;
}

function aggregateToDailySummaries(observations: RawObservation[]): DailyWeatherSummary[] {
  const byDate = new Map<
    string,
    { temps: number[]; precips: number[] }
  >();

  for (const obs of observations) {
    const date = obs.properties.timestamp.slice(0, 10);
    if (!byDate.has(date)) {
      byDate.set(date, { temps: [], precips: [] });
    }
    const bucket = byDate.get(date)!;

    const tempC = obs.properties.temperature?.value;
    if (typeof tempC === "number") {
      bucket.temps.push(celsiusToFahrenheit(tempC));
    }

    const precipMm = obs.properties.precipitationLastHour?.value;
    if (typeof precipMm === "number") {
      bucket.precips.push(mmToInches(precipMm));
    }
  }

  const summaries: DailyWeatherSummary[] = [];
  for (const [date, { temps, precips }] of byDate.entries()) {
    summaries.push({
      date,
      maxTempF: temps.length > 0 ? Math.max(...temps) : null,
      minTempF: temps.length > 0 ? Math.min(...temps) : null,
      precipIn: precips.length > 0 ? precips.reduce((a, b) => a + b, 0) : null,
      tempReadingCount: temps.length,
      precipReadingCount: precips.length,
    });
  }

  return summaries.sort((a, b) => a.date.localeCompare(b.date));
}

export interface WeatherSnapshot {
  stationId: string;
  stationName: string;
  fetchedAt: string;
  days: DailyWeatherSummary[];
}

export async function getWeatherSnapshotForSpot(
  lat: number,
  lon: number,
  days = 14
): Promise<WeatherSnapshot> {
  const station = await getNearestStation(lat, lon);
  const observations = await getRecentObservations(station.id, days);
  const dailySummaries = aggregateToDailySummaries(observations);

  return {
    stationId: station.id,
    stationName: station.name,
    fetchedAt: new Date().toISOString(),
    days: dailySummaries,
  };
}
