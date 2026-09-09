import { useState } from "react";

export function PanoramaPositionPicker({ site, markers, point, selecting, onSelect, onReset, onOpenChange }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [markerKey, setMarkerKey] = useState(markers[0].key);
  const selected = markers.find((marker) => marker.key === markerKey) || markers[0];
  const snippet = point ? JSON.stringify(selected.section ? { [selected.section]: { [selected.id]: point } } : { [selected.id]: point }, null, 2) : "";
  const save = async (change) => {
    setSaving(true);
    setStatus('');
    try {
      const response = await fetch('/__local/marker-position', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sceneId: site.id, kind: selected.section || 'webcam', id: selected.id, ...change }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setStatus('Lokal gespeichert. Noch nicht veröffentlicht.');
      if (change.hidden !== undefined) onReset();
    } catch (error) { setStatus(error.message || 'Speichern fehlgeschlagen. Koordinaten können kopiert werden.'); }
    finally { setSaving(false); }
  };
  return <div className="pano-marker-editor" onPointerDown={(event) => event.stopPropagation()}>
    <button type="button" disabled={saving} aria-expanded={open} onClick={() => { setOpen(!open); onOpenChange(!open); onSelect(false); }}>Markerposition</button>
    {open && <div>
      <strong>Lokale Positionierung · {site.label}</strong>
      <label>Marker <select disabled={saving} value={selected.key} onChange={(event) => { setMarkerKey(event.target.value); setStatus(''); onReset(); }}>{["Webcams", "Wind", "Andere Panoramen"].map((group) => <optgroup key={group} label={group}>{markers.filter((marker) => marker.group === group).map((marker) => <option key={marker.key} value={marker.key}>{marker.label}{marker.hidden ? ' · ausgeblendet' : ''}</option>)}</optgroup>)}</select></label>
      <button type="button" disabled={saving} onClick={() => save({ hidden: !selected.hidden })}>{selected.hidden ? 'Einblenden' : 'Ausblenden'}</button>
      <p>Gilt nur für diesen Marker in diesem Panorama. Andere Symbole am selben Standort bleiben sichtbar.</p>
      <button type="button" disabled={saving || !selected.canPosition} aria-pressed={selecting} onClick={() => { setStatus(''); onSelect(!selecting); }}>{selecting ? "Abbrechen" : "Position im Bild wählen"}</button>
      {!selected.canPosition && <p>Die Position dieses Symbols folgt dem zugehörigen Standortmarker.</p>}
      <p>{selecting ? "Klicke auf den Standort im Panorama." : "Panorama ausrichten, dann einen Punkt wählen."}</p>
      <p>Grund/Terminal und Bodmi/Kirchbühl bleiben beim Bearbeiten getrennt.</p>
      {point && <><button type="button" disabled={saving || selecting || !selected.canPosition} onClick={() => save({ position: point })}>{saving ? 'Speichert …' : 'Position speichern'}</button><details><summary>Koordinaten kopieren</summary><p>Unter <code>{site.id}</code> in <code>{selected.file}</code>:</p><textarea aria-label="Markerkoordinaten zum Kopieren" readOnly value={snippet} rows={8} onFocus={(event) => event.target.select()} /></details></>}
      <p role="status">{status}</p>
    </div>}
  </div>;
}
