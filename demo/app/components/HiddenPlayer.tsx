"use client";

import type { RefObject } from "react";
import { SCWidget, useSCWidget } from "soundcloud-widget-react";
import type { SCWidgetRef } from "soundcloud-widget-react";

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function HiddenPlayer() {
  const { ref, state, props, controls } = useSCWidget();

  return (
    <div className="rounded-2xl p-6" style={{ background: "#1a1a1a" }}>
      <h2 className="text-xl font-bold mb-1" style={{ color: "#00a99d" }}>
        4. Hidden iframe / Controller-Only
      </h2>
      <p className="text-sm mb-4" style={{ color: "#888" }}>
        The <code className="px-1 rounded" style={{ background: "#0a0a0a" }}>hidden</code> prop renders no visible
        iframe. Your UI is 100% custom — here&apos;s a minimal &quot;mini player&quot; bar.
      </p>

      <SCWidget
        ref={ref as RefObject<SCWidgetRef>}
        url="https://soundcloud.com/caseywillis/thats-me-in-the-corner"
        hidden
        {...props}
      />

      <div className="rounded-lg p-4 mb-4 text-xs font-mono overflow-x-auto" style={{ background: "#0a0a0a", color: "#ccc" }}>
        <span style={{ color: "#888" }}>{"// No iframe rendered in the DOM"}</span><br />
        <span style={{ color: "#00a99d" }}>{"<SCWidget"}</span><br />
        {"  url={url}"}<br />
        {"  "}<span style={{ color: "#00a99d" }}>hidden</span><br />
        {"  {...props}"}<br />
        <span style={{ color: "#00a99d" }}>{"/>"}</span>
      </div>

      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "#0f0f0f", border: "1px solid #2a2a2a" }}
      >
        <button
          onClick={controls.toggle}
          disabled={!state.isReady}
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold disabled:opacity-40 flex-shrink-0"
          style={{ background: "#00a99d", color: "#fff" }}
        >
          {state.isPlaying ? "⏸" : "▶"}
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate">
            {state.sound?.title ?? (state.isReady ? "Ready" : "Loading…")}
          </div>
          <div className="text-xs" style={{ color: "#888" }}>
            {state.sound?.user.username ?? "—"}
          </div>
        </div>

        <div className="text-xs tabular-nums flex-shrink-0" style={{ color: "#888" }}>
          {formatMs(state.positionMs)} / {formatMs(state.durationMs)}
        </div>
      </div>
    </div>
  );
}
