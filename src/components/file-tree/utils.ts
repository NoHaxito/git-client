export function normalizePath(path: string, repoRoot: string): string {
  const normalized = path.replace(/\\/g, "/");
  const rootNormalized = repoRoot.replace(/\\/g, "/");

  if (normalized.startsWith(rootNormalized)) {
    return normalized.slice(rootNormalized.length + 1);
  }
  return normalized;
}

export const PATH_SEPARATOR_REGEX = /[/\\]/;
