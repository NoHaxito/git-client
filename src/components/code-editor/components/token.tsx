import type { ThemedToken } from "shiki";

type TokenProps = {
  token: ThemedToken;
  lineIndex: number;
  tokenIndex: number;
};

export function Token({ token, lineIndex, tokenIndex }: TokenProps) {
  return (
    <span
      className="py-1 leading-normal"
      data-line={lineIndex + 1}
      key={`line-${lineIndex}-token-${tokenIndex}-offset-${token.offset}`}
      style={{ color: token.color }}
    >
      {token.content}
    </span>
  );
}
