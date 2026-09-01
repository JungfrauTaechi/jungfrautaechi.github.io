# Meteo measurement history architecture

Status: architecture companion, proposed for review, 1 September 2026. Runtime defaults, compliance gates and acceptance criteria are authoritative in [Thermalbase on-demand winds.mobi integration — developer handover](./thermalbase-wind-history-requirements.md).

## Decision

Thermalbase owns provider access and normalization. `winds.mobi` is the first provider, not the client-facing API. Its history endpoint already supplies up to seven days, which is sufficient for this product. Thermalbase therefore fetches only when a user requests a stale feed, stores a rolling seven-day normalized read model, and serves EigAir and the public Jungfrau-Tächi meteo page through separate, controlled API surfaces.

The public website never calls `winds.mobi` or Supabase directly.

## Webcam boundary

Webcams remain a frontend-only integration and do not pass through Thermalbase. The club site loads five selected public panorama images directly from the Jungfraubahnen/Roundshot image endpoints: Grindelwald-First, Eigergletscher, Männlichen, Kleine Scheidegg and Grindelwald Terminal.

- Do not download, proxy, persist, crop or otherwise alter the images.
- Show visible `© Jungfraubahnen · Roundshot` attribution.
- Link every image to its official interactive webcam.
- Keep the images lazy-loaded and refresh them only after an explicit visitor action.
- Treat webcam availability and timestamps as informational; they are not a flight-safety data source.

This follows the [Jungfraubahnen website usage conditions](https://www.jungfrau.ch/de-ch/anb/), which permit publication of images in connection with tourist offerings while requiring original, unmodified use, and the separate [media usage terms](https://www.jungfrau.ch/de-ch/unternehmen/medien/bilder/nutzungsbestimmungen/). Recheck these conditions if ownership, monetization or the image endpoints change.

## System shape

```text
Authenticated EigAir API or public Jungfrau feed request
    → Thermalbase cache-aside read service
        → return cache/Postgres when fresh or outside civil daylight
        → when stale and active, acquire one refresh lease
            → winds.mobi latest batch or bounded per-station history requests
            → normalize and upsert a rolling seven-day Postgres read model
            → update/invalidate server cache after commit
```

No background job fetches winds.mobi. Thermalbase's existing Vercel control plane owns the adapter; do not create a second provider implementation in an Edge Function.

## Fetch contract

1. Start provider work only when a user requests an allowed feed/site and its last successful fetch is older than five minutes.
2. Make no provider request outside civil daylight; return last-known data and the next active-window time.
3. Load only enabled, explicitly configured stations.
4. Use the batched endpoint for latest-only responses. Use the per-station history endpoint only where recent values are requested, with bounded concurrency and the shortest useful duration.
5. Preserve the identifiable Thermalbase/EigAir User-Agent and provider attribution.
6. Normalize units to kilometres per hour, degrees and metres.
7. Upsert by `(station_id, observed_at)`. Repeated provider values become no-op writes.
8. Keep `observed_at` from the provider and a separate `collected_at` timestamp from Thermalbase.
9. Retain no more than seven days. Store timestamps in UTC and render them in `Europe/Zurich`.
10. On provider failure, retain last-known observations and expose their age. Never manufacture a new observation from stale data.

A short database-backed lease or advisory lock coalesces simultaneous user requests. The provider response is committed to Postgres before the cache changes. Station observation age is not used to decide whether another provider fetch is due.

## Proposed data model

### `weather_stations`

Global registry for external stations. Weather observations are shared environmental data, not school-owned records.

- `id uuid primary key`
- `provider text not null`
- `provider_station_id text not null`
- `name text not null`
- `latitude numeric not null`
- `longitude numeric not null`
- `altitude_m integer null`
- `enabled boolean not null default true`
- `provider_status text null`
- `last_attempt_at timestamptz null`
- `last_successful_fetch_at timestamptz null`
- `consecutive_failures integer not null default 0`
- unique `(provider, provider_station_id)`

### `wind_observations`

Rolling normalized read model.

- `station_id uuid not null references weather_stations(id)`
- `observed_at timestamptz not null`
- `collected_at timestamptz not null default now()`
- `wind_average_kmh numeric null`
- `wind_gust_kmh numeric null`
- `wind_direction_deg smallint null`
- `provider_status text null`
- primary key `(station_id, observed_at)`
- checks for non-negative speeds and direction between 0 and 359

The primary key supports the main query: the newest observations for one station. This is a rolling read model, not a long-term archive. Delete observations older than seven days on successful writes and through a database-only maintenance safeguard; partitioning is unnecessary.

### `site_weather_stations`

Maps an EigAir/Thermalbase flying site to a normalized station without embedding a provider-specific ID in application code.

- `site_id uuid`
- `station_id uuid`
- `role text` such as `primary`, `nearby` or `reference`
- `display_order integer`
- unique `(site_id, station_id)`

The existing `sites.winds_mobi_station_id` remains during migration and is removed only after every configured site has been mapped.

### `weather_public_feeds`

Publication allowlist for unauthenticated consumers. This is not a new tenant boundary.

- `id uuid primary key`
- `slug text unique not null`, initially `jungfrau`
- `enabled boolean`

### `weather_public_feed_stations`

Ordered station membership for a public feed.

- `feed_id uuid`
- `station_id uuid`
- `label_override text null`
- `display_order integer`
- primary key `(feed_id, station_id)`

Only server-side code reads this configuration. Anonymous Data API access to the underlying tables remains disabled.

## Provider-neutral API

The stable response is owned by Thermalbase:

```json
{
  "apiVersion": 1,
  "generatedAt": "2026-09-01T12:35:00Z",
  "staleAfterSeconds": 1800,
  "collection": {
    "state": "active",
    "lastSuccessfulFetchAt": "2026-09-01T12:34:20Z",
    "refreshState": "not_needed"
  },
  "stations": [
    {
      "id": "first-schreckfeld",
      "name": "First / Schreckfeld",
      "altitudeM": 2167,
      "latest": {
        "observedAt": "2026-09-01T12:35:00Z",
        "averageKmh": 13,
        "gustKmh": 19,
        "directionDeg": 260
      },
      "observations": []
    }
  ]
}
```

`observations` is ordered newest first and uses the same shape as `latest`. The public endpoint fixes the feed and bounds history, for example:

```text
GET /api/public/weather/jungfrau?observations=4
```

The server caps `observations` at a small number such as 12. Arbitrary provider station IDs, wide date-range queries and writes are not public API features.

The authenticated EigAir `live-wind` endpoint keeps its session/site authorization and uses the same cache-aside service. This removes duplicate provider traffic and gives EigAir the same bounded history when needed.

## Freshness and failures

- Fresh: observation age under 15 minutes.
- Delayed: 15–30 minutes.
- Stale: over 30 minutes.
- Provider unavailable: no successful on-demand fetch inside the alert window when requests were eligible to refresh.

The API returns last-known values with explicit age and stale state. The UI must show the measurement timestamp, not merely the page refresh time. A failed station does not block healthy stations.

Monitor fetch state rather than storing a log row for every read: `last_attempt_at`, `last_successful_fetch_at`, `consecutive_failures`, station counts received/expected and a bounded error code. Alert after three consecutive provider failures or when every configured station is stale.

## Security boundary

- Provider calls and Supabase secret credentials remain server-side.
- Observation tables have RLS enabled, no `anon` or `authenticated` policies, and explicit minimum grants only for server-side roles.
- Public reads go through the allowlisted Vercel API with CDN caching and request throttling.
- No raw provider response is retained by default. Keep normalized values and attribution only.

Supabase now treats Data API exposure as opt-in; grants and RLS must be declared together in the migration. See [Securing your API](https://supabase.com/docs/guides/api/securing-your-api). A retention maintenance job may use [Supabase Cron](https://supabase.com/docs/guides/cron), but it must never fetch winds.mobi.

## Delivery sequence

1. Add registry, mapping, observation and public-feed tables with database contract tests.
2. Extract the existing winds.mobi parser into a shared provider adapter.
3. Add the cache-aside read service, civil-daylight gate, shared refresh lease and bounded history adapter.
4. Exercise Stage with concurrent daytime/nighttime reads; verify provider-call counts, duplicates, failure handling and retention.
5. Switch EigAir live wind to the shared normalized read service.
6. Expose the fixed Jungfrau public feed and connect the meteo mockup.
7. Enforce seven-day deletion and review actual provider traffic before Production.

## Acceptance criteria

- Reprocessing the same provider response never creates duplicate observations.
- Idle time and nighttime page views produce no winds.mobi requests.
- Concurrent stale-feed requests coalesce to one refresh sequence.
- A provider timeout leaves the last good data readable and marked stale.
- One broken station does not suppress other stations.
- Public callers cannot enumerate arbitrary stations or query the observation tables directly.
- EigAir and Jungfrau-Tächi return the same normalized values for a shared station.
- The mobile UI can request the latest value plus four recent observations in one bounded response.
