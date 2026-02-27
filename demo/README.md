# soundcloud-widget-react — Demo

A live Next.js demo showcasing every major feature of [soundcloud-widget-react](https://github.com/twin-paws/soundcloud-widget-react) v2.0.0.

## What it shows

| Section | Feature |
|---|---|
| 1. Custom Controls Player | `useSCWidget` hook — play/pause, seek bar, volume slider, track info |
| 2. Playlist Player | `controls.next` / `controls.prev` / `controls.skip`, track list |
| 3. Dark / Light Mode Toggle | `color` prop live update, theme switching |
| 4. Hidden iframe | `hidden` prop — no visible iframe, custom mini-player bar |
| 5. Live Event Log | `onPlay` / `onPause` / `onSeek` / `onPlayProgress` / `onFinish` callbacks |

## How to run

```bash
cd demo
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## How to build

```bash
cd demo
pnpm build
```
