// Official destinations verified on 2026-09-09. SHV has announced deep links,
// but has not published a scheme or universal link on its app page / FAQ.
export const SHV_LINKS = {
  page: "https://www.shv-fsvl.ch/mitgliederservice/app/",
  ios: "https://apps.apple.com/us/app/shv-fsvl/id6761252391",
  android: "https://play.google.com/store/apps/details?id=ch.shv_fsvl",
  mobileDeepLink: null,
};

export function shvDestination({ userAgent = "", platform = "", maxTouchPoints = 0 } = {}) {
  const ios = /iPad|iPhone|iPod/.test(userAgent) || (/Mac/.test(platform) && maxTouchPoints > 1);
  const android = /Android/.test(userAgent);
  if ((ios || android) && SHV_LINKS.mobileDeepLink) return { href: SHV_LINKS.mobileDeepLink, label: "SHV-App öffnen", mobile: true };
  if (ios) return { href: SHV_LINKS.ios, label: "SHV-App im App Store", mobile: true };
  if (android) return { href: SHV_LINKS.android, label: "SHV-App bei Google Play", mobile: true };
  return { href: SHV_LINKS.page, label: "Zur SHV-App", mobile: false };
}
