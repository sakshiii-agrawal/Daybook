import React, { useState } from "react";
import { Sparkles, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import Section from "../components/Section.jsx";

export default function SkincarePage({ skincareTasks, saveSkincareTasks, dailyLog, saveDailyLog }) {
  const [text, setText] = useState("");
  const addTask = () => {
    if (!text.trim()) return;
    saveSkincareTasks([...skincareTasks, { id: `skin_${Date.now()}`, text: text.trim() }]);
    setText("");
  };
  const toggle = (id) => saveDailyLog({
    ...dailyLog,
    skincare: { ...(dailyLog.skincare || {}), [id]: !dailyLog.skincare?.[id] },
  });
  const remove = (id) => {
    saveSkincareTasks(skincareTasks.filter((task) => task.id !== id));
    const { [id]: _removed, ...nextChecks } = dailyLog.skincare || {};
    saveDailyLog({ ...dailyLog, skincare: nextChecks });
  };

  return <Section title="Skincare" icon={<Sparkles size={18} className="text-gold" />}>
    <p className="text-sm opacity-60 mb-4">Your routine resets each new day, so every item starts unchecked.</p>
    <div className="flex gap-2 mb-4">
      <input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addTask()} placeholder="Add a skincare step" className="flex-1 px-3 py-1.5 rounded-lg text-sm border border-line bg-paper" />
      <button onClick={addTask} className="px-3 py-1.5 rounded-lg bg-pine-deep text-paper" aria-label="Add skincare step"><Plus size={16} /></button>
    </div>
    {skincareTasks.length === 0 && <p className="text-sm opacity-60">Add your first step—such as Cleanser, Moisturiser, or SPF.</p>}
    <div className="flex flex-col divide-y divide-line">
      {skincareTasks.map((task) => {
        const done = Boolean(dailyLog.skincare?.[task.id]);
        return <div key={task.id} className="flex items-center gap-2 py-2">
          <button onClick={() => toggle(task.id)} className="flex items-center gap-2 text-sm flex-1 text-left min-w-0">
            {done ? <CheckCircle2 size={17} className="text-pine shrink-0" /> : <Circle size={17} className="text-pine shrink-0" />}
            <span className={done ? "line-through opacity-50" : ""}>{task.text}</span>
          </button>
          <button onClick={() => remove(task.id)} aria-label={`Remove ${task.text}`}><Trash2 size={14} className="text-rose" /></button>
        </div>;
      })}
    </div>
  </Section>;
}
