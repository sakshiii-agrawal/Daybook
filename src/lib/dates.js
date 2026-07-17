export const todayKey = (d = new Date()) => {
  const dt = new Date(d);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 10);
};

export const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return todayKey(d);
};

export const daysBetween = (a, b) => {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.round((d2 - d1) / 86400000);
};

export const dayOfYear = (d = new Date()) => {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d - start;
  return Math.floor(diff / 86400000);
};

export const addMonths = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + n);
  return todayKey(d);
};

// Last calendar day of the month containing dateStr
export const lastDayOfMonth = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return todayKey(end);
};

// Last occurrence of a given weekday (0=Sun..6=Sat) in the month containing dateStr
export const lastWeekdayOfMonth = (dateStr, weekday) => {
  const d = new Date(dateStr + "T00:00:00");
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  const diff = (end.getDay() - weekday + 7) % 7;
  end.setDate(end.getDate() - diff);
  return todayKey(end);
};

// Nearest date on or after dateStr that falls on the given weekday (0=Sun..6=Sat)
export const nextWeekdayOnOrAfter = (dateStr, weekday) => {
  const d = new Date(dateStr + "T00:00:00");
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff);
  return todayKey(d);
};

export const WEEKDAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// The 7 date keys (Mon..Sun) of the week containing d
export const weekDates = (d = new Date()) => {
  const start = new Date(d);
  start.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(start);
    dd.setDate(start.getDate() + i);
    dates.push(todayKey(dd));
  }
  return dates;
};
