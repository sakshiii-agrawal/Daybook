import React from "react";
import { Home as HomeIcon, BedDouble, Sparkles } from "lucide-react";
import Section from "../components/Section.jsx";
import { todayKey, addDays, daysBetween } from "../lib/dates.js";

const ICONS = {
  bed: BedDouble,
  brush: Sparkles,
  pillow: HomeIcon,
};

export default function HomeCarePage({ homecare, saveHomecare }) {
  const key = todayKey();

  const statusOf = (item) => {
    if (!item.lastDone) return { overdue: true, text: "Not logged yet" };
    const due = addDays(item.lastDone, item.freqDays);
    const d = daysBetween(key, due);
    if (d < 0) return { overdue: true, text: `Overdue by ${Math.abs(d)}d` };
    if (d === 0) return { overdue: false, text: "Due today" };
    return { overdue: false, text: `${d}d left` };
  };

  const markDone = (id) => {
    saveHomecare({ ...homecare, [id]: { ...homecare[id], lastDone: key } });
  };
  const updateFreq = (id, freq) => {
    saveHomecare({ ...homecare, [id]: { ...homecare[id], freqDays: freq } });
  };

  return (
    <Section title="Home care" icon={<HomeIcon size={18} className="text-pine" />}>
      <div className="flex flex-col gap-4">
        {Object.entries(homecare).map(([id, item]) => {
          const status = statusOf(item);
          const Icon = ICONS[item.icon] || HomeIcon;
          return (
            <div key={id} className="pb-4 border-b border-line last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Icon size={18} className="text-pine" /> {item.label}
                </div>
                <span className={`text-xs font-mono ${status.overdue ? "text-rose" : "text-pine"}`}>
                  {status.text}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs opacity-80">
                <span>every</span>
                <input
                  type="number"
                  value={item.freqDays}
                  onChange={(e) => updateFreq(id, parseInt(e.target.value, 10) || 1)}
                  className="px-2 py-1 rounded-md border border-line bg-paper w-14"
                />
                <span>days</span>
                <button
                  onClick={() => markDone(id)}
                  className="ml-auto px-3 py-1 rounded-lg bg-pine-deep text-paper"
                >
                  Mark done today
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
