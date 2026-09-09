import test from "node:test";
import assert from "node:assert/strict";
import { buildWindStations, createWindFeedClient, parseThermalbaseFeed } from "../src/wind-feed.js";

const epoch = 1788955200;
const roster = [
  { id: "fanet-BA-4", name: "Grund", source: "burnair", provider: "burnair", primary: true, apiUrl: "https://api.burnair.cloud/fixture", altitude: 950 },
  { id: "windline-4104", name: "First", source: "winds.mobi", provider: "windline.ch", primary: true, altitude: 2150, distanceKm: 3.9 },
];
const burnair = { dict: ["epoch", "wDir", "wAvg", "wMax"], data: { "fanet-ba-4": [[epoch, 360, 0, 4], [epoch - 600, 270, 2, 5]] } };
const winds = [{ _id: "windline-4104", "pv-name": "windline.ch", last: { _id: epoch, "w-avg": 8, "w-max": 14, "w-dir": 180 } }];
const response = (payload) => ({ ok: true, json: async () => payload });
const observation = (offset = 0) => ({ observedAt: new Date((epoch - offset) * 1000).toISOString(), averageKmh: 0, gustKmh: 4, directionDeg: 360, temperatureC: 12 });
const publicFeed = () => ({ apiVersion: 1, generatedAt: new Date(epoch * 1000).toISOString(), staleAfterSeconds: 1800, collection: { state: "active" }, stations: roster.map((s) => ({ id: s.id, source: s.source, provider: s.provider, latest: observation(), observations: [observation(600), observation(), observation(1200), observation(1800), observation(2400)] })) });

test("prototype providers share one normalized feed, coalesced requests and five-minute cache", async () => {
  let calls = 0;
  const client = createWindFeedClient({ roster, now: () => epoch * 1000, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(options.credentials, "omit");
    assert.ok(options.signal);
    if (String(url).includes("winds.mobi")) { assert.deepEqual(new URL(url).searchParams.getAll("ids"), ["windline-4104"]); return response(winds); }
    return response(burnair);
  } });
  const [a, b] = await Promise.all([client.load(), client.load()]);
  assert.equal(a, b);
  assert.equal(a.status, "ready");
  assert.equal(calls, 2);
  assert.equal((await client.load()).fromCache, true);
  assert.equal(calls, 2);
  const stations = buildWindStations(roster, a, epoch * 1000);
  assert.deepEqual(stations.map((s) => s.id), roster.map((s) => s.id));
  assert.equal(stations[0].average, 0);
  assert.equal(stations[0].direction, 0);
  assert.equal(stations[0].directionLabel, "N");
  assert.equal(stations[0].values.length, 2);
  assert.equal(stations[1].values.length, 1);
  assert.equal(stations[0].attribution, "burnair");
  assert.equal(stations[1].attribution, "winds.mobi · windline.ch");
});

test("one failed provider does not hide healthy stations or invent observations", async () => {
  const client = createWindFeedClient({ roster, now: () => epoch * 1000, fetchImpl: async (url) => {
    if (String(url).includes("burnair")) throw new Error("offline");
    return response(winds);
  } });
  const feed = await client.load();
  assert.equal(feed.status, "partial");
  const [grund, first] = buildWindStations(roster, feed, epoch * 1000);
  assert.equal(grund.liveState, "unavailable");
  assert.equal(grund.observedAt, null);
  assert.equal(grund.average, null);
  assert.equal(grund.values.length, 0);
  assert.equal(first.liveState, "ready");
});

test("failed refresh retains old readings and timestamps with explicit degraded state", async () => {
  let now = epoch * 1000;
  let fail = false;
  const client = createWindFeedClient({ roster, now: () => now, fetchImpl: async (url) => { if (fail) throw new Error("offline"); return response(String(url).includes("burnair") ? burnair : winds); } });
  await client.load();
  now += 31 * 60 * 1000;
  fail = true;
  assert.equal(client.snapshot().status, "refreshing");
  const stations = buildWindStations(roster, await client.load(), now);
  for (const station of stations) { assert.equal(station.observedAt, epoch); assert.equal(station.stale, true); assert.equal(station.degraded, true); assert.equal(station.statusLabel, "Abruf gestört"); }
});

test("public adapter allowlists stations, sorts and deduplicates history, and preserves calm wind", () => {
  const payload = publicFeed();
  payload.stations.push({ id: "not-published", latest: observation() });
  const entries = parseThermalbaseFeed(payload, roster);
  assert.equal(entries.length, 2);
  assert.deepEqual(entries[0].readings.map((r) => r.epoch), [epoch, epoch - 600, epoch - 1200, epoch - 1800]);
  assert.equal(entries[0].readings[0].average, 0);
  assert.equal(entries[0].readings[0].temperature, 12);
  assert.throws(() => parseThermalbaseFeed({ ...payload, apiVersion: 2 }, roster));
  assert.throws(() => parseThermalbaseFeed({ ...payload, generatedAt: "bad" }, roster));
});

test("configured public endpoint is the only request, including failures; no credentials or direct-provider fallback", async () => {
  for (const payload of [publicFeed(), { error: "Authentication required" }]) {
    const calls = [];
    const url = "https://stage.example.test/api/public/weather/jungfrau?observations=4";
    const client = createWindFeedClient({ roster, url, fetchImpl: async (endpoint, options) => { calls.push(String(endpoint)); assert.equal(options.credentials, "omit"); assert.deepEqual(options.headers, { Accept: "application/json" }); return response(payload); } });
    const feed = await client.load();
    assert.deepEqual(calls, [url]);
    assert.equal(feed.mode, "thermalbase");
    assert.equal(feed.status, payload.apiVersion ? "ready" : "error");
  }
});

test("public feed missing station uses last-known values, and observation age advances independently of fetch time", async () => {
  let now = epoch * 1000;
  const payload = publicFeed();
  const client = createWindFeedClient({ roster, url: "/public-feed", now: () => now, fetchImpl: async () => response(payload) });
  const first = await client.load();
  assert.equal(buildWindStations(roster, first, now + 31 * 60 * 1000)[0].stale, true);
  now += 6 * 60 * 1000;
  payload.stations.shift();
  const result = await client.load();
  const grund = buildWindStations(roster, result, now)[0];
  assert.equal(result.status, "partial");
  assert.equal(grund.observedAt, epoch);
  assert.equal(grund.degraded, true);
});

test("request timeout completes with unavailable state and disabled storage does not break loading", async () => {
  const storage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  const client = createWindFeedClient({ roster, url: "/public-feed", storage, timeoutMs: 5, fetchImpl: (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("timeout")), { once: true })) });
  assert.equal((await client.load()).status, "error");
});

test("malformed browser cache is ignored instead of breaking station rendering", async () => {
  const storage = { getItem: () => JSON.stringify({ mode: "thermalbase", fetchedAt: epoch * 1000, status: "ready", entries: [null] }), setItem() {} };
  const client = createWindFeedClient({ roster, url: "/public-feed", storage, now: () => epoch * 1000, fetchImpl: async () => response(publicFeed()) });
  assert.equal(client.snapshot().status, "loading");
  assert.equal((await client.load()).status, "ready");
});
