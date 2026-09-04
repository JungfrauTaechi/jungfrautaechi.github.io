const datePattern = /^(\d{4}-\d{2}-\d{2})(?:T.*)?$/;

export const normalizeContentDate = (value) => {
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? "" : value.toISOString().slice(0, 10);
  return datePattern.exec(String(value || ""))?.[1] || "";
};

export const formatContentDate = (value) => {
  const date = normalizeContentDate(value);
  if (!date || date === "1970-01-01") return "Archiv";
  const parsed = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(parsed.valueOf())
    ? "Archiv"
    : new Intl.DateTimeFormat("de-CH", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(parsed);
};
