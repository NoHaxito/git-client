"use client";

import type React from "react";

import type { ReactNode } from "react";
import { VirtualCursor } from "@/components/virtual-cursor/virtual-cursor";
import {
  type UseVirtualCursorOptions,
  useVirtualCursor,
} from "@/hooks/use-virtual-cursor";
import { cn } from "@/lib/utils";

export interface VirtualCursorWrapperProps extends UseVirtualCursorOptions {
  children: ReactNode;
  className?: string;
  charWidth?: number;
  lineHeight?: number;
  cursorOffsetTop?: number;
  cursorOffsetLeft?: number;
  cursorColor?: string;
  showPositionIndicator?: boolean;
}

export const VirtualCursorWrapper = ({
  children,
  className,
  content,
  initialPosition,
  onPositionChange,
  onContentChange,
  editable = false,
  charWidth = 8.4,
  lineHeight = 24,
  cursorOffsetTop = 4,
  cursorOffsetLeft = 0,
  cursorColor,
  showPositionIndicator = false,
  ref,
}: VirtualCursorWrapperProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const {
    position,
    containerRef,
    handleKeyDown,
    handleClick,
    isFocused,
    setIsFocused,
  } = useVirtualCursor({
    content,
    initialPosition,
    onPositionChange,
    onContentChange,
    editable,
  });

  return (
    <div className="relative flex-1">
      {/** biome-ignore lint/a11y/useSemanticElements: ... */}
      <div
        aria-label="Code editor"
        aria-multiline="true"
        className={cn("relative outline-none", className)}
        onBlur={() => setIsFocused(false)}
        onClick={handleClick}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        ref={(node) => {
          containerRef.current = node;
          if (ref) {
            if (typeof ref === "function") {
              ref(node);
            } else {
              ref.current = node;
            }
          }
        }}
        role="textbox"
        tabIndex={0}
      >
        <VirtualCursor
          charWidth={charWidth}
          cursorColor={cursorColor}
          isVisible={isFocused}
          lineHeight={lineHeight}
          offsetLeft={cursorOffsetLeft}
          offsetTop={cursorOffsetTop}
          position={position}
        />
        {children}
      </div>

      {showPositionIndicator && (
        <div className="fixed right-2 bottom-2 rounded bg-muted px-2 py-1 text-muted-foreground text-xs">
          Ln {position.line + 1}, Col {position.column + 1}
        </div>
      )}
    </div>
  );
};
