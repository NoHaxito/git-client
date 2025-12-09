/** biome-ignore-all lint/a11y/noStaticElementInteractions: hover */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: hover */
import { useCallback, useMemo } from "react";
import { CodeLine } from "./code-editor/components/code-line";
import { LineNumbers } from "./code-editor/components/line-numbers";
import { useGitBlame } from "./code-editor/hooks/use-git-blame";
import { useSyntaxHighlighting } from "./code-editor/hooks/use-syntax-highlighting";
import type { CodeEditorProps } from "./code-editor/types";
import { VirtualCursorWrapper } from "./virtual-cursor/virtual-cursor-wrapper";

export function CodeEditor({ value, language, filePath }: CodeEditorProps) {
  const { highlightedTokens } = useSyntaxHighlighting(value, language);
  const blameData = useGitBlame(filePath);

  const plainLines = useMemo(() => {
    if (!value) {
      return [];
    }
    return value.split("\n");
  }, [value]);

  const lineCount = plainLines.length;

  const getBlameData = useCallback(
    (lineIndex: number) =>
      blameData.find((blame) => blame.line_number === lineIndex + 1),
    [blameData]
  );

  const hasBlameData = blameData.length > 0;

  return (
    <VirtualCursorWrapper
      charWidth={8.4}
      className="flex w-full flex-1 font-mono text-sm"
      content={value}
      cursorColor="#528bff"
      cursorOffsetLeft={56}
      cursorOffsetTop={4}
      editable={false}
      lineHeight={21}
      showPositionIndicator={true}
    >
      <LineNumbers lineCount={lineCount} />
      <div className="z-1 grid w-full min-w-0">
        <pre className="grid w-full min-w-0">
          <code className="block min-w-full whitespace-pre py-1 text-[#24292e] dark:text-[#d4d4d4]">
            {highlightedTokens.map((line, lineIndex) => (
              <div
                className="group/line leading-normal hover:bg-accent/50"
                key={`line-${lineIndex}`}
              >
                <CodeLine
                  blameLine={hasBlameData ? getBlameData(lineIndex) : undefined}
                  line={line}
                  lineIndex={lineIndex}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </VirtualCursorWrapper>
  );
}

export type { CodeEditorProps } from "./code-editor/types";
