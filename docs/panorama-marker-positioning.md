# Positioning webcam, wind and panorama-link markers

## Save directly on localhost

Open **Markerposition**, choose a marker, click **Position im Bild wählen**, click its location, then **Position speichern**. The development server updates the corresponding JSON entry and refreshes the markers in place. The selected panorama, viewing angle, zoom and picker state stay unchanged, including the selected marker and coordinate readout. Other entries are preserved. The change is local only: review and commit/publish separately. **Koordinaten kopieren** remains available if you prefer to paste the coordinates into chat.

The picker is omitted from production builds and is only shown on localhost / 127.0.0.1 / ::1 in development. Its save endpoint exists only in the Vite development server, checks same-origin loopback access, validates IDs and angles, and cannot accept arbitrary file paths.

Grund/Terminal and Bodmi/Kirchbühl now combine temporarily when their projected locations are close enough in the current view. Zooming in separates them again. They keep independent saved positions, and opening the picker separates them for editing. Other distinct locations are not automatically combined.

## Grouped locations

Matching panorama, wind and webcam actions now share one marker, retaining separate clickable icons. Location matching is explicit in `src/panorama-locations.js`, not based on screen proximity. First and Männlichen combine all three when available; Grund and Stechelberg combine their panorama and wind actions. Other cameras stay separate.

The group follows its panorama-link coordinates. Without a panorama link it follows the wind position, otherwise the webcam position. The picker shows only this controlling entry: select the panorama under **Andere Panoramen** to move its whole group. Existing member coordinates are preserved but do not affect a grouped marker. This supersedes the independent-position instructions below for grouped actions.

All eight Meteo webcams have one camera-icon marker in each of the 13 flight-area panoramas. The marker opens that webcam's official viewer. Wind markers use a wind icon and retain their existing station destinations.

Positions are independent for each panorama, stored in `src/panorama-webcams.json` under scene ID and camera ID. `yaw` is the horizontal angle in degrees (-180 to 180); `pitch` is the vertical angle (-90 to 90, positive upwards). These are image angles, not GPS coordinates. Do not copy coordinates between panoramas: each image has a different viewpoint and orientation.

## Current placement accuracy

Previously available visual anchors were retained. Every previously missing camera gets an explicitly provisional position near the panorama's opening view. These new positions are convenient initial placements, **not geographic camera locations**; in particular, a webcam from the Grindelwald area need not be visible from a Lauterbrunnen panorama. All current entries are marked `provisional: true` until visually reviewed. The public links work before placement review; they must not be interpreted as surveyed locations.

## Tune a position locally

1. Open the local flight-area page and choose the panorama to adjust.
2. Click **Markerposition** at the lower left of the image. This tool only appears in the local development server, including fullscreen; it is excluded from the production build.
3. Select a marker from **Webcams**, **Wind**, or **Andere Panoramen**, then drag/zoom the panorama until its intended location is clear. Wind and panorama-link choices are limited to the markers present in this scene.
4. Click **Position im Bild wählen**, then click the precise point on the image. A red cross marks the selected spot. This selection suppresses the normal webcam-link click.
5. Click **Position speichern**. The picker updates the selected entry in `src/panorama-webcams.json` or `src/panorama-marker-overrides.json`, preserving other entries. It does not commit or publish. Alternatively, expand **Koordinaten kopieren** to paste the JSON into chat or edit the indicated file manually.
6. The development preview reloads the marker positions. Verify the icon from several zoom levels and avoid collisions with unrelated markers.
7. Repeat independently for each scene, then commit and publish through a pull request.

For example, under `airtime-west`, replace its `baeregg` entry with the exact `yaw` and `pitch` produced by the picker. Keep `provisional: true` if the location is still an estimate; set it to false only after visual review. To have the assistant apply an adjustment, send the panorama name, webcam name and the copied coordinates.

The coordinate picker does not change or download webcam imagery. Webcam URLs and credit remain in `meteoWebcams` in `src/data.js`.

## Wind and panorama-link overrides

The overrides file starts empty, preserving all existing positions. Within a scene, `wind` entries are keyed by station ID (for example `fanet-BA-4`) and `panoramas` entries by the destination scene (for example `grund`). Only yaw/pitch are applied. A moved wind marker still opens Meteo; a moved panorama link still opens the same panorama. Grouped actions follow their controlling position; unrelated markers and other scenes are unaffected. Remove an override to return to the original calculated position.

Changing the selected marker clears the old coordinate readout and preview, preventing accidental reuse of another marker's point.
