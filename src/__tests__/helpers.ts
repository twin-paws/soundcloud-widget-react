import { vi } from "vitest";
import type { SCSound } from "../types";

export const sound: SCSound = {
  id: 1,
  title: "Test Track",
  permalink_url: "https://soundcloud.com/artist/track",
  artwork_url: null,
  user: { username: "artist", permalink_url: "https://soundcloud.com/artist" },
  duration: 123456,
};

export function createMockWidget() {
  const listeners = new Map<string, Array<(e?: unknown) => void>>();
  const widget = {
    bind: vi.fn((event: string, listener: (e?: unknown) => void) => {
      const arr = listeners.get(event) ?? [];
      arr.push(listener);
      listeners.set(event, arr);
    }),
    unbind: vi.fn((event: string) => {
      listeners.delete(event);
    }),
    load: vi.fn(),
    play: vi.fn(),
    pause: vi.fn(),
    toggle: vi.fn(),
    seekTo: vi.fn(),
    setVolume: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    skip: vi.fn(),
    getVolume: vi.fn((cb: (v: number) => void) => cb(42)),
    getDuration: vi.fn((cb: (d: number) => void) => cb(123456)),
    getPosition: vi.fn((cb: (p: number) => void) => cb(1000)),
    getSounds: vi.fn((cb: (s: SCSound[]) => void) => cb([sound])),
    getCurrentSound: vi.fn((cb: (s: SCSound) => void) => cb(sound)),
    getCurrentSoundIndex: vi.fn((cb: (i: number) => void) => cb(0)),
    isPaused: vi.fn((cb: (p: boolean) => void) => cb(true)),
  };
  return {
    widget,
    emit(event: string, payload?: unknown) {
      for (const l of [...(listeners.get(event) ?? [])]) l(payload);
    },
    boundEvents: () => [...listeners.keys()],
  };
}

export type MockWidget = ReturnType<typeof createMockWidget>;

/** Installs window.SC with a Widget factory that records every created mock. */
export function installSC() {
  const created: MockWidget[] = [];
  const Widget = vi.fn(() => {
    const mock = createMockWidget();
    created.push(mock);
    return mock.widget;
  });
  (window as unknown as { SC: unknown }).SC = { Widget };
  return { Widget, created };
}
