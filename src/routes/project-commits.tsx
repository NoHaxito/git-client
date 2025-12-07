import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useRepoStore } from "@/stores/repo";

export default function ProjectCommits() {
  const navigate = useNavigate();
  const clearRepo = useRepoStore((state) => state.clearRepo);

  const handleCloseRepo = () => {
    clearRepo();
    window.history.replaceState(null, "", "/empty");
    navigate("/empty", { replace: true });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Button onClick={handleCloseRepo}>Close Repository</Button>
    </div>
  );
}

