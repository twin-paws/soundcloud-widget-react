/**
 * Official widget resource URL for a track — the same `url=` the oEmbed
 * iframe uses (`https://api.soundcloud.com/tracks/{id}`).
 * Accepts a numeric id or a `soundcloud:tracks:{id}` URN.
 */
export function trackResourceUrl(trackId: string | number): string {
  return `https://api.soundcloud.com/tracks/${embedId(trackId)}`;
}

/** Official widget resource URL for a playlist/set. Accepts id or URN. */
export function playlistResourceUrl(playlistId: string | number): string {
  return `https://api.soundcloud.com/playlists/${embedId(playlistId)}`;
}

/** `123`, `"123"`, or `"soundcloud:tracks:123"` → `"123"`. */
export function embedId(id: string | number): string {
  const raw = String(id).trim();
  const urn = raw.match(/^soundcloud:(?:tracks|playlists):(.+)$/i);
  return urn ? urn[1] : raw;
}

/**
 * Normalize a caller-supplied `url` into a resource the Widget API accepts.
 *
 * Handles:
 * - `getSoundCloudWidgetUrl()` fragments (`https%3A//api.soundcloud.com/tracks/123&…`)
 * - a full `w.soundcloud.com/player/?url=` iframe src
 * - an already-plain permalink or API resource
 */
export function normalizeWidgetUrl(url: string): string {
  let decoded = url;
  if (/%3A/i.test(url)) {
    try {
      decoded = decodeURIComponent(url);
    } catch {
      decoded = url;
    }
  }

  if (/w\.soundcloud\.com\/player/i.test(decoded)) {
    try {
      const parsed = new URL(decoded);
      const inner = parsed.searchParams.get("url");
      if (inner) return normalizeWidgetUrl(inner);
    } catch {
      /* fall through */
    }
  }

  // Fragment style: https://api.soundcloud.com/tracks/123&show_teaser=false
  // Do not strip `&` from page permalinks (`?in=set&si=`).
  if (/^https?:\/\/api\.soundcloud\.com\//i.test(decoded) && decoded.includes("&")) {
    return decoded.slice(0, decoded.indexOf("&"));
  }

  return decoded;
}

export interface WidgetSource {
  url?: string;
  trackId?: string | number;
  playlistId?: string | number;
}

/**
 * Resolve `trackId` / `playlistId` / `url` to the resource URL passed to
 * `w.soundcloud.com/player/?url=`.
 *
 * Returns `null` when nothing is set so `<SCWidget trackId={track?.id} />`
 * can wait instead of throwing during render.
 */
export function resolveWidgetResource(source: WidgetSource): string | null {
  if (source.trackId != null && source.trackId !== "") {
    return trackResourceUrl(source.trackId);
  }
  if (source.playlistId != null && source.playlistId !== "") {
    return playlistResourceUrl(source.playlistId);
  }
  if (source.url) {
    return normalizeWidgetUrl(source.url);
  }
  return null;
}

export interface SoundCloudOEmbed {
  version: number | string;
  type: string;
  provider_name: string;
  provider_url: string;
  height: number | string;
  width: number | string;
  title: string;
  description?: string;
  html: string;
  thumbnail_url?: string;
  author_name?: string;
  author_url?: string;
}

export interface OEmbedOptions {
  maxwidth?: number | string;
  maxheight?: number | string;
  color?: string;
  auto_play?: boolean;
  show_comments?: boolean;
}

/**
 * Fetch official oEmbed HTML for a SoundCloud page or API resource URL.
 * Use this when you want the iframe snippet; `<SCWidget trackId>` already
 * uses the same resource URL the embed would.
 *
 * @see https://developers.soundcloud.com/docs/oembed
 */
export async function getOEmbed(
  url: string,
  options?: OEmbedOptions,
  fetchImpl: typeof globalThis.fetch = fetch,
): Promise<SoundCloudOEmbed> {
  const params = new URLSearchParams({ format: "json", url });
  if (options?.maxwidth !== undefined) params.set("maxwidth", String(options.maxwidth));
  if (options?.maxheight !== undefined) params.set("maxheight", String(options.maxheight));
  if (options?.color) params.set("color", options.color);
  if (options?.auto_play !== undefined) params.set("auto_play", String(options.auto_play));
  if (options?.show_comments !== undefined) params.set("show_comments", String(options.show_comments));

  const res = await fetchImpl(`https://soundcloud.com/oembed?${params}`);
  if (!res.ok) {
    throw new Error(`oEmbed failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SoundCloudOEmbed;
}

/** Pull the player iframe `src` out of an oEmbed `html` string. */
export function iframeSrcFromOEmbedHtml(html: string): string | undefined {
  const match = html.match(/src=["']([^"']+)["']/i);
  return match?.[1];
}
