import * as h5 from 'h5wasm';
import { loadRadarFrames, radarFetch } from './radar-data.js';
import { decodeRadarFile } from './radar-decode.js';

const cache = new Map();
let queue = Promise.resolve();
self.onmessage = ({ data }) => {
  // One file at a time bounds both network usage and WebAssembly memory.
  queue = queue.then(async () => {
    try {
      if (data.type === 'list') {
        const inventory = await loadRadarFrames();
        const allowed = new Set(inventory.frames.map(frame => frame.url));
        for (const key of cache.keys()) if (!allowed.has(key)) cache.delete(key);
        self.postMessage({ id: data.id, ...inventory });
      } else if (data.type === 'frame') {
        const { frame } = data;
        if (!cache.has(frame.url)) {
          const bytes = await radarFetch(frame.url);
          if (bytes.length > 8 * 1024 * 1024) throw new Error('Radar-Datei zu gross.');
          await h5.ready;
          h5.FS.writeFile('radar.h5', bytes);
          let file;
          try {
            file = new h5.File('radar.h5', 'r');
            cache.set(frame.url, decodeRadarFile(file, frame.epoch));
            while (cache.size > 25) cache.delete(cache.keys().next().value);
          } finally { file?.close(); h5.FS.unlink('radar.h5'); }
        }
        const pixels = cache.get(frame.url).slice();
        self.postMessage({ id: data.id, epoch: frame.epoch, pixels }, [pixels.buffer]);
      }
    } catch (error) { self.postMessage({ id: data.id, error: error.message || 'Radar nicht verfügbar.' }); }
  });
};
