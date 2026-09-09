// Official destinations from SHV's Deep Links guide received 2026-09-09.
export const SHV_LINKS = {
  page: "https://www.shv-fsvl.ch/mitgliederservice/app/",
  ios: "https://apps.apple.com/us/app/shv-fsvl/id6761252391",
  android: "https://play.google.com/store/apps/details?id=ch.shv_fsvl",
};

export const SHV_PRODUCTS = [
  { id: "textForecast", label: "Textprognose", detail: "Deutschschweiz", href: "https://prod.shv-app.ch/textForecast?forecastGroupIndex=1&regionIndex=2" },
  { id: "liveMap", label: "Live-Karte", detail: "Grindelwald", href: "https://prod.shv-app.ch/liveMap?coord=4326,8.0414,46.6242&zoom=20000" },
  { id: "previtemps", label: "Prévitemps", detail: "Thermik und Wind", href: "https://prod.shv-app.ch/previtemps" },
  { id: "globalForecast", label: "Europa-Wetter", detail: "Bewölkung und Niederschlag", href: "https://prod.shv-app.ch/globalForecast?layerSetIndex=2" },
];

export function shvDestination({ userAgent = "", platform = "", maxTouchPoints = 0 } = {}) {
  const ios = /iPad|iPhone|iPod/.test(userAgent) || (/Mac/.test(platform) && maxTouchPoints > 1);
  const android = /Android/.test(userAgent);
  if (ios) return { href: SHV_LINKS.ios, label: "SHV-App im App Store", mobile: true };
  if (android) return { href: SHV_LINKS.android, label: "SHV-App bei Google Play", mobile: true };
  return { href: SHV_LINKS.page, label: "Zur SHV-App", mobile: false };
}
