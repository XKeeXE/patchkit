import { useState, useEffect } from "react";

export const ROUTE_EVENT = "patchkit:routechange";

const PATCHED_FLAG = "__patchkitRoutePatched";

export function windowHistory() {
  if (typeof window === "undefined" || (window as any)[PATCHED_FLAG]) return;
  (window as any)[PATCHED_FLAG] = true;
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method].bind(history);
    history[method] = function (data, unused, url) {
      original(data, unused, url);
      window.dispatchEvent(new Event(ROUTE_EVENT));
    };
  }
}

export function createId(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useIsClient() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
}
