import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import * as cheerio from 'cheerio';

// Read-only audit: compares the saved cover with the source lead image using
// the same image transformation as the archive importer. Never edits articles.
const output = '../audit/news-heroes';
await mkdir(output, { recursive: true });
const files = (await readdir('content/news')).filter(f => f.endsWith('.md')).sort();
const results = [];
const inventory = JSON.parse(await readFile('content/inventory/site-inventory.json', 'utf8'));
const inventoryOnly = process.argv.includes('--inventory');
const hash = b => createHash('sha256').update(b).digest('hex');
async function get(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
      return response;
    } catch (error) { if (attempt === 2) throw error; }
  }
}
let cursor = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (cursor < files.length) {
    const file = files[cursor++];
    const { data } = matter(await readFile(`content/news/${file}`, 'utf8'));
    const row = { file, title: data.title, sourceUrl: data.sourceUrl, coverImage: data.coverImage };
    try {
      if (!data.sourceUrl) row.status = 'no-source-url';
      else {
        const saved = inventory.pages.find(p => p.url.replace('www.', '') === data.sourceUrl.replace('www.', ''));
        const savedHero = saved?.images.find(i => i.src.includes('/images/blogposts/'))?.src;
        const html = inventoryOnly && savedHero ? `<div class="blog-post"><img src="${savedHero}"></div>` : await (await get(data.sourceUrl)).text();
        row.sourceEvidence = inventoryOnly && savedHero ? `Source inventory from ${inventory.generatedAt}` : 'Live source article';
        const $ = cheerio.load(html);
        const post = $('.blog-post').first();
        if (!post.length) throw new Error('Source has no article');
        const src = post.find('img').first().attr('src');
        if (!src) row.status = data.coverImage ? 'source-has-no-image' : 'match-no-image';
        else {
          const url = new URL(src, data.sourceUrl); url.search = '';
          row.sourceHero = url.href;
          if (data.coverImage === row.sourceHero) row.status = 'match-source-url';
          else {
            const response = await get(`https://wsrv.nl/?url=${encodeURIComponent(row.sourceHero)}&w=1400&q=78&output=jpg`);
            if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error('Source returned non-image');
            const expected = Buffer.from(await response.arrayBuffer());
            const actual = data.coverImage?.startsWith('/') ? await readFile(`public${data.coverImage}`) : Buffer.from(await (await get(data.coverImage)).arrayBuffer());
            row.localSha256 = hash(actual); row.sourceSha256 = hash(expected);
            row.status = row.localSha256 === row.sourceSha256 ? 'match-bytes' : 'needs-image-review';
            if (row.status === 'needs-image-review') await writeFile(`${output}/${file.replace('.md', '.jpg')}`, expected);
          }
        }
      }
    } catch (error) { row.status = 'unverified'; row.error = error.message; }
    results.push(row);
    await writeFile(`${output}/${file.replace('.md', '.json')}`, JSON.stringify(row, null, 2) + '\n');
    if (results.length % 25 === 0) console.log(`Checked ${results.length}/${files.length}`);
  }
}));
results.sort((a,b) => a.file.localeCompare(b.file));
const counts = {};
for (const row of results) counts[row.status] = (counts[row.status] || 0) + 1;
await writeFile(`${output}/report.json`, JSON.stringify({ checkedAt: new Date().toISOString(), counts, results }, null, 2) + '\n');
console.log(JSON.stringify(counts));
