// Poll-timeout path: a script tag for the SC API already exists in the DOM
// (e.g. injected by something else) but window.SC never appears. After the
// 10s safety timeout the loader must reject AND reset its singleton so a
// later mount can retry.
import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SCWidget } from "../SCWidget";
import { installSC } from "./helpers";

const SC_API_URL = "https://w.soundcloud.com/player/api.js";

beforeEach(() => {
  vi.useFakeTimers();
  const tag = document.createElement("script");
  tag.src = SC_API_URL;
  document.head.appendChild(tag);
});

afterEach(() => {
  vi.useRealTimers();
});

it("rejects after the 10s poll timeout and allows a retry on remount", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const { unmount } = render(<SCWidget url="https://soundcloud.com/artist/track" />);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(10_500);
  });
  expect(consoleError).toHaveBeenCalledWith(
    "[SCWidget] Failed to load SoundCloud Widget API:",
    expect.objectContaining({ message: "Timed out waiting for SoundCloud Widget API" })
  );
  unmount();

  // Retry: the API is available now; a fresh mount must succeed.
  vi.useRealTimers();
  const sc = installSC();
  render(<SCWidget url="https://soundcloud.com/artist/track" />);
  await waitFor(() => expect(sc.Widget).toHaveBeenCalledTimes(1));
  consoleError.mockRestore();
});
