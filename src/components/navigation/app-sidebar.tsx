"use client";

import {
  FileTextIcon,
  FolderGit2Icon,
  GitCommitIcon,
  SearchIcon,
} from "lucide-react";
import * as React from "react";
import { CommitsList } from "@/components/commits-list";
import { FileTree } from "@/components/file-tree";
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

// This is sample data
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Files",
      url: "#",
      icon: FileTextIcon,
      isActive: true,
    },
    {
      title: "Commits",
      url: "#",
      icon: GitCommitIcon,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState(data.navMain[0]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState("");
  const { setOpen } = useSidebar();
  const currentRepo = useRepoStore((state) => state.currentRepo);
  const currentBranch = useRepoStore((state) => state.currentBranch);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <Sidebar
      className="h-full max-h-[calc(100vh-1.75rem)] overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      collapsible="icon"
      {...props}
    >
      <Sidebar
        className="h-full w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
        collapsible="none"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="p-0 md:h-8" size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <FolderGit2Icon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-0">
              <SidebarMenu>
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className="px-2"
                      isActive={activeItem?.title === item.title}
                      onClick={() => {
                        setActiveItem(item);
                        setOpen(true);
                        if (item.title !== "Files") {
                          setSearchQuery("");
                        }
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
                ))}
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
              {activeItem?.title}
            </div>
            {activeItem?.title === "Files" && (
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
        <SidebarContent>
          <SidebarGroup className="px-0 py-0">
            <SidebarGroupContent>
              {!currentRepo && (
                <div className="flex items-center justify-center p-4 text-muted-foreground text-sm">
                  No repository open
                </div>
              )}
              {currentRepo && activeItem?.title === "Commits" && (
                <CommitsList
                  key={`${currentRepo}-${currentBranch || "default"}`}
                  repoPath={currentRepo}
                />
              )}
              {currentRepo && activeItem?.title !== "Commits" && (
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
