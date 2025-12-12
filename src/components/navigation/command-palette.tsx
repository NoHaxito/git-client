"use client";

import { FileTextIcon, GitCommitIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useGlobalSearch } from "@/hooks/tauri-queries";
import { cn } from "@/lib/utils";
import { useRepoStore } from "@/stores/repo";
import { Button } from "../ui/button";
import { Kbd } from "../ui/kbd";

type FilterType = "all" | "files" | "commits";

type FilterButtonsProps = {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  filesCount: number;
  commitsCount: number;
};

function FilterButtons({
  filter,
  onFilterChange,
  filesCount,
  commitsCount,
}: FilterButtonsProps) {
  return (
    <div className="sticky top-0 z-10 flex gap-1 border-b bg-popover px-2 py-1">
      <button
        className={`rounded px-2 py-1 text-xs transition-colors ${
          filter === "all"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50"
        }`}
        onClick={() => onFilterChange("all")}
        type="button"
      >
        All ({filesCount + commitsCount})
      </button>
      <button
        className={`rounded px-2 py-1 text-xs transition-colors ${
          filter === "files"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50"
        }`}
        onClick={() => onFilterChange("files")}
        type="button"
      >
        Files ({filesCount})
      </button>
      <button
        className={`rounded px-2 py-1 text-xs transition-colors ${
          filter === "commits"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/50"
        }`}
        onClick={() => onFilterChange("commits")}
        type="button"
      >
        Commits ({commitsCount})
      </button>
    </div>
  );
}

type FileResultsProps = {
  files: string[];
  onFileSelect: (filePath: string) => void;
};

function FileResults({ files, onFileSelect }: FileResultsProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <CommandGroup heading="Files">
      {files.map((file) => {
        const fileName = file.split("/").pop() || file;
        return (
          <CommandItem key={file} onSelect={() => onFileSelect(file)}>
            <FileTextIcon />
            <div className="flex flex-col">
              <span>{fileName}</span>
              <span className="overflow-hidden whitespace-nowrap text-muted-foreground text-xs">
                {file}
              </span>
            </div>
          </CommandItem>
        );
      })}
    </CommandGroup>
  );
}

type CommitResultsProps = {
  commits: Array<{
    hash: string;
    message: string;
  }>;
  onCommitSelect: (hash: string) => void;
};

function CommitResults({ commits, onCommitSelect }: CommitResultsProps) {
  if (commits.length === 0) {
    return null;
  }

  return (
    <CommandGroup heading="Commits">
      {commits.map((commit) => (
        <CommandItem
          key={commit.hash}
          onSelect={() => onCommitSelect(commit.hash)}
        >
          <GitCommitIcon />
          <div className="flex flex-col">
            <span className="font-mono text-xs">{commit.hash.slice(0, 7)}</span>
            <span className="line-clamp-1 text-xs">{commit.message}</span>
          </div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

function useKeyboardShortcut(key: string, callback: () => void) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === key && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        callback();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [key, callback]);
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const navigate = useNavigate();
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const debouncedQuery = useDebounce(searchQuery, 300);

  useKeyboardShortcut("k", () => setOpen((prev) => !prev));

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setFilter("all");
    }
  }, [open]);

  const { data: searchResults, isLoading } = useGlobalSearch(
    currentRepo,
    debouncedQuery.trim().length > 0 ? debouncedQuery : null
  );

  const filteredResults = useMemo(() => {
    if (!searchResults) {
      return { files: [], commits: [] };
    }

    if (filter === "files") {
      return { files: searchResults.files, commits: [] };
    }
    if (filter === "commits") {
      return { files: [], commits: searchResults.commits };
    }
    return searchResults;
  }, [searchResults, filter]);

  const totalResults =
    filteredResults.files.length + filteredResults.commits.length;

  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasAnyResults =
    (searchResults?.files.length || 0) + (searchResults?.commits.length || 0) >
    0;
  const showFilters = hasSearchQuery && !isLoading && !!searchResults;

  const handleFileSelect = (filePath: string) => {
    if (!currentRepo) {
      return;
    }
    const relativePath = filePath.replace(`${currentRepo}/`, "");
    const encodedPath = encodeURIComponent(relativePath);
    navigate(`/project/files/view/${encodedPath}`);
    setOpen(false);
  };

  const handleCommitSelect = (hash: string) => {
    navigate(`/project/commits/${hash}`);
    setOpen(false);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
  };

  if (!currentRepo) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="icon-sm" variant="ghost">
        <SearchIcon className="size-3.5" />
      </Button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput
          onValueChange={setSearchQuery}
          placeholder="Search files and commits..."
          showSpinner={isLoading}
          value={searchQuery}
        />
        <CommandList className="overflow-x-hidden">
          {isLoading && hasSearchQuery && (
            <div className="py-6 text-center text-muted-foreground text-sm">
              Searching...
            </div>
          )}
          {!isLoading && hasSearchQuery && !searchResults && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {showFilters && (
            <FilterButtons
              commitsCount={searchResults?.commits.length || 0}
              filesCount={searchResults?.files.length || 0}
              filter={filter}
              onFilterChange={handleFilterChange}
            />
          )}
          {!isLoading &&
            hasSearchQuery &&
            totalResults === 0 &&
            hasAnyResults && (
              <CommandEmpty>No results found in this filter.</CommandEmpty>
            )}
          <FileResults
            files={filteredResults.files}
            onFileSelect={handleFileSelect}
          />
          <CommitResults
            commits={filteredResults.commits}
            onCommitSelect={handleCommitSelect}
          />
        </CommandList>
        <div
          className={cn(
            "flex justify-end gap-x-1 px-2 py-1",
            showFilters && "border-t"
          )}
        >
          <Button
            className="font-normal"
            onClick={() => setOpen(false)}
            size="xs"
            variant="ghost"
          >
            Close
            <Kbd className="h-4 min-w-4">Esc</Kbd>
          </Button>
          <Button className="font-normal" size="xs" variant="ghost">
            Select
            <Kbd className="h-4 min-w-4">Enter</Kbd>
          </Button>
          <Button className="font-normal" size="xs" variant="ghost">
            Navigate
            <Kbd className="size-4 min-w-4">↑</Kbd>
            <Kbd className="size-4 min-w-4">↓</Kbd>
          </Button>
        </div>
      </CommandDialog>
    </>
  );
}
