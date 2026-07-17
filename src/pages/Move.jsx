import React, { useMemo, useState, useEffect } from "react";
import { Footprints, Dumbbell, CheckCircle2, Circle } from "lucide-react";
import Section from "../components/Section.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { getGoals } from "../lib/health.js";
import { getGoogleFitToken, fetchTodaySteps } from "../lib/googleFit.js";

export default function MovePage({ profile, saveProfile, dailyLog, saveDailyLog }) {
  const goals = useMemo(() => getGoals(profile), [profile]);
  const [stepInput, setStepInput] = useState(dailyLog.steps ? String(dailyLog.steps) : "");
  const [fitStatus, setFitStatus] = useState("");

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
  const syncGoogleFit = async () => {
    setFitStatus("Connecting to Google Fit…");
    try {
      const token = await getGoogleFitToken({ interactive: !profile.googleFitConnected });
      const steps = await fetchTodaySteps(token);
      saveDailyLog({ ...dailyLog, steps });
      saveProfile({ ...profile, googleFitConnected: true });
      setFitStatus(`Updated: ${steps.toLocaleString()} steps today.`);
    } catch (error) {
      setFitStatus(profile.googleFitConnected && error.message === "interaction_required"
        ? "Please reconnect Google Fit to continue."
        : error.message || "Google Fit sync failed.");
    }
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
        <div className="mt-4 pt-3 border-t border-line">
          <button onClick={syncGoogleFit} className="px-3 py-1.5 rounded-lg text-sm border border-pine text-pine-deep">
            {profile.googleFitConnected ? "Refresh from Google Fit" : "Connect Google Fit"}
          </button>
          <p className="text-xs opacity-60 mt-2">Manual entry remains available if you prefer it.</p>
          {fitStatus && <p className="text-xs mt-2">{fitStatus}</p>}
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
