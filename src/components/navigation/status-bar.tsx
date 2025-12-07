import { invoke } from "@tauri-apps/api/core";
import {
  BellIcon,
  ChevronsUpDownIcon,
  FolderGit2Icon,
  GitBranchIcon,
  ListXIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  Popover,
  PopoverClose,
  PopoverPopup,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { useRepoStore } from "@/stores/repo";
import { Separator } from "../ui/separator";
import { WindowControls } from "./window-controls";

type Branch = {
  label: string;
  value: string;
};

export function StatusBar() {
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const setBranch = useRepoStore((state) => state.setBranch);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentRepo) {
      setBranches([]);
      setCurrentBranch(null);
      setBranch(null);
      return;
    }

    const loadBranches = async () => {
      setIsLoading(true);
      try {
        const [branchList, currentBranchName] = await Promise.all([
          invoke<string[]>("get_git_branches", { repoPath: currentRepo }),
          invoke<string>("get_current_git_branch", { repoPath: currentRepo }),
        ]);

        const branchItems: Branch[] = branchList.map((branch) => ({
          label: branch,
          value: branch,
        }));

        setBranches(branchItems);

        const current = branchItems.find((b) => b.value === currentBranchName);
        if (current) {
          setCurrentBranch(current);
          setBranch(current.value);
        }
      } catch (error) {
        console.error("Error loading branches:", error);
        setBranches([]);
        setCurrentBranch(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranches();
  }, [currentRepo]);

  const handleBranchChange = async (branch: Branch | null) => {
    if (!branch) {
      return;
    }
    if (!currentRepo) {
      return;
    }
    if (branch.value === currentBranch?.value) {
      return;
    }

    try {
      await invoke("checkout_git_branch", {
        repoPath: currentRepo,
        branchName: branch.value,
      });
      setCurrentBranch(branch);
      setBranch(branch.value);
    } catch (error) {
      console.error("Error checking out branch:", error);
    }
  };

  return (
    <div className="z-50 flex h-10 max-h-10 min-h-10 w-full items-center justify-between gap-2 border-b bg-sidebar text-xs">
      <div
        className="flex w-full items-center justify-between"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2 px-3">
          <div className="flex size-6 items-center justify-center gap-2 rounded-lg bg-sidebar-primary">
            <FolderGit2Icon className="size-3" />
          </div>
          {currentRepo && branches.length > 0 ? (
            <Combobox
              defaultValue={currentBranch || undefined}
              items={branches}
              onValueChange={handleBranchChange}
            >
              <ComboboxTrigger
                render={
                  <Button
                    className="h-6 gap-1 px-2 font-normal text-xs"
                    size="xs"
                    variant="ghost"
                  />
                }
              >
                <GitBranchIcon className="size-3.5" />
                <ComboboxValue />
                <ChevronsUpDownIcon className="size-3 opacity-72" />
              </ComboboxTrigger>
              <ComboboxPopup
                align="start"
                aria-label="Select branch"
                popupClassName="min-w-80 max-w-80"
                sideOffset={12}
              >
                <div className="border-b p-2">
                  <ComboboxInput
                    className="rounded-md before:rounded-[calc(var(--radius-md)-1px)]"
                    placeholder="e.g. master"
                    showTrigger={false}
                  />
                </div>
                <ComboboxEmpty>No branches found.</ComboboxEmpty>
                <ComboboxList>
                  {(branch: Branch) => (
                    <ComboboxItem key={branch.value} value={branch}>
                      {branch.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxPopup>
            </Combobox>
          ) : (
            <div className="flex items-center gap-1">
              <GitBranchIcon className="size-3.5" />
              <span className="text-muted-foreground">
                {isLoading ? "Loading..." : "No branch"}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <BellIcon className="size-3.5" />
            </PopoverTrigger>
            <PopoverPopup
              align="end"
              className="w-80 flex-col overflow-hidden p-0"
              side="top"
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
          <WindowControls />
        </div>
      </div>
    </div>
  );
}
