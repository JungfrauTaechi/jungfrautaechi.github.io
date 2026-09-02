import { useCallback, useEffect, useRef, useState } from "react";
import { CONFIG, boardMembers, chronology, clubPortrait, clubProgramme, clubPurposes, clubStories, flightFacts, flightSceneGroups, flightScenes, images, membershipFormUrl, meteoStations, meteoWebcams, news, photoReports, plannedMeteoStation, routes, safetyAreas, shvAirspaceUrl, shvGrindelwaldDocument, utilityLinks } from "./data.js";
import { appPath, routeFromPathname } from "./site-paths.js";
const navItems = [routes.flightArea, routes.meteo, routes.club, routes.news, routes.photos]; const routeList = Object.values(routes);
const siteBase = import.meta.env.BASE_URL;
function AppLink({ to, children, className = "", onNavigate }) { const href = appPath(to, siteBase); const go = (event) => { event.preventDefault(); history.pushState({}, "", href); dispatchEvent(new PopStateEvent("popstate")); onNavigate?.(); }; return <a className={className} href={href} onClick={go}>{children}</a>; }
function ExternalLink({ href, children, className = "" }) { return <a className={className} href={href} target="_blank" rel="noreferrer">{children}<span className="sr-only"> (öffnet in neuem Fenster)</span></a>; }
function titleForPath(path) { if (path.startsWith("/news/")) return news.find((item) => item.path === path)?.title; if (path.startsWith("/fotos/")) return photoReports.find((item) => item.path === path)?.title; return routeList.find((item) => item.path === path)?.label; }
function Shell({ children, currentPath }) { const [menuOpen, setMenuOpen] = useState(false); useEffect(() => { setMenuOpen(false); const title = titleForPath(currentPath); document.title = title ? `${title} | Jungfrau-Tächi Grindelwald` : "Jungfrau-Tächi Grindelwald"; }, [currentPath]); return <><a className="skip-link" href="#inhalt">Zum Inhalt springen</a><header><div className="utility"><div className="shell utility-inner">{utilityLinks.map((item) => item.to ? <AppLink key={item.label} to={item.to}>{item.label}</AppLink> : <ExternalLink key={item.label} href={item.href}>{item.label}</ExternalLink>)}<span className="utility-alert">Sicherheitshinweis: Bitte beachte die lokalen Hinweise im Fluggebiet.</span></div></div>{CONFIG.showAnniversary && <div className="anniversary-bar"><div className="shell anniversary-inner"><span>50 Jahre Jungfrau-Tächi · 1976–2026</span><AppLink to={routes.chronology.path}>Jubiläum entdecken</AppLink></div></div>}<div className="shell primary-nav"><AppLink to="/" className="wordmark"><span>Jungfrau-Tächi</span><small>GRINDELWALD</small></AppLink><button className="menu-button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen(!menuOpen)}>Menü</button><nav id="site-navigation" className={menuOpen ? "is-open" : ""} aria-label="Hauptnavigation">{navItems.map((item) => <AppLink key={item.path} to={item.path} className={currentPath === item.path || currentPath.startsWith(`${item.path}/`) ? "active" : ""} onNavigate={() => setMenuOpen(false)}>{item.label}</AppLink>)}<AppLink to={routes.chronology.path} onNavigate={() => setMenuOpen(false)}>Chronik</AppLink><AppLink to={routes.contact.path} onNavigate={() => setMenuOpen(false)}>Kontakt</AppLink><AppLink to={routes.membership.path} className="join-link" onNavigate={() => setMenuOpen(false)}>Mitglied werden</AppLink></nav></div></header><main id="inhalt" tabIndex="-1">{children}</main><footer><div className="shell footer-grid"><div><strong>Jungfrau-Tächi Grindelwald</strong><p>Gut Flug und immer Happy Landing!</p></div><div><AppLink to={routes.flightArea.path}>Fluggebiet</AppLink><AppLink to={routes.meteo.path}>Meteo</AppLink><AppLink to={routes.membership.path}>Mitglied werden</AppLink></div><div><ExternalLink href="https://www.jungfrau-taechi.ch/sites/impressum">Impressum</ExternalLink><AppLink to={routes.contact.path}>Kontakt</AppLink></div></div></footer></>; }
function SectionIntro({ eyebrow, title, body, image = images.flightAreaHero, position = "center" }) { return <section className="page-banner" style={{ "--page-banner-image": `url("${image}")`, "--page-banner-position": position }}><header className="page-intro shell"><p className="eyebrow">{eyebrow}</p><h1 tabIndex="-1">{title}</h1>{body && <p>{body}</p>}</header></section>; }
function DetailIntro({ backTo, backLabel, eyebrow, title, body, image }) { return <section className="page-banner detail-banner" style={{ "--page-banner-image": `url("${image || images.hero}")`, "--page-banner-position": "center 42%" }}><header className="article-header shell"><AppLink className="back-link" to={backTo}>← {backLabel}</AppLink><p className="eyebrow">{eyebrow}</p><h1 tabIndex="-1">{title}</h1>{body && <p className="article-summary">{body}</p>}</header></section>; }
function Card({ item }) { const content = <><img src={item.image} alt={item.alt} loading="lazy" /><div><p className="eyebrow">{item.category || item.detail}</p><h3>{item.title}</h3>{item.dateLabel && <p>{item.dateLabel}</p>}</div></>; return <article className="story-card">{item.path ? <AppLink className="story-card-link" to={item.path}>{content}<span className="sr-only"> öffnen</span></AppLink> : content}</article>; }
function AnniversaryModule() { if (!CONFIG.showAnniversary) return null; return <section className="anniversary-module"><div className="shell anniversary-grid"><img src={images.challenge} alt="Karte der Jubiläums-Challenge in der Jungfrau-Region" /><div><p className="eyebrow">50 Jahre Jungfrau-Tächi</p><h2>Jubiläums Challenge</h2><p>1. Mai – 31. August. Burnair Map herunterladen, gratis registrieren, Challenge beitreten und Caches sammeln.</p></div></div></section>; }
function Home() {
  const nextEvent = clubProgramme[0];
  const leadNews = news[0];
  const moreNews = news.slice(1, 3);
  const latestPhotos = photoReports[0];
  return <>
    <section className="page-banner home-banner" style={{ "--page-banner-image": `url("${images.hero}")`, "--page-banner-position": "center 46%" }}><div className="shell home-banner-content"><p className="eyebrow">Jungfrau-Tächi Grindelwald</p><h1 tabIndex="-1">Fliegen zwischen Eiger, Mönch und Jungfrau</h1><p>Start- und Landeplätze, aktuelle Flugvorbereitung und das Clubleben in der Jungfrauregion.</p><div className="button-row"><AppLink className="button primary" to={routes.flightArea.path}>Fluggebiet entdecken</AppLink><AppLink className="button secondary" to={routes.meteo.path}>Wind &amp; Meteo</AppLink></div></div></section>
    <section className="home-flightdesk" aria-label="Flugvorbereitung"><div className="shell home-flightdesk-grid"><AppLink to={routes.meteo.path}><span>01</span><strong>Wind &amp; Meteo</strong><small>Messwerte und Verlauf</small></AppLink><AppLink to={routes.flightArea.path}><span>02</span><strong>Start- &amp; Landeplätze</strong><small>Panoramen und Platzinfos</small></AppLink><AppLink to={routes.safety.path}><span>03</span><strong>Sicherheit</strong><small>Lokale Regeln und Lufträume</small></AppLink><ExternalLink href="https://www.skybriefing.com/de/"><span>04</span><strong>DABS öffnen</strong><small>Aktuelle Luftraumhinweise</small></ExternalLink></div></section>
    <section className="home-next-event"><div className="shell home-next-event-grid"><div><p className="eyebrow">Nächster Clubtermin</p><time>{nextEvent.date}</time></div><div><h2>{nextEvent.title}</h2><p>{nextEvent.text}</p></div><AppLink className="text-link" to={routes.club.path}>Ganzes Jahresprogramm →</AppLink></div></section>
    <section className="shell home-news"><header className="home-section-heading"><div><p className="eyebrow">Newsfeed Jungfrau-Tächi</p><h2>Aktuell aus dem Club</h2></div><AppLink className="text-link" to={routes.news.path}>Alle {news.length} Beiträge</AppLink></header><div className="home-news-grid">{leadNews && <Card item={leadNews} />}{moreNews.length > 0 && <div className="home-news-list">{moreNews.map((item) => <AppLink to={item.path} key={item.slug}><img src={item.image} alt={item.alt} loading="lazy" /><span><small>{item.category} · {item.dateLabel}</small><strong>{item.title}</strong><em>Lesen →</em></span></AppLink>)}</div>}</div></section>
    <section className="home-discover"><div className="shell"><header className="home-section-heading"><div><p className="eyebrow">Mehr entdecken</p><h2>Erlebnisse und Clubgeschichte</h2></div></header><div className="home-discover-grid">{latestPhotos && <AppLink className="home-discover-card" to={routes.photos.path}><img src={latestPhotos.image} alt={latestPhotos.alt} loading="lazy" /><span><small>Fotoreports</small><strong>{latestPhotos.title}</strong><em>Galerien ansehen →</em></span></AppLink>}<AppLink className="home-discover-card" to={routes.club.path}><img src={images.clubCommunity} alt="Jungfrau-Tächi beim Clubfliegen auf First" loading="lazy" /><span><small>Seit 1976</small><strong>Gemeinsam in der Luft</strong><em>Den Club kennenlernen →</em></span></AppLink></div></div></section>
    <AnniversaryModule />
  </>;
}

function StationCard({ station, selected, onSelect, compact = false }) {
  return <button className={`wind-card status-${station.status}${selected ? " is-selected" : ""}${compact ? " is-compact" : ""}`} type="button" role="tab" aria-selected={selected} aria-controls="meteo-station-detail" onClick={onSelect}>
    <span className="wind-card-head"><span><strong>{station.name}</strong><small>{station.altitude} m · {station.distanceKm.toFixed(1)} km ab Grindelwald</small></span><span className="station-status">{station.statusLabel}</span></span>
    <span className="wind-current"><span className="wind-direction" style={{ transform: `rotate(${station.direction}deg)` }} aria-label={`Wind aus ${station.directionLabel}`}>↑</span><span><strong>{station.average}</strong><small>km/h Ø</small></span><span><strong>{station.gust}</strong><small>Böen</small></span><span><strong>{station.directionLabel}</strong><small>{station.direction}°</small></span></span>
    {!compact && <><span className="wind-history-label">Letzte Messungen</span><span className="wind-history">{station.values.map((value) => <span key={value.time}><small>{value.time}</small><strong>{value.average}</strong><small>/{value.gust}</small></span>)}</span></>}
    <span className="wind-card-foot">Mockwert · {station.provider}<span>Details ansehen</span></span>
  </button>;
}

function PlannedStationCard({ station }) {
  return <article className="planned-station-card" aria-label={`${station.name}, Messstation geplant`}>
    <span className="planned-station-marker" aria-hidden="true">L</span>
    <span className="planned-station-copy"><span className="wind-card-head"><span><strong>{station.name}</strong><small>{station.detail} · {station.altitude} m</small></span><span className="station-status">{station.statusLabel}</span></span><span className="planned-station-message"><strong>Noch keine Messwerte</strong><small>Eine eigene Windstation und die Anbindung an winds.mobi sind vorgesehen.</small></span></span>
  </article>;
}

function WebcamCard({ camera, refreshToken, index, total, onPrevious, onNext }) {
  const [capturedAt, setCapturedAt] = useState("");
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const imageUrl = `${camera.image}${refreshToken ? `?refresh=${refreshToken}` : ""}`;
  const focusPanorama = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollLeft = Math.max(0, (viewport.scrollWidth - viewport.clientWidth) * camera.focus);
  };
  useEffect(() => {
    const controller = new AbortController();
    setCapturedAt("");
    fetch(imageUrl, { method: "HEAD", cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.headers.get("Last-Modified") : null)
      .then((value) => {
        if (!value) return setCapturedAt("Zeit nicht verfügbar");
        const date = new Date(value);
        const label = new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Zurich" }).format(date);
        setCapturedAt(`Stand ${label}`);
      })
      .catch((error) => { if (error.name !== "AbortError") setCapturedAt("Zeit nicht verfügbar"); });
    return () => controller.abort();
  }, [imageUrl]);
  const startDrag = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, scrollLeft: viewport.scrollLeft };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add("is-dragging");
  };
  const moveDrag = (event) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!viewport || !drag || drag.pointerId !== event.pointerId) return;
    viewport.scrollLeft = drag.scrollLeft - (event.clientX - drag.startX);
    event.preventDefault();
  };
  const endDrag = (event) => {
    const viewport = viewportRef.current;
    if (!viewport || dragRef.current?.pointerId !== event.pointerId) return;
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    viewport.classList.remove("is-dragging");
    dragRef.current = null;
  };
  const moveWithKeyboard = (event) => {
    if (!viewportRef.current || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    viewportRef.current.scrollBy({ left: (event.key === "ArrowLeft" ? -1 : 1) * viewportRef.current.clientWidth * 0.65, behavior: "smooth" });
    event.preventDefault();
  };
  return <article className="webcam-gallery">
    <div className="webcam-panorama-viewport" ref={viewportRef} tabIndex="0" role="region" aria-label={`Panorama ${camera.title}; ziehen oder mit Pfeiltasten horizontal verschieben`} onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={moveWithKeyboard}>
      <img src={imageUrl} alt={camera.alt} loading="lazy" draggable="false" onLoad={focusPanorama} />
    </div>
    <div className="webcam-gallery-nav">
      <button type="button" onClick={onPrevious} aria-label="Vorherige Webcam">←</button>
      <div className="webcam-gallery-meta"><small>{index + 1} / {total}</small><span><strong>{camera.title}</strong><em aria-live="polite">{capturedAt || "Stand wird geladen…"}</em></span></div>
      <button type="button" onClick={onNext} aria-label="Nächste Webcam">→</button>
    </div>
    <div className="webcam-gallery-links"><span>Bild ziehen oder Scrollbalken nutzen</span><ExternalLink className="webcam-original-link" href={camera.viewerUrl}>Original-Webcam im Vollbild ↗</ExternalLink></div>
  </article>;
}

function MeteoPage() {
  const [activeId, setActiveId] = useState(meteoStations[0].id);
  const [showRegionalStations, setShowRegionalStations] = useState(false);
  const [webcamRefresh, setWebcamRefresh] = useState(0);
  const [activeWebcamIndex, setActiveWebcamIndex] = useState(0);
  const activeStation = meteoStations.find((station) => station.id === activeId) || meteoStations[0];
  const activeWebcam = meteoWebcams[activeWebcamIndex];
  const primaryStations = meteoStations.slice(0, 5);
  const regionalStations = meteoStations.slice(5);
  const moveWebcam = (step) => setActiveWebcamIndex((current) => (current + step + meteoWebcams.length) % meteoWebcams.length);
  return <div className="meteo-page">
    <section className="page-banner meteo-intro" style={{ "--page-banner-image": `url("${images.meteoHeader}")`, "--page-banner-position": "center 48%" }}>
      <div className="shell meteo-intro-grid">
        <div><p className="eyebrow">Meteo Jungfrau · Prototyp</p><h1 tabIndex="-1">Wind und Flugwetter auf einen Blick</h1><p>Aktuelle Messwerte, Verlauf, Webcams und Luftraum für die wichtigsten Plätze der Region.</p></div>
        <div className="meteo-update"><span className="live-dot" aria-hidden="true" /><div><strong>Mockdaten aktualisiert</strong><span>Heute, 10:42 · Abruf bei Bedarf</span></div></div>
      </div>
    </section>
    <aside className="mock-notice" aria-label="Hinweis zu den Wetterdaten"><div className="shell"><strong>Demonstration:</strong> Windwerte und Sicherheitsmeldungen sind simuliert und nicht für Flugentscheidungen geeignet. Die Webcam-Panoramen werden live von Jungfraubahnen geladen.</div></aside>
    <section className="shell meteo-overview" aria-labelledby="wind-heading">
      <div className="meteo-section-head"><div><p className="eyebrow">Messstationen rund um Grindelwald</p><h2 id="wind-heading">Die fünf nächsten Stationen</h2><p>Nach Luftlinie ab Grindelwald, ergänzt um die geplante Station am Landeplatz Grund.</p></div><div className="meteo-section-tools"><span className="station-count">5 aktiv · 1 geplant</span><div className="meteo-legend"><span><i className="legend-good" />Ruhig</span><span><i className="legend-watch" />Beobachten</span><span><i className="legend-strong" />Stark</span></div></div></div>
      <PlannedStationCard station={plannedMeteoStation} />
      <div className="wind-grid" role="tablist" aria-label="Nahe Messstation auswählen">{primaryStations.map((station) => <StationCard key={station.id} station={station} selected={station.id === activeStation.id} onSelect={() => setActiveId(station.id)} />)}</div>
      <button className="station-expand" type="button" aria-expanded={showRegionalStations} aria-controls="regional-wind-stations" onClick={() => setShowRegionalStations((visible) => !visible)}><span><strong>{showRegionalStations ? "Regionale Stationen ausblenden" : `${regionalStations.length} weitere Stationen anzeigen`}</strong><small>Interlaken · Lauterbrunnen · Meiringen und Umgebung</small></span><span className="station-expand-icon" aria-hidden="true">{showRegionalStations ? "−" : "+"}</span></button>
      {showRegionalStations && <section className="regional-stations" id="regional-wind-stations" aria-labelledby="regional-stations-title"><header><div><p className="eyebrow">Erweiterte Region</p><h3 id="regional-stations-title">Alle weiteren Stationen</h3></div><p>Sortiert nach Entfernung zu Grindelwald. Antippen, um Verlauf und Details unten anzuzeigen.</p></header><div className="wind-grid is-regional" role="tablist" aria-label="Regionale Messstation auswählen">{regionalStations.map((station) => <StationCard compact key={station.id} station={station} selected={station.id === activeStation.id} onSelect={() => setActiveId(station.id)} />)}</div></section>}
    </section>
    <section className="shell meteo-detail" id="meteo-station-detail" role="tabpanel" aria-label={`Details für ${activeStation.name}`}>
      <div className="station-detail-main"><p className="eyebrow">Ausgewählte Station</p><h2>{activeStation.name}</h2><p>{activeStation.provider} · {activeStation.altitude} m · {activeStation.distanceKm.toFixed(1)} km ab Grindelwald</p><div className="detail-reading"><span><strong>{activeStation.average}</strong><small>km/h Mittel</small></span><span><strong>{activeStation.gust}</strong><small>km/h Böen</small></span><span><strong>{activeStation.directionLabel}</strong><small>{activeStation.direction}°</small></span><span><strong>{activeStation.temperature}°</strong><small>Temperatur</small></span></div></div>
      <div className="station-trend"><p className="eyebrow">Entwicklung</p><strong>{activeStation.trend}</strong><p>Die letzten vier gemeldeten Werte bleiben auf jeder Stationskarte direkt sichtbar.</p><div className="trend-values">{activeStation.values.slice().reverse().map((value) => <span key={value.time}><small>{value.time}</small><i style={{ height: `${Math.max(22, value.gust * 1.5)}px` }} /><strong>{value.average}/{value.gust}</strong></span>)}</div><small>Ø / Böe in km/h</small></div>
    </section>
    <section className="meteo-secondary"><div className="shell meteo-secondary-grid">
      <div className="webcam-panel"><div className="meteo-section-head"><div><p className="eyebrow">Sicht vor Ort</p><h2>Live-Webcams</h2></div><button className="webcam-refresh" type="button" onClick={() => setWebcamRefresh(Date.now())}>Bilder neu laden</button></div><WebcamCard camera={activeWebcam} refreshToken={webcamRefresh} index={activeWebcamIndex} total={meteoWebcams.length} onPrevious={() => moveWebcam(-1)} onNext={() => moveWebcam(1)} /><p className="webcam-credit">Unveränderte Livebilder: © Jungfraubahnen · Roundshot. Der Rahmen zeigt einen Ausschnitt; das vollständige Panorama bleibt horizontal verschiebbar.</p></div>
      <aside className="dabs-panel"><div className="dabs-heading"><p className="eyebrow">Luftraum · Mockanzeige</p><h2>DABS</h2></div><div className="dabs-status"><span>!</span><div><strong>LS-R6 als aktiv simuliert</strong><p>Demonstrationszeit 13:00–15:00. Verbindliche Angaben immer im offiziellen Daily Airspace Bulletin prüfen.</p></div></div><div className="dabs-actions"><ExternalLink className="button dabs-button" href="https://www.skybriefing.com/de/">Offizielles DABS öffnen</ExternalLink><p className="dabs-footnote">Externer Link · Skybriefing</p></div></aside>
    </div></section>
  </div>;
}
function NewsPage() { const years = [...new Set(news.map((item) => item.date?.slice(0, 4)).filter((year) => year && year !== "1970"))]; const [year, setYear] = useState("alle"); const visible = year === "alle" ? news : news.filter((item) => item.date?.startsWith(year)); return <><SectionIntro eyebrow="Newsfeed" title="Newsarchiv Jungfrau-Tächi Grindelwald" body={`${news.length} Beiträge aus dem Clubarchiv – vollständig auf der neuen Website lesbar.`} image={news[0]?.image || images.hero} position="center 42%" /><section className="shell archive-toolbar" aria-label="News filtern"><label htmlFor="news-year">Jahr</label><select id="news-year" value={year} onChange={(event) => setYear(event.target.value)}><option value="alle">Alle Jahre</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select><span>{visible.length} Beiträge</span></section><section className="shell cards listing">{visible.map((item) => <Card key={item.slug} item={item} />)}</section></>; }
function GalleryViewer({ images, title, className = "" }) { const [selected, setSelected] = useState(0); useEffect(() => setSelected(0), [title]); if (!images.length) return null; const current = images[selected] || images[0]; const move = (step) => setSelected((value) => (value + step + images.length) % images.length); return <div className={`photo-viewer ${className}`} aria-label={`Bildergalerie ${title}`}><div className="photo-stage"><img src={current.src} alt={current.alt} />{images.length > 1 && <><button className="photo-prev" type="button" onClick={() => move(-1)} aria-label="Vorheriges Bild">←</button><button className="photo-next" type="button" onClick={() => move(1)} aria-label="Nächstes Bild">→</button></>}<span>{selected + 1} / {images.length}</span></div>{current.alt && <p className="photo-caption">{current.alt}</p>}<div className="photo-thumbnails">{images.map((image, index) => <button key={`${image.src}-${index}`} type="button" className={index === selected ? "is-selected" : ""} aria-label={`Bild ${index + 1} anzeigen`} aria-pressed={index === selected} onClick={() => setSelected(index)}><img src={image.src} alt="" loading="lazy" /></button>)}</div></div>; }
function NewsArticlePage({ article }) { if (!article) return <NotFound />; const gallery = (article.gallery || []).filter((image) => image.src !== article.image); const related = news.filter((item) => item.slug !== article.slug && item.category === article.category).slice(0, 2); return <article className="content-detail"><DetailIntro backTo={routes.news.path} backLabel="Newsarchiv" eyebrow={`${article.category} · ${article.dateLabel}`} title={article.title} body={article.summary} image={article.image} /><div className="article-body shell" dangerouslySetInnerHTML={{ __html: article.bodyHtml }} />{gallery.length > 0 && <section className="news-gallery-module shell" aria-labelledby="article-gallery-title"><div className="section-heading"><p className="eyebrow">Impressionen</p><h2 id="article-gallery-title">Bilder zum Beitrag</h2><p>{gallery.length} weitere {gallery.length === 1 ? "Aufnahme" : "Aufnahmen"}</p></div><GalleryViewer images={gallery} title={article.title} /></section>}{related.length > 0 && <section className="related-stories shell"><div className="section-heading"><p className="eyebrow">Weiterlesen</p><h2>Weitere Beiträge</h2></div><div className="cards two-up">{related.map((item) => <Card key={item.slug} item={item} />)}</div></section>}</article>; }
function ClubPage() {
  const milestoneYears = new Set(["1976", "1986", "1992", "1996", "2000", "2003", "2006", "2009"]);
  const milestones = chronology.filter((entry) => milestoneYears.has(entry.year));
  const storyCount = clubStories.reduce((total, chapter) => total + chapter.stories.length, 0);
  const links = [routes.membership, routes.contact, routes.photos, routes.flightArea];
  return <div className="club-page">
    <section className="page-banner club-intro" style={{ "--page-banner-image": `url("${images.clubHeader}")`, "--page-banner-position": "center 46%" }}><div className="shell club-intro-grid"><div><p className="eyebrow">Gemeinsam in der Luft · seit 1976</p><h1 tabIndex="-1">Jungfrau-Tächi Grindelwald</h1><p>Aus 13 Flugenthusiasten entstand ein Club mit rund 300 Mitgliedern und einem der bekanntesten gebührenfreien Fluggebiete der Schweiz.</p><AppLink className="button primary" to={routes.membership.path}>Mitglied werden</AppLink></div><div className="club-numbers"><span><strong>1976</strong><small>gegründet</small></span><span><strong>≈ 300</strong><small>Mitglieder</small></span><span><strong>50</strong><small>Jahre Clubgeschichte</small></span></div></div></section>
    <section className="club-agenda" id="clubleben"><div className="shell"><header className="club-agenda-heading"><div><p className="eyebrow">Jahresprogramm 2026/27</p><h2>Als Nächstes im Club</h2></div><p>Fliegen, feiern und gemeinsam unterwegs sein: die kommenden Termine auf einen Blick.</p></header><div className="club-agenda-grid">{clubProgramme.map((event) => <article key={`${event.date}-${event.title}`}><time>{event.date}</time><h3>{event.title}</h3><p>{event.text}</p></article>)}</div></div></section>
    <nav className="shell club-section-nav" aria-label="Clubthemen"><a href="#clubleben">Agenda</a><a href="#portrait">Portrait</a><a href="#auftrag">Unser Auftrag</a><a href="#geschichte">Geschichte</a><a href="#stories">Stories</a></nav>
    <section className="shell club-portrait" id="portrait"><div className="club-portrait-media"><img src={images.clubCommunity} alt="Jungfrau-Tächi beim Clubfliegen auf First" loading="lazy" /><span>Clubfliegen auf First</span></div><div className="club-portrait-copy"><p className="eyebrow">Portrait · von Urs Dubach</p><h2>Von 13 Pionieren zu rund 300 Tächi</h2>{clubPortrait.slice(0, 2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<details className="club-portrait-more"><summary>Vollständiges Portrait lesen</summary><div>{clubPortrait.slice(2).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details></div></section>
    <section className="club-purpose" id="auftrag"><div className="shell"><header className="club-section-heading"><p className="eyebrow">Seit der Gründung</p><h2>Wofür sich der Club einsetzt</h2><p>Die drei Vereinszwecke aus den Statuten in kompakter Form.</p></header><div className="club-purpose-grid">{clubPurposes.map((purpose) => <article key={purpose.number}><span>{purpose.number}</span><h3>{purpose.title}</h3><p>{purpose.text}</p></article>)}</div></div></section>
    <section className="shell club-history" id="geschichte"><header className="club-section-heading"><div><p className="eyebrow">Aus der Chronik</p><h2>Ein halbes Jahrhundert in der Luft</h2></div><div><p>{chronology.length} dokumentierte Stationen erzählen von Pionierflügen, Clubarbeit, Weltcups und X-Alps-Siegen.</p><AppLink className="text-link" to={routes.chronology.path}>Vollständige Chronik</AppLink></div></header><div className="club-milestones">{milestones.map((entry) => <article key={entry.year}><time>{entry.year}</time><p>{entry.text}</p></article>)}</div></section>
    <section className="club-archive-stories" id="stories"><div className="shell"><header className="club-section-heading"><div><p className="eyebrow">Stimmen aus dem Archiv</p><h2>{storyCount} Geschichten in drei Kapiteln</h2></div><p>Alle Geschichten der ursprünglichen Clubseiten sind vollständig hier versammelt und direkt lesbar.</p></header><div className="club-story-chapters">{clubStories.map((chapter) => <section className="club-story-chapter" key={chapter.period}><header><img src={chapter.image} alt="" loading="lazy" /><div><small>{chapter.period}</small><h3>{chapter.title}</h3><span>{chapter.stories.length} {chapter.stories.length === 1 ? "Geschichte" : "Geschichten"}</span></div></header><div className="club-story-list">{chapter.stories.map((story) => <details className="club-story-card" key={story.title}><summary><span><small>Von {story.author}</small><strong>{story.title}</strong></span><em>Lesen</em></summary><div>{story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>)}</div></section>)}</div></div></section>
    <section className="club-support-band"><aside className="shell club-support"><div><p className="eyebrow">Fluggebiet erhalten</p><h2>Gönner werden</h2></div><div><p>Seit den Anfängen ist der Club für Erstellung und Unterhalt der Start- und Landeplätze rund um Grindelwald verantwortlich. Das Fluggebiet soll allen Flugbegeisterten gratis zur Verfügung stehen.</p><p>Vereine, Flugschulen, Firmen und Privatpersonen können diese ehrenamtliche und finanzielle Aufgabe mit einer Gönnermitgliedschaft unterstützen.</p><AppLink className="button primary" to={routes.contact.path}>Vorstand kontaktieren</AppLink></div></aside></section>
    <section className="shell club-link-grid">{links.map((item) => <AppLink key={item.path} to={item.path}><span>{item.label}</span><strong>Entdecken →</strong></AppLink>)}</section>
  </div>;
}
function ChronologyPage() { return <><SectionIntro eyebrow="Seit 1976" title="Chronik" body={`${chronology.length} Stationen aus der Chronik Jungfrau-Tächi Grindelwald von Urs Dubach.`} image={images.clubXAlps} position="center 42%" /><section className="shell timeline">{chronology.map((entry) => <article key={entry.year}><time>{entry.year}</time><p>{entry.text}</p></article>)}</section></>; }
function MembershipPage() { return <><SectionIntro eyebrow="Club" title="Werde Teil der Jungfrau-Tächi" body="Ob aktiv in der Luft oder verbunden mit dem Club: Wir freuen uns über neue Mitglieder." image={images.hero} position="center 42%" /><section className="shell membership-layout"><div><p className="eyebrow">So funktioniert es</p><h2>In wenigen Schritten dabei</h2><ol><li><strong>Anmeldeformular öffnen</strong><span>Persönliche Angaben und gewünschte Mitgliedschaft eintragen.</span></li><li><strong>Formular absenden</strong><span>Der Vorstand prüft deine Anmeldung und meldet sich bei dir.</span></li><li><strong>Willkommen im Club</strong><span>Du erhältst die Informationen zum Clubleben und zu den nächsten Anlässen.</span></li></ol></div><aside><p className="eyebrow">Externer Dienst</p><h2>Anmeldung</h2><p>Das bestehende Anmeldeformular wird sicher bei Google Forms geöffnet.</p><ExternalLink className="button primary" href={membershipFormUrl}>Anmeldeformular öffnen</ExternalLink></aside></section></>; }
function FlightAreaPage() { return <div className="flight-area-page"><section className="flight-explorer-intro"><div className="shell"><div><p className="eyebrow">Fluggebiet Jungfrauregion · 360°</p><h1 tabIndex="-1">Das Fluggebiet aus der Luft und am Boden</h1><p>Wechsle direkt zwischen fünf Übersichten, vier Startplätzen und vier Landeplätzen. Die Panoramen erleichtern die Orientierung vor dem Flug.</p></div><div className="flight-intro-actions"><AppLink to={routes.meteo.path}>Meteo prüfen</AppLink><ExternalLink href="https://www.skybriefing.com/de/">DABS öffnen</ExternalLink><AppLink to={routes.safety.path}>Sicherheit</AppLink></div></div></section><FlightExplorer /><section className="shell flight-overview"><div className="flight-fact-grid">{flightFacts.map((fact, index) => <AppLink key={fact.title} to={fact.path}><span>0{index + 1}</span><h3>{fact.title}</h3><p>{fact.body}</p><strong>Öffnen →</strong></AppLink>)}</div></section></div>; }
function SiteFacts({ site }) { const facts = site.shv; if (!facts) return <aside className="site-facts is-club"><div><p className="eyebrow">Jungfrau-Tächi Fluggebiet</p><h3>Lokale Platzinformationen</h3><p>Für diesen Platz zeigt der Rundgang die Orientierung vor Ort. Beachte zusätzlich die publizierten lokalen Hinweise und die Beschilderung am Platz.</p></div></aside>; const rows = [["Höhe", facts.altitude], ["Koordinaten", facts.coordinates], ["Kategorie", facts.category], [facts.wind ? "Windrichtung" : "Schwierigkeit", facts.wind || facts.difficulty], ...(facts.wind ? [["Schwierigkeit", facts.difficulty]] : []), ["Zugang", facts.access], ["Betrieb", facts.status]]; return <aside className="site-facts"><div className="site-facts-heading"><div><p className="eyebrow">SHV Infotafel Grindelwald · 06/2024</p><h3>Offizielle Platzangaben</h3></div><ExternalLink href={shvGrindelwaldDocument}>Infotafel als PDF</ExternalLink></div><dl>{rows.map(([term, value]) => <div className={term === "Zugang" ? "site-fact-wide" : ""} key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>{facts.notes?.length > 0 && <div className="site-hazards"><strong>Besonderheiten</strong><ul>{facts.notes.map((note) => <li key={note}>{note}</li>)}</ul></div>}</aside>; }
function createSceneLinkHotspot(element, link) { element.setAttribute("role", "button"); element.setAttribute("tabindex", "0"); element.setAttribute("aria-label", `Panorama ${link.label} öffnen`); const marker = document.createElement("span"); marker.textContent = "↗"; const label = document.createElement("strong"); label.textContent = link.label; element.append(marker, label); element.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); element.click(); } }); }
function createLandmarkHotspot(element, landmark) { element.setAttribute("role", "note"); element.setAttribute("aria-label", landmark.label); element.textContent = landmark.label; }
function createAreaLabelHotspot(element, area) { element.setAttribute("role", "note"); element.setAttribute("aria-label", area.label); element.textContent = area.label; }
function createInfoHotspot(element, marker) {
  element.setAttribute("role", "button");
  element.setAttribute("tabindex", "0");
  element.setAttribute("aria-label", marker.ariaLabel);
  const symbol = document.createElement("span");
  symbol.className = "pano-info-symbol";
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = marker.kind === "webcam" ? "CAM" : "W";
  const popover = document.createElement("span");
  popover.className = "pano-info-popover";
  const eyebrow = document.createElement("small");
  eyebrow.textContent = marker.eyebrow;
  const title = document.createElement("strong");
  title.textContent = marker.title;
  const detail = document.createElement("span");
  detail.textContent = marker.detail;
  popover.append(eyebrow, title, detail);
  element.append(symbol, popover);
  element.addEventListener("keydown", (event) => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); element.click(); } });
}
function areaCentre(vertices) { const radians = vertices.map((vertex) => vertex.yaw * Math.PI / 180); return { yaw: Math.atan2(radians.reduce((sum, value) => sum + Math.sin(value), 0), radians.reduce((sum, value) => sum + Math.cos(value), 0)) * 180 / Math.PI, pitch: vertices.reduce((sum, vertex) => sum + vertex.pitch, 0) / vertices.length }; }
function clipPolygon(points, inside, intersect) {
  const clipped = [];
  for (let index = 0; index < points.length; index += 1) {
    const start = points[index];
    const end = points[(index + 1) % points.length];
    const startInside = inside(start);
    const endInside = inside(end);
    if (startInside && endInside) clipped.push(end);
    else if (startInside) clipped.push(intersect(start, end));
    else if (endInside) clipped.push(intersect(start, end), end);
  }
  return clipped;
}
function projectSphericalPolygon(vertices, viewer, width, height) {
  const degrees = Math.PI / 180;
  const viewYaw = viewer.getYaw() * degrees;
  const viewPitch = viewer.getPitch() * degrees;
  const pitchSin = Math.sin(viewPitch);
  const pitchCos = Math.cos(viewPitch);
  const cameraPoints = vertices.map((vertex) => {
    const pointPitch = vertex.pitch * degrees;
    const deltaYaw = viewYaw - vertex.yaw * degrees;
    const pointPitchSin = Math.sin(pointPitch);
    const pointPitchCos = Math.cos(pointPitch);
    const deltaYawCos = Math.cos(deltaYaw);
    return {
      x: -Math.sin(deltaYaw) * pointPitchCos,
      y: pointPitchSin * pitchCos - pointPitchCos * deltaYawCos * pitchSin,
      z: pointPitchSin * pitchSin + pointPitchCos * deltaYawCos * pitchCos,
    };
  });
  const near = 0.02;
  const front = clipPolygon(cameraPoints, (point) => point.z >= near, (start, end) => {
    const ratio = (near - start.z) / (end.z - start.z);
    return { x: start.x + (end.x - start.x) * ratio, y: start.y + (end.y - start.y) * ratio, z: near };
  });
  if (front.length < 3) return [];
  const scale = width / (2 * Math.tan(viewer.getHfov() * degrees / 2));
  let projected = front.map((point) => ({ x: width / 2 + scale * point.x / point.z, y: height / 2 - scale * point.y / point.z }));
  const boundaries = [
    { inside: (point) => point.x >= 0, intersect: (start, end) => { const ratio = -start.x / (end.x - start.x); return { x: 0, y: start.y + (end.y - start.y) * ratio }; } },
    { inside: (point) => point.x <= width, intersect: (start, end) => { const ratio = (width - start.x) / (end.x - start.x); return { x: width, y: start.y + (end.y - start.y) * ratio }; } },
    { inside: (point) => point.y >= 0, intersect: (start, end) => { const ratio = -start.y / (end.y - start.y); return { x: start.x + (end.x - start.x) * ratio, y: 0 }; } },
    { inside: (point) => point.y <= height, intersect: (start, end) => { const ratio = (height - start.y) / (end.y - start.y); return { x: start.x + (end.x - start.x) * ratio, y: height }; } },
  ];
  for (const boundary of boundaries) {
    if (projected.length < 3) return [];
    projected = clipPolygon(projected, boundary.inside, boundary.intersect);
  }
  return projected.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}
const webcamSceneIds = new Set(["first", "maennlichen"]);
const stationSceneIds = { first: "windline-4104", maennlichen: "slf-MAN1", stechelberg: "holfuy-1989" };
function panoramaInfoMarkers(site) {
  const markers = [];
  const addMarkers = (targetId, yaw, pitch, prefix) => {
    const camera = webcamSceneIds.has(targetId) ? meteoWebcams.find((item) => item.id === targetId) : null;
    const station = meteoStations.find((item) => item.id === stationSceneIds[targetId]);
    if (camera) markers.push({ id: `${prefix}-webcam-${camera.id}`, kind: "webcam", yaw: yaw - 2.2, pitch: pitch + 4, eyebrow: "Live-Webcam", title: camera.title, detail: "Original-Panorama öffnen ↗", ariaLabel: `Live-Webcam ${camera.title} öffnen`, camera });
    if (station) markers.push({ id: `${prefix}-station-${station.id}`, kind: "meteo", yaw: yaw + 2.2, pitch: pitch + 4, eyebrow: "Demo-Messwert", title: station.name, detail: `${station.average} km/h Ø · ${station.gust} km/h Böen · ${station.directionLabel}`, ariaLabel: `Meteo ${station.name}: Demo-Messwert ${station.average} Kilometer pro Stunde, Meteo-Seite öffnen`, station });
    if (targetId === "grund") markers.push({ id: `${prefix}-station-${plannedMeteoStation.id}`, kind: "meteo", yaw: yaw + 2.2, pitch: pitch + 4, eyebrow: "Messstation geplant", title: plannedMeteoStation.name, detail: "Noch keine Messwerte · Meteo öffnen", ariaLabel: `Geplante Messstation ${plannedMeteoStation.name}, Meteo-Seite öffnen`, station: plannedMeteoStation });
  };
  site.links.forEach((link, index) => addMarkers(link.targetId, link.yaw, link.pitch, `${site.id}-link-${index}`));
  if (site.id === "first") {
    const anchor = site.landmarks.find((item) => item.label.includes("Bergstation Firstbahn"));
    if (anchor) addMarkers("first", anchor.yaw, anchor.pitch, "local-first");
  }
  if (site.id === "stechelberg") {
    const anchor = site.landmarks.find((item) => item.label.includes("Schilthornbahn"));
    if (anchor) addMarkers("stechelberg", anchor.yaw, anchor.pitch, "local-stechelberg");
  }
  if (site.id === "grund") {
    const landingArea = site.areas.find((area) => area.kind === "landing");
    if (landingArea) { const anchor = areaCentre(landingArea.vertices); addMarkers("grund", anchor.yaw, anchor.pitch, "local-grund"); }
  }
  return markers;
}
function LocalPanorama({ site, reloadKey, onSelectScene, onOpenMeteo, showAreas }) {
  const containerRef = useRef(null);
  const areaOverlayRef = useRef(null);
  useEffect(() => {
    let viewer;
    let areaFrame;
    let cancelled = false;
    const mountViewer = async () => {
      await import("pannellum");
      if (cancelled || !containerRef.current || !window.pannellum) return;
      const areaHotSpots = showAreas ? site.areas.flatMap((area) => {
        const centre = areaCentre(area.vertices);
        return site.sceneType === "overview" ? [] : [{ pitch: centre.pitch, yaw: centre.yaw, cssClass: `pano-area-label is-${area.kind}`, createTooltipFunc: createAreaLabelHotspot, createTooltipArgs: area }];
      }) : [];
      const sceneHotSpots = site.links.map((link) => { const target = flightScenes.find((scene) => scene.id === link.targetId); const args = { ...link, label: target?.label || link.targetId, onSelectScene }; return { pitch: link.pitch, yaw: link.yaw, cssClass: "pano-link-hotspot", createTooltipFunc: createSceneLinkHotspot, createTooltipArgs: args, clickHandlerFunc: (_event, handlerArgs) => handlerArgs.onSelectScene(handlerArgs.targetId), clickHandlerArgs: args }; });
      const landmarkHotSpots = site.landmarks.map((landmark) => ({ pitch: landmark.pitch, yaw: landmark.yaw, cssClass: "pano-landmark-hotspot", createTooltipFunc: createLandmarkHotspot, createTooltipArgs: landmark }));
      const infoHotSpots = panoramaInfoMarkers(site).map((marker) => ({ pitch: marker.pitch, yaw: marker.yaw, cssClass: `pano-info-hotspot is-${marker.kind}`, createTooltipFunc: createInfoHotspot, createTooltipArgs: marker, clickHandlerFunc: (_event, handlerArgs) => { if (handlerArgs.kind === "webcam") window.open(handlerArgs.camera.viewerUrl, "_blank", "noopener,noreferrer"); else handlerArgs.onOpenMeteo(); }, clickHandlerArgs: { ...marker, onOpenMeteo } }));
      viewer = window.pannellum.viewer(containerRef.current, { type: "cubemap", cubeMap: site.panorama.cubeMap, preview: site.panorama.preview, hotSpots: [...areaHotSpots, ...sceneHotSpots, ...landmarkHotSpots, ...infoHotSpots], autoLoad: true, yaw: site.panorama.yaw, pitch: site.panorama.pitch, hfov: site.panorama.hfov, minHfov: 45, maxHfov: 115, showFullscreenCtrl: false, compass: false, escapeHTML: true, strings: { loadButtonLabel: "Panorama laden", loadingLabel: "Panorama wird geladen …", bylineLabel: "von %s", noPanoramaError: "Panorama konnte nicht geladen werden.", fileAccessError: "Das Panorama muss über den Webserver geöffnet werden.", malformedURLError: "Ungültige Panorama-Adresse.", iOS8WebGLError: "Der Browser unterstützt die 360°-Ansicht nicht.", genericWebGLError: "Der Browser unterstützt die 360°-Ansicht nicht.", textureSizeError: "Das Panorama ist für dieses Gerät zu gross.", unknownError: "Unbekannter Fehler.", twoTouchActivate: "Mit zwei Fingern bewegen", twoTouchXActivate: "Mit zwei Fingern seitlich bewegen", twoTouchYActivate: "Mit zwei Fingern vertikal bewegen", ctrlZoomActivate: "Strg + Scrollen zum Zoomen" } });
      if (showAreas) {
        const overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        overlay.classList.add("pano-area-overlay");
        overlay.setAttribute("aria-hidden", "true");
        for (const area of site.areas) {
          const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
          polygon.dataset.areaShape = area.id;
          polygon.classList.add(`is-${area.kind}`);
          polygon.setAttribute("hidden", "");
          overlay.appendChild(polygon);
        }
        containerRef.current.appendChild(overlay);
        areaOverlayRef.current = overlay;
      }
      const updateAreas = () => {
        if (cancelled || !showAreas || !containerRef.current || !areaOverlayRef.current) return;
        const containerBounds = containerRef.current.getBoundingClientRect();
        for (const area of site.areas) {
          const shape = areaOverlayRef.current.querySelector(`[data-area-shape="${area.id}"]`);
          const points = projectSphericalPolygon(area.vertices, viewer, containerBounds.width, containerBounds.height);
          const xValues = points.map((point) => point.x);
          const yValues = points.map((point) => point.y);
          const hasVisibleSurface = points.length >= 3 && Math.max(...xValues) - Math.min(...xValues) >= 5 && Math.max(...yValues) - Math.min(...yValues) >= 5;
          shape?.toggleAttribute("hidden", !hasVisibleSurface);
          if (hasVisibleSurface) shape?.setAttribute("points", points.map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" "));
        }
        areaFrame = requestAnimationFrame(updateAreas);
      };
      if (showAreas) areaFrame = requestAnimationFrame(updateAreas);
    };
    mountViewer();
    return () => { cancelled = true; if (areaFrame) cancelAnimationFrame(areaFrame); viewer?.destroy(); areaOverlayRef.current = null; };
  }, [site, reloadKey, onSelectScene, onOpenMeteo, showAreas]);
  return <div className="panorama-layer"><div className="panorama-canvas" ref={containerRef} role="region" aria-label={`Interaktives 360°-Panorama: ${site.label}`} /></div>;
}
function FlightExplorer({ initialGroup = "overview", initialSceneId = "" }) {
  const firstScene = flightScenes.find((scene) => scene.id === initialSceneId) || flightScenes.find((scene) => scene.sceneType === initialGroup) || flightScenes[0];
  const [activeGroup, setActiveGroup] = useState(firstScene.sceneType);
  const [activeId, setActiveId] = useState(firstScene.id);
  const [reloadKey, setReloadKey] = useState(0);
  const [showAreas, setShowAreas] = useState(CONFIG.showPanoramaAreas);
  const stageRef = useRef(null);
  const visibleScenes = flightScenes.filter((scene) => scene.sceneType === activeGroup);
  const activeSite = flightScenes.find((scene) => scene.id === activeId) || visibleScenes[0];
  const selectGroup = (groupId) => { setActiveGroup(groupId); setActiveId(flightScenes.find((scene) => scene.sceneType === groupId)?.id); setReloadKey(0); };
  const selectScene = useCallback((sceneId) => { const scene = flightScenes.find((item) => item.id === sceneId); if (!scene) return; setActiveGroup(scene.sceneType); setActiveId(scene.id); setReloadKey(0); }, []);
  const openMeteo = useCallback(() => { history.pushState({}, "", appPath(routes.meteo.path, siteBase)); dispatchEvent(new PopStateEvent("popstate")); }, []);
  return <section className="shell flight-explorer" aria-labelledby="flight-explorer-title">
    <header className="flight-explorer-heading"><div><p className="eyebrow">Interaktiver Gebiets-Explorer</p><h2 id="flight-explorer-title">13 Standorte in einer Ansicht</h2></div><p>Zur Orientierung vor dem Flug. Prüfe die aktuelle Situation und lokale Hinweise immer vor Ort.</p></header>
    <div className="flight-explorer-groups" role="tablist" aria-label="Panorama-Kategorie">{flightSceneGroups.map((group) => <button key={group.id} type="button" role="tab" aria-selected={group.id === activeGroup} onClick={() => selectGroup(group.id)}><span>{group.count}</span>{group.label}</button>)}</div>
    <div className="flight-explorer-layout">
      <nav className="flight-scene-list" aria-label="Panorama auswählen">{visibleScenes.map((scene) => <button key={scene.id} type="button" className={scene.id === activeSite.id ? "is-active" : ""} aria-current={scene.id === activeSite.id ? "true" : undefined} onClick={() => selectScene(scene.id)}><img src={scene.panorama.preview} alt="" /><span><small>{scene.area}</small><strong>{scene.label}</strong></span></button>)}</nav>
      <div className="tour-viewer"><div className="tour-toolbar"><div><p className="eyebrow">360°-Panorama · lokal</p><h2>{activeSite.label}</h2></div><div className="tour-actions">{activeSite.areas.length > 0 && <button type="button" aria-pressed={showAreas} onClick={() => setShowAreas((visible) => !visible)}>{showAreas ? "Flächen aus" : "Flächen ein"}</button>}<button type="button" onClick={() => setReloadKey((value) => value + 1)}>Neu laden</button><button type="button" onClick={() => stageRef.current?.requestFullscreen?.()}>Vollbild</button></div></div>{activeSite.sceneType !== "overview" && <SiteFacts site={activeSite} />}<div className="tour-stage" id="site-panorama" ref={stageRef}><LocalPanorama key={`${activeSite.id}-${reloadKey}`} site={activeSite} reloadKey={reloadKey} onSelectScene={selectScene} onOpenMeteo={openMeteo} showAreas={showAreas} /></div><div className="tour-footer"><p>Ziehen zum Drehen · Pfeile wechseln das Panorama · CAM und W öffnen Livebild oder Meteo</p>{showAreas && activeSite.areas.length > 0 ? <span>Grün: Start/Landung · Gelb: Falten · Rot: Hindernis</span> : <span>Nur gewählte Szene geladen</span>}</div></div>
    </div>
  </section>;
}
function StartSitesPage() { return <><SectionIntro eyebrow="Fluggebiet · 360°" title="Startplätze" body="First, Waldspitz, Männlichen und Mürren im gemeinsamen Gebiets-Explorer." /><FlightExplorer initialGroup="start" /><FlightPageNav /></>; }
function LandingSitesPage() { return <><SectionIntro eyebrow="Fluggebiet · 360°" title="Landeplätze" body="Grund, Bodmi, Stechelberg und Lauterbrunnen im gemeinsamen Gebiets-Explorer." /><FlightExplorer initialGroup="landing" /><FlightPageNav /></>; }
function FlightPageNav() { return <nav className="shell flight-subnav" aria-label="Fluggebiet Seiten"><AppLink to={routes.flightArea.path}>Übersicht</AppLink><AppLink to={routes.startSites.path}>Startplätze</AppLink><AppLink to={routes.landingSites.path}>Landeplätze</AppLink><AppLink to={routes.safety.path}>Sicherheit</AppLink></nav>; }
function SafetyPage() { return <div className="safety-page"><SectionIntro eyebrow="Fluggebiet" title="Sicherheit und lokale Regeln" body="Diese Übersicht erleichtert die Vorbereitung. Verbindlich bleiben die aktuellen offiziellen Luftfahrtinformationen, DABS und Hinweise vor Ort." /><section className="shell safety-priority"><div><span>!</span><div><strong>DABS vor jedem Flug prüfen</strong><p>Aktivierungen und temporäre Lufträume können sich kurzfristig ändern.</p></div></div><ExternalLink className="button primary" href="https://www.skybriefing.com/de/">Offizielles DABS öffnen</ExternalLink></section><section className="shell shv-reference"><div><p className="eyebrow">Offizielle Fluggebietsinformation · 06/2024</p><h2>SHV Infotafel Grindelwald</h2><p>Übersichtskarte mit Startplatz First, Landeplätzen Grund und Bodmi, Sonderregelungen, Wildschutzgebieten, Kabeln und angrenzenden Lufträumen.</p></div><div className="button-row"><ExternalLink className="button secondary" href={shvGrindelwaldDocument}>PDF öffnen</ExternalLink><ExternalLink className="button secondary" href={shvAirspaceUrl}>SHV Airspace Map</ExternalLink></div></section><section className="shell safety-layout"><aside><p className="eyebrow">Bereiche</p>{safetyAreas.map((area) => <a key={area.id} href={`#${area.id}`}>{area.title}</a>)}</aside><div className="safety-content">{safetyAreas.map((area) => <article id={area.id} key={area.id}><header><p className="eyebrow">{area.detail}</p><h2>{area.title}</h2><p>{area.body}</p></header><div className={`safety-images${area.images.length > 1 ? " is-multiple" : ""}`}>{area.images.map((image, index) => <a key={image} href={image} target="_blank" rel="noreferrer"><img src={image} alt={`${area.title} – Regelkarte ${index + 1}`} loading="lazy" /><span>Vergrössern</span></a>)}</div></article>)}</div></section><FlightPageNav /></div>; }
function GrundPage() { return <><SectionIntro eyebrow="Fluggebiet · 360°" title="Landeplatz Grund" body="Interaktive Orientierung am Landeplatz Grund mit lokalen Platzinformationen." /><FlightExplorer initialGroup="landing" initialSceneId="grund" /><FlightPageNav /></>; }
function PhotosPage() { return <><SectionIntro eyebrow="Fotos" title="Fotoreports Jungfrau-Tächi Grindelwald" body={`${photoReports.length} vollständige Galerien aus dem Clubarchiv.`} image={photoReports[0]?.image || images.hero} position="center 42%" /><section className="shell cards photo-grid">{photoReports.map((item) => <Card key={item.slug} item={item} />)}</section></>; }
function PhotoReportPage({ report }) { if (!report) return <NotFound />; return <article className="photo-detail"><DetailIntro backTo={routes.photos.path} backLabel="Alle Fotoreports" eyebrow={`Fotoreport · ${report.dateLabel}`} title={report.title} body={report.detail} image={report.image} /><GalleryViewer images={report.gallery} title={report.title} className="shell" /></article>; }
function ContactPage() { return <><SectionIntro eyebrow="Club" title="Vorstand und Kontakt" body="Die Ressorts der Jungfrau-Tächi. Direkte Kontaktangaben und Zuständigkeiten auf einen Blick." image={images.clubHeader} position="center 44%" /><section className="shell contact-actions"><AppLink to={routes.membership.path}><span>Mitglied werden</span><strong>Anmeldung öffnen →</strong></AppLink><AppLink to={routes.safety.path}><span>Fragen zum Fluggebiet</span><strong>Sicherheitsübersicht →</strong></AppLink></section><section className="shell board-section"><div className="section-heading"><p className="eyebrow">Jungfrau-Tächi</p><h2>Vorstand</h2></div><div className="board-grid">{boardMembers.map((member) => <article key={member.role}><img src={member.image} alt={`Platzhalter-Porträt für ${member.name}`} loading="lazy" /><div className="board-card-body"><p>{member.role}</p><h3>{member.name}</h3><address><span>{member.address}</span><a href={`tel:${member.phone.replaceAll(" ", "")}`}>{member.phone}</a><a href={`mailto:${member.email}`}>{member.email}</a>{member.secondaryEmail && <a href={`mailto:${member.secondaryEmail}`}>{member.secondaryEmail}</a>}</address></div></article>)}</div></section></>; }
function NotFound() { return <SectionIntro eyebrow="Nicht gefunden" title="Diese Seite ist nicht verfügbar." />; }
function RouteView({ path }) { if (path.startsWith("/news/")) return <NewsArticlePage article={news.find((item) => item.path === path)} />; if (path.startsWith("/fotos/")) return <PhotoReportPage report={photoReports.find((item) => item.path === path)} />; const views = { "/": Home, "/meteo": MeteoPage, "/news": NewsPage, "/club": ClubPage, "/chronik": ChronologyPage, "/mitglied": MembershipPage, "/fluggebiet": FlightAreaPage, "/fluggebiet/startplaetze": StartSitesPage, "/fluggebiet/landeplaetze": LandingSitesPage, "/fluggebiet/sicherheit": SafetyPage, "/fluggebiet/grund": GrundPage, "/fotos": PhotosPage, "/kontakt": ContactPage }; const View = views[path] || NotFound; return <View />; }
export function resolveRoute(pathname) { const routePath = routeFromPathname(pathname, siteBase); if (routeList.some((route) => route.path === routePath)) return routePath; if (news.some((item) => item.path === routePath) || photoReports.some((item) => item.path === routePath)) return routePath; return null; }
export function App() { const currentPath = () => routeFromPathname(window.location.pathname, siteBase); const [path, setPath] = useState(currentPath); const initialRoute = useRef(true); useEffect(() => { const update = () => setPath(currentPath()); addEventListener("popstate", update); return () => removeEventListener("popstate", update); }, []); useEffect(() => { if (initialRoute.current) { initialRoute.current = false; return; } requestAnimationFrame(() => document.querySelector("#inhalt h1")?.focus()); }, [path]); return <Shell currentPath={path}><RouteView path={resolveRoute(path) || path} /></Shell>; }
