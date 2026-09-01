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
};
export const routes = {
  home: { path: "/", label: "Start", sourceUrl: source("/") }, meteo: { path: "/meteo", label: "Meteo", sourceUrl: source("/sites/meteo") }, news: { path: "/news", label: "News", sourceUrl: source("/sites/news") }, club: { path: "/club", label: "Club", sourceUrl: source("/sites/club") }, chronology: { path: "/chronik", label: "Chronik", sourceUrl: source("/sites/chronik") }, membership: { path: "/mitglied", label: "Mitglied werden", sourceUrl: source("/sites/mitglied") }, flightArea: { path: "/fluggebiet", label: "Fluggebiet", sourceUrl: source("/sites/fluggebiet") }, startSites: { path: "/fluggebiet/startplaetze", label: "Startplätze", sourceUrl: source("/sites/dcjt360") }, landingSites: { path: "/fluggebiet/landeplaetze", label: "Landeplätze", sourceUrl: source("/sites/dcjt360") }, safety: { path: "/fluggebiet/sicherheit", label: "Sicherheit", sourceUrl: source("/sites/gk_gw") }, grund: { path: "/fluggebiet/grund", label: "Grund", sourceUrl: source("/sites/grund") }, photos: { path: "/fotos", label: "Fotos", sourceUrl: source("/sites/fotoreports") }, contact: { path: "/kontakt", label: "Kontakt", sourceUrl: source("/sites/kontakt") },
};
export const utilityLinks = [{ label: "Wind & Meteo", to: routes.meteo.path }, { label: "Webcams", href: "https://www.jungfrau-taechi.ch/sites/webcamlinks" }, { label: "DABS", href: "https://www.skybriefing.com/de/" }];
// Ordered snapshot from the winds.mobi station API, resolved around Grindelwald
// (46.6242, 8.0414) on 2026-09-01. Readings below remain deterministic mock data.
export const windStationCatalog = [
  { id: "windline-4104", name: "Grindelwald First", altitude: 2150, provider: "windline.ch", latitude: 46.657778, longitude: 8.055, distanceKm: 3.9 },
  { id: "slf-FIR2", name: "Schmidigen-Bidmeren", altitude: 2111, provider: "slf.ch", latitude: 46.668777, longitude: 8.064403, distanceKm: 5.3 },
  { id: "slf-MAE2", name: "Itramen", altitude: 2162, provider: "slf.ch", latitude: 46.618649, longitude: 7.943542, distanceKm: 7.5 },
  { id: "slf-MAN1", name: "Männlichen", altitude: 2341, provider: "slf.ch", latitude: 46.618115, longitude: 7.938067, distanceKm: 7.9 },
  { id: "slf-LHO2", name: "Russisprung", altitude: 2150, provider: "slf.ch", latitude: 46.582791, longitude: 7.943742, distanceKm: 8.8 },
  { id: "meteoswiss-JUN", name: "Jungfraujoch", altitude: 3581, provider: "meteoswiss.ch", latitude: 46.547562, longitude: 7.985444, distanceKm: 9.5 },
  { id: "slf-SWM1", name: "Schwarzmönch", altitude: 2673, provider: "slf.ch", latitude: 46.551367, longitude: 7.927542, distanceKm: 11.9 },
  { id: "holfuy-1989", name: "Stechelberg", altitude: 850, provider: "holfuy.com", latitude: 46.56665, longitude: 7.90838, distanceKm: 12.0 },
  { id: "meteoswiss-BRZ", name: "Brienz", altitude: 577, provider: "meteoswiss.ch", latitude: 46.740726, longitude: 8.060863, distanceKm: 13.0 },
  { id: "meteoswiss-INT", name: "Interlaken", altitude: 588, provider: "meteoswiss.ch", latitude: 46.672086, longitude: 7.870433, distanceKm: 14.1 },
  { id: "metar-LSMM", name: "Meiringen Arpt", altitude: 570, provider: "aviationweather.gov", latitude: 46.743, longitude: 8.11, distanceKm: 14.2 },
  { id: "holfuy-680", name: "Schiltgrat", altitude: 2100, provider: "holfuy.com", latitude: 46.55708, longitude: 7.87254, distanceKm: 14.9 },
  { id: "meteoswiss-MER", name: "Meiringen", altitude: 599, provider: "meteoswiss.ch", latitude: 46.732228, longitude: 8.169248, distanceKm: 15.5 },
  { id: "holfuy-1804", name: "Höhematte", altitude: 630, provider: "holfuy.com", latitude: 46.68572, longitude: 7.85703, distanceKm: 15.6 },
  { id: "slf-SCH2", name: "Türliboden", altitude: 2332, provider: "slf.ch", latitude: 46.576916, longitude: 7.834732, distanceKm: 16.6 },
  { id: "slf-ROA2", name: "Rotschalp", altitude: 1875, provider: "slf.ch", latitude: 46.774319, longitude: 7.993941, distanceKm: 17.1 },
  { id: "slf-SCH1", name: "Schilthorn", altitude: 2996, provider: "slf.ch", latitude: 46.557313, longitude: 7.835202, distanceKm: 17.4 },
  { id: "holfuy-1850", name: "Lehn", altitude: 560, provider: "holfuy.com", latitude: 46.68084, longitude: 7.82554, distanceKm: 17.6 },
  { id: "holfuy-1957", name: "Bilitscher", altitude: 1300, provider: "holfuy.com", latitude: 46.71637, longitude: 8.2322, distanceKm: 17.8 },
  { id: "slf-SCB2", name: "Schönbüel", altitude: 1777, provider: "slf.ch", latitude: 46.779375, longitude: 8.103438, distanceKm: 17.9 },
  { id: "slf-ROA1", name: "Brienzer Rothorn", altitude: 2348, provider: "slf.ch", latitude: 46.78712, longitude: 8.046917, distanceKm: 18.1 },
  { id: "holfuy-1808", name: "Amisbühl", altitude: 1315, provider: "holfuy.com", latitude: 46.70258, longitude: 7.82217, distanceKm: 18.9 },
  { id: "holfuy-1829", name: "Hohwald", altitude: 1600, provider: "holfuy.com", latitude: 46.71347, longitude: 7.82346, distanceKm: 19.4 },
  { id: "slf-GUT1", name: "Bänzlauistock", altitude: 2528, provider: "slf.ch", latitude: 46.692522, longitude: 8.277976, distanceKm: 19.6 },
  { id: "slf-GUT2", name: "Homad", altitude: 2115, provider: "slf.ch", latitude: 46.67931, longitude: 8.289691, distanceKm: 19.9 },
  { id: "holfuy-947", name: "Planplatten", altitude: 2240, provider: "holfuy.com", latitude: 46.73623, longitude: 8.25459, distanceKm: 20.5 },
  { id: "pioupiou-1510", name: "Hüttstett", altitude: 1667, provider: "openwindmap.org", latitude: 46.787968, longitude: 8.194746, distanceKm: 21.6 },
  { id: "slf-SHE2", name: "Schibe", altitude: 1852, provider: "slf.ch", latitude: 46.748825, longitude: 7.812449, distanceKm: 22.3 },
  { id: "windline-4109", name: "Niederhorn", altitude: 1960, provider: "windline.ch", latitude: 46.711389, longitude: 7.776667, distanceKm: 22.4 },
];

export const plannedMeteoStation = {
  id: "planned-grindelwald-grund",
  name: "Grindelwald Grund",
  detail: "Landeplatz",
  altitude: 950,
  latitude: 46.6202,
  longitude: 8.0294,
  statusLabel: "Geplant",
};

const compassLabel = (degrees) => ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(degrees / 45) % 8];
const mockAverages = [12, 9, 7, 16, 11, 22, 15, 6, 8, 5, 10, 14, 7, 4, 18, 13, 25, 6, 9, 12, 20, 8, 7, 17, 15, 19, 11, 13, 21];
const mockDirections = [248, 212, 276, 281, 236, 305, 258, 198, 92, 244, 225, 270, 186, 240, 284, 210, 304, 248, 132, 204, 278, 244, 226, 290, 262, 248, 220, 238, 286];

export const meteoStations = windStationCatalog.map((station, index) => {
  const average = mockAverages[index];
  const gust = average + 5 + (index % 5);
  const direction = mockDirections[index];
  const status = average >= 22 ? "strong" : average >= 16 ? "watch" : "good";
  return {
    ...station,
    primary: index < 5,
    average,
    gust,
    direction,
    directionLabel: compassLabel(direction),
    age: `vor ${2 + (index % 8)} Min.`,
    status,
    statusLabel: status === "strong" ? "Stark" : status === "watch" ? "Beobachten" : "Ruhig",
    temperature: Math.round(18 - station.altitude / 230),
    trend: index % 3 === 0 ? "Leicht zunehmend" : index % 3 === 1 ? "Stabil" : "Leicht abnehmend",
    values: [0, 1, 2, 3].map((offset) => ({ time: `10:${String(40 - offset * 10 - (index % 3)).padStart(2, "0")}`, average: Math.max(1, average - offset + (index % 2)), gust: Math.max(3, gust - offset) })),
  };
});
export const meteoWebcams = [
  { id: "first", title: "Grindelwald-First", focus: 0.52, image: "https://backend.roundshot.com/cams/c7f0edeec13d52b6c3cf91485d982548/archiveprev", viewerUrl: "https://webcams.jungfrau.ch/first-schreckfeld/", alt: "Aktuelles Panoramabild der Webcam Grindelwald-First" },
  { id: "eigergletscher", title: "Eigergletscher", focus: 0.5, image: "https://backend.roundshot.com/cams/486d6b1c471c581a99233dc3e4cc3ab7/archiveprev", viewerUrl: "https://webcams.jungfrau.ch/eigergletscher/#/", alt: "Aktuelles Panoramabild der Webcam Eigergletscher" },
  { id: "maennlichen", title: "Männlichen", focus: 0.46, image: "https://backend.roundshot.com/cams/877919abdb23eb59f63908ab8b300f1f/archiveprev", viewerUrl: "https://maennlichen.roundshot.com/bergstation-wengen/", alt: "Aktuelles Panoramabild der Webcam Männlichen" },
  { id: "kleine-scheidegg", title: "Kleine Scheidegg", focus: 0.34, image: "https://backend.roundshot.com/cams/527f953c3776c0552355d4a154c2b4e8/archiveprev", viewerUrl: "https://webcams.jungfrau.ch/lauberhorn/#/", alt: "Aktuelles Panoramabild der Webcam Kleine Scheidegg" },
  { id: "terminal", title: "Grindelwald Terminal", focus: 0.5, image: "https://backend.roundshot.com/cams/034de41e47b30dde0362b86b42d9fb61/archiveprev", viewerUrl: "https://webcams.jungfrau.ch/grindelwald-terminal/", alt: "Aktuelles Panoramabild der Webcam Grindelwald Terminal" },
];
export const news = generatedNews.map((item) => ({ ...item, dateLabel: formatDate(item.date), image: contentAsset(item.coverImage) || images.hero, alt: item.gallery?.[0]?.alt || item.title, path: `/news/${item.slug}`, gallery: (item.gallery || []).map((image, index) => ({ ...image, src: contentAsset(image.src), alt: image.alt || `${item.title} – Bild ${index + 1}` })) }));
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
  {
    period: "1987–1991", title: "Der Matratzenboom", image: images.clubCommunity,
    stories: [
      { title: "Erster Flug First – Höhenmatte (17.03.1990)", author: "Stauffer Roland", paragraphs: [
        "Am frühen Nachmittag Start von Grindelwald-First. Via Waldspitz, Reeti, Schynige Platte nach der Höhenmatte in Interlaken. Fluggerät war ein legendärer «Trilair» von «Ailes de K». Für diesen Flug nach Interlaken war von Bucher Edi ein Preis von Fr. 200.– und einer Flasche Champagner ausgesetzt geworden. Post Roli holte sich den Preis ab und dem Vernehmen nach sei sein Kopfweh am Tag danach nicht bloss auf den langen Aufenthalt in der Höhe zurückzuführen gewesen.",
      ] },
      { title: "Blätz und das schlechte Material (1990)", author: "Blätz", paragraphs: [
        "Während Blätz's besten Akrojahren waren Stalls und Vrillen nonstop und ohne auszuleiten über 1000 oder 2000 Meter Höhendifferenz an der Tagesordnung. Blätz mal wieder an einem Abendflug. Über 1000 Meter Höhendifferenz Vrillen links, Vrillen rechts, diverse Stalls … und landet perfekt. In dem Moment, wo der Schirm auf den Boden fällt, fällt auch ein Traggurt auf den Boden! Blätz erblasst! Es ist ein Stahlkarabiner mit einem mechanischen Konstruktionsfehler, denn diese Karabiner haben an beiden Enden ein Gewinde. Wenn der Stahlkarabiner 2/10 mm gegeneinander verschoben wird, klemmt das Gewinde. So hat der Pilot beim Zudrehen das Gefühl, dass der Karabiner geschlossen ist. Der Karabiner war also gar nie richtig geschlossen und biegt sich während den Stalls und Vrillen von der Belastung auf. Der Traggurt hing noch an den Gewinderillen. So kann der Gurt nach der Landung, wenn er nicht mehr belastet wird, schön aushängen. Damals flog man noch meist ohne Rettungsschirm!!",
      ] },
      { title: "Toni Wyss Fluglehrer – hatte eine halbe Herzbaracke (1990)", author: "Blätz", paragraphs: [
        "Post-Roli, Post-Hänsel und Blätz haben sich folgenden Spass mit Wyss Toni erlaubt: «Startleiter» Blätz meldet den Flugschüler Hans beim Fluglehrer Toni, welcher die Schüler während dem Flug per Funk begleitet und am Landeplatz einweist, zum Start an. Sein Programm lautet: Stallpunkt suchen. Toni ahnt natürlich nichts vom heimtückischen Vorhaben, dass sich Post-Roli (Lokalmattador und Akropilot) als Flugschüler Hans mit Hänsels Ausrüstung ausgibt und startet. Kurz nach dem Start funkt Toni seinem Schüler und sagt: «Hänsel, we tu mi verschteischt waggele eis mit de Beinen.» Roli «waggeled» natürlich wie verrückt! Toni: «Also de chaischt afan bremsen, brems no me, bremsen, gimmu numen, bremsen, bremsen …» Roli reagiert nicht besonders. Toni: «So chom Hans, gimmu, bremsen, bremsen.» Nun zieht Post-Roli den Schirm voll in einen Fullstall. Toni bleibt ganz ruhig und sagt: «Loslassen Hans, loslassen.» Roli lässt los und leitet den Schirm aus. Aber innerhalb der nächsten drei Sekunden leitet Roli den Schirm wieder voll in den Fullstall ein. Am Funkgerät hörte man Toni nur noch schreien: «Loooooslaaan, loslan, looooslaan, Hänsel t Armen uehi, loosslan, loslan!» Während Roli bis auf 50 Meter über Boden die schönsten Vrillen und Fullstalls fliegt. Tonis Geschrei, welches man mit dem aufsteigenden Wind von Schwarzigen noch auf der First ohne Funk hört, lässt nach und es wird ruhig, als Post-Roli den Schirm ausleitet. Einige Sekunden herrscht Funkstille. Als Toni seinen «Flugschüler» im Landeanflug hat, erkennt er die roten Hosen, wie sie auch Post-Roli hat. Frage an Blätz: «Ischt das Post-Roli?» Blätz: «Äämm, dr nägscht ischt startbereit!» Toni wiederholt seine Frage. Blätz: «Ja.» Toni: «Das ischt also e Schissdräck, i han e halbi Härzbaracka käben.» Toni erholt sich auf diesen Schreck mit einem guten Schnaps von Post-Roli!!!",
      ] },
      { title: "Dauerflüge im Grindelwaldtal (1990)", author: "Stauffer Roland / Hauswirth Thomas", paragraphs: [
        "5.8.1990: Schläppi Markus verfehlte den Überflug des Eigergipfels bloss etwa um 10–15 m. Er stellte dafür mit 5 h 50 Min einen neuen Rekord im Dauerfliegen im Grindelwaldtal auf. Eine Woche später, am 12.08.1990 startete Post-Roli um 11.27 Uhr auf dem Startplatz First, mit dem Ziel, den Dauerflug von Schläppi Markus zu überbieten. Dank sehr guter Thermik erreichte Roli am Reeti eine Flughöhe von ca. 3850 m ü. M. Nach ca. 3½ Stunden über dem Firstgebiet flog er über das Schwarzhorn, mit einer Flughöhe von ca. 4000 m ü. M., und von dort aus an die Chrinnenhörner.",
        "Am Wetterhorn kämpfte sich Roli etwa 90 Minuten lang ab, bevor er den Gipfel überfliegen konnte. Den Mettenberggipfel erreichte er nach 5¾ Stunden Flugzeit. Er war sich damit gewiss, einen neuen Rekord erflogen zu haben. Sein Ziel war es aber auch, den Dauerflugrekord soweit als möglich hinauszudehnen. Während der «Wartezeit» überflog er also die Gipfel des Ankenbällis und des kleinen Schreckhorns, bevor er schliesslich via Ostegg zum damaligen Landeplatz Gletschertal gelangte. Dort landete er nach 7 h 03 Minuten überglücklich und äusserst durstig. Er wurde durch etwa 12 Gleitschirmkollegen erwartet, welche ihn beobachtet hatten und nun natürlich genau wissen wollten, wie dieser Rekordflug aus Pilotensicht verlaufen sei. Roli hatte einen Flug erlebt, welcher noch heute jeden Piloten mit Stolz erfüllen würde.",
      ] },
      { title: "Edi the Eagle Bucher und der saubere Schnitt (1989/1990)", author: "Blätz", paragraphs: [
        "Übrigens: Edi war der erste Tandempilot in Grindelwald. Als Edi zu einem weiteren Flug auf First ansetzt und Richtung Waldspitz fliegt, wird ihm die damalige Flugleistung zum Verhängnis. Er bleibt mit dem Passagier in einer Tanne hängen, natürlich zuoberst auf dem Gipfel. Nachdem er und sein Passagier heil vom Baum runtergeklettert sind, entscheidet sich der kühl und radikal kalkulierende Edi für die schnelle Variante: Der Schirm wird in der Mitte mit einem Messer getrennt, damit er ihn so besser von der Tanne runterholen kann. Ein paar Tage später ist der Schirm wieder sauber zusammengenäht und repariert. Nun kann Edi die Bäume auch wieder von oben betrachten.",
      ] },
      { title: "Schläppi Markus und der Handschuh (1988/1989)", author: "Blätz", paragraphs: [
        "Nachdem Markus sein «10 Duck» ausgelegt hat und starten will, bemerkt er, dass ein Handschuh fehlt. Er denkt sich, der wird schon wieder auftauchen, und startet in Mürren Richtung Lauterbrunnen. In der Luft stellt er fest, dass sich sein Handschuh in einer Kammer seines Schirmes versteckt hat. Das passierte beim Auslegen, da er die Handschuhe vorne in die Jacke gestossen hatte. Wer Markus kennt, weiss, dass er nicht nur ein Geradeausflieger ist. Kurzentschlossen macht er einen seiner super Wingover und schon fliegt der Handschuh vorne aus der Kammer raus. Als ob das nicht schon Kunststück genug wäre, stimmt auch das Timing perfekt: Der Handschuh fliegt direkt auf ihn zu und er fängt ihn ganz cool! Das ist Märkel und sicher nur ein einziges Mal möglich!!",
      ] },
      { title: "Blätz: Not macht erfinderisch (1987/1988)", author: "Blätz", paragraphs: [
        "Blätz Ueltsch absolviert die Lehre als Maschinenmechaniker am Eigergletscher. Natürlich fliegt er mit dem Delta vom Eigergletscher nach Hause. Im Winter wird ihm immer wieder der tiefe Schnee und der Rückenwind zum Verhängnis, so dass er nicht immer auf der flachen Piste starten kann. Da er aber auf jeden Fall einen Feierabendflug machen will, muss er sich also etwas einfallen lassen. Seine Idee ist: Mit Rückenwind muss man einen Klippenstart machen! Und eine Klippe befindet sich ja direkt neben seiner Arbeitsstätte, die Felswand Richtung Salzegg. Das Problem ist nur: Vor der Klippe hat es ein bis zwei Meter Pulverschnee auf einer Breite von drei Metern, dann kommt die Felswand. Doch er weiss sich zu helfen: Er nimmt kurzerhand einen ca. 30 cm breiten und drei Meter langen Holzladen und legt ihn auf den Pulverschnee. So kann er mit viel Konzentration und zwei, drei Schritten, mit dem 40 kg schweren Delta und Rückenwind, über diesen Laden stolpern und auch dieses Hindernis ist überwunden. Blätz gelingt so der Klippenstart und kommt doch zu seinem Feierabendflug!!",
      ] },
    ],
  },
  {
    period: "1991–1996", title: "Speedrun und Race to Goal", image: images.clubCompetition,
    stories: [
      { title: "Überflug und Notlandung am Schreckhorn (05.08.1995)", author: "Stauffer Roland / Hauswirth Thomas", paragraphs: [
        "Post Roli und Bächler René überfliegen von First aus via Strahlegghorn und Lauteraarhorn das Schreckhorn. Blätz und Joey treffen sie erst über dem Gipfel. Die beiden haben auf der Nordseite aufgedreht.",
        "Funkverkehr: Blätz: «I flyge ire Minute über z Schreckhorn.» Roli: «Ig i 15 Sekunde.» Blätz sieht Roli in dem Moment von der gegenüberliegenden Seite her über den Gipfel fliegen. «Du Schurggehund!» war in dem Moment alles, was er zur Gratulation sagen konnte.",
        "Joey, ein hervorragender Fotograf, vergass sich bei diesem seinem zweiten Hobby derart, dass er nach einem Klapper seines Schirmes nicht schnell genug reagierte und, nachdem das Tuch abzuspiralen begonnen hatte, den Notschirm ziehen musste. Unvorstellbares Glück im Unglück hatte Jochen, denn von seinem «Landeplatz» an der Ostseite des Schreckhorns konnte er unverletzt mit dem Helikopter abgeholt werden. Es grenzt an ein Wunder, dass er nach der «Landung» nicht weiter abgestürzt war.",
        "Jochen ist sich dessen bewusst und feiert seither immer am 5. August seinen zweiten Geburtstag.",
      ] },
      { title: "«Groue ir Luft» oder von der Kleinen zur Grossen Scheidegg (November 1995)", author: "Hauswirth Thomas", paragraphs: [
        "Nicht sehr rühmlich war diese Aktion im November 1994. Der Wetterbericht hatte eine Warmfront aus Westen für den Nachmittag gemeldet. Der Himmel war bereits bedeckt, als wir uns entschieden, mit dem Zug bis Eigergletscher zu fahren und von dort aus einen gemütlichen Gleitflug nach Grindelwald zu unternehmen.",
        "Gegen Mittag kamen wir auf dem Startplatz an. Es herrschte ein leichter Westwind, ideal zum Starten. Noch weit hinter dem Schilthorn waren die dunklen Regenwolken der Front bereits erkennbar, was uns aber noch nicht beunruhigte. Märkel startete als erster mit seinem Challenger C. Problemloser Start, und mit einem Jauchzer abgedreht in Richtung Grindelwald. Jörg mit seinem P40 folgte ihm nach wenigen Minuten.",
        "Nachdem Peter einen Abbruch hatte, startete auch ich. Schon nach wenigen Sekunden tönte Markus' Stimme aus dem Funk: «Flyyget ja nid aha i d's Tal, hie macht's wie ne Moora, bi grad vorhi iigschlage!!!» Also, sofort wieder zu Boden. Jörg landete unsanft bei Alpiglen, ich selber bei der Bergstation vom Fallboden-Lift.",
        "Peter war noch alleine oben beim Startplatz Eigergletscher. Er hatte kein Funkgerät und ich konnte ihn zuerst nicht sehen. Meine Landung hatte er auch nicht mitbekommen. Als ich ihn nach einem Spurt über einige hundert Meter endlich erblickte, zog er gerade den Schirm auf. Meine Zurufe konnte er nicht verstehen und drehte Richtung Grindelwald ab. «Das darf doch nicht wahr sein!!!» dachten wir uns.",
        "Jörg versuchte, ihn wenigstens bei Alpiglen zur Landung zu bewegen, aber auch das gelang nicht. Peter flog mit geringem Höhenverlust dem Eiger entlang. Sein Flug glich bereits mehr dem eines dürren Blattes im Wind als dem eines Gleitschirmes. Jetzt war der starke Wind auch bei uns oben spürbar. Der weisse Schirm wurde plötzlich nach oben gedrückt, er stieg ständig weiter, zwischendurch verlor er auch wieder ein paar hundert Meter, um gleich wieder gegen 2500 m ü. M. hochgehoben zu werden. Ins Tal hinaus kam er unmöglich mehr, gegen diesen Wind. Uns, seinen drei Zuschauern, standen die Haare zu Berge. Schliesslich konnte ihn nur noch Markus sehen und meldete über Funk, dass er ihn in der Region Grosse Scheidegg vermutlich habe zu Boden gehen sehen.",
        "Peters Odyssee brachte ihn bis östlich der Grossen Scheidegg. Zuerst habe er schon vor der Scheidegg gemeint, landen zu können. Wenige Meter über Boden sei er aber unvermittelt wieder hochgehoben und über die Scheidegg gespült worden. Dort, im Lee, habe es ihn schliesslich in den weichen Schnee gesetzt. Hier wurde er denn auch von einem Offroad-Jeepfahrer mitgenommen und unverletzt ins Tal zurückgebracht.",
        "Gleichzeitig sass übrigens Blätz, Peters Fluglehrer, in einem Jet, der ihn aus den Ferien zurück nach Zürich-Kloten brachte. Wegen des starken Windes habe das Linienflugzeug aber erst nach einigen Warteschleifen die Landeerlaubnis erhalten.",
        "Peter hatte grosses Glück gehabt und wir anderen ein schlechtes Gewissen, weil wir die Front unterschätzt hatten. Die Lehre daraus haben wir jedenfalls bestimmt gezogen: «Lieber eis groue am Bode, als eis groue ir Luft!»",
      ] },
      { title: "Clubausflug nach Verbier (17.–18.9.1994)", author: "Bohren Roland", paragraphs: [
        "Dichter Nebel und leichter Schneefall empfing uns in Verbier. Genau so, wie es uns das halbe Dutzend umfassende Pessimisten vorausgesagt hatten, als sie sich für den Ausflug abmeldeten. Uns übriggebliebenen fünf Stück konnte jedoch das miese Wetter den Appetit nach der zweieinhalbstündigen Autofahrt nicht nehmen. Unter kundiger Führung von Post-Roli fanden wir Zuflucht in Philippe Bernards (alias Super Max) Restaurant Les Grottes. Nach dem feinen Wild durften wir als Dessert die Abenteuer des Super Max anschauen und natürlich kommentieren. Nachdem uns dann Roli anhand eines Grappaglases das Profil des Trilairs erklärte, hatte Petrus ein Einsehen mit uns. Die Nebeldecke und auch die Stimmung hoben sich unseren Vorstellungen entsprechend.",
        "Nach der kurzen Fahrt auf Les Ruinettes konnte der erste Neuschneestart gemacht werden. Die Verhältnisse waren ruhig, so dass uns nach ca. zwanzig Minuten die Landung in Le Chable keine Probleme bereitete. Claude Ammann, ein weiterer Gleitschirmpionier, bot uns die Möglichkeit an, günstig in einem Clubhaus oder in einem Hotel zu nächtigen. Aufgrund des anstrengenden Tages und evtl. Abends gaben wir dem Hotel den Vorzug. Fast den ganzen Samstagabend verbrachten wir dann wieder bei Philippe, der uns einiges über und um das Fliegen in Verbier erzählen konnte.",
        "Die Frühaufsteher wurden am Sonntagmorgen von der strahlenden Sonne begrüsst. Nach dem Morgenessen sah man jedoch nicht mehr so viel von ihr, da sich schon die ersten Cumuli auf ca. 2000 m gebildet hatten! Mit dem Schulbus von Claude Ammann wurden wir bis an den Anschlag nach oben transportiert. Wegen dem Schnee und der besonderen Terrassenlage von Verbier bildeten sich die Wolken nicht an den Hängen, sondern direkt über dem Dorf. So ergab es sich, dass wir oberhalb der Basis starteten. Unter den Wolken angekommen, las ich bis zu 5 m/s Steigen ab. Trotzdem war es so ruhig, dass ich das Vario für die Daheimgebliebenen fotografieren konnte.",
        "Beim zweiten Flug stieg man sogar noch schneller, aber anscheinend bot dieser Ausflug schon so viel, dass z. T. die Hammerthermik nicht mehr ausgenutzt wurde. Das Tüpfli auf dem i war, dass wir, ausser den Flugschülern, die einzigen Flieger in Verbier waren. Schon einmal erlebt?",
        "Auf der Rückfahrt gab es noch Kaffee und Kuchen bei Alice, die damit ihren Teil zum guten Gelingen des Ausfluges beitrug und uns Gelegenheit gab, das erste Mal zuhause von Verbier zu schwärmen. Der Ausflug war, wie er sein sollte: gemütlich, interessant und mit guten Flügen. Besten Dank an Roli Stauffer für die Organisation und Ursi Kaufmann, Ernst Wüthrich und Thomas Rauthaar für die Teilnahme.",
      ] },
      { title: "Stiefel für den Meister", author: "Hauswirth Thomas", paragraphs: [
        "Bohren Ueli, bekannt als Blätz, befand sich in seinen besten Wettkampfjahren. Er hatte gerade wieder eine Medaille nach Hause gebracht und im «Espresso» wurden die neuesten Geschichten ausgetauscht. Dabei fiel Burgener Jürg auf, dass Blätzes Stiefel in einem erbärmlichen Zustand waren. Die vordere Hälfte der Sohle hing herunter und die ursprüngliche Farbe des Leders war nur noch zu erahnen.",
        "Kurzerhand wurde dem amtierenden Schweizermeister ein Stiefel abgenommen und damit eine Sammlung bei den zahlreichen Gästen durchgeführt. «Gewinnt Medaillen, kann sich aber nicht mal ordentliche Schuhe leisten.» Das entlockte jedem, wenn nicht gerade Tränen, so doch mindestens ein oder zwei Franken. Mit dem gesammelten Geld hat sich die ganze Gleitschirmbande zwei, drei Stiefel gekauft – in der Gepsi, aus Glas, voll Bier!!!",
      ] },
      { title: "Übernachtung «on Ice» (1993)", author: "Stauffer Roland / Hauswirth Thomas", paragraphs: [
        "Der Flug von der Glecksteinhütte war zu jener Zeit noch beliebter als heute, wohl auch der noch leichteren Rucksäcke wegen. Fast jede Woche, jeweils donnerstags, versammelten sich einige Piloten, um abends in die Hütte zu marschieren und nach einem kurzen Halt von dort aus mit ihren farbigen Tüchern zurückzusegeln. Dabei wurden manchmal regelrechte Wettrennen gelaufen. So soll Gerber Wali für den Weg vom oberen Lauchbühl zur Hütte bloss eine knappe Stunde benötigt haben und seine Kollegen sollen jeweils nur wenige Minuten nach ihm angekommen sein!",
        "Am 9.9.1993 haben sich Post-Roli, Mathyer Franz und Bächler René wiederum aufgemacht, von der Glecksteinhütte zu starten. Obwohl der Nebel schon unterhalb der Hütte hing, marschierten die drei bis ans Ziel. Nach einer kleinen Stärkung begab man sich wieder auf den Rückweg. Der Nebel hing bis 100 m unter die Hütte, also oberhalb des oberen Schönbühl. Man ging davon aus, dass sich die Verhältnisse nicht gross ändern würden, und entschloss sich, unterhalb des Nebels zu starten.",
        "Bei schönstem Aufwind startete Roli als erster und Bächler René folgte ihm mit wenigen Metern Abstand. Die über den Männlichen herannahende Front konnten die Piloten nicht erkennen. Kaum gestartet, sank die Nebeldecke im gleichen Tempo wie die Flieger mit ihren Schirmen. Beide Piloten flogen über den Gletscher, um dem drückenden Nebel zu entkommen und in der Talmitte Höhe abzubauen. Dadurch genügte aber der Gleitwinkel nicht mehr, um über die Gletscherzunge hinauszufliegen. Roli landete unmittelbar beim «Milchbachloch», zu welchem damals noch eine Leiter führte, auf dem Gletscher. Über Funk warnte er Franz, welcher beim Schönbühl noch nicht gestartet war. Aber wo war René? Er hatte sonst eigentlich immer ein Funkgerät dabei, aber genau an diesem Abend nicht. Wegen dem Nebel musste auch er eine Gletscherlandung durchführen, lediglich 300 m von Roli entfernt, hatte aber weder geeignete Ausrüstung noch Kontakt zu den Kollegen.",
        "Nach einiger Zeit lichtete sich der Nebel kurz, weil es in Strömen zu regnen begann. Roli querte den Gletscher und gelangte über die Leiter zum Gleckstein-Hüttenweg. Dort traf er auf Franz, der nicht mehr gestartet war und zu Fuss abstieg. Während Rolis Gletscherquerung ging René auf dem Eis etwas weiter talwärts. Die hereinbrechende Nacht holte ihn aber ein und er entschied sich, ein Biwak aufzuschlagen. Dies ist eine einfache Angelegenheit, wenn man mit einem Gleitschirm ausgerüstet ist. Darin eingerollt überstand René die Nacht recht gut isoliert und erreichte am nächsten Morgen die Zivilisation unbeschadet.",
        "Gar manchmal musste er sich in der Folge wegen seiner Übernachtung auf dem Gletscher «anzünden» lassen. Tatsächlich erlebte er wohl die ruhigere Nacht als seine Kollegen, welche bis zum Morgen an allen zugänglichen Orten um den oberen Gletscher herum suchten, schrien und keine Antwort erhielten. Die möglichen Landeplätze wurden abgesucht, nirgends ein Zeichen vom Vermissten.",
        "Ein Heli war bereits zum frühmorgendlichen Suchflug gestartet, als die erlösende Nachricht kam, dass René wieder heil angekommen sei. Im Morgengrauen hatte er erkennen können, dass er nur unweit des Milchbachlochs übernachtet hatte.",
      ] },
      { title: "Wettkampfteam «Jungfrau Parapente» (1991)", author: "Blätz", paragraphs: [
        "Schläppi Markus, Bohren Ueli «Blätz», Dubach Urs und Kaufmann Daniel «Bisi»: Mit verbissenem Ehrgeiz kommt man nur manchmal zum Ziel. Unser Motto war immer: Du hast erst verloren, wenn du am Boden stehst! Das haben Markus und Blätz sehr wörtlich genommen.",
        "In Feltre, Italien, haben sich unter anderen auch Blätz und Schläppi versenkt. Als sie noch 50 Meter über Boden waren, haben sie nicht etwa noch einen sicheren Landeplatz angepeilt, nein, man versucht Thermik zu fliegen, bis man am Boden steht. So versuchten sie es sogar noch an einem 50 Meter hohen Rebberg und kamen schon bald zuunterst an, wo nirgends mehr ein Quadratmeter Landefläche war. Sie fanden nur noch Eisenstangen von den Rebbergen, dichten Wald und eine Hauptstrasse im Wald. Die beiden gaben die Hoffnung aber nicht auf. Leider hat sich der Kampf nicht ausbezahlt und beide, Blätz und Schläppi, waren immer tiefer.",
        "Nun war klar, eine normale Landung war nicht mehr möglich. Blätz entschied sich für die Reben, flog einen halben Meter über die Stangen und stallte den Schirm zwischen den Stangen runter, damit er nicht von den Stangen aufgespiesst wurde. Märkel, der noch ein paar Meter höher war, hat zugeschaut und dachte «nein» und versuchte sein Glück auf der Hauptstrasse bei dichtem Verkehr. Er flog zwischen den Bäumen der Strasse entlang, zappelte wie verrückt, als er gegen die entgegenkommenden Autos flog, so dass die Autofahrer die anbahnende Notlandung möglichst sehen und bremsen.",
        "Die beiden Landungen verliefen ohne Kratzer.",
      ] },
    ],
  },
  {
    period: "1997–1999", title: "Gleitschirmstadion Grindelwald", image: images.clubXAlps,
    stories: [
      { title: "Nachlese zur Club-SM in Balsthal (1999)", author: "Bohren Roland", paragraphs: [
        "Intro: Nachfolgenden Bericht schrieb ich kurz nach der SM, habe ihn dann aber nur zum privaten Gebrauch verwendet. Fehler und Copyright sind daher vorbehalten.",
        "Blätz ist die neuen Schirme am Dienstag in Deutschland holen gegangen und wir haben dann alle (Dubi, Alex, Joy und ich) nach einer Art Sternfahrt am Mittwoch in Interlaken «trainiert». Wir mit den Neuen machten am Morgen einen Einstellungsflug und Alex chauffierte uns. Am Nachmittag konnten wir uns tatsächlich oben halten. Fazit: Wetter schlecht, Schirme gut.",
        "Am Freitag war dann erster Wettkampftag in Balsthal. Der Startplatz war auf dem Grat. Riesig, sanft und flach! Die Teamleitung liess sich vom Jüngsten überzeugen, dass wir alle miteinander starten sollten (es war ein Speedrun, also individuelle Zeitmessung). 08/15-Team-Piloten hatten zwar andere Ansichten, aber gegen eine solche geballte Ladung Kapazitäten zogen sie ihre Argumente zurück.",
        "Joy und ich waren kurz vor Martin Scheel in der Schlange parat, die zwei anderen «lümmelten» noch herum, der Erstgestartete hatte schon den halben Task geflogen und es sah doch schon ziemlich düster aus, als wir Alex fragten, ob wir zwei nicht doch starten sollten. Dieser ging zu Dubi und kam mit der Antwort zurück, es komme noch eine gute Periode (er hatte Dubi nicht gesagt, dass wir starten wollten). Die beste Periode, die noch kam, war eine mit nicht so starkem Rückenwind! An das Erfüllen des Tasks war nicht mehr zu denken.",
        "Joy startete vorwärts, korrigierte und beschleunigte, bis die Kappe mit der Eintrittskante wirklich sehr sauber in den Boden stach! Quer über den Startplatz verlief ein Zaun. Alle nahmen an, dass nur die «Stüdli» stehen und der Draht am Boden liegt. Dem war erst nach Joys Startversuch so. Danke Joy. Er gab noch einmal alles und kam in die Luft. Die restlichen DCJT-UP-Piloten kamen auch in die Luft, flogen mit z. T. wenigen Zentimetern über die ein Mahnmal (Pilot mit Schirm) enthaltenden Bäume hinweg und halfen damit, die Siegerpunktzahl zu verkleinern. Alex konnte nichts dazu beitragen, seine gute Periode kam in Form eines Autos.",
        "Martin Scheel gewann diesen Lauf, wir hatten ihm auch freundlich Platz gemacht. Als Einziger erreichte ich den Landeplatz. Super! Dubi war nicht sehr glücklich über unsere Leistung (10. von 27). Joy und ich nicht über unsere Cracks und Alex versucht sich vielleicht einmal im Lotto, dann wird er sehen, dass es bei maximal drei Haupttreffern (drei Piloten pro Team werden gewertet) pro Durchgang keinen Sinn macht, viermal dieselben Zahlen aufzuschreiben.",
        "Alex ging nach Hause und wir übernachteten in Bern. Am Samstag ging es dann besser. Dubi streifte jedoch trotz guten Bedingungen die Bäume am Startplatz. Wir flogen in zeitweise ausgezeichneter Position mit, bis Dubi und ich mit einer Reihe anderer am selben Ort runtergespült wurden. Alex und Joy soffen direkt nach dem Start ab. Wir waren in diesem Lauf auch nur Neunte, aber mit nur 244 anstatt 792 Punkten Rückstand auf das Siegerteam. Kari Eisenhut gewann den Lauf und mit ihm kam nur noch einer ins Ziel.",
        "Weil gleichzeitig die Delta-SM in Balsthal war und dort ein Clubmitglied von Balsthal tödlich verunglückte, wurden die Schweizermeisterschaften am Samstagnachmittag abgebrochen. Dies bedeutet für uns den neunten Schlussrang und den Hohn im Interlakner «Club-Blettli», welches sehr schnell im Umlauf war. Daher sowie durch die ausgeprägte Beziehung zwischen unserer Nachwuchshoffnung und der Redaktorin stellt sich jetzt die Frage, ob das «Blettli» nicht schon vor der SM gedruckt wurde?",
      ] },
      { title: "Erster Mönch-Überflug von First aus (10.08.1998)", author: "Stauffer Roland / Hauswirth Thomas", paragraphs: [
        "Es war wiederum ein Rekordtag, an welchem sich Post Roli aufmachte, weitere Gipfel zu überfliegen. Von First aus gelangte er via Tschuggen und Westflanke über den Eigergipfel, von dort aus an den Nollen am Mönch. Dort ging es weiter hoch bis auf 4300 m ü. M., was für den ersten bekannten Überflug des Mönchgipfels von einem tiefen Startplatz aus locker reichte. Auf dem Rückweg sah Roli das Ewigschneefeld und das Wetterhorn ebenfalls von oben.",
      ] },
    ],
  },
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
