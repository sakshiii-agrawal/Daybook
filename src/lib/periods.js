import { addDays, daysBetween, todayKey } from "./dates.js";

// Supports old data where a period was stored as a start-date string.
export function normalizedPeriods(periodData) {
  return (periodData.periods || periodData.logs || [])
    .map((period) => typeof period === "string" ? { startDate: period, endDate: null } : period)
    .filter((period) => period?.startDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function periodDuration(period) {
  return period.endDate ? daysBetween(period.startDate, period.endDate) + 1 : null;
}

export function averageCycleLength(periods) {
  if (periods.length < 2) return 28;
  const total = periods.slice(1).reduce((sum, period, index) => sum + daysBetween(periods[index].startDate, period.startDate), 0);
  return Math.round(total / (periods.length - 1));
}

export function activePeriod(periods, date = todayKey()) {
  const latest = periods[periods.length - 1];
  if (!latest || latest.startDate > date || (latest.endDate && latest.endDate < date)) return null;
  return latest;
}

export function periodStatus(periods, date = todayKey()) {
  const active = activePeriod(periods, date);
  if (active) return { active: true, day: daysBetween(active.startDate, date) + 1, period: active };
  const latest = periods[periods.length - 1];
  if (!latest) return null;
  const base = latest.startDate;
  return { active: false, day: daysBetween(base, date) + 1, nextStart: addDays(base, averageCycleLength(periods)) };
}
