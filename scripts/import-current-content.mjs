import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import matter from "gray-matter";
import TurndownService from "turndown";

const root = path.resolve(".");
const inventoryPath = path.join(root, "content/inventory/site-inventory.json");
const newsDir = path.join(root, "content/news");
const photoDir = path.join(root, "content/photo-reports");
const mediaRoot = path.join(root, "public/assets/archive");
const origin = "https://jungfrau-taechi.ch";
const proxy = "https://wsrv.nl/";
const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });
turndown.remove(["script", "style", "link", "iframe", "form"]);

const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
let newsPages = inventory.pages.filter((page) => /^https:\/\/[^/]+\/newsfeed\/[^/?#]+\/?$/i.test(page.url));
const args = new Set(process.argv.slice(2));
const skipMedia = args.has("--skip-media");

await Promise.all([newsDir, photoDir, mediaRoot].map((directory) => mkdir(directory, { recursive: true })));

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const safeSlug = (value) => decodeURIComponent(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || createHash("sha1").update(value).digest("hex").slice(0, 10);
const absoluteUrl = (value, base = origin) => {
  if (!value) return null;
  try { const url = new URL(value, base); url.search = ""; return url.href; } catch { return null; }
};
const nontrivial = async (file) => { try { return (await stat(file)).size > 4096; } catch { return false; } };
const fetchWithRetry = async (url, attempts = 3) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "Jungfrau-Taechi archive migration" }, signal: AbortSignal.timeout(60000) });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await sleep(attempt * 900);
    }
  }
  throw lastError;
};
const parallelMap = async (items, concurrency, worker) => {
  const output = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      output[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return output;
};
const normalizeDate = (raw) => {
  const value = String(raw || "").replace(/\s+/g, " ").trim();
  const match = value.match(/(\d{1,2})[-.\/]([A-Za-zÄÖÜäöü]{3,}|\d{1,2})[-.\/](\d{2,4})/);
  if (!match) return "1970-01-01";
  const months = { jan: 1, januar: 1, feb: 2, februar: 2, mar: 3, marz: 3, maerz: 3, mär: 3, märz: 3, apr: 4, april: 4, may: 5, mai: 5, jun: 6, juni: 6, jul: 7, juli: 7, aug: 8, august: 8, sep: 9, sept: 9, september: 9, oct: 10, okt: 10, oktober: 10, nov: 11, november: 11, dec: 12, dez: 12, dezember: 12 };
  const monthToken = match[2].toLowerCase();
  const month = /^\d+$/.test(monthToken) ? Number(monthToken) : months[monthToken] || months[monthToken.slice(0, 3)] || 1;
  const year = Number(match[3]) < 100 ? 2000 + Number(match[3]) : Number(match[3]);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(Number(match[1])).padStart(2, "0")}`;
};
const summaryFrom = (text) => {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= 220) return clean;
  return `${clean.slice(0, 217).replace(/\s+\S*$/, "")}…`;
};
const downloadImage = async ({ sourceUrl, collection, index, caption = "" }) => {
  const folder = path.join(mediaRoot, collection);
  await mkdir(folder, { recursive: true });
  const filename = `${String(index + 1).padStart(3, "0")}.jpg`;
  const destination = path.join(folder, filename);
  const publicPath = `/assets/archive/${collection}/${filename}`;
  if (!skipMedia && !(await nontrivial(destination))) {
    const requestUrl = `${proxy}?url=${encodeURIComponent(sourceUrl)}&w=1400&q=78&output=jpg`;
    const response = await fetchWithRetry(requestUrl);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) throw new Error(`Not an image: ${sourceUrl}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length < 4096) throw new Error(`Image too small: ${sourceUrl}`);
    await writeFile(destination, bytes);
  }
  return { src: publicPath, alt: caption || "", sourceUrl };
};
const uniqueImages = ($, $root, baseUrl) => {
  const seen = new Set();
  const images = [];
  $root.find("img").each((_, node) => {
    const sourceUrl = absoluteUrl($(node).attr("src"), baseUrl);
    if (!sourceUrl || seen.has(sourceUrl)) return;
    seen.add(sourceUrl);
    images.push({ sourceUrl, caption: $(node).attr("alt")?.trim() || "" });
  });
  return images;
};

try {
  const liveIndexHtml = await (await fetchWithRetry(`${origin}/newsfeed`)).text();
  const live$ = cheerio.load(liveIndexHtml);
  const known = new Set(newsPages.map((page) => new URL(page.url).pathname.replace(/\/$/, "")));
  live$(".post-list a[href^='/newsfeed/']").each((_, anchor) => {
    const url = absoluteUrl(live$(anchor).attr("href"), origin);
    if (!url) return;
    const pathname = new URL(url).pathname.replace(/\/$/, "");
    if (known.has(pathname)) return;
    known.add(pathname);
    newsPages.push({ url });
  });
} catch (error) {
  console.warn(`Live news index unavailable; continuing with inventory: ${error.message}`);
}

const newsFailures = [];
let completedNews = 0;
await parallelMap(newsPages, 4, async (page) => {
  const sourceUrl = page.url.replace("https://www.", "https://");
  const sourceSlug = new URL(sourceUrl).pathname.split("/").filter(Boolean).at(-1);
  const slug = safeSlug(sourceSlug);
  try {
    const html = await (await fetchWithRetry(sourceUrl)).text();
    const $ = cheerio.load(html);
    const post = $(".blog-post").first();
    if (!post.length) throw new Error("Missing .blog-post");
    const title = post.find("h2").first().text().replace(/\s+/g, " ").trim() || sourceSlug;
    const date = normalizeDate(post.find("h5").first().text());
    const imageInputs = uniqueImages($, post, sourceUrl);
    const gallery = [];
    await parallelMap(imageInputs, 4, async (image, index) => {
      try { gallery[index] = await downloadImage({ ...image, collection: `news/${slug}`, index }); }
      catch { gallery[index] = { src: image.sourceUrl, alt: image.caption, sourceUrl: image.sourceUrl, remoteFallback: true }; }
    });
    const body = post.clone();
    body.find("h2").first().remove();
    body.find("h5").first().remove();
    body.find("img,script,style,link").remove();
    body.find("a").filter((_, node) => /zurück|startseite/i.test($(node).text())).remove();
    body.find("a").filter((_, node) => !$(node).text().replace(/\u00a0/g, " ").trim()).remove();
    body.find("a[href]").each((_, node) => { const href = absoluteUrl(node.attribs?.href, sourceUrl); if (href) node.attribs.href = href; });
    body.find("div,p").each((_, node) => { if (!$(node).text().replace(/\u00a0/g, " ").trim() && !$(node).find("a").length) $(node).remove(); });
    let markdown = turndown.turndown(body.html() || "").replace(/\n{3,}/g, "\n\n").trim();
    if (!markdown) markdown = "Dieser archivierte Beitrag enthält ausschliesslich Bildmaterial.";
    const document = matter.stringify(`${markdown}\n`, {
      kind: "news",
      slug,
      title,
      date,
      category: "Clubleben",
      summary: summaryFrom(body.text()),
      coverImage: gallery[0]?.src || "",
      gallery: gallery.map(({ src, alt }) => ({ src, alt })),
      sourceUrl,
    });
    await writeFile(path.join(newsDir, `${slug}.md`), document);
  } catch (error) {
    newsFailures.push({ sourceUrl, error: error.message });
  }
  completedNews += 1;
  if (completedNews % 20 === 0 || completedNews === newsPages.length) console.log(`News: ${completedNews}/${newsPages.length}`);
});

const photoPageUrl = `${origin}/sites/fotoreports.htm`;
const photoHtml = await (await fetchWithRetry(photoPageUrl)).text();
const photo$ = cheerio.load(photoHtml);
const gallerySections = [];
photo$(".photogalleryTable").each((_, table) => {
  const tableContainer = photo$(table).closest("p");
  const heading = (tableContainer.length ? tableContainer.prevAll("h2").first() : photo$(table).prevAll("h2").first()).text().replace(/\s+/g, " ").trim();
  const seen = new Set();
  const images = [];
  photo$(table).find("a[href*='/fotos/fotogalerien/']").each((__, anchor) => {
    const sourceUrl = absoluteUrl(photo$(anchor).attr("href"), photoPageUrl);
    if (!sourceUrl || seen.has(sourceUrl)) return;
    seen.add(sourceUrl);
    images.push({ sourceUrl, caption: photo$(anchor).attr("title")?.replace(/\s+/g, " ").trim() || "" });
  });
  if (heading && images.length) gallerySections.push({ heading, images });
});

const photoFailures = [];
await parallelMap(gallerySections, 2, async ({ heading, images }) => {
  const slug = safeSlug(heading);
  const gallery = [];
  await parallelMap(images, 4, async (image, index) => {
    try { gallery[index] = await downloadImage({ ...image, collection: `photos/${slug}`, index }); }
    catch (error) { gallery[index] = { src: image.sourceUrl, alt: image.caption, sourceUrl: image.sourceUrl, remoteFallback: true }; photoFailures.push({ sourceUrl: image.sourceUrl, error: error.message }); }
  });
  const date = normalizeDate(heading);
  const cleanTitle = heading.replace(/,?\s*\d{1,2}[.\/-]\s*[A-Za-zÄÖÜäöü]+\s*\d{4}.*$/i, "").trim();
  const document = matter.stringify("", {
    kind: "photo-report",
    slug,
    title: cleanTitle || heading,
    date,
    detail: heading === cleanTitle ? "Fotoreport" : heading.slice(cleanTitle.length).replace(/^,\s*/, ""),
    coverImage: gallery[0]?.src || "",
    gallery: gallery.map(({ src, alt }) => ({ src, alt })),
    sourceUrl: photoPageUrl,
  });
  await writeFile(path.join(photoDir, `${slug}.md`), document);
  console.log(`Fotoreport: ${heading} (${images.length} Bilder)`);
});

const report = {
  generatedAt: new Date().toISOString(),
  requestedNews: newsPages.length,
  importedNews: newsPages.length - newsFailures.length,
  newsFailures,
  importedPhotoReports: gallerySections.length,
  photoImageFailures: photoFailures,
  mediaMode: skipMedia ? "metadata-only" : "localized",
};
await writeFile(path.join(root, "content/inventory/content-import-report.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Import complete: ${report.importedNews}/${report.requestedNews} news, ${report.importedPhotoReports} photo reports, ${photoFailures.length} photo image fallbacks.`);
