import { useEffect, useMemo, useState } from "react";
import type { ThemedToken } from "shiki";
import { getShikiHighlighter } from "@/lib/shiki-highlighter";
import { convertPlainTextToTokens, getLanguageFromFileName } from "../utils";

export function useSyntaxHighlighting(value: string, language?: string) {
  const [highlightedTokens, setHighlightedTokens] = useState<ThemedToken[][]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [highlighter, setHighlighter] = useState<Awaited<
    ReturnType<typeof getShikiHighlighter>
  > | null>(null);

  const detectedLanguage = useMemo(
    () => getLanguageFromFileName(language || ""),
    [language]
  );

  useEffect(() => {
    let cancelled = false;

    getShikiHighlighter()
      .then((h) => {
        if (!cancelled) {
          setHighlighter(h);
        }
      })
      .catch((err: unknown) => {
        console.error("Error initializing Shiki:", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!highlighter) {
      return;
    }

    if (!value) {
      setHighlightedTokens([]);
      setIsLoading(false);
      return;
    }

    if (!detectedLanguage) {
      const plainTokens = convertPlainTextToTokens(value);
      setHighlightedTokens(plainTokens);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const highlightCode = async () => {
      try {
        const isDark = document.documentElement.classList.contains("dark");
        const theme = isDark ? "one-dark-pro" : "one-light";

        const result = await highlighter.codeToTokens(value, {
          lang: detectedLanguage,
          theme,
        });

        const tokens = "tokens" in result ? result.tokens : result;
        setHighlightedTokens(tokens);
        setIsLoading(false);
      } catch (err) {
        console.error("Error highlighting code:", err);
        const plainTokens = convertPlainTextToTokens(value);
        setHighlightedTokens(plainTokens);
        setIsLoading(false);
      }
    };

    highlightCode();
  }, [value, detectedLanguage, highlighter]);

  return { highlightedTokens, isLoading };
}
