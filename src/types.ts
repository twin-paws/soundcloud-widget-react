import type { CSSProperties } from "react";

export interface SCWidgetParams {
  autoPlay?: boolean;
  color?: string;
  buying?: boolean;
  sharing?: boolean;
  download?: boolean;
  showArtwork?: boolean;
  showPlaycount?: boolean;
  showUser?: boolean;
  startTrack?: number;
  singleActive?: boolean;
  showTeaser?: boolean;
}

export interface SCAudioEventPayload {
  relativePosition: number;
  loadProgress: number;
  currentPosition: number;
}

export interface SCSound {
  id: number;
  title: string;
  permalink_url: string;
  artwork_url: string | null;
  user: { username: string; permalink_url: string };
  duration: number;
}

export interface SCWidgetInstance {
  bind(eventName: string, listener: (e?: SCAudioEventPayload) => void): void;
  unbind(eventName: string): void;
  load(url: string, options?: Partial<SCWidgetParams> & { callback?: () => void }): void;
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(milliseconds: number): void;
  setVolume(volume: number): void;
  next(): void;
  prev(): void;
  skip(soundIndex: number): void;
  getVolume(callback: (volume: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
  getPosition(callback: (position: number) => void): void;
  getSounds(callback: (sounds: SCSound[]) => void): void;
  getCurrentSound(callback: (sound: SCSound) => void): void;
  getCurrentSoundIndex(callback: (index: number) => void): void;
  isPaused(callback: (paused: boolean) => void): void;
}

export interface SCWidgetRef {
  play(): void;
  pause(): void;
  toggle(): void;
  seekTo(milliseconds: number): void;
  setVolume(volume: number): void;
  next(): void;
  prev(): void;
  skip(soundIndex: number): void;
  load(url: string, options?: Partial<SCWidgetParams> & { callback?: () => void }): void;
  getVolume(callback: (volume: number) => void): void;
  getDuration(callback: (duration: number) => void): void;
  getPosition(callback: (position: number) => void): void;
  getSounds(callback: (sounds: SCSound[]) => void): void;
  getCurrentSound(callback: (sound: SCSound) => void): void;
  getCurrentSoundIndex(callback: (index: number) => void): void;
  isPaused(callback: (paused: boolean) => void): void;
}

export interface SCWidgetProps extends SCWidgetParams {
  url: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
  className?: string;
  iframeId?: string;
  onReady?: () => void;
  onPlay?: (e: SCAudioEventPayload) => void;
  onPause?: (e: SCAudioEventPayload) => void;
  onFinish?: (e: SCAudioEventPayload) => void;
  onSeek?: (e: SCAudioEventPayload) => void;
  onPlayProgress?: (e: SCAudioEventPayload) => void;
  onLoadProgress?: (e: SCAudioEventPayload) => void;
  onError?: () => void;
  onClickDownload?: () => void;
  onClickBuy?: () => void;
  onOpenSharePanel?: () => void;
}
