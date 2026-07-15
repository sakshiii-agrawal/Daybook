export function computeGoals(profile) {
  const w = parseFloat(profile.weightKg);
  const age = parseInt(profile.age, 10);
  let water = 2000;
  if (w && !isNaN(w)) water = Math.round((w * 35) / 50) * 50;
  water = Math.max(water, 1500);

  let steps = 8000;
  if (!isNaN(age)) {
    if (age < 30) steps = 10000;
    else if (age < 50) steps = 8000;
    else steps = 6000;
  }
  return { waterGoalMl: water, stepGoal: steps };
}

export function bmi(profile) {
  const w = parseFloat(profile.weightKg);
  const h = parseFloat(profile.heightCm);
  if (!w || !h) return null;
  const m = h / 100;
  return +(w / (m * m)).toFixed(1);
}

export function bmiLabel(v) {
  if (v == null) return "";
  if (v < 18.5) return "underweight";
  if (v < 25) return "in range";
  if (v < 30) return "above range";
  return "well above range";
}

export function getGoals(profile) {
  if (profile.autoGoals) return computeGoals(profile);
  return { waterGoalMl: profile.waterGoalMl, stepGoal: profile.stepGoal };
}
