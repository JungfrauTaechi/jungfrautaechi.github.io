# Thermalbase on-demand winds.mobi integration — developer handover

| Field | Value |
| --- | --- |
| Status | Proposed for implementation review |
| Version | 0.4 |
| Date | 1 September 2026 |
| Product owner / approver | Alain |
| Technical owner | Thermalbase backend team |
| Consulted | Jungfrau-Tächi site team; winds.mobi operator for data-use confirmation |
| Review cadence | At implementation start, after Stage validation, then every six months |

## Decision

Do not poll winds.mobi on a schedule and do not build a long-term measurement archive.

Thermalbase fetches winds.mobi only in response to a user request, only during the configured flight-hours window, and only when the stored feed is older than the freshness threshold. Each successful fetch is normalized, upserted into a rolling seven-day Postgres cache, and then published through the server cache.

The winds.mobi API already provides per-station history for up to seven days. That is sufficient for the product. Thermalbase stores at most the same window to provide a fast read model, last-known values during provider failures or nighttime, and a stable provider-neutral API.

The public website and EigAir never call winds.mobi or Supabase directly.

## Purpose

Allow EigAir and the Jungfrau-Tächi meteo page to show the latest wind measurement plus recent values while:

- making no automatic or nighttime provider requests;
- avoiding duplicate upstream calls when multiple people open the page;
- respecting winds.mobi's fair-use conditions;
- keeping clients provider-neutral; and
- avoiding infrastructure for history longer than seven days.

The broader data model and API rationale are in [Meteo measurement history architecture](./meteo-data-architecture.md).

## Published winds.mobi conditions

Validated against the official API source on 1 September 2026.

| Published condition | Required Thermalbase response |
| --- | --- |
| Every call must identify the caller with a `User-Agent` header. | Use a descriptive, contactable value such as `Thermalbase/1.0 (+https://eigair.com; operations-contact@example.org)`. Make it configurable without a deployment. |
| A service using winds.mobi data must not be monetized through payment, subscription, in-app purchase, advertising, or similar means. | Enable winds.mobi only for non-monetized surfaces unless written permission says otherwise. |
| Clients must minimize calls and request multiple stations together. | Cache and coalesce requests. Use the batched station endpoint where latest values are sufficient. The history endpoint is per station, so request it only for configured stations that need recent history. |
| Non-compliant IPs or services may be blacklisted without notice. | Back off on failures and `429`, monitor provider health, and retain last-known data. |
| Indexed data belongs to the originating providers. | Retain provenance and confirm the intended rolling storage/redistribution with winds.mobi. |

Evidence:

- The [winds.mobi Terms of Use embedded in the official API source](https://github.com/winds-mobi/winds-mobi-api/blob/main/winds_mobi_api/main.py) state the identification, non-monetization and call-minimization rules.
- The [official API repository](https://github.com/winds-mobi/winds-mobi-api) documents API 2.3 and licenses its server source under AGPL-3.0. That code licence is not a separate licence to provider data.
- The API exposes a [per-station historic endpoint capped at seven days](https://github.com/winds-mobi/winds-mobi-api/blob/main/winds_mobi_api/views.py).
- A single identified live check against API 2.3 returned the expected newest-first measurement list with `_id`, `w-dir`, `w-avg` and `w-max`, matching the published contract.

### Production approval gate

Before Production is enabled, retain a written answer from `info@winds.mobi` confirming:

1. Jungfrau-Tächi may show the data on its free, advertisement-free club website.
2. Thermalbase may temporarily store normalized observations in a rolling seven-day cache.
3. Thermalbase may serve those normalized values to the club site and the intended non-monetized EigAir surface.
4. The proposed on-demand traffic pattern, station count, User-Agent and attribution are acceptable.
5. Calling the per-station history endpoint for configured stations is acceptable when a cached feed needs refreshing.

If the consuming EigAir screen is paid, subscription-supported or advert-funded, provider access for that screen remains disabled unless winds.mobi grants a written exception.

Suggested request summary:

> We operate Thermalbase/EigAir and are preparing a free, advertisement-free weather view for Jungfrau-Tächi. We would not poll on a schedule. During civil daylight, the first user request after a five-minute cache interval would refresh approximately [N] configured stations; concurrent requests would share that refresh. We would use your per-station history endpoint only where recent values are displayed, normalize the response, and keep a rolling cache for no more than seven days. Calls would identify Thermalbase and a monitored contact. May we store and redistribute those values on the described non-monetized surfaces, and what attribution do you require?

## Scope

Included:

- extension of the existing winds.mobi adapter;
- user-triggered, cache-aside fetching;
- civil-daylight/flight-hours gate;
- request coalescing and provider backoff;
- rolling seven-day normalized database cache;
- server-side response cache;
- fixed Jungfrau public feed and authorized EigAir reads;
- latest plus a bounded recent-measurement list.

Not included:

- scheduled winds.mobi polling;
- history older than seven days;
- forecasts, webcams or DABS ingestion;
- arbitrary public station search or bulk export;
- the Jungfrau meteo UI implementation;
- a new Thermalbase tenant concept.

## Defaults and definitions

- **Observation time:** `observed_at` supplied by winds.mobi.
- **Fetch time:** when Thermalbase successfully received a valid winds.mobi response.
- **Feed freshness:** age of `last_successful_fetch_at`, not age of an individual station observation.
- **Active window:** civil daylight at the configured feed location, when the sun is at or above -6 degrees. Calculate locally; do not call another provider.
- **Fresh cache interval:** five minutes.
- **Minimum retry interval:** sixty seconds after any provider attempt.
- **UI stale threshold:** thirty minutes based on `observed_at`.
- **Database retention:** seven days maximum.
- **Current UI history request:** enough provider duration to return the latest four measurements; start with six hours and make it bounded configuration.
- **Maximum provider history duration:** seven days, enforced server-side.
- **Timezone:** `Europe/Zurich` for policy display; persist timestamps in UTC.

These values are configuration, not constants hidden in the adapter. A public client cannot choose arbitrary provider station IDs or an unbounded duration.

On-demand refresh follows the active-window gate. At night, the API returns last-known stored data with a paused state and makes no winds.mobi request. An admin-only diagnostic operation may bypass the gate; public clients may not.

## Jungfrau public feed station roster

The `jungfrau` feed uses a fixed, reviewed allowlist. The first five entries are shown by default on the club site; the remaining entries appear only after the visitor expands the regional list. The order is distance by air from central Grindelwald (`46.6242, 8.0414`). Do not discover or reorder stations on each public page request.

Snapshot source: winds.mobi API 2.3 station search on 1 September 2026, bounded by `46.54, 7.75` and `46.81, 8.30`, with the highest-rated duplicate selected.

| Order | Station ID | Display name | Altitude | Provider | Distance | Initial UI |
| ---: | --- | --- | ---: | --- | ---: | --- |
| 1 | `windline-4104` | Grindelwald First | 2150 m | windline.ch | 3.9 km | Primary |
| 2 | `slf-FIR2` | Schmidigen-Bidmeren | 2111 m | slf.ch | 5.3 km | Primary |
| 3 | `slf-MAE2` | Itramen | 2162 m | slf.ch | 7.5 km | Primary |
| 4 | `slf-MAN1` | Männlichen | 2341 m | slf.ch | 7.9 km | Primary |
| 5 | `slf-LHO2` | Russisprung | 2150 m | slf.ch | 8.8 km | Primary |
| 6 | `meteoswiss-JUN` | Jungfraujoch | 3581 m | meteoswiss.ch | 9.5 km | Expanded |
| 7 | `slf-SWM1` | Schwarzmönch | 2673 m | slf.ch | 11.9 km | Expanded |
| 8 | `holfuy-1989` | Stechelberg | 850 m | holfuy.com | 12.0 km | Expanded |
| 9 | `meteoswiss-BRZ` | Brienz | 577 m | meteoswiss.ch | 13.0 km | Expanded |
| 10 | `meteoswiss-INT` | Interlaken | 588 m | meteoswiss.ch | 14.1 km | Expanded |
| 11 | `metar-LSMM` | Meiringen Arpt | 570 m | aviationweather.gov | 14.2 km | Expanded |
| 12 | `holfuy-680` | Schiltgrat | 2100 m | holfuy.com | 14.9 km | Expanded |
| 13 | `meteoswiss-MER` | Meiringen | 599 m | meteoswiss.ch | 15.5 km | Expanded |
| 14 | `holfuy-1804` | Höhematte | 630 m | holfuy.com | 15.6 km | Expanded |
| 15 | `slf-SCH2` | Türliboden | 2332 m | slf.ch | 16.6 km | Expanded |
| 16 | `slf-ROA2` | Rotschalp | 1875 m | slf.ch | 17.1 km | Expanded |
| 17 | `slf-SCH1` | Schilthorn | 2996 m | slf.ch | 17.4 km | Expanded |
| 18 | `holfuy-1850` | Lehn | 560 m | holfuy.com | 17.6 km | Expanded |
| 19 | `holfuy-1957` | Bilitscher | 1300 m | holfuy.com | 17.8 km | Expanded |
| 20 | `slf-SCB2` | Schönbüel | 1777 m | slf.ch | 17.9 km | Expanded |
| 21 | `slf-ROA1` | Brienzer Rothorn | 2348 m | slf.ch | 18.1 km | Expanded |
| 22 | `holfuy-1808` | Amisbühl | 1315 m | holfuy.com | 18.9 km | Expanded |
| 23 | `holfuy-1829` | Hohwald | 1600 m | holfuy.com | 19.4 km | Expanded |
| 24 | `slf-GUT1` | Bänzlauistock | 2528 m | slf.ch | 19.6 km | Expanded |
| 25 | `slf-GUT2` | Homad | 2115 m | slf.ch | 19.9 km | Expanded |
| 26 | `holfuy-947` | Planplatten | 2240 m | holfuy.com | 20.5 km | Expanded |
| 27 | `pioupiou-1510` | Hüttstett | 1667 m | openwindmap.org | 21.6 km | Expanded |
| 28 | `slf-SHE2` | Schibe | 1852 m | slf.ch | 22.3 km | Expanded |
| 29 | `windline-4109` | Niederhorn | 1960 m | windline.ch | 22.4 km | Expanded |

Review the allowlist at implementation time and then every six months. A station that disappears or becomes unhealthy remains identifiable in the response but must not silently be replaced with a different provider station. Any roster change is a reviewed feed configuration change.

### Planned Grindelwald Grund station

The club site also shows `Grindelwald Grund` as a non-interactive planned station at the landing area (`46.6202, 8.0294`, 950 m). It is not part of the 29-station winds.mobi allowlist and must not receive a fabricated provider ID or measurement. Once the physical station has been published by winds.mobi, replace the placeholder through a reviewed roster change and retain the provider-issued ID.

## Request flow

```text
Jungfrau public API or authenticated EigAir API
    -> resolve fixed/authorized station set
    -> read feed cache or Postgres read model
    -> if last successful fetch <= 5 minutes: return it
    -> if nighttime: return last-known data as paused
    -> if retry cooldown/backoff active: return last-known data as degraded
    -> acquire one database-backed refresh lease
        -> lease loser returns stored data as refresh in progress
        -> lease winner calls winds.mobi for only the required data
            -> validate and normalize
            -> upsert observations and fetch state in Postgres
            -> delete observations older than 7 days
            -> update/invalidate server cache after commit
            -> return refreshed response
```

Thermalbase's existing Vercel API is the provider control plane and Supabase is the system of record. Do not duplicate the provider adapter in an Edge Function and do not expose observation tables through the anonymous Supabase Data API.

## Provider request strategy

The winds.mobi latest-stations endpoint supports multiple station IDs, while the history endpoint supports one station per call. Minimize traffic as follows:

1. If a consumer asks only for current values, use one batched latest-stations request.
2. If a consumer asks for recent measurements, call the history endpoint only for configured stations in that response. Do not add a redundant latest request; the newest history item is the current value.
3. Request only the duration needed. The Jungfrau card view starts with six hours and returns the newest four observations.
4. Never fetch seven days merely because that is the provider limit.
5. Cache the complete fixed-feed result, so one page view does not create one upstream refresh per component.
6. Bound concurrency for per-station history calls, initially two, and stop starting new calls when provider backoff begins.

If winds.mobi asks for a stricter pattern, its written direction overrides these defaults.

## Functional requirements

### Read and refresh

- **FR-001** Resolve an allowlisted public feed or an EigAir-authorized site/station set before any read.
- **FR-002** Read the server cache and Postgres fetch state before considering a provider call.
- **FR-003** If `last_successful_fetch_at` is no more than five minutes old, return stored data and make zero winds.mobi calls.
- **FR-004** If the active window is closed, return stored data with `collectionState="paused"` and `nextActiveWindowAt`; make zero winds.mobi calls.
- **FR-005** If provider cooldown or backoff is active, return stored data with `collectionState="degraded"`; make zero winds.mobi calls.
- **FR-006** Otherwise acquire a database-backed lease keyed by provider and feed/station scope.
- **FR-007** The lease winner performs the minimum provider requests. Lease losers return stored data with `refreshState="in_progress"` and do not contact winds.mobi.
- **FR-008** When stored data exists, stale-while-revalidate is allowed: return it promptly with `refreshState="triggered"` and let the client revalidate once after a short delay.
- **FR-009** With no stored data, the request may wait up to the existing provider timeout. If unavailable, return a controlled no-data response.
- **FR-010** Every provider call carries the approved User-Agent, bounded timeout and requested field projection.
- **FR-011** One malformed station response must not discard valid data for other stations.
- **FR-012** A successful refresh commits observations and fetch state before cache invalidation/update.
- **FR-013** A failed refresh retains last-known values, records a bounded failure and applies exponential backoff.

### Storage and APIs

- **FR-014** Upsert normalized rows by `(station_id, observed_at)`; repeat fetches are idempotent.
- **FR-015** Store observation time, collection time, average speed, gust, direction, provider and provider station ID.
- **FR-016** Keep at most seven days. Delete older rows on successful write and provide a low-frequency database maintenance safeguard that makes no provider calls.
- **FR-017** Do not store raw provider payloads by default.
- **FR-018** Keep fetch state separate from observations. A successful fetch can contain an old station observation without making the feed-fetch timestamp old.
- **FR-019** The public API uses a fixed feed, initially `jungfrau`, and caps returned observations, initially twelve per station.
- **FR-020** Public callers cannot supply provider IDs or request beyond the server-configured seven-day maximum.
- **FR-021** EigAir retains its existing session/site authorization and uses the same normalized read service.
- **FR-022** Clients receive explicit observation and collection freshness, never credentials or raw upstream payloads.

## Minimal data model

- **`weather_stations`:** provider/station ID, display metadata, enabled state and provenance; unique provider plus station ID.
- **`wind_observations`:** station ID plus observation time unique key, collection time, normalized average/gust/direction and provider status.
- **`weather_public_feeds` plus membership:** fixed slug, enabled state, ordered allowlisted stations and optional display labels.
- **`weather_fetch_state`:** provider and scope, last attempt/success, result, station counts, consecutive failures, next allowed attempt, lease owner/expiry, bounded error, request type and history duration.

Reuse the existing site station mapping during migration. Do not introduce a second tenant boundary.

## Read contract

```json
{
  "apiVersion": 1,
  "generatedAt": "2026-09-01T12:35:00Z",
  "collection": {
    "state": "active",
    "lastSuccessfulFetchAt": "2026-09-01T12:34:20Z",
    "source": "on_demand",
    "refreshState": "not_needed",
    "nextActiveWindowAt": null
  },
  "stations": [
    {
      "id": "first-schreckfeld",
      "name": "First / Schreckfeld",
      "latest": {
        "observedAt": "2026-09-01T12:31:00Z",
        "averageKmh": 13,
        "gustKmh": 19,
        "directionDeg": 260,
        "stale": false
      },
      "observations": []
    }
  ]
}
```

Allowed collection states: `active`, `paused`, `degraded`, `unavailable`. Allowed refresh states: `not_needed`, `triggered`, `in_progress`, `completed`, `failed`, `suppressed`.

The public route remains bounded, for example `GET /api/public/weather/jungfrau?observations=4`. `generatedAt` is response time, not measurement time; the UI displays `observedAt` and uses it for stale styling.

## Cache requirements

- Postgres is the authoritative rolling read model; the fast cache is disposable.
- Cache by API version plus fixed feed or authorized site scope.
- Fresh TTL is five minutes; stale fallback may remain available for the seven-day retention window.
- A cache miss reads Postgres before considering winds.mobi.
- Update/invalidate only after the database transaction commits.
- Multiple weather components on one page share one feed response/cache key.
- CDN TTL must not exceed five minutes; sixty seconds is the starting value.

## Failure handling

| Condition | Required behaviour |
| --- | --- |
| Outside active window | No provider call; return last-known data and next active window. |
| Lease already held | Do not start another refresh; return stored data with `in_progress`. |
| Provider timeout/5xx | Keep stored data, mark degraded and back off. |
| Provider 429 | Honour `Retry-After` when present; otherwise exponential backoff. |
| Provider 401/403 or blacklist suspected | Stop attempts after the bounded threshold and alert the owner. |
| Malformed station item | Reject only that item and return a partial state. |
| Database write fails | Do not update cache or mark fetch success. |
| Cache fails | Serve from Postgres; refresh may continue. |
| Station timestamp remains old after a successful fetch | Mark that station stale; do not immediately call the provider again. |
| No stored data and provider unavailable/nighttime | Return unavailable/paused state; never fabricate zero values. |

## Security and operations

- Keep winds.mobi and Supabase service credentials server-side.
- Enable RLS and remove anonymous/authenticated grants from observation/configuration tables.
- Public access goes only through the fixed-feed Thermalbase API.
- Rate-limit the public endpoint independently of the upstream lease.
- Log request type, station count, provider calls, duration, response status, inserted/no-op counts, observation lag and cache outcome.
- Alert on repeated failures, suspected blacklist responses and unusual upstream-call growth.
- Provide provider/feed kill switches.

Platform references: [securing the Supabase Data API](https://supabase.com/docs/guides/api/securing-your-api). A maintenance cron may be used only for database retention; it must never fetch winds.mobi. See [Supabase Cron](https://supabase.com/docs/guides/cron).

## Implementation procedure

1. Record winds.mobi approval, final User-Agent, station count and attribution in the release ticket.
2. Add station registry, observation, public-feed and fetch-state migrations with RLS/grants and tests.
3. Refactor the existing `_winds-mobi.ts` parser/batching into a shared provider adapter.
4. Add history parsing and the minimum-duration/per-station request path.
5. Implement the active-window gate, cache-aside read, lease, cooldown/backoff and transactional upsert.
6. Add seven-day cleanup on successful writes and the database-only maintenance safeguard.
7. Add the fixed Jungfrau contract and adapt EigAir reads without changing its authorization boundary.
8. Exercise Stage with concurrent reads, daytime/nighttime transitions and provider failures.
9. Review provider-call volume and receive-count evidence before Production.

## Acceptance criteria

- **AC-001** No background job or idle period creates a winds.mobi request.
- **AC-002** During a simulated night, any number of reads creates zero winds.mobi requests.
- **AC-003** Daylight and daylight-saving transitions require no cron edits.
- **AC-004** A fresh five-minute feed generates zero provider requests.
- **AC-005** One hundred concurrent stale-feed requests generate one refresh sequence per scope.
- **AC-006** History refresh adds no redundant latest request.
- **AC-007** Every call has the approved User-Agent and no history duration exceeds seven days.
- **AC-008** Replaying a response produces no duplicate observations.
- **AC-009** No observation older than seven days remains after retention.
- **AC-010** The database transaction commits before the cache changes.
- **AC-011** Provider failure leaves last-known values readable with correct stale/degraded metadata.
- **AC-012** An old station timestamp after a successful fetch does not cause a refresh loop.
- **AC-013** Public callers cannot enumerate provider IDs, expand beyond caps or access Supabase tables.
- **AC-014** EigAir and Jungfrau return identical normalized values for the same stored observation.
- **AC-015** Production remains disabled until the provider-approval gate is recorded.

## Ownership

| Activity | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Provider permission and attribution | Product owner | Product owner | winds.mobi operator | Thermalbase developers |
| Schema, adapter, APIs and tests | Thermalbase backend team | Thermalbase technical owner | EigAir/mobile and Jungfrau UI owners | Product owner |
| Stage evidence and Production readiness | Thermalbase backend team | Thermalbase technical owner | Product owner | Jungfrau maintainer |
| Jungfrau meteo UI integration | Jungfrau site team | Product owner | Thermalbase backend team | Club maintainer |
| Provider incidents | Thermalbase operations | Thermalbase technical owner | winds.mobi operator when needed | Product owner |

## Open items

- Replace the example User-Agent contact with the real monitored address.
- Confirm the reviewed 29-station Jungfrau allowlist at implementation start.
- Confirm whether the intended EigAir screen is monetized in any way.
- Record winds.mobi's written response on rolling storage, redistribution, per-station history calls and attribution.

## Changelog

- **0.4 — 2026-09-02:** Added Grindelwald Grund as an explicit planned-station placeholder outside the winds.mobi allowlist.
- **0.3 — 2026-09-01:** Added the reviewed, distance-ordered 29-station Jungfrau feed roster and the five-primary/24-expanded public UI hierarchy.
- **0.2 — 2026-09-01:** Removed scheduled provider polling and long-term history. Switched to user-triggered, daylight-gated cache-aside refresh using winds.mobi's seven-day history endpoint.
- **0.1 — 2026-09-01:** Initial scheduled-collection proposal.
