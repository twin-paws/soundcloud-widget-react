# AGENTS.md — soundcloud-widget-react

Instructions for AI coding agents using this package (v2.2.0).

## Setup

```bash
npm install soundcloud-widget-react
```

Peer deps: `react` and `react-dom` >= 17. Published files include `"use client"` — import directly from Next.js App Router client components.

React 17: auto iframe `id` uses a counter (no `useId`). That fallback is not SSR-stable — pass `iframeId` if you server-render on 17.

## Prefer `trackId`

```tsx
import { SCWidget } from "soundcloud-widget-react";

<SCWidget trackId={track.id} />
// or track.urn — "soundcloud:tracks:123" is stripped to 123
```

That embeds `https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/{id}` (official oEmbed resource).

- `playlistId` — same for playlists / `soundcloud:playlists:{id}`
- `url` — permalink, API resource, full player iframe `src`, or `getSoundCloudWidgetUrl()` fragment (normalized)
- If none of the three is set, the component renders **nothing** (does not throw)

Do **not** pass `getSoundCloudWidgetUrl()` as a required input — use `trackId`. If it is passed as `url`, it is decoded.

## Source / param changes

The iframe `src` is frozen at the first real source. Later `trackId` / `url` / player-param changes go through `widget.load()` only — no iframe remount.

## `load()` params are camelCase

`ref.load()`, `controls.load()`, and `onReady`'s `widget.load()` accept `SCWidgetParams` (`autoPlay`, `showUser`, …). They are translated to official snake_case (`auto_play`, `show_user`). Already-snake_case keys pass through.

`onReady` receives an adapted instance, not the raw `SC.Widget`.

## `useSCWidget`

```tsx
const { ref, state, props, controls } = useSCWidget();
<SCWidget ref={ref} trackId={id} {...props} />
```

The hook occupies named props `onReady` / `onPlay` / `onPause` / `onFinish` / `onSeek` / `onPlayProgress`. Add extra listeners via `onEvent` (additive).

`state.sound`, `durationMs`, and `soundIndex` refresh on READY **and PLAY** (playlist next/prev). `positionMs` updates on play_progress and seek.

Volume is **0–100**, not 0–1.

## Getters

Callback getters fire exactly once (widget value, or a default before init). Exception: `getCurrentSound(cb)` does **not** fire before init. `getCurrentSoundAsync()` rejects if there is no sound / widget not ready.

## Script loader

Singleton. Detects existing `window.SC` (e.g. Next.js `<Script strategy="beforeInteractive">`). First inject and existing-tag poll both time out at 10s and reset so a remount can retry. `SC.Widget()` throw retries a few times.

CSP: `frame-src https://w.soundcloud.com; script-src https://w.soundcloud.com;`

## oEmbed helpers (not needed for `<SCWidget>`)

`getOEmbed`, `iframeSrcFromOEmbedHtml`, `trackResourceUrl`, `playlistResourceUrl`, `resolveWidgetResource`, `normalizeWidgetUrl`, `embedId`.

## Related

- [soundcloud-api-ts](https://github.com/twin-paws/soundcloud-api-ts) — REST client; pass `track.id` or `track.urn` into `trackId`
- [soundcloud-api-ts-next](https://github.com/twin-paws/soundcloud-api-ts-next) — Next.js hooks + route handlers
