import { parseBurnairWindPayload } from "./burnair-wind.js";
import { parseWindsMobiStations } from "./winds-mobi.js";

const CACHE_MS = 5 * 60 * 1000;
const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
const finite = (value) => typeof value === "number" && Number.isFinite(value) ? value : null;
export const formatWindTime = (epoch, options = {}) => new Intl.DateTimeFormat("de-CH", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich", ...options }).format(new Date(epoch * 1000));
export const readingValue = (value) => value === null || value === undefined ? "–" : Math.round(value);

function normalizeReading(reading) {
  const epoch = finite(reading?.epoch);
  if (!epoch || epoch <= 0) return null;
  const rawDirection = finite(reading.direction);
  const direction = rawDirection === null ? null : ((rawDirection % 360) + 360) % 360;
  const average = finite(reading.average);
  const gust = finite(reading.gust);
  return { epoch, average: average !== null && average >= 0 ? average : null, gust: gust !== null && gust >= 0 ? gust : null, direction, directionLabel: direction === null ? "–" : COMPASS[Math.round(direction / 22.5) % 16], temperature: finite(reading.temperature) };
}

function observations(readings) {
  return [...new Map(readings.map(normalizeReading).filter(Boolean).sort((a, b) => b.epoch - a.epoch).map((reading) => [reading.epoch, reading])).values()].slice(0, 4);
}

// The public feed is separate from EigAir's authenticated, session-scoped POST /api/live-wind.
export function parseThermalbaseFeed(payload, roster) {
  if (payload?.apiVersion !== 1 || !Array.isArray(payload.stations) || !Number.isFinite(Date.parse(payload.generatedAt))) throw new Error("Ungültige ThermalBase-Antwort");
  const byId = new Map(payload.stations.map((station) => [station?.id, station]));
  const staleAfterMs = finite(payload.staleAfterSeconds) > 0 ? payload.staleAfterSeconds * 1000 : 30 * 60 * 1000;
  return roster.map((station) => {
    const item = byId.get(station.id);
    const rows = [item?.latest, ...(Array.isArray(item?.observations) ? item.observations : [])].filter(Boolean);
    const readings = observations(rows.map((row) => ({ epoch: Date.parse(row.observedAt) / 1000, average: row.averageKmh, gust: row.gustKmh, direction: row.directionDeg, temperature: row.temperatureC })));
    return { id: station.id, readings, source: typeof item?.source === "string" ? item.source : "ThermalBase", provider: typeof item?.provider === "string" ? item.provider : null, staleAfterMs, unavailable: !readings.length, degraded: payload.collection?.state === "degraded" || item?.unavailable === true };
  });
}

export function buildWindStations(roster, feed, now = Date.now()) {
  const byId = new Map((feed.entries || []).map((entry) => [entry.id, entry]));
  return roster.map((station) => {
    const entry = byId.get(station.id);
    const values = observations(entry?.readings || []);
    const latest = values[0];
    const hasMeasurement = latest && [latest.average, latest.gust, latest.direction].some((value) => value !== null);
    const loading = feed.status === "loading" || feed.status === "refreshing";
    const stale = !latest || now - latest.epoch * 1000 > (entry?.staleAfterMs || 30 * 60 * 1000);
    const degraded = Boolean(entry?.unavailable || entry?.degraded || feed.status === "error");
    const status = !hasMeasurement || stale || degraded ? "watch" : latest.average >= 22 ? "strong" : latest.average >= 16 ? "watch" : "good";
    const statusLabel = !hasMeasurement ? loading ? "Wird geladen" : "Nicht verfügbar" : degraded ? "Abruf gestört" : stale ? "Veraltet" : status === "strong" ? "Stark" : status === "watch" ? "Beobachten" : "Live";
    const source = entry?.source || (feed.mode === "thermalbase" ? "ThermalBase" : station.source);
    const provider = entry?.provider || (feed.mode === "thermalbase" ? null : station.provider);
    return { ...station, average: latest?.average ?? null, gust: latest?.gust ?? null, direction: latest?.direction ?? null, directionLabel: latest?.directionLabel ?? "–", temperature: latest?.temperature ?? null,
      observedAt: latest?.epoch ?? null, values: values.map((reading) => ({ ...reading, time: formatWindTime(reading.epoch) })), source, provider,
      attribution: [source, provider && provider !== source ? provider : null].filter(Boolean).join(" · "),
      stale, degraded, status, statusLabel, liveState: hasMeasurement ? "ready" : loading ? "loading" : "unavailable",
      trend: !hasMeasurement ? loading ? "Livewerte werden geladen…" : "Keine Messwerte verfügbar" : degraded ? "Letzter Messwert · Abruf gestört" : stale ? "Messwert veraltet" : "Aktuelle Messwerte" };
  });
}

export function createWindFeedClient({ roster, url = "", fetchImpl = globalThis.fetch, storage, now = Date.now, timeoutMs = 10000 }) {
  const mode = url ? "thermalbase" : "prototype";
  const cacheKey = `jungfrau-taechi.wind-feed.v1:${url || mode}:${roster.map((s) => s.id).join(",")}`;
  let memory = null;
  let inFlight = null;
  const read = () => {
    try {
      const cached = memory || JSON.parse(storage?.getItem(cacheKey) || "null");
      if (cached?.mode === mode && Number.isFinite(cached.fetchedAt) && ["ready", "partial", "error"].includes(cached.status) && Array.isArray(cached.entries) && cached.entries.every((entry) => entry && typeof entry.id === "string" && Array.isArray(entry.readings))) return cached;
    } catch { /* Storage is optional. */ }
    return null;
  };
  const snapshot = () => {
    const cached = read();
    const fresh = cached && now() >= cached.fetchedAt && now() - cached.fetchedAt < CACHE_MS;
    return { mode, entries: [], fetchedAt: null, ...cached, fromCache: Boolean(cached), status: fresh ? cached.status : cached ? "refreshing" : "loading" };
  };
  async function json(endpoint) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(endpoint, { headers: { Accept: "application/json" }, credentials: "omit", signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timer); }
  }
  async function refresh() {
    const cached = read();
    let entries;
    let failed = false;
    if (url) {
      try { entries = parseThermalbaseFeed(await json(url), roster); }
      catch { failed = true; entries = roster.map((s) => ({ ...(cached?.entries.find((e) => e.id === s.id) || {}), id: s.id, unavailable: true })); }
    } else {
      const winds = roster.filter((s) => s.source === "winds.mobi");
      const endpoint = new URL("https://winds.mobi/api/2.3/stations/");
      winds.forEach((s) => endpoint.searchParams.append("ids", s.id));
      endpoint.searchParams.set("limit", String(winds.length));
      const tasks = [];
      if (winds.length) tasks.push({ ids: winds.map((s) => s.id), load: async () => {
        const rows = parseWindsMobiStations(await json(endpoint));
        return winds.map((station) => { const row = rows.find((r) => r.id === station.id); return { id: station.id, readings: row ? observations([row]) : [], source: "winds.mobi", provider: row?.provider || station.provider, staleAfterMs: 30 * 60 * 1000, unavailable: !row }; });
      } });
      for (const station of roster.filter((s) => s.source === "burnair")) tasks.push({ ids: [station.id], load: async () => {
        const readings = observations(parseBurnairWindPayload(await json(station.apiUrl), station.id));
        return [{ id: station.id, readings, source: "burnair", provider: "burnair", staleAfterMs: 10 * 60 * 1000, unavailable: !readings.length }];
      } });
      const results = await Promise.allSettled(tasks.map((task) => task.load()));
      entries = results.flatMap((result, index) => {
        if (result.status === "fulfilled") return result.value;
        failed = true;
        return tasks[index].ids.map((id) => ({ ...(cached?.entries.find((e) => e.id === id) || {}), id, unavailable: true }));
      });
    }
    // Preserve real last-known observations when a provider omits a station.
    entries = entries.map((entry) => entry.unavailable && !entry.readings?.length ? { ...entry, readings: cached?.entries.find((old) => old.id === entry.id)?.readings || [] } : entry);
    const anyValues = entries.some((entry) => entry.readings?.length);
    const partial = failed || entries.some((entry) => entry.unavailable || entry.degraded);
    const result = { mode, entries, fetchedAt: now(), fromCache: false, status: !anyValues ? "error" : partial ? "partial" : "ready" };
    memory = result;
    try { storage?.setItem(cacheKey, JSON.stringify(result)); } catch { /* Storage is optional. */ }
    return result;
  }
  return { snapshot, load() {
    const cached = snapshot();
    if (cached.status !== "loading" && cached.status !== "refreshing") return Promise.resolve(cached);
    if (!inFlight) inFlight = refresh().finally(() => { inFlight = null; });
    return inFlight;
  } };
}
