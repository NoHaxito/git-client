import type { ThemedToken } from "shiki";
import type { BlameLine } from "../types";
import { BlameInfo } from "./blame-info";
import { Token } from "./token";

type CodeLineProps = {
  line: ThemedToken[];
  lineIndex: number;
  blameLine?: BlameLine;
};

export function CodeLine({ line, lineIndex, blameLine }: CodeLineProps) {
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
    <div data-line={lineIndex + 1}>
      <span className="relative min-w-full">
        {hasTokens ? (
          <>
            {tokens}
            {<BlameInfo blameLine={blameLine} />}
          </>
        ) : (
          "\u00A0"
        )}
      </span>
    </div>
  );
}
