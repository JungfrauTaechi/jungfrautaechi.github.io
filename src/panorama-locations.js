// Explicit location identities: visual proximity alone does not imply a shared site.
const windLocations = { 'windline-4104': 'first', 'slf-MAN1': 'maennlichen', 'fanet-BA-4': 'grund', 'holfuy-1989': 'stechelberg' };

export function groupPanoramaMarkers(links, markers) {
  const groups = new Map();
  for (const link of links) groups.set(link.targetId, { ...link, locationId: link.targetId, link, markers: [] });
  for (const marker of markers) {
    const locationId = marker.kind === 'webcam' ? marker.camera.id : windLocations[marker.station.id] || marker.station.id;
    if (!groups.has(locationId)) groups.set(locationId, { ...marker, locationId, markers: [] });
    const group = groups.get(locationId);
    if (!group.markers.some(item => item.kind === marker.kind && (item.camera?.id || item.station?.id) === (marker.camera?.id || marker.station?.id))) group.markers.push(marker);
  }
  return [...groups.values()];
}
