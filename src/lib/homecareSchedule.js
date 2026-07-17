import {
  addDays, addMonths, daysBetween, lastDayOfMonth, lastWeekdayOfMonth,
  nextWeekdayOnOrAfter, todayKey,
} from "./dates.js";

// Three schedule types:
// - "interval": every N days since last done (exact day doesn't matter)
// - "weekday": every week on a specific weekday, regardless of last-done date
// - "monthAnchor": every N months, anchored to either the last calendar day
//    of the month, or the last occurrence of a weekday in the month

export function nextDueDate(item) {
  const today = todayKey();
  const base = item.lastDone || today;

  if (item.scheduleType === "weekday") {
    const searchFrom = item.lastDone ? addDays(item.lastDone, 1) : today;
    return nextWeekdayOnOrAfter(searchFrom, item.weekday);
  }

  if (item.scheduleType === "monthAnchor") {
    const anchorFor = (dateStr) =>
      item.anchorType === "lastWeekday"
        ? lastWeekdayOfMonth(dateStr, item.weekday)
        : lastDayOfMonth(dateStr);

    let cursor = base;
    let anchor = anchorFor(cursor);
    if (item.lastDone) {
      while (anchor <= item.lastDone) {
        cursor = addMonths(cursor, item.everyNMonths || 1);
        anchor = anchorFor(cursor);
      }
    }
    return anchor;
  }

  // default: interval
  return item.lastDone ? addDays(item.lastDone, item.freqDays || 7) : today;
}

export function statusOf(item) {
  const today = todayKey();
  if (!item.lastDone && item.scheduleType === "interval") {
    return { overdue: true, text: "Not logged yet" };
  }
  const due = nextDueDate(item);
  const d = daysBetween(today, due);
  if (d < 0) return { overdue: true, text: `Overdue by ${Math.abs(d)}d`, due };
  if (d === 0) return { overdue: false, text: "Due today", due };
  return { overdue: false, text: `${d}d left`, due };
}

export function scheduleSummary(item) {
  if (item.scheduleType === "weekday") {
    return `Every ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][item.weekday]}`;
  }
  if (item.scheduleType === "monthAnchor") {
    const freq = item.everyNMonths === 1 ? "month" : `${item.everyNMonths} months`;
    const anchor = item.anchorType === "lastWeekday"
      ? `last ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][item.weekday]}`
      : "last day";
    return `Every ${freq}, ${anchor}`;
  }
  return `Every ${item.freqDays} days`;
}
