import React, { useMemo } from "react";
import { Moon, CalendarDays, Trash2 } from "lucide-react";
import Section from "../components/Section.jsx";
import { todayKey, addDays, daysBetween } from "../lib/dates.js";

export default function CyclePage({ periodData, savePeriodData }) {
  const key = todayKey();
  const sortedLogs = useMemo(
    () => [...periodData.logs].sort((a, b) => (a < b ? -1 : 1)),
    [periodData.logs]
  );
  const avgCycle = useMemo(() => {
    if (sortedLogs.length < 2) return 28;
    let total = 0;
    for (let i = 1; i < sortedLogs.length; i++) total += daysBetween(sortedLogs[i - 1], sortedLogs[i]);
    return Math.round(total / (sortedLogs.length - 1));
  }, [sortedLogs]);
  const lastPeriod = sortedLogs.length ? sortedLogs[sortedLogs.length - 1] : null;
  const nextPredicted = lastPeriod ? addDays(lastPeriod, avgCycle) : null;

  const logToday = () => {
    if (periodData.logs.includes(key)) return;
    savePeriodData({ logs: [...periodData.logs, key] });
  };
  const removeLog = (d) => {
    savePeriodData({ logs: periodData.logs.filter((x) => x !== d) });
  };

  return (
    <>
      <Section title="Log period" icon={<Moon size={18} className="text-rose" />}>
        <button
          onClick={logToday}
          disabled={periodData.logs.includes(key)}
          className="w-full py-2 rounded-lg text-sm font-medium bg-rose text-card disabled:opacity-50"
        >
          {periodData.logs.includes(key) ? "Already logged for today" : "Log period start — today"}
        </button>
        {lastPeriod && (
          <div className="bg-rose-soft rounded-xl p-3 mt-3 text-sm">
            <p>Last start: <strong>{lastPeriod}</strong></p>
            <p>Average cycle length: <strong>{avgCycle} days</strong> (from {sortedLogs.length} logged cycle{sortedLogs.length === 1 ? "" : "s"})</p>
            {nextPredicted && <p>Next predicted start: <strong>{nextPredicted}</strong></p>}
          </div>
        )}
      </Section>
      <Section title="History" icon={<CalendarDays size={18} className="text-pine" />}>
        {sortedLogs.length === 0 && <p className="text-sm opacity-60">No entries yet.</p>}
        <div className="flex flex-col gap-2">
          {[...sortedLogs].reverse().map((d) => (
            <div key={d} className="flex items-center justify-between text-sm">
              <span className="font-mono">{d}</span>
              <button onClick={() => removeLog(d)}>
                <Trash2 size={14} className="text-rose" />
              </button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
