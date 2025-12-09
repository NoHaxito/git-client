import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";

export function useGitStatus(repoPath: string | null) {
  return useQuery({
    queryKey: ["git-status", repoPath],
    queryFn: () =>
      invoke<Record<string, string>>("get_git_status", { repoPath }),
    enabled: !!repoPath,
  });
}

export function useListDirectory(path: string | null) {
  return useQuery({
    queryKey: ["list-directory", path],
    queryFn: () =>
      invoke<Array<{ name: string; path: string; is_dir: boolean }>>(
        "list_directory",
        { path }
      ),
    enabled: !!path,
  });
}

export function useReadFile(path: string | null) {
  return useQuery({
    queryKey: ["read-file", path],
    queryFn: () => invoke<string>("read_file", { path }),
    enabled: !!path,
  });
}

export function useGitBranches(repoPath: string | null) {
  return useQuery({
    queryKey: ["git-branches", repoPath],
    queryFn: () => invoke<string[]>("get_git_branches", { repoPath }),
    enabled: !!repoPath,
  });
}

export function useCurrentGitBranch(repoPath: string | null) {
  return useQuery({
    queryKey: ["current-git-branch", repoPath],
    queryFn: () => invoke<string>("get_current_git_branch", { repoPath }),
    enabled: !!repoPath,
  });
}

export function useCheckoutGitBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      repoPath,
      branchName,
    }: {
      repoPath: string;
      branchName: string;
    }) =>
      invoke("checkout_git_branch", {
        repoPath,
        branchName,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["current-git-branch", variables.repoPath],
      });
      queryClient.invalidateQueries({
        queryKey: ["git-status", variables.repoPath],
      });
    },
  });
}

export function useGitCommits(repoPath: string | null) {
  return useQuery({
    queryKey: ["git-commits", repoPath],
    queryFn: () => invoke<Commit[]>("get_git_commits", { repoPath }),
    enabled: !!repoPath,
  });
}

type Commit = {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
};

type CommitDetails = {
  hash: string;
  author: string;
  email: string;
  date: string;
  message: string;
  files: ChangedFile[];
  stats: string;
};

type ChangedFile = {
  status: string;
  path: string;
  additions?: number;
  deletions?: number;
};

export function useCommitDetails(
  repoPath: string | null,
  commitHash: string | null
) {
  return useQuery({
    queryKey: ["commit-details", repoPath, commitHash],
    queryFn: () =>
      invoke<CommitDetails>("get_commit_details", {
        repoPath,
        commitHash,
      }),
    enabled: !!(repoPath && commitHash),
  });
}

export function useGitDiff(repoPath: string | null, filePath: string | null) {
  return useQuery({
    queryKey: ["git-diff", repoPath, filePath],
    queryFn: () =>
      invoke<string>("get_git_diff", {
        repoPath,
        filePath,
      }),
    enabled: !!(repoPath && filePath),
  });
}

export function useGitBlame(repoPath: string | null, filePath: string | null) {
  return useQuery({
    queryKey: ["git-blame", repoPath, filePath],
    queryFn: () =>
      invoke<BlameLine[]>("get_git_blame", {
        repoPath,
        filePath,
      }),
    enabled: !!(repoPath && filePath),
  });
}

type BlameLine = {
  author: string;
  author_email: string;
  timestamp: number;
  line_number: number;
  commit_hash: string;
  commit_message: string;
};

export function useListGitRepos(clonePath: string | null) {
  return useQuery({
    queryKey: ["list-git-repos", clonePath],
    queryFn: () => invoke<string[]>("list_git_repos", { clonePath }),
    enabled: !!clonePath,
  });
}

export function useIsGitRepo(path: string | null) {
  return useQuery({
    queryKey: ["is-git-repo", path],
    queryFn: () => invoke<boolean>("is_git_repo", { path }),
    enabled: !!path,
  });
}

export function useFolderSize(path: string | null) {
  return useQuery({
    queryKey: ["folder-size", path],
    queryFn: () => invoke<number>("get_folder_size", { path }),
    enabled: !!path,
  });
}

export function useDiskSpace(path: string | null) {
  return useQuery({
    queryKey: ["disk-space", path],
    queryFn: () => invoke<[number, number]>("get_disk_space", { path }),
    enabled: !!path,
  });
}

export function useSystemInfo() {
  return useQuery({
    queryKey: ["system-info"],
    queryFn: () => invoke<[string, string]>("get_system_info"),
  });
}

export function useGitVersion() {
  return useQuery({
    queryKey: ["git-version"],
    queryFn: () => invoke<string>("get_git_version"),
  });
}

export function useGitRemoteOrigin(repoPath: string | null) {
  return useQuery({
    queryKey: ["git-remote-origin", repoPath],
    queryFn: () => invoke<string | null>("get_git_remote_origin", { repoPath }),
    enabled: !!repoPath,
  });
}
