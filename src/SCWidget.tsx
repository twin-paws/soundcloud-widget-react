import React, {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useScript } from "./useScript";
import type {
  SCAudioEventPayload,
  SCSound,
  SCWidgetInstance,
  SCWidgetParams,
  SCWidgetProps,
  SCWidgetRef,
} from "./types";
import { SCWidgetEvents } from "./types";

declare global {
  interface Window {
    SC: {
      Widget: (iframe: HTMLIFrameElement) => SCWidgetInstance;
    };
  }
}

const PARAM_MAP: Array<[keyof SCWidgetParams, string]> = [
  ["autoPlay", "auto_play"],
  ["color", "color"],
  ["buying", "buying"],
  ["sharing", "sharing"],
  ["download", "download"],
  ["showArtwork", "show_artwork"],
  ["showPlaycount", "show_playcount"],
  ["showUser", "show_user"],
  ["startTrack", "start_track"],
  ["singleActive", "single_active"],
  ["showTeaser", "show_teaser"],
  ["visual", "visual"],
  ["liking", "liking"],
  ["showComments", "show_comments"],
  ["hideRelated", "hide_related"],
];

function buildIframeSrc(url: string, params: SCWidgetParams): string {
  const search = new URLSearchParams();
  search.set("url", url);

  for (const [prop, urlKey] of PARAM_MAP) {
    const value = params[prop];
    if (value !== undefined) {
      search.set(urlKey, String(value));
    }
  }

  return `https://w.soundcloud.com/player/?${search.toString()}`;
}

/**
 * Translate camelCase SCWidgetParams to the snake_case keys the SC Widget API
 * expects when calling widget.load(). PARAM_MAP is the single source of truth
 * for this mapping — same one used by buildIframeSrc for the initial iframe URL.
 */
function buildLoadParams(
  params: SCWidgetParams,
  callback?: () => void
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [prop, apiKey] of PARAM_MAP) {
    const value = params[prop];
    if (value !== undefined) {
      out[apiKey] = value;
    }
  }
  if (callback) out["callback"] = callback;
  return out;
}

function extractParams(props: SCWidgetProps): SCWidgetParams {
  return {
    autoPlay: props.autoPlay,
    color: props.color,
    buying: props.buying,
    sharing: props.sharing,
    download: props.download,
    showArtwork: props.showArtwork,
    showPlaycount: props.showPlaycount,
    showUser: props.showUser,
    startTrack: props.startTrack,
    singleActive: props.singleActive,
    showTeaser: props.showTeaser,
    visual: props.visual,
    liking: props.liking,
    showComments: props.showComments,
    hideRelated: props.hideRelated,
  };
}

export const SCWidget = forwardRef<SCWidgetRef, SCWidgetProps>(
  function SCWidget(props, ref) {
    const {
      url,
      width = "100%",
      height = 166,
      style,
      className,
      iframeId,
      onReady,
      onPlay,
      onPause,
      onFinish,
      onSeek,
      onPlayProgress,
      onLoadProgress,
      onError,
      onClickDownload,
      onClickBuy,
      onOpenSharePanel,
      onEvent,
      title,
      loading,
      allow,
      sandbox,
      referrerPolicy,
      hidden,
      ...params
    } = props;

    const { loaded, error } = useScript();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const widgetRef = useRef<SCWidgetInstance | null>(null);
    const initializedRef = useRef(false);
    const generatedId = useId();
    const frameId = iframeId ?? `sc-widget-${generatedId}`;

    // Log script load errors
    useEffect(() => {
      if (error) {
        console.error("[SCWidget] Failed to load SoundCloud Widget API:", error);
      }
    }, [error]);

    // Stable refs for callbacks so effects don't re-run on each render
    const callbacksRef = useRef({
      onReady,
      onPlay,
      onPause,
      onFinish,
      onSeek,
      onPlayProgress,
      onLoadProgress,
      onError,
      onClickDownload,
      onClickBuy,
      onOpenSharePanel,
      onEvent,
    });
    useEffect(() => {
      callbacksRef.current = {
        onReady,
        onPlay,
        onPause,
        onFinish,
        onSeek,
        onPlayProgress,
        onLoadProgress,
        onError,
        onClickDownload,
        onClickBuy,
        onOpenSharePanel,
        onEvent,
      };
    });

    // The iframe src is frozen at mount. Later url/param changes go through
    // widget.load() only — updating the src attribute would navigate the
    // iframe, so React would reload the player AND widget.load() would fire,
    // loading the track twice and dropping the postMessage session.
    const [initialSrc] = useState(() => buildIframeSrc(url, extractParams(props)));

    // Latest url/params for the init effect, which runs only when `loaded`
    // flips: if they changed between mount and script-ready, init must call
    // widget.load() because the frozen src still points at the mount-time url.
    const latestLoadRef = useRef({ url, params: extractParams(props) });
    useEffect(() => {
      latestLoadRef.current = { url, params: extractParams(props) };
    });

    // Initialize widget as soon as the SC API script is loaded and the iframe is in the DOM.
    // Params are baked into the iframe src URL so SC reads them correctly regardless of
    // when SC.Widget() is called. SC uses postMessage internally and emits READY when ready.
    // NOTE: We intentionally do NOT wait for the iframe load event — for cross-origin iframes
    // contentDocument is null so we can't check readyState, and the load event may have
    // already fired by the time this effect runs (cached remounts). SC.Widget() handles
    // its own readiness via the READY postMessage event.
    useEffect(() => {
      if (!loaded || !iframeRef.current || initializedRef.current) return;

      let cleanupFn: (() => void) | undefined;

      const initWidget = () => {
        if (!iframeRef.current || initializedRef.current) return;

        let widget: ReturnType<typeof window.SC.Widget>;
        try {
          widget = window.SC.Widget(iframeRef.current);
        } catch (err) {
          console.error("[SCWidget] SC.Widget() threw — SC API not ready?", err);
          return;
        }
        widgetRef.current = widget;
        initializedRef.current = true;

        const handlers: Array<[string, (e?: SCAudioEventPayload) => void]> = [
          [SCWidgetEvents.READY, () => {
            callbacksRef.current.onReady?.({ widget });
            callbacksRef.current.onEvent?.[SCWidgetEvents.READY]?.(undefined);
          }],
          [SCWidgetEvents.PLAY, (e) => {
            const payload = e as SCAudioEventPayload;
            callbacksRef.current.onPlay?.(payload);
            callbacksRef.current.onEvent?.[SCWidgetEvents.PLAY]?.(payload);
          }],
          [SCWidgetEvents.PAUSE, (e) => {
            const payload = e as SCAudioEventPayload;
            callbacksRef.current.onPause?.(payload);
            callbacksRef.current.onEvent?.[SCWidgetEvents.PAUSE]?.(payload);
          }],
          [SCWidgetEvents.FINISH, (e) => {
            const payload = e as SCAudioEventPayload;
            callbacksRef.current.onFinish?.(payload);
            callbacksRef.current.onEvent?.[SCWidgetEvents.FINISH]?.(payload);
          }],
          [SCWidgetEvents.SEEK, (e) => {
            const payload = e as SCAudioEventPayload;
            callbacksRef.current.onSeek?.(payload);
            callbacksRef.current.onEvent?.[SCWidgetEvents.SEEK]?.(payload);
          }],
          [SCWidgetEvents.PLAY_PROGRESS, (e) => {
            const payload = e as SCAudioEventPayload;
            callbacksRef.current.onPlayProgress?.(payload);
            callbacksRef.current.onEvent?.[SCWidgetEvents.PLAY_PROGRESS]?.(payload);
          }],
          [SCWidgetEvents.LOAD_PROGRESS, (e) => {
            const payload = e as SCAudioEventPayload;
            callbacksRef.current.onLoadProgress?.(payload);
            callbacksRef.current.onEvent?.[SCWidgetEvents.LOAD_PROGRESS]?.(payload);
          }],
          [SCWidgetEvents.ERROR, () => {
            callbacksRef.current.onError?.();
            callbacksRef.current.onEvent?.[SCWidgetEvents.ERROR]?.(undefined);
          }],
          [SCWidgetEvents.CLICK_DOWNLOAD, () => {
            callbacksRef.current.onClickDownload?.();
            callbacksRef.current.onEvent?.[SCWidgetEvents.CLICK_DOWNLOAD]?.(undefined);
          }],
          [SCWidgetEvents.CLICK_BUY, () => {
            callbacksRef.current.onClickBuy?.();
            callbacksRef.current.onEvent?.[SCWidgetEvents.CLICK_BUY]?.(undefined);
          }],
          [SCWidgetEvents.OPEN_SHARE_PANEL, () => {
            callbacksRef.current.onOpenSharePanel?.();
            callbacksRef.current.onEvent?.[SCWidgetEvents.OPEN_SHARE_PANEL]?.(undefined);
          }],
        ];

        for (const [event, handler] of handlers) {
          widget.bind(event, handler);
        }

        // If url/params changed between mount and script-ready, the frozen
        // iframe src is stale — catch up through the widget API.
        const latest = latestLoadRef.current;
        if (buildIframeSrc(latest.url, latest.params) !== initialSrc) {
          widget.load(
            latest.url,
            buildLoadParams(latest.params, () =>
              callbacksRef.current.onReady?.({ widget })
            )
          );
        }

        cleanupFn = () => {
          for (const [event] of handlers) {
            widget.unbind(event);
          }
          widgetRef.current = null;
          initializedRef.current = false;
        };
      };

      initWidget();

      return () => {
        try {
          cleanupFn?.();
        } catch (err) {
          console.warn("[SCWidget] cleanup error (SC API may have already cleaned up):", err);
          widgetRef.current = null;
          initializedRef.current = false;
        }
      };
    }, [loaded]);

    // Reload when url or params change (after initial mount)
    const isFirstRender = useRef(true);

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }

      // Not initialized yet: the init effect reads latestLoadRef and loads
      // the current url/params itself when the script arrives.
      if (!widgetRef.current) return;

      widgetRef.current.load(
        url,
        buildLoadParams(params, () =>
          callbacksRef.current.onReady?.({ widget: widgetRef.current! })
        )
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, params.autoPlay, params.color, params.buying, params.sharing,
        params.download, params.showArtwork, params.showPlaycount, params.showUser,
        params.startTrack, params.singleActive, params.showTeaser,
        params.visual, params.liking, params.showComments, params.hideRelated]);

    useImperativeHandle(ref, () => ({
      play: () => widgetRef.current?.play(),
      pause: () => widgetRef.current?.pause(),
      toggle: () => widgetRef.current?.toggle(),
      seekTo: (ms) => widgetRef.current?.seekTo(ms),
      setVolume: (vol) => widgetRef.current?.setVolume(vol),
      next: () => widgetRef.current?.next(),
      prev: () => widgetRef.current?.prev(),
      skip: (idx) => widgetRef.current?.skip(idx),
      load: (u, opts) => widgetRef.current?.load(u, opts),
      // Each getter must call cb exactly once: either via the widget, or with
      // a default when the widget doesn't exist yet. (`widget?.get(cb) ?? cb(0)`
      // would call cb twice — the widget methods return void/undefined.)
      getVolume: (cb) => { if (widgetRef.current) widgetRef.current.getVolume(cb); else cb(0); },
      getDuration: (cb) => { if (widgetRef.current) widgetRef.current.getDuration(cb); else cb(0); },
      getPosition: (cb) => { if (widgetRef.current) widgetRef.current.getPosition(cb); else cb(0); },
      getSounds: (cb) => { if (widgetRef.current) widgetRef.current.getSounds(cb); else cb([]); },
      getCurrentSound: (cb) => widgetRef.current?.getCurrentSound(cb),
      getCurrentSoundIndex: (cb) => { if (widgetRef.current) widgetRef.current.getCurrentSoundIndex(cb); else cb(0); },
      isPaused: (cb) => { if (widgetRef.current) widgetRef.current.isPaused(cb); else cb(true); },
      getDurationAsync: () => new Promise<number>((res) => {
        if (widgetRef.current) {
          widgetRef.current.getDuration(res);
        } else {
          res(0);
        }
      }),
      getPositionAsync: () => new Promise<number>((res) => {
        if (widgetRef.current) {
          widgetRef.current.getPosition(res);
        } else {
          res(0);
        }
      }),
      getVolumeAsync: () => new Promise<number>((res) => {
        if (widgetRef.current) {
          widgetRef.current.getVolume(res);
        } else {
          res(0);
        }
      }),
      getSoundsAsync: () => new Promise<SCSound[]>((res) => {
        if (widgetRef.current) {
          widgetRef.current.getSounds(res);
        } else {
          res([]);
        }
      }),
      getCurrentSoundAsync: () => new Promise<SCSound>((res, rej) => {
        if (widgetRef.current) {
          widgetRef.current.getCurrentSound((s) => s ? res(s) : rej(new Error("No sound")));
        } else {
          rej(new Error("Widget not ready"));
        }
      }),
      getCurrentSoundIndexAsync: () => new Promise<number>((res) => {
        if (widgetRef.current) {
          widgetRef.current.getCurrentSoundIndex(res);
        } else {
          res(0);
        }
      }),
      isPausedAsync: () => new Promise<boolean>((res) => {
        if (widgetRef.current) {
          widgetRef.current.isPaused(res);
        } else {
          res(true);
        }
      }),
    }));

    const src = initialSrc;
    const allowAttr = allow ?? "autoplay";

    if (hidden) {
      return (
        <iframe
          ref={iframeRef}
          id={frameId}
          src={src}
          title={title}
          loading={loading}
          allow={allowAttr}
          sandbox={sandbox}
          referrerPolicy={referrerPolicy}
          scrolling="no"
          frameBorder="no"
          style={{ position: "absolute", width: 1, height: 1, visibility: "hidden", pointerEvents: "none" }}
        />
      );
    }

    return (
      <iframe
        ref={iframeRef}
        id={frameId}
        src={src}
        width={width}
        height={height}
        style={style}
        className={className}
        title={title}
        loading={loading}
        allow={allowAttr}
        sandbox={sandbox}
        referrerPolicy={referrerPolicy}
        scrolling="no"
        frameBorder="no"
      />
    );
  }
);

SCWidget.displayName = "SCWidget";

export default SCWidget;
