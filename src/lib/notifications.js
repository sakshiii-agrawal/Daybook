const REMINDER_INTERVAL_MS = 90 * 60 * 1000;

export async function enableWaterReminders() {
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    throw new Error("Notifications are not supported by this browser.");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");
  const registration = await navigator.serviceWorker.register("/water-reminder-sw.js");
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
