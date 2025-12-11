import { useQuery } from "@tanstack/react-query";

type GithubUser = {
  avatar_url: string;
};

async function fetchGithubAvatar(username: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) {
      return null;
    }
    const user = (await res.json()) as GithubUser;
    return user.avatar_url ?? null;
  } catch (error) {
    console.error("Error fetching GitHub avatar:", error);
    return null;
  }
}

export function useGithubAvatar(username: string | null) {
  return useQuery({
    queryKey: ["github-avatar", username],
    queryFn: () => {
      if (!username) {
        return Promise.resolve(null);
      }
      return fetchGithubAvatar(username);
    },
    enabled: !!username,
  });
}

