type LineNumbersProps = {
  lineCount: number;
};

export function LineNumbers({ lineCount }: LineNumbersProps) {
  return (
    <div className="sticky left-0 z-10 min-h-fit min-w-14 max-w-fit flex-1 shrink-0 select-none bg-background px-4 py-1 text-right text-muted-foreground dark:bg-zinc-900">
      {Array.from({ length: lineCount }, (_, i) => (
        <div className="leading-normal" key={i + 1}>
          {i + 1}
        </div>
      ))}
    </div>
  );
}
