"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Poster } from "@/components/media/Poster";
import { useInView } from "@/hooks/useInView";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useNetworkQuality } from "@/hooks/useNetworkQuality";
import { useMediaSize } from "@/hooks/useMediaSize";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useRevealGate } from "@/hooks/useRevealGate";
import { MQ, video } from "@/lib/motion";
import { playExclusive, releasePlayback } from "@/lib/playback";
import { stageStore } from "@/lib/stageStore";
import type { ProjectMedia } from "@/types";

interface LazyVideoProps {
  readonly slug: string;
  readonly media: ProjectMedia;
  readonly width: number;
  readonly height: number;
  /**
   * Where the row's reveal runs (null: never). While it runs, the video is
   * attached only once the row reveals, and plays only at full size.
   */
  readonly gateQuery: string | null;
  /** Load the poster at once (the featured frame takes over from the card). */
  readonly eagerPoster?: boolean;
}

/**
 * Muted looping preview. Shows only the poster until the box is within
 * 400px of the viewport, and never loads video on Save-Data or 2G.
 * Fine pointers play on hover; touch screens play when half visible (a tap
 * opens the project). One video plays at a time; a paused one keeps its frame.
 * A project stage fully covered by the next one pauses its video.
 */
export function LazyVideo({
  slug,
  media,
  width,
  height,
  gateQuery,
  eagerPoster = false,
}: LazyVideoProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);

  const size = useMediaSize();
  const network = useNetworkQuality();
  const pageVisible = usePageVisibility();
  const finePointer = useMediaQuery(MQ.finePointer);
  const near = useInView(boxRef, { rootMargin: `${video.lazyMargin}px`, once: true });
  const halfVisible = useInView(boxRef, { threshold: video.playRatio, enabled: !finePointer });
  // `revealed` is one-way, so the source is never detached (and the frame
  // never reset) when the row scrolls back out.
  const { revealed: armed, fullSize } = useRevealGate(slug, gateQuery);
  const coveredSnapshot = useCallback(() => stageStore.isCovered(slug), [slug]);
  const covered = useSyncExternalStore(stageStore.subscribeCovered, coveredSnapshot, () => false);

  const src = size && near && armed && network === "ok" ? media.mp4[size] : null;

  // The featured frame is hidden until it takes over from the card: decode its
  // poster ahead of time so that first visible frame does no decode work.
  useEffect(() => {
    if (!eagerPoster) return;
    void boxRef.current
      ?.querySelector("img")
      ?.decode()
      .catch(() => {
        // Not decodable yet (or no longer in the DOM): it decodes on first paint.
      });
  }, [eagerPoster]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !src) return;
    element.muted = true;
    element.load();
    return () => releasePlayback(element);
  }, [src]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element || !src) return;
    const play = fullSize && !covered && pageVisible && (finePointer ? hovered : halfVisible);
    if (play) playExclusive(element);
    else element.pause();
  }, [src, fullSize, covered, pageVisible, finePointer, hovered, halfVisible]);

  return (
    <div
      ref={boxRef}
      className="absolute inset-0 touch-manipulation"
      onMouseEnter={finePointer ? () => setHovered(true) : undefined}
      onMouseLeave={finePointer ? () => setHovered(false) : undefined}
    >
      {/* The poster renders with the HTML. The video's poster attribute points
          at the same file, so it is a cache hit. */}
      <Poster
        media={media}
        width={width}
        height={height}
        loading={eagerPoster ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        poster={size ? media.poster[size] : undefined}
        width={width}
        height={height}
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
        disableRemotePlayback
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        {src ? <source src={src} type="video/mp4" /> : null}
      </video>
    </div>
  );
}
