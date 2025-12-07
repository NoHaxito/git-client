import { createBrowserRouter, redirect } from "react-router";
import { useRepoStore } from "@/stores/repo";
import EmptyRoute from "@/routes/empty";
import ProjectLayout from "@/routes/project-layout";
import ProjectFiles from "@/routes/project-files";
import ProjectFilesFilepath from "@/routes/project-files-filepath";
import ProjectCommits from "@/routes/project-commits";

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
        path: "files/*",
        Component: ProjectFilesFilepath,
      },
      {
        path: "commits",
        Component: ProjectCommits,
      },
    ],
  },
]);

