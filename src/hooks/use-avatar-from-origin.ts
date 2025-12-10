import { useGitlabAvatar } from "@/lib/get-gitlab-avatar";

export function useAvatarFromOrigin(
  origin: "github.com" | "gitlab.com" | null,
  username: string | null
) {
  let gitlabUsername: string | null = null;
  if (origin === "gitlab.com" && username) {
    gitlabUsername = username;
  }
  const { data: gitlabAvatar } = useGitlabAvatar(gitlabUsername);

  if (origin === null || username === null) {
    return null;
  }

  if (origin === "github.com") {
    return `https://github.com/${username}.png`;
  }

  if (origin === "gitlab.com") {
    return gitlabAvatar ?? `https://gitlab.com/${username}.png`;
  }

  return null;
}

