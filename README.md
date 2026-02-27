# soundcloud-widget-react

The definitive React wrapper for the [SoundCloud HTML5 Widget API](https://developers.soundcloud.com/docs/api/html5-widget) — full TypeScript support, Promise-based getters, generic event bindings, SSR-safe, and a `useSCWidget` hook for reactive state.

## Install

```bash
npm install soundcloud-widget-react
# or
pnpm add soundcloud-widget-react
# or
yarn add soundcloud-widget-react
```

Peer dependencies: `react` and `react-dom` >= 17.

---

## Quick Start

```tsx
import { SCWidget } from "soundcloud-widget-react";

export default function App() {
  return (
    <SCWidget
      url="https://soundcloud.com/artist/track"
      autoPlay={false}
      showArtwork={true}
      onReady={({ widget }) => console.log("Widget ready", widget)}
      onPlay={(e) => console.log("Playing at", e.currentPosition)}
      onFinish={() => console.log("Track finished")}
    />
  );
}
```

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | **required** | SoundCloud track, playlist, or user URL |
| `width` | `string \| number` | `"100%"` | iframe width |
| `height` | `string \| number` | `166` | iframe height (ignored in `hidden` mode) |
| `style` | `CSSProperties` | — | Inline styles (ignored in `hidden` mode) |
| `className` | `string` | — | CSS class (ignored in `hidden` mode) |
| `iframeId` | `string` | auto-generated | `id` attribute for the iframe |
| `title` | `string` | — | Accessible `title` attribute for the iframe |
| `loading` | `"eager" \| "lazy"` | — | iframe `loading` attribute |
| `allow` | `string` | `"autoplay"` | iframe `allow` attribute |
| `sandbox` | `string` | — | iframe `sandbox` attribute |
| `referrerPolicy` | `HTMLAttributeReferrerPolicy` | — | iframe `referrerpolicy` |
| `hidden` | `boolean` | — | Render as invisible controller (1×1px, no UI) |
| `autoPlay` | `boolean` | — | Start playing automatically |
| `color` | `string` | — | Player color hex, e.g. `"ff5500"` |
| `buying` | `boolean` | — | Show buy button |
| `sharing` | `boolean` | — | Show share button |
| `download` | `boolean` | — | Show download button |
| `showArtwork` | `boolean` | — | Show artwork |
| `showPlaycount` | `boolean` | — | Show play count |
| `showUser` | `boolean` | — | Show user info |
| `startTrack` | `number` | — | Index of track to start on (playlists) |
| `singleActive` | `boolean` | — | Pause other widgets when this one plays |
| `showTeaser` | `boolean` | — | Show teaser |
| `visual` | `boolean` | — | Enable visual (large artwork) mode |
| `liking` | `boolean` | — | Show like button |
| `showComments` | `boolean` | — | Show comments |
| `hideRelated` | `boolean` | — | Hide related tracks |
| `onReady` | `(ctx: { widget: SCWidgetInstance }) => void` | — | Fired when widget is ready; receives the raw widget instance |
| `onPlay` | `(e: SCAudioEventPayload) => void` | — | Fired on play |
| `onPause` | `(e: SCAudioEventPayload) => void` | — | Fired on pause |
| `onFinish` | `(e: SCAudioEventPayload) => void` | — | Fired when track finishes |
| `onSeek` | `(e: SCAudioEventPayload) => void` | — | Fired on seek |
| `onPlayProgress` | `(e: SCAudioEventPayload) => void` | — | Fired during playback progress |
| `onLoadProgress` | `(e: SCAudioEventPayload) => void` | — | Fired during load progress |
| `onError` | `() => void` | — | Fired on player error |
| `onClickDownload` | `() => void` | — | Fired when download button clicked |
| `onClickBuy` | `() => void` | — | Fired when buy button clicked |
| `onOpenSharePanel` | `() => void` | — | Fired when share panel opens |
| `onEvent` | `{ [K in SCWidgetEvents]?: (payload: SCWidgetEventMap[K]) => void }` | — | Generic per-event handlers (can be combined with named handlers) |

### SCAudioEventPayload

```ts
interface SCAudioEventPayload {
  relativePosition: number;  // 0–1
  loadProgress: number;      // 0–1
  currentPosition: number;   // milliseconds
}
```

---

## Ref Methods

Attach a `ref` to `<SCWidget>` for imperative control:

```tsx
import { useRef } from "react";
import { SCWidget, SCWidgetRef } from "soundcloud-widget-react";

export default function Player() {
  const playerRef = useRef<SCWidgetRef>(null);

  return (
    <>
      <SCWidget ref={playerRef} url="https://soundcloud.com/artist/track" />
      <button onClick={() => playerRef.current?.play()}>Play</button>
      <button onClick={async () => {
        const duration = await playerRef.current?.getDurationAsync() ?? 0;
        console.log("Duration:", duration, "ms");
      }}>Log Duration</button>
    </>
  );
}
```

### Imperative controls

| Method | Description |
|--------|-------------|
| `play()` | Start playback |
| `pause()` | Pause playback |
| `toggle()` | Toggle play/pause |
| `seekTo(ms: number)` | Seek to position in milliseconds |
| `setVolume(volume: number)` | Set volume (0–1) |
| `next()` | Skip to next track (playlist) |
| `prev()` | Go to previous track (playlist) |
| `skip(index: number)` | Jump to track at index (playlist) |
| `load(url, options?)` | Load a new URL; options extend `SCWidgetParams` + optional `callback` |

### Callback-style getters

| Method | Description |
|--------|-------------|
| `getDuration(cb)` | Get track duration in ms |
| `getPosition(cb)` | Get current position in ms |
| `getVolume(cb)` | Get current volume (0–1) |
| `getSounds(cb)` | Get all sounds in playlist |
| `getCurrentSound(cb)` | Get currently playing sound object |
| `getCurrentSoundIndex(cb)` | Get index of current sound |
| `isPaused(cb)` | Check if paused |

### Promise-based getters (new in v2)

| Method | Returns | Description |
|--------|---------|-------------|
| `getDurationAsync()` | `Promise<number>` | Track duration in ms |
| `getPositionAsync()` | `Promise<number>` | Current position in ms |
| `getVolumeAsync()` | `Promise<number>` | Current volume (0–1) |
| `getSoundsAsync()` | `Promise<SCSound[]>` | All sounds in playlist |
| `getCurrentSoundAsync()` | `Promise<SCSound>` | Current sound (rejects if none) |
| `getCurrentSoundIndexAsync()` | `Promise<number>` | Index of current sound |
| `isPausedAsync()` | `Promise<boolean>` | Whether playback is paused |

---

## SCWidgetEvents Enum

Use the `SCWidgetEvents` enum for type-safe event names:

```ts
import { SCWidgetEvents } from "soundcloud-widget-react";

// SCWidgetEvents.READY         = "ready"
// SCWidgetEvents.PLAY          = "play"
// SCWidgetEvents.PAUSE         = "pause"
// SCWidgetEvents.FINISH        = "finish"
// SCWidgetEvents.SEEK          = "seek"
// SCWidgetEvents.PLAY_PROGRESS = "play_progress"
// SCWidgetEvents.LOAD_PROGRESS = "load_progress"
// SCWidgetEvents.CLICK_BUY     = "click_buy"
// SCWidgetEvents.CLICK_DOWNLOAD= "click_download"
// SCWidgetEvents.OPEN_SHARE_PANEL = "open_share_panel"
// SCWidgetEvents.ERROR         = "error"
```

---

## Generic `onEvent` Binding

`onEvent` lets you handle multiple events in one map, with full type inference per event. Named props (`onPlay`, `onPause`, …) and `onEvent` entries are called independently — you can use both at once:

```tsx
import { SCWidget, SCWidgetEvents } from "soundcloud-widget-react";

<SCWidget
  url="https://soundcloud.com/artist/track"
  onEvent={{
    [SCWidgetEvents.READY]: () => console.log("ready"),
    [SCWidgetEvents.PLAY]: (e) => console.log("play at", e.currentPosition),
    [SCWidgetEvents.PLAY_PROGRESS]: (e) => console.log("progress", e.relativePosition),
    [SCWidgetEvents.ERROR]: () => console.error("player error"),
  }}
/>
```

---

## `useSCWidget` Hook

`useSCWidget` gives you reactive state and imperative controls without managing refs manually:

```tsx
import { SCWidget, useSCWidget } from "soundcloud-widget-react";

export default function Player() {
  const { ref, state, props, controls } = useSCWidget();

  return (
    <div>
      <SCWidget
        ref={ref}
        url="https://soundcloud.com/artist/track"
        {...props}
      />

      <p>
        {state.isPlaying ? "Playing" : "Paused"} —{" "}
        {Math.round(state.positionMs / 1000)}s / {Math.round(state.durationMs / 1000)}s
      </p>
      {state.sound && <p>Now: {state.sound.title}</p>}

      <button onClick={controls.play}>Play</button>
      <button onClick={controls.pause}>Pause</button>
      <button onClick={controls.toggle}>Toggle</button>
      <button onClick={() => controls.seekTo(30_000)}>Seek to 0:30</button>
      <button onClick={() => controls.setVolume(0.5)}>50% volume</button>
    </div>
  );
}
```

### `SCWidgetState`

```ts
interface SCWidgetState {
  isReady: boolean;       // true after onReady fires
  isPlaying: boolean;     // updated on play/pause/finish
  positionMs: number;     // updated on play_progress
  durationMs: number;     // fetched on ready
  sound: SCSound | null;  // current track info, fetched on ready
  soundIndex: number;     // current track index in playlist
}
```

### `controls`

| Method | Description |
|--------|-------------|
| `play()` | Start playback |
| `pause()` | Pause playback |
| `toggle()` | Toggle play/pause |
| `seekTo(ms)` | Seek to millisecond position |
| `setVolume(v)` | Set volume (0–1) |
| `next()` | Skip to next track |
| `prev()` | Go to previous track |
| `skip(index)` | Jump to track index |
| `load(url, options?)` | Load a new URL |

---

## Hidden iframe / Controller-Only Pattern

Render an invisible player to control audio without any visible UI:

```tsx
import { SCWidget, useSCWidget } from "soundcloud-widget-react";

export default function InvisiblePlayer() {
  const { ref, state, props, controls } = useSCWidget();

  return (
    <div>
      {/* No visible player UI — audio only */}
      <SCWidget
        ref={ref}
        url="https://soundcloud.com/artist/track"
        hidden
        autoPlay
        {...props}
      />

      <button onClick={controls.toggle}>
        {state.isPlaying ? "Pause" : "Play"}
      </button>
      <span>{Math.round(state.positionMs / 1000)}s</span>
    </div>
  );
}
```

The hidden prop renders the iframe as a 1×1 invisible element. The `width`, `height`, `style`, and `className` props are ignored in this mode.

---

## SSR / Next.js

This component is **client-only** — it requires `window` and communicates via `postMessage`.

### Option A — Dynamic import (simplest)

```tsx
import dynamic from "next/dynamic";

const SCWidget = dynamic(
  () => import("soundcloud-widget-react").then((m) => m.SCWidget),
  { ssr: false }
);
```

### Option B — `next/script` with `beforeInteractive` (recommended for persistent players)

Load the SoundCloud API in your root layout so it's available before React hydration. The library detects `window.SC` already present and skips duplicate script injection:

```tsx
// app/layout.tsx
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Script
          strategy="beforeInteractive"
          src="https://w.soundcloud.com/player/api.js"
        />
      </body>
    </html>
  );
}
```

```tsx
// components/PlayerBar.tsx
"use client";
import { SCWidget } from "soundcloud-widget-react";

export function PlayerBar({ url }: { url: string }) {
  return <SCWidget url={url} height={166} width="100%" autoPlay />;
}
```

### CSP configuration

Add these directives to your Content Security Policy:

```
frame-src https://w.soundcloud.com;
script-src https://w.soundcloud.com;
```

---

## Known Limitations

**Instagram in-app browser** — The Instagram browser blocks `autoPlay` and prevents `play()` calls that aren't triggered directly by a user gesture. Show a visible play button as a fallback:

```tsx
const { ref, state, props, controls } = useSCWidget();

// Show a button until the user taps — don't call play() on mount
return (
  <>
    <SCWidget ref={ref} url={url} {...props} hidden />
    {!state.isPlaying && (
      <button onClick={controls.play}>Tap to play</button>
    )}
  </>
);
```

**CSP** — If your site has a restrictive CSP and the SoundCloud script fails to load, `SCWidget` will log the error to the console. Whitelist `https://w.soundcloud.com` in both `frame-src` and `script-src`.

---

## Comparison: soundcloud-widget-react vs react-soundcloud-widget

| Feature | soundcloud-widget-react v2 | react-soundcloud-widget |
|---------|---------------------------|------------------------|
| TypeScript | Full, strict | Partial / DefinitelyTyped |
| Promise-based getters | Yes (`getDurationAsync`, etc.) | No (callback only) |
| Generic `onEvent` map | Yes (`SCWidgetEvents` enum) | No |
| `useSCWidget` hook | Yes (reactive state + controls) | No |
| Hidden/controller-only mode | Yes (`hidden` prop) | No |
| Accessible iframe (`title`) | Yes | No |
| Next.js SSR safe | Yes (dynamic import + beforeInteractive) | Partial |
| Maintained (2026) | Yes | No (archived) |

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

MIT
