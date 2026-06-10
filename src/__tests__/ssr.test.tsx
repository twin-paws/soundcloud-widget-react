// @vitest-environment node
// SSR safety: rendering must never touch window/document. This runs in a bare
// Node environment — any unguarded browser-global access throws here.
import React from "react";
import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { SCWidget } from "../SCWidget";

it("renders to a string on the server without window or document", () => {
  expect(typeof window).toBe("undefined");
  expect(typeof document).toBe("undefined");
  const html = renderToString(
    <SCWidget
      url="https://soundcloud.com/artist/track"
      autoPlay={true}
      color="ff5500"
      title="player"
    />
  );
  expect(html).toContain("w.soundcloud.com/player");
  expect(html).toContain("auto_play=true");
  expect(html).toContain('title="player"');
});

it("renders the hidden variant on the server", () => {
  const html = renderToString(
    <SCWidget url="https://soundcloud.com/artist/track" hidden />
  );
  expect(html).toContain("visibility:hidden");
});
