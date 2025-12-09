"use client";

import { FileTextIcon, GitCommitIcon, SearchIcon } from "lucide-react";
import * as React from "react";
import { useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { CommitsList } from "@/components/commits-list";
import { FileTree } from "@/components/file-tree/file-tree";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRepoStore } from "@/stores/repo";
import { SettingsModal } from "../modals/settings-modal";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

const navMain = [
  {
    title: "Files",
    path: "/project/files",
    icon: FileTextIcon,
  },
  {
    title: "Commits",
    path: "/project/commits",
    icon: GitCommitIcon,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const { setOpen } = useSidebar();
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const currentBranch = useRepoStore((state) => state.currentBranch);

  const isFilesRoute = location.pathname.startsWith("/project/files");
  const isCommitsRoute = location.pathname === "/project/commits";

  const parentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  React.useEffect(() => {
    if (!isFilesRoute) {
      setSearchQuery("");
    }
  }, [isFilesRoute]);

  return (
    <Sidebar
      className="h-full overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      collapsible="icon"
      {...props}
    >
      <Sidebar
        className="h-full w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
        collapsible="none"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-0">
              <SidebarMenu>
                {navMain.map((item) => {
                  const isActive =
                    (item.path === "/project/files" && isFilesRoute) ||
                    (item.path === "/project/commits" && isCommitsRoute);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className="px-2"
                        isActive={isActive}
                        onClick={() => {
                          navigate(item.path);
                          setOpen(true);
                        }}
                        tooltip={{
                          children: item.title,
                          hidden: false,
                        }}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SettingsModal />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <Sidebar className="hidden flex-1 md:flex" collapsible="none">
        <SidebarHeader className="gap-3.5">
          <div className="flex w-full items-center justify-between">
            <div className="font-medium text-base text-foreground">
              {isFilesRoute && "Files"}
              {isCommitsRoute && "Commits"}
            </div>
            {isFilesRoute && (
              <div className="flex items-center gap-1">
                <InputGroup className="h-6 max-w-32">
                  <InputGroupInput
                    className="h-6 text-xs"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    value={searchQuery}
                  />
                  <InputGroupAddon>
                    <SearchIcon className="size-3" />
                  </InputGroupAddon>
                </InputGroup>
              </div>
            )}
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden" ref={parentRef}>
          <SidebarGroup>
            <SidebarGroupContent>
              {!currentRepo && (
                <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
                  No repository open
                </div>
              )}
              {currentRepo && isCommitsRoute && (
                <CommitsList
                  key={`${currentRepo}-${currentBranch || "default"}`}
                  parentRef={parentRef}
                  repoPath={currentRepo}
                />
              )}
              {currentRepo && isFilesRoute && (
                <FileTree
                  key={`${currentRepo}-${currentBranch || "default"}`}
                  rootPath={currentRepo}
                  searchQuery={debouncedSearchQuery}
                />
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  );
}
