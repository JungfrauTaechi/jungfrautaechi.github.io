// Explicit location identities: visual proximity alone does not imply a shared site.
const windLocations = { 'windline-4104': 'first', 'slf-MAN1': 'maennlichen', 'fanet-BA-4': 'grund', 'holfuy-1989': 'stechelberg' };

export const nearbyLocationPairs = [['grund', 'terminal'], ['bodmi', 'kirchbuehl']];

export function visibleLocationGroups(groups) {
  return groups.map(group => ({ ...group, link: group.link?.hidden ? null : group.link, markers: group.markers.filter(marker => !marker.hidden) })).filter(group => group.link || group.markers.length);
}

export function projectLocation(point, view) {
  const rad = Math.PI / 180;
  const pitch = point.pitch * rad, cameraPitch = view.pitch * rad, yaw = (point.yaw - view.yaw) * rad;
  const depth = Math.sin(pitch) * Math.sin(cameraPitch) + Math.cos(pitch) * Math.cos(yaw) * Math.cos(cameraPitch);
  if (depth <= 0) return null;
  const scale = view.width / (2 * Math.tan(view.hfov * rad / 2));
  return { x: view.width / 2 + scale * Math.cos(pitch) * Math.sin(yaw) / depth, y: view.height / 2 - scale * (Math.sin(pitch) * Math.cos(cameraPitch) - Math.cos(pitch) * Math.cos(yaw) * Math.sin(cameraPitch)) / depth };
}

export function shouldCombineLocations(first, second, view, combined = false, width = 200) {
  const a = projectLocation(first, view), b = projectLocation(second, view);
  if (!a || !b || [a, b].some(p => p.x < 0 || p.x > view.width || p.y < 0 || p.y > view.height)) return false;
  // Hysteresis prevents flickering as a pair crosses the merge boundary.
  return Math.abs(a.x - b.x) < width / 2 + 34 + (combined ? 30 : 0) && Math.abs(a.y - b.y) < (combined ? 65 : 45);
}

export function watchNearbyLocations(groups, elements, viewer, container, isEditing) {
  const pairs = nearbyLocationPairs.map(([primary, secondary]) => ({ primary: groups.find(g => g.locationId === primary), secondary: groups.find(g => g.locationId === secondary), combined: false })).filter(pair => pair.primary && pair.secondary);
  let frame;
  const update = () => {
    const view = { yaw: viewer.getYaw(), pitch: viewer.getPitch(), hfov: viewer.getHfov(), width: container.clientWidth, height: container.clientHeight };
    for (const pair of pairs) {
      pair.a = elements.get(pair.primary.locationId);
      pair.b = elements.get(pair.secondary.locationId);
      if (!pair.a || !pair.b) continue;
      if (pair.a.contains(document.activeElement) || pair.b.contains(document.activeElement)) continue;
      if (!pair.combined) pair.width = pair.a.offsetWidth;
      const combine = !isEditing() && shouldCombineLocations(pair.primary, pair.secondary, view, pair.combined, pair.width);
      if (combine === pair.combined) continue;
      if (combine) {
        pair.children = [...pair.b.children];
        pair.a.append(...pair.children);
      } else pair.b.append(...pair.children);
      pair.b.classList.toggle('is-combined', combine);
      pair.combined = combine;
    }
    frame = requestAnimationFrame(update);
  };
  frame = requestAnimationFrame(update);
  return () => cancelAnimationFrame(frame);
}

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
