import React, { useState } from "react";
import { ListChecks, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import Section from "../components/Section.jsx";

export default function TasksPage({ dailyLog, saveDailyLog }) {
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    const t = { id: Date.now().toString(), text: newTask.trim(), done: false };
    saveDailyLog({ ...dailyLog, tasks: [...dailyLog.tasks, t] });
    setNewTask("");
  };
  const toggleTask = (id) => {
    saveDailyLog({
      ...dailyLog,
      tasks: dailyLog.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    });
  };
  const deleteTask = (id) => {
    saveDailyLog({ ...dailyLog, tasks: dailyLog.tasks.filter((t) => t.id !== id) });
  };

  return (
    <Section title="Today's tasks" icon={<ListChecks size={18} className="text-pine" />}>
      <div className="flex gap-2 mb-4">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task for today"
          className="flex-1 px-3 py-1.5 rounded-lg text-sm border border-line bg-paper"
        />
        <button onClick={addTask} className="px-3 py-1.5 rounded-lg bg-pine-deep text-paper">
          <Plus size={16} />
        </button>
      </div>
      {dailyLog.tasks.length === 0 && (
        <p className="text-sm opacity-60">Nothing on the list yet — add your first task above.</p>
      )}
      <div className="flex flex-col gap-2">
        {dailyLog.tasks.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-2">
            <button onClick={() => toggleTask(t.id)} className="flex items-center gap-2 text-sm flex-1 text-left">
              {t.done ? <CheckCircle2 size={16} className="text-pine" /> : <Circle size={16} className="text-pine" />}
              <span className={t.done ? "line-through opacity-50" : ""}>{t.text}</span>
            </button>
            <button onClick={() => deleteTask(t.id)}>
              <Trash2 size={14} className="text-rose" />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}
