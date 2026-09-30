export function validateRecord(record) {
  const issues = [];
  if (typeof record.title !== "string" || !record.title.trim()) issues.push("title is required");
  if (typeof record.slug !== "string" || !/^[a-z0-9][a-z0-9-]*$/.test(record.slug)) issues.push("slug must contain lowercase letters, digits or hyphens");
  if (record.date && (!/^\d{4}-\d{2}-\d{2}$/.test(record.date) || Number.isNaN(Date.parse(record.date)) || new Date(record.date).toISOString().slice(0, 10) !== record.date)) issues.push("date must be a valid YYYY-MM-DD date");
  if (!record.date && !record.sourceUrl) issues.push("date is required for new content");
  if (record.gallery !== undefined && !Array.isArray(record.gallery)) issues.push("gallery must be a list");
  if (record.galleryDirectory !== undefined && record.galleryDirectory !== "") {
    if (record.kind !== "photo-report") issues.push("galleryDirectory is only supported for photo reports");
    try { photoGalleryDirectory(record.galleryDirectory); } catch (error) { issues.push(error.message); }
  }
  return issues;
}

export function photoGalleryDirectory(value) {
  if (typeof value !== "string" || !/^\/media\/photos\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*\/?$/.test(value)) {
    throw new Error("galleryDirectory must be a folder under /media/photos/ using letters, digits, underscores or hyphens");
  }
  return value.replace(/\/$/, "");
}

export function localMediaPath(src) {
  if (typeof src !== "string" || !src) return null;
  if (/^https?:\/\//i.test(src)) return null;
  const decoded = decodeURIComponent(src);
  if (!/^\/(assets|media)\//.test(decoded) || decoded.includes("\\") || decoded.split("/").includes("..")) throw new Error(`Invalid local image path: ${src}`);
  return decoded.slice(1);
}
