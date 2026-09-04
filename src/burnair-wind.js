const COMPASS_LABELS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

const numericValue = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

export function parseBurnairWindPayload(payload, stationId) {
  const responseStationId = payload?.data
    ? Object.keys(payload.data).find((key) => key.toLowerCase() === stationId.toLowerCase())
    : null;
  const stationRows = responseStationId ? payload.data[responseStationId] : null;

  if (!payload || !Array.isArray(payload.dict) || !Array.isArray(stationRows)) {
    throw new Error("Ungültige burnair-Antwort");
  }

  const fieldIndex = Object.fromEntries(payload.dict.map((field, index) => [field, index]));
  for (const requiredField of ["epoch", "wDir", "wAvg", "wMax"]) {
    if (!Number.isInteger(fieldIndex[requiredField])) throw new Error(`burnair-Feld fehlt: ${requiredField}`);
  }

  return stationRows
    .map((row) => {
      if (!Array.isArray(row)) return null;
      const epoch = numericValue(row[fieldIndex.epoch]);
      if (!epoch || epoch <= 0) return null;
      const direction = numericValue(row[fieldIndex.wDir]);
      const average = numericValue(row[fieldIndex.wAvg]);
      const gust = numericValue(row[fieldIndex.wMax]);
      const temperature = Number.isInteger(fieldIndex.temp) ? numericValue(row[fieldIndex.temp]) : null;
      return {
        epoch,
        direction,
        directionLabel: direction === null ? "–" : COMPASS_LABELS[Math.round(direction / 22.5) % COMPASS_LABELS.length],
        average,
        gust,
        temperature,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.epoch - left.epoch);
}

export function isBurnairReadingStale(reading, now = Date.now(), staleAfterMs = 10 * 60 * 1000) {
  return !reading || now - reading.epoch * 1000 > staleAfterMs;
}
