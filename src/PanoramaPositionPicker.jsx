import { useState } from "react";

export function PanoramaPositionPicker({ site, cameras, point, selecting, onSelect }) {
  const [open, setOpen] = useState(false);
  const [cameraId, setCameraId] = useState(cameras[0].id);
  const snippet = point ? JSON.stringify({ [cameraId]: point }, null, 2) : "";
  return <div className="pano-marker-editor" onPointerDown={(event) => event.stopPropagation()}>
    <button type="button" aria-expanded={open} onClick={() => { setOpen(!open); onSelect(false); }}>Markerposition</button>
    {open && <div><strong>Lokale Positionierung · {site.label}</strong><label>Webcam <select value={cameraId} onChange={(event) => setCameraId(event.target.value)}>{cameras.map((camera) => <option key={camera.id} value={camera.id}>{camera.title}</option>)}</select></label><button type="button" aria-pressed={selecting} onClick={() => onSelect(!selecting)}>{selecting ? "Abbrechen" : "Position im Bild wählen"}</button><p>{selecting ? "Klicke auf den Standort im Panorama." : "Panorama ausrichten, dann einen Punkt wählen."}</p>{point && <><p>Unter <code>{site.id}</code> in <code>src/panorama-webcams.json</code> eintragen:</p><textarea aria-label="Markerkoordinaten zum Kopieren" readOnly value={snippet} rows={6} onFocus={(event) => event.target.select()} /></>}</div>}
  </div>;
}
