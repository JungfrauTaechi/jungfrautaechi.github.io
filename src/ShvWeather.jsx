import { SHV_LINKS, SHV_PRODUCTS, shvDestination } from "./shv-links.js";

export function ShvWeather({ device = typeof navigator === "undefined" ? {} : navigator } = {}) {
  const destination = shvDestination(device);
  return <section className="shv-weather" aria-labelledby="shv-heading">
    <div><p className="eyebrow">Flugwetter beim Verband</p><h3 id="shv-heading">SHV Meteo</h3><p>Gleitschirmprognosen, Höhenwind, Radar und Prévitemps in der offiziellen SHV-App. Ein Teil der Prognosen ist SHV-Mitgliedern vorbehalten.</p></div>
    {destination.mobile ? <div className="shv-weather-actions"><nav className="shv-product-links" aria-label="SHV-Meteo-Produkte">{SHV_PRODUCTS.map((product) => <a key={product.id} href={product.href} target="_blank" rel="noopener noreferrer"><strong>{product.label}</strong><span>{product.detail} ↗</span><span className="sr-only">Öffnet die SHV-App oder einen neuen Tab</span></a>)}</nav><a className="text-link" href={destination.href}>SHV-App installieren ↗</a><a className="text-link" href={SHV_LINKS.page}>Infos zur App ↗</a></div> : <div className="shv-weather-actions"><a className="button primary" href={SHV_LINKS.page}>Zur SHV-App ↗</a><span className="shv-weather-note">Auf dem Smartphone öffnen für direkte Produktlinks.</span></div>}
  </section>;
}
