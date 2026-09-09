# Panorama recovery, September 2026

All 13 scenes were recovered from the club’s current Panotour source at https://jungfrau-taechi.ch/sites/dcjt360_bootstrapdata/ before retirement of the old host. Original scene IDs and viewing limits are recorded in `public/assets/panoramas/multires-manifest.json`.

The local viewer uses 512-pixel JPEG tiles, quality 78, at progressively higher resolutions. Full cube-face resolutions range from 4096 to 8192 pixels; Waldspitz and Männlichen are both 6656 pixels. Only visible tiles for the selected scene are loaded. Existing small cube faces remain available for previews and source imagery.

Krpano vertical bounds use a downward-positive convention. Pannellum uses upward-positive pitch, so `minPitch = -vlookatmax` and `maxPitch = -vlookatmin`. `avoidShowingBackground` also constrains the field of view to the available vertical span. Original landmarks, cross-links and polygons are unchanged.

Rebuild with `python scripts/recover-panorama-resolution.py --xml <saved-tour.xml>`. Requires Pillow and requests. The download cache stays outside the published asset tree. The script validates source tile dimensions and writes completion markers per face and output quality. The automated test checks every required output tile in every scene and resolution level.
