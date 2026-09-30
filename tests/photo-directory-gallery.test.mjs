import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, symlink, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolvePhotoGallery } from "../scripts/photo-directory-gallery.mjs";
import { validateRecord } from "../scripts/content-validation.mjs";

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), "taechi-gallery-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, "public/media/photos/clubausflug");
  await mkdir(directory, { recursive: true });
  return { root, directory };
}

const report = { kind: "photo-report", slug: "clubausflug", title: "Clubausflug", date: "2026-09-30", galleryDirectory: "/media/photos/clubausflug" };

test("directory galleries include supported photos once in natural filename order", async t => {
  const { root, directory } = await fixture(t);
  await Promise.all(["bild-10.JPG", "bild-2.webp", "bild-1.png", "gruppe #1.jpeg", "notes.txt"].map(name => writeFile(path.join(directory, name), "fixture")));
  await mkdir(path.join(directory, "subfolder"));
  await writeFile(path.join(directory, "subfolder/hidden.jpg"), "fixture");
  const gallery = await resolvePhotoGallery(report, root);
  assert.deepEqual(gallery.map(image => image.src), ["bild-1.png", "bild-2.webp", "bild-10.JPG", "gruppe%20%231.jpeg"].map(name => `/media/photos/clubausflug/${name}`));
  assert.equal(gallery[0].alt, "Clubausflug – Bild 1");
  assert.equal(gallery.length, 4);
});

test("explicit galleries retain their original order when no directory is set", async () => {
  const gallery = [{ src: "/assets/old.jpg", alt: "Start" }, { src: "/media/photos/example.jpg", alt: "Landung" }];
  assert.deepEqual(await resolvePhotoGallery({ gallery }, "unused"), gallery);
  assert.deepEqual(await resolvePhotoGallery({ galleryDirectory: "", gallery }, "unused"), gallery);
});

test("optional descriptions override discovered photos without duplicating them", async t => {
  const { root, directory } = await fixture(t);
  await writeFile(path.join(directory, "gruppe #1.jpg"), "fixture");
  const gallery = await resolvePhotoGallery({ ...report, gallery: [
    { src: "/media/photos/clubausflug/gruppe #1.jpg", alt: "Clubgruppe auf First" },
    { src: "/assets/extra.jpg", alt: "Ein zusätzliches Archivfoto" },
  ] }, root);
  assert.equal(gallery.length, 2);
  assert.equal(gallery[0].alt, "Clubgruppe auf First");
  assert.equal(gallery[1].src, "/assets/extra.jpg");
});

test("invalid directory paths and directory galleries on news are rejected", async () => {
  for (const directory of ["../private", "/media/photos/../secret", "/media/photos/%2e%2e/secret", "/media/news/folder", "/assets/folder", "/media/photos/folder\\secret", null, 42]) {
    assert.ok(validateRecord({ ...report, galleryDirectory: directory }).length, String(directory));
    await assert.rejects(resolvePhotoGallery({ ...report, galleryDirectory: directory || "../private" }, "unused"));
  }
  assert.ok(validateRecord({ ...report, kind: "news" }).length);
  assert.deepEqual(validateRecord({ ...report, galleryDirectory: "/media/photos/clubausflug/" }), []);
});

test("empty, missing and escaping directory links cannot produce a published gallery", async t => {
  const { root, directory } = await fixture(t);
  await assert.rejects(resolvePhotoGallery(report, root), /no JPEG, PNG or WebP/);
  await assert.rejects(resolvePhotoGallery({ ...report, galleryDirectory: "/media/photos/missing" }, root), /ENOENT/);
  const outside = path.join(root, "private");
  await mkdir(outside);
  await writeFile(path.join(outside, "private.jpg"), "fixture");
  await symlink(outside, path.join(directory, "escape"), process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(resolvePhotoGallery({ ...report, galleryDirectory: "/media/photos/clubausflug/escape" }, root), /inside the public media tree/);
});

test("the content build discovers uploads and deletions and omits directory drafts", async t => {
  const { root, directory } = await fixture(t);
  await mkdir(path.join(root, "content/site"), { recursive: true });
  await mkdir(path.join(root, "content/photo-reports"), { recursive: true });
  await mkdir(path.join(root, "src"));
  for (const [name, value] of Object.entries({ programme: [], portrait: ["Club"], purposes: [{ number: "1", title: "Fliegen", text: "Gemeinsam" }] })) {
    await writeFile(path.join(root, `content/site/${name}.json`), JSON.stringify(value));
  }
  await writeFile(path.join(root, "content/photo-reports/clubausflug.md"), "---\nkind: photo-report\nslug: clubausflug\ntitle: Clubausflug\ndate: '2026-09-30'\ngalleryDirectory: /media/photos/clubausflug\n---\n");
  await writeFile(path.join(root, "content/photo-reports/draft.md"), "---\ndraft: true\ngalleryDirectory: /media/photos/missing\n---\n");
  const compile = () => execFileSync(process.execPath, [fileURLToPath(new URL("../scripts/compile-content.mjs", import.meta.url))], { cwd: root, encoding: "utf8" });
  await writeFile(path.join(directory, "bild-1.jpg"), "fixture");
  await writeFile(path.join(directory, "bild-2.jpg"), "fixture");
  assert.match(compile(), /0 news articles and 1 photo reports/);
  let output = await readFile(path.join(root, "src/generated-content.js"), "utf8");
  assert.match(output, /bild-1\.jpg/);
  assert.match(output, /bild-2\.jpg/);
  await unlink(path.join(directory, "bild-2.jpg"));
  await writeFile(path.join(directory, "bild-3.jpg"), "fixture");
  compile();
  output = await readFile(path.join(root, "src/generated-content.js"), "utf8");
  assert.doesNotMatch(output, /bild-2\.jpg/);
  assert.match(output, /bild-3\.jpg/);
  assert.doesNotMatch(output, /media\/photos\/missing/);
});
