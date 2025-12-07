import type { ThemedToken } from "shiki";
import type { BlameLine } from "../types";
import { BlameInfo } from "./blame-info";
import { Token } from "./token";

type CodeLineProps = {
  line: ThemedToken[];
  lineIndex: number;
  blameLine?: BlameLine;
  isActive?: boolean;
};

export function CodeLine({
  line,
  lineIndex,
  blameLine,
  isActive,
}: CodeLineProps) {
  const tokens = line.map((token, tokenIndex) => (
    <Token
      key={`token-${lineIndex}-${tokenIndex}`}
      lineIndex={lineIndex}
      token={token}
      tokenIndex={tokenIndex}
    />
  ));

  const hasTokens = line.length > 0;

  return (
    <div className="relative" data-line={lineIndex + 1}>
      <span className="relative inline">
        {hasTokens ? (
          <>
            {tokens}
            {isActive && <BlameInfo blameLine={blameLine} />}
          </>
        ) : (
          "\u00A0"
        )}
      </span>
    </div>
  );
}
