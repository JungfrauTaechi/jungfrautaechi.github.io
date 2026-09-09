export function applyMarkerPosition(marker, position) {
  if (!position || !Number.isFinite(position.yaw) || !Number.isFinite(position.pitch) || Math.abs(position.yaw) > 180 || Math.abs(position.pitch) > 90) return marker;
  return { ...marker, yaw: position.yaw, pitch: position.pitch };
}
