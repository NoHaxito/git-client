import { BellIcon, ListXIcon, XIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";

export function NotificationsPopover() {
  return (
    <>
      <Popover>
        <PopoverTrigger
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <BellIcon className="size-3.5" />
        </PopoverTrigger>
        <PopoverPopup
          align="end"
          className="w-80 flex-col overflow-hidden p-0"
          side="bottom"
          sideOffset={12}
        >
          <div className="flex w-full items-center justify-between border-b bg-popover/70 p-3 py-2">
            <PopoverTitle className="text-sm">Notifications</PopoverTitle>
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon-xs",
                  })}
                >
                  <ListXIcon className="size-3.5" />
                </TooltipTrigger>
                <TooltipPopup align="center" side="top" sideOffset={6}>
                  Clear
                </TooltipPopup>
              </Tooltip>
              <Tooltip>
                <PopoverClose
                  render={
                    <TooltipTrigger
                      className={buttonVariants({
                        variant: "ghost",
                        size: "icon-xs",
                      })}
                    />
                  }
                >
                  <XIcon className="size-3.5" />
                </PopoverClose>
                <TooltipPopup align="end" side="top" sideOffset={6}>
                  Close
                </TooltipPopup>
              </Tooltip>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </PopoverPopup>
      </Popover>
      <Separator className="h-4" orientation="vertical" />
    </>
  );
}
