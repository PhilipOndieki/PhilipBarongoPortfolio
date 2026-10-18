/**
 * Only one project video plays at a time on a page: starting one pauses the
 * one that was playing. The paused video keeps its frame.
 */
let current: HTMLVideoElement | null = null;

export function playExclusive(video: HTMLVideoElement): void {
  if (current && current !== video && !current.paused) current.pause();
  current = video;
  video.play().catch(() => {
    // Interrupted or blocked: the poster stays.
  });
}

export function releasePlayback(video: HTMLVideoElement): void {
  video.pause();
  if (current === video) current = null;
}
