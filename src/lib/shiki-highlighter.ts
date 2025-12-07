import {
  type BundledLanguage,
  type BundledTheme,
  getSingletonHighlighter,
  type HighlighterGeneric,
} from "shiki";

let highlighterPromise: Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> | null = null;

export function getShikiHighlighter(): Promise<
  HighlighterGeneric<BundledLanguage, BundledTheme>
> {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      themes: ["one-dark-pro", "one-light"],
      langs: [
        "javascript",
        "typescript",
        "tsx",
        "jsx",
        "python",
        "rust",
        "json",
        "css",
        "html",
        "markdown",
        "yaml",
        "xml",
        "toml",
        "bash",
        "shell",
      ],
    });
  }

  return highlighterPromise;
}
