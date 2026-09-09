import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const pattern = /https?:\/\/(?:www\.)?jungfrau-taechi\.ch\/[^\s'"<>\)]+/g;
const isImage = url => /\.(?:jpe?g|png|gif|webp|svg|avif)(?:[?#]|$)/i.test(url);
const files = [];
async function scan(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await scan(file);
    else if (/\.(?:js|jsx|css|md)$/.test(file) && entry.name !== 'generated-content.js') files.push(file);
  }
}
for (const dir of ['src', 'content/news', 'content/photo-reports']) await scan(dir);
const documents = await Promise.all(files.map(async file => ({ file, text: await readFile(file, 'utf8') })));
const urls = [...new Set(documents.flatMap(doc => (doc.text.match(pattern) || []).filter(isImage)))].sort();
const manifestFile = 'content/inventory/localized-legacy-images.json';
let records = {};
try { records = JSON.parse(await readFile(manifestFile, 'utf8')).images || {}; } catch {}
await mkdir('public/assets/legacy-images', { recursive: true });
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const inventory = JSON.parse(await readFile('content/inventory/assets-manifest.json', 'utf8')).assets;
const basename = url => decodeURIComponent(new URL(url).pathname).split('/').pop().toLowerCase();
let done = 0;
for (const sourceUrl of urls) {
  const previous = records[sourceUrl];
  if (previous?.localPath) {
    try { if (digest(await readFile(`public${previous.localPath}`)) === previous.sha256) { done++; continue; } } catch {}
  }
  try {
    let fetchedFrom = sourceUrl;
    let response = await fetch(sourceUrl, { signal: AbortSignal.timeout(12000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
      fetchedFrom = `https://wsrv.nl/?url=${encodeURIComponent(sourceUrl)}&w=1400&q=78&output=jpg`;
      response = await fetch(fetchedFrom, { signal: AbortSignal.timeout(20000) });
    }
    if (!response.ok) {
      const alternatives = inventory.filter(a => a.sourceUrl !== sourceUrl && basename(a.sourceUrl) === basename(sourceUrl));
      for (const alternative of alternatives) {
        fetchedFrom = alternative.sourceUrl;
        response = await fetch(fetchedFrom, { signal: AbortSignal.timeout(12000) });
        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) break;
      }
    }
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw Error(`Invalid image response: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw Error('Empty image');
    const ext = fetchedFrom === sourceUrl ? path.extname(new URL(sourceUrl).pathname).toLowerCase() : '.jpg';
    const localPath = `/assets/legacy-images/${digest(Buffer.from(sourceUrl)).slice(0, 20)}${ext}`;
    await writeFile(`public${localPath}`, bytes);
    records[sourceUrl] = { localPath, fetchedFrom, sha256: digest(bytes), bytes: bytes.length, contentType: response.headers.get('content-type'), downloadedAt: new Date().toISOString() };
  } catch (error) { records[sourceUrl] = { error: error.message, checkedAt: new Date().toISOString() }; }
  await writeFile(manifestFile, JSON.stringify({ images: records }, null, 2) + '\n');
  if (++done % 20 === 0) console.log(`Images ${done}/${urls.length}`);
}
let changed = 0;
for (const doc of documents) {
  const updated = doc.text.replace(pattern, url => records[url]?.localPath || url);
  if (updated !== doc.text) { await writeFile(doc.file, updated); changed++; }
}
const failures = urls.filter(url => !records[url]?.localPath);
console.log(JSON.stringify({ requested: urls.length, copied: urls.length - failures.length, changedFiles: changed, failures }, null, 2));
if (failures.length) process.exitCode = 1;
