import type { CSSProperties, HTMLAttributeReferrerPolicy } from "react";

export enum SCWidgetEvents {
  READY = "ready",
  PLAY = "play",
  PAUSE = "pause",
  FINISH = "finish",
  SEEK = "seek",
  PLAY_PROGRESS = "play_progress",
  LOAD_PROGRESS = "load_progress",
  CLICK_BUY = "click_buy",
  CLICK_DOWNLOAD = "click_download",
  OPEN_SHARE_PANEL = "open_share_panel",
  ERROR = "error",
}

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
  visual?: boolean;
  liking?: boolean;
  showComments?: boolean;
  hideRelated?: boolean;
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

export type SCWidgetEventMap = {
  [SCWidgetEvents.READY]: undefined;
  [SCWidgetEvents.PLAY]: SCAudioEventPayload;
  [SCWidgetEvents.PAUSE]: SCAudioEventPayload;
  [SCWidgetEvents.FINISH]: SCAudioEventPayload;
  [SCWidgetEvents.SEEK]: SCAudioEventPayload;
  [SCWidgetEvents.PLAY_PROGRESS]: SCAudioEventPayload;
  [SCWidgetEvents.LOAD_PROGRESS]: SCAudioEventPayload;
  [SCWidgetEvents.CLICK_BUY]: undefined;
  [SCWidgetEvents.CLICK_DOWNLOAD]: undefined;
  [SCWidgetEvents.OPEN_SHARE_PANEL]: undefined;
  [SCWidgetEvents.ERROR]: undefined;
};

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
  getDurationAsync(): Promise<number>;
  getPositionAsync(): Promise<number>;
  getVolumeAsync(): Promise<number>;
  getSoundsAsync(): Promise<SCSound[]>;
  getCurrentSoundAsync(): Promise<SCSound>;
  getCurrentSoundIndexAsync(): Promise<number>;
  isPausedAsync(): Promise<boolean>;
}

export interface SCWidgetProps extends SCWidgetParams {
  url: string;
  width?: string | number;
  height?: string | number;
  style?: CSSProperties;
  className?: string;
  iframeId?: string;
  onReady?: (ctx: { widget: SCWidgetInstance }) => void;
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
  onEvent?: { [K in SCWidgetEvents]?: (payload: SCWidgetEventMap[K]) => void };
  title?: string;
  loading?: "eager" | "lazy";
  allow?: string;
  sandbox?: string;
  referrerPolicy?: HTMLAttributeReferrerPolicy;
  hidden?: boolean;
}

export interface SCWidgetState {
  isReady: boolean;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  sound: SCSound | null;
  soundIndex: number;
}
