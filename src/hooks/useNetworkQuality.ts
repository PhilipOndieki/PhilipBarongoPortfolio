"use client";

import { useSyncExternalStore } from "react";

/** The parts of the Network Information API this site reads. */
interface NetworkInformationLike extends EventTarget {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

/**
 * "constrained": Save-Data is on or the connection is 2G. Never load video.
 * "ok": no constraint reported (or the API is unsupported).
 * "unknown": server render and hydration.
 */
export type NetworkQuality = "unknown" | "ok" | "constrained";

const SLOW_TYPES: ReadonlySet<string> = new Set(["slow-2g", "2g"]);

function getConnection(): NetworkInformationLike | undefined {
  return (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
}

function getSnapshot(): NetworkQuality {
  const connection = getConnection();
  if (!connection) return "ok";
  const slow = connection.effectiveType !== undefined && SLOW_TYPES.has(connection.effectiveType);
  return connection.saveData === true || slow ? "constrained" : "ok";
}

function subscribe(onChange: () => void): () => void {
  const connection = getConnection();
  connection?.addEventListener("change", onChange);
  return () => connection?.removeEventListener("change", onChange);
}

export function useNetworkQuality(): NetworkQuality {
  return useSyncExternalStore(subscribe, getSnapshot, () => "unknown");
}
