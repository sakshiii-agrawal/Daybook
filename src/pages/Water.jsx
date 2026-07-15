import React, { useMemo } from "react";
import { Droplets, Plus } from "lucide-react";
import Section from "../components/Section.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { getGoals } from "../lib/health.js";

export default function WaterPage({ profile, dailyLog, saveDailyLog }) {
  const goals = useMemo(() => getGoals(profile), [profile]);

  const addWater = (ml) => {
    saveDailyLog({ ...dailyLog, water: Math.max(0, dailyLog.water + ml) });
  };

  const remaining = Math.max(0, goals.waterGoalMl - dailyLog.water);

  return (
    <Section
      title="Water"
      icon={<Droplets size={18} className="text-pine" />}
      right={<span className="font-mono text-sm">{dailyLog.water} / {goals.waterGoalMl} ml</span>}
    >
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
    </Section>
  );
}
