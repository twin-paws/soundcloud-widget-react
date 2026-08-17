import { describe, expect, it, vi } from "vitest";
import { buildLoadParams } from "../params";

describe("buildLoadParams", () => {
  it("translates camelCase to snake_case", () => {
    expect(buildLoadParams({ autoPlay: true, showUser: false, color: "ff5500" })).toEqual({
      auto_play: true,
      show_user: false,
      color: "ff5500",
    });
  });

  it("passes through official snake_case keys", () => {
    expect(buildLoadParams({ auto_play: true, show_artwork: false } as never)).toEqual({
      auto_play: true,
      show_artwork: false,
    });
  });

  it("prefers camelCase when both are present", () => {
    expect(buildLoadParams({ autoPlay: false, auto_play: true } as never)).toEqual({
      auto_play: false,
    });
  });

  it("attaches callback", () => {
    const callback = vi.fn();
    expect(buildLoadParams({ autoPlay: true }, callback)).toEqual({
      auto_play: true,
      callback,
    });
  });
});
