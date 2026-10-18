"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { MediaPlaceholder } from "@/components/media/MediaPlaceholder";
import { Poster } from "@/components/media/Poster";
import { useInView } from "@/hooks/useInView";
import { useMediaSize } from "@/hooks/useMediaSize";
import { useNetworkQuality } from "@/hooks/useNetworkQuality";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { projectMediaTransitionName } from "@/lib/anchors";
import { MEDIA_BOX } from "@/lib/media";
import { projectPage } from "@/lib/motion";
import { playExclusive } from "@/lib/playback";
import { incomingTransition, resolveRouteTransition } from "@/lib/viewTransition";
import type { ProjectMedia } from "@/types";

interface ProjectVideoProps {
  readonly slug: string;
  /** Null: the "Preview coming soon" placeholder fills the media area. */
  readonly media: ProjectMedia | null;
  readonly name: string;
  readonly labels: {
    readonly play: string;
    readonly pause: string;
    readonly placeholder: string;
  };
  readonly className?: string;
}

function PlayIcon({ playing }: { readonly playing: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      {playing ? <path d="M3 2h3v10H3zM8 2h3v10H8z" /> : <path d="M3.5 1.8v10.4L12 7z" />}
    </svg>
  );
}

/**
 * The project page media: a full-width autoplaying preview (MP4 only), with
 * the poster underneath from the first paint. It is the view transition's
 * shared element, and resolves an incoming transition once it is in place.
 */
export function ProjectVideo({ slug, media, name, labels, className = "" }: ProjectVideoProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [userPlaying, setUserPlaying] = useState(false);

  const size = useMediaSize();
  const network = useNetworkQuality();
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisibility();
  const inView = useInView(boxRef, {
    threshold: projectPage.mediaPauseThreshold,
    initial: true,
  });

  const src = media && size && network === "ok" ? media.mp4[size] : null;
  // Reduced motion: never autoplay, the button starts it.
  const wantsPlay = reducedMotion ? userPlaying : true;

  // The new page is ready for the transition once this media is in place
  // (the poster is decoded, so the capture is not blank).
  useLayoutEffect(() => {
    if (incomingTransition()?.direction !== "toProject") return;
    const image = boxRef.current?.querySelector("img");
    if (!image || image.complete) {
      resolveRouteTransition("toProject");
      return;
    }
    void image
      .decode()
      .catch(() => {})
      .finally(() => resolveRouteTransition("toProject"));
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    video.muted = true;
    video.load();
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    if (pageVisible && inView && wantsPlay) playExclusive(video);
    else video.pause();
  }, [src, pageVisible, inView, wantsPlay]);

  return (
    <div
      ref={boxRef}
      className={`project-media relative overflow-hidden rounded-[var(--media-radius)] bg-tile ${className}`}
      style={{ viewTransitionName: projectMediaTransitionName(slug) } as CSSProperties}
    >
      {media ? (
        <>
          <Poster
            media={media}
            width={MEDIA_BOX.width}
            height={MEDIA_BOX.height}
            loading="eager"
            priority
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay={!reducedMotion}
            preload="metadata"
            poster={size ? media.poster[size] : undefined}
            width={MEDIA_BOX.width}
            height={MEDIA_BOX.height}
            aria-hidden="true"
            tabIndex={-1}
            disablePictureInPicture
            disableRemotePlayback
            className="absolute inset-0 h-full w-full object-cover object-center"
          >
            {src ? <source src={src} type="video/mp4" /> : null}
          </video>
        </>
      ) : (
        <MediaPlaceholder name={name} label={labels.placeholder} />
      )}
      {reducedMotion && src ? (
        <button
          type="button"
          onClick={() => setUserPlaying((playing) => !playing)}
          aria-label={userPlaying ? labels.pause : labels.play}
          className="absolute bottom-4 left-4 flex size-11 touch-manipulation items-center justify-center rounded-[22px] bg-ink/60 text-fg"
        >
          <PlayIcon playing={userPlaying} />
        </button>
      ) : null}
    </div>
  );
}
