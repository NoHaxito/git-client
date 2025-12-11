import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useFolderSize, useSubfoldersTotalSize } from "@/hooks/tauri-queries";
import { useSettings } from "@/hooks/use-settings";

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

const FOLDER_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
];

type FolderUsageBarProps = {
  subfolders: Array<{ name: string; size: number }>;
  otherSpaceInFolder: number;
  folderTotalSize: number;
};

function FolderUsageBar({
  subfolders,
  otherSpaceInFolder,
  folderTotalSize,
}: FolderUsageBarProps) {
  const sortedSubfolders = [...subfolders].sort((a, b) => b.size - a.size);
  let currentLeft = 0;

  return (
    <>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
        {sortedSubfolders.map((folder, index) => {
          const percent =
            folderTotalSize > 0 ? (folder.size / folderTotalSize) * 100 : 0;
          const left = currentLeft;
          currentLeft += percent;

          return (
            <div
              className={`absolute top-0 h-full ${FOLDER_COLORS[index % FOLDER_COLORS.length]} transition-all`}
              key={folder.name}
              style={{
                left: `${left}%`,
                width: `${percent}%`,
              }}
            />
          );
        })}
        {otherSpaceInFolder > 0 && (
          <div
            className="absolute top-0 h-full bg-amber-500 transition-all"
            style={{
              left: `${currentLeft}%`,
              width: `${
                folderTotalSize > 0
                  ? (otherSpaceInFolder / folderTotalSize) * 100
                  : 0
              }%`,
            }}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-4 text-muted-foreground text-xs">
        {sortedSubfolders.map((folder, index) => (
          <div className="flex items-center gap-1.5" key={folder.name}>
            <div
              className={`size-2 rounded-full ${FOLDER_COLORS[index % FOLDER_COLORS.length]}`}
            />
            <span>
              {folder.name}: {formatBytes(folder.size)}
            </span>
          </div>
        ))}
        {otherSpaceInFolder > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-amber-500" />
            <span>Other: {formatBytes(otherSpaceInFolder)}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          <span>Total: {formatBytes(folderTotalSize)}</span>
        </div>
      </div>
    </>
  );
}

export function WorkspaceSettings() {
  const { settings, updateWorkspaceClonePath } = useSettings();
  const [cloneDirectory, setCloneDirectory] = useState(
    settings.workspace.clonePath
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: subfolders = [], isLoading: isLoadingSubfolders } =
    useSubfoldersTotalSize(cloneDirectory || null);
  const { data: folderTotalSize = 0, isLoading: isLoadingFolderSize } =
    useFolderSize(cloneDirectory || null);

  const subfoldersTotalSize =
    subfolders?.reduce((total, folder) => total + folder.size, 0) || 0;
  const otherSpaceInFolder = Math.max(0, folderTotalSize - subfoldersTotalSize);
  const isLoading = isLoadingSubfolders || isLoadingFolderSize;

  useEffect(() => {
    setCloneDirectory(settings.workspace.clonePath);
  }, [settings.workspace.clonePath]);

  const handleSelectDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected && typeof selected === "string") {
        setCloneDirectory(selected);
        await updateWorkspaceClonePath(selected);
      }
    } catch (error) {
      console.error("Error selecting directory:", error);
    }
  };

  const handleBlur = async () => {
    if (cloneDirectory) {
      await updateWorkspaceClonePath(cloneDirectory);
    }
  };

  return (
    <FieldSet>
      <FieldGroup>
        <Field orientation="responsive">
          <FieldContent>
            <FieldLabel>Clone Directory</FieldLabel>
            <FieldDescription>
              Choose the directory where repositories will be cloned.
            </FieldDescription>
          </FieldContent>
          <InputGroup className="min-w-72">
            <InputGroupInput
              onBlur={handleBlur}
              onChange={(e) => setCloneDirectory(e.target.value)}
              placeholder="Select or enter directory path"
              ref={inputRef}
              type="text"
              value={cloneDirectory}
            />
            <InputGroupAddon align="inline-end">
              <Button
                aria-label="Select directory"
                className="hover:[&>svg]:fill-current"
                onClick={handleSelectDirectory}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <FolderOpen />
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
      {cloneDirectory && (
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Folder Usage</span>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="font-medium">
                {formatBytes(folderTotalSize)}
              </span>
            )}
          </div>
          {isLoading ? (
            <>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-2 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-2 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="size-2 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </>
          ) : (
            folderTotalSize > 0 && (
              <FolderUsageBar
                folderTotalSize={folderTotalSize}
                otherSpaceInFolder={otherSpaceInFolder}
                subfolders={subfolders}
              />
            )
          )}
        </div>
      )}
    </FieldSet>
  );
}
