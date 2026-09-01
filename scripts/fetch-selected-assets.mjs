import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const origin = "https://www.jungfrau-taechi.ch";
const proxyOrigin = "https://wsrv.nl/?url=jungfrau-taechi.ch";
const assetDir = path.resolve("public/assets/source");
const inventoryPath = path.resolve("content/inventory/assets-manifest.json");
const assets = [
  { filename: "toplogo.png", sourcePath: "/fotos/toplogo.png" },
  { filename: "toplogo-trimmed.png", sourcePath: "/fotos/toplogo.png", transform: "trim=10" },
  { filename: "hero-flight.jpg", sourcePath: "/uploaded_images/8ab5a660-1edb-4315-b453-387e648b07df.JPG" },
  { filename: "eigertour9a.jpg", sourcePath: "/images/blogposts/eigertour9a.jpg" },
  { filename: "fa2_26.jpg", sourcePath: "/images/blogposts/fa2_26.jpg" },
  { filename: "hf26_1_5.jpg", sourcePath: "/images/blogposts/hf26_1_5.jpg" },
  { filename: "50challenge.jpg", sourcePath: "/images/blogposts/50challenge.jpg" },
  { filename: "challenge50.jpg", sourcePath: "/images/blogposts/challenge50.jpg" },
  { filename: "fluggebiet-grindelwald-sidebar.jpg", sourcePath: "/fotos/Fluggebiet_Grindelwald_sidebar.jpg" },
  { filename: "flight-area-hero.jpg", sourcePath: "/fotos/fluggebiet_IMG_7848-(2).jpg" },
  { filename: "safety-grindelwald.jpg", sourcePath: "/fotos/Grindelwald.jpg" },
  { filename: "safety-eigergletscher.jpg", sourcePath: "/fotos/PDF/startplatzeigergletscher.jpg" },
  { filename: "safety-maennlichen.jpg", sourcePath: "/fotos/PDF/startplatzmaennlichen.jpg" },
  { filename: "safety-lauterbrunnen.jpg", sourcePath: "/uploaded_images/Lauterbrunnen.jpg" },
  { filename: "safety-meiringen.jpg", sourcePath: "/fotos/meiringen2024.jpg" },
  { filename: "safety-interlaken-1.jpg", sourcePath: "/fotos/interlaken1.jpg" },
  { filename: "safety-interlaken-2.jpg", sourcePath: "/fotos/interlaken2.jpg" },
  { filename: "xalps-2017.jpg", sourcePath: "/fotos/fotogalerien/X-AlpsGallery/02-(105)kl.jpg" },
  { filename: "clubausflug-bassano-2015.jpg", sourcePath: "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00745.jpg" },
  { filename: "clubfliegen-first-aspi-2015.jpg", sourcePath: "/fotos/fotogalerien/clubfliegen_20150919/IMG_1735_pascalimhof.com.jpg" },
];

const numberedAssets = (prefix, sourcePaths) => sourcePaths.map((sourcePath, index) => ({ filename: `${prefix}-${String(index + 1).padStart(2, "0")}.jpg`, sourcePath }));

assets.push(
  ...numberedAssets("gleckstein", [
    "/uploaded_images/40E23F17-068E-49BC-B688-280C77D74DD5.JPG", "/uploaded_images/BE0C78CE-CB09-41A0-860C-F324824332BF.JPG", "/uploaded_images/8ab5a660-1edb-4315-b453-387e648b07df.JPG", "/uploaded_images/31e640bc-cde7-407c-9a32-003febec21b5.JPG", "/uploaded_images/4847fb3c-6566-4aa6-ba7f-ac98eb9649b4.JPG", "/uploaded_images/fcd9bbe8-8fb7-467a-bec8-77385b55d8cc.JPG", "/uploaded_images/1c3cc4a0-1e2d-49ce-9130-32d5b1972694.JPG", "/uploaded_images/44fdadf5-4cb8-42b3-b5b7-7a21ee12adf9.JPG", "/uploaded_images/70e754e7-a34c-4406-a0e9-1b706413a7af.JPG", "/uploaded_images/f9a032c8-458c-4ea4-b7cb-07c3578a1f67.JPG", "/uploaded_images/4d194083-a5aa-4a41-93fc-4b5ef0b7484e.JPG", "/uploaded_images/943f0846-288d-4fd9-a4fc-516f2875f258.JPG",
  ]),
  ...numberedAssets("baeregg", [
    "/uploaded_images/hf26_1_1.jpg", "/uploaded_images/hf26_1_2.jpg", "/uploaded_images/hf26_1_3.jpg", "/uploaded_images/hf26_1_4.jpg", "/uploaded_images/hf26_1_5.jpg", "/uploaded_images/hf26_1_6.jpg", "/uploaded_images/hf26_1_7.jpg", "/uploaded_images/hf26_1_8.jpg", "/uploaded_images/hf26_1_9.jpg", "/uploaded_images/hf26_1_10.jpg", "/uploaded_images/hf26_1_11.jpg",
  ]),
  ...numberedAssets("xalps-gallery", [
    "/fotos/fotogalerien/X-AlpsGallery/02-(105)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/02-(136)xkl.jpg", "/fotos/fotogalerien/X-AlpsGallery/02-(54)dkl.jpg", "/fotos/fotogalerien/X-AlpsGallery/03-(41)jkl.jpg", "/fotos/fotogalerien/X-AlpsGallery/03-(55)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/03-(71)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/05-(32)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/05-(34)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/05-(36)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/07-(44)dkl.jpg", "/fotos/fotogalerien/X-AlpsGallery/07-(69)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/07-(87)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/09-(12)dkl.jpg", "/fotos/fotogalerien/X-AlpsGallery/09-(15)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/09-(19)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/09-(20)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/10-(29)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/11-(11)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/11-(12)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/11-(13)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/12-(11)jkl.jpg", "/fotos/fotogalerien/X-AlpsGallery/12-(17)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/12-(2)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/12-(5)dkl.jpg", "/fotos/fotogalerien/X-AlpsGallery/15-(6)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/16-(20kl).jpg", "/fotos/fotogalerien/X-AlpsGallery/16-(33kl).jpg", "/fotos/fotogalerien/X-AlpsGallery/16-(3kl).jpg", "/fotos/fotogalerien/X-AlpsGallery/17dkl.jpg", "/fotos/fotogalerien/X-AlpsGallery/19-(43)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/19-(7)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/20-(1a)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/20-(5)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/21-(24)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/21-(36)kl.jpg", "/fotos/fotogalerien/X-AlpsGallery/22-(1).jpg", "/fotos/fotogalerien/X-AlpsGallery/22-(2).jpg",
  ]),
  ...numberedAssets("bassano-gallery", [
    "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00745.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00766.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00775.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00778.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00781.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00782.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00783.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00790.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00791.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00800.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00809.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00812.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00815.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00820.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00824.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00826.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00829.jpg", "/fotos/fotogalerien/clubausflug_oktober_2015/DSC00830.jpg",
  ]),
  ...numberedAssets("clubfliegen-gallery", [
    "/fotos/fotogalerien/clubfliegen_20150919/IMG_1735_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1737_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1739_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1744_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1745_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1750_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1758_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1759_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1760_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1761_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1763_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1764_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1765_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1767_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1768_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1773_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1776_pascalimhof.com.jpg", "/fotos/fotogalerien/clubfliegen_20150919/IMG_1777_pascalimhof.com.jpg",
  ]),
);

// The arrays above retain the one-time migration map, but only assets still used
// by the current application belong in public/assets/source. Full article and
// gallery media lives under public/assets/archive.
const runtimeAssetNames = new Set([
  "50challenge.jpg",
  "challenge50.jpg",
  "clubausflug-bassano-2015.jpg",
  "clubfliegen-first-aspi-2015.jpg",
  "eigertour9a.jpg",
  "fa2_26.jpg",
  "fluggebiet-grindelwald-sidebar.jpg",
  "hero-flight.jpg",
  "hf26_1_5.jpg",
  "safety-eigergletscher.jpg",
  "safety-grindelwald.jpg",
  "safety-interlaken-1.jpg",
  "safety-interlaken-2.jpg",
  "safety-lauterbrunnen.jpg",
  "safety-maennlichen.jpg",
  "safety-meiringen.jpg",
  "xalps-2017.jpg",
]);
const runtimeAssets = assets.filter(({ filename }) => runtimeAssetNames.has(filename));

const imageType = (value) => /^image\/(?:jpeg|png|webp)$/i.test(value || "");
const nontrivial = async (file) => { try { return (await stat(file)).size > 4096; } catch { return false; } };
const dimensionsFor = (bytes) => {
  if (bytes.readUInt32BE(0) === 0x89504e47) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  for (let index = 2; index < bytes.length - 9; index += 1) if (bytes[index] === 0xff && [0xc0, 0xc1, 0xc2, 0xc3].includes(bytes[index + 1])) return { width: bytes.readUInt16BE(index + 7), height: bytes.readUInt16BE(index + 5) };
  return null;
};

await mkdir(assetDir, { recursive: true });
const results = [];
for (const { filename, sourcePath, transform = "" } of runtimeAssets) {
  if (!/^[a-z0-9_-]+\.(?:jpg|png)$/i.test(filename)) throw new Error(`Unsafe asset filename: ${filename}`);
  const destination = path.join(assetDir, filename);
  let bytes = null;
  let contentType = null;
  if (!(await nontrivial(destination))) {
    const retrievalProxy = `${proxyOrigin}${sourcePath}${transform ? `&${transform}` : ""}`;
    const response = await fetch(retrievalProxy, { signal: AbortSignal.timeout(60000) });
    contentType = response.headers.get("content-type")?.split(";", 1)[0] || "";
    if (!response.ok || !imageType(contentType)) throw new Error(`Asset fetch failed for ${filename}: ${response.status} ${contentType}`);
    bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length <= 4096) throw new Error(`Asset is too small for ${filename}: ${bytes.length} bytes`);
    await writeFile(destination, bytes);
  }
  const fileBytes = bytes || Buffer.from(await readFile(destination));
  const size = fileBytes.length;
  const dimensions = dimensionsFor(fileBytes);
  if (!dimensions || dimensions.width < 32 || dimensions.height < 32) throw new Error(`Asset dimensions invalid for ${filename}`);
  results.push({ filename, sourceUrl: `${origin}${sourcePath}`, localPath: `/assets/source/${filename}`, retrievalProxy: `${proxyOrigin}${sourcePath}${transform ? `&${transform}` : ""}`, transform: transform || null, contentType: contentType || (filename.endsWith(".png") ? "image/png" : "image/jpeg"), bytes: size, dimensions, reused: bytes === null });
}

const manifest = JSON.parse(await readFile(inventoryPath, "utf8"));
manifest.selectedReleaseAssets = results;
await writeFile(inventoryPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Selected assets ready: ${results.map((asset) => `${asset.filename} (${asset.bytes} bytes${asset.reused ? ", reused" : ""})`).join(", ")}`);
