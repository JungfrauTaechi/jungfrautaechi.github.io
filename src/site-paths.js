export const normalizeBasePath = (basePath = "/") => {
  const path = String(basePath || "/").replace(/^\/+|\/+$/g, "");
  return path ? `/${path}/` : "/";
};

export const appPath = (path, basePath = "/") => {
  const base = normalizeBasePath(basePath).replace(/\/$/, "");
  const target = String(path || "/").startsWith("/") ? String(path || "/") : `/${path}`;
  return `${base}${target}` || "/";
};

export const routeFromPathname = (pathname, basePath = "/") => {
  const normalizedPath = String(pathname || "/");
  const base = normalizeBasePath(basePath);
  if (base === "/") return normalizedPath;
  const withoutTrailingSlash = base.slice(0, -1);
  if (normalizedPath === withoutTrailingSlash) return "/";
  return normalizedPath.startsWith(base) ? normalizedPath.slice(withoutTrailingSlash.length) || "/" : normalizedPath;
};

export const assetUrl = (assetPath, basePath = "/") => appPath(assetPath, basePath);
