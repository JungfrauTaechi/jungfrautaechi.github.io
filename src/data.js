import { assetUrl } from "./site-paths.js";
import { generatedNews, generatedPhotoReports } from "./generated-content.js";

const siteBase = import.meta.env.BASE_URL;
const localAsset = (path) => assetUrl(path, siteBase);
const contentAsset = (path) => !path ? "" : /^https?:\/\//i.test(path) ? path : localAsset(path);
const formatDate = (date) => {
  if (!date || date === "1970-01-01") return "Archiv";
  return new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(`${date}T12:00:00`));
};

export const CONFIG = { showAnniversary: true, showPanoramaAreas: false };
export const source = (url) => `https://www.jungfrau-taechi.ch${url}`;
export const images = {
  hero: localAsset("/assets/source/hero-flight.jpg"),
  eigertourMap: localAsset("/assets/source/eigertour9a.jpg"),
  firabe: localAsset("/assets/source/fa2_26.jpg"),
  hikeFly: localAsset("/assets/source/hf26_1_5.jpg"),
  challenge: localAsset("/assets/source/50challenge.jpg"),
  challengeMap: localAsset("/assets/source/challenge50.jpg"),
  flightArea: localAsset("/assets/source/fluggebiet-grindelwald-sidebar.jpg"),
  flightAreaHero: localAsset("/assets/panoramas/first/3.jpg"),
  meteoHeader: localAsset("/assets/panoramas/first/0.jpg"),
  clubHeader: localAsset("/assets/source/clubfliegen-first-aspi-2015.jpg"),
  clubCommunity: localAsset("/assets/source/clubfliegen-first-aspi-2015.jpg"),
  clubCompetition: localAsset("/assets/archive/photos/swiss-cup-grindelwald-10-mai-2015/001.jpg"),
  clubXAlps: localAsset("/assets/source/xalps-2017.jpg"),
  clubTrip: localAsset("/assets/source/clubausflug-bassano-2015.jpg"),
  boardPlaceholder: localAsset("/assets/people/board-placeholder.png"),
  safetyGrindelwald: localAsset("/assets/source/safety-grindelwald.jpg"),
  safetyEigergletscher: localAsset("/assets/source/safety-eigergletscher.jpg"),
  safetyMaennlichen: localAsset("/assets/source/safety-maennlichen.jpg"),
  safetyLauterbrunnen: localAsset("/assets/source/safety-lauterbrunnen.jpg"),
  safetyMeiringen: localAsset("/assets/source/safety-meiringen.jpg"),
  safetyInterlaken1: localAsset("/assets/source/safety-interlaken-1.jpg"),
  safetyInterlaken2: localAsset("/assets/source/safety-interlaken-2.jpg"),
  webcamFirst: localAsset("/assets/source/hero-flight.jpg"),
  webcamValley: localAsset("/assets/source/fluggebiet-grindelwald-sidebar.jpg"),
};
export const routes = {
  home: { path: "/", label: "Start", sourceUrl: source("/") }, meteo: { path: "/meteo", label: "Meteo", sourceUrl: source("/sites/meteo") }, news: { path: "/news", label: "News", sourceUrl: source("/sites/news") }, club: { path: "/club", label: "Club", sourceUrl: source("/sites/club") }, chronology: { path: "/chronik", label: "Chronik", sourceUrl: source("/sites/chronik") }, membership: { path: "/mitglied", label: "Mitglied werden", sourceUrl: source("/sites/mitglied") }, flightArea: { path: "/fluggebiet", label: "Fluggebiet", sourceUrl: source("/sites/fluggebiet") }, startSites: { path: "/fluggebiet/startplaetze", label: "Startplätze", sourceUrl: source("/sites/dcjt360") }, landingSites: { path: "/fluggebiet/landeplaetze", label: "Landeplätze", sourceUrl: source("/sites/dcjt360") }, safety: { path: "/fluggebiet/sicherheit", label: "Sicherheit", sourceUrl: source("/sites/gk_gw") }, grund: { path: "/fluggebiet/grund", label: "Grund", sourceUrl: source("/sites/grund") }, photos: { path: "/fotos", label: "Fotos", sourceUrl: source("/sites/fotoreports") }, contact: { path: "/kontakt", label: "Kontakt", sourceUrl: source("/sites/kontakt") },
};
export const utilityLinks = [{ label: "Wind & Meteo", to: routes.meteo.path }, { label: "Webcams", href: "https://www.jungfrau-taechi.ch/sites/webcamlinks" }, { label: "DABS", href: "https://www.skybriefing.com/de/" }];
export const meteoStations = [
  { id: "first", name: "First", place: "Bergstation", altitude: 2168, average: 12, gust: 18, direction: 248, directionLabel: "WSW", age: "vor 2 Min.", status: "good", statusLabel: "Ruhig", temperature: 8, trend: "Leicht zunehmend", values: [{ time: "10:40", average: 12, gust: 18 }, { time: "10:30", average: 11, gust: 17 }, { time: "10:20", average: 10, gust: 15 }, { time: "10:10", average: 9, gust: 14 }] },
  { id: "maennlichen", name: "Männlichen", place: "Gipfel", altitude: 2230, average: 20, gust: 29, direction: 281, directionLabel: "W", age: "vor 4 Min.", status: "watch", statusLabel: "Beobachten", temperature: 6, trend: "Zunehmend", values: [{ time: "10:38", average: 20, gust: 29 }, { time: "10:28", average: 18, gust: 26 }, { time: "10:18", average: 17, gust: 24 }, { time: "10:08", average: 15, gust: 22 }] },
  { id: "eigergletscher", name: "Eigergletscher", place: "Station", altitude: 2320, average: 8, gust: 13, direction: 171, directionLabel: "S", age: "vor 3 Min.", status: "good", statusLabel: "Ruhig", temperature: 5, trend: "Stabil", values: [{ time: "10:39", average: 8, gust: 13 }, { time: "10:29", average: 8, gust: 12 }, { time: "10:19", average: 7, gust: 12 }, { time: "10:09", average: 8, gust: 13 }] },
  { id: "schilthorn", name: "Schilthorn", place: "Gipfel", altitude: 2970, average: 31, gust: 43, direction: 304, directionLabel: "NW", age: "vor 6 Min.", status: "strong", statusLabel: "Stark", temperature: 1, trend: "Böig", values: [{ time: "10:36", average: 31, gust: 43 }, { time: "10:26", average: 28, gust: 39 }, { time: "10:16", average: 30, gust: 42 }, { time: "10:06", average: 26, gust: 37 }] },
];
export const meteoWebcams = [
  { id: "first", title: "First · Schreckfeld", time: "Aufnahme 10:39", image: images.webcamFirst, alt: "Mockaufnahme der Webcam First und Schreckfeld" },
  { id: "valley", title: "Grindelwald · Tal", time: "Aufnahme 10:37", image: images.webcamValley, alt: "Mockaufnahme der Webcam Grindelwald Tal" },
];
export const news = generatedNews.map((item) => ({ ...item, dateLabel: formatDate(item.date), image: contentAsset(item.coverImage) || images.hero, alt: item.gallery?.[0]?.alt || item.title, path: `/news/${item.slug}`, gallery: (item.gallery || []).map((image, index) => ({ ...image, src: contentAsset(image.src), alt: image.alt || `${item.title} – Bild ${index + 1}` })) }));
export const activityLinks = news.slice(0, 3).map(({ title, category, path }) => ({ title, category, path }));
export const clubPurposes = [
  { number: "01", title: "Fluggebiet erhalten", text: "Erhaltung des Fluggebietes mit Start- und Landeplätzen, vor allem in den Lütschinentälern." },
  { number: "02", title: "Sport und Gemeinschaft", text: "Förderung des Sports und der Geselligkeit für Mitglieder durch Clubaktivitäten." },
  { number: "03", title: "Wettkampfsport fördern", text: "Förderung des Hängegleiter-Wettkampfsportes." },
];
export const clubPortrait = [
  "Unser Club wurde 1976 unter dem Namen «Delta-Club Jungfrau-Tächi» von 13 Flugenthusiasten um Toni Wyss von der Kleinen Scheidegg gegründet. Heute zählt der Club rund 300 Mitglieder, und Grindelwald hat sich zu einem der bekanntesten Fluggebiete der Schweiz entwickelt. Hier machen viele Gäste bei einem Tandemflug erstmals Bekanntschaft mit der freiesten Art des Fliegens, während die Könner an den besten Sommertagen gar über den höchsten Alpengipfeln schweben oder sich zu Streckenflügen von über 100 Kilometer aufmachen.",
  "Trotz Otto Lilienthals Versuchen um 1890 entwickelte sich unser Sport erst 90 Jahre später. Ironischerweise bedurfte es für die einfachste Form des Fliegens zuerst der Reise zum Mond. Der NASA-Forscher Ernest Rogallo entwickelte im Zusammenhang mit Fallschirmstudien für die Apollokapseln den Drachen und auch das Prinzip für den späteren Gleitschirm. Zuerst dachte man – wie einst Lilienthal – nur an einfache Gleitflüge von Hügeln. Bald aber lernten die Pioniere, den Segelfliegern gleich die Aufwinde zu nutzen und damit stundenlange und weite Flüge zu machen.",
  "Zwar nahmen die Mitgliederzahlen stetig zu, aber der Club blieb in seinen ersten zehn Jahren doch eine Gemeinschaft von meist wagemutigen Idealisten. Dies änderte sich mit dem Aufkommen der Gleitschirme ab 1986. Alpenweit, aber vor allem auch in Grindelwald, setzte ein eigentlicher Boom ein. 1988 hatte der Verein erstmals über 100 Mitglieder. Er wandelte sich nun immer mehr zum Gleitschirmclub.",
  "Das Grindelwalder Wettkampfteam konnte Anfang der 90er Jahre einige grosse Erfolge buchen. Ulrich Bohren wurde Schweizer Meister und war zweimal Mannschaftsweltmeister mit dem Schweizer Team. Der Club gewann vier Medaillen an den nationalen Vereinsmeisterschaften, darunter 1996 den Meistertitel, und machte sich als Veranstalter einer Schweizer Meisterschaft und von drei Gleitschirm-Weltcups einen guten Namen.",
  "Die Geselligkeit innerhalb des Clubs und die Verbundenheit mit dem Ort konnte glücklicherweise aus den Pioniertagen des Deltafliegens ins neue Jahrtausend hinübergerettet werden. Der Verein leistet regelmässig freiwillige Arbeitseinsätze zugunsten der Alpwirtschaft. Einen Höhepunkt bildet das alljährliche Clubfliegen, wo traditionellerweise ein ganzer «Bänz» am Spiess gebraten wird.",
  "Bereits 1990 wurden ab Startplatz First das Wetterhorn und das Schreckhorn überflogen, mit dem Delta auch der Eiger. Im Jahr 2000 gelang Clubmitglied Alex Hofer der Überflug von Eiger, Mönch und Jungfrau in einem Zuge. Er war früher schon als erster von First aus ins Ausland geflogen: 130 Kilometer quer durch die Zentral- und Ostschweiz nach Vaduz.",
  "Mit dem neuen Jahrtausend begannen sich die professionelle Jugendförderung und die konsequente Aufbauarbeit in der Leistungsgruppe auszuzahlen. Weltmeister, Teamweltmeisterinnen und Teamweltmeister, Europameister, Schweizermeister, Gesamtweltcup- und X-Alps-Sieger: Diese Titel wurden innerhalb weniger Jahre von Clubmitgliedern erflogen.",
  "In enger Zusammenarbeit baute der Club die Infrastruktur auf und verbesserte sie laufend. Im Jahr 2000 konnte eine automatische Wetterstation beim Hauptstartplatz First in Betrieb genommen werden. Viele Gastpilotinnen und Gastpiloten aus aller Welt geniessen heute das dank der Vereinsanstrengungen gebührenfreie Fluggebiet.",
];
export const clubStories = [
  { period: "1987–1991", title: "Der Matratzenboom", story: "Erster Flug First – Höhenmatte", author: "Stauffer Roland", image: images.clubCommunity, text: "Am frühen Nachmittag Start von Grindelwald-First. Via Waldspitz, Reeti und Schynige Platte ging es zur Höhenmatte in Interlaken. Fluggerät war ein legendärer «Trilair» von Ailes de K. Für diesen Flug war ein Preis von 200 Franken und eine Flasche Champagner ausgesetzt. Post Roli holte sich den Preis ab – und dem Vernehmen nach sei sein Kopfweh am Tag danach nicht bloss auf den langen Aufenthalt in der Höhe zurückzuführen gewesen." },
  { period: "1991–1996", title: "Speedrun und Race to Goal", story: "Überflug und Notlandung am Schreckhorn", author: "Stauffer Roland / Hauswirth Thomas", image: images.clubCompetition, text: "Post Roli und Bächler René überfliegen von First aus via Strahlegghorn und Lauteraarhorn das Schreckhorn. Blätz und Joey treffen sie erst über dem Gipfel. Joey vergisst sich beim Fotografieren derart, dass er nach einem Klapper den Notschirm ziehen muss. Mit unvorstellbarem Glück kann er unverletzt von der Ostseite des Schreckhorns ausgeflogen werden. Seither feiert er am 5. August seinen zweiten Geburtstag." },
  { period: "1997–1999", title: "Gleitschirmstadion Grindelwald", story: "Nachlese zur Club-SM in Balsthal", author: "Bohren Roland", image: images.clubXAlps, text: "Die neuen Schirme wurden am Dienstag in Deutschland abgeholt; am Mittwoch trainierte das Team in Interlaken. Am ersten Wettkampftag in Balsthal war der Startplatz riesig, sanft und flach – die erhoffte gute Periode kam allerdings nur noch in Form von weniger starkem Rückenwind. Trotz Baumkontakt, Zaun und schwierigen Bedingungen erreichte ein Tächi den Landeplatz. Der Bericht bewahrt den trockenen Humor einer Wettkampfmannschaft, die auch aus einem neunten Schlussrang eine gute Geschichte machte." },
];
export const clubProgramme = [
  { date: "19.–20. September 2026", title: "Clubfliegen First – Sandigen Boden", text: "Taskfliegen nach Stärkeklasse und Punktlandungen, anschliessend Jubiläumsfest im Sandigen Boden." },
  { date: "7. November 2026", title: "Clubessen", text: "Informationen zum Ort und zur Anmeldung folgen." },
  { date: "30. Januar 2027", title: "Hauptversammlung", text: "Informationen folgen." },
  { date: "13. Februar 2027", title: "Nachtschlitteln und Fondueplausch", text: "Auf dem Eigerrun." },
  { date: "6. März 2027", title: "Landecup Holzerbar", text: "Informationen folgen." },
];
export const chronology = [
  { year: "1976", text: "Gründung des Deltaclub Jungfrau Tächi am 17. Januar 1976 im Hotel Eden in Wengen. Toni Wyss wird erster Präsident. Der Club zählt 13 Mitglieder. Toni Wyss nimmt an der Deltaweltmeisterschaft in Kössen teil." },
  { year: "1978", text: "Erstes Freundschaftsfliegen mit auswärtiger Beteiligung. Ziellandeflüge von Pfingstegg und Waldspitz ins Gryt." },
  { year: "1979", text: "Peter Studer wird Präsident. Der Club hat nun bereits 81 Mitglieder, davon 52 passive." },
  { year: "1980", text: "Der Club führt mit dem Swisscup Delta erstmals einen leistungsorientierten nationalen Wettkampf durch." },
  { year: "1983", text: "Peter Schild wird neuer Präsident und führt den Club während der kommenden neun Jahre." },
  { year: "1984", text: "Zum zweiten und letzten Mal wird ein Swisscup Delta veranstaltet. Beim Räumen am Röti leistet der Club erstmals einen freiwilligen Arbeitseinsatz für eine Bergschaft. Toni Wyss stiftet eine Kanne für besondere Flugleistungen." },
  { year: "1986", text: "Die Hauptversammlung an Aspen nimmt Gleitschirmflieger als vollwertige Mitglieder auf." },
  { year: "1987", text: "Mit einjähriger Verspätung findet bei miserablem Wetter das Fest zum zehnjährigen Clubjubiläum statt." },
  { year: "1988", text: "Der Delta-Club Jungfrau-Tächi zählt erstmals über 100 Mitglieder." },
  { year: "1990", text: "Roland Stauffer gelingt mit dem Gleitschirm der Flug First–Höhenmatte. Hanspeter Feuz überfliegt mit dem Delta den Eigergipfel, Edi Bucher mit dem Gleitschirm das Wetterhorn und Ueli Bohren das Schreckhorn." },
  { year: "1991", text: "Bildung des Wettkampfteams Jungfrau Parapente. Ueli Bohren wird Schweizer Meister im Gleitschirmfliegen. Das Clubteam gewinnt am Moléson die erste von drei Silbermedaillen an Schweizer Clubmeisterschaften." },
  { year: "1992", text: "Der DCJT organisiert die Gleitschirm-Schweizermeisterschaft; Ueli Bohren gewinnt Bronze. Ernst Wüthrich wird Präsident, der Club zählt über 200 Mitglieder und der Landeplatz Ey kann gepachtet werden." },
  { year: "1993", text: "Ueli Bohren als Pilot und Urs Dubach als Coach sind Mitglieder der Schweizer Weltmeistermannschaft in Verbier." },
  { year: "1994", text: "Am vom DCJT durchgeführten Paragliding World Cup in Grindelwald erreicht Ueli Bohren den dritten Rang. Der Club wird in die Sportkommission Grindelwald aufgenommen." },
  { year: "1995", text: "Der Club erhält erstmals Beiträge an Landeplatzabgeltungen aus dem Skipistenfonds. Ueli Bohren gewinnt Bronze an den Schweizer Meisterschaften." },
  { year: "1996", text: "Nach der Statutenrevision heisst der Club offiziell Delta-Club Jungfrau-Tächi Grindelwald. In Disentis wird der DCJT erstmals Schweizer Clubmeister. Das Alphüttenfest zum 20-Jahr-Jubiläum wird ein grosser Erfolg; Alex Hofer fliegt von Grindelwald nach Liechtenstein." },
  { year: "1997", text: "Dres Ringgenberg wird Präsident des DCJT. Toni Wyss wird Ehrenmitglied des SHV." },
  { year: "1998", text: "An den vom DCJT organisierten Gleitschirm-Clubmeisterschaften kann wegen des Wetters kein gültiger Lauf durchgeführt werden." },
  { year: "1999", text: "Der Club organisiert im Kongresssaal und Hotel Regina die 25-Jahr-Jubiläums-Generalversammlung des SHV." },
  { year: "2000", text: "Alex Hofer überfliegt in einem Flug Eiger, Mönch und Jungfrau. Elisabeth Rauchenberger gewinnt die Swisscup-Damenwertung. Der Club baut den Bächlerturm auf First um und integriert eine automatische Wetterstation." },
  { year: "2001", text: "Der Club feiert sein 25-jähriges Bestehen. Höhepunkt ist die Jubiläumsfeier auf First. Alex Hofer wird Schweizer Meister, Elisabeth Rauchenberger Zweite." },
  { year: "2002", text: "Alex Hofer wird Europameister und gewinnt den Gesamtweltcup, Elisabeth Rauchenberger wird Vize-Europameisterin. Rolf Flückiger gelingt die erste Eigerüberquerung mit einem Tandemschirm." },
  { year: "2003", text: "Alex Hofer wird Weltmeister. Elisabeth Rauchenberger und Christian Maurer werden Teamweltmeister. Der Rekordsommer ermöglicht aussergewöhnlich viele Dauer-, Gipfel- und Streckenflüge; an der Talstation First wird eine Internet-Wetterinformation installiert." },
  { year: "2004", text: "Elisabeth Rauchenberger und Karin Appenzeller sowie Christian Maurer und Alex Hofer holen Doppelsiege an der Schweizermeisterschaft. Christian Maurer wird Europameister und stellt mit 323 Kilometern einen neuen Europarekord auf." },
  { year: "2005", text: "Alex Hofer gewinnt die X-Alps, Christian Maurer den Gesamtweltcup. Elisabeth Rauchenberger und Stefan Wyss erreichen dritte Plätze an der Weltmeisterschaft. Die Club-SM in Grindelwald bleibt trotz Organisation und Wetter nach zwei Unfällen ohne Wertung." },
  { year: "2006", text: "Der Club feiert sein dreissigjähriges Jubiläum mit rund 130 Tächi auf First. Karin Appenzeller und Christian Maurer gewinnen Weltcup und Schweizermeisterschaft; Clubmitglieder feiern weitere EM-, WM- und Rekorderfolge." },
  { year: "2007", text: "Christian Maurer gewinnt als erster Gleitschirmpilot dreimal in Folge den Weltcup. Alex Hofer gewinnt zum zweiten Mal die X-Alps. Der Club organisiert mit Unterstützung der Firstbahnen den weltweit ersten internationalen Speedflying-Wettkampf." },
  { year: "2008", text: "Der Club richtet einen Weltcup in Grindelwald aus. Christian Maurer gewinnt das Heimspiel und stellt einen Weltrekord im Tumbling auf. Der Startplatz Pfingstegg erhält durch eine Ausholzaktion mehr Sicherheit." },
  { year: "2009", text: "Christian Maurer gewinnt die X-Alps, Alex Hofer erreicht als einziger weiterer Pilot das Ziel in Monaco. Stefan Wyss wird Vizeweltmeister und Schweizer Meister. Das Tächi-Team bestätigt den dritten Rang im OLC." },
  { year: "2010–2014", text: "Christian Maurer gewinnt die X-Alps 2011 und 2013. Auch weitere Clubmitglieder überzeugen in nationalen und internationalen Wettkämpfen." },
];
export const flightFacts = [{ title: "4 Startplätze", body: "First · Waldspitz · Männlichen · Mürren", path: routes.startSites.path }, { title: "4 Landeplätze", body: "Grund · Bodmi · Stechelberg · Lauterbrunnen", path: routes.landingSites.path }, { title: "Sicherheit", body: "Lokale Regeln, Lufträume und DABS vor jedem Flug", path: routes.safety.path }];
export const photoReports = generatedPhotoReports.map((item) => ({ ...item, dateLabel: formatDate(item.date), image: contentAsset(item.coverImage) || images.hero, alt: item.gallery?.[0]?.alt || item.title, path: `/fotos/${item.slug}`, gallery: (item.gallery || []).map((image, index) => ({ ...image, src: contentAsset(image.src), alt: image.alt || `${item.title} – Bild ${index + 1}` })) }));
export const shvGrindelwaldDocument = localAsset("/assets/documents/shv-fluggebiet-grindelwald.pdf");
export const shvAirspaceUrl = "https://airspace.shv-fsvl.ch/";
const panoArea = (label, kind, yaw, pitch, width, height, rotation = 0) => ({ label, kind, yaw, pitch, width, height, rotation });
const panorama = (scene, yaw, pitch, hfov, overlays = []) => ({
  cubeMap: Array.from({ length: 6 }, (_, face) => localAsset(`/assets/panoramas/${scene}/${face}.jpg`)),
  preview: localAsset(`/assets/panoramas/${scene}/thumbnail.jpg`),
  yaw,
  pitch,
  hfov,
  overlays,
});
export const landingSites = [
  { id: "grund", label: "Grindelwald, Grund", area: "Grindelwald", panorama: panorama("grund", -79.7, 5.7, 80, [panoArea("Landeplatz Grund", "landing", -70, -11, 260, 112, -5), panoArea("Faltplatz", "folding", -98, -7, 150, 48, -12), panoArea("Achtung Zaun", "danger", -101, -13, 150, 34, -18)]), shv: { altitude: "950 m ü. M.", coordinates: "46.6202, 8.0294", category: "Gleitschirm", difficulty: "Einfach bis mittel", access: "Zu Fuss: ca. 5 Min. ab Bahnhof Grund oder 10 Min. ab Grindelwald Terminal", status: "Ganzjährig", notes: ["Zaun beachten.", "Bei starkem Talwind Queranflug nicht hinter der Strasse.", "Landeplatz nicht überqueren."] } },
  { id: "bodmi", label: "Grindelwald, Bodmi", area: "Grindelwald", panorama: panorama("bodmi", -31.9, 20.4, 80, [panoArea("Landeplatz Bodmi", "landing", -13, -7, 210, 94, -5), panoArea("Faltplatz", "folding", -51, -7, 140, 48, 8)]), shv: { altitude: "1100 m ü. M.", coordinates: "46.6287, 8.0436", category: "Gleitschirm", difficulty: "Schwer (im Winter einfach)", access: "Zu Fuss: ca. 5 Min. ab Talstation Firstbahn", status: "Ganzjährig", notes: ["Anspruchsvoller, kleiner, kupierter Landeplatz mit zahlreichen Hindernissen.", "Im Winter unterhalb des Kinderskischulgeländes landen.", "Landeplatz nicht überqueren."] } },
  { id: "stechelberg", label: "Stechelberg, Schilthornbahn", area: "Lauterbrunnental", panorama: panorama("stechelberg", 0, 0, 90, [panoArea("Landeplatz Stechelberg", "landing", 8, -12, 300, 140, -2), panoArea("Faltplatz", "folding", -28, -5, 130, 48, 4)]) },
  { id: "lauterbrunnen", label: "Lauterbrunnen", area: "Lauterbrunnental", panorama: panorama("lauterbrunnen", -31.5, 10.6, 80, [panoArea("Landeplatz Lauterbrunnen", "landing", -28, -3, 320, 150, -4)]) },
];
export const startSites = [
  { id: "first", label: "Grindelwald, First", area: "Grindelwald", panorama: panorama("first", 1.6, -2.7, 60), shv: { altitude: "2120 m ü. M.", coordinates: "46.6575, 8.0551", category: "Gleitschirm und Delta", wind: "Ost bis Südwest", difficulty: "Einfach", access: "Gondelbahn Grindelwald–First, danach ca. 5 Min. zu Fuss", status: "Ganzjährig" } },
  { id: "waldspitz", label: "Grindelwald, Waldspitz", area: "Grindelwald", panorama: panorama("waldspitz", -53.8, 1.6, 85) },
  { id: "maennlichen", label: "Grindelwald, Männlichen", area: "Grindelwald", panorama: panorama("maennlichen", -15.2, 1.5, 50) },
  { id: "muerren", label: "Mürren", area: "Lauterbrunnental", panorama: panorama("muerren", 0, 0, 90) },
];
export const safetyAreas = [
  { id: "grindelwald", title: "Fluggebiet Grindelwald", detail: "LS-R6 Axalp und lokale Vereinbarung", body: "DABS zwingend beachten. Südlich SwissGrid 169000 gilt lokal eine maximale Höhe von 2250 m ü. M. statt 1850 m ü. M. Während der Axalp-Fliegerdemo kann die grössere temporäre LS-R13 gelten.", images: [images.safetyGrindelwald, images.safetyEigergletscher, images.safetyMaennlichen] },
  { id: "lauterbrunnen", title: "Lauterbrunnen und Mürren", detail: "Lokale Fluggebietsregeln", body: "Bitte die eingezeichneten lokalen Regeln sowie Start- und Landeplatzhinweise vor dem Flug vollständig prüfen.", images: [images.safetyLauterbrunnen] },
  { id: "meiringen", title: "HX Meiringen", detail: "Militärflugplatz und Luftraum", body: "Die aktuellen HX-Regeln und Aktivierungszeiten vor jedem Flug prüfen; DABS und offizielle Luftfahrtinformationen bleiben verbindlich.", images: [images.safetyMeiringen] },
  { id: "interlaken", title: "Landeplätze Interlaken", detail: "Höhenangaben in AMSL", body: "Die publizierten Höhen sind Meter über Meer und nicht Meter über Grund. Die beiden Regelkarten vor Anflug der Interlakner Landeplätze beachten.", images: [images.safetyInterlaken1, images.safetyInterlaken2] },
];
export const membershipFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfFEIRJqhDSkB7wPeH2SWIIHiL5s61NnF57sO9EX1a2C3wc_w/viewform";
export const boardMembers = [
  { role: "Präsident", name: "Andreas Egger", address: "Bachsbortweg 24 · 3818 Grindelwald", phone: "+41 79 722 86 65", email: "dres.egger@gmail.com" },
  { role: "Vize-Präsident / Wettkampfchef", name: "Peter Zurbuchen", address: "Sulliger 1 · 3818 Grindelwald", phone: "+41 79 542 01 86", email: "peter-zurbuchen@bluewin.ch" },
  { role: "Anlässe / Spezialprogramme", name: "Adrian Roth", address: "Bodenstrasse 49 · 3818 Grindelwald", phone: "+41 79 485 42 71", email: "rothadrian@hotmail.com" },
  { role: "Luftraum / Fluggebiet", name: "Reto Marolf", address: "Schoneggweg 5 · 3818 Grindelwald", phone: "+41 78 772 33 08", email: "retomarolf@gmail.com" },
  { role: "Material / Jahresprogramm", name: "Matthias Schenk", address: "Guggengasse 5 · 3818 Grindelwald", phone: "+41 79 824 86 02", email: "matthias@schenk-grindelwald.ch" },
  { role: "Kassierin", name: "Andrea Jossi", address: "Blätzweg 6 · 3818 Grindelwald", phone: "+41 78 690 15 34", email: "andrea.jossi@bluewin.ch" },
  { role: "Sekretär / Mutationen", name: "Bruno Maurer", address: "Obdorfstrasse 52 · 3852 Ringgenberg", phone: "+41 79 754 40 36", email: "jungfrautaechi@gmail.com", secondaryEmail: "brunomaurer58@gmail.com" },
  { role: "Webmaster / Social Media", name: "Pascal Imhof", address: "Schulgässli 10 · 3818 Grindelwald", phone: "+41 79 335 28 63", email: "info@pascalimhof.com" },
].map((member) => ({ ...member, image: images.boardPlaceholder }));
export const grundTourUrl = landingSites[0].panorama.preview;
