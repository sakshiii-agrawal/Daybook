import React, { useMemo } from "react";
import { User, Settings2 } from "lucide-react";
import Section from "../components/Section.jsx";
import { getGoals, bmi, bmiLabel } from "../lib/health.js";

export default function ProfilePage({ profile, saveProfile }) {
  const goals = useMemo(() => getGoals(profile), [profile]);
  const bmiVal = useMemo(() => bmi(profile), [profile]);

  return (
    <>
      <Section title="Your profile" icon={<User size={18} className="text-pine" />}>
        <label className="text-sm flex flex-col gap-1 mb-3">
          Display name
          <input
            type="text"
            value={profile.name}
            onChange={(e) => saveProfile({ ...profile, name: e.target.value })}
            placeholder="What should we call you?"
            className="px-2 py-1.5 rounded-lg border border-line bg-paper"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm flex flex-col gap-1">
            Age
            <input type="number" value={profile.age}
              onChange={(e) => saveProfile({ ...profile, age: e.target.value })}
              className="px-2 py-1.5 rounded-lg border border-line bg-paper" />
          </label>
          <label className="text-sm flex flex-col gap-1">
            Gender
            <select value={profile.gender}
              onChange={(e) => saveProfile({ ...profile, gender: e.target.value })}
              className="px-2 py-1.5 rounded-lg border border-line bg-paper">
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="text-sm flex flex-col gap-1">
            Height (cm)
            <input type="number" value={profile.heightCm}
              onChange={(e) => saveProfile({ ...profile, heightCm: e.target.value })}
              className="px-2 py-1.5 rounded-lg border border-line bg-paper" />
          </label>
          <label className="text-sm flex flex-col gap-1">
            Weight (kg)
            <input type="number" value={profile.weightKg}
              onChange={(e) => saveProfile({ ...profile, weightKg: e.target.value })}
              className="px-2 py-1.5 rounded-lg border border-line bg-paper" />
          </label>
        </div>
        {bmiVal && (
          <p className="text-sm mt-3 opacity-80">
            BMI: <strong>{bmiVal}</strong> ({bmiLabel(bmiVal)})
          </p>
        )}
      </Section>

      <Section title="Daily goals" icon={<Settings2 size={18} className="text-pine" />}>
        <label className="flex items-center gap-2 text-sm mb-3">
          <input type="checkbox" checked={profile.autoGoals}
            onChange={(e) => saveProfile({ ...profile, autoGoals: e.target.checked })} />
          Auto-calculate from my profile
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm flex flex-col gap-1">
            Water goal (ml)
            <input type="number" disabled={profile.autoGoals}
              value={profile.autoGoals ? goals.waterGoalMl : profile.waterGoalMl}
              onChange={(e) => saveProfile({ ...profile, waterGoalMl: parseInt(e.target.value, 10) || 0 })}
              className="px-2 py-1.5 rounded-lg border border-line bg-paper disabled:opacity-60" />
          </label>
          <label className="text-sm flex flex-col gap-1">
            Step goal
            <input type="number" disabled={profile.autoGoals}
              value={profile.autoGoals ? goals.stepGoal : profile.stepGoal}
              onChange={(e) => saveProfile({ ...profile, stepGoal: parseInt(e.target.value, 10) || 0 })}
              className="px-2 py-1.5 rounded-lg border border-line bg-paper disabled:opacity-60" />
          </label>
        </div>
      </Section>
    </>
  );
}
