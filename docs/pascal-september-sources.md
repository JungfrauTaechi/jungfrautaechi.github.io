# September follow-up: external sources and scope

Checked 12 September 2026. Wind feed behavior, cache, history and station roster are explicitly outside this implementation.

## Windline API investigation (read-only)

**A working JSON endpoint exists, but a supported third-party API contract was not found.**

- Windline's [official integration guide](https://www.windline.ch/support-faq/windline-in-eigene-webseite-einbinden/) documents embedding its HTML station page. Its example is First, station `4104`.
- The [First station page](https://m.windline.ch/meteodata.php?stationID=4104&nohome) publicly loads `sensorAjaxData.php` with `stationID=4104` through jQuery AJAX, requesting JSON.
- One read-only GET to `https://m.windline.ch/sensorAjaxData.php?stationID=4104` returned HTTP 200, `text/json;charset=UTF-8` and `Access-Control-Allow-Origin: *`.
- Observed fields include `windspeed1`, `windpeak1`, `winddir1`, `windpeakdir1`, `temp1`, `hum1`, `stationID`, `stationName`, `status` and `timestamp`. The page converts speed values from m/s to km/h by multiplying by 3.6. The timestamp is Unix milliseconds. Measurements are strings and absent fields can be `"-"`.
- This response contains a current observation, not a documented historical series. No conclusion about relative freshness was drawn from this single request.
- The homepage, FAQ, integration guide and focused official-domain API/Schnittstelle searches did not reveal published third-party API terms, rate limits, authentication requirements or a stability guarantee. CORS availability does not establish permission or a support commitment.

Recommendation for a future integration: ask Windline whether this endpoint is approved for club/shared-service use, what limits and attribution apply, and whether historical readings are available. No message was sent, and no Windline adapter, polling or datasource switch was implemented.

## Safety and First graphic

- [Official SHV Grindelwald LS-R6 document](https://www.shv-fsvl.ch/fileadmin/files/redakteure/Allgemein/Sicherheit/Luftraum/Fluggebiet_Grindelwald.pdf), updated 21 July 2023 and retrieved in this review: the local 2250 m exception is conditional on active LS-R6, south of the marked SwissGrid 169000 boundary. The exception does not apply to temporary LS-R13 during the Axalp event. The current DABS remains the source for activations.
- `public/assets/flight-area/startfirst.jpg`: Pascal's original attachment in his 10 September 07:26 inputs email. Inspected visually; supplied markings and owner credit are preserved. It identifies a prohibition on paragliding starts east of the path, not a general no-fly airspace.

## Forecasts and SHV

- [Profiwetter source](https://profiwetter.ch/showdiagram.php?show=wind_foehn_ch&lang=de) currently serves `https://profiwetter.ch/wind_foehn_ch_de.png`. The [embedding instructions](https://www.profiwetter.ch/info.html) require the credit retained in the component: “Bildquelle: Profiwetter.ch, Deutscher Wetterdienst”.
- [MeteoSwiss precipitation animation](https://www.meteoschweiz.admin.ch/service-und-publikationen/applikationen/niederschlag.html) is linked from its official radar-network page. Integrated as a direct radar action, not an unsupported frame or copied image.
- [SHV FAQ](https://www.shv-fsvl.ch/mitgliederservice/app/faq/) describes the native-app service and says a complementary web solution is being examined. No supported public weather embedding/API contract was found. Existing documented app product links remain; no membership-only data is copied.

## Webcam sources

The existing gallery now includes the eight requested additional views. New cameras appear in Meteo; the existing eight panorama camera positions are preserved. Roundshot images are loaded directly at `/medium` and never downloaded, proxied or enlarged beyond the source height. Feratel links directly to the full original viewer: its published preview URL returned HTTP 200 with text/html, so it is not used as an image.

| Camera | Official viewer | Public image ID |
| --- | --- | --- |
| Mittellegihütte | https://grindelwald.roundshot.com/mittellegihuette/ | 1314 |
| Faulhorn | https://faulhorn.roundshot.com/ | 1571 |
| Pfingstegg | https://pfingstegg.roundshot.com/ | 416 |
| Eiger Express mast 4 | https://webcams.jungfrau.ch/top-of-europe-eiger-express/ | 1064 |
| Bussalp | https://grindelwaldbus.roundshot.com/ | 10 |
| Schynige Platte | https://jungfrau.roundshot.com/schynige-platte/ | 771 |
| Harder Kulm | https://jungfrau.roundshot.com/interlaken-harderkulm/ | 740 |
| First / Feratel | https://www.feratel.com/en/webcams/switzerland/bern/grindelwald-first | 4235 |

Roundshot IDs were read from each provider page's `og:image` metadata. The Pfingstegg operator links its viewer from https://www.pfingstegg.ch/webcam; Jungfraubahnen links Eiger Express from https://www.jungfrau.ch/de-ch/live/webcams/eiger-express/. The previous Kleine Scheidegg camera already pointed to Lauberhorn: only its display name and alt text changed.

## First panorama annotation

Alain clarified on 12 September that the restriction lies east of the path, uphill from the wooden tower toward the First cable-car station. He subsequently confirmed that the panorama camera position cannot show this area. The attempted overlay and focus button were therefore removed. The original top-down graphic and notice remain on the First and safety pages; other panorama areas and marker positions are unchanged.