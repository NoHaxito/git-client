import { useGithubAvatar } from "@/lib/get-github-avatar";
import { useGitlabAvatar } from "@/lib/get-gitlab-avatar";

export function useAvatarFromOrigin(
  origin: "github.com" | "gitlab.com" | null,
  username: string | null
) {
  let githubUsername: string | null = null;
  let gitlabUsername: string | null = null;

  if (origin === "github.com" && username) {
    githubUsername = username;
  }
  if (origin === "gitlab.com" && username) {
    gitlabUsername = username;
  }

  const { data: githubAvatar } = useGithubAvatar(
    githubUsername?.split(" ").join("-") ?? null
  );
  const { data: gitlabAvatar } = useGitlabAvatar(gitlabUsername);

  if (origin === null || username === null) {
    return null;
  }

  if (origin === "github.com") {
    return githubAvatar ?? `https://github.com/${username}.png`;
  }

  if (origin === "gitlab.com") {
    return gitlabAvatar ?? `https://gitlab.com/${username}.png`;
  }

  return null;
}
