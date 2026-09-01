import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const siteOrigin = "https://www.jungfrau-taechi.ch";
const sitemapUrl = `${siteOrigin}/sitemap.xml`;
const outputDir = path.resolve("content/inventory");
const decode = (value = "") => value
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&auml;/gi, "ä").replace(/&ouml;/gi, "ö").replace(/&uuml;/gi, "ü")
  .replace(/&szlig;/gi, "ß").replace(/&nbsp;/gi, " ");
const stripHtml = (html = "") => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const absolute = (value, base) => { if (!value) return null; try { return new URL(value, base).href; } catch { return null; } };
const matches = (html, pattern, mapper) => [...html.matchAll(pattern)].map(mapper).filter(Boolean);
const normalizedHost = (url) => new URL(url).hostname.toLowerCase().replace(/^www\./, "");
const isClubUrl = (url) => { try { return normalizedHost(url) === "jungfrau-taechi.ch"; } catch { return false; } };
const utilityHeading = /^(?:öffnet (?:PDF|Link) in neuem Fenster|News|Club|Wettkampf|Fluggebiet|Meteo\/Webcams|Fotos|Kontakt)$/i;
const internalLinksSummary = (report) => {
  const state = report.internalLinksStatus;
  if (state?.availability === "unavailable") return `unavailable — ${state.reason}`;
  if (state?.availability === "partial") return `partial — ${state.reason}`;
  return "current/complete";
};
const canonicalSummary = (report) => report.canonicalStatus?.availability === "unavailable"
  ? `unavailable — ${report.canonicalStatus.reason}`
  : "current/complete";
const markdownFor = (report, imageCount) => {
  const rows = report.pages.map((page) => `| ${page.status ?? "ERR"} | ${page.section} | ${page.primaryHeading || page.title || "—"} | ${page.url} | ${page.migrationDisposition} |`).join("\n");
  return `# Jungfrau-Tächi public-site inventory\n\nGenerated: ${report.generatedAt}\n\n- Sitemap URLs: ${report.totalUrls}\n- Reachable: ${report.reachableUrls}\n- Failures: ${report.failures.length}\n- Unique discovered images: ${imageCount}\n- Internal-link dataset: ${internalLinksSummary(report)}\n- Canonical-link dataset: ${canonicalSummary(report)}\n\n| Status | Section | Primary heading / title | URL | Migration disposition |\n| --- | --- | --- | --- | --- |\n${rows}\n\n## Failures\n\n${report.failures.length ? report.failures.map((page) => `- ${page.url} — ${page.status ?? page.error}`).join("\n") : "None"}\n`;
};
const csvFor = (pages) => ["status,url,final_url,section,template,title,primary_heading,canonical,redirected,internal_link_count,image_count,embed_count,migration_disposition,error", ...pages.map((page) => [page.status, page.url, page.finalUrl, page.section, page.template, page.title, page.primaryHeading, page.canonical, page.redirected, Array.isArray(page.internalLinks) ? page.internalLinks.length : "unavailable", page.images.length, page.embeds.length, page.migrationDisposition, page.error].map(escapeCsv).join(","))].join("\n");

async function repairStoredHeadings(networkError) {
  try {
    const reportPath = path.join(outputDir, "site-inventory.json");
    const report = JSON.parse(await readFile(reportPath, "utf8"));
    let repaired = 0;
    let unavailableLinks = 0;
    let invalidCanonicals = 0;
    for (const page of report.pages) if (utilityHeading.test(page.primaryHeading || "")) { page.primaryHeading = page.title || null; repaired += 1; }
    for (const page of report.pages) if (Array.isArray(page.internalLinks)) { page.internalLinks = null; unavailableLinks += 1; }
    for (const page of report.pages) if (page.canonical?.endsWith("/undefined")) { page.canonical = null; invalidCanonicals += 1; }
    report.internalLinksStatus = {
      status: "stale",
      availability: "unavailable",
      reason: "Corrected canonical-host parser has not yet completed a fresh crawl.",
    };
    report.canonicalStatus = {
      status: "stale",
      availability: "unavailable",
      reason: "Legacy snapshot contained invalid generated canonical URLs; a corrected fresh crawl is pending.",
    };
    await Promise.all([
      writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`),
      writeFile(path.join(outputDir, "site-inventory.md"), markdownFor(report, new Set(report.pages.flatMap((page) => page.images.map((image) => image.src))).size)),
      writeFile(path.join(outputDir, "site-inventory.csv"), `${csvFor(report.pages)}\n`),
    ]);
    console.warn(`Inventory network unavailable (${networkError.cause?.code || networkError.message}); retained ${report.totalUrls} prior records, replaced ${repaired} utility headings, marked ${unavailableLinks} internal-link fields unavailable, and cleared ${invalidCanonicals} invalid canonical URLs.`);
  } catch (repairError) {
    throw new Error(`Inventory request failed (${networkError.message}) and no prior inventory could be safely retained: ${repairError.message}`);
  }
}

function sectionFor(url) {
  const pathname = new URL(url).pathname;
  if (pathname === "/" || pathname === "/index-kopie") return "home";
  if (pathname.startsWith("/newsfeed") || pathname.includes("/news")) return "news";
  if (pathname.includes("chronik") || pathname.includes("stories") || pathname.includes("portrait")) return "club-history";
  if (pathname.includes("mitglied") || pathname.includes("goenner")) return "membership";
  if (pathname.includes("flug") || pathname.includes("grund") || pathname.includes("bodmi") || pathname.includes("air_")) return "flight-area";
  if (pathname.includes("foto")) return "photos";
  if (pathname.includes("meteo") || pathname.includes("webcam")) return "weather-webcams";
  if (pathname.includes("wettkampf") || pathname.includes("xalps") || pathname.includes("race")) return "competition";
  if (pathname.includes("kontakt") || pathname === "/contact") return "contact";
  if (pathname.includes("club") || pathname.includes("vorstand") || pathname.includes("statuten")) return "club";
  return "archive-or-utility";
}

function migrationDisposition(url) {
  const section = sectionFor(url);
  const current = ["home", "news", "club-history", "membership", "flight-area", "photos", "contact"];
  return current.includes(section) ? "representative migration or grouped route" : "inventory retained; migrate when current utility/archive route is prioritised";
}

async function inspect(url) {
  try {
    const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(20000), headers: { "user-agent": "Taechi redesign inventory (local migration audit)" } });
    const html = await response.text();
    const title = stripHtml((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
    const headingCandidates = [
      ...matches(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (item) => stripHtml(item[1])),
      ...matches(html, /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (item) => stripHtml(item[1])),
    ];
    const headings = headingCandidates.filter((heading) => heading && !utilityHeading.test(heading));
    const canonical = absolute((html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || [])[1], response.url) || null;
    const links = [...new Set(matches(html, /<a\b[^>]+href=["']([^"']+)/gi, (item) => absolute(item[1], response.url)).filter(isClubUrl))];
    const images = matches(html, /<img\b([^>]*)>/gi, (item) => {
      const attrs = item[1];
      const src = (attrs.match(/\bsrc=["']([^"']+)/i) || [])[1];
      if (!src) return null;
      return { src: absolute(src, response.url), alt: decode((attrs.match(/\balt=["']([^"']*)/i) || [])[1] || "") };
    });
    const embeds = matches(html, /<(?:iframe|embed|object)\b[^>]+(?:src|data)=["']([^"']+)/gi, (item) => absolute(item[1], response.url));
    return { url, finalUrl: response.url, status: response.status, redirected: response.url !== url, canonical, section: sectionFor(url), template: sectionFor(url), title, primaryHeading: headings[0] || title || null, internalLinks: links, images, embeds, migrationDisposition: migrationDisposition(url) };
  } catch (error) {
    return { url, finalUrl: null, status: null, redirected: false, canonical: null, section: sectionFor(url), template: sectionFor(url), title: null, primaryHeading: null, internalLinks: null, images: [], embeds: [], migrationDisposition: migrationDisposition(url), error: error.message };
  }
}

async function mapLimit(items, limit, task) {
  const results = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const index = next++; results[index] = await task(items[index]); }
  }));
  return results;
}

try {
const sitemapResponse = await fetch(sitemapUrl, { signal: AbortSignal.timeout(20000) });
if (!sitemapResponse.ok) throw new Error(`Sitemap request failed: ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const urls = [...new Set(matches(sitemap, /<loc>(.*?)<\/loc>/gi, (item) => item[1].trim()))];
const pages = await mapLimit(urls, 8, inspect);
const failures = pages.filter((page) => !page.status || page.status >= 400);
const imageSources = new Map();
for (const page of pages) for (const image of page.images) {
  if (!imageSources.has(image.src)) imageSources.set(image.src, { sourceUrl: image.src, alt: image.alt || null, discoveredOn: [page.url] });
  else imageSources.get(image.src).discoveredOn.push(page.url);
}
const report = {
  generatedAt: new Date().toISOString(),
  sitemap: sitemapUrl,
  totalUrls: urls.length,
  reachableUrls: pages.length - failures.length,
  failures: failures.map(({ url, status, error }) => ({ url, status, error })),
  internalLinksStatus: failures.length ? {
    status: "partial",
    availability: "partial",
    reason: "Internal-link extraction completed only for pages reached during this crawl.",
  } : {
    status: "current",
    availability: "complete",
    reason: null,
  },
  canonicalStatus: {
    status: "current",
    availability: "complete",
    reason: null,
  },
  pages,
};
const markdown = markdownFor(report, imageSources.size);
const csv = csvFor(pages);
let selectedReleaseAssets = [];
try { selectedReleaseAssets = JSON.parse(await readFile(path.join(outputDir, "assets-manifest.json"), "utf8")).selectedReleaseAssets || []; } catch { /* First inventory has no selected release assets. */ }
const assets = { generatedAt: report.generatedAt, source: "Current Jungfrau-Tächi public site", assets: [...imageSources.values()].sort((a, b) => a.sourceUrl.localeCompare(b.sourceUrl)).map((asset) => ({ ...asset, discoveredOn: [...new Set(asset.discoveredOn)] })), ...(selectedReleaseAssets.length ? { selectedReleaseAssets } : {}) };
await mkdir(outputDir, { recursive: true });
await Promise.all([
  writeFile(path.join(outputDir, "site-inventory.json"), `${JSON.stringify(report, null, 2)}\n`),
  writeFile(path.join(outputDir, "site-inventory.md"), markdown),
  writeFile(path.join(outputDir, "site-inventory.csv"), `${csv}\n`),
  writeFile(path.join(outputDir, "assets-manifest.json"), `${JSON.stringify(assets, null, 2)}\n`),
]);
console.log(`Inventory complete: ${report.totalUrls} sitemap URLs, ${report.reachableUrls} reachable, ${failures.length} failures, ${imageSources.size} unique images.`);
} catch (error) {
  await repairStoredHeadings(error);
}
