import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getOEmbed,
  iframeSrcFromOEmbedHtml,
  normalizeWidgetUrl,
  resolveWidgetResource,
  trackResourceUrl,
  playlistResourceUrl,
} from "../embed";

describe("resolveWidgetResource", () => {
  it("prefers trackId — official api.soundcloud.com resource", () => {
    expect(resolveWidgetResource({ trackId: 123, url: "https://soundcloud.com/a/b" })).toBe(
      "https://api.soundcloud.com/tracks/123",
    );
  });

  it("uses playlistId and strips a URN", () => {
    expect(resolveWidgetResource({ playlistId: "soundcloud:playlists:9" })).toBe(
      "https://api.soundcloud.com/playlists/9",
    );
  });

  it("strips a track URN", () => {
    expect(resolveWidgetResource({ trackId: "soundcloud:tracks:308946187" })).toBe(
      "https://api.soundcloud.com/tracks/308946187",
    );
  });

  it("passes a permalink through", () => {
    expect(resolveWidgetResource({ url: "https://soundcloud.com/artist/track" })).toBe(
      "https://soundcloud.com/artist/track",
    );
  });

  it("unwraps getSoundCloudWidgetUrl() pre-encoded fragments", () => {
    const fragment =
      "https%3A//api.soundcloud.com/tracks/456&show_teaser=false&color=%2300a99d";
    expect(normalizeWidgetUrl(fragment)).toBe("https://api.soundcloud.com/tracks/456");
    expect(resolveWidgetResource({ url: fragment })).toBe("https://api.soundcloud.com/tracks/456");
  });

  it("returns null when nothing is passed", () => {
    expect(resolveWidgetResource({})).toBeNull();
  });

  it("leaves a permalink query string intact", () => {
    const permalink = "https://soundcloud.com/artist/track?in=set/foo&si=abc";
    expect(normalizeWidgetUrl(permalink)).toBe(permalink);
  });

  it("pulls the resource out of a full player iframe src", () => {
    const src =
      "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293&color=ff5500";
    expect(normalizeWidgetUrl(src)).toBe("https://api.soundcloud.com/tracks/293");
  });
});

describe("resource URL helpers", () => {
  it("trackResourceUrl / playlistResourceUrl", () => {
    expect(trackResourceUrl(1)).toBe("https://api.soundcloud.com/tracks/1");
    expect(playlistResourceUrl(2)).toBe("https://api.soundcloud.com/playlists/2");
    expect(trackResourceUrl("soundcloud:tracks:7")).toBe("https://api.soundcloud.com/tracks/7");
  });
});

describe("getOEmbed", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches soundcloud.com/oembed", async () => {
    const html =
      '<iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/293"></iframe>';
    const fn = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        version: 1,
        type: "rich",
        provider_name: "SoundCloud",
        provider_url: "https://soundcloud.com",
        height: 81,
        width: "100%",
        title: "Flickermood",
        html,
      }),
    });
    globalThis.fetch = fn as unknown as typeof fetch;
    const r = await getOEmbed("https://soundcloud.com/forss/flickermood");
    expect(r.title).toBe("Flickermood");
    expect(fn.mock.calls[0][0]).toContain("https://soundcloud.com/oembed?");
    expect(iframeSrcFromOEmbedHtml(r.html)).toContain("w.soundcloud.com/player");
  });

  it("throws on non-ok", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    }) as unknown as typeof fetch;
    await expect(getOEmbed("https://soundcloud.com/nope")).rejects.toThrow("oEmbed failed: 404");
  });
});
