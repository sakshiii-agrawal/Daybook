import React, { useEffect, useMemo, useState } from "react";
import { BookMarked, Sparkles, ListChecks, Heart, Volume2 } from "lucide-react";
import Section from "../components/Section.jsx";
import { contentOfTheDay } from "../lib/content.js";
import { getDictionaryEntry } from "../lib/dictionary.js";
import { todayKey } from "../lib/dates.js";

function WordCard({ fallback }) {
  const [entry, setEntry] = useState({ word: fallback.word, meaning: fallback.meaning, phonetic: "", audio: "", example: "" });
  useEffect(() => { let active = true; getDictionaryEntry(fallback).then((result) => active && setEntry(result)); return () => { active = false; }; }, [fallback]);
  const speak = () => {
    if (entry.audio) { new Audio(entry.audio).play().catch(() => {}); return; }
    if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(entry.word)); }
  };
  return <>
    <div className="flex items-center gap-2"><p className="font-display text-xl font-semibold text-pine-deep">{entry.word}</p><button onClick={speak} aria-label={`Hear ${entry.word}`} className="p-1 rounded-full hover:bg-paper-deep"><Volume2 size={17} className="text-pine" /></button></div>
    {entry.phonetic && <p className="text-xs font-mono opacity-60 mt-1">{entry.phonetic}</p>}
    <p className="text-sm opacity-75 mt-1">{entry.meaning}</p>
    {entry.example && <p className="text-sm italic opacity-65 mt-2">“{entry.example}”</p>}
  </>;
}

export default function HomePage({ dailyLog, saveDailyLog, setTab, displayName }) {
  const { word, fact } = useMemo(() => contentOfTheDay(), []);
  const key = todayKey();
  const nextWorkTask = useMemo(() => dailyLog.tasks.filter((task) => !task.done && task.tag === "work" && task.priority === "high").sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"))[0], [dailyLog.tasks]);
  const [reflection, setReflection] = useState(dailyLog.reflection?.mood || "");
  const [showReflection, setShowReflection] = useState(Boolean(dailyLog.reflection));
  useEffect(() => { setReflection(dailyLog.reflection?.mood || ""); setShowReflection(Boolean(dailyLog.reflection)); }, [dailyLog.reflection]);
  const time = new Date().getHours();
  const greeting = time < 12 ? "Good morning" : time < 17 ? "Good afternoon" : "Good evening";
  const saveReflection = (mood) => { setReflection(mood); saveDailyLog({ ...dailyLog, reflection: { mood, date: key } }); };

  return <>
    <h2 className="font-display text-2xl font-bold text-pine-deep mb-1">{greeting}, {displayName}</h2>
    <p className="text-sm opacity-60 mb-5">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
    <Section title="Word of the day" icon={<BookMarked size={18} className="text-pine" />}><WordCard fallback={word} /></Section>
    <Section title="Fact of the day" icon={<Sparkles size={18} className="text-gold" />}><p className="text-sm">{fact}</p></Section>
    <Section title="Right now" icon={<ListChecks size={18} className="text-pine" />}>
      {nextWorkTask ? <button onClick={() => setTab("tasks")} className="w-full text-left"><p className="text-xs uppercase tracking-wide text-rose font-medium">High-priority work task</p><p className="text-sm font-medium mt-1">{nextWorkTask.text}</p><p className="text-xs opacity-60 mt-1">{nextWorkTask.dueDate ? `Due ${nextWorkTask.dueDate}` : "Due today"}{nextWorkTask.time ? ` · ${nextWorkTask.time}` : ""}{nextWorkTask.durationMinutes ? ` · ${nextWorkTask.durationMinutes} min` : ""}</p></button> : <p className="text-sm opacity-70">On track — no high-priority work task is waiting.</p>}
    </Section>
    <Section title="End-of-day reflection" icon={<Heart size={18} className="text-rose" />}>
      {!showReflection ? <button onClick={() => setShowReflection(true)} className="text-sm text-pine-deep underline underline-offset-2">Check in with yourself (optional)</button> : <div><p className="text-sm mb-3">How did today feel?</p><div className="flex gap-2 flex-wrap">{["Great", "Good", "Okay", "Low"].map((mood) => <button key={mood} onClick={() => saveReflection(mood)} className={`px-3 py-1 rounded-full text-sm border ${reflection === mood ? "bg-pine-deep text-paper border-pine-deep" : "border-line"}`}>{mood}</button>)}</div><button onClick={() => setShowReflection(false)} className="text-xs opacity-60 mt-3">Skip for now</button></div>}
    </Section>
  </>;
}
