import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { SCAudioEventPayload, SCWidgetInstance, SCWidgetParams, SCWidgetProps, SCWidgetRef, SCWidgetState } from "./types";

interface UseSCWidgetResult {
  ref: React.RefObject<SCWidgetRef>;
  state: SCWidgetState;
  props: Pick<SCWidgetProps, "onReady" | "onPlay" | "onPause" | "onFinish" | "onSeek" | "onPlayProgress">;
  controls: {
    play(): void;
    pause(): void;
    toggle(): void;
    seekTo(ms: number): void;
    setVolume(v: number): void;
    next(): void;
    prev(): void;
    skip(index: number): void;
    load(url: string, options?: Partial<SCWidgetParams> & { callback?: () => void }): void;
  };
}

export function useSCWidget(): UseSCWidgetResult {
  const ref = useRef<SCWidgetRef>(null);
  const [state, setState] = useState<SCWidgetState>({
    isReady: false,
    isPlaying: false,
    positionMs: 0,
    durationMs: 0,
    sound: null,
    soundIndex: 0,
  });

  const refreshSound = useCallback(async (patch: Partial<SCWidgetState>) => {
    const durationMs = await ref.current?.getDurationAsync() ?? 0;
    const sound = await ref.current?.getCurrentSoundAsync().catch(() => null) ?? null;
    const soundIndex = await ref.current?.getCurrentSoundIndexAsync() ?? 0;
    setState((s) => ({ ...s, durationMs, sound, soundIndex, ...patch }));
  }, []);

  const onReady = useCallback(async (_ctx: { widget: SCWidgetInstance }) => {
    await refreshSound({ isReady: true });
  }, [refreshSound]);

  const onPlay = useCallback((e: SCAudioEventPayload) => {
    setState((s) => ({ ...s, isPlaying: true, positionMs: e.currentPosition }));
    void refreshSound({});
  }, [refreshSound]);

  const onPause = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const onFinish = useCallback(() => {
    setState((s) => ({ ...s, isPlaying: false }));
  }, []);

  const onSeek = useCallback((e: { currentPosition: number }) => {
    setState((s) => ({ ...s, positionMs: e.currentPosition }));
  }, []);

  const onPlayProgress = useCallback((e: { currentPosition: number }) => {
    setState((s) => ({ ...s, positionMs: e.currentPosition }));
  }, []);

  const props: UseSCWidgetResult["props"] = {
    onReady,
    onPlay,
    onPause,
    onFinish,
    onSeek,
    onPlayProgress,
  };

  const controls: UseSCWidgetResult["controls"] = {
    play: useCallback(() => { ref.current?.play(); }, []),
    pause: useCallback(() => { ref.current?.pause(); }, []),
    toggle: useCallback(() => { ref.current?.toggle(); }, []),
    seekTo: useCallback((ms: number) => { ref.current?.seekTo(ms); }, []),
    setVolume: useCallback((v: number) => { ref.current?.setVolume(v); }, []),
    next: useCallback(() => { ref.current?.next(); }, []),
    prev: useCallback(() => { ref.current?.prev(); }, []),
    skip: useCallback((i: number) => { ref.current?.skip(i); }, []),
    load: useCallback((url: string, options?: Partial<SCWidgetParams> & { callback?: () => void }) => {
      ref.current?.load(url, options);
    }, []),
  };

  return { ref, state, props, controls };
}
