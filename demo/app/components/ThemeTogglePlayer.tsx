"use client";

import { SCWidget } from "soundcloud-widget-react";
import { useState } from "react";

export default function ThemeTogglePlayer() {
  const [isDark, setIsDark] = useState(true);

  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const cardBg = isDark ? "#1a1a1a" : "#f5f5f5";
  const textColor = isDark ? "#f0f0f0" : "#111111";
  const mutedColor = isDark ? "#888" : "#666";
  const accentColor = "#00a99d";

  return (
    <div className="rounded-2xl p-6" style={{ background: cardBg, color: textColor, transition: "all 0.3s" }}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-bold" style={{ color: accentColor }}>
          3. Dark / Light Mode Toggle
        </h2>
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
          style={{
            background: isDark ? "#f0f0f0" : "#1a1a1a",
            color: isDark ? "#111" : "#f0f0f0",
          }}
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
      <p className="text-sm mb-4" style={{ color: mutedColor }}>
        The <code className="px-1 rounded" style={{ background: bg }}>color</code> prop updates live — widget re-renders with new theme.
      </p>

      <SCWidget
        url="https://soundcloud.com/caseywillis/thats-me-in-the-corner"
        width="100%"
        height={166}
        color={accentColor}
        showArtwork
        visual={false}
        key={isDark ? "dark" : "light"}
      />

      <div className="mt-3 text-xs font-mono" style={{ color: mutedColor }}>
        color=&quot;{accentColor}&quot; · theme: {isDark ? "dark" : "light"}
      </div>
    </div>
  );
}
