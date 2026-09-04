import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { appPath, assetUrl, routeFromPathname } from "../src/site-paths.js";

const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
const publishScript = await readFile(new URL("../scripts/publish-pages.mjs", import.meta.url), "utf8");
const viteConfig = await readFile(new URL("../vite.config.mjs", import.meta.url), "utf8");
const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");

test("project-site paths preserve route and asset URLs", () => {
  assert.equal(appPath("/fluggebiet/grund", "/website-stage/"), "/website-stage/fluggebiet/grund");
  assert.equal(assetUrl("/assets/source/hero-flight.jpg", "/website-stage/"), "/website-stage/assets/source/hero-flight.jpg");
  assert.equal(routeFromPathname("/website-stage/fluggebiet/grund", "/website-stage/"), "/fluggebiet/grund");
  assert.equal(routeFromPathname("/website-stage", "/website-stage/"), "/");
  assert.equal(appPath("/kontakt"), "/kontakt");
});

test("Pages workflow uses the official Actions deployment contract", () => {
  for (const action of ["actions/checkout@v4", "actions/configure-pages@v5", "actions/setup-node@v4", "actions/upload-pages-artifact@v4", "actions/deploy-pages@v4"]) assert.match(workflow, new RegExp(action.replaceAll("/", "\\/")));
  for (const permission of ["contents: read", "pages: write", "id-token: write"]) assert.ok(workflow.includes(permission));
  assert.match(workflow, /SITE_BASE: \$\{\{ steps\.pages\.outputs\.base_path \}\}/);
  assert.match(workflow, /path: dist\/client/);
  assert.match(workflow, /workflow_dispatch: \{\}/);
  assert.match(workflow, /branches:\s+\- main/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /npm run build:pages/);
  assert.ok(workflow.indexOf("- run: npm run build\n") < workflow.indexOf("- run: npm run test:sites"));
  assert.ok(workflow.indexOf("- run: npm run test:sites") < workflow.indexOf("- run: npm run build:pages"));
});

test("generated dependencies and build output stay out of the public repository", () => {
  for (const ignoredPath of ["node_modules/", "dist/", "src/generated-content.js", ".env", ".env.*", ".DS_Store", "Thumbs.db", ".idea/", ".vscode/"]) assert.ok(gitignore.includes(ignoredPath));
  assert.match(gitignore, /\/design-qa\*\.jpg/);
  assert.match(gitignore, /\/implementation-\*\.png/);
  assert.doesNotMatch(gitignore, /public\/assets|\/assets\/\*|^(?:\*\.png|\*\.jpg)$/m);
});

test("Pages build script creates the SPA 404 fallback", async () => {
  assert.match(packageJson, /"build:pages": "npm run content:build && vite build && node scripts\/create-pages-404\.mjs"/);
  assert.match(viteConfig, /process\.env\.SITE_BASE/);
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/client/404.html", import.meta.url));
  const [index, fallback] = await Promise.all([
    readFile(new URL("../dist/client/index.html", import.meta.url), "utf8"),
    readFile(new URL("../dist/client/404.html", import.meta.url), "utf8"),
  ]);
  assert.equal(fallback, index);
});

test("Pages publication falls back to an explicit dispatch when a push event is missing", () => {
  assert.match(packageJson, /"publish:pages": "node scripts\/publish-pages\.mjs"/);
  assert.match(publishScript, /"push", "origin", "main"/);
  assert.match(publishScript, /"run", "list"/);
  assert.match(publishScript, /"workflow", "run", "pages\.yml", "--ref", "main"/);
});
