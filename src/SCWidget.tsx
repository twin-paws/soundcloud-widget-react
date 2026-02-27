import React, {
  forwardRef,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
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

    // Initialize widget once script is loaded and iframe is mounted
    useEffect(() => {
      if (!loaded || !iframeRef.current || initializedRef.current) return;

      const widget = window.SC.Widget(iframeRef.current);
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

      return () => {
        for (const [event] of handlers) {
          widget.unbind(event);
        }
        widgetRef.current = null;
        initializedRef.current = false;
      };
    }, [loaded]);

    // Reload when url or params change (after initial mount)
    const isFirstRender = useRef(true);
    const prevUrl = useRef(url);
    const prevParams = useRef(params);

    useEffect(() => {
      if (isFirstRender.current) {
        isFirstRender.current = false;
        prevUrl.current = url;
        prevParams.current = params;
        return;
      }

      if (!widgetRef.current) return;

      prevUrl.current = url;
      prevParams.current = params;

      widgetRef.current.load(url, {
        ...params,
        callback: () => callbacksRef.current.onReady?.({ widget: widgetRef.current! }),
      });
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
      getVolume: (cb) => widgetRef.current?.getVolume(cb) ?? cb(0),
      getDuration: (cb) => widgetRef.current?.getDuration(cb) ?? cb(0),
      getPosition: (cb) => widgetRef.current?.getPosition(cb) ?? cb(0),
      getSounds: (cb) => widgetRef.current?.getSounds(cb) ?? cb([]),
      getCurrentSound: (cb) => widgetRef.current?.getCurrentSound(cb),
      getCurrentSoundIndex: (cb) => widgetRef.current?.getCurrentSoundIndex(cb) ?? cb(0),
      isPaused: (cb) => widgetRef.current?.isPaused(cb) ?? cb(true),
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

    const src = buildIframeSrc(url, extractParams(props));
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
