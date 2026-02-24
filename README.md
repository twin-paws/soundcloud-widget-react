# soundcloud-widget-react

React component library that wraps the [SoundCloud HTML5 Widget API](https://developers.soundcloud.com/docs/api/html5-widget) with full TypeScript support.

## Install

```bash
npm install soundcloud-widget-react
# or
pnpm add soundcloud-widget-react
# or
yarn add soundcloud-widget-react
```

Peer dependencies: `react` and `react-dom` >= 17.

## Basic Usage

```tsx
import { SCWidget } from "soundcloud-widget-react";

export default function App() {
  return (
    <SCWidget
      url="https://soundcloud.com/artist/track"
      autoPlay={false}
      showArtwork={true}
      onReady={() => console.log("Widget ready")}
      onPlay={(e) => console.log("Playing at", e.currentPosition)}
      onFinish={() => console.log("Track finished")}
    />
  );
}
```

## Ref Usage

Access the player programmatically via a ref:

```tsx
import { useRef } from "react";
import { SCWidget, SCWidgetRef } from "soundcloud-widget-react";

export default function Player() {
  const playerRef = useRef<SCWidgetRef>(null);

  const handlePlay = () => playerRef.current?.play();
  const handleSeek = () => playerRef.current?.seekTo(30000); // 30 seconds

  const handleGetDuration = () => {
    playerRef.current?.getDuration((duration) => {
      console.log("Duration (ms):", duration);
    });
  };

  return (
    <>
      <SCWidget
        ref={playerRef}
        url="https://soundcloud.com/artist/track"
        height={166}
      />
      <button onClick={handlePlay}>Play</button>
      <button onClick={handleSeek}>Seek to 0:30</button>
      <button onClick={handleGetDuration}>Log Duration</button>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | `string` | **required** | SoundCloud track, playlist, or user URL |
| `width` | `string \| number` | `"100%"` | iframe width |
| `height` | `string \| number` | `166` | iframe height |
| `style` | `CSSProperties` | — | Inline styles for the iframe |
| `className` | `string` | — | CSS class for the iframe |
| `iframeId` | `string` | auto-generated | `id` attribute for the iframe |
| `autoPlay` | `boolean` | — | Start playing automatically |
| `color` | `string` | — | Player color (hex, e.g. `"ff5500"`) |
| `buying` | `boolean` | — | Show buy button |
| `sharing` | `boolean` | — | Show share button |
| `download` | `boolean` | — | Show download button |
| `showArtwork` | `boolean` | — | Show artwork |
| `showPlaycount` | `boolean` | — | Show play count |
| `showUser` | `boolean` | — | Show user info |
| `startTrack` | `number` | — | Index of track to start on (for playlists) |
| `singleActive` | `boolean` | — | Pause other widgets when this one plays |
| `showTeaser` | `boolean` | — | Show teaser |
| `onReady` | `() => void` | — | Fired when widget is ready |
| `onPlay` | `(e: SCAudioEventPayload) => void` | — | Fired on play |
| `onPause` | `(e: SCAudioEventPayload) => void` | — | Fired on pause |
| `onFinish` | `(e: SCAudioEventPayload) => void` | — | Fired when track finishes |
| `onSeek` | `(e: SCAudioEventPayload) => void` | — | Fired on seek |
| `onPlayProgress` | `(e: SCAudioEventPayload) => void` | — | Fired during playback progress |
| `onLoadProgress` | `(e: SCAudioEventPayload) => void` | — | Fired during load progress |
| `onError` | `() => void` | — | Fired on error |
| `onClickDownload` | `() => void` | — | Fired when download button clicked |
| `onClickBuy` | `() => void` | — | Fired when buy button clicked |
| `onOpenSharePanel` | `() => void` | — | Fired when share panel opens |

### SCAudioEventPayload

```ts
interface SCAudioEventPayload {
  relativePosition: number;  // 0–1
  loadProgress: number;      // 0–1
  currentPosition: number;   // milliseconds
}
```

## Ref Methods

Attach a `ref` to `<SCWidget>` and call these methods imperatively:

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
| `load(url, options?)` | Load a new URL; options may include any `SCWidgetParams` plus `callback` |
| `getVolume(cb)` | Async get current volume |
| `getDuration(cb)` | Async get track duration in ms |
| `getPosition(cb)` | Async get current position in ms |
| `getSounds(cb)` | Async get all sounds in playlist |
| `getCurrentSound(cb)` | Async get currently playing sound |
| `getCurrentSoundIndex(cb)` | Async get index of current sound |
| `isPaused(cb)` | Async check if paused |

## SSR / Next.js

This component is **client-only** — it uses an `<iframe>` and communicates via `postMessage`.

### Option A — Dynamic import (simplest)

```tsx
import dynamic from "next/dynamic";

const SCWidget = dynamic(
  () => import("soundcloud-widget-react").then((m) => m.SCWidget),
  { ssr: false }
);
```

### Option B — `<Script strategy="beforeInteractive">` (recommended for persistent players)

Load the SoundCloud API globally in your root layout and render `<SCWidget>` directly inside a `"use client"` component. The library detects that `window.SC` is already available and skips redundant script injection:

```tsx
// app/layout.tsx (Next.js App Router)
import Script from "next/script";

export default function RootLayout({ children }) {
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

> **Note (v1.0.7+):** If the SC API script is already in the DOM (e.g. via `beforeInteractive`), `useScript` resolves immediately instead of injecting a duplicate `<script>` tag. Earlier versions would silently fail and crash on unmount in this scenario.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## License

MIT
