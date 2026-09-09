# Positioning webcam, wind and panorama-link markers

All eight Meteo webcams have one camera-icon marker in each of the 13 flight-area panoramas. The marker opens that webcam's official viewer. Wind markers use a wind icon and retain their existing station destinations.

Positions are independent for each panorama, stored in `src/panorama-webcams.json` under scene ID and camera ID. `yaw` is the horizontal angle in degrees (-180 to 180); `pitch` is the vertical angle (-90 to 90, positive upwards). These are image angles, not GPS coordinates. Do not copy coordinates between panoramas: each image has a different viewpoint and orientation.

## Current placement accuracy

Previously available visual anchors were retained. Every previously missing camera gets an explicitly provisional position near the panorama's opening view. These new positions are convenient initial placements, **not geographic camera locations**; in particular, a webcam from the Grindelwald area need not be visible from a Lauterbrunnen panorama. All current entries are marked `provisional: true` until visually reviewed. The public links work before placement review; they must not be interpreted as surveyed locations.

## Tune a position locally

1. Open the local flight-area page and choose the panorama to adjust.
2. Click **Markerposition** at the lower left of the image. This tool only appears in the local development server, including fullscreen; it is excluded from the production build.
3. Select a marker from **Webcams**, **Wind**, or **Andere Panoramen**, then drag/zoom the panorama until its intended location is clear. Wind and panorama-link choices are limited to the markers present in this scene.
4. Click **Position im Bild wählen**, then click the precise point on the image. A red cross marks the selected spot. This selection suppresses the normal webcam-link click.
5. Copy the generated JSON from the text box. The picker shows the destination file. Webcam entries go in `src/panorama-webcams.json`. Wind and panorama-link entries go in `src/panorama-marker-overrides.json`, under the displayed scene ID and the generated `wind` or `panoramas` group. Merge the selected entry into any existing group; do not replace its other entries. The tool reads coordinates; it does not save files or publish automatically.
6. Save the file. The development preview reloads the marker positions. Verify the icon from several zoom levels and avoid collisions with scene links or other markers.
7. Repeat independently for each scene, then commit and publish through a pull request.

For example, under `airtime-west`, replace its `baeregg` entry with the exact `yaw` and `pitch` produced by the picker. Keep `provisional: true` if the location is still an estimate; set it to false only after visual review. To have the assistant apply an adjustment, send the panorama name, webcam name and the copied coordinates.

The coordinate picker does not change or download webcam imagery. Webcam URLs and credit remain in `meteoWebcams` in `src/data.js`.

## Wind and panorama-link overrides

The overrides file starts empty, preserving all existing positions. Within a scene, `wind` entries are keyed by station ID (for example `fanet-BA-4`) and `panoramas` entries by the destination scene (for example `grund`). Only yaw/pitch are applied. A moved wind marker still opens Meteo; a moved panorama link still opens the same panorama. Moving a panorama link does not move a nearby wind marker, and editing one scene does not affect another. Remove an override to return to the original calculated position.

Changing the selected marker clears the old coordinate readout and preview, preventing accidental reuse of another marker's point.
