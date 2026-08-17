import type { SCWidgetParams, SCWidgetProps } from "./types";

export const PARAM_MAP: Array<[keyof SCWidgetParams, string]> = [
  ["autoPlay", "auto_play"],
  ["color", "color"],
  ["buying", "buying"],
  ["sharing", "sharing"],
  ["download", "download"],
  ["showArtwork", "show_artwork"],
  ["showPlaycount", "show_playcount"],
  ["showUser", "show_user"],
  ["startTrack", "start_track"],
  ["singleActive", "single_active"],
  ["showTeaser", "show_teaser"],
  ["visual", "visual"],
  ["liking", "liking"],
  ["showComments", "show_comments"],
  ["hideRelated", "hide_related"],
];

export type SCWidgetLoadOptions = Partial<SCWidgetParams> & { callback?: () => void };

/**
 * Translate camelCase {@link SCWidgetParams} to the snake_case keys the
 * Widget `load()` API expects. Already-snake_case official keys are passed
 * through so callers who copied SoundCloud's docs still work.
 */
export function buildLoadParams(
  options?: SCWidgetLoadOptions,
  callback?: () => void,
): Record<string, unknown> {
  const src = (options ?? {}) as SCWidgetLoadOptions & Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [prop, apiKey] of PARAM_MAP) {
    if (src[prop] !== undefined) {
      out[apiKey] = src[prop];
    } else if (src[apiKey] !== undefined) {
      out[apiKey] = src[apiKey];
    }
  }
  const cb = callback ?? src.callback;
  if (cb) out.callback = cb;
  return out;
}

export function extractParams(props: SCWidgetProps): SCWidgetParams {
  return {
    autoPlay: props.autoPlay,
    color: props.color,
    buying: props.buying,
    sharing: props.sharing,
    download: props.download,
    showArtwork: props.showArtwork,
    showPlaycount: props.showPlaycount,
    showUser: props.showUser,
    startTrack: props.startTrack,
    singleActive: props.singleActive,
    showTeaser: props.showTeaser,
    visual: props.visual,
    liking: props.liking,
    showComments: props.showComments,
    hideRelated: props.hideRelated,
  };
}

export function buildIframeSrc(url: string, params: SCWidgetParams): string {
  const search = new URLSearchParams();
  search.set("url", url);
  for (const [prop, urlKey] of PARAM_MAP) {
    const value = params[prop];
    if (value !== undefined) {
      search.set(urlKey, String(value));
    }
  }
  return `https://w.soundcloud.com/player/?${search.toString()}`;
}
