// Handles two kinds of water reminders:
// 1. Local reminders shown directly by the page while Daybook is open
//    (see src/lib/notifications.js -> showWaterReminder).
// 2. Real push messages sent by the free GitHub Actions cron job even when
//    Daybook is fully closed (see scripts/send-water-reminders.mjs), which
//    arrive here as Firebase Cloud Messaging background data messages.
//
// Firebase config can't come from a bundler env var in a static /public
// file, so it's passed in as query params when the page registers this
// worker (see enableClosedAppReminders in src/lib/notifications.js).
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

const params = new URL(self.location.href).searchParams;
const firebaseConfig = {
  apiKey: params.get("apiKey"),
  authDomain: params.get("authDomain"),
  projectId: params.get("projectId"),
  storageBucket: params.get("storageBucket"),
  messagingSenderId: params.get("messagingSenderId"),
  appId: params.get("appId"),
};

if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // The GitHub Actions script sends a data-only message (no "notification"
  // block) specifically so we can build the notification ourselves here,
  // with actionable Yes/No buttons — a plain FCM "notification" payload
  // can't carry actions.
  messaging.onBackgroundMessage((payload) => {
    const data = payload.data || {};
    if (data.type !== "water-reminder") return;
    self.registration.showNotification("Time for some water", {
      body: "Would you like to log 200 ml?",
      tag: "daybook-water-reminder",
      renotify: true,
      data: { amount: Number(data.amount || 200) },
      actions: [
        { action: "yes", title: "Yes, add 200 ml" },
        { action: "no", title: "No" },
      ],
    });
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "no") return;
  if (event.action !== "yes") return;

  const amount = event.notification.data?.amount || 200;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      if (clients.length > 0) {
        // App is already open (or backgrounded) in a tab — hand off to it.
        clients.forEach((client) => client.postMessage({ type: "WATER_REMINDER_ACCEPTED", amount }));
        return clients[0].focus();
      }
      // App is fully closed — open it with the action encoded in the URL.
      // App.jsx reads this on load and logs the water automatically.
      return self.clients.openWindow(`/?water=${amount}`);
    })
  );
});
