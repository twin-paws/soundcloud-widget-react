# soundcloud-widget-react

[![npm version](https://img.shields.io/npm/v/soundcloud-widget-react)](https://www.npmjs.com/package/soundcloud-widget-react)
[![npm downloads](https://img.shields.io/npm/dw/soundcloud-widget-react)](https://www.npmjs.com/package/soundcloud-widget-react)
[![license](https://img.shields.io/npm/l/soundcloud-widget-react)](https://github.com/twin-paws/soundcloud-widget-react/blob/main/LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/soundcloud-widget-react)](https://bundlephobia.com/package/soundcloud-widget-react)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

The definitive React wrapper for the [SoundCloud HTML5 Widget API](https://developers.soundcloud.com/docs/api/html5-widget) — TypeScript-native, Promise-based getters, reactive `useSCWidget` hook, SSR-safe, zero runtime dependencies.

---

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

## Why This Package?

The SoundCloud Widget API has been around for years, but most React wrappers for it were written before TypeScript was mainstream and before React hooks existed. The most popular alternative, [react-soundcloud-widget](https://github.com/troybetz/react-soundcloud-widget), has been effectively abandoned — no TypeScript, no hooks, no Promise-based getters, no SSR guidance. Developers reach for it because they find it first on npm, not because it's good.

`soundcloud-widget-react` is a ground-up TypeScript rewrite built for the way React is written today:

- **Full type coverage** matching the official Widget API spec — events, params, payloads, all of it
- **Promise-based getters** — `getDurationAsync()`, `getPositionAsync()`, etc. — instead of callback hell
- **`SCWidgetEvents` enum** so you never mistype an event name string
- **`useSCWidget` hook** for reactive state (`isPlaying`, `positionMs`, `durationMs`, `sound`) with zero boilerplate
- **SSR-safe** with explicit Next.js patterns and tested duplicate-script injection prevention
- **Accessible iframe attributes** (`title`, `loading`, `allow`, `sandbox`, `referrerPolicy`) that older wrappers never exposed
- **Hidden iframe / controller-only mode** for building fully custom audio UIs
- **Zero runtime dependencies**

---

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

## Comparison

| Feature | soundcloud-widget-react v2 | react-soundcloud-widget |
|---------|:-:|:-:|
| TypeScript | ✅ Full native | ⚠️ Partial / DefinitelyTyped |
| React version support | ✅ >= 17 | ⚠️ Old (no hook-era patterns) |
| Promise-based getters | ✅ Yes | ❌ No — callback only |
| `SCWidgetEvents` enum | ✅ Yes | ❌ No |
| Generic `onEvent` map | ✅ Yes | ❌ No |
| `useSCWidget` hook | ✅ Yes | ❌ No |
| Hidden / controller-only mode | ✅ Yes | ❌ No |
| Accessible iframe props | ✅ Yes | ❌ No |
| Next.js / SSR guidance | ✅ Yes | ❌ No |
| Duplicate script injection prevention | ✅ Yes | ❌ No |
| Maintained (2026) | ✅ Yes | ❌ No — last commit 2019 |
| Zero runtime dependencies | ✅ Yes | ✅ Yes |

---

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

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

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

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

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

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
| `onEvent` | `{ [K in SCWidgetEvents]?: (payload: SCWidgetEventMap[K]) => void }` | — | Generic per-event handlers (additive with named handlers) |

### SCAudioEventPayload

```ts
interface SCAudioEventPayload {
  relativePosition: number;  // 0–1
  loadProgress: number;      // 0–1
  currentPosition: number;   // milliseconds
}
```

---

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

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
      }}>
        Log Duration
      </button>
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

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

## SCWidgetEvents Enum

Use `SCWidgetEvents` for type-safe event names — no more string typos:

```ts
import { SCWidgetEvents } from "soundcloud-widget-react";

// SCWidgetEvents.READY            = "ready"
// SCWidgetEvents.PLAY             = "play"
// SCWidgetEvents.PAUSE            = "pause"
// SCWidgetEvents.FINISH           = "finish"
// SCWidgetEvents.SEEK             = "seek"
// SCWidgetEvents.PLAY_PROGRESS    = "play_progress"
// SCWidgetEvents.LOAD_PROGRESS    = "load_progress"
// SCWidgetEvents.CLICK_BUY        = "click_buy"
// SCWidgetEvents.CLICK_DOWNLOAD   = "click_download"
// SCWidgetEvents.OPEN_SHARE_PANEL = "open_share_panel"
// SCWidgetEvents.ERROR            = "error"
```

---

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

## Generic `onEvent` Binding

`onEvent` lets you handle multiple events in one map, with full type inference per event. Named props (`onPlay`, `onPause`, …) and `onEvent` entries are called independently — use both at once:

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

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

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
      {state.sound && <p>Now playing: {state.sound.title}</p>}

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

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

## Hidden iframe / Controller-Only Pattern

Render an invisible player to control audio without any visible UI — perfect for custom audio players, background music, or ambient audio:

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

The `hidden` prop renders the iframe as a 1×1 invisible element. The `width`, `height`, `style`, and `className` props are ignored in this mode.

---

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

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

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

## Known Limitations

**Instagram in-app browser** — The Instagram browser blocks `autoPlay` and prevents `play()` calls that aren't triggered directly by a user gesture. Show a visible play button as a fallback:

```tsx
const { ref, state, props, controls } = useSCWidget();

// Don't call play() on mount — wait for user interaction
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

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

## Related

This package is part of the **twin-paws SoundCloud ecosystem**:

| Package | Purpose |
|---------|---------|
| [soundcloud-api-ts](https://github.com/twin-paws/soundcloud-api-ts) | TypeScript-first SoundCloud REST API client — typed access to tracks, users, playlists, and OAuth |
| [soundcloud-api-ts-next](https://github.com/twin-paws/soundcloud-api-ts-next) | Next.js integration: React hooks, secure API routes, OAuth PKCE, RSC helpers |
| **soundcloud-widget-react** ← you are here | React component for the SoundCloud HTML5 Widget API — embed players and control playback programmatically |

**Common pattern** — combine all three in a Next.js app:

```tsx
// 1. Fetch track data server-side (soundcloud-api-ts-next)
import { getTrack } from "soundcloud-api-ts-next/server";
const track = await getTrack(trackId, config, { revalidate: 60 });

// 2. Render an embeddable player (soundcloud-widget-react)
import { SCWidget } from "soundcloud-widget-react";
<SCWidget url={track.permalink_url} onPlay={() => trackPlay(track.id)} />

// 3. React hooks for dynamic data (soundcloud-api-ts-next)
import { useTrack } from "soundcloud-api-ts-next";
const { data } = useTrack(trackId);
```

---

## Demo

Clone the repo and run the demo locally:

```bash
cd demo && pnpm install && pnpm dev
```

Or browse the [demo source](./demo) to see all features in action.

---

## Contributing

Issues and PRs welcome at [github.com/twin-paws/soundcloud-widget-react](https://github.com/twin-paws/soundcloud-widget-react).

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

MIT
