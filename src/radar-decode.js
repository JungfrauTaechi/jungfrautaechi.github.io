import proj4 from 'proj4';
import { RADAR_BOUNDS, RADAR_WIDTH, RADAR_HEIGHT, RADAR_COLOURS } from './radar-data.js';

export const hdfAttributes = group => Object.fromEntries(Object.entries(group.attrs).map(([key, attr]) => [key, typeof attr.value === 'bigint' ? Number(attr.value) : attr.value]));

export function radarGrid(where) {
  if (!where.projdef?.includes('+proj=somerc') || !where.projdef.includes('+x_0=2600000') || !where.projdef.includes('+y_0=1200000') || where.xscale !== 1000 || where.yscale !== 1000 || where.xsize !== 710 || where.ysize !== 640) throw new Error('Unbekanntes Radar-Koordinatensystem.');
  const ll = proj4('WGS84', where.projdef, [where.LL_lon, where.LL_lat]);
  const ul = proj4('WGS84', where.projdef, [where.UL_lon, where.UL_lat]);
  const ur = proj4('WGS84', where.projdef, [where.UR_lon, where.UR_lat]);
  // ODIM corners are rounded geographic coordinates; snap back to the 1 km grid.
  const left = Math.round(ll[0] / 1000) * 1000;
  const bottom = Math.round(ll[1] / 1000) * 1000;
  const top = bottom + where.ysize * 1000;
  if (Math.abs(ll[0] - left) > 100 || Math.abs(ll[1] - bottom) > 100 || Math.abs(ul[0] - left) > 100 || Math.abs(ul[1] - top) > 100 || Math.abs(ur[0] - left - where.xsize * 1000) > 100) throw new Error('Radar-Gitter passt nicht zur Karte.');
  return { left, top, width: where.xsize, height: where.ysize };
}

export function radarPixels(values, grid, what) {
  if (what.quantity !== 'RATE' || !Number.isFinite(what.gain) || !Number.isFinite(what.offset) || values.length !== grid.width * grid.height) throw new Error('Ungültige Radar-Messwerte.');
  const pixels = new Uint8ClampedArray(RADAR_WIDTH * RADAR_HEIGHT * 4);
  const startX = (RADAR_BOUNDS[0] - grid.left) / 1000;
  const startY = (grid.top - RADAR_BOUNDS[3]) / 1000;
  if (!Number.isInteger(startX) || !Number.isInteger(startY) || startX < 0 || startY < 0 || startX + RADAR_WIDTH > grid.width || startY + RADAR_HEIGHT > grid.height) throw new Error('Radar-Ausschnitt ausserhalb der Messdaten.');
  for (let y = 0; y < RADAR_HEIGHT; y++) for (let x = 0; x < RADAR_WIDTH; x++) {
    const raw = values[(y + startY) * grid.width + x + startX];
    const offset = (y * RADAR_WIDTH + x) * 4;
    if (!Number.isFinite(raw) || raw === what.nodata) {
      // Distinguish no coverage from a valid dry observation.
      pixels.set([83, 93, 105, (x + y) % 6 < 2 ? 110 : 20], offset);
      continue;
    }
    if (raw === what.undetect) continue;
    const rate = raw * what.gain + what.offset;
    let colour;
    for (const step of RADAR_COLOURS) { if (rate < step[0]) break; colour = step; }
    if (colour) pixels.set([...colour.slice(1), 205], offset);
  }
  return pixels;
}

export function decodeRadarFile(file, expectedEpoch) {
  const date = hdfAttributes(file.get('what'));
  const epoch = Date.parse(`${date.date.slice(0, 4)}-${date.date.slice(4, 6)}-${date.date.slice(6, 8)}T${date.time.slice(0, 2)}:${date.time.slice(2, 4)}:${date.time.slice(4, 6)}Z`);
  if (epoch !== expectedEpoch) throw new Error('Radar-Zeitstempel stimmt nicht überein.');
  const data = file.get('dataset1/data1/data');
  const grid = radarGrid(hdfAttributes(file.get('where')));
  if (data.shape[0] !== grid.height || data.shape[1] !== grid.width) throw new Error('Ungültige Radar-Bildgrösse.');
  return radarPixels(data.value, grid, hdfAttributes(file.get('dataset1/data1/what')));
}
