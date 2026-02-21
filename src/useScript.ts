import { useState, useEffect } from "react";

const SC_API_URL = "https://w.soundcloud.com/player/api.js";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
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

export function useScript(): { loaded: boolean } {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    loadScript()
      .then(() => setLoaded(true))
      .catch((err) => console.error(err));
  }, []);

  return { loaded };
}
