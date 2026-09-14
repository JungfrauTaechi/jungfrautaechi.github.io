# MeteoSwiss rain radar

The Meteo page displays the past two hours of measured precipitation intensity (RZC, mm/h), with five-minute frames, a slider, play/pause and an Aktuell button. It is a native rendering of open data, not the MeteoSwiss website widget or a forecast.

Sources verified on 14 September 2026:

- Product documentation: https://opendatadocs.meteoswiss.ch/d-radar-data/d1-precipitation-radar-products
- STAC collection: https://data.geo.admin.ch/api/stac/v1/collections/ch.meteoschweiz.ogd-radar-precip
- Map service documentation: https://docs.geo.admin.ch/visualize-data/wms.html
- HDF5 browser reader: https://github.com/usnistgov/h5wasm (0.10.3)
- Coordinate conversion: https://github.com/proj4js/proj4js (2.19.10)

The MeteoSwiss website sends SAMEORIGIN framing restrictions. We fetch credential-free public STAC daily items and only allow RZC HDF5 assets from the official data.geo.admin.ch collection path. Today's and, near midnight, yesterday's inventory are combined. Future, older-than-two-hour and duplicate observations are excluded.

The lazy-loaded Web Worker decodes one file at a time with h5wasm. It verifies the HDF observation timestamp, RATE quantity, dimensions and Swiss 1 km ODIM grid, and crops to LV95 bounds 2480000,1060000,2840000,1320000. The swisstopo grey map uses exactly those EPSG:2056 bounds. Dry pixels are transparent; missing coverage is hatched. Colours and intensity legend are supplied by our UI. The visible credit reads Quelle: MeteoSchweiz · Karte: swisstopo.

At most 25 decoded frames are cached in memory. Slider requests are coalesced. Inventory refresh occurs every five minutes only when the panel is near the viewport and the document is visible. Playback stops when the panel or tab is hidden. Network/body deadlines, worker deadlines, a file-size limit and a manual retry bound failures; old images retain their actual timestamps. Measurements over 15 minutes old show a warning. Wind feed caching and polling are unaffected.

Verification covers inventory selection, UTC midnight rollover, ODIM projection and crop orientation, missing coverage, gain/offset and mismatched timestamps. Browser verification uses real public files and the production worker bundle, plus mobile layouts and keyboard slider controls.
