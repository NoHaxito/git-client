/** biome-ignore-all lint/a11y/noStaticElementInteractions: hover */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: hover */

import { useCallback, useMemo, useRef } from "react";
import { CodeLine } from "@/components/code-editor/components/code-line";
import { LineNumbers } from "@/components/code-editor/components/line-numbers";
import { Minimap } from "@/components/code-editor/components/minimap";
import { useGitBlame } from "@/components/code-editor/hooks/use-git-blame";
import { useSyntaxHighlighting } from "@/components/code-editor/hooks/use-syntax-highlighting";
import type { CodeEditorProps } from "@/components/code-editor/types";
import { VirtualCursorWrapper } from "@/components/virtual-cursor/virtual-cursor-wrapper";
import { useSettings } from "@/hooks/use-settings";

export function CodeEditor({ value, language, filePath }: CodeEditorProps) {
  const { settings } = useSettings();
  const isMinimapEnabled = settings.editor.minimap.show;
  const { highlightedTokens } = useSyntaxHighlighting(value, language);
  const blameData = useGitBlame(filePath);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const plainLines = useMemo(() => {
    if (!value) {
      return [];
    }
    return value.split("\n");
  }, [value]);

  const lineCount = plainLines.length;

  const getBlameData = useCallback(
    (lineIndex: number) =>
      blameData?.find((blame) => blame.line_number === lineIndex + 1),
    [blameData]
  );

  const hasBlameData = blameData && blameData.length > 0;

  return (
    <VirtualCursorWrapper
      charWidth={7.5}
      className="flex h-full w-full flex-1 overflow-y-scroll font-mono text-sm"
      content={value}
      cursorColor="#528bff"
      cursorOffsetLeft={56}
      cursorOffsetTop={4}
      editable={false}
      lineHeight={21}
      ref={scrollContainerRef}
      showPositionIndicator={true}
    >
      <LineNumbers lineCount={lineCount} />
      <div className="z-1 grid w-full min-w-0" data-slot="code-content">
        <pre className="grid w-full min-w-0">
          <code className="grid h-fit min-w-full whitespace-pre py-1 text-[#24292e] dark:text-[#d4d4d4]">
            {highlightedTokens.map((line, lineIndex) => (
              <div
                className="group/line flex-1 leading-normal hover:bg-accent/50"
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
      {isMinimapEnabled && (
        <Minimap
          code={value}
          highlightedTokens={highlightedTokens}
          lineHeight={21}
          scrollContainerRef={scrollContainerRef}
        />
      )}
    </VirtualCursorWrapper>
  );
}

export type { CodeEditorProps } from "./code-editor/types";
