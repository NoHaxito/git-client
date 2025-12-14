import type { BundledLanguage, ThemedToken } from "shiki";

export function getLanguageFromFileName(
  fileName: string
): BundledLanguage | undefined {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, BundledLanguage> = {
    js: "javascript",
    mjs: "javascript",
    cjs: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    rs: "rust",
    json: "json",
    css: "css",
    html: "html",
    md: "markdown",
    yml: "yaml",
    yaml: "yaml",
    xml: "xml",
    toml: "toml",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
  };
  return languageMap[ext];
}

export function convertPlainTextToTokens(text: string): ThemedToken[][] {
  if (!text) {
    return [];
  }
  const lines = text.split("\n");
  let offset = 0;
  return lines.map((line) => {
    const tokens: ThemedToken[] = [
      {
        content: line,
        color: "var(--foreground)",
        offset,
      },
    ];
    offset += line.length + 1;
    return tokens;
  });
}

export function timeAgo(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return "just now";
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (days < 30) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (months < 12) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  return `${years} year${years === 1 ? "" : "s"} ago`;
}
