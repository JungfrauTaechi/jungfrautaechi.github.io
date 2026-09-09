import { readFile, writeFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { panoramaLinks } from '../src/panorama-links.js';

const loopback = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const hosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const cameras = new Set(['first', 'eigergletscher', 'maennlichen', 'kleine-scheidegg', 'terminal', 'kirchbuehl', 'baeregg', 'glecksteinhuette']);
const winds = new Set(['fanet-BA-4', 'windline-4104', 'slf-MAN1', 'holfuy-1989']);

export function createMarkerSaveMiddleware(root) {
  let pending = Promise.resolve();
  return async (req, res, next) => {
    if (req.url?.split('?')[0] !== '/__local/marker-position') return next();
    const reply = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
    let origin;
    try { origin = new URL(req.headers.origin); } catch { /* Rejected below. */ }
    if (!loopback.has(req.socket.remoteAddress) || !origin || !hosts.has(origin.hostname) || origin.host !== req.headers.host || origin.protocol !== 'http:' || req.headers['sec-fetch-site'] && req.headers['sec-fetch-site'] !== 'same-origin') return reply(403, { error: 'Speichern ist nur direkt auf localhost möglich.' });
    if (req.method !== 'POST') return reply(405, { error: 'POST erforderlich.' });
    if (req.headers['content-type']?.split(';')[0] !== 'application/json') return reply(415, { error: 'JSON erforderlich.' });
    let data;
    try {
      let body = '';
      for await (const chunk of req) { body += chunk; if (body.length > 4096) return reply(413, { error: 'Anfrage zu gross.' }); }
      data = JSON.parse(body);
      const { sceneId, kind, id, position, hidden } = data;
      if (!Object.hasOwn(panoramaLinks, sceneId) || (position === undefined && typeof hidden !== 'boolean') || (hidden !== undefined && typeof hidden !== 'boolean')) throw new Error();
      if (position !== undefined && (!position || !Number.isFinite(position.yaw) || Math.abs(position.yaw) > 180 || !Number.isFinite(position.pitch) || Math.abs(position.pitch) > 90)) throw new Error();
      if (!(kind === 'webcam' && cameras.has(id) || kind === 'wind' && winds.has(id) || kind === 'panoramas' && panoramaLinks[sceneId].some(link => link.targetId === id))) throw new Error();
    } catch { return reply(400, { error: 'Ungültiger Marker oder ungültige Koordinaten.' }); }
    const save = pending.then(async () => {
      const { sceneId, kind, id, position, hidden } = data;
      const file = join(root, 'src', kind === 'webcam' ? 'panorama-webcams.json' : 'panorama-marker-overrides.json');
      const config = JSON.parse(await readFile(file, 'utf8'));
      config[sceneId] ??= {};
      const entries = kind === 'webcam' ? config[sceneId] : (config[sceneId][kind] ??= {});
      entries[id] = { ...entries[id], ...(position ? { yaw: position.yaw, pitch: position.pitch, provisional: false } : {}), ...(hidden !== undefined ? { hidden } : {}) };
      await writeFile(`${file}.tmp`, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
      await rename(`${file}.tmp`, file);
    });
    pending = save.catch(() => {});
    try { await save; reply(200, { saved: true }); }
    catch { reply(500, { error: 'Datei konnte nicht gespeichert werden. Koordinaten bleiben zum Kopieren verfügbar.' }); }
  };
}

export function markerEditorPlugin() {
  return { name: 'localhost-marker-editor', apply: 'serve', configureServer(server) { server.middlewares.use(createMarkerSaveMiddleware(server.config.root)); } };
}
