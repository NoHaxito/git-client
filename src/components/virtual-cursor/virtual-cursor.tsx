"use client";

import { useEffect, useState } from "react";
import type { CursorPosition } from "@/hooks/use-virtual-cursor";
import { cn } from "@/lib/utils";

export type VirtualCursorProps = {
  position: CursorPosition;
  isVisible: boolean;
  charWidth?: number;
  lineHeight?: number;
  offsetTop?: number;
  offsetLeft?: number;
  cursorColor?: string;
  cursorWidth?: number;
  className?: string;
};

export function VirtualCursor({
  position,
  isVisible,
  charWidth = 8,
  lineHeight = 24,
  offsetTop = 4,
  offsetLeft = 0,
  cursorColor,
  cursorWidth = 2,
  className,
}: VirtualCursorProps) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    setBlink(true); // Resetear al mover el cursor
    const interval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [isVisible, position]);

  if (!isVisible) {
    return null;
  }

  const top = offsetTop + position.line * lineHeight;
  const left = offsetLeft + position.column * charWidth;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-20 transition-all duration-50",
        className
      )}
      style={{
        top: `${top}px`,
        left: `${left}px`,
        width: `${cursorWidth}px`,
        height: `${lineHeight}px`,
        backgroundColor: cursorColor ?? "currentColor",
        opacity: blink ? 1 : 0,
      }}
    />
  );
}
