import React from "react";

export default function Section({ title, icon, children, right }) {
  return (
    <div className="bg-card border border-line rounded-2xl p-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-display text-lg font-semibold text-pine-deep">
            {title}
          </h3>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
