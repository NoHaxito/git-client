import { invoke } from "@tauri-apps/api/core";
import { ChevronsUpDownIcon, GitBranchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useRepoStore } from "@/stores/repo";
import type { Branch } from "./types";

export function BranchSelector() {
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
  }, [currentRepo, setBranch]);

  const handleBranchChange = async (branch: Branch | null) => {
    if (!(branch && currentRepo)) {
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

  if (!currentRepo || branches.length === 0) {
    return null;
  }
  if (isLoading) {
    return (
      <div className="flex items-center gap-1">
        <Skeleton className="h-6 w-12" />
      </div>
    );
  }

  return (
    <Combobox
      defaultValue={currentBranch || undefined}
      items={branches}
      onValueChange={handleBranchChange}
    >
      <ComboboxTrigger
        render={
          <Button
            className="h-6 gap-1 bg-transparent! px-2 font-normal text-xs hover:bg-accent/50!"
            size="xs"
            variant="outline"
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
  );
}
