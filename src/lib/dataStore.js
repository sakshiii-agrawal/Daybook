import {
  doc, getDoc, setDoc, onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase.js";

// One doc per user holds profile + homecare + period data (small, changes together).
export function userDocRef(uid) {
  return doc(db, "users", uid);
}

// One doc per user per day holds that day's water/steps/gym/tasks.
export function dailyDocRef(uid, dateKey) {
  return doc(db, "users", uid, "dailyLogs", dateKey);
}

export async function getUserData(uid) {
  const snap = await getDoc(userDocRef(uid));
  return snap.exists() ? snap.data() : null;
}

export async function setUserData(uid, data) {
  await setDoc(userDocRef(uid), data, { merge: true });
}

export function watchUserData(uid, callback) {
  return onSnapshot(userDocRef(uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}

export async function getDailyLog(uid, dateKey) {
  const snap = await getDoc(dailyDocRef(uid, dateKey));
  return snap.exists() ? snap.data() : null;
}

export async function setDailyLog(uid, dateKey, data) {
  await setDoc(dailyDocRef(uid, dateKey), data, { merge: true });
}

export function watchDailyLog(uid, dateKey, callback) {
  return onSnapshot(dailyDocRef(uid, dateKey), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
}
