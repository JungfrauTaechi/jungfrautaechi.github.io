import test from 'node:test';
import assert from 'node:assert/strict';
import { radarAssetTime, selectRadarFrames, loadRadarFrames, RADAR_WIDTH, RADAR_HEIGHT } from '../src/radar-data.js';
import { radarGrid, radarPixels, decodeRadarFile } from '../src/radar-decode.js';

const where = {
  LL_lat: 43.62900161743164, LL_lon: 3.1687800884246826,
  UL_lat: 49.3744010925293, UL_lon: 2.689419984817505,
  UR_lat: 49.36330032348633, UR_lon: 12.462300300598145,
  projdef: '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs',
  xscale: 1000, yscale: 1000, xsize: 710, ysize: 640,
};
const asset = (name, updated = '') => ({ [name]: { href: `https://data.geo.admin.ch/ch.meteoschweiz.ogd-radar-precip/20260914-ch/${name}`, updated } });

test('radar timestamps use UTC day of year, reject other products and invalid dates', () => {
  assert.equal(radarAssetTime('rzc262570735vl.001.h5'), Date.UTC(2026, 8, 14, 7, 35));
  assert.equal(radarAssetTime('rzc243660000ab.001.h5'), Date.UTC(2024, 11, 31));
  for (const name of ['cpc262570735vl.001.h5', 'rzc263660735vl.001.h5', 'rzc260000735vl.001.h5', 'rzc262572400vl.001.h5', 'rzc262570760vl.001.h5']) assert.equal(radarAssetTime(name), null);
});

test('radar inventory deduplicates quality variants, excludes future/old assets and orders actual frames', () => {
  const now = Date.UTC(2026, 8, 14, 7, 40);
  const frames = selectRadarFrames([{ assets: {
    ...asset('rzc262570730aa.001.h5', '2026-09-14T07:30:20Z'),
    ...asset('rzc262570730bb.001.h5', '2026-09-14T07:31:00Z'),
    ...asset('rzc262570735vl.001.h5'),
    ...asset('rzc262570745vl.001.h5'),
    ...asset('rzc262570530vl.001.h5'),
    'rzc262570725vl.001.h5': { href: 'https://example.com/rzc262570725vl.001.h5' },
  } }], now);
  assert.equal(frames.length, 2);
  assert.match(frames[0].url, /0730bb/);
  assert.equal(frames[1].epoch, now - 5 * 60000);
});

test('radar inventory crosses UTC midnight and tolerates an unavailable current-day item', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    assert.equal(options.credentials, 'omit');
    calls.push(url);
    return url.endsWith('20260914-ch') ? { ok: false, status: 404 } : { ok: true, arrayBuffer: async () => new TextEncoder().encode(JSON.stringify({ assets: asset('rzc262562355vl.001.h5') })).buffer };
  };
  const result = await loadRadarFrames(Date.UTC(2026, 8, 14, 0, 3), fetchImpl);
  assert.equal(calls.length, 2);
  assert.equal(result.frames[0].epoch, Date.UTC(2026, 8, 13, 23, 55));
  assert.equal(result.partial, true);
  await assert.rejects(loadRadarFrames(Date.UTC(2026, 8, 14, 5), fetchImpl), /Keine aktuellen/);
});

test('actual ODIM corner metadata resolves to the LV95 grid, not a WGS84 rectangle', () => {
  assert.deepEqual(radarGrid(where), { left: 2255000, top: 1480000, width: 710, height: 640 });
  assert.throws(() => radarGrid({ ...where, xscale: 2000 }));
  assert.throws(() => radarGrid({ ...where, UL_lat: 48 }));
});

test('radar crop preserves north-to-south row order, gain/offset, dry and no-coverage distinctions', () => {
  const grid = radarGrid(where);
  const values = new Float64Array(grid.width * grid.height);
  const start = 160 * 710 + 225;
  values[start] = 1;
  values[start + 1] = NaN;
  values[start + 2] = -9999;
  values[start + 710] = 5;
  const pixels = radarPixels(values, grid, { quantity: 'RATE', gain: 2, offset: 0, nodata: -9999, undetect: 0 });
  assert.equal(pixels.length, RADAR_WIDTH * RADAR_HEIGHT * 4);
  assert.deepEqual([...pixels.slice(0, 4)], [43, 173, 112, 205]); // 2 mm/h, top-left
  assert.notEqual(pixels[7], 0); // NaN coverage is hatched
  assert.notEqual(pixels[11], 0); // explicit nodata is hatched
  assert.equal(pixels[15], 0); // true zero is transparent
  assert.deepEqual([...pixels.slice(RADAR_WIDTH * 4, RADAR_WIDTH * 4 + 4)], [239, 135, 36, 205]); // southward next row
  assert.throws(() => radarPixels(values, grid, { quantity: 'DBZH', gain: 1, offset: 0 }));
});

test('decoder rejects a file with a different observation time before using its image', () => {
  const file = { get: () => ({ attrs: { date: { value: '20260914' }, time: { value: '073500' } } }) };
  assert.throws(() => decodeRadarFile(file, Date.UTC(2026, 8, 14, 7, 30)), /Zeitstempel/);
});
