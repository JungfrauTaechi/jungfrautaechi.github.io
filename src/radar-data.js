export const RADAR_COLLECTION = 'https://data.geo.admin.ch/api/stac/v1/collections/ch.meteoschweiz.ogd-radar-precip';
export const RADAR_PAGE = 'https://www.meteoschweiz.admin.ch/service-und-publikationen/applikationen/niederschlag.html';
export const RADAR_BOUNDS = [2480000, 1060000, 2840000, 1320000]; // LV95, Switzerland
export const RADAR_WIDTH = 360;
export const RADAR_HEIGHT = 260;
export const RADAR_WINDOW_MS = 2 * 60 * 60 * 1000;
export const RADAR_REFRESH_MS = 5 * 60 * 1000;
export const RADAR_STALE_MS = 15 * 60 * 1000;
export const RADAR_COLOURS = [
  [0.1, 89, 158, 230], [0.5, 41, 110, 217], [1, 34, 182, 206],
  [2, 43, 173, 112], [5, 226, 206, 44], [10, 239, 135, 36],
  [20, 211, 52, 63], [50, 147, 57, 161],
];
export const RADAR_BASEMAP = 'https://wms.geo.admin.ch/?' + new URLSearchParams({
  SERVICE: 'WMS', REQUEST: 'GetMap', VERSION: '1.3.0', LAYERS: 'ch.swisstopo.pixelkarte-grau',
  STYLES: 'default', CRS: 'EPSG:2056', BBOX: RADAR_BOUNDS.join(','),
  WIDTH: '900', HEIGHT: '650', FORMAT: 'image/jpeg',
});
export const radarTime = epoch => new Intl.DateTimeFormat('de-CH', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }).format(epoch);
export const radarDateTime = epoch => new Intl.DateTimeFormat('de-CH', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Zurich' }).format(epoch);

export function radarAssetTime(name) {
  const match = /^rzc(\d{2})(\d{3})(\d{2})(\d{2})[a-z0-9]{2}\.\d{3}\.h5$/i.exec(name);
  if (!match) return null;
  const [, year, day, hour, minute] = match.map((value, index) => index ? Number(value) : value);
  const epoch = Date.UTC(2000 + year, 0, day, hour, minute);
  if (day < 1 || hour > 23 || minute > 59 || new Date(epoch).getUTCFullYear() !== 2000 + year) return null;
  return epoch;
}

export function selectRadarFrames(items, now = Date.now()) {
  const byTime = new Map();
  for (const item of items) for (const [name, asset] of Object.entries(item.assets || {})) {
    const epoch = radarAssetTime(name);
    if (epoch === null || epoch > now || epoch < now - RADAR_WINDOW_MS) continue;
    let url;
    try { url = new URL(asset?.href); } catch { continue; }
    if (url.origin !== 'https://data.geo.admin.ch' || !url.pathname.startsWith('/ch.meteoschweiz.ogd-radar-precip/') || !url.pathname.endsWith('/' + name)) continue;
    const frame = { epoch, url: url.href, updated: asset.updated || asset.created || '' };
    if (!byTime.has(epoch) || frame.updated > byTime.get(epoch).updated) byTime.set(epoch, frame);
  }
  return [...byTime.values()].sort((a, b) => a.epoch - b.epoch).slice(-25);
}

export async function radarFetch(url, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl(url, { signal: controller.signal, credentials: 'omit' });
    if (!response.ok) throw new Error(`Radar HTTP ${response.status}`);
    // Read the body before clearing the deadline: slow body transfers also time out.
    return new Uint8Array(await response.arrayBuffer());
  } finally { clearTimeout(timer); }
}

export async function loadRadarFrames(now = Date.now(), fetchImpl = fetch) {
  const dates = [...new Set([now, now - RADAR_WINDOW_MS].map(epoch => new Date(epoch).toISOString().slice(0, 10).replaceAll('-', '')))];
  const results = await Promise.allSettled(dates.map(async date => {
    const bytes = await radarFetch(`${RADAR_COLLECTION}/items/${date}-ch`, fetchImpl);
    return JSON.parse(new TextDecoder().decode(bytes));
  }));
  const frames = selectRadarFrames(results.filter(result => result.status === 'fulfilled').map(result => result.value), now);
  if (!frames.length) throw new Error('Keine aktuellen Radarbilder verfügbar.');
  return { frames, partial: results.some(result => result.status === 'rejected') };
}
