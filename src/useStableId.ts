import * as React from "react";
import { useRef } from "react";

let fallbackIdCounter = 0;

/**
 * Counter-based id for React 17, where useId does not exist. Stable for the
 * lifetime of the component instance. Not SSR-stable: server and client
 * counters advance independently, so React 17 SSR users should pass an
 * explicit `iframeId` to avoid a hydration attribute mismatch.
 */
export function useFallbackId(): string {
  const idRef = useRef<string | null>(null);
  if (idRef.current === null) {
    idRef.current = `f${fallbackIdCounter++}`;
  }
  return idRef.current;
}

/**
 * React.useId on React 18+, counter fallback on React 17. Accessed off the
 * namespace import (not a named import) so the module still loads on React 17,
 * where a named `useId` import can fail at module-evaluation time.
 */
export const useStableId: () => string =
  (React as { useId?: () => string }).useId ?? useFallbackId;
