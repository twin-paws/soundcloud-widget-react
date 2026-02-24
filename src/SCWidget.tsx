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
  SCWidgetInstance,
  SCWidgetParams,
  SCWidgetProps,
  SCWidgetRef,
} from "./types";

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
      ...params
    } = props;

    const { loaded } = useScript();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const widgetRef = useRef<SCWidgetInstance | null>(null);
    const initializedRef = useRef(false);
    const generatedId = useId();
    const frameId = iframeId ?? `sc-widget-${generatedId}`;

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
      };
    });

    // Initialize widget once script is loaded and iframe is mounted
    useEffect(() => {
      if (!loaded || !iframeRef.current || initializedRef.current) return;

      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      initializedRef.current = true;

      const handlers: Array<[string, (e?: SCAudioEventPayload) => void]> = [
        ["ready", () => callbacksRef.current.onReady?.()],
        ["play", (e) => callbacksRef.current.onPlay?.(e as SCAudioEventPayload)],
        ["pause", (e) => callbacksRef.current.onPause?.(e as SCAudioEventPayload)],
        ["finish", (e) => callbacksRef.current.onFinish?.(e as SCAudioEventPayload)],
        ["seek", (e) => callbacksRef.current.onSeek?.(e as SCAudioEventPayload)],
        ["play_progress", (e) => callbacksRef.current.onPlayProgress?.(e as SCAudioEventPayload)],
        ["load_progress", (e) => callbacksRef.current.onLoadProgress?.(e as SCAudioEventPayload)],
        ["error", () => callbacksRef.current.onError?.()],
        ["click_download", () => callbacksRef.current.onClickDownload?.()],
        ["click_buy", () => callbacksRef.current.onClickBuy?.()],
        ["open_share_panel", () => callbacksRef.current.onOpenSharePanel?.()],
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
        callback: callbacksRef.current.onReady,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, params.autoPlay, params.color, params.buying, params.sharing,
        params.download, params.showArtwork, params.showPlaycount, params.showUser,
        params.startTrack, params.singleActive, params.showTeaser]);

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
    }));

    const src = buildIframeSrc(url, extractParams(props));

    return (
      <iframe
        ref={iframeRef}
        id={frameId}
        src={src}
        width={width}
        height={height}
        style={style}
        className={className}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
      />
    );
  }
);

SCWidget.displayName = "SCWidget";

export default SCWidget;
