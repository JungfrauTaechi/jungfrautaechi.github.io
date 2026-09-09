import { useEffect, useState } from "react";
import { windStationRoster } from "./data.js";
import { buildWindStations, createWindFeedClient } from "./wind-feed.js";

export const thermalbaseWeatherUrl = (import.meta.env.VITE_THERMALBASE_WEATHER_URL || "").trim();
let storage;
try { storage = globalThis.localStorage; } catch { /* Private browsing may block storage. */ }
const client = createWindFeedClient({ roster: windStationRoster, url: thermalbaseWeatherUrl, storage });

export function useWindFeed() {
  const [feed, setFeed] = useState(client.snapshot);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let active = true;
    client.load().then((next) => { if (active) { setFeed(next); setNow(Date.now()); } });
    // Age labels must advance while the page stays open; this does not poll providers.
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return { ...feed, stations: buildWindStations(windStationRoster, feed, now) };
}
