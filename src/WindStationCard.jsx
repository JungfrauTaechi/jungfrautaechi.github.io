import { formatWindTime, readingValue } from "./wind-feed.js";

export function WindStationCard({ station }) {
  const history = station.values.slice().sort((a, b) => a.epoch - b.epoch);
  const observed = station.observedAt ? formatWindTime(station.observedAt, { day: "2-digit", month: "2-digit" }) : station.statusLabel;
  const href = station.mapUrl || (station.id === "fanet-BA-4" ? "https://map.burnair.cloud/?layer=mw&id=fanet-BA-4" : `https://winds.mobi/map/${encodeURIComponent(station.id)}`);
  return <article className={`wind-card wind-card-integrated status-${station.status}`} aria-label={station.name}>
    <header className="wind-card-head"><div className="wind-station-heading"><h3>{station.name}</h3><small className="wind-altitude">{station.altitude} m</small></div><span className="station-status" title={station.statusLabel} aria-label={`${station.statusLabel}: ${observed}`}>{observed}</span></header>
    <div className="wind-current">
      <div className="wind-bearing"><span className="wind-direction" style={{ transform: station.direction === null ? undefined : `rotate(${station.direction + 180}deg)` }} aria-label={station.direction === null ? "Windrichtung nicht verfügbar" : `Wind aus ${station.directionLabel}`}>{station.direction === null ? "–" : "↑"}</span><small>{station.directionLabel} · {station.direction === null ? "–" : `${Math.round(station.direction)}°`}</small></div>
      <span><strong>{readingValue(station.average)}</strong><small>km/h Mittel</small></span>
      <span><strong>{readingValue(station.gust)}</strong><small>km/h Böen</small></span>
      <span><strong>{station.temperature == null ? "–" : `${readingValue(station.temperature)}°`}</strong><small>Temperatur °C</small></span>
    </div>
    <details className="wind-history-details"><summary>Verlauf <span aria-hidden="true">⌄</span></summary><div className="wind-history-heading"><strong>Letzte Messungen</strong><span>Mittel / Böen · km/h</span></div>
    {history.length ? <div className="wind-history">{history.map((value, index) => <span key={value.epoch} className={index === history.length - 1 ? "is-latest" : ""}><small title={formatWindTime(value.epoch, { day: "2-digit", month: "2-digit" })}>{value.time}</small><strong>{readingValue(value.average)} / {readingValue(value.gust)}</strong></span>)}</div> : <p className="wind-empty">{station.liveState === "loading" ? "Messwerte werden geladen …" : "Keine Messwerte verfügbar."}</p>}
    </details>
    <footer className="wind-card-foot"><small title={`Quelle: ${station.attribution}`}>Quelle: {station.attribution}</small><a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Station ${station.name} öffnen (neuer Tab)`}>Station öffnen ↗</a></footer>
  </article>;
}
