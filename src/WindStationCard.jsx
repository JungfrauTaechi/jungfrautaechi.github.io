import { formatWindTime, readingValue } from "./wind-feed.js";

export function WindStationCard({ station, selected, onSelect, compact = false }) {
  return <button className={`wind-card status-${station.status}${selected ? " is-selected" : ""}${compact ? " is-compact" : ""}`} type="button" role="tab" aria-selected={selected} aria-controls="meteo-station-detail" onClick={onSelect}>
    <span className="wind-card-head"><span><strong>{station.name}</strong><small>{station.altitude} m · {station.detail || `${station.distanceKm.toFixed(1)} km ab Grindelwald`}</small></span><span className="station-status">{station.statusLabel}</span></span>
    <span className="wind-current"><span className="wind-direction" style={{ transform: station.direction === null ? undefined : `rotate(${station.direction + 180}deg)` }} aria-label={station.direction === null ? "Windrichtung nicht verfügbar" : `Wind aus ${station.directionLabel}`}>{station.direction === null ? "–" : "↑"}</span><span><strong>{readingValue(station.average)}</strong><small>km/h Ø</small></span><span><strong>{readingValue(station.gust)}</strong><small>Böen</small></span><span><strong>{station.directionLabel}</strong><small>{station.direction === null ? "–" : `${Math.round(station.direction)}°`}</small></span></span>
    <span className="wind-observed">{station.observedAt ? `Messung ${formatWindTime(station.observedAt, { day: "2-digit", month: "2-digit" })}` : station.liveState === "loading" ? "Livewerte werden geladen…" : "Keine Messwerte verfügbar"}</span>
    {!compact && station.values.length > 0 && <><span className="wind-history-label">{station.values.length > 1 ? "Letzte Messungen" : "Aktueller Messwert"} · Ø / Böe in km/h</span><span className={`wind-history${station.values.length === 1 ? " is-single" : ""}`}>{station.values.map((value) => <span key={value.epoch}><small>{value.time}</small><strong>{readingValue(value.average)}</strong><small>/{readingValue(value.gust)}</small></span>)}</span></>}
    <span className="wind-card-foot"><small>Quelle: {station.attribution}</small><span>Details ansehen</span></span>
  </button>;
}
