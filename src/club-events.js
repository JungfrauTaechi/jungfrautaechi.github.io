export function swissToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function upcomingEvents(events, today = swissToday()) {
  return events.filter((event) => (event.endDate || event.startDate) >= today)
    .toSorted((a, b) => a.startDate.localeCompare(b.startDate));
}
