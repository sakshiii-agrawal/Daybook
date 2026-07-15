import React, { useMemo, useState, useEffect } from "react";
import { Footprints, Dumbbell, CheckCircle2, Circle } from "lucide-react";
import Section from "../components/Section.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { getGoals } from "../lib/health.js";

export default function MovePage({ profile, dailyLog, saveDailyLog }) {
  const goals = useMemo(() => getGoals(profile), [profile]);
  const [stepInput, setStepInput] = useState(dailyLog.steps ? String(dailyLog.steps) : "");

  useEffect(() => {
    setStepInput(dailyLog.steps ? String(dailyLog.steps) : "");
  }, [dailyLog.steps]);

  const commitSteps = () => {
    const v = parseInt(stepInput, 10);
    saveDailyLog({ ...dailyLog, steps: isNaN(v) ? 0 : v });
  };

  const toggleGym = () => {
    saveDailyLog({ ...dailyLog, gym: !dailyLog.gym });
  };

  return (
    <>
      <Section
        title="Steps"
        icon={<Footprints size={18} className="text-gold" />}
        right={<span className="font-mono text-sm">goal {goals.stepGoal}</span>}
      >
        <ProgressBar value={dailyLog.steps} max={goals.stepGoal} colorClass="bg-gold" />
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            value={stepInput}
            onChange={(e) => setStepInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitSteps()}
            placeholder="Enter today's steps"
            className="flex-1 px-3 py-1.5 rounded-lg text-sm border border-line bg-paper"
          />
          <button onClick={commitSteps} className="px-3 py-1.5 rounded-lg text-sm bg-gold text-paper">
            Save
          </button>
        </div>
      </Section>

      <Section title="Workout" icon={<Dumbbell size={18} className="text-pine" />}>
        <button
          onClick={toggleGym}
          className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border border-pine ${
            dailyLog.gym ? "bg-pine text-paper" : "text-pine-deep"
          }`}
        >
          {dailyLog.gym ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          {dailyLog.gym ? "Workout logged for today" : "Mark today's workout done"}
        </button>
      </Section>
    </>
  );
}
