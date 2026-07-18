// Runs on a free GitHub Actions schedule (see .github/workflows/water-reminders.yml).
// This is the piece that makes closed-app notifications possible without a
// paid Firebase Blaze plan: sending an FCM message from a server is free on
// any plan — it's Cloud Functions (server compute) that requires Blaze, and
// GitHub Actions gives us that compute for free instead.
import admin from "firebase-admin";

const REMINDER_INTERVAL_MS = 90 * 60 * 1000;
const ACTIVE_HOURS = { start: 8, end: 22 };
const BEHIND_BUFFER_ML = 200;
const DEFAULT_WATER_GOAL_ML = 2000;

function initAdmin() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON secret.");
  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin.firestore();
}

// Mirrors src/lib/dates.js#todayKey, but for a specific UTC-offset instead
// of the machine's own local timezone (GitHub Actions runners are UTC).
function localDateKey(tzOffsetMinutes) {
  const shifted = new Date(Date.now() + tzOffsetMinutes * 60000);
  return shifted.toISOString().slice(0, 10);
}

function localHour(tzOffsetMinutes) {
  const shifted = new Date(Date.now() + tzOffsetMinutes * 60000);
  return shifted.getUTCHours() + shifted.getUTCMinutes() / 60;
}

// Mirrors src/lib/health.js#computeGoals (auto water goal) closely enough
// for reminder purposes.
function waterGoalFor(profile) {
  if (profile?.autoGoals === false && profile?.waterGoalMl) return profile.waterGoalMl;
  const w = parseFloat(profile?.weightKg);
  if (!w || Number.isNaN(w)) return DEFAULT_WATER_GOAL_ML;
  return Math.max(Math.round((w * 35) / 50) * 50, 1500);
}

function expectedByNow(goalMl, hour) {
  const pct = Math.min(1, Math.max(0, (hour - ACTIVE_HOURS.start) / (ACTIVE_HOURS.end - ACTIVE_HOURS.start)));
  return Math.round(pct * goalMl);
}

async function main() {
  const db = initAdmin();
  const messaging = admin.messaging();
  const usersSnap = await db.collection("users").get();

  let sent = 0, skipped = 0, failed = 0;

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const data = userDoc.data();
    const profile = data.profile || {};

    try {
      if (!profile.notifyClosedApp || !profile.fcmToken) { skipped++; continue; }
      const tzOffsetMinutes = Number.isFinite(profile.tzOffsetMinutes) ? profile.tzOffsetMinutes : 0;

      const hour = localHour(tzOffsetMinutes);
      if (hour < ACTIVE_HOURS.start || hour > ACTIVE_HOURS.end) { skipped++; continue; }

      const lastSentAt = profile.lastWaterReminderAt?._seconds
        ? profile.lastWaterReminderAt._seconds * 1000
        : profile.lastWaterReminderAt || 0;
      if (Date.now() - lastSentAt < REMINDER_INTERVAL_MS) { skipped++; continue; }

      const dateKey = localDateKey(tzOffsetMinutes);
      const dailyDoc = await db.collection("users").doc(uid).collection("dailyLogs").doc(dateKey).get();
      const water = dailyDoc.exists ? (dailyDoc.data().water || 0) : 0;

      const goal = waterGoalFor(profile);
      const expected = expectedByNow(goal, hour);
      const behind = water < expected - BEHIND_BUFFER_ML;
      if (!behind) { skipped++; continue; }

      await messaging.send({
        token: profile.fcmToken,
        data: { type: "water-reminder", amount: "200" },
        webpush: { fcmOptions: { link: "/" } },
      });

      await db.collection("users").doc(uid).set(
        { profile: { lastWaterReminderAt: Date.now() } },
        { merge: true }
      );
      sent++;
    } catch (err) {
      failed++;
      console.error(`Reminder failed for user ${uid}:`, err.message);
      // An invalid/expired token means the user uninstalled or revoked
      // permission — stop trying to message them until they re-enable it.
      if (err.code === "messaging/registration-token-not-registered") {
        await db.collection("users").doc(uid).set(
          { profile: { notifyClosedApp: false, fcmToken: null } },
          { merge: true }
        );
      }
    }
  }

  console.log(`Water reminders: sent ${sent}, skipped ${skipped}, failed ${failed}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
