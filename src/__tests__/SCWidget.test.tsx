// Widget lifecycle: window.SC is installed before each render, so useScript
// takes the already-loaded path and SC.Widget() is created on the first
// post-mount effect flush.
import React, { StrictMode, createRef } from "react";
import { render, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SCWidget } from "../SCWidget";
import { SCWidgetEvents } from "../types";
import type { SCWidgetRef, SCAudioEventPayload } from "../types";
import { installSC, type MockWidget } from "./helpers";

const URL = "https://soundcloud.com/artist/track";
const ALL_EVENTS = Object.values(SCWidgetEvents);

let sc: ReturnType<typeof installSC>;

beforeEach(() => {
  sc = installSC();
});

async function flush() {
  await act(async () => {});
}

function lastWidget(): MockWidget {
  expect(sc.created.length).toBeGreaterThan(0);
  return sc.created[sc.created.length - 1];
}

describe("widget initialization and event binding", () => {
  it("creates the widget and binds all 11 documented events", async () => {
    render(<SCWidget url={URL} />);
    await flush();
    expect(sc.Widget).toHaveBeenCalledTimes(1);
    const mock = lastWidget();
    expect(mock.boundEvents().sort()).toEqual([...ALL_EVENTS].sort());
  });

  it("unbinds every bound event on unmount", async () => {
    const { unmount } = render(<SCWidget url={URL} />);
    await flush();
    const mock = lastWidget();
    unmount();
    expect(mock.boundEvents()).toEqual([]);
    expect(mock.widget.unbind).toHaveBeenCalledTimes(ALL_EVENTS.length);
  });

  it("is StrictMode-safe: no leftover bindings after unmount", async () => {
    const { unmount } = render(
      <StrictMode>
        <SCWidget url={URL} />
      </StrictMode>
    );
    await flush();
    unmount();
    for (const mock of sc.created) {
      expect(mock.boundEvents()).toEqual([]);
    }
  });

  it("re-initializes cleanly on remount", async () => {
    const { unmount } = render(<SCWidget url={URL} />);
    await flush();
    unmount();
    render(<SCWidget url={URL} />);
    await flush();
    expect(sc.Widget).toHaveBeenCalledTimes(2);
    expect(lastWidget().boundEvents().sort()).toEqual([...ALL_EVENTS].sort());
  });
});

describe("event handlers", () => {
  it("calls both the named prop and the onEvent entry with the payload", async () => {
    const onPlay = vi.fn();
    const onEventPlay = vi.fn();
    render(
      <SCWidget
        url={URL}
        onPlay={onPlay}
        onEvent={{ [SCWidgetEvents.PLAY]: onEventPlay }}
      />
    );
    await flush();
    const payload: SCAudioEventPayload = {
      relativePosition: 0.5,
      loadProgress: 1,
      currentPosition: 60000,
    };
    lastWidget().emit(SCWidgetEvents.PLAY, payload);
    expect(onPlay).toHaveBeenCalledWith(payload);
    expect(onEventPlay).toHaveBeenCalledWith(payload);
  });

  it("passes the widget instance to onReady", async () => {
    const onReady = vi.fn();
    render(<SCWidget url={URL} onReady={onReady} />);
    await flush();
    lastWidget().emit(SCWidgetEvents.READY);
    expect(onReady).toHaveBeenCalledWith({ widget: lastWidget().widget });
  });

  it("uses the latest callback without re-binding (no stale closures)", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<SCWidget url={URL} onPlay={first} />);
    await flush();
    const mock = lastWidget();
    const bindCount = mock.widget.bind.mock.calls.length;
    rerender(<SCWidget url={URL} onPlay={second} />);
    await flush();
    expect(mock.widget.bind.mock.calls.length).toBe(bindCount);
    mock.emit(SCWidgetEvents.PLAY, { relativePosition: 0, loadProgress: 0, currentPosition: 0 });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe("url/param changes go through widget.load()", () => {
  it("calls widget.load with snake_case params when the url changes", async () => {
    const { rerender } = render(<SCWidget url={URL} autoPlay={false} />);
    await flush();
    const mock = lastWidget();
    rerender(<SCWidget url={`${URL}-2`} autoPlay={true} showTeaser={false} />);
    await flush();
    await waitFor(() => expect(mock.widget.load).toHaveBeenCalled());
    const calls = mock.widget.load.mock.calls;
    const [loadedUrl, opts] = calls[calls.length - 1];
    expect(loadedUrl).toBe(`${URL}-2`);
    expect(opts).toMatchObject({ auto_play: true, show_teaser: false });
    expect(opts).not.toHaveProperty("autoPlay");
    expect(opts).not.toHaveProperty("showTeaser");
  });

  it("calls widget.load when only a player param changes", async () => {
    const { rerender } = render(<SCWidget url={URL} color="ff5500" />);
    await flush();
    const mock = lastWidget();
    rerender(<SCWidget url={URL} color="00a99d" />);
    await flush();
    await waitFor(() =>
      expect(mock.widget.load).toHaveBeenCalledWith(
        URL,
        expect.objectContaining({ color: "00a99d" })
      )
    );
  });
});

describe("iframe rendering", () => {
  it("renders params into the iframe src as snake_case query params", async () => {
    const { container } = render(
      <SCWidget url={URL} autoPlay={true} hideRelated={true} color="ff5500" />
    );
    const iframe = container.querySelector("iframe")!;
    const src = new window.URL(iframe.getAttribute("src")!);
    expect(src.origin + src.pathname).toBe("https://w.soundcloud.com/player/");
    expect(src.searchParams.get("url")).toBe(URL);
    expect(src.searchParams.get("auto_play")).toBe("true");
    expect(src.searchParams.get("hide_related")).toBe("true");
    expect(src.searchParams.get("color")).toBe("ff5500");
  });

  it("applies width/height defaults and allow=autoplay", () => {
    const { container } = render(<SCWidget url={URL} />);
    const iframe = container.querySelector("iframe")!;
    expect(iframe.getAttribute("width")).toBe("100%");
    expect(iframe.getAttribute("height")).toBe("166");
    expect(iframe.getAttribute("allow")).toBe("autoplay");
  });

  it("hidden mode renders a 1x1 invisible iframe and ignores layout props", () => {
    const { container } = render(
      <SCWidget url={URL} hidden width={500} height={300} className="big" />
    );
    const iframe = container.querySelector("iframe")!;
    expect(iframe.getAttribute("width")).toBeNull();
    expect(iframe.getAttribute("class")).toBeNull();
    expect(iframe.style.visibility).toBe("hidden");
    expect(iframe.style.pointerEvents).toBe("none");
  });
});

describe("imperative ref API", () => {
  it("proxies control methods to the widget", async () => {
    const ref = createRef<SCWidgetRef>();
    render(<SCWidget ref={ref} url={URL} />);
    await flush();
    const mock = lastWidget();
    ref.current!.play();
    ref.current!.seekTo(5000);
    ref.current!.setVolume(80);
    ref.current!.skip(2);
    expect(mock.widget.play).toHaveBeenCalledTimes(1);
    expect(mock.widget.seekTo).toHaveBeenCalledWith(5000);
    expect(mock.widget.setVolume).toHaveBeenCalledWith(80);
    expect(mock.widget.skip).toHaveBeenCalledWith(2);
  });

  it("callback getters invoke the callback exactly once with the widget's value", async () => {
    const ref = createRef<SCWidgetRef>();
    render(<SCWidget ref={ref} url={URL} />);
    await flush();
    const volumeCb = vi.fn();
    const durationCb = vi.fn();
    const pausedCb = vi.fn();
    ref.current!.getVolume(volumeCb);
    ref.current!.getDuration(durationCb);
    ref.current!.isPaused(pausedCb);
    expect(volumeCb).toHaveBeenCalledTimes(1);
    expect(volumeCb).toHaveBeenCalledWith(42);
    expect(durationCb).toHaveBeenCalledTimes(1);
    expect(durationCb).toHaveBeenCalledWith(123456);
    expect(pausedCb).toHaveBeenCalledTimes(1);
    expect(pausedCb).toHaveBeenCalledWith(true);
  });

  it("callback getters fall back to defaults exactly once before the widget exists", () => {
    const ref = createRef<SCWidgetRef>();
    render(<SCWidget ref={ref} url={URL} />);
    const volumeCb = vi.fn();
    ref.current!.getVolume(volumeCb);
    expect(volumeCb).toHaveBeenCalledTimes(1);
    expect(volumeCb).toHaveBeenCalledWith(0);
  });

  it("resolves Promise getters with the widget's values", async () => {
    const ref = createRef<SCWidgetRef>();
    render(<SCWidget ref={ref} url={URL} />);
    await flush();
    await expect(ref.current!.getDurationAsync()).resolves.toBe(123456);
    await expect(ref.current!.getVolumeAsync()).resolves.toBe(42);
    await expect(ref.current!.isPausedAsync()).resolves.toBe(true);
    await expect(ref.current!.getCurrentSoundAsync()).resolves.toMatchObject({
      title: "Test Track",
    });
  });

  it("Promise getters resolve with defaults before the widget exists", async () => {
    // No flush: the widget has not been created yet.
    const ref = createRef<SCWidgetRef>();
    render(<SCWidget ref={ref} url={URL} />);
    await expect(ref.current!.getDurationAsync()).resolves.toBe(0);
    await expect(ref.current!.isPausedAsync()).resolves.toBe(true);
  });
});
