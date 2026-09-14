import { useEffect, useRef, useState } from 'react';
import { RADAR_BASEMAP, RADAR_COLOURS, RADAR_WIDTH, RADAR_HEIGHT, RADAR_PAGE, RADAR_REFRESH_MS, RADAR_STALE_MS, radarTime, radarDateTime } from './radar-data.js';

export function RainRadar() {
  const root = useRef(null);
  const canvas = useRef(null);
  const client = useRef(null);
  const near = useRef(false);
  const [enabled, setEnabled] = useState(false);
  const [frames, setFrames] = useState([]);
  const [selected, setSelected] = useState(0);
  const [displayed, setDisplayed] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [mapFailed, setMapFailed] = useState(false);
  const [partial, setPartial] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      near.current = entry.isIntersecting;
      if (entry.isIntersecting) setEnabled(true);
      else setPlaying(false);
    }, { rootMargin: '200px' });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const worker = new Worker(new URL('./radar-worker.js', import.meta.url), { type: 'module' });
    let active = true;
    let serial = 0;
    const pending = new Map();
    const request = payload => new Promise((resolve, reject) => {
      const id = ++serial;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error('Radar antwortet nicht. Bitte erneut laden.')); }, 25000);
      pending.set(id, { resolve, reject, timer });
      worker.postMessage({ id, ...payload });
    });
    worker.onmessage = ({ data }) => {
      const task = pending.get(data.id);
      if (!task) return;
      clearTimeout(task.timer); pending.delete(data.id);
      if (data.error) task.reject(new Error(data.error)); else task.resolve(data);
    };
    worker.onerror = () => {
      for (const task of pending.values()) { clearTimeout(task.timer); task.reject(new Error('Radar konnte nicht geladen werden.')); }
      pending.clear();
    };
    let wanted = null;
    let decoding = false;
    const loadFrame = async frame => {
      wanted = frame;
      if (decoding) return;
      decoding = true;
      setBusy(true);
      try {
        while (active && wanted) {
          const current = wanted;
          wanted = null;
          try {
            const result = await request({ type: 'frame', frame: current });
            if (!active) return;
            if (wanted && wanted.url !== current.url) continue;
            canvas.current?.getContext('2d')?.putImageData(new ImageData(result.pixels, RADAR_WIDTH, RADAR_HEIGHT), 0, 0);
            setDisplayed({ epoch: result.epoch, url: current.url });
            setError('');
          } catch (failure) {
            if (active) { setError(failure.message); setPlaying(false); }
          }
        }
      } finally { decoding = false; if (active) setBusy(false); }
    };
    client.current = { loadFrame };
    const update = async () => {
      try {
        const result = await request({ type: 'list' });
        if (!active) return;
        setPlaying(false);
        setFrames(result.frames);
        setSelected(result.frames.length - 1);
        setPartial(result.partial);
        setError('');
        setNow(Date.now());
      } catch (failure) { if (active) { setError(failure.message); setPlaying(false); } }
    };
    setError('');
    update();
    const timer = setInterval(() => { if (near.current && !document.hidden) update(); }, RADAR_REFRESH_MS);
    const ageTimer = setInterval(() => setNow(Date.now()), 60000);
    const visibility = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      active = false;
      client.current = null;
      clearInterval(timer); clearInterval(ageTimer);
      document.removeEventListener('visibilitychange', visibility);
      for (const task of pending.values()) { clearTimeout(task.timer); task.reject(new Error('Radar geschlossen.')); }
      worker.terminate();
    };
  }, [enabled, refresh]);

  const frame = frames[selected];
  useEffect(() => {
    if (frame) client.current?.loadFrame(frame);
  }, [frame, enabled, refresh]);

  useEffect(() => {
    if (!playing || busy || !displayed || displayed.url !== frame?.url || error) return;
    const timer = setTimeout(() => setSelected(index => (index + 1) % frames.length), selected === frames.length - 1 ? 1400 : 650);
    return () => clearTimeout(timer);
  }, [playing, busy, displayed, frame, frames.length, selected, error]);

  const latest = frames.at(-1);
  const stale = latest && now - latest.epoch > RADAR_STALE_MS;
  const loading = !error && (!displayed || busy || displayed.url !== frame?.url);
  return <section className="rain-radar" ref={root} aria-labelledby="radar-heading">
    <header className="radar-heading"><div><p className="eyebrow">Messungen · letzte 2 Stunden</p><h3 id="radar-heading">Regenradar</h3></div><button type="button" onClick={() => { setPlaying(false); setMapFailed(false); setRefresh(value => value + 1); }} aria-label="Radar neu laden" disabled={busy}>↻</button></header>
    <div className="radar-map">
      {enabled && <img key={refresh} src={RADAR_BASEMAP} alt="Karte der Schweiz" onError={() => setMapFailed(true)} />}
      <canvas ref={canvas} width={RADAR_WIDTH} height={RADAR_HEIGHT} role="img" aria-label={displayed ? `Niederschlagsradar Schweiz, ${radarDateTime(displayed.epoch)} Uhr` : 'Radar wird geladen'} hidden={!displayed || mapFailed} />
      {!mapFailed && <span className="radar-grindelwald"><i />Grindelwald</span>}
      <span className="radar-map-time">{displayed ? `${radarDateTime(displayed.epoch)} Uhr` : error ? 'Keine Radardaten' : 'Radar laden …'}</span>
      {(loading || mapFailed) && <span className="radar-map-message" role="status">{mapFailed ? 'Hintergrundkarte nicht verfügbar' : 'Radarbild wird geladen …'}</span>}
    </div>
    <div className="radar-controls">
      <button type="button" aria-label={playing ? 'Radar pausieren' : 'Radar abspielen'} aria-pressed={playing} disabled={frames.length < 2 || !!error || mapFailed} onClick={() => setPlaying(value => !value)}>{playing ? 'Ⅱ' : '▶'}</button>
      <div className="radar-timeline"><label className="sr-only" htmlFor="radar-time">Radar-Zeitpunkt</label><input id="radar-time" type="range" min="0" max={Math.max(0, frames.length - 1)} value={selected} disabled={!frames.length || mapFailed} aria-valuetext={frame ? radarDateTime(frame.epoch) : 'Keine Daten'} onChange={event => { setPlaying(false); setSelected(Number(event.target.value)); }} /><div><span>{frames[0] ? radarTime(frames[0].epoch) : '–'}</span><span>{latest ? radarTime(latest.epoch) : '–'} Uhr</span></div></div>
      <button type="button" className="radar-latest" disabled={!frames.length} onClick={() => { setPlaying(false); setSelected(frames.length - 1); }}>Aktuell</button>
    </div>
    <div className="radar-legend" aria-label="Niederschlagsintensität in Millimetern pro Stunde">{RADAR_COLOURS.map(([value, r, g, b]) => <span key={value}><i style={{ background: `rgb(${r},${g},${b})` }} />{String(value).replace('.', ',')}</span>)}<small>mm/h</small></div>
    <p className="radar-key">Ohne Farbe: &lt; 0,1 mm/h · Schraffiert: keine Daten</p>
    {(error || stale || partial) && <p className="radar-status" role="status">{error || (stale ? 'Letztes Radarbild ist über 15 Minuten alt.' : 'Ein Teil des Verlaufs ist nicht verfügbar.')}{displayed && error ? ' Das letzte geladene Bild bleibt sichtbar.' : ''}</p>}
    <footer className="radar-credit"><span>Quelle: MeteoSchweiz · Karte: swisstopo</span><a href={RADAR_PAGE} target="_blank" rel="noreferrer">MeteoSchweiz ↗</a></footer>
  </section>;
}
