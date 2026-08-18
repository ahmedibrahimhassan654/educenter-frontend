"use client";

import { useEffect } from "react";

/**
 * Registers the service worker that lets the app shell open offline. Registered
 * on window load so it never delays first paint.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration is best-effort; the app works without it.
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  return null;
}