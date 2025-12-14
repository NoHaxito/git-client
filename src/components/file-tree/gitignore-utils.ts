import { useReadFile } from "@/hooks/tauri-queries";
import { normalizePath } from "./utils";

function parseGitignore(content: string): string[] {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .filter((line) => !line.startsWith("!"));
}

function patternToRegex(pattern: string): RegExp {
  let regexPattern = pattern
    .replace(/\./g, "\\.")
    .replace(/\*\*/g, "__STAR_STAR__")
    .replace(/\*/g, "[^/]*")
    .replace(/__STAR_STAR__/g, ".*")
    .replace(/\?/g, "[^/]");

  if (pattern.startsWith("/")) {
    regexPattern = regexPattern.slice(1);
  } else {
    regexPattern = `.*${regexPattern}`;
  }

  if (pattern.endsWith("/")) {
    regexPattern = `${regexPattern}.*`;
  }

  return new RegExp(`^${regexPattern}$`);
}

function isIgnoredByPattern(relativePath: string, pattern: string): boolean {
  const regex = patternToRegex(pattern);
  return regex.test(relativePath);
}

export function checkIfIgnored(
  filePath: string,
  rootPath: string,
  gitignorePatterns: string[]
): boolean {
  const relativePath = normalizePath(filePath, rootPath);

  if (relativePath === ".git" || relativePath.startsWith(".git/")) {
    return true;
  }

  const pathParts = relativePath.split("/");
  if (pathParts.includes(".git")) {
    return true;
  }

  for (const pattern of gitignorePatterns) {
    if (isIgnoredByPattern(relativePath, pattern)) {
      return true;
    }

    for (let i = 0; i < pathParts.length; i++) {
      const partialPath = pathParts.slice(0, i + 1).join("/");
      if (isIgnoredByPattern(partialPath, pattern)) {
        return true;
      }
    }
  }

  return false;
}

export async function loadGitignore(rootPath: string): Promise<string[]> {
  try {
    const gitignorePath = `${rootPath}/.gitignore`;
    const { invoke } = await import("@tauri-apps/api/core");
    const content = await invoke<string>("read_file", { path: gitignorePath });
    return parseGitignore(content);
  } catch {
    return [];
  }
}

export function useGitignore(rootPath: string | null) {
  const gitignorePath = rootPath ? `${rootPath}/.gitignore` : null;
  const { data: content } = useReadFile(gitignorePath);

  if (!content) {
    return [];
  }

  return parseGitignore(content);
}
