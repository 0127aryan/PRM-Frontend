/** @param {string} value */
export function toDateOnly(value) {
  return String(value).slice(0, 10);
}

/**
 * @param {string} fromDate
 * @param {string} toDate
 * @param {string} existingFrom
 * @param {string} existingTo
 */
export function allocationRangesOverlap(
  fromDate,
  toDate,
  existingFrom,
  existingTo,
) {
  const from = toDateOnly(fromDate);
  const to = toDateOnly(toDate);
  const existingFromDay = toDateOnly(existingFrom);
  const existingToDay = toDateOnly(existingTo);
  return existingFromDay <= to && from <= existingToDay;
}

/**
 * @param {Array<{ utilizationPct: number, fromDate: string, toDate: string, isActive?: boolean }>} allocations
 * @param {string} fromDate
 * @param {string} toDate
 */
export function remainingUtilizationPct(allocations, fromDate, toDate) {
  const active = (allocations ?? []).filter((a) => a.isActive !== false);
  if (!fromDate || !toDate) {
    return 100;
  }
  const used = active
    .filter((a) =>
      allocationRangesOverlap(fromDate, toDate, a.fromDate, a.toDate),
    )
    .reduce((total, a) => total + Number(a.utilizationPct), 0);
  return Math.max(0, 100 - used);
}

/** @param {string} isoDate YYYY-MM-DD */
export function formatAllocationDate(isoDate) {
  if (!isoDate) return '—';
  const [y, m, d] = toDateOnly(isoDate).split('-');
  return `${d}-${m}-${y}`;
}
