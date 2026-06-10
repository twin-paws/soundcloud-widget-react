// Script load failure path: the error is surfaced via console.error and the
// singleton promise is reset so a later mount can retry.
import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SCWidget } from "../SCWidget";
import { installSC } from "./helpers";

const SC_API_URL = "https://w.soundcloud.com/player/api.js";

it("surfaces script load failure and allows a retry on remount", async () => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  const { unmount } = render(<SCWidget url="https://soundcloud.com/artist/track" />);
  await act(async () => {});

  const script = document.querySelector(`script[src="${SC_API_URL}"]`)!;
  await act(async () => {
    script.dispatchEvent(new Event("error"));
  });
  await waitFor(() =>
    expect(consoleError).toHaveBeenCalledWith(
      "[SCWidget] Failed to load SoundCloud Widget API:",
      expect.any(Error)
    )
  );
  unmount();
  script.remove();

  // Retry: the API is now available (e.g. network recovered, loaded elsewhere).
  const sc = installSC();
  render(<SCWidget url="https://soundcloud.com/artist/track" />);
  await waitFor(() => expect(sc.Widget).toHaveBeenCalledTimes(1));
  consoleError.mockRestore();
});
