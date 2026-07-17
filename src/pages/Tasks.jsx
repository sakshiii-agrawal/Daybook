import React, { useMemo, useState } from "react";
import { ListChecks, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import Section from "../components/Section.jsx";
import { todayKey, weekDates } from "../lib/dates.js";
import HomeCarePage from "./HomeCare.jsx";
import SkincarePage from "./Skincare.jsx";

const PRIORITY_COLOR = { high: "bg-rose", medium: "bg-gold", low: "bg-sage-low" };
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
const TAG_LABELS = { work: "Work", personal: "Personal", errand: "Errand" };

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time && !b.time) return -1;
    if (!a.time && b.time) return 1;
    return (PRIORITY_RANK[a.priority] ?? 3) - (PRIORITY_RANK[b.priority] ?? 3);
  });
}

function TaskRow({ task, onToggle, onDelete }) {
  return <div className="flex items-center gap-2 py-2">
    {task.priority && <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_COLOR[task.priority]}`} />}
    <button onClick={() => onToggle?.(task.id)} className="flex items-center gap-2 text-sm flex-1 text-left min-w-0">
      {task.done ? <CheckCircle2 size={16} className="text-pine shrink-0" /> : <Circle size={16} className="text-pine shrink-0" />}
      <span className={`truncate ${task.done ? "line-through opacity-50" : ""}`}>{task.text}</span>
    </button>
    {task.tag && <span className="text-[10px] px-2 py-0.5 rounded-full bg-paper-deep opacity-80 shrink-0">{TAG_LABELS[task.tag] || task.tag}</span>}
    {task.time && <span className="text-xs opacity-70 font-mono shrink-0">{task.time}</span>}
    {task.durationMinutes && <span className="text-xs opacity-60 shrink-0">{task.durationMinutes}m</span>}
    {onDelete && <button onClick={() => onDelete(task.id)} className="shrink-0 p-1" aria-label={`Delete ${task.text}`}><Trash2 size={14} className="text-rose" /></button>}
  </div>;
}

function AddTaskForm({ onAdd }) {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState("");
  const [tag, setTag] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const submit = () => {
    if (!text.trim()) return;
    onAdd({ id: Date.now().toString(), text: text.trim(), done: false, time: time || null, priority: priority || null, tag: tag || null, durationMinutes: Number(durationMinutes) || null });
    setText(""); setTime(""); setPriority(""); setTag(""); setDurationMinutes("");
  };
  return <div className="rounded-xl bg-paper-deep/55 p-3 mb-4"><div className="flex gap-2"><input value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => event.key === "Enter" && submit()} placeholder="What needs to be done?" className="flex-1 px-3 py-2 rounded-lg text-sm border border-line bg-card" /><button onClick={submit} className="px-3 py-2 rounded-lg bg-pine-deep text-paper" aria-label="Add task"><Plus size={17} /></button></div><div className="flex gap-2 text-xs flex-wrap mt-2"><input type="time" value={time} onChange={(event) => setTime(event.target.value)} aria-label="Task time" className="px-2 py-1.5 rounded-md border border-line bg-card" /><input type="number" min="1" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} placeholder="Minutes" className="w-24 px-2 py-1.5 rounded-md border border-line bg-card" /><select value={priority} onChange={(event) => setPriority(event.target.value)} className="px-2 py-1.5 rounded-md border border-line bg-card"><option value="">Priority</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select><select value={tag} onChange={(event) => setTag(event.target.value)} className="px-2 py-1.5 rounded-md border border-line bg-card"><option value="">Tag</option><option value="work">Work</option><option value="personal">Personal</option><option value="errand">Errand</option></select></div></div>;
}

export default function TasksPage({ dailyLog, saveDailyLog, homecare, saveHomecare, skincareTasks, saveSkincareTasks, weeklyPlanner, saveWeeklyPlanner }) {
  const [filter, setFilter] = useState("today");
  const [weekDrafts, setWeekDrafts] = useState({});
  const dates = useMemo(() => weekDates(), []);
  const weekKey = dates[0];
  const plan = weeklyPlanner[weekKey] || {};
  const updatePlan = (date, updater) => saveWeeklyPlanner({ ...weeklyPlanner, [weekKey]: { ...plan, [date]: updater(plan[date] || []) } });
  const addWeekTask = (date) => {
    const text = weekDrafts[date]?.trim();
    if (!text) return;
    updatePlan(date, (tasks) => [...tasks, { id: `weekly_${Date.now()}`, text, done: false }]);
    setWeekDrafts((current) => ({ ...current, [date]: "" }));
  };
  const toggleWeekTask = (date, id) => updatePlan(date, (tasks) => tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task));
  const deleteWeekTask = (date, id) => updatePlan(date, (tasks) => tasks.filter((task) => task.id !== id));
  const toggleTodayTask = (id) => saveDailyLog({ ...dailyLog, tasks: dailyLog.tasks.map((task) => task.id === id ? { ...task, done: !task.done } : task) });
  const deleteTodayTask = (id) => saveDailyLog({ ...dailyLog, tasks: dailyLog.tasks.filter((task) => task.id !== id) });
  const addTodayTask = (task) => saveDailyLog({ ...dailyLog, tasks: [...dailyLog.tasks, task] });
  const sortedToday = useMemo(() => sortTasks(dailyLog.tasks), [dailyLog.tasks]);
  const tabs = [["today", "Today"], ["week", "This week"], ["homecare", "Home care"], ["skincare", "Skincare"]];
  return <>
    <Section title="Tasks" icon={<ListChecks size={18} className="text-pine" />}>
      <div className="flex gap-2 mb-4 flex-wrap">{tabs.map(([id, label]) => <button key={id} onClick={() => setFilter(id)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter === id ? "bg-pine-deep text-paper" : "border border-line text-pine-deep hover:bg-paper-deep"}`}>{label}</button>)}</div>
      {filter === "today" && <><AddTaskForm onAdd={addTodayTask} />{sortedToday.length === 0 && <p className="text-sm opacity-60">Nothing on the list yet.</p>}<div className="flex flex-col divide-y divide-line">{sortedToday.map((task) => <TaskRow key={task.id} task={task} onToggle={toggleTodayTask} onDelete={deleteTodayTask} />)}</div></>}
      {filter === "week" && <div className="flex flex-col gap-5">{dates.map((date) => { const tasks = plan[date] || []; return <div key={date}><div className="flex items-center gap-2 mb-1"><span className={`w-2 h-2 rounded-full ${date === todayKey() ? "bg-gold" : "bg-line"}`} /><h4 className="font-display font-semibold text-pine-deep">{new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}{date === todayKey() && <span className="font-body text-xs font-normal opacity-60 ml-2">Today</span>}</h4></div>{tasks.length === 0 ? <p className="text-xs opacity-45 pl-4 mb-2">Nothing planned.</p> : <div className="flex flex-col divide-y divide-line pl-2 mb-2">{sortTasks(tasks).map((task) => <TaskRow key={task.id} task={task} onToggle={(id) => toggleWeekTask(date, id)} onDelete={(id) => deleteWeekTask(date, id)} />)}</div>}<div className="flex gap-2 pl-2"><input value={weekDrafts[date] || ""} onChange={(event) => setWeekDrafts((current) => ({ ...current, [date]: event.target.value }))} onKeyDown={(event) => event.key === "Enter" && addWeekTask(date)} placeholder="Add a task for this day" className="flex-1 px-2.5 py-1.5 rounded-lg text-sm border border-line bg-paper" /><button onClick={() => addWeekTask(date)} className="px-3 py-1.5 rounded-lg bg-pine-deep text-paper" aria-label={`Add task for ${date}`}><Plus size={15} /></button></div></div>; })}</div>}
    </Section>
    {filter === "homecare" && <HomeCarePage homecare={homecare} saveHomecare={saveHomecare} />}
    {filter === "skincare" && <SkincarePage skincareTasks={skincareTasks} saveSkincareTasks={saveSkincareTasks} dailyLog={dailyLog} saveDailyLog={saveDailyLog} />}
  </>;
}
