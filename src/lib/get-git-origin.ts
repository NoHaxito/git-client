export function getGitOrigin(origin: string) {
  if (origin.includes("github.com")) {
    return "GitHub";
  }
  if (origin.includes("gitlab.com")) {
    return "GitLab";
  }
  return null;
}
