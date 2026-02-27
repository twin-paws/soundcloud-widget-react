import { useState, useEffect } from "react";

const SC_API_URL = "https://w.soundcloud.com/player/api.js";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  // Already loaded (e.g. via Next.js <Script strategy="beforeInteractive">)
  if (typeof window !== "undefined" && window.SC) {
    scriptPromise = Promise.resolve();
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    // Script tag already in DOM but not yet executed — wait for it
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SC_API_URL}"]`
    );
    if (existing) {
      // Poll until window.SC appears (script is cached/in-flight)
      const interval = setInterval(() => {
        if (window.SC) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
      // Safety timeout after 10s
      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Timed out waiting for SoundCloud Widget API"));
      }, 10_000);
      return;
    }

    const script = document.createElement("script");
    script.src = SC_API_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load SoundCloud Widget API"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function useScript(): { loaded: boolean; error: Error | null } {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    loadScript()
      .then(() => {
        if (mounted) setLoaded(true);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { loaded, error };
}
