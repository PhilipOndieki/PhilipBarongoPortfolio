"use client";

import { useEffect, useRef } from "react";
import { typing } from "@/lib/motion";

interface TypingTextProps {
  readonly text: string;
  /** Type the text in when true, delete it when false. */
  readonly active: boolean;
  readonly typeInterval?: number;
  readonly deleteInterval?: number;
  /** Wait before the first character when typing starts from empty. */
  readonly startDelay?: number;
  readonly caretHold?: number;
  /** Swap the whole text at once (reduced motion). */
  readonly instant?: boolean;
  readonly onEmptyChange?: (empty: boolean) => void;
  readonly className?: string;
}

/**
 * Moves a character index toward its target with one timer loop. A change of
 * direction continues from the current character. Characters are written to
 * the DOM directly, so typing never re-renders React.
 */
export function TypingText({
  text,
  active,
  typeInterval = typing.typeInterval,
  deleteInterval = typing.deleteInterval,
  startDelay = 0,
  caretHold = typing.caretHold,
  instant = false,
  onEmptyChange,
  className = "",
}: TypingTextProps) {
  const typedRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const loopRef = useRef<number | undefined>(undefined);
  const caretTimerRef = useRef<number | undefined>(undefined);
  const emptyRef = useRef(true);
  const settingsRef = useRef({ text, typeInterval, deleteInterval, caretHold, onEmptyChange });

  useEffect(() => {
    settingsRef.current = { text, typeInterval, deleteInterval, caretHold, onEmptyChange };
  });

  useEffect(() => {
    const render = () => {
      const index = indexRef.current;
      if (typedRef.current) typedRef.current.textContent = settingsRef.current.text.slice(0, index);
      const empty = index === 0;
      if (empty !== emptyRef.current) {
        emptyRef.current = empty;
        settingsRef.current.onEmptyChange?.(empty);
      }
    };

    const setCaret = (visible: boolean) => {
      window.clearTimeout(caretTimerRef.current);
      if (caretRef.current) caretRef.current.hidden = !visible;
    };

    const target = active ? text.length : 0;
    indexRef.current = Math.min(indexRef.current, text.length);

    if (instant) {
      window.clearTimeout(loopRef.current);
      loopRef.current = undefined;
      indexRef.current = target;
      setCaret(false);
      render();
      return;
    }

    render();

    const step = () => {
      const index = indexRef.current;
      if (index === target) {
        loopRef.current = undefined;
        return;
      }
      const forward = index < target;
      indexRef.current = index + (forward ? 1 : -1);
      render();

      if (!forward) {
        setCaret(false);
      } else if (indexRef.current === target) {
        setCaret(true);
        caretTimerRef.current = window.setTimeout(
          () => setCaret(false),
          settingsRef.current.caretHold,
        );
        loopRef.current = undefined;
        return;
      } else {
        setCaret(true);
      }

      const { typeInterval: typeMs, deleteInterval: deleteMs } = settingsRef.current;
      loopRef.current = window.setTimeout(step, forward ? typeMs : deleteMs);
    };

    // A running loop keeps its timing; it just heads for the new target.
    window.clearTimeout(loopRef.current);
    if (indexRef.current === target) {
      loopRef.current = undefined;
      return;
    }
    const delay = indexRef.current === 0 && target > 0 ? startDelay : 0;
    loopRef.current = window.setTimeout(step, delay);
  }, [active, text, instant, startDelay]);

  useEffect(
    () => () => {
      window.clearTimeout(loopRef.current);
      window.clearTimeout(caretTimerRef.current);
    },
    [],
  );

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`} aria-hidden="true">
      {/* Invisible copy reserves the full width, so typing never shifts layout. */}
      <span className="invisible">{text}</span>
      <span className="absolute inset-y-0 left-0 flex items-center">
        <span ref={typedRef} />
        <span ref={caretRef} hidden className="ml-px h-[14px] w-px bg-fg" />
      </span>
    </span>
  );
}
