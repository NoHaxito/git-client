import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function NavigationButtons() {
  const navigate = useNavigate();
  const location = useLocation();
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    const checkHistory = () => {
      const historyState = window.history.state;

      if (historyState && typeof historyState.idx === "number") {
        setCanGoBack(historyState.idx > 0);
        setCanGoForward(historyState.idx < window.history.length - 1);
      } else {
        setCanGoBack(window.history.length > 1);
        setCanGoForward(false);
      }
    };

    checkHistory();

    const handlePopState = () => {
      setTimeout(checkHistory, 0);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoForward = () => {
    navigate(1);
  };

  return (
    <div className="flex items-center gap-0.5">
      <Button
        disabled={!canGoBack}
        onClick={handleGoBack}
        size="icon"
        title="Go back"
        variant="ghost"
      >
        <ArrowLeftIcon className="size-3.5" />
      </Button>
      <Button
        disabled={!canGoForward}
        onClick={handleGoForward}
        size="icon"
        title="Go forward"
        variant="ghost"
      >
        <ArrowRightIcon className="size-3.5" />
      </Button>
      <Separator className="h-4" orientation="vertical" />
    </div>
  );
}
