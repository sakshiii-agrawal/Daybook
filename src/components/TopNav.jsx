import React from "react";
import {
  CalendarDays, Droplets, Footprints, ListChecks, Moon, User,
} from "lucide-react";

const TABS = [
  { id: "home", label: "Home", icon: CalendarDays },
  { id: "water", label: "Water", icon: Droplets },
  { id: "move", label: "Move", icon: Footprints },
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "cycle", label: "Cycle", icon: Moon },
  { id: "profile", label: "Profile", icon: User },
];

export default function TopNav({ tab, setTab, profile }) {
  const visibleTabs = profile?.gender === "male" ? TABS.filter((item) => item.id !== "cycle") : TABS;
  return (
    <nav className="sticky top-0 z-10 bg-paper/95 backdrop-blur border-b border-line -mx-4 px-4 mb-5">
      <div className="flex gap-1 overflow-x-auto py-2 max-w-2xl mx-auto no-scrollbar">
        {visibleTabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-pine-deep text-paper"
                  : "text-pine-deep border border-pine-deep/40 hover:border-pine-deep"
              }`}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
