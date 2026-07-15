import React, { useMemo } from "react";
import { BookMarked, Sparkles, Droplets, Footprints, ListChecks, Moon, Home as HomeIcon, ChevronRight } from "lucide-react";
import Section from "../components/Section.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { contentOfTheDay } from "../lib/content.js";
import { getGoals } from "../lib/health.js";
import { todayKey, addDays, daysBetween } from "../lib/dates.js";

export default function HomePage({ profile, homecare, periodData, dailyLog, setTab, displayName }) {
  const { word, fact } = useMemo(() => contentOfTheDay(), []);
  const goals = useMemo(() => getGoals(profile), [profile]);
  const key = todayKey();

  const sortedLogs = useMemo(() => [...periodData.logs].sort((a, b) => (a < b ? -1 : 1)), [periodData.logs]);
  const lastPeriod = sortedLogs.length ? sortedLogs[sortedLogs.length - 1] : null;
  const avgCycle = useMemo(() => {
    if (sortedLogs.length < 2) return 28;
    let total = 0;
    for (let i = 1; i < sortedLogs.length; i++) total += daysBetween(sortedLogs[i - 1], sortedLogs[i]);
    return Math.round(total / (sortedLogs.length - 1));
  }, [sortedLogs]);
  const daysToNext = lastPeriod ? daysBetween(key, addDays(lastPeriod, avgCycle)) : null;

  const homecareStatus = (item) => {
    if (!item.lastDone) return { overdue: true, days: null };
    const due = addDays(item.lastDone, item.freqDays);
    const d = daysBetween(key, due);
    return { overdue: d < 0, days: d };
  };
  const nextDue = Object.values(homecare)
    .map((item) => ({ ...item, status: homecareStatus(item) }))
    .sort((a, b) => (a.status.days ?? -999) - (b.status.days ?? -999))[0];

  const tasksLeft = dailyLog.tasks.filter((t) => !t.done).length;

  const time = new Date().getHours();
  const greeting = time < 12 ? "Good morning" : time < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <h2 className="font-display text-2xl font-bold text-pine-deep mb-1">
        {greeting}, {displayName}
      </h2>
      <p className="text-sm opacity-60 mb-5">
        {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
      </p>

      <Section title="Word of the day" icon={<BookMarked size={18} className="text-pine" />}>
        <p className="font-display text-xl font-semibold text-pine-deep">{word.word}</p>
        <p className="text-sm opacity-75 mt-1">{word.meaning}</p>
      </Section>

      <Section title="Fact of the day" icon={<Sparkles size={18} className="text-gold" />}>
        <p className="text-sm">{fact}</p>
      </Section>

      <Section title="Today at a glance" icon={<HomeIcon size={18} className="text-pine" />}>
        <div className="flex flex-col gap-4">
          <button onClick={() => setTab("water")} className="flex items-center gap-3 text-left">
            <Droplets size={18} className="text-pine shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Water</span>
                <span className="font-mono opacity-70">{dailyLog.water}/{goals.waterGoalMl}ml</span>
              </div>
              <ProgressBar value={dailyLog.water} max={goals.waterGoalMl} />
            </div>
            <ChevronRight size={16} className="opacity-40" />
          </button>

          <button onClick={() => setTab("move")} className="flex items-center gap-3 text-left">
            <Footprints size={18} className="text-gold shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Steps</span>
                <span className="font-mono opacity-70">{dailyLog.steps}/{goals.stepGoal}</span>
              </div>
              <ProgressBar value={dailyLog.steps} max={goals.stepGoal} colorClass="bg-gold" />
            </div>
            <ChevronRight size={16} className="opacity-40" />
          </button>

          <button onClick={() => setTab("tasks")} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-3"><ListChecks size={18} className="text-pine" /> Tasks</span>
            <span className="flex items-center gap-1 opacity-70">{tasksLeft} left <ChevronRight size={16} className="opacity-40" /></span>
          </button>

          <button onClick={() => setTab("cycle")} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-3"><Moon size={18} className="text-rose" /> Cycle</span>
            <span className="flex items-center gap-1 opacity-70">
              {daysToNext == null ? "Not logged" : daysToNext >= 0 ? `${daysToNext}d to next` : `${Math.abs(daysToNext)}d late`}
              <ChevronRight size={16} className="opacity-40" />
            </span>
          </button>

          {nextDue && (
            <button onClick={() => setTab("homecare")} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-3"><HomeIcon size={18} className="text-pine" /> {nextDue.label}</span>
              <span className={`flex items-center gap-1 ${nextDue.status.overdue ? "text-rose" : "opacity-70"}`}>
                {nextDue.status.days == null ? "Not logged" : nextDue.status.overdue ? `Overdue ${Math.abs(nextDue.status.days)}d` : `${nextDue.status.days}d left`}
                <ChevronRight size={16} className="opacity-40" />
              </span>
            </button>
          )}
        </div>
      </Section>
    </>
  );
}
