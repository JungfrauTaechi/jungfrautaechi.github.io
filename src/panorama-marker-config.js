import initialWebcams from './panorama-webcams.json';
import initialOverrides from './panorama-marker-overrides.json';

export let panoramaWebcams = initialWebcams;
export let panoramaMarkerOverrides = initialOverrides;
const listeners = new Set();
export function subscribeMarkerConfig(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Accept data changes here, without refreshing App and remounting its local components.
if (import.meta.hot) {
  import.meta.hot.accept('./panorama-webcams.json', module => {
    if (!module) return;
    panoramaWebcams = module.default;
    listeners.forEach(listener => listener());
  });
  import.meta.hot.accept('./panorama-marker-overrides.json', module => {
    if (!module) return;
    panoramaMarkerOverrides = module.default;
    listeners.forEach(listener => listener());
  });
}
