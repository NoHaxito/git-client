import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyTitle,
} from "@/components/ui/empty";
import { OpenProjectModal } from "@/components/modals/open-project-modal";
import { Button } from "./ui/button";

export function EmptyWorkspace() {
  return (
    <div className="flex h-screen w-screen flex-1 flex-col items-center justify-center bg-sidebar">
      <Empty>
        <EmptyTitle>No workspace selected</EmptyTitle>
        <EmptyDescription>Select a workspace to get started</EmptyDescription>
        <EmptyContent>
          <div className="flex gap-2">
            <OpenProjectModal />
            <Button disabled variant="outline">
              Clone Repository
            </Button>
          </div>
        </EmptyContent>
      </Empty>
    </div>
  );
}
