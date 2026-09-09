# Shared wind feed: club-site preparation and EigAir handover

Status: club frontend implemented, 9 September 2026. ThermalBase backend changes and activation are pending. This document refines the client contract in [Meteo data architecture](./meteo-data-architecture.md); the server fetch, authorization and retention requirements remain in [ThermalBase wind history requirements](./thermalbase-wind-history-requirements.md).

## Club-site behavior

The primary desktop grid has two columns and three rows: Grindelwald Grund, Grindelwald First, Schmidigen-Bidmeren, Itramen, Männlichen, Russisprung. Mobile stacks the cards. The other 24 stations remain behind the region expand control. Grund is selected initially.

- `src/data.js` exports `windStationRoster`: stable IDs, primary/region membership, order, coordinates and display metadata. Ground station `fanet-BA-4` is outside the 29 winds.mobi IDs.
- `src/WindStationCard.jsx` renders every station using the same presentation. Provider attribution, observation time, current wind and up to four actual observations are shared across sources. The detail panel uses the same normalized values. A single current value is never repeated to fabricate history.
- `src/wind-feed.js` owns requests, parsing, normalization, a five-minute browser cache, in-flight request coalescing, a ten-second request deadline and per-station failure handling. A failed or missing station retains its last-known observations and original timestamps with an explicit degraded state. An empty station shows unavailable values, never mock readings.
- `src/useWindFeed.js` loads the feed on page mount. A local timer ages observations once per minute but never fetches providers. Re-entering the page after cache expiry triggers the next request. Failed attempts also receive the five-minute client cooldown. Server refresh decisions must use server-side successful-fetch state, not this browser cache timestamp.

Until a public feed is configured, the prototype uses one winds.mobi batch and one burnair request, concurrently. Selecting a card or expanding the list does not fetch data. Existing provider-use requirements continue to apply.

## What exists in EigAir today

Inspected the local ThermalBase-v2 implementation on 9 September 2026:

- `api/live-wind.ts`: authenticated **POST** `/api/live-wind`, confirmed-session and membership/participant checks, selected takeoff/landing sites, nearby station lookup, Vercel runtime cache, request coalescing and last-known fallback.
- `api/_winds-mobi.ts`: provider URL construction and normalization to `observedAt`, `windAverageKmh`, `windGustKmh`, `windDirectionDeg`, altitude, coordinates and attribution.
- `apps/mobile/src/instructor/liveWind.ts`: obtains the signed-in user's bearer token, retries once after a 401 with session refresh, and validates the EigAir-specific response (`landing`, `takeoff`, `nearby`, `nearbyStatus`, etc.).

The club site must not call that authenticated endpoint or ship a school user's token. No public feed was found in this implementation. Do not point the site configuration at `/api/live-wind`.

## Backend implementation handover

1. Extract provider access and cache/refresh handling from `api/live-wind.ts` into a provider-neutral service within ThermalBase. Keep session, school and participant authorization in the existing handler. Implement the daylight gate, refresh coalescing and seven-day read model specified in the architecture handover.
2. Make the existing EigAir handler call that service and translate its result back into the current EigAir response, preserving client compatibility. Initially map `windAverageKmh` to shared `averageKmh`, `windGustKmh` to `gustKmh`, and `windDirectionDeg` to `directionDeg`. Preserve originating provider attribution separately from the aggregation service.
3. Add a separate unauthenticated **GET** public feed for the fixed `jungfrau` allowlist, proposed route `/api/public/weather/jungfrau?observations=4`. Resolve the allowlist server-side. Do not accept arbitrary upstream station IDs or expose session/tenant data. Both endpoints must share the same normalized service and cache.
4. Publish the 30 configured station IDs as the feed's stable public IDs, matching `windStationRoster`, even if the backend registry uses UUIDs. For Grund, retain `fanet-BA-4` as the public alias when its approved provider adapter changes. A backend station mapping, rather than a frontend parser rewrite, should handle that switch.
5. Add appropriate public caching, throttling, and CORS for the club's actual deployment origin. Permit the local origin against Stage for validation. No browser credentials are required. Keep every secret and provider credential on the server.
6. Validate the fixed public feed on Stage, including partial provider failure, no available observations, fresh cache, concurrent requests, nighttime reads, unchanged observation timestamps and a changed underlying provider. Compare EigAir and public-feed values for the same station.

No ThermalBase/EigAir repository changes were made as part of this frontend preparation.

## Public response contract consumed by the site

```json
{
  "apiVersion": 1,
  "generatedAt": "2026-09-09T12:00:00Z",
  "staleAfterSeconds": 1800,
  "collection": { "state": "active" },
  "stations": [
    {
      "id": "fanet-BA-4",
      "source": "burnair",
      "provider": "burnair",
      "unavailable": false,
      "latest": {
        "observedAt": "2026-09-09T11:58:00Z",
        "averageKmh": 8,
        "gustKmh": 14,
        "directionDeg": 225,
        "temperatureC": 18
      },
      "observations": []
    }
  ]
}
```

`apiVersion`, a valid ISO `generatedAt`, and the station array are required. All observation timestamps are ISO UTC; measurements are finite JSON numbers or null. Speeds are km/h, direction is where wind comes from in degrees, and temperature is Celsius. `source` identifies the upstream feed and `provider` its originating operator. If provenance is omitted, the site credits ThermalBase without guessing a provider.

`latest` is nullable. `observations` uses the same shape, newest first, and contains up to four available observations **including latest**, matching the four cells in the card. The client also tolerates duplicated latest entries and unordered history, deduplicates by timestamp, and keeps only the newest four. This makes the earlier handover's “four observations” wording explicit; it does not mean latest plus four additional cells.

Mark a provider failure using `unavailable: true` on that station while returning its last-known values. `collection.state: "degraded"` marks a feed-wide refresh problem; `paused` means normal daylight suspension and must not invent fresh measurements. Omitted stations become unavailable; unknown IDs do not enter the grid. Freshness is computed from observation time, independently of `generatedAt` or when the client downloaded the feed.

## Activation

Leave `VITE_THERMALBASE_WEATHER_URL` empty for the current prototype adapters. Once the public endpoint exists, set this build-time variable to its full public URL, including `?observations=4`. Local development uses `.env.local`; restart Vite after changing it. Validate against Stage first. GitHub Pages reads the corresponding repository/environment Actions variable at build time. Rebuilding is required to change sources.

With a URL configured, the client makes one credential-free request to that URL and **never falls back to direct burnair or winds.mobi calls**, including on 401, timeout, invalid JSON, or invalid contract. Do not enable the variable until the backend feed is verified. A wrong URL will display unavailable data rather than silently bypassing the backend.

Before activation, retain the provider approvals required by the architecture handover. Add the endpoint URL only after the backend is ready; no placeholder URL is enabled by this change.
