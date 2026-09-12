import test from "node:test";
import assert from "node:assert/strict";
import { upcomingEvents, swissToday } from "../src/club-events.js";
import { SHV_LINKS, SHV_PRODUCTS, shvDestination } from "../src/shv-links.js";
import { validateRecord, localMediaPath } from "../scripts/content-validation.mjs";
import { generatedNews, generatedPhotoReports } from "../src/generated-content.js";
import { readFile, access } from "node:fs/promises";
import { applyMarkerPosition } from "../src/marker-position.js";
import { relatedNews } from "../src/related-news.js";
import { validateSiteContent } from "../scripts/site-content-validation.mjs";
const shvWeatherSource = await readFile(new URL("../src/ShvWeather.jsx", import.meta.url), "utf8");

test("related news fills sparse categories without the current article or duplicates", () => {
  const article = { slug: "current", category: "club" };
  const items = [article, { slug: "other", category: "travel" }, { slug: "match", category: "club" }, { slug: "match", category: "club" }, { slug: "third", category: "travel" }, { slug: "fourth", category: "travel" }];
  assert.deepEqual(relatedNews(items, article).map(item => item.slug), ["match", "other", "third", "fourth"]);
  assert.deepEqual(relatedNews([article], article), []);
  assert.deepEqual(items[0], article);
});

test("editable club content validates existing files and rejects broken programme edits", async () => {
  const content = Object.fromEntries(await Promise.all(["programme", "portrait", "purposes"].map(async name => [name, JSON.parse(await readFile(new URL(`../content/site/${name}.json`, import.meta.url), "utf8"))])));
  assert.deepEqual(validateSiteContent(content), []);
  const event = content.programme[0];
  for (const invalid of [null, { ...event, startDate: "2026-02-30" }, { ...event, endDate: "2026-01-01" }, { ...event, title: "" }, { ...event, path: "//example.com" }, { ...event, path: "/../admin" }]) {
    assert.ok(validateSiteContent({ ...content, programme: [invalid] }).length);
  }
  assert.ok(validateSiteContent({ ...content, portrait: [""] }).length);
  assert.ok(validateSiteContent({ ...content, purposes: [null] }).length);
});

test("marker overrides change only coordinates and retain the original link or station", () => {
  const marker = { targetId: "grund", station: { id: "fanet-BA-4" }, yaw: 10, pitch: 20 };
  assert.deepEqual(applyMarkerPosition(marker, { yaw: 0, pitch: -12 }), { ...marker, yaw: 0, pitch: -12 });
  assert.equal(marker.yaw, 10);
  for (const invalid of [undefined, {}, { yaw: 181, pitch: 0 }, { yaw: 0, pitch: NaN }]) assert.equal(applyMarkerPosition(marker, invalid), marker);
});

test("each of the thirteen panoramas has one configurable position for all eight webcams", async () => {
  const positions = JSON.parse(await readFile(new URL("../src/panorama-webcams.json", import.meta.url), "utf8"));
  const expected = ["first", "eigergletscher", "maennlichen", "kleine-scheidegg", "terminal", "kirchbuehl", "baeregg", "glecksteinhuette"].sort();
  assert.equal(Object.keys(positions).length, 13);
  for (const [scene, cameras] of Object.entries(positions)) {
    assert.deepEqual(Object.keys(cameras).sort(), expected, scene);
    for (const point of Object.values(cameras)) {
      assert.ok(Number.isFinite(point.yaw) && point.yaw >= -180 && point.yaw <= 180, scene);
      assert.ok(Number.isFinite(point.pitch) && point.pitch >= -90 && point.pitch <= 90, scene);
      assert.equal(typeof point.provisional, "boolean");
    }
  }
});

test("all thirteen panorama pyramids have every expected local tile and original crop limits", async () => {
  const root = new URL("../public/assets/panoramas/", import.meta.url);
  const manifest = JSON.parse(await readFile(new URL("multires-manifest.json", root), "utf8"));
  assert.equal(Object.keys(manifest).length, 13);
  assert.equal(manifest.waldspitz.multiRes.cubeResolution, 6656);
  assert.equal(manifest.maennlichen.multiRes.cubeResolution, 6656);
  assert.ok(Math.abs(manifest.waldspitz.minPitch + 44.38548) < 0.00001);
  assert.equal(manifest.waldspitz.maxPitch, 41.10768);
  assert.equal(manifest.maennlichen.minPitch, -60.77394);
  assert.equal(manifest.maennlichen.maxPitch, 33.7329);
  for (const [scene, { multiRes: m }] of Object.entries(manifest)) {
    for (let level = 1; level <= m.maxLevel; level++) {
      const side = Math.ceil(Math.ceil(m.cubeResolution / 2 ** (m.maxLevel - level)) / m.tileResolution);
      const files = [];
      for (const face of ["f", "r", "b", "l", "u", "d"]) for (let y = 0; y < side; y++) for (let x = 0; x < side; x++) files.push(access(new URL(`${scene}/multires/${level}/${face}_${y}_${x}.jpg`, root)));
      await Promise.all(files);
    }
  }
});

test("next events include the final event day, exclude expired events and sort without mutation", () => {
  const items = [{ startDate: "2027-01-01" }, { startDate: "2026-09-19", endDate: "2026-09-20" }, { startDate: "2026-09-01" }];
  assert.deepEqual(upcomingEvents(items, "2026-09-20"), [items[1], items[0]]);
  assert.deepEqual(upcomingEvents(items, "2026-09-21"), [items[0]]);
  assert.deepEqual(upcomingEvents(items, "2028-01-01"), []);
  assert.equal(items[0].startDate, "2027-01-01");
  assert.equal(swissToday(new Date("2026-09-19T22:30:00Z")), "2026-09-20");
});

test("SHV destinations use documented product links on mobile and information page on desktop", () => {
  assert.equal(shvDestination({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)" }).href, SHV_LINKS.ios);
  assert.equal(shvDestination({ userAgent: "Mozilla/5.0 (Linux; Android 16)" }).href, SHV_LINKS.android);
  assert.equal(shvDestination({ userAgent: "Mozilla/5.0 (Macintosh)", platform: "MacIntel", maxTouchPoints: 5 }).href, SHV_LINKS.ios);
  assert.equal(shvDestination({ userAgent: "Mozilla/5.0 (Windows NT 10.0)", maxTouchPoints: 10 }).href, SHV_LINKS.page);
  assert.equal(shvDestination().href, SHV_LINKS.page);
  assert.deepEqual(SHV_PRODUCTS.map(({ id }) => id), ["textForecast", "liveMap", "previtemps", "globalForecast"]);
  assert.ok(SHV_PRODUCTS.every(({ href }) => href.startsWith("https://prod.shv-app.ch/")));
  assert.match(SHV_PRODUCTS.find(({ id }) => id === "liveMap").href, /coord=4326,8\.0414,46\.6242/);
  assert.match(shvWeatherSource, /SHV_PRODUCTS\.map/);
  assert.match(shvWeatherSource, /SHV-App installieren/);
});

test("content validation rejects invalid dates and unsafe slugs", () => {
  const valid = { title: "Clubfliegen", slug: "clubfliegen-2026", date: "2026-09-19" };
  assert.deepEqual(validateRecord(valid), []);
  assert.ok(validateRecord({ ...valid, date: "2026-02-30" }).length);
  assert.ok(validateRecord({ ...valid, title: "" }).length);
  assert.ok(validateRecord({ ...valid, slug: "../other" }).length);
  assert.ok(validateRecord({ ...valid, gallery: "photo.jpg" }).length);
  assert.ok(validateRecord({ ...valid, date: "" }).length);
});

test("local image references stay within public media folders", () => {
  assert.equal(localMediaPath("/media/photos/annecy2026/Datei00001.jpg"), "media/photos/annecy2026/Datei00001.jpg");
  assert.equal(localMediaPath("https://example.com/photo.jpg"), null);
  assert.throws(() => localMediaPath("/media/%2e%2e/secret"));
  assert.throws(() => localMediaPath("/assets/../../secret"));
  assert.throws(() => localMediaPath("file:///secret"));
});

test("public content retains Pascal's additions and removes the two integration tests", () => {
  assert.ok(generatedNews.some((article) => article.slug === "sandige-boden-vorschau"));
  assert.ok(generatedPhotoReports.some((article) => article.slug === "annecy2026"));
  assert.ok(!generatedNews.some((article) => ["clubfliegen-september-test", "landecup-september-test"].includes(article.slug)));
  const annecy = generatedPhotoReports.find((article) => article.slug === "annecy2026");
  assert.equal(new Set([annecy.coverImage, ...annecy.gallery.map((image) => image.src)]).size, 92);
});
