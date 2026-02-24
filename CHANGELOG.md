# Changelog

All notable changes to `soundcloud-widget-react` are documented here.

---

## [1.0.7] — 2026-02-24

### Fixed
- **Script detection compatibility** — `useScript` now checks for an existing `window.SC` object before attempting to add another `<script>` tag. This fixes a bug where the widget would silently fail to initialize (and crash on unmount) when the SoundCloud Widget API had already been loaded via a framework script loader (e.g. Next.js `<Script strategy="beforeInteractive">`). A poll-based fallback handles the case where the script tag is already in the DOM but not yet executed.

---

## [1.0.6] — 2026-02-24

### Fixed
- Added `repository` field to `package.json` — required for npm provenance verification (`--provenance` flag). Without it, publishes would fail with a sigstore E422.

### CI
- Removed `registry-url` from `actions/setup-node` in publish workflow — it was overriding the GitHub OIDC token exchange needed for npm Trusted Publishing.

---

## [1.0.5] — 2026-02-24

### CI
- Test run for npm Trusted Publishing (OIDC) flow.

---

## [1.0.4] — 2026-02-24

### CI
- Removed stale `NPM_TOKEN` GitHub secret; switched to pure OIDC token path.

---

## [1.0.3] — 2026-02-24

### CI
- Re-added `registry-url` to diagnose OIDC auth issues (superseded by 1.0.6 fix).

---

## [1.0.2] — 2026-02-24

### CI
- Switched publish workflow to npm Trusted Publishing (`id-token: write`, `--provenance`).

---

## [1.0.1] — 2026-02-24

### Initial release
- `SCWidget` React component wrapping the SoundCloud HTML5 Widget API
- Full TypeScript types: `SCWidgetProps`, `SCWidgetRef`, `SCWidgetParams`, `SCAudioEventPayload`, `SCSound`, `SCWidgetInstance`
- `forwardRef` support with full imperative API (`play`, `pause`, `toggle`, `seekTo`, `setVolume`, `next`, `prev`, `skip`, `load`, `getVolume`, `getDuration`, `getPosition`, `getSounds`, `getCurrentSound`, `getCurrentSoundIndex`, `isPaused`)
- All Widget API events: `onReady`, `onPlay`, `onPause`, `onFinish`, `onSeek`, `onPlayProgress`, `onLoadProgress`, `onError`, `onClickDownload`, `onClickBuy`, `onOpenSharePanel`
- Stable callback refs — event handlers update without re-binding the widget
- URL/param change detection via `widget.load()` (no iframe remount)
- Dynamic script loading via `useScript` hook (singleton, deduped)
- ESM + CJS dual build, full `.d.ts` declarations
- MIT license
