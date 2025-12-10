import { useQuery } from "@tanstack/react-query";

type GitlabUser = {
  avatar_url: string;
};

async function fetchGitlabAvatar(username: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://gitlab.com/api/v4/users?username=${username}`
    );
    if (!res.ok) {
      return null;
    }
    const users = (await res.json()) as GitlabUser[];
    return users[0]?.avatar_url ?? null;
  } catch (error) {
    console.error("Error fetching GitLab avatar:", error);
    return null;
  }
}

export function useGitlabAvatar(username: string | null) {
  return useQuery({
    queryKey: ["gitlab-avatar", username],
    queryFn: () => {
      if (!username) {
        return Promise.resolve(null);
      }
      return fetchGitlabAvatar(username);
    },
    enabled: !!username,
  });
}
