import { readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { localMediaPath, photoGalleryDirectory } from "./content-validation.mjs";

const filenameOrder = new Intl.Collator("de", { numeric: true, sensitivity: "variant" });

// Existing galleries stay explicit. Directory reports discover photos at build
// time; explicit entries may supply descriptions or append additional images.
export async function resolvePhotoGallery(record, root) {
  if (!record.galleryDirectory) return record.gallery || [];
  const directoryUrl = photoGalleryDirectory(record.galleryDirectory);
  const publicRoot = await realpath(path.join(root, "public"));
  const directory = await realpath(path.join(publicRoot, directoryUrl.slice(1)));
  const relative = path.relative(publicRoot, directory);
  if (relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
    throw new Error("galleryDirectory must stay inside the public media tree");
  }

  const files = (await readdir(directory, { withFileTypes: true }))
    .filter(file => file.isFile() && /\.(?:jpe?g|png|webp)$/i.test(file.name))
    .sort((a, b) => filenameOrder.compare(a.name, b.name) || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  if (!files.length) throw new Error(`${directoryUrl}: no JPEG, PNG or WebP photos found`);

  const manual = record.gallery || [];
  const imageKey = src => localMediaPath(src) || src;
  const descriptions = new Map(manual.map(image => [imageKey(image.src), image]));
  const discovered = files.map((file, index) => {
    const src = `${directoryUrl}/${encodeURIComponent(file.name)}`;
    const override = descriptions.get(imageKey(src));
    return { ...override, src, alt: override?.alt?.trim() || `${record.title} – Bild ${index + 1}` };
  });
  const discoveredKeys = new Set(discovered.map(image => imageKey(image.src)));
  return [...discovered, ...manual.filter(image => !discoveredKeys.has(imageKey(image.src)))];
}
