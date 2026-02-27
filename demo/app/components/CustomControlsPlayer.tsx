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

export default function CustomControlsPlayer() {
  const { ref, state, props, controls } = useSCWidget();

  return (
    <div className="rounded-2xl p-6" style={{ background: "#1a1a1a" }}>
      <h2 className="text-xl font-bold mb-1" style={{ color: "#00a99d" }}>
        1. Custom Controls Player
      </h2>
      <p className="text-sm mb-4" style={{ color: "#888" }}>
        Using <code className="px-1 rounded" style={{ background: "#0a0a0a" }}>useSCWidget</code> hook
        to build fully custom playback UI — no default SC controls.
      </p>

      <SCWidget
        ref={ref as RefObject<SCWidgetRef>}
        url="https://soundcloud.com/caseywillis/thats-me-in-the-corner"
        hidden
        {...props}
      />

      {/* Track info */}
      <div className="mb-4">
        <div className="font-semibold text-lg truncate">
          {state.sound?.title ?? "Loading…"}
        </div>
        <div className="text-sm" style={{ color: "#888" }}>
          {state.sound?.user.username ?? "—"}
        </div>
      </div>

      {/* Seek bar */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={state.durationMs || 1}
          value={state.positionMs}
          className="w-full"
          style={{ accentColor: "#00a99d" }}
          onChange={(e) => controls.seekTo(Number(e.target.value))}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: "#888" }}>
          <span>{formatMs(state.positionMs)}</span>
          <span>{formatMs(state.durationMs)}</span>
        </div>
      </div>

      {/* Play/Pause + Volume */}
      <div className="flex items-center gap-4">
        <button
          onClick={controls.toggle}
          disabled={!state.isReady}
          className="px-5 py-2 rounded-full font-semibold text-sm transition-opacity disabled:opacity-40"
          style={{ background: "#00a99d", color: "#fff" }}
        >
          {state.isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs" style={{ color: "#888" }}>Vol</span>
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={80}
            className="flex-1"
            style={{ accentColor: "#00a99d" }}
            onChange={(e) => controls.setVolume(Number(e.target.value))}
          />
        </div>
      </div>

      {!state.isReady && (
        <div className="mt-4 text-xs" style={{ color: "#888" }}>
          ⏳ Waiting for SoundCloud widget to load…
        </div>
      )}
    </div>
  );
}
