"use client";

import { Popover as PopoverPrimitive } from "@base-ui-components/react/popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

function PopoverTrigger(props: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverPopup({
  children,
  className,
  side = "bottom",
  align = "center",
  sideOffset = 4,
  alignOffset = 0,
  tooltipStyle = false,
  classNamePopup,
  ...props
}: PopoverPrimitive.Popup.Props & {
  side?: PopoverPrimitive.Positioner.Props["side"];
  align?: PopoverPrimitive.Positioner.Props["align"];
  sideOffset?: PopoverPrimitive.Positioner.Props["sideOffset"];
  alignOffset?: PopoverPrimitive.Positioner.Props["alignOffset"];
  tooltipStyle?: boolean;
  classNamePopup?: string;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="z-50"
        data-slot="popover-positioner"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          className={cn(
            "relative flex max-h-(--available-height) w-full origin-(--transform-origin) overflow-y-auto rounded-lg border bg-popover bg-clip-padding p-4 shadow-lg outline-none transition-[scale,opacity,translate] not-[class*='w-']:[min-w-80] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)] data-ending-style:opacity-0 data-starting-style:opacity-0 dark:bg-clip-border dark:before:shadow-[0_-1px_--theme(--color-white/8%)]",
            tooltipStyle &&
              "px-[calc(--spacing(2)+1px)] py-[calc(--spacing(1)+1px)]",
            side === "top" &&
              "data-ending-style:translate-y-4 data-starting-style:translate-y-4 data-ending-style:scale-98 data-starting-style:scale-98",
            side === "bottom" &&
              "data-ending-style:-translate-y-4 data-starting-style:-translate-y-4 data-ending-style:scale-98 data-starting-style:scale-98",
            side === "left" &&
              "data-ending-style:translate-x-4 data-starting-style:translate-x-4 data-ending-style:scale-98 data-starting-style:scale-98",
            side === "right" &&
              "data-ending-style:-translate-x-4 data-starting-style:-translate-x-4 data-ending-style:scale-98 data-starting-style:scale-98",
            classNamePopup,
            className
          )}
          data-slot="popover-content"
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverClose({ ...props }: PopoverPrimitive.Close.Props) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      className={cn("font-semibold text-lg leading-none", className)}
      data-slot="popover-title"
      {...props}
    />
  );
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="popover-description"
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverPopup,
  PopoverPopup as PopoverContent,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
};
