// Already-loaded path: window.SC exists before any widget mounts (e.g. Next.js
// <Script strategy="beforeInteractive">). No script tag may be injected.
import React from "react";
import { render, act } from "@testing-library/react";
import { expect, it } from "vitest";
import { SCWidget } from "../SCWidget";
import { installSC } from "./helpers";

it("detects pre-existing window.SC and skips script injection", async () => {
  const sc = installSC();
  render(<SCWidget url="https://soundcloud.com/artist/track" />);
  await act(async () => {});
  expect(
    document.querySelectorAll('script[src="https://w.soundcloud.com/player/api.js"]')
  ).toHaveLength(0);
  expect(sc.Widget).toHaveBeenCalledTimes(1);
});
