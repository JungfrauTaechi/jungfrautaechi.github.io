import { readdir, stat } from "node:fs/promises";
import path from "node:path";

async function directoryBytes(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const sizes = await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? directoryBytes(file) : (await stat(file)).size;
  }));
  return sizes.reduce((total, bytes) => total + bytes, 0);
}

const bytes = await directoryBytes("dist/client");
console.log(`Pages site size: ${(bytes / 1e6).toFixed(1)} MB / 1000 MB.`);
if (bytes >= 1e9) throw new Error("Site exceeds GitHub Pages' 1 GB published-site limit. Optimize assets before publishing.");
