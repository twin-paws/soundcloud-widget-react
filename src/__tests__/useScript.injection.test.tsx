// Script injection path. This file must not install window.SC up front —
// the module-level scriptPromise in useScript.ts is shared, so all tests in
// this file run against the same loader state, in order.
import React from "react";
import { render, act, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { SCWidget } from "../SCWidget";
import { createMockWidget } from "./helpers";

const SC_API_URL = "https://w.soundcloud.com/player/api.js";
const URL = "https://soundcloud.com/artist/track";

function scriptTags() {
  return document.querySelectorAll(`script[src="${SC_API_URL}"]`);
}

it("two widgets on one page inject exactly one script tag", async () => {
  const Widget = vi.fn(() => createMockWidget().widget);
  render(
    <>
      <SCWidget url={URL} />
      <SCWidget url={`${URL}-2`} />
    </>
  );
  await act(async () => {});
  expect(scriptTags()).toHaveLength(1);

  // Simulate the script arriving: SC appears, then the load event fires.
  (window as unknown as { SC: unknown }).SC = { Widget };
  scriptTags()[0].dispatchEvent(new Event("load"));
  await waitFor(() => expect(Widget).toHaveBeenCalledTimes(2));
});

it("a widget mounted after the script resolved injects nothing and inits immediately", async () => {
  const before = scriptTags().length;
  render(<SCWidget url={`${URL}-3`} />);
  await act(async () => {});
  expect(scriptTags()).toHaveLength(before);
  const SC = (window as unknown as { SC: { Widget: ReturnType<typeof vi.fn> } }).SC;
  expect(SC.Widget).toHaveBeenCalledTimes(3);
});
