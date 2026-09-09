import { useState } from "react";

export function PanoramaPositionPicker({ site, markers, point, selecting, onSelect, onReset }) {
  const [open, setOpen] = useState(false);
  const [markerKey, setMarkerKey] = useState(markers[0].key);
  const selected = markers.find((marker) => marker.key === markerKey) || markers[0];
  const snippet = point ? JSON.stringify(selected.section ? { [selected.section]: { [selected.id]: point } } : { [selected.id]: point }, null, 2) : "";
  return <div className="pano-marker-editor" onPointerDown={(event) => event.stopPropagation()}>
    <button type="button" aria-expanded={open} onClick={() => { setOpen(!open); onSelect(false); }}>Markerposition</button>
    {open && <div><strong>Lokale Positionierung · {site.label}</strong><label>Marker <select value={selected.key} onChange={(event) => { setMarkerKey(event.target.value); onReset(); }}>{["Webcams", "Wind", "Andere Panoramen"].map((group) => <optgroup key={group} label={group}>{markers.filter((marker) => marker.group === group).map((marker) => <option key={marker.key} value={marker.key}>{marker.label}</option>)}</optgroup>)}</select></label><button type="button" aria-pressed={selecting} onClick={() => onSelect(!selecting)}>{selecting ? "Abbrechen" : "Position im Bild wählen"}</button><p>{selecting ? "Klicke auf den Standort im Panorama." : "Panorama ausrichten, dann einen Punkt wählen."}</p>{point && <><p>Unter <code>{site.id}</code> in <code>{selected.file}</code> eintragen (bestehende Einträge beibehalten):</p><textarea aria-label="Markerkoordinaten zum Kopieren" readOnly value={snippet} rows={8} onFocus={(event) => event.target.select()} /></>}</div>}
  </div>;
}
