"use client";

import type { RefObject } from "react";
import { SCWidget, useSCWidget } from "soundcloud-widget-react";
import type { SCSound, SCWidgetRef } from "soundcloud-widget-react";
import { useEffect, useState } from "react";

export default function PlaylistPlayer() {
  const { ref, state, props, controls } = useSCWidget();
  const [tracks, setTracks] = useState<SCSound[]>([]);

  useEffect(() => {
    if (state.isReady) {
      ref.current?.getSoundsAsync().then(setTracks).catch(() => {});
    }
  }, [state.isReady, ref]);

  const handleNext = () => {
    controls.next();
    setTimeout(() => {
      ref.current?.getSoundsAsync().then(setTracks).catch(() => {});
    }, 500);
  };

  const handlePrev = () => {
    controls.prev();
    setTimeout(() => {
      ref.current?.getSoundsAsync().then(setTracks).catch(() => {});
    }, 500);
  };

  return (
    <div className="rounded-2xl p-6" style={{ background: "#1a1a1a" }}>
      <h2 className="text-xl font-bold mb-1" style={{ color: "#00a99d" }}>
        2. Playlist Player
      </h2>
      <p className="text-sm mb-4" style={{ color: "#888" }}>
        Navigate a playlist with{" "}
        <code className="px-1 rounded" style={{ background: "#0a0a0a" }}>controls.next</code> /{" "}
        <code className="px-1 rounded" style={{ background: "#0a0a0a" }}>controls.prev</code> /{" "}
        <code className="px-1 rounded" style={{ background: "#0a0a0a" }}>controls.skip</code>.
      </p>

      <SCWidget
        ref={ref as RefObject<SCWidgetRef>}
        url="https://soundcloud.com/soundcloud-playlists/sets/weekly-toptracks-us"
        width="100%"
        height={120}
        color="#00a99d"
        showArtwork={false}
        {...props}
      />

      <div className="mt-4 flex items-center justify-between">
        <div>
          <div className="font-semibold truncate">{state.sound?.title ?? "Loading…"}</div>
          <div className="text-sm" style={{ color: "#888" }}>
            Track {tracks.length > 0 ? `${state.soundIndex + 1} / ${tracks.length}` : "—"}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            disabled={!state.isReady}
            className="px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
            style={{ background: "#2a2a2a", color: "#f0f0f0" }}
          >
            ⏮ Prev
          </button>
          <button
            onClick={controls.toggle}
            disabled={!state.isReady}
            className="px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
            style={{ background: "#00a99d", color: "#fff" }}
          >
            {state.isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={handleNext}
            disabled={!state.isReady}
            className="px-4 py-2 rounded-full text-sm font-semibold disabled:opacity-40"
            style={{ background: "#2a2a2a", color: "#f0f0f0" }}
          >
            Next ⏭
          </button>
        </div>
      </div>

      {tracks.length > 0 && (
        <div className="mt-4 space-y-1">
          {tracks.slice(0, 5).map((t, i) => (
            <button
              key={t.id}
              onClick={() => controls.skip(i)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: i === state.soundIndex ? "#00a99d22" : "transparent",
                color: i === state.soundIndex ? "#00a99d" : "#ccc",
                border: i === state.soundIndex ? "1px solid #00a99d44" : "1px solid transparent",
              }}
            >
              {i + 1}. {t.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
