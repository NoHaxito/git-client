import { createBrowserRouter, redirect } from "react-router";
import EmptyRoute from "@/routes/empty";
import ProjectCommits from "@/routes/project-commits";
import ProjectCommitsHash from "@/routes/project-commits-hash";
import ProjectFiles from "@/routes/project-files";
import ProjectFilesFilepath from "@/routes/project-files-filepath";
import ProjectFilesFilepathDiff from "@/routes/project-files-filepath-diff";
import ProjectLayout from "@/routes/project-layout";
import { useRepoStore } from "@/stores/repo";
import ProjectChanges from "./routes/project-changes";

export const router = createBrowserRouter([
  {
    path: "/",
    loader: () => {
      const currentRepo = useRepoStore.getState().currentRepo;
      if (currentRepo) {
        return redirect("/project/files");
      }
      return redirect("/empty");
    },
  },
  {
    path: "/empty",
    Component: EmptyRoute,
  },
  {
    path: "/project",
    Component: ProjectLayout,
    children: [
      {
        path: "files",
        Component: ProjectFiles,
      },
      {
        path: "files/diff/*",
        Component: ProjectFilesFilepathDiff,
      },
      {
        path: "files/view/*",
        Component: ProjectFilesFilepath,
      },
      {
        path: "commits",
        Component: ProjectCommits,
      },
      {
        path: "commits/:hash",
        Component: ProjectCommitsHash,
      },
      {
        path: "changes",
        Component: ProjectChanges,
      },
    ],
  },
]);
