import { listen } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { MinusIcon, SquareIcon, XIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

export function WindowControls() {
  const appWindow = useRef(getCurrentWindow());
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const checkMaximizedState = async () => {
      const maximized = await appWindow.current.isMaximized();
      setIsMaximized(maximized);
    };

    checkMaximizedState();

    let unlistenResize: (() => void) | undefined;
    let unlistenMove: (() => void) | undefined;

    const setupListeners = async () => {
      unlistenResize = await listen("tauri://resize", async () => {
        await checkMaximizedState();
      });

      unlistenMove = await listen("tauri://move", async () => {
        await checkMaximizedState();
      });
    };

    setupListeners();

    return () => {
      if (unlistenResize) {
        unlistenResize();
      }
      if (unlistenMove) {
        unlistenMove();
      }
    };
  }, []);

  const handleMinimize = useCallback(() => {
    appWindow.current.minimize();
  }, []);

  const handleMaximize = useCallback(async () => {
    await appWindow.current.toggleMaximize();
    const maximized = await appWindow.current.isMaximized();
    setIsMaximized(maximized);
  }, []);

  const handleClose = useCallback(() => {
    appWindow.current.close();
  }, [appWindow]);

  return (
    <div className="flex items-center [&>button]:rounded-none">
      <Button onClick={handleMinimize} size="icon-xl" variant="ghost">
        <MinusIcon className="size-3.5" />
      </Button>
      <Button onClick={handleMaximize} size="icon-xl" variant="ghost">
        {isMaximized ? (
          <svg
            className="size-3.5 rotate-90"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <SquareIcon className="size-3" />
        )}
      </Button>
      <Button
        className="hover:bg-red-500"
        onClick={handleClose}
        size="icon-xl"
        variant="ghost"
      >
        <XIcon className="size-3.5" />
      </Button>
    </div>
  );
}
