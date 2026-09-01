#!/usr/bin/env node
import { copyFile, access } from "node:fs/promises";
import path from "node:path";

const clientDir = path.resolve("dist/client");
const index = path.join(clientDir, "index.html");
const fallback = path.join(clientDir, "404.html");

await access(index);
await copyFile(index, fallback);
console.log("Created GitHub Pages SPA fallback: dist/client/404.html");
