import { Chore } from "@/types";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Props {
  chore: Chore;
  onComplete: () => void;
  onViewHistory: () => void;
  onEdit: () => void;
}

export function ChoreCard({ chore, onComplete, onViewHistory, onEdit }: Props) {
  const { icon, name, progressCount, totalCount, periodType, rewardAmount } = chore;
  const progress = totalCount > 0 ? (progressCount / totalCount) * 100 : 0;
  const isComplete = progressCount >= totalCount;

  return (
    <div
      className={`bg-card rounded-2xl p-4 shadow-[0_2px_12px_-4px_hsl(210_30%_80%/0.5)] border border-border animate-bounce-in flex flex-col items-center gap-2 transition-opacity min-h-0 ${isComplete ? "opacity-60" : ""}`}
    >
      <button onClick={onEdit} className="flex flex-col items-center gap-1 w-full btn-press">
        <span className="text-5xl leading-none">{icon}</span>
        <h3 className="font-bold text-foreground text-sm truncate max-w-full">{name}</h3>
        <p className="text-[11px] text-accent-foreground/70">+{rewardAmount} credit{rewardAmount > 1 ? "s" : ""}</p>
      </button>

      <button onClick={onViewHistory} className="text-[11px] text-muted-foreground underline">
        History
      </button>

      <div className="w-full space-y-1">
        <div className="flex justify-between text-xs">
          <span className="font-bold text-foreground">
            {progressCount} / {totalCount}
          </span>
          <span className="text-muted-foreground capitalize text-[10px]">
            {periodType === "weekly" ? "Mon reset" : "1st reset"}
          </span>
        </div>
        <Progress
          value={progress}
          className={`h-2 rounded-full bg-muted ${isComplete ? "[&>div]:bg-accent" : "[&>div]:bg-accent/60"} [&>div]:rounded-full`}
        />
      </div>

      {isComplete ? (
        <p className="text-[11px] text-accent font-semibold text-center leading-tight">
          ✅ Completed! Reward earned
        </p>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground font-medium">Keep going! 💪</p>
          <Button
            onClick={onComplete}
            className="w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/80 font-bold text-sm h-9 btn-press"
          >
            Complete ✓
          </Button>
        </>
      )}
    </div>
  );
}
