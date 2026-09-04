const API_URL = "https://winds.mobi/api/2.3/stations/";
const CACHE_KEY = "jungfrau-taechi.winds-mobi.latest.v1";
const CACHE_TTL_MS = 5 * 60 * 1000;
const COMPASS_LABELS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
let requestInFlight = null;

const numberOrNull = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const sameStationIds = (left, right) => left.length === right.length && left.every((id) => right.includes(id));

export function parseWindsMobiStations(payload) {
  if (!Array.isArray(payload)) throw new Error("Ungültige winds.mobi-Antwort");
  return payload
    .map((station) => {
      const latest = station?.last;
      const epoch = numberOrNull(latest?._id);
      if (!station?._id || !epoch || epoch <= 0) return null;
      const direction = numberOrNull(latest["w-dir"]);
      return {
        id: station._id,
        epoch,
        average: numberOrNull(latest["w-avg"]),
        gust: numberOrNull(latest["w-max"]),
        direction,
        directionLabel: direction === null ? "–" : COMPASS_LABELS[Math.round(direction / 22.5) % COMPASS_LABELS.length],
        temperature: numberOrNull(latest.temp),
        provider: station["pv-name"] || null,
      };
    })
    .filter(Boolean);
}

export function isWindsMobiReadingStale(reading, now = Date.now(), staleAfterMs = 30 * 60 * 1000) {
  return !reading || now - reading.epoch * 1000 > staleAfterMs;
}

export function readWindsMobiCache(stationIds, now = Date.now()) {
  if (typeof window === "undefined") return null;
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "null");
    if (!cached || !Number.isFinite(cached.fetchedAt) || !Array.isArray(cached.stationIds) || !Array.isArray(cached.stations) || !sameStationIds(cached.stationIds, stationIds)) return null;
    return { ...cached, fresh: now - cached.fetchedAt < CACHE_TTL_MS };
  } catch {
    return null;
  }
}

const writeWindsMobiCache = (feed) => {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(CACHE_KEY, JSON.stringify(feed)); } catch { /* Browser storage is an optional prototype cache. */ }
};

export async function loadWindsMobiLatest(stationIds, fetchImpl = fetch) {
  const cached = readWindsMobiCache(stationIds);
  if (cached?.fresh) return { ...cached, fromCache: true };
  if (requestInFlight) return requestInFlight;

  const url = new URL(API_URL);
  stationIds.forEach((id) => url.searchParams.append("ids", id));
  requestInFlight = fetchImpl(url, { headers: { Accept: "application/json" } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((payload) => {
      const feed = { fetchedAt: Date.now(), stationIds, stations: parseWindsMobiStations(payload) };
      writeWindsMobiCache(feed);
      return { ...feed, fromCache: false };
    })
    .finally(() => { requestInFlight = null; });
  return requestInFlight;
}
