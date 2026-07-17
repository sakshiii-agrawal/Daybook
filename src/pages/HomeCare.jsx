import React, { useState } from "react";
import { Home as HomeIcon, BedDouble, Sparkles, Plus, Trash2 } from "lucide-react";
import Section from "../components/Section.jsx";
import { todayKey, WEEKDAY_LABELS } from "../lib/dates.js";
import { statusOf, scheduleSummary } from "../lib/homecareSchedule.js";

const ICONS = { bed: BedDouble, brush: Sparkles, pillow: HomeIcon };

function AddItemForm({ onAdd, onCancel }) {
  const [name, setName] = useState("");
  const [scheduleType, setScheduleType] = useState("interval");
  const [freqDays, setFreqDays] = useState(7);
  const [weekday, setWeekday] = useState(0);
  const [anchorType, setAnchorType] = useState("lastDay");
  const [everyNMonths, setEveryNMonths] = useState(1);

  const submit = () => {
    if (!name.trim()) return;
    const base = { label: name.trim(), scheduleType, lastDone: null, icon: "pillow" };
    if (scheduleType === "interval") onAdd({ ...base, freqDays: parseInt(freqDays, 10) || 7 });
    else if (scheduleType === "weekday") onAdd({ ...base, weekday: parseInt(weekday, 10) });
    else onAdd({ ...base, anchorType, weekday: parseInt(weekday, 10), everyNMonths: parseInt(everyNMonths, 10) || 1 });
  };

  return (
    <div className="border border-line rounded-xl p-3 mb-4 flex flex-col gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Item name (e.g. Towels)"
        className="px-2 py-1.5 rounded-lg border border-line bg-paper text-sm"
      />
      <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}
        className="px-2 py-1.5 rounded-lg border border-line bg-paper text-sm">
        <option value="interval">Every N days since last done</option>
        <option value="weekday">Every week, on a specific day</option>
        <option value="monthAnchor">Every month/quarter, anchored to a date</option>
      </select>

      {scheduleType === "interval" && (
        <label className="text-xs flex items-center gap-2">
          Every
          <input type="number" value={freqDays} onChange={(e) => setFreqDays(e.target.value)}
            className="w-16 px-2 py-1 rounded-md border border-line bg-paper" />
          days
        </label>
      )}

      {scheduleType === "weekday" && (
        <label className="text-xs flex items-center gap-2">
          Every
          <select value={weekday} onChange={(e) => setWeekday(e.target.value)}
            className="px-2 py-1 rounded-md border border-line bg-paper">
            {WEEKDAY_LABELS.map((w, i) => <option key={i} value={i}>{w}</option>)}
          </select>
        </label>
      )}

      {scheduleType === "monthAnchor" && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          Every
          <input type="number" value={everyNMonths} onChange={(e) => setEveryNMonths(e.target.value)}
            className="w-14 px-2 py-1 rounded-md border border-line bg-paper" />
          month(s), on the
          <select value={anchorType} onChange={(e) => setAnchorType(e.target.value)}
            className="px-2 py-1 rounded-md border border-line bg-paper">
            <option value="lastDay">last day of the month</option>
            <option value="lastWeekday">last weekday of the month</option>
          </select>
          {anchorType === "lastWeekday" && (
            <select value={weekday} onChange={(e) => setWeekday(e.target.value)}
              className="px-2 py-1 rounded-md border border-line bg-paper">
              {WEEKDAY_LABELS.map((w, i) => <option key={i} value={i}>{w}</option>)}
            </select>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <button onClick={submit} className="px-3 py-1.5 rounded-lg text-sm bg-pine-deep text-paper">Add item</button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-sm border border-line">Cancel</button>
      </div>
    </div>
  );
}

export default function HomeCarePage({ homecare, saveHomecare }) {
  const [adding, setAdding] = useState(false);
  const [dateDrafts, setDateDrafts] = useState({});

  const markDone = (id) => {
    const date = dateDrafts[id] || todayKey();
    saveHomecare({ ...homecare, [id]: { ...homecare[id], lastDone: date } });
  };
  const updateItem = (id, patch) => {
    saveHomecare({ ...homecare, [id]: { ...homecare[id], ...patch } });
  };
  const removeItem = (id) => {
    const next = { ...homecare };
    delete next[id];
    saveHomecare(next);
  };
  const addItem = (item) => {
    const id = `custom_${Date.now()}`;
    saveHomecare({ ...homecare, [id]: item });
    setAdding(false);
  };

  return (
    <Section
      title="Home care"
      icon={<HomeIcon size={18} className="text-pine" />}
      right={
        !adding && (
          <button onClick={() => setAdding(true)} className="text-pine-deep">
            <Plus size={18} />
          </button>
        )
      }
    >
      {adding && <AddItemForm onAdd={addItem} onCancel={() => setAdding(false)} />}

      <div className="flex flex-col gap-4">
        {Object.entries(homecare).map(([id, item]) => {
          const status = statusOf(item);
          const Icon = ICONS[item.icon] || HomeIcon;
          const draftDate = dateDrafts[id] || todayKey();
          return (
            <div key={id} className="pb-4 border-b border-line last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-medium text-sm">
                  <Icon size={18} className="text-pine" /> {item.label}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono ${status.overdue ? "text-rose" : "text-pine"}`}>
                    {status.text}
                  </span>
                  <button onClick={() => removeItem(id)}><Trash2 size={14} className="text-rose" /></button>
                </div>
              </div>
              <div className="text-xs opacity-70 mb-2">{scheduleSummary(item)}</div>

              {item.scheduleType === "interval" && (
                <div className="flex items-center gap-2 text-xs opacity-80 mb-2">
                  <span>every</span>
                  <input
                    type="number"
                    value={item.freqDays}
                    onChange={(e) => updateItem(id, { freqDays: parseInt(e.target.value, 10) || 1 })}
                    className="px-2 py-1 rounded-md border border-line bg-paper w-14"
                  />
                  <span>days</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs">
                <input
                  type="date"
                  value={draftDate}
                  max={todayKey()}
                  onChange={(e) => setDateDrafts({ ...dateDrafts, [id]: e.target.value })}
                  className="px-2 py-1 rounded-md border border-line bg-paper"
                />
                <button
                  onClick={() => markDone(id)}
                  className="ml-auto px-3 py-1 rounded-lg bg-pine-deep text-paper"
                >
                  Mark done on this date
                </button>
              </div>
              {item.lastDone && (
                <div className="text-xs opacity-50 mt-1">Last done: {item.lastDone}</div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
