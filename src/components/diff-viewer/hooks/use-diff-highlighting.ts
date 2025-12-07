import { useEffect, useMemo, useState } from "react";
import type { ThemedToken } from "shiki";
import { getShikiHighlighter } from "@/lib/shiki-highlighter";
import { getLanguageFromFileName } from "../../code-editor/utils";
import type { DiffLine } from "../types";

export function useDiffHighlighting(
  parsedLines: DiffLine[],
  fileName: string
) {
  const [highlighter, setHighlighter] = useState<Awaited<
    ReturnType<typeof getShikiHighlighter>
  > | null>(null);
  const [highlightedLines, setHighlightedLines] = useState<DiffLine[]>([]);

  const language = useMemo(() => getLanguageFromFileName(fileName), [fileName]);

  useEffect(() => {
    let cancelled = false;

    getShikiHighlighter()
      .then((h) => {
        if (!cancelled) {
          setHighlighter(h);
        }
      })
      .catch((err: unknown) => {
        console.error("Error loading highlighter:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!highlighter) {
      setHighlightedLines(parsedLines);
      return;
    }

    if (!language) {
      setHighlightedLines(parsedLines);
      return;
    }

    if (parsedLines.length === 0) {
      setHighlightedLines([]);
      return;
    }

    const highlightDiff = async () => {
      try {
        const onlyContent = parsedLines.map((l) => l.content).join("\n");
        const isDark = document.documentElement.classList.contains("dark");
        const theme = isDark ? "one-dark-pro" : "one-light";

        const result = await highlighter.codeToTokens(onlyContent, {
          lang: language,
          theme,
        });

        const tokens = "tokens" in result ? result.tokens : result;

        const linesWithTokens = parsedLines.map((line, i) => ({
          ...line,
          tokens: tokens[i] ?? [],
        }));

        setHighlightedLines(linesWithTokens);
      } catch {
        setHighlightedLines(parsedLines);
      }
    };

    highlightDiff();
  }, [highlighter, language, parsedLines]);

  return { highlightedLines };
}

