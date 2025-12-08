import {
  Code2Icon,
  FolderIcon,
  GitBranchIcon,
  MousePointer,
  Settings as SettingsIcon,
} from "lucide-react";
import useMeasure from "react-use-measure";
import { AppearanceSettings } from "@/components/modals/appearance-settings";
import { WorkspaceSettings } from "@/components/modals/workspace-settings";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { useGitVersion, useSystemInfo } from "@/hooks/tauri-queries";

const settingsCategories = [
  {
    id: "appearance",
    label: "Appearance",
    icon: MousePointer,
    disabled: false,
    badge: null,
  },
  {
    id: "workspace",
    label: "Workspace",
    icon: FolderIcon,
    disabled: false,
    badge: null,
  },
  {
    id: "editor",
    label: "Editor",
    icon: Code2Icon,
    disabled: false,
    badge: null,
  },
  {
    id: "git-providers",
    label: "Git Providers",
    icon: GitBranchIcon,
    disabled: true,
    badge: "SOON",
  },
] as const;

const APP_NAME = "Gitty Client";
const APP_VERSION = "0.1.0";

function AboutSection() {
  const { data: osInfo } = useSystemInfo();
  const { data: gitVersionRaw } = useGitVersion();
  const gitVersion = gitVersionRaw?.split("git version")[1] || null;

  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <SettingsIcon className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5 text-muted-foreground text-xs">
        <div className="font-medium text-foreground">
          {APP_NAME} {APP_VERSION}
        </div>
        {osInfo && (
          <div>
            {osInfo[0]} {osInfo[1]}
          </div>
        )}
        {gitVersion && <div>Git {gitVersion}</div>}
      </div>
    </div>
  );
}

export function SettingsModal() {
  const [ref, bounds] = useMeasure();
  const renderContent = (categoryId: string) => {
    if (categoryId === "appearance") {
      return <AppearanceSettings />;
    }
    if (categoryId === "workspace") {
      return <WorkspaceSettings />;
    }
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-lg bg-muted/50" />
        <div className="h-32 rounded-lg bg-muted/50" />
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <SidebarMenuButton
            tooltip={{
              children: "Settings",
              hidden: false,
            }}
          />
        }
      >
        <SettingsIcon />
        Settings
      </DialogTrigger>
      <DialogPopup
        className="h-(--height) overflow-hidden rounded-t-[calc(var(--radius-2xl)-1px)] transition-all duration-300 ease-in-out sm:h-[600px] sm:max-w-5xl"
        style={
          {
            "--height": bounds.height > 0 ? `${bounds.height}px` : "auto",
          } as React.CSSProperties
        }
      >
        <div className="flex h-full flex-1 flex-col" ref={ref}>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your application preferences and account settings.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel
            className="flex h-full min-h-0 flex-1 p-0 px-6"
            style={{ paddingBottom: "0px!important" }}
          >
            <Tabs
              className="grid w-full grid-cols-[auto_minmax(auto,1fr)]"
              defaultValue="appearance"
              orientation="vertical"
            >
              <div className="flex w-12 max-w-12 flex-col items-start border-r pr-2 md:w-64 md:max-w-64">
                <TabsList
                  className="sticky top-1 w-full flex-col items-start justify-start gap-y-1 rounded-none border-0 p-0"
                  variant="underline"
                >
                  {settingsCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <TabsTab
                        className="items-center! justify-center! md:justify-start! flex max-h-8 min-h-8 w-8 px-0 py-0 data-active:bg-accent md:w-full md:px-[calc(--spacing(2.5)-1px)] md:py-[calc(--spacing(1.5)-1px)] data-active:[&>svg]:fill-primary"
                        disabled={category.disabled}
                        key={category.id}
                        value={category.id}
                      >
                        <Icon className="size-4 min-w-4" />
                        <span className="hidden text-sm md:block">
                          {category.label}
                        </span>
                        {category.badge && (
                          <Badge
                            className="ml-auto hidden md:flex"
                            variant="outline"
                          >
                            {category.badge}
                          </Badge>
                        )}
                      </TabsTab>
                    );
                  })}
                </TabsList>
                <div className="sticky bottom-0 mt-auto hidden w-full border-t md:block">
                  <AboutSection />
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                {settingsCategories.map((category) => (
                  <TabsPanel
                    className="flex min-h-0 flex-1 flex-col px-4 pb-4"
                    key={category.id}
                    value={category.id}
                  >
                    <div className="flex-1">
                      <h2 className="mb-4 font-semibold text-lg">
                        {category.label}
                      </h2>
                      {renderContent(category.id)}
                    </div>
                  </TabsPanel>
                ))}
              </div>
            </Tabs>
          </DialogPanel>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
