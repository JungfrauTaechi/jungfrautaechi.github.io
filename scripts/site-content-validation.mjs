const text = value => typeof value === 'string' && value.trim().length > 0;
const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function validateSiteContent({ programme, portrait, purposes }) {
  const errors = [];
  if (!Array.isArray(programme)) errors.push('programme.json: eine Liste von Terminen ist erforderlich');
  else programme.forEach((event, index) => {
    const label = `programme.json: Termin ${index + 1}`;
    if (!event || !validDate(event.startDate)) errors.push(`${label}: startDate muss ein gültiges Datum (JJJJ-MM-TT) sein`);
    if (event?.endDate && (!validDate(event.endDate) || event.endDate < event.startDate)) errors.push(`${label}: endDate muss am oder nach startDate liegen`);
    for (const key of ['date', 'title', 'text']) if (!text(event?.[key])) errors.push(`${label}: ${key} fehlt`);
    if (event?.path && (typeof event.path !== 'string' || !/^\/(?!\/)[a-z0-9/-]+$/.test(event.path) || event.path.includes('..'))) errors.push(`${label}: path muss ein interner Seitenpfad sein`);
  });
  if (!Array.isArray(portrait) || !portrait.length || !portrait.every(text)) errors.push('portrait.json: mindestens ein nicht leerer Textabsatz ist erforderlich');
  if (!Array.isArray(purposes) || !purposes.length || !purposes.every(item => item && ['number', 'title', 'text'].every(key => text(item[key])))) errors.push('purposes.json: jeder Eintrag benötigt number, title und text');
  return errors;
}
