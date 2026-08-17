# Changelog

All notable changes to `soundcloud-widget-react` are documented here.

---

## [2.2.0] — 2026-08-17

### Added
- **`trackId` / `playlistId` props** — embed the official Widget resource (`https://api.soundcloud.com/tracks/{id}`), the same URL oEmbed puts in the iframe. Preferred when you already have an ID from `soundcloud-api-ts`.
- **`getOEmbed`**, `resolveWidgetResource`, `trackResourceUrl`, `playlistResourceUrl`, `embedId`, `iframeSrcFromOEmbedHtml` — oEmbed / resource helpers live here (not in the API client). Use `getOEmbed` when you want the official iframe HTML; `<SCWidget trackId>` already uses the same resource without a network hop.
- **`normalizeWidgetUrl`** — decodes `getSoundCloudWidgetUrl()` fragments, unwraps a full player iframe `src`, and leaves permalink query strings intact.

### Changed
- **`url` is optional** when `trackId` or `playlistId` is set. Recommended Next.js pattern is `<SCWidget trackId={track.id} />`, not `url={track.permalink_url}`. Missing source renders nothing (no throw) so `<SCWidget trackId={track?.id} />` can wait for data.

### Fixed
- **`ref.load()` / `controls.load()` / `onReady` `widget.load()` translate camelCase params** to the official snake_case keys (`autoPlay` → `auto_play`). Same silent-drop as 2.0.1 on the imperative path. Official snake_case keys still pass through.
- **`trackId` / `playlistId` accept URNs** (`soundcloud:tracks:123`) — previously concatenated into a broken resource URL.
- **`normalizeWidgetUrl`** no longer truncates permalink query strings at `&`; full `w.soundcloud.com/player/?url=` iframe srcs are unwrapped.
- **`useSCWidget` refreshes `sound` / `durationMs` / `soundIndex` on PLAY** so playlist next/prev is not stuck on the first track.
- **Script-inject timeout** — a hung first `<script>` insert now resets the singleton after 10s (the poll path already did).
- **`SC.Widget()` throw retries** a few times instead of leaving the iframe dead.

### Documentation

- README / AGENTS / llms / llms-full match the 2.2.0 surface: `trackId` / URN, adapted `load()`, missing-source render, PLAY metadata refresh, embed helpers. `llms.txt`, `llms-full.txt`, and `AGENTS.md` ship in the npm package.

---

## [2.1.0] — 2026-06-10

Audit release — see `docs/audit-2026-06.md` for the full report. All changes are non-breaking.

### Fixed
- **Iframe reloaded on url/param changes** — the iframe `src` was recomputed every render, so changing `url` or any player param navigated the iframe to a fresh player *and* called `widget.load()`, loading the track twice. The src is now frozen at mount; changes go through `widget.load()` exclusively (as the docs always claimed). Url/param changes that land before the API script is ready are applied at widget init.
- **Callback-style getters fired their callback twice** — `getVolume`/`getDuration`/`getPosition`/`getSounds`/`getCurrentSoundIndex`/`isPaused` invoked the callback immediately with a default (0/`[]`/`true`) and then again with the real value. Each now fires exactly once.
- **React 17 crash** — the component used `useId` (React 18+) while `peerDependencies` allow `react >=17`. Now shimmed with a counter fallback on 17. Caveat: the fallback is not SSR-stable — pass `iframeId` explicitly if you server-render on React 17.
- **Script loader could never retry after a poll timeout** — when a SoundCloud script tag existed but `window.SC` never appeared, the 10s timeout rejection was cached forever; every later widget mount failed. The singleton now resets on timeout (the error path already did).
- **`useSCWidget().ref` type** — was `RefObject<SCWidgetRef | null>`, which fails to typecheck against `<SCWidget ref={...}>` under `@types/react` 18 without a cast. Now `RefObject<SCWidgetRef>`.

### Added
- **`"use client"` shipped in dist** — both ESM and CJS output now carry the directive, so `SCWidget` can be imported directly from Next.js App Router code.
- **`useSCWidget` binds `onSeek`** — `state.positionMs` now updates when the user seeks while paused (previously only on the next `play_progress`).
- **Test suite + CI** — vitest/jsdom suite covering script-loader idempotency, event bind/unbind symmetry (incl. StrictMode), snake_case `load()` translation, SSR render safety, and the fixes above; GitHub Actions CI on Node 22/24. The publish workflow now runs tests before publishing.
- **LICENSE file** (the README badge previously pointed at a missing file).

### Docs
- `setVolume`/`getVolume` documented range corrected to the Widget API's **0–100** (was wrongly documented as 0–1; the demo already used 0–100).
- `showTeaser`/`visual`/`liking`/`showComments`/`hideRelated` marked as de-facto embed params not in SoundCloud's official Widget API parameter list.
- Clarified `url` must be a plain unencoded SoundCloud URL (not the pre-encoded output of `soundcloud-api-ts`'s `getSoundCloudWidgetUrl()`).
- README de-duplicated (the "Demo" section appeared 12 times); stale `Version: 2.0.0` headers in `llms.txt`/`llms-full.txt` corrected; this changelog backfilled for 2.0.1–2.0.4.

### CI / packaging
- pnpm pinned via `packageManager` (`pnpm/action-setup` no longer uses `version: latest`); `sideEffects: false`; `.npmrc` and `dist/` untracked (both were gitignored but still committed).

---

## [2.0.4] — 2026-03-01

### Fixed
- **Call `SC.Widget()` immediately** instead of deferring to the iframe `load` event (reverts the 2.0.2/2.0.3 approach). For cross-origin iframes the load event may already have fired (cached remounts) and `contentDocument` is inaccessible, so deferring could leave the widget uninitialized. The SC API handles its own readiness via the READY postMessage event.

---

## [2.0.3] — 2026-02-28

### Fixed
- Initialize the widget immediately if the iframe is already loaded on remount (the 2.0.2 deferral left remounted widgets waiting for a `load` event that never re-fired).

---

## [2.0.2] — 2026-02-28

### Fixed
- Defer `SC.Widget()` init until the iframe `load` event (superseded by 2.0.4).

---

## [2.0.1] — 2026-02-28

### Fixed
- **`widget.load()` silently ignored all player params** — the Widget API's `load()` accepts only snake_case options (`auto_play`, `show_user`, …), but raw camelCase props were spread into the call, so every customization was dropped on second-and-later track loads. `buildLoadParams()` now translates through the same `PARAM_MAP` used for the initial iframe URL.

---

## [2.0.0] — 2026-02-26

### Breaking Changes
- **`onReady` signature changed** — now receives `(ctx: { widget: SCWidgetInstance })` instead of `() => void`. Update: `onReady={() => ...}` → `onReady={({ widget }) => ...}`

### Added
- **`SCWidgetEvents` enum** — type-safe event name constants matching the official Widget API spec (`READY`, `PLAY`, `PAUSE`, `FINISH`, `SEEK`, `PLAY_PROGRESS`, `LOAD_PROGRESS`, `CLICK_BUY`, `CLICK_DOWNLOAD`, `OPEN_SHARE_PANEL`, `ERROR`)
- **`SCWidgetEventMap` type** — typed payload per event for use with `onEvent`
- **`onEvent` prop** — generic event handler map; bind any Widget API event without waiting for a named prop. Additive with named props (both are called)
- **Promise-based ref getters** — `getDurationAsync()`, `getPositionAsync()`, `getVolumeAsync()`, `getSoundsAsync()`, `getCurrentSoundAsync()`, `getCurrentSoundIndexAsync()`, `isPausedAsync()` alongside existing callback versions
- **`useSCWidget` hook** — returns `{ ref, state, props, controls }` for reactive state-driven UIs. Spread `props` onto `<SCWidget>` for zero-boilerplate event wiring. State: `isReady`, `isPlaying`, `positionMs`, `durationMs`, `sound`, `soundIndex`
- **New player params** — `visual`, `liking`, `showComments`, `hideRelated`
- **New iframe props** — `title` (a11y), `loading` ("eager"|"lazy"), `allow` (default `"autoplay"`), `sandbox`, `referrerPolicy`
- **`hidden` prop** — renders a 1×1 invisible iframe for controller-only / custom UI patterns; ignores layout props
- **`SCWidgetState` interface** — exported for use with `useSCWidget`
- **Script loader hardening** — `useScript` now returns `{ loaded, error }`; handles unmount-before-resolve via mounted flag; script errors surfaced to `console.error` on the component

---

## [1.0.8] — 2026-02-24

### Fixed
- **Double-encoded iframe URL** — `buildIframeSrc` was calling `encodeURIComponent(url)` before passing to `URLSearchParams.set()`, which encodes again. The SoundCloud player received a double-encoded URL and silently failed to load. Fixed by passing `url` directly.

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
