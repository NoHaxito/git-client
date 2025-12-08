import { ChevronsUpDownIcon, GitBranchIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
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
import {
  useCheckoutGitBranch,
  useCurrentGitBranch,
  useGitBranches,
} from "@/hooks/tauri-queries";
import type { Branch } from "./types";

export function BranchSelector() {
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const setBranch = useRepoStore((state) => state.setBranch);
  const { data: branchList = [], isLoading: isLoadingBranches } =
    useGitBranches(currentRepo);
  const { data: currentBranchName, isLoading: isLoadingCurrent } =
    useCurrentGitBranch(currentRepo);
  const checkoutMutation = useCheckoutGitBranch();

  const branches = useMemo<Branch[]>(
    () =>
      branchList.map((branch) => ({
        label: branch,
        value: branch,
      })),
    [branchList]
  );

  const currentBranch = useMemo<Branch | null>(
    () => branches.find((b) => b.value === currentBranchName) || null,
    [branches, currentBranchName]
  );

  useEffect(() => {
    if (currentBranch) {
      setBranch(currentBranch.value);
    } else {
      setBranch(null);
    }
  }, [currentBranch, setBranch]);

  const handleBranchChange = async (branch: Branch | null) => {
    if (!(branch && currentRepo)) {
      return;
    }
    if (branch.value === currentBranch?.value) {
      return;
    }

    try {
      await checkoutMutation.mutateAsync({
        repoPath: currentRepo,
        branchName: branch.value,
      });
      setBranch(branch.value);
    } catch (error) {
      console.error("Error checking out branch:", error);
    }
  };

  const isLoading = isLoadingBranches || isLoadingCurrent;

  if (!currentRepo) {
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
