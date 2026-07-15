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
