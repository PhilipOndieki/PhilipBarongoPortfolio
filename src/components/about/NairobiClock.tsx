"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { useInView } from "@/hooks/useInView";
import { usePageVisibility } from "@/hooks/usePageVisibility";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { clock } from "@/lib/motion";

interface NairobiClockProps {
  /** IANA time zone; the visitor's own zone is never used. */
  readonly timeZone: string;
  /** Accessible name prefix: "<label>: HH:MM". */
  readonly label: string;
}

/** Face geometry in px (the SVG is drawn 1:1). */
const face = {
  size: 72,
  ticks: 60,
  majorEvery: 5,
  tickLength: 3,
  majorTickLength: 5,
  tickWidth: 1,
  hour: { length: 18, width: 1.5 },
  minute: { length: 26, width: 1 },
  second: { length: 30, width: 1 },
  dotRadius: 1.5,
} as const;

const centre = face.size / 2;

interface ClockTime {
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

/** Wall-clock time in `timeZone`, from Intl (no time zone maths of our own). */
function timeIn(timeZone: string, date: Date): ClockTime {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    formatters.set(timeZone, formatter);
  }
  const parts = formatter.formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { hours: part("hour"), minutes: part("minute"), seconds: part("second") };
}

const pad = (value: number): string => String(value).padStart(2, "0");
const rotate = (degrees: number): string => `rotate(${degrees}deg)`;

const subscribeNever = () => () => {};

/**
 * A live analogue clock for one time zone. The face renders with the HTML;
 * the hands only after mount, so server and client markup match. The hands
 * move once per second on the full second (transform only), and the timer
 * stops while the clock is off screen or the tab is hidden, then resyncs.
 * With reduced motion there is no seconds hand.
 */
export function NairobiClock({ timeZone, label }: NairobiClockProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hourRef = useRef<SVGLineElement>(null);
  const minuteRef = useRef<SVGLineElement>(null);
  const secondRef = useRef<SVGLineElement>(null);
  const labelKeyRef = useRef(-1);

  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisibility();
  const onScreen = useInView(svgRef);
  const running = mounted && onScreen && pageVisible;

  const draw = useCallback(() => {
    const now = new Date();
    const { hours, minutes, seconds } = timeIn(timeZone, now);
    if (hourRef.current) hourRef.current.style.transform = rotate((hours % 12) * 30 + minutes / 2);
    if (minuteRef.current) {
      minuteRef.current.style.transform = rotate(minutes * 6 + seconds / 10);
    }
    if (secondRef.current) secondRef.current.style.transform = rotate(seconds * 6);
    // The accessible name changes once per minute, not every second.
    const labelKey = Math.floor(now.getTime() / clock.labelUpdate);
    if (labelKey !== labelKeyRef.current && svgRef.current) {
      labelKeyRef.current = labelKey;
      svgRef.current.setAttribute("aria-label", `${label}: ${pad(hours)}:${pad(minutes)}`);
    }
  }, [timeZone, label]);

  // Place the hands before their first paint, so they never show at 12.
  useLayoutEffect(() => {
    if (mounted) draw();
  }, [mounted, reducedMotion, draw]);

  useEffect(() => {
    if (!running) return;
    let timer: number | undefined;
    const tick = () => {
      draw();
      timer = window.setTimeout(tick, clock.tickInterval - (Date.now() % clock.tickInterval));
    };
    // Resync at once on (re)start, then tick on each full second.
    tick();
    return () => window.clearTimeout(timer);
  }, [running, draw]);

  const ticks = Array.from({ length: face.ticks }, (_, index) => {
    const major = index % face.majorEvery === 0;
    return (
      <line
        key={index}
        x1={centre}
        y1={0}
        x2={centre}
        y2={major ? face.majorTickLength : face.tickLength}
        className={major ? "clock-tick-major" : "clock-tick"}
        transform={`rotate(${(index * 360) / face.ticks} ${centre} ${centre})`}
      />
    );
  });

  const hand = (length: number) => ({
    x1: centre,
    y1: centre,
    x2: centre,
    y2: centre - length,
  });

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label={label}
      width={face.size}
      height={face.size}
      viewBox={`0 0 ${face.size} ${face.size}`}
      fill="none"
      strokeWidth={face.tickWidth}
      className="block"
    >
      {ticks}
      {mounted ? (
        <>
          <line
            ref={hourRef}
            {...hand(face.hour.length)}
            strokeWidth={face.hour.width}
            className="clock-hand clock-hour"
          />
          <line
            ref={minuteRef}
            {...hand(face.minute.length)}
            strokeWidth={face.minute.width}
            className="clock-hand clock-minute"
          />
          {reducedMotion ? null : (
            <line
              ref={secondRef}
              {...hand(face.second.length)}
              strokeWidth={face.second.width}
              className="clock-hand clock-second"
            />
          )}
          <circle cx={centre} cy={centre} r={face.dotRadius} className="clock-dot" />
        </>
      ) : null}
    </svg>
  );
}
