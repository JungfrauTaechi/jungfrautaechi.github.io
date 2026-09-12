import { useState } from "react";
import { ShvWeather } from "./ShvWeather.jsx";

const locations = [
  { id: "P0402", name: "Grindelwald" },
  { id: "06730", name: "Jungfraujoch" },
  { id: "06734", name: "Interlaken" },
];

function ForecastChart({ src, title, compact = false }) {
  const [failed, setFailed] = useState(false);
  return <figure className={`forecast-chart${compact ? " forecast-chart-compact" : ""}`}>
    <div className="forecast-chart-heading"><h3>{title}</h3><a href={src.includes("mos_") ? `https://profiwetter.ch/fetch_svg.php?nr=${src.split("mos_")[1].split(".svg")[0]}` : src} target="_blank" rel="noreferrer">Grafik vergrössern ↗</a></div>
    {failed ? <p role="status">Die Grafik ist momentan nicht verfügbar. Bitte später erneut laden.</p> : <div className="forecast-scroll"><img src={src} alt={`${title} – Wettervorhersage von Profiwetter.ch`} loading="lazy" onError={() => setFailed(true)} /></div>}
    <figcaption>Bildquelle: <a href="https://profiwetter.ch/" target="_blank" rel="noreferrer">Profiwetter.ch</a>, Deutscher Wetterdienst</figcaption>
  </figure>;
}

export function WeatherForecast() {
  const [location, setLocation] = useState(locations[0]);
  const [refresh, setRefresh] = useState(0);
  const suffix = refresh ? `?refresh=${refresh}` : "";
  return <section className="shell meteo-forecast" aria-labelledby="forecast-heading">
    <div className="meteo-section-head"><div><p className="eyebrow">Ausblick auf die nächsten Tage</p><h2 id="forecast-heading">Flugwetter &amp; Prognosen</h2></div><button className="webcam-refresh" type="button" onClick={() => setRefresh(Date.now())}>Prognosen neu laden</button></div>
    <ShvWeather />
    <div className="forecast-shortcuts">
      <ForecastChart key={`foehn-${refresh}`} compact title="Föhn · Druckdifferenz Lugano–Zürich" src={`https://profiwetter.ch/wind_foehn_ch_de.png${suffix}`} />
      <aside className="radar-card" aria-labelledby="radar-heading">
        <p className="eyebrow">Niederschlag &amp; Entwicklung</p>
        <h3 id="radar-heading">Regenradar</h3>
        <p>Die aktuelle Niederschlagsanimation zeigt, wo Regen aufzieht und wie er sich weiterbewegt.</p>
        <a className="button primary" href="https://www.meteoschweiz.admin.ch/service-und-publikationen/applikationen/niederschlag.html" target="_blank" rel="noreferrer">Radar bei MeteoSchweiz öffnen ↗<span className="sr-only"> (neuer Tab)</span></a>
        <p className="radar-note">Messungen und Prognose in der Originalansicht von MeteoSchweiz.</p>
      </aside>
    </div>
    <div className="weather-selector" role="group" aria-label="Prognoseort auswählen">{locations.map((item) => <button key={item.id} type="button" aria-pressed={location.id === item.id} onClick={() => setLocation(item)}>{item.name}</button>)}</div>
    <ForecastChart key={`${location.id}-${refresh}`} title={`Wetterprognose ${location.name}`} src={`https://profiwetter.ch/mos_${location.id}.svg${suffix}`} />
    <p className="forecast-hint">Für Details die Grafik vergrössern. Ausgabezeit und Prognosezeitraum stehen in der Grafik.</p>
  </section>;
}
