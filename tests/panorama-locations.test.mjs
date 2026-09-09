import test from 'node:test';
import assert from 'node:assert/strict';
import { groupPanoramaMarkers, shouldCombineLocations, projectLocation } from '../src/panorama-locations.js';

test('groups preserve actions and panorama position without merging unrelated nearby cameras', () => {
  const link = { targetId: 'maennlichen', yaw: 10, pitch: 20 };
  const wind = { kind: 'meteo', station: { id: 'slf-MAN1' }, yaw: 11, pitch: 21 };
  const camera = { kind: 'webcam', camera: { id: 'maennlichen' }, yaw: 12, pitch: 22 };
  const other = { kind: 'webcam', camera: { id: 'terminal' }, yaw: 10, pitch: 20 };
  const groups = groupPanoramaMarkers([link], [wind, camera, other, wind]);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups[0].markers, [wind, camera]);
  assert.equal(groups[0].yaw, 10);
  assert.equal(groups[0].link, link);
  assert.deepEqual(groups[1].markers, [other]);
  assert.equal(camera.yaw, 12);
});

test('wind and webcam group without a panorama link', () => {
  const markers = [{ kind: 'meteo', station: { id: 'windline-4104' }, yaw: 3, pitch: 4 }, { kind: 'webcam', camera: { id: 'first' }, yaw: 5, pitch: 6 }];
  const groups = groupPanoramaMarkers([], markers);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].markers.length, 2);
  assert.equal(groups[0].yaw, 3);
});

test('nearby pairs merge at wide zoom and separate at close zoom without joining points behind the viewer', () => {
  const view = { yaw: 0, pitch: 0, hfov: 110, width: 1000, height: 500 };
  const a = { yaw: 0, pitch: 0 }, b = { yaw: 15, pitch: 0 };
  assert.equal(shouldCombineLocations(a, b, view), true);
  assert.equal(shouldCombineLocations(a, b, { ...view, hfov: 45 }), false);
  assert.equal(shouldCombineLocations(a, { yaw: 180, pitch: 0 }, view), false);
  assert.equal(shouldCombineLocations(a, { yaw: 0, pitch: 30 }, view), false);
  assert.equal(shouldCombineLocations(a, { yaw: 22, pitch: 0 }, view), false);
  assert.equal(shouldCombineLocations(a, { yaw: 22, pitch: 0 }, view, true), true);
  assert.ok(Math.abs(projectLocation({ yaw: -179, pitch: 0 }, { ...view, yaw: 179 }).x - 500) < 20);
});
