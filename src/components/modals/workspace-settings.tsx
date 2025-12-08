import { open } from "@tauri-apps/plugin-dialog";
import { LazyStore } from "@tauri-apps/plugin-store";
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
import { useDiskSpace, useFolderSize } from "@/hooks/tauri-queries";

const CLONE_PATH_KEY = "workspace.clone_path";
const store = new LazyStore(".settings.dat");

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return "0 B";
  }
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${sizes[i]}`;
}

export function WorkspaceSettings() {
  const [cloneDirectory, setCloneDirectory] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: folderSize = 0, isLoading: isLoadingSize } = useFolderSize(
    cloneDirectory || null
  );
  const { data: diskSpace, isLoading: isLoadingDisk } = useDiskSpace(
    cloneDirectory || null
  );

  const totalSpace = diskSpace?.[0] || 0;
  const freeSpace = diskSpace?.[1] || 0;
  const isLoading = isLoadingSize || isLoadingDisk;

  useEffect(() => {
    const loadClonePath = async () => {
      try {
        const savedPath = await store.get<string>(CLONE_PATH_KEY);
        if (savedPath) {
          setCloneDirectory(savedPath);
        }
      } catch (error) {
        console.error("Error loading clone path:", error);
      }
    };
    loadClonePath();
  }, []);

  const saveClonePath = async (path: string) => {
    try {
      await store.set(CLONE_PATH_KEY, path);
      await store.save();
    } catch (error) {
      console.error("Error saving clone path:", error);
    }
  };

  const handleSelectDirectory = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });
      if (selected && typeof selected === "string") {
        setCloneDirectory(selected);
        await saveClonePath(selected);
      }
    } catch (error) {
      console.error("Error selecting directory:", error);
    }
  };

  const handleBlur = async () => {
    if (cloneDirectory) {
      await saveClonePath(cloneDirectory);
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
            <span className="text-muted-foreground">Disk Usage</span>
            {isLoading ? (
              <Skeleton className="h-4 w-24" />
            ) : (
              <span className="font-medium">
                {formatBytes(folderSize)} / {formatBytes(totalSpace)}
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
            totalSpace > 0 && (
              <>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  {folderSize > 0 && (
                    <div
                      className="absolute top-0 left-0 z-10 h-full bg-blue-500 transition-all"
                      style={{
                        width: `${(folderSize / totalSpace) * 100}%`,
                      }}
                    />
                  )}
                  {totalSpace - freeSpace - folderSize > 0 && (
                    <div
                      className="absolute top-0 h-full bg-amber-500 transition-all"
                      style={{
                        left: `${(folderSize / totalSpace) * 100}%`,
                        width: `${((totalSpace - freeSpace - folderSize) / totalSpace) * 100}%`,
                      }}
                    />
                  )}
                </div>
                <div className="flex gap-4 text-muted-foreground text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-blue-500" />
                    <span>Workspace: {formatBytes(folderSize)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-amber-500" />
                    <span>
                      Other: {formatBytes(totalSpace - freeSpace - folderSize)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    <span>Free: {formatBytes(freeSpace)}</span>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      )}
    </FieldSet>
  );
}
