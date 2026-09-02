import { writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const tourUrl = "https://jungfrau-taechi.ch/sites/dcjt360_bootstrapdata/dcjt360_bootstrap.xml";
const messagesUrl = "https://jungfrau-taechi.ch/sites/dcjt360_bootstrapdata/dcjt360_bootstrap_messages_en.xml";
const sceneIds = {
  pano1777: "first",
  pano20804: "waldspitz",
  pano20789: "maennlichen",
  pano20989: "muerren",
  pano20642: "grund",
  pano20641: "bodmi",
  pano20344: "stechelberg",
  pano20643: "lauterbrunnen",
  pano6666: "airtime-west",
  pano11658: "airtime-ost",
  pano12421: "airtime-winter",
  pano21159: "airtime-max",
  pano20982: "airtime-stechelberg",
};

const [tourResponse, messagesResponse] = await Promise.all([tourUrl, messagesUrl].map((url) => fetch(url, { headers: { "User-Agent": "Jungfrau-Taechi-Migration/1.0" } })));
if (!tourResponse.ok) throw new Error(`${tourResponse.status} ${tourResponse.statusText}: ${tourUrl}`);
if (!messagesResponse.ok) throw new Error(`${messagesResponse.status} ${messagesResponse.statusText}: ${messagesUrl}`);
const $ = load(await tourResponse.text(), { xmlMode: true });
const $messages = load(await messagesResponse.text(), { xmlMode: true });
const messages = new Map();
$messages("data").each((_, element) => messages.set($messages(element).attr("name"), $messages(element).text().replace(/\s+/g, " ").trim()));
const links = Object.fromEntries(Object.values(sceneIds).map((id) => [id, []]));
const landmarks = Object.fromEntries(Object.values(sceneIds).map((id) => [id, []]));
const areas = Object.fromEntries(Object.values(sceneIds).map((id) => [id, []]));

$("scene").each((_, sceneElement) => {
  const scene = $(sceneElement);
  const sourceId = sceneIds[scene.attr("name")];
  if (!sourceId) return;
  const actions = new Map();
  scene.children("action").each((__, actionElement) => {
    const action = $(actionElement);
    actions.set(action.attr("name"), action.text());
  });
  const seen = new Set();
  scene.children("hotspot").each((__, hotspotElement) => {
    const hotspot = $(hotspotElement);
    const name = hotspot.attr("name");
    const yaw = Number(hotspot.attr("ath"));
    const pitch = -Number(hotspot.attr("atv"));
    const tooltipKey = hotspot.attr("tooltip");
    const label = messages.get(`en_${tooltipKey}`) || "";
    const vertices = hotspot.children("point").map((___, pointElement) => ({ yaw: Number($(pointElement).attr("ath")), pitch: -Number($(pointElement).attr("atv")) })).get().filter((point) => Number.isFinite(point.yaw) && Number.isFinite(point.pitch));
    if (vertices.length >= 3 && !areas[sourceId].some((area) => area.id === name)) {
      const lowerLabel = label.toLowerCase();
      const kind = lowerLabel.includes("falt") ? "folding" : lowerLabel.includes("achtung") ? "danger" : lowerLabel.includes("startplatz") || lowerLabel === "startplatz" ? "start" : "landing";
      areas[sourceId].push({ id: name, label, kind, vertices });
      return;
    }
    const action = actions.get(hotspot.attr("onclick")) || "";
    const targetLegacyId = action.match(/mainloadscene\((pano\d+)\)/)?.[1];
    const targetId = sceneIds[targetLegacyId];
    if (!Number.isFinite(yaw) || !Number.isFinite(pitch)) return;
    if (!targetId || targetId === sourceId) {
      if (label && !landmarks[sourceId].some((landmark) => landmark.id === name)) landmarks[sourceId].push({ id: name, label, yaw, pitch });
      return;
    }
    const key = `${targetId}:${yaw}:${pitch}`;
    if (seen.has(key)) return;
    seen.add(key);
    links[sourceId].push({ targetId, yaw, pitch });
  });
});

const output = `// Generated from the maintained Jungfrau-Tächi panorama tour.\nexport const panoramaLinks = ${JSON.stringify(links, null, 2)};\nexport const panoramaLandmarks = ${JSON.stringify(landmarks, null, 2)};\nexport const panoramaAreas = ${JSON.stringify(areas, null, 2)};\n`;
await writeFile(path.resolve("src/panorama-links.js"), output, "utf8");
process.stdout.write(`Imported ${Object.values(links).flat().length} links, ${Object.values(landmarks).flat().length} landmarks, and ${Object.values(areas).flat().length} marked areas.\n`);
