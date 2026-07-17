const FIT_SCOPE = "https://www.googleapis.com/auth/fitness.activity.read";
const TOKEN_KEY = "daybook-google-fit-token";

function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) { existing.addEventListener("load", resolve, { once: true }); existing.addEventListener("error", reject, { once: true }); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client"; script.async = true; script.defer = true;
    script.onload = resolve; script.onerror = () => reject(new Error("Google sign-in could not load."));
    document.head.appendChild(script);
  });
}

function savedToken() {
  try {
    const token = JSON.parse(sessionStorage.getItem(TOKEN_KEY) || "null");
    return token?.accessToken && token.expiresAt > Date.now() + 60_000 ? token.accessToken : null;
  } catch { return null; }
}

export async function getGoogleFitToken({ interactive = false } = {}) {
  const current = savedToken();
  if (current) return current;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Add VITE_GOOGLE_CLIENT_ID to your environment variables first.");
  await loadGoogleIdentity();
  return new Promise((resolve, reject) => {
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId, scope: FIT_SCOPE,
      callback: (response) => {
        if (response.error) { reject(new Error(response.error)); return; }
        sessionStorage.setItem(TOKEN_KEY, JSON.stringify({
          accessToken: response.access_token,
          expiresAt: Date.now() + (Number(response.expires_in || 3600) * 1000),
        }));
        resolve(response.access_token);
      },
      error_callback: () => reject(new Error("Google Fit connection was cancelled.")),
    });
    tokenClient.requestAccessToken({ prompt: interactive ? "consent" : "" });
  });
}

export const connectGoogleFit = () => getGoogleFitToken({ interactive: true });

export async function fetchTodaySteps(accessToken) {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const response = await fetch("https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      aggregateBy: [{ dataTypeName: "com.google.step_count.delta" }],
      bucketByTime: { durationMillis: String(now.getTime() - start.getTime()) },
      startTimeMillis: String(start.getTime()), endTimeMillis: String(now.getTime()),
    }),
  });
  if (!response.ok) throw new Error("Google Fit could not return today's steps. Check that the Fitness API is enabled.");
  const data = await response.json();
  return (data.bucket || []).flatMap((bucket) => bucket.dataset || []).flatMap((dataset) => dataset.point || []).reduce((sum, point) => sum + (point.value?.[0]?.intVal || 0), 0);
}
