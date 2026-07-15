import React from "react";

export default function ProgressBar({ value, max, colorClass = "bg-pine" }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full h-3 rounded-full overflow-hidden bg-paper-deep">
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: pct + "%" }}
      />
    </div>
  );
}
