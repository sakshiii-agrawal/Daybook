# Daybook

A personal daily dashboard — water, steps, workouts, tasks, cycle tracking, and
home-care reminders (pillow covers, bedsheets, toothbrush) — plus a word and a
fact of the day on the home screen.

This is a real, standalone web app (Vite + React + Firebase). Once deployed it
has its own URL, works on your phone and laptop, and stays free on the tiers
described below.

## 1. Create your free Firebase project (~10 minutes)

1. Go to https://console.firebase.google.com and click **Add project**.
   Name it anything (e.g. "daybook"). You can skip Google Analytics.
2. In the left sidebar, go to **Build → Authentication → Get started**.
   Under **Sign-in method**, enable **Google**.
3. Go to **Build → Firestore Database → Create database**.
   Choose **Start in production mode**, pick any region close to you.
4. Once created, go to the **Rules** tab in Firestore and paste the contents
   of `firestore.rules` (already included in this project), then **Publish**.
   This makes sure only you can read or write your own data.
5. Go to **Project settings** (gear icon) → scroll to **Your apps** →
   click the **</>** (web) icon → register the app (any nickname).
   Firebase will show you a config object with `apiKey`, `authDomain`, etc.
6. Also in **Project settings → Authentication → Settings → Authorized domains**,
   you'll add your deployed domain later (step 3 below) so Google sign-in
   works there too.

## 2. Add your Firebase keys locally

Copy `.env.example` to `.env` and fill in the values from step 1.5:

```
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Then try it locally:

```
npm install
npm run dev
```

Open the URL it prints (usually http://localhost:5173) and sign in with Google.

## 3. Deploy for free

**Easiest option: Vercel**

1. Push this folder to a new GitHub repository.
2. Go to https://vercel.com → **Add New Project** → import that repo.
3. Under **Environment Variables**, add the same six `VITE_FIREBASE_...`
   values from your `.env`.
4. Click **Deploy**. Vercel gives you a free `https://your-app.vercel.app` URL.
5. Copy that domain (without `https://`) and add it under Firebase
   **Authentication → Settings → Authorized domains**, or Google sign-in
   will be blocked on the live site.

Netlify works the same way if you'd rather use that instead.

## 4. Add it to your phone's home screen

Open your deployed URL in Chrome (Android) or Safari (iPhone), then use
"Add to Home Screen" from the browser menu. It'll open full-screen like a
native app, with no browser bar.

## Notes

- All your data (profile, tasks, water/steps logs, cycle history, home-care
  dates) is stored in Firestore under your own Google account — nothing is
  shared with other users, and it syncs automatically between your phone
  and laptop.
- Firebase's free "Spark" plan comfortably covers personal use like this —
  you won't hit any billing.
- The word/fact of the day rotates automatically based on the date and
  needs no internet API — it's a built-in list in `src/lib/content.js`,
  which you can freely edit or extend.

## Water notification setup

Water reminders use the included service worker (`public/water-reminder-sw.js`). No Firebase Cloud Messaging key is required for the included in-app reminder flow.

1. Deploy over HTTPS (Vercel does this automatically). Service workers and notifications work on localhost but not a normal HTTP site.
2. Open **Water**, select **Enable water reminders**, and accept the browser permission prompt.
3. Daybook reminds you every 90 minutes while the app is open. The notification has **Yes, add 200 ml** and **No** actions. Yes updates today's water total in the open Daybook tab.

This is water-only. A true scheduled notification when every browser tab is closed needs a trusted server, such as Firebase Cloud Functions plus Firebase Cloud Messaging, because that server must securely send the notification and write the selected 200 ml for the signed-in user. The included free client-side version works while Daybook is open.

## Google Fit setup

Google Fit is optional; the manual step field always remains available.

1. In [Google Cloud Console](https://console.cloud.google.com/), select the Firebase project's Google Cloud project.
2. Go to **APIs & Services → Library**, search for **Fitness API**, and enable it.
3. In **APIs & Services → OAuth consent screen**, configure the app details and add your Google account as a test user while it is in Testing.
4. In **Credentials**, create an OAuth client ID of type **Web application**. Add `http://localhost:5173` and your deployed Vercel URL to **Authorized JavaScript origins**.
5. Copy its client ID into `VITE_GOOGLE_CLIENT_ID` locally and into Vercel's environment variables, then redeploy.
6. Open **Move** and choose **Connect Google Fit**. Approve the read-only activity permission; Daybook imports today's step total. Use **Refresh from Google Fit** to pull the latest total.
