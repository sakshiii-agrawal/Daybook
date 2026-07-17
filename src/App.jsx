import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import TopNav from "./components/TopNav.jsx";
import HomePage from "./pages/Home.jsx";
import WaterPage from "./pages/Water.jsx";
import MovePage from "./pages/Move.jsx";
import TasksPage from "./pages/Tasks.jsx";
import CyclePage from "./pages/Cycle.jsx";
import ProfilePage from "./pages/Profile.jsx";
import { todayKey } from "./lib/dates.js";
import {
  watchUserData, setUserData, watchDailyLog, setDailyLog,
} from "./lib/dataStore.js";
import { startWaterReminderSchedule } from "./lib/notifications.js";

const DEFAULT_PROFILE = {
  name: "", age: "", heightCm: "", weightKg: "", gender: "female",
  autoGoals: true, waterGoalMl: 2000, stepGoal: 8000,
};
const DEFAULT_HOMECARE = {
  pillow: { label: "Pillow covers", scheduleType: "weekday", weekday: 0, lastDone: null, icon: "pillow" },
  bedsheet: { label: "Bedsheets", scheduleType: "monthAnchor", anchorType: "lastWeekday", weekday: 0, everyNMonths: 1, lastDone: null, icon: "bed" },
  brush: { label: "Toothbrush", scheduleType: "monthAnchor", anchorType: "lastDay", everyNMonths: 3, lastDone: null, icon: "brush" },
};
const DEFAULT_PERIOD = { periods: [] };
const DEFAULT_DAILY = { water: 0, steps: 0, gym: false, tasks: [], skincare: {} };
const DEFAULT_SKINCARE = [];
const DEFAULT_WEEKLY_PLANNER = {};

export default function App() {
  const { user, checking, logout } = useAuth();
  const [tab, setTab] = useState("home");
  const [loadingData, setLoadingData] = useState(true);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [homecare, setHomecare] = useState(DEFAULT_HOMECARE);
  const [periodData, setPeriodData] = useState(DEFAULT_PERIOD);
  const [dailyLog, setDailyLogState] = useState(DEFAULT_DAILY);
  const [skincareTasks, setSkincareTasks] = useState(DEFAULT_SKINCARE);
  const [weeklyPlanner, setWeeklyPlanner] = useState(DEFAULT_WEEKLY_PLANNER);
  const key = todayKey();

  useEffect(() => {
    if (!user) return;
    let gotUserDoc = false;
    let gotDaily = false;
    const check = () => { if (gotUserDoc && gotDaily) setLoadingData(false); };

    const unsub1 = watchUserData(user.uid, (data) => {
      if (data) {
        setProfile({ ...DEFAULT_PROFILE, ...(data.profile || {}) });
        setHomecare({ ...DEFAULT_HOMECARE, ...(data.homecare || {}) });
        setPeriodData({ ...DEFAULT_PERIOD, ...(data.periodData || {}) });
        setSkincareTasks(data.skincareTasks || DEFAULT_SKINCARE);
        setWeeklyPlanner(data.weeklyPlanner || DEFAULT_WEEKLY_PLANNER);
      }
      gotUserDoc = true;
      check();
    });
    const unsub2 = watchDailyLog(user.uid, key, (data) => {
      if (data) setDailyLogState({ ...DEFAULT_DAILY, ...data });
      else setDailyLogState(DEFAULT_DAILY);
      gotDaily = true;
      check();
    });
    return () => { unsub1(); unsub2(); };
  }, [user, key]);

  const saveProfile = useCallback((next) => {
    setProfile(next);
    if (user) setUserData(user.uid, { profile: next });
  }, [user]);

  const saveHomecare = useCallback((next) => {
    setHomecare(next);
    if (user) setUserData(user.uid, { homecare: next });
  }, [user]);

  const savePeriodData = useCallback((next) => {
    setPeriodData(next);
    if (user) setUserData(user.uid, { periodData: next });
  }, [user]);

  const saveSkincareTasks = useCallback((next) => {
    setSkincareTasks(next);
    if (user) setUserData(user.uid, { skincareTasks: next });
  }, [user]);

  const saveWeeklyPlanner = useCallback((next) => {
    setWeeklyPlanner(next);
    if (user) setUserData(user.uid, { weeklyPlanner: next });
  }, [user]);

  const saveDailyLog = useCallback((next) => {
    setDailyLogState(next);
    if (user) setDailyLog(user.uid, key, next);
  }, [user, key]);

  useEffect(() => {
    if (!user) return undefined;
    let stopReminders = startWaterReminderSchedule();
    const restartReminders = () => { stopReminders(); stopReminders = startWaterReminderSchedule(); };
    const handleMessage = (event) => {
      if (event.data?.type === "WATER_REMINDER_ACCEPTED") {
        setDailyLogState((current) => {
          const next = { ...current, water: (current.water || 0) + (event.data.amount || 200) };
          setDailyLog(user.uid, key, next);
          return next;
        });
      }
    };
    window.addEventListener("daybook-water-reminders-enabled", restartReminders);
    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () => { stopReminders(); window.removeEventListener("daybook-water-reminders-enabled", restartReminders); navigator.serviceWorker?.removeEventListener("message", handleMessage); };
  }, [user, key]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) return <Login />;

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Opening your daybook…</p>
      </div>
    );
  }

  const displayName = profile.name || user.displayName?.split(" ")[0] || "there";

  const pageProps = {
    profile, saveProfile, homecare, saveHomecare,
    periodData, savePeriodData, dailyLog, saveDailyLog,
    skincareTasks, saveSkincareTasks, weeklyPlanner, saveWeeklyPlanner, uid: user.uid,
    setTab, displayName,
  };

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="font-display text-2xl font-bold tracking-tight text-pine-deep">
            Daybook
          </h1>
          <button onClick={logout} className="text-xs opacity-60 hover:opacity-100">
            Sign out
          </button>
        </div>
      </div>
      <TopNav tab={tab} setTab={setTab} profile={profile} />
      <div className="max-w-2xl mx-auto px-4 pb-10">
        {tab === "home" && <HomePage {...pageProps} />}
        {tab === "water" && <WaterPage {...pageProps} />}
        {tab === "move" && <MovePage {...pageProps} />}
        {tab === "tasks" && <TasksPage {...pageProps} />}
        {tab === "cycle" && profile.gender !== "male" && <CyclePage {...pageProps} />}
        {tab === "profile" && <ProfilePage {...pageProps} />}
        <p className="text-center text-xs mt-6 text-pine/50">
          Signed in as {user.email} — synced to your account.
        </p>
      </div>
    </div>
  );
}
