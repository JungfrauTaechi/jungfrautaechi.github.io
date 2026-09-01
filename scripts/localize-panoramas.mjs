import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const scenes = {
  first: "gleitschirm_startpla_1777",
  waldspitz: "startplatz_waldspitz_20804",
  maennlichen: "startplatz_mannliche_20789",
  muerren: "startplatz_murren_20989",
  grund: "landeplatz_grindelwa_20642",
  bodmi: "landeplatz_grindelwa_20641",
  stechelberg: "stechelberg_schiltho_20344",
  lauterbrunnen: "landeplatz_lauterbru_20643",
};

const outputRoot = path.resolve("public/assets/panoramas");
const sourceRoot = "jungfrau-taechi.ch/sites/dcjt360_bootstrapdata";

async function fetchImage(sourcePath) {
  const sourceUrl = `${sourceRoot}/${sourcePath}`;
  const proxyUrl = `https://wsrv.nl/?url=${encodeURIComponent(sourceUrl)}&output=jpg&q=84`;
  const response = await fetch(proxyUrl, { headers: { "User-Agent": "Jungfrau-Taechi-Migration/1.0" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${sourcePath}`);
  return Buffer.from(await response.arrayBuffer());
}

await mkdir(outputRoot, { recursive: true });

for (const [sceneId, sourceDirectory] of Object.entries(scenes)) {
  const sceneDirectory = path.join(outputRoot, sceneId);
  await mkdir(sceneDirectory, { recursive: true });

  const files = [
    ...Array.from({ length: 6 }, (_, index) => ({ source: `${sourceDirectory}/mobile/${index}.jpg`, target: `${index}.jpg` })),
    { source: `${sourceDirectory}/thumbnail.jpg`, target: "thumbnail.jpg" },
  ];

  for (const file of files) {
    const image = await fetchImage(file.source);
    await writeFile(path.join(sceneDirectory, file.target), image);
    process.stdout.write(`Saved ${sceneId}/${file.target} (${Math.round(image.length / 1024)} KB)\n`);
  }
}
