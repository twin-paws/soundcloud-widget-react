"use client";

import { SCWidget, SCWidgetEvents } from "soundcloud-widget-react";
import type { SCAudioEventPayload } from "soundcloud-widget-react";
import { useState, useCallback } from "react";

interface LogEntry {
  id: number;
  event: string;
  detail: string;
  ts: string;
}

let counter = 0;

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const EVENT_COLORS: Record<string, string> = {
  [SCWidgetEvents.PLAY]: "#22c55e",
  [SCWidgetEvents.PAUSE]: "#f59e0b",
  [SCWidgetEvents.SEEK]: "#a78bfa",
  [SCWidgetEvents.PLAY_PROGRESS]: "#00a99d",
  [SCWidgetEvents.FINISH]: "#ef4444",
};

export default function EventLog() {
  const [log, setLog] = useState<LogEntry[]>([]);

  const addEntry = useCallback((event: string, detail: string) => {
    const ts = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLog((prev) => [{ id: counter++, event, detail, ts }, ...prev].slice(0, 5));
  }, []);

  return (
    <div className="rounded-2xl p-6" style={{ background: "#1a1a1a" }}>
      <h2 className="text-xl font-bold mb-1" style={{ color: "#00a99d" }}>
        5. Live Event Log
      </h2>
      <p className="text-sm mb-4" style={{ color: "#888" }}>
        Generic{" "}
        <code className="px-1 rounded" style={{ background: "#0a0a0a" }}>onEvent</code> binding —
        every widget event streams into this log in real time.
      </p>

      <SCWidget
        url="https://soundcloud.com/caseywillis/thats-me-in-the-corner"
        width="100%"
        height={120}
        color="#00a99d"
        onPlay={() => addEntry("PLAY", "playback started")}
        onPause={() => addEntry("PAUSE", "playback paused")}
        onFinish={() => addEntry("FINISH", "track finished")}
        onSeek={(p: SCAudioEventPayload) =>
          addEntry("SEEK", `→ ${formatMs(p.currentPosition)}`)
        }
        onPlayProgress={(p: SCAudioEventPayload) =>
          addEntry("PLAY_PROGRESS", `pos ${formatMs(p.currentPosition)}`)
        }
      />

      <div className="mt-4 space-y-2 min-h-[140px]">
        {log.length === 0 && (
          <div className="text-sm text-center py-6" style={{ color: "#555" }}>
            Play the widget above — events will appear here ↑
          </div>
        )}
        {log.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-mono"
            style={{ background: "#0f0f0f", border: "1px solid #222" }}
          >
            <span className="text-xs" style={{ color: "#555" }}>{entry.ts}</span>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                background: (EVENT_COLORS[entry.event] ?? "#888") + "22",
                color: EVENT_COLORS[entry.event] ?? "#888",
              }}
            >
              {entry.event}
            </span>
            <span style={{ color: "#ccc" }}>{entry.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
