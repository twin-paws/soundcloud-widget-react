import { forwardRef, useRef, useId, useEffect, useImperativeHandle, useState, useCallback } from 'react';
import { jsx } from 'react/jsx-runtime';

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var SC_API_URL = "https://w.soundcloud.com/player/api.js";
var scriptPromise = null;
function loadScript() {
  if (scriptPromise) return scriptPromise;
  if (typeof window !== "undefined" && window.SC) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${SC_API_URL}"]`
    );
    if (existing) {
      const interval = setInterval(() => {
        if (window.SC) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Timed out waiting for SoundCloud Widget API"));
      }, 1e4);
      return;
    }
    const script = document.createElement("script");
    script.src = SC_API_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load SoundCloud Widget API"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
function useScript() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    loadScript().then(() => {
      if (mounted) setLoaded(true);
    }).catch((err) => {
      if (mounted) setError(err instanceof Error ? err : new Error(String(err)));
    });
    return () => {
      mounted = false;
    };
  }, []);
  return { loaded, error };
}

// src/types.ts
var SCWidgetEvents = /* @__PURE__ */ ((SCWidgetEvents2) => {
  SCWidgetEvents2["READY"] = "ready";
  SCWidgetEvents2["PLAY"] = "play";
  SCWidgetEvents2["PAUSE"] = "pause";
  SCWidgetEvents2["FINISH"] = "finish";
  SCWidgetEvents2["SEEK"] = "seek";
  SCWidgetEvents2["PLAY_PROGRESS"] = "play_progress";
  SCWidgetEvents2["LOAD_PROGRESS"] = "load_progress";
  SCWidgetEvents2["CLICK_BUY"] = "click_buy";
  SCWidgetEvents2["CLICK_DOWNLOAD"] = "click_download";
  SCWidgetEvents2["OPEN_SHARE_PANEL"] = "open_share_panel";
  SCWidgetEvents2["ERROR"] = "error";
  return SCWidgetEvents2;
})(SCWidgetEvents || {});
var PARAM_MAP = [
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
  ["hideRelated", "hide_related"]
];
function buildIframeSrc(url, params) {
  const search = new URLSearchParams();
  search.set("url", url);
  for (const [prop, urlKey] of PARAM_MAP) {
    const value = params[prop];
    if (value !== void 0) {
      search.set(urlKey, String(value));
    }
  }
  return `https://w.soundcloud.com/player/?${search.toString()}`;
}
function buildLoadParams(params, callback) {
  const out = {};
  for (const [prop, apiKey] of PARAM_MAP) {
    const value = params[prop];
    if (value !== void 0) {
      out[apiKey] = value;
    }
  }
  if (callback) out["callback"] = callback;
  return out;
}
function extractParams(props) {
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
    hideRelated: props.hideRelated
  };
}
var SCWidget = forwardRef(
  function SCWidget2(props, ref) {
    const _a = props, {
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
      hidden
    } = _a, params = __objRest(_a, [
      "url",
      "width",
      "height",
      "style",
      "className",
      "iframeId",
      "onReady",
      "onPlay",
      "onPause",
      "onFinish",
      "onSeek",
      "onPlayProgress",
      "onLoadProgress",
      "onError",
      "onClickDownload",
      "onClickBuy",
      "onOpenSharePanel",
      "onEvent",
      "title",
      "loading",
      "allow",
      "sandbox",
      "referrerPolicy",
      "hidden"
    ]);
    const { loaded, error } = useScript();
    const iframeRef = useRef(null);
    const widgetRef = useRef(null);
    const initializedRef = useRef(false);
    const generatedId = useId();
    const frameId = iframeId != null ? iframeId : `sc-widget-${generatedId}`;
    useEffect(() => {
      if (error) {
        console.error("[SCWidget] Failed to load SoundCloud Widget API:", error);
      }
    }, [error]);
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
      onEvent
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
        onEvent
      };
    });
    useEffect(() => {
      if (!loaded || !iframeRef.current || initializedRef.current) return;
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      initializedRef.current = true;
      const handlers = [
        ["ready" /* READY */, () => {
          var _a2, _b, _c, _d;
          (_b = (_a2 = callbacksRef.current).onReady) == null ? void 0 : _b.call(_a2, { widget });
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["ready" /* READY */]) == null ? void 0 : _d.call(_c, void 0);
        }],
        ["play" /* PLAY */, (e) => {
          var _a2, _b, _c, _d;
          const payload = e;
          (_b = (_a2 = callbacksRef.current).onPlay) == null ? void 0 : _b.call(_a2, payload);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["play" /* PLAY */]) == null ? void 0 : _d.call(_c, payload);
        }],
        ["pause" /* PAUSE */, (e) => {
          var _a2, _b, _c, _d;
          const payload = e;
          (_b = (_a2 = callbacksRef.current).onPause) == null ? void 0 : _b.call(_a2, payload);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["pause" /* PAUSE */]) == null ? void 0 : _d.call(_c, payload);
        }],
        ["finish" /* FINISH */, (e) => {
          var _a2, _b, _c, _d;
          const payload = e;
          (_b = (_a2 = callbacksRef.current).onFinish) == null ? void 0 : _b.call(_a2, payload);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["finish" /* FINISH */]) == null ? void 0 : _d.call(_c, payload);
        }],
        ["seek" /* SEEK */, (e) => {
          var _a2, _b, _c, _d;
          const payload = e;
          (_b = (_a2 = callbacksRef.current).onSeek) == null ? void 0 : _b.call(_a2, payload);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["seek" /* SEEK */]) == null ? void 0 : _d.call(_c, payload);
        }],
        ["play_progress" /* PLAY_PROGRESS */, (e) => {
          var _a2, _b, _c, _d;
          const payload = e;
          (_b = (_a2 = callbacksRef.current).onPlayProgress) == null ? void 0 : _b.call(_a2, payload);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["play_progress" /* PLAY_PROGRESS */]) == null ? void 0 : _d.call(_c, payload);
        }],
        ["load_progress" /* LOAD_PROGRESS */, (e) => {
          var _a2, _b, _c, _d;
          const payload = e;
          (_b = (_a2 = callbacksRef.current).onLoadProgress) == null ? void 0 : _b.call(_a2, payload);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["load_progress" /* LOAD_PROGRESS */]) == null ? void 0 : _d.call(_c, payload);
        }],
        ["error" /* ERROR */, () => {
          var _a2, _b, _c, _d;
          (_b = (_a2 = callbacksRef.current).onError) == null ? void 0 : _b.call(_a2);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["error" /* ERROR */]) == null ? void 0 : _d.call(_c, void 0);
        }],
        ["click_download" /* CLICK_DOWNLOAD */, () => {
          var _a2, _b, _c, _d;
          (_b = (_a2 = callbacksRef.current).onClickDownload) == null ? void 0 : _b.call(_a2);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["click_download" /* CLICK_DOWNLOAD */]) == null ? void 0 : _d.call(_c, void 0);
        }],
        ["click_buy" /* CLICK_BUY */, () => {
          var _a2, _b, _c, _d;
          (_b = (_a2 = callbacksRef.current).onClickBuy) == null ? void 0 : _b.call(_a2);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["click_buy" /* CLICK_BUY */]) == null ? void 0 : _d.call(_c, void 0);
        }],
        ["open_share_panel" /* OPEN_SHARE_PANEL */, () => {
          var _a2, _b, _c, _d;
          (_b = (_a2 = callbacksRef.current).onOpenSharePanel) == null ? void 0 : _b.call(_a2);
          (_d = (_c = callbacksRef.current.onEvent) == null ? void 0 : _c["open_share_panel" /* OPEN_SHARE_PANEL */]) == null ? void 0 : _d.call(_c, void 0);
        }]
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
      widgetRef.current.load(
        url,
        buildLoadParams(
          params,
          () => {
            var _a2, _b;
            return (_b = (_a2 = callbacksRef.current).onReady) == null ? void 0 : _b.call(_a2, { widget: widgetRef.current });
          }
        )
      );
    }, [
      url,
      params.autoPlay,
      params.color,
      params.buying,
      params.sharing,
      params.download,
      params.showArtwork,
      params.showPlaycount,
      params.showUser,
      params.startTrack,
      params.singleActive,
      params.showTeaser,
      params.visual,
      params.liking,
      params.showComments,
      params.hideRelated
    ]);
    useImperativeHandle(ref, () => ({
      play: () => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.play();
      },
      pause: () => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.pause();
      },
      toggle: () => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.toggle();
      },
      seekTo: (ms) => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.seekTo(ms);
      },
      setVolume: (vol) => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.setVolume(vol);
      },
      next: () => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.next();
      },
      prev: () => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.prev();
      },
      skip: (idx) => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.skip(idx);
      },
      load: (u, opts) => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.load(u, opts);
      },
      getVolume: (cb) => {
        var _a2, _b;
        return (_b = (_a2 = widgetRef.current) == null ? void 0 : _a2.getVolume(cb)) != null ? _b : cb(0);
      },
      getDuration: (cb) => {
        var _a2, _b;
        return (_b = (_a2 = widgetRef.current) == null ? void 0 : _a2.getDuration(cb)) != null ? _b : cb(0);
      },
      getPosition: (cb) => {
        var _a2, _b;
        return (_b = (_a2 = widgetRef.current) == null ? void 0 : _a2.getPosition(cb)) != null ? _b : cb(0);
      },
      getSounds: (cb) => {
        var _a2, _b;
        return (_b = (_a2 = widgetRef.current) == null ? void 0 : _a2.getSounds(cb)) != null ? _b : cb([]);
      },
      getCurrentSound: (cb) => {
        var _a2;
        return (_a2 = widgetRef.current) == null ? void 0 : _a2.getCurrentSound(cb);
      },
      getCurrentSoundIndex: (cb) => {
        var _a2, _b;
        return (_b = (_a2 = widgetRef.current) == null ? void 0 : _a2.getCurrentSoundIndex(cb)) != null ? _b : cb(0);
      },
      isPaused: (cb) => {
        var _a2, _b;
        return (_b = (_a2 = widgetRef.current) == null ? void 0 : _a2.isPaused(cb)) != null ? _b : cb(true);
      },
      getDurationAsync: () => new Promise((res) => {
        if (widgetRef.current) {
          widgetRef.current.getDuration(res);
        } else {
          res(0);
        }
      }),
      getPositionAsync: () => new Promise((res) => {
        if (widgetRef.current) {
          widgetRef.current.getPosition(res);
        } else {
          res(0);
        }
      }),
      getVolumeAsync: () => new Promise((res) => {
        if (widgetRef.current) {
          widgetRef.current.getVolume(res);
        } else {
          res(0);
        }
      }),
      getSoundsAsync: () => new Promise((res) => {
        if (widgetRef.current) {
          widgetRef.current.getSounds(res);
        } else {
          res([]);
        }
      }),
      getCurrentSoundAsync: () => new Promise((res, rej) => {
        if (widgetRef.current) {
          widgetRef.current.getCurrentSound((s) => s ? res(s) : rej(new Error("No sound")));
        } else {
          rej(new Error("Widget not ready"));
        }
      }),
      getCurrentSoundIndexAsync: () => new Promise((res) => {
        if (widgetRef.current) {
          widgetRef.current.getCurrentSoundIndex(res);
        } else {
          res(0);
        }
      }),
      isPausedAsync: () => new Promise((res) => {
        if (widgetRef.current) {
          widgetRef.current.isPaused(res);
        } else {
          res(true);
        }
      })
    }));
    const src = buildIframeSrc(url, extractParams(props));
    const allowAttr = allow != null ? allow : "autoplay";
    if (hidden) {
      return /* @__PURE__ */ jsx(
        "iframe",
        {
          ref: iframeRef,
          id: frameId,
          src,
          title,
          loading,
          allow: allowAttr,
          sandbox,
          referrerPolicy,
          scrolling: "no",
          frameBorder: "no",
          style: { position: "absolute", width: 1, height: 1, visibility: "hidden", pointerEvents: "none" }
        }
      );
    }
    return /* @__PURE__ */ jsx(
      "iframe",
      {
        ref: iframeRef,
        id: frameId,
        src,
        width,
        height,
        style,
        className,
        title,
        loading,
        allow: allowAttr,
        sandbox,
        referrerPolicy,
        scrolling: "no",
        frameBorder: "no"
      }
    );
  }
);
SCWidget.displayName = "SCWidget";
function useSCWidget() {
  const ref = useRef(null);
  const [state, setState] = useState({
    isReady: false,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
    sound: null,
    soundIndex: 0
  });
  const onReady = useCallback(async (_ctx) => {
    var _a, _b, _c, _d, _e, _f;
    const durationMs = (_b = await ((_a = ref.current) == null ? void 0 : _a.getDurationAsync())) != null ? _b : 0;
    const sound = (_d = await ((_c = ref.current) == null ? void 0 : _c.getCurrentSoundAsync().catch(() => null))) != null ? _d : null;
    const soundIndex = (_f = await ((_e = ref.current) == null ? void 0 : _e.getCurrentSoundIndexAsync())) != null ? _f : 0;
    setState((s) => __spreadProps(__spreadValues({}, s), { isReady: true, durationMs, sound, soundIndex }));
  }, []);
  const onPlay = useCallback(() => {
    setState((s) => __spreadProps(__spreadValues({}, s), { isPlaying: true }));
  }, []);
  const onPause = useCallback(() => {
    setState((s) => __spreadProps(__spreadValues({}, s), { isPlaying: false }));
  }, []);
  const onFinish = useCallback(() => {
    setState((s) => __spreadProps(__spreadValues({}, s), { isPlaying: false }));
  }, []);
  const onPlayProgress = useCallback((e) => {
    setState((s) => __spreadProps(__spreadValues({}, s), { positionMs: e.currentPosition }));
  }, []);
  const props = {
    onReady,
    onPlay,
    onPause,
    onFinish,
    onPlayProgress
  };
  const controls = {
    play: useCallback(() => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.play();
    }, []),
    pause: useCallback(() => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.pause();
    }, []),
    toggle: useCallback(() => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.toggle();
    }, []),
    seekTo: useCallback((ms) => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.seekTo(ms);
    }, []),
    setVolume: useCallback((v) => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.setVolume(v);
    }, []),
    next: useCallback(() => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.next();
    }, []),
    prev: useCallback(() => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.prev();
    }, []),
    skip: useCallback((i) => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.skip(i);
    }, []),
    load: useCallback((url, options) => {
      var _a;
      (_a = ref.current) == null ? void 0 : _a.load(url, options);
    }, [])
  };
  return { ref, state, props, controls };
}

export { SCWidget, SCWidgetEvents, SCWidget as default, useSCWidget };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map