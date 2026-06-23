/** Monday-based week helpers (YYYY-MM-DD, UTC calendar dates). */

/** @param {string} weekStart */
export function weekEndFromStart(weekStart) {
  const d = new Date(`${weekStart}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}

/** @param {string} dateStr */
export function mondayOnOrBefore(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

/** @param {number} count @param {Date} [throughDate] */
export function recentMondayWeekStarts(count, throughDate = new Date()) {
  const today = throughDate.toISOString().slice(0, 10);
  let monday = mondayOnOrBefore(today);
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(monday);
    const d = new Date(`${monday}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 7);
    monday = d.toISOString().slice(0, 10);
  }
  return results;
}

/** @param {string} weekStart @param {string} weekEnd */
export function formatWeekRangeLabel(weekStart, weekEnd) {
  const start = new Date(`${weekStart}T00:00:00Z`);
  const end = new Date(`${weekEnd}T00:00:00Z`);
  const opts = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  const a = start.toLocaleDateString(undefined, opts);
  const b = end.toLocaleDateString(undefined, {
    ...opts,
    year: start.getUTCFullYear() !== end.getUTCFullYear() ? 'numeric' : undefined,
  });
  return `${a} – ${b}`;
}
