import React, { useMemo, useState } from "react";
import { Moon, CalendarDays, Trash2 } from "lucide-react";
import Section from "../components/Section.jsx";
import { todayKey, addDays } from "../lib/dates.js";
import { normalizedPeriods, periodDuration, averageCycleLength, periodStatus } from "../lib/periods.js";

export default function CyclePage({ periodData, savePeriodData }) {
  const key = todayKey();
  const [startDate, setStartDate] = useState(key);
  const [endDate, setEndDate] = useState("");
  const periods = useMemo(() => normalizedPeriods(periodData), [periodData]);
  const avgCycle = useMemo(() => averageCycleLength(periods), [periods]);
  const status = useMemo(() => periodStatus(periods, key), [periods, key]);
  const latest = periods[periods.length - 1];
  const active = latest && !latest.endDate ? latest : null;

  const savePeriods = (next) => savePeriodData({ periods: next });
  const logStart = () => {
    if (!startDate || active || periods.some((period) => period.startDate === startDate)) return;
    savePeriods([...periods, { startDate, endDate: null }]);
    setStartDate(key);
  };
  const logEnd = () => {
    if (!active || !endDate || endDate < active.startDate) return;
    updateEndDate(active.startDate, endDate); setEndDate("");
  };
  const updateEndDate = (start, value) => savePeriods(periods.map((period) => period.startDate === start ? { ...period, endDate: value || null } : period));
  const removePeriod = (start) => savePeriods(periods.filter((period) => period.startDate !== start));

  return (
    <>
      <Section title={active ? "End period" : "Start period"} icon={<Moon size={18} className="text-rose" />}>
        {active ? <>
          <p className="text-sm opacity-60 mb-4">Your period started on {active.startDate}. Log its end date when it finishes.</p>
          <label className="text-xs font-medium flex flex-col gap-1"><span>End date</span>
            <input type="date" value={endDate} min={active.startDate} max={key} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-1/2 px-3 py-1.5 rounded-lg text-sm border border-line bg-paper" />
          </label>
          <button onClick={logEnd} disabled={!endDate || endDate < active.startDate} className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-medium bg-rose text-card disabled:opacity-50 mt-4">Log end date</button>
        </> : <>
          <p className="text-sm opacity-60 mb-4">Log the first day of your period. You can add its end date later.</p>
          <label className="text-xs font-medium flex flex-col gap-1"><span>Start date</span>
            <input type="date" value={startDate} max={key} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-1/2 px-3 py-1.5 rounded-lg text-sm border border-line bg-paper" />
          </label>
          <button onClick={logStart} disabled={!startDate || periods.some((period) => period.startDate === startDate)} className="w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-medium bg-rose text-card disabled:opacity-50 mt-4">
            {periods.some((period) => period.startDate === startDate) ? "Already logged" : "Log start date"}
          </button>
        </>}
        {latest && (
          <div className="bg-rose-soft rounded-xl p-3 mt-3 text-sm space-y-1">
            <p>{status?.active ? `Day ${status.day} of period` : `Day ${status?.day || 1} of cycle`}</p>
            <p>Average cycle length: <strong>{avgCycle} days</strong></p>
            {latest.endDate && <p>Last period duration: <strong>{periodDuration(latest)} days</strong></p>}
            {!status?.active && <p>Next predicted start: <strong>{addDays(latest.startDate, avgCycle)}</strong></p>}
          </div>
        )}
      </Section>
      <Section title="History" icon={<CalendarDays size={18} className="text-pine" />}>
        {periods.length === 0 && <p className="text-sm opacity-60">No entries yet.</p>}
        <div className="flex flex-col gap-3">
          {[...periods].reverse().map((period) => (
            <div key={period.startDate} className="flex items-center gap-2 text-sm">
              <div className="flex-1"><p className="font-mono">{period.startDate} {period.endDate ? `– ${period.endDate}` : "– active"}</p><p className="text-xs opacity-60">{periodDuration(period) ? `${periodDuration(period)} days` : "End date not logged"}</p></div>
              <input aria-label={`End date for ${period.startDate}`} type="date" value={period.endDate || ""} min={period.startDate} max={key} onChange={(e) => updateEndDate(period.startDate, e.target.value)} className="px-2 py-1 rounded-md text-xs border border-line bg-paper" />
              <button onClick={() => removePeriod(period.startDate)}><Trash2 size={14} className="text-rose" /></button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
