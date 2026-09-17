import { useEffect, useState } from "react";
import { windStationRoster } from "./data.js";
import { buildWindStations, createWindFeedClient } from "./wind-feed.js";

export const thermalbaseWeatherUrl = (import.meta.env.VITE_THERMALBASE_WEATHER_URL || "").trim();
export const WIND_FEED_POLL_MS = 5 * 60 * 1000;
let storage;
try { storage = globalThis.localStorage; } catch { /* Private browsing may block storage. */ }
const client = createWindFeedClient({ roster: windStationRoster, url: thermalbaseWeatherUrl, storage });

export function useWindFeed() {
  const [feed, setFeed] = useState(client.snapshot);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let active = true;
    let pollTimer;
    const refresh = () => client.load()
      .then((next) => { if (active) { setFeed(next); setNow(Date.now()); } })
      .catch(() => undefined)
      .finally(() => { if (active) pollTimer = setTimeout(refresh, WIND_FEED_POLL_MS); });
    refresh();
    // Refresh the shared feed while the page remains open. The feed client keeps
    // its five-minute cache and coalesces overlapping requests.
    // Age labels must advance while the page stays open independently of polling.
    const ageTimer = setInterval(() => setNow(Date.now()), 60000);
    return () => { active = false; clearTimeout(pollTimer); clearInterval(ageTimer); };
  }, []);
  return { ...feed, stations: buildWindStations(windStationRoster, feed, now) };
}
