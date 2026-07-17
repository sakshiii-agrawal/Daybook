import React, { useMemo, useState } from "react";
import { Droplets, Plus, Bell } from "lucide-react";
import Section from "../components/Section.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { getGoals } from "../lib/health.js";
import { enableWaterReminders, waterRemindersEnabled } from "../lib/notifications.js";

// Simple pace model: expects even progress toward the goal between 8am and 10pm.
function expectedByNow(goalMl) {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const start = 8, end = 22;
  const pct = Math.min(1, Math.max(0, (hour - start) / (end - start)));
  return Math.round(pct * goalMl);
}

export default function WaterPage({ profile, dailyLog, saveDailyLog }) {
  const goals = useMemo(() => getGoals(profile), [profile]);
  const expected = useMemo(() => expectedByNow(goals.waterGoalMl), [goals.waterGoalMl]);
  const behind = dailyLog.water < expected - 200; // small buffer so it doesn't nag over tiny gaps

  const addWater = (ml) => {
    saveDailyLog({ ...dailyLog, water: Math.max(0, dailyLog.water + ml) });
  };

  const remaining = Math.max(0, goals.waterGoalMl - dailyLog.water);
  const [reminderState, setReminderState] = useState(waterRemindersEnabled() ? "enabled" : "idle");
  const enableReminders = async () => {
    try { await enableWaterReminders(); setReminderState("enabled"); }
    catch (error) { setReminderState(error.message); }
  };

  return (
    <Section
      title="Water"
      icon={<Droplets size={18} className="text-pine" />}
      right={<span className="font-mono text-sm">{dailyLog.water} / {goals.waterGoalMl} ml</span>}
    >
      {behind && (
        <div className="flex items-center gap-2 bg-gold-soft text-ink rounded-lg px-3 py-2 text-sm mb-3">
          <Bell size={14} className="text-gold shrink-0" />
          You're a bit behind pace for today — try to catch up when you can.
        </div>
      )}
      <ProgressBar value={dailyLog.water} max={goals.waterGoalMl} />
      <p className="text-sm mt-3 opacity-70">
        {remaining === 0 ? "Goal reached for today 🎉" : `${remaining} ml to go`}
      </p>
      <div className="flex flex-wrap gap-2 mt-4">
        {[100, 250, 500].map((ml) => (
          <button
            key={ml}
            onClick={() => addWater(ml)}
            className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-pine-deep text-paper"
          >
            <Plus size={14} /> {ml} ml
          </button>
        ))}
        <button
          onClick={() => addWater(-250)}
          className="px-3 py-1.5 rounded-lg text-sm border border-line"
        >
          undo 250ml
        </button>
      </div>
      <div className="mt-5 pt-4 border-t border-line">
        <p className="text-sm font-medium">Water reminders</p>
        <p className="text-xs opacity-60 mt-1">Every 90 minutes while Daybook is open. Choosing “Yes” adds 200 ml.</p>
        <button onClick={enableReminders} disabled={reminderState === "enabled"} className="mt-3 px-3 py-1.5 rounded-lg text-sm border border-pine text-pine-deep disabled:opacity-60">
          {reminderState === "enabled" ? "Water reminders enabled" : "Enable water reminders"}
        </button>
        {reminderState !== "idle" && reminderState !== "enabled" && <p className="text-xs text-rose mt-2">{reminderState}</p>}
      </div>
    </Section>
  );
}
