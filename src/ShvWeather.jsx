import { SHV_LINKS, shvDestination } from "./shv-links.js";

export function ShvWeather() {
  const destination = shvDestination(typeof navigator === "undefined" ? {} : navigator);
  return <section className="shv-weather" aria-labelledby="shv-heading">
    <div><p className="eyebrow">Flugwetter beim Verband</p><h3 id="shv-heading">SHV Meteo</h3><p>Gleitschirmprognosen, Höhenwind, Radar und Prévitemps in der offiziellen SHV-App. Ein Teil der Prognosen ist SHV-Mitgliedern vorbehalten.</p></div>
    <div className="shv-weather-actions"><a className="button primary" href={destination.href}>{destination.label} ↗</a>{destination.mobile && <a className="text-link" href={SHV_LINKS.page}>Infos zur App und Installation ↗</a>}</div>
  </section>;
}
