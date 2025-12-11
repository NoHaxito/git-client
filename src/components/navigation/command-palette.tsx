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
import { useRepoStore } from "@/stores/repo";
import { Button } from "../ui/button";

type FilterType = "all" | "files" | "commits";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const navigate = useNavigate();
  const currentRepo = useRepoStore((state) => state.currentRepo);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setDebouncedQuery("");
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

  return (
    <>
      <Button onClick={() => setOpen(true)} size="icon-sm" variant="ghost">
        <SearchIcon className="size-3.5" />
      </Button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput
          hasBorder={totalResults > 0}
          onValueChange={setSearchQuery}
          placeholder="Search files and commits..."
          showSpinner={isLoading}
          value={searchQuery}
        />
        <CommandList className="overflow-x-hidden">
          {!isLoading &&
            searchQuery.trim().length > 0 &&
            totalResults === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
          {!isLoading && searchQuery.trim().length > 0 && totalResults > 0 && (
            <>
              <div className="sticky top-0 z-10 flex gap-1 border-b bg-popover px-2 py-1">
                <button
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    filter === "all"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => handleFilterChange("all")}
                  type="button"
                >
                  All (
                  {(searchResults?.files.length || 0) +
                    (searchResults?.commits.length || 0)}
                  )
                </button>
                <button
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    filter === "files"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => handleFilterChange("files")}
                  type="button"
                >
                  Files ({searchResults?.files.length || 0})
                </button>
                <button
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    filter === "commits"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50"
                  }`}
                  onClick={() => handleFilterChange("commits")}
                  type="button"
                >
                  Commits ({searchResults?.commits.length || 0})
                </button>
              </div>
              {filteredResults.files.length > 0 && (
                <CommandGroup heading="Files">
                  {filteredResults.files.map((file) => {
                    const fileName = file.split("/").pop() || file;
                    return (
                      <CommandItem
                        key={file}
                        onSelect={() => handleFileSelect(file)}
                      >
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
              )}
              {filteredResults.commits.length > 0 && (
                <CommandGroup heading="Commits">
                  {filteredResults.commits.map((commit) => (
                    <CommandItem
                      key={commit.hash}
                      onSelect={() => handleCommitSelect(commit.hash)}
                    >
                      <GitCommitIcon />
                      <div className="flex flex-col">
                        <span className="font-mono text-xs">
                          {commit.hash.slice(0, 7)}
                        </span>
                        <span className="line-clamp-1 text-xs">
                          {commit.message}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
