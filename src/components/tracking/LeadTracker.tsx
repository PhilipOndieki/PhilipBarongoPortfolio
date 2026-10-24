"use client";

import { useEffect } from "react";

const KEY = "lead-ref";
const SLUG = /^[a-z0-9-]{1,80}$/;

function send(slug: string, kind: "visit" | "contact") {
  const body = new Blob([JSON.stringify({ slug, kind })], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/t", body)) {
    void fetch("/api/t", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Storage blocked: tracking simply stays off.
  }
}

/**
 * Records a visit from a lead's link (?r=<slug>) once per session, and a tap on
 * the Contact link (data-track="contact"). Renders nothing.
 */
export function LeadTracker() {
  useEffect(() => {
    if (window.location.pathname.startsWith("/admin")) return;

    const r = new URLSearchParams(window.location.search).get("r");
    if (r && SLUG.test(r)) {
      if (read(KEY) !== r || read(`${KEY}-visit`) !== "1") {
        write(KEY, r);
        write(`${KEY}-visit`, "1");
        send(r, "visit");
      }
    }

    const onClick = (e: MouseEvent) => {
      const target =
        e.target instanceof Element ? e.target.closest('[data-track="contact"]') : null;
      const slug = read(KEY);
      if (target && slug && SLUG.test(slug)) send(slug, "contact");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
