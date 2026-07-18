import { getToken, onMessage } from "firebase/messaging";
import { getMessagingIfSupported, firebaseConfig } from "../firebase.js";
import { setUserData } from "./dataStore.js";

const REMINDER_INTERVAL_MS = 90 * 60 * 1000;

function swUrl() {
  // Firebase config is embedded as query params because the service worker
  // lives in /public and can't read Vite's import.meta.env at build time.
  const qs = new URLSearchParams(firebaseConfig).toString();
  return `/water-reminder-sw.js?${qs}`;
}

export async function enableWaterReminders() {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    throw new Error("Notifications are not supported by this browser.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");
  const registration = await navigator.serviceWorker.register(swUrl());
  localStorage.setItem("daybook-water-reminders", "enabled");
  window.dispatchEvent(new Event("daybook-water-reminders-enabled"));
  return registration;
}

export function waterRemindersEnabled() {
  return localStorage.getItem("daybook-water-reminders") === "enabled";
}

export async function showWaterReminder() {
  const registration = await navigator.serviceWorker.ready;
  return registration.showNotification("Time for some water", {
    body: "Would you like to log 200 ml?",
    tag: "daybook-water-reminder",
    renotify: true,
    data: { amount: 200 },
    actions: [
      { action: "yes", title: "Yes, add 200 ml" },
      { action: "no", title: "No" },
    ],
  });
}

export function startWaterReminderSchedule() {
  if (!waterRemindersEnabled()) return () => {};
  const timer = window.setInterval(() => { showWaterReminder().catch(() => {}); }, REMINDER_INTERVAL_MS);
  return () => window.clearInterval(timer);
}

// --- Closed-app reminders (real push, works even if Daybook isn't open) ---
// These are delivered by a free GitHub Actions cron job (see
// scripts/send-water-reminders.mjs) via Firebase Cloud Messaging. This
// function just handles the one-time device registration: it asks for
// permission, registers the FCM-aware service worker, gets a device token,
// and saves that token (plus the user's UTC offset, so the cron script
// knows their local time) to their Firestore profile.
export async function enableClosedAppReminders(uid) {
  if (!uid) throw new Error("Sign in first.");
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) throw new Error("Add VITE_FIREBASE_VAPID_KEY to your environment variables first (see README).");

  const messaging = await getMessagingIfSupported();
  if (!messaging) throw new Error("This browser doesn't support closed-app push notifications.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");

  const registration = await navigator.serviceWorker.register(swUrl());
  await navigator.serviceWorker.ready;

  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) throw new Error("Couldn't get a device token — try again in a moment.");

  await setUserData(uid, {
    profile: {
      notifyClosedApp: true,
      fcmToken: token,
      tzOffsetMinutes: -new Date().getTimezoneOffset(), // positive east of UTC, matches typical UTC-offset convention
    },
  });

  // Foreground messages (app open in another tab) show up via onMessage
  // instead of onBackgroundMessage, so surface those too.
  onMessage(messaging, (payload) => {
    if (payload.data?.type === "water-reminder") showWaterReminder().catch(() => {});
  });

  localStorage.setItem("daybook-water-reminders", "enabled");
  window.dispatchEvent(new Event("daybook-water-reminders-enabled"));
  return token;
}

export async function disableClosedAppReminders(uid) {
  if (uid) await setUserData(uid, { profile: { notifyClosedApp: false, fcmToken: null } });
}
