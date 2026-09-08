import { useState } from "react";

const locations = [
  { id: "P0402", name: "Grindelwald" },
  { id: "06730", name: "Jungfraujoch" },
  { id: "06734", name: "Interlaken" },
];

function ForecastChart({ src, title }) {
  const [failed, setFailed] = useState(false);
  return <figure className="forecast-chart">
    <div className="forecast-chart-heading"><h3>{title}</h3><a href={src.includes("mos_") ? `https://profiwetter.ch/fetch_svg.php?nr=${src.split("mos_")[1].split(".svg")[0]}` : src} target="_blank" rel="noreferrer">Grafik vergrössern ↗</a></div>
    {failed ? <p role="status">Die Grafik ist momentan nicht verfügbar. Bitte später erneut laden.</p> : <div className="forecast-scroll" role="region" aria-label={title} tabIndex="0"><img src={src} alt={`${title} – Wettervorhersage von Profiwetter.ch`} loading="lazy" onError={() => setFailed(true)} /></div>}
    <figcaption>Bildquelle: <a href="https://profiwetter.ch/" target="_blank" rel="noreferrer">Profiwetter.ch</a>, Deutscher Wetterdienst</figcaption>
  </figure>;
}

export function WeatherForecast() {
  const [location, setLocation] = useState(locations[0]);
  const [refresh, setRefresh] = useState(0);
  const suffix = refresh ? `?refresh=${refresh}` : "";
  return <section className="shell meteo-forecast" aria-labelledby="forecast-heading">
    <div className="meteo-section-head"><div><p className="eyebrow">Ausblick auf die nächsten Tage</p><h2 id="forecast-heading">Föhn &amp; Prognosen</h2></div><button className="webcam-refresh" type="button" onClick={() => setRefresh(Date.now())}>Prognosen neu laden</button></div>
    <ForecastChart key={`foehn-${refresh}`} title="Föhndiagramm · Druckdifferenz Lugano–Zürich" src={`https://profiwetter.ch/wind_foehn_ch_de.png${suffix}`} />
    <div className="weather-selector" role="group" aria-label="Prognoseort auswählen">{locations.map((item) => <button key={item.id} type="button" aria-pressed={location.id === item.id} onClick={() => setLocation(item)}>{item.name}</button>)}</div>
    <ForecastChart key={`${location.id}-${refresh}`} title={`Wetterprognose ${location.name}`} src={`https://profiwetter.ch/mos_${location.id}.svg${suffix}`} />
    <p className="forecast-hint">Auf kleinen Bildschirmen lassen sich die Grafiken seitlich verschieben. Ausgabezeit und Prognosezeitraum stehen in der Grafik.</p>
  </section>;
}
