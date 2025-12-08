import { Separator } from "@/components/ui/separator";

export function DiffStats({
  additions,
  deletions,
}: {
  additions: number;
  deletions: number;
}) {
  const total = additions + deletions;
  const additionsPercentage = total > 0 ? additions / total : 0;

  const addedSquares = Math.round(additionsPercentage * 5);
  const deletedSquares = 5 - addedSquares;

  return (
    <div className="flex items-center gap-2 text-xs" id="diff-details">
      <span className="font-mono font-semibold text-blue-400 drop-shadow-[0_0_4px_rgba(96,165,250,0.6)]">
        +{additions}
      </span>
      <span className="font-mono font-semibold text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.6)]">
        -{deletions}
      </span>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: addedSquares }).map((_, i) => (
          <div className="size-2.5 rounded-xs bg-blue-500" key={`added-${i}`} />
        ))}
        {Array.from({ length: deletedSquares }).map((_, i) => (
          <div
            className="size-2.5 rounded-xs bg-red-500/80"
            key={`deleted-${i}`}
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)",
            }}
          />
        ))}
      </div>
      <Separator className="h-4" orientation="vertical" />
    </div>
  );
}
