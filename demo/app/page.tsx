import CustomControlsPlayer from "./components/CustomControlsPlayer";
import PlaylistPlayer from "./components/PlaylistPlayer";
import ThemeTogglePlayer from "./components/ThemeTogglePlayer";
import HiddenPlayer from "./components/HiddenPlayer";
import EventLog from "./components/EventLog";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "#0a0a0a" }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: "#1a1a1a" }}>
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🎵</span>
            <h1 className="text-2xl font-bold text-white">
              soundcloud-widget-react
            </h1>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "#00a99d22", color: "#00a99d", border: "1px solid #00a99d44" }}
            >
              v2.0.0
            </span>
          </div>
          <p style={{ color: "#888" }} className="text-sm">
            React component + hooks for the SoundCloud HTML5 Widget API. Full TypeScript support.
            Every feature demoed live below.
          </p>
          <div className="flex gap-3 mt-3">
            <a
              href="https://github.com/twin-paws/soundcloud-widget-react"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: "#2a2a2a", color: "#f0f0f0" }}
            >
              GitHub ↗
            </a>
            <a
              href="https://www.npmjs.com/package/soundcloud-widget-react"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={{ background: "#2a2a2a", color: "#f0f0f0" }}
            >
              npm ↗
            </a>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <CustomControlsPlayer />
        <PlaylistPlayer />
        <ThemeTogglePlayer />
        <HiddenPlayer />
        <EventLog />
      </div>

      {/* Footer */}
      <div className="border-t py-8 text-center text-xs" style={{ borderColor: "#1a1a1a", color: "#555" }}>
        MIT License · Built with{" "}
        <a href="https://github.com/twin-paws/soundcloud-widget-react" style={{ color: "#00a99d" }}>
          soundcloud-widget-react
        </a>
      </div>
    </main>
  );
}
