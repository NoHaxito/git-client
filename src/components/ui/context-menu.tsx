"use client";

import { ContextMenu as ContextMenuPrimitive } from "@base-ui-components/react/context-menu";

import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

function ContextMenuTrigger(props: ContextMenuPrimitive.Trigger.Props) {
  return (
    <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
  );
}

function ContextMenuPopup({
  className,
  sideOffset = 4,
  align = "center",
  ...props
}: ContextMenuPrimitive.Popup.Props & {
  align?: ContextMenuPrimitive.Positioner.Props["align"];
  sideOffset?: ContextMenuPrimitive.Positioner.Props["sideOffset"];
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        align={align}
        className="z-50"
        data-slot="context-menu-positioner"
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          className={cn(
            "w-56 origin-(--transform-origin) rounded-md border bg-popover py-1 text-accent-foreground shadow-lg transition-[opacity,scale] data-ending-style:scale-98 data-starting-style:scale-98 data-ending-style:opacity-0 data-starting-style:opacity-0",
            className
          )}
          data-slot="context-menu-popup"
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  variant = "default",
  ...props
}: ContextMenuPrimitive.Item.Props & {
  variant?: "default" | "destructive";
}) {
  return (
    <ContextMenuPrimitive.Item
      className={cn(
        "group flex cursor-default select-none items-center gap-2 px-2.5 py-1 text-base outline-none data-highlighted:relative data-highlighted:z-0 data-highlighted:text-neutral-50 data-highlighted:before:absolute data-highlighted:before:inset-x-1 data-highlighted:before:inset-y-0 data-highlighted:before:z-[-1] data-highlighted:before:rounded-sm data-highlighted:before:bg-accent sm:text-xs [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
        variant === "destructive" &&
          "text-destructive-foreground data-highlighted:text-destructive-foreground data-highlighted:before:bg-red-500/10 [&>svg]:text-destructive-foreground",
        className
      )}
      data-slot="context-menu-item"
      {...props}
    />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}: ContextMenuPrimitive.Separator.Props) {
  return (
    <ContextMenuPrimitive.Separator
      className={cn("mx-2 my-1 h-px bg-border", className)}
      data-slot="context-menu-separator"
      {...props}
    />
  );
}

function ContextMenuGroup(props: ContextMenuPrimitive.Group.Props) {
  return (
    <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
  );
}

function ContextMenuGroupLabel({
  className,
  ...props
}: ContextMenuPrimitive.GroupLabel.Props) {
  return (
    <ContextMenuPrimitive.GroupLabel
      className={cn(
        "px-2 py-1.5 font-medium text-muted-foreground text-xs",
        className
      )}
      data-slot="context-menu-label"
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuPopup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuGroup,
  ContextMenuGroupLabel,
};
